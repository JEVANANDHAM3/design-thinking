"""
Payment Service — encapsulates all payment business logic.
• Order creation with idempotency
• Signature verification
• Payment window enforcement (5 minutes)
• Duplicate payment prevention
• Fare calculation with convenience fee + GST
"""

import os
import hmac
import hashlib
import datetime
from typing import Optional, Tuple

import razorpay
from sqlmodel import Session, select

import model
from model.booking import Status
from model.payment import Payment, PaymentStatus
from model.journey import Journey


# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────
PAYMENT_WINDOW_MINUTES = 5
CONVENIENCE_FEE_PERCENT = 5       # 5% convenience fee
GST_PERCENT = 18                  # 18% GST on convenience fee

SEAT_INDEX_MAP = {
    'economy': 0,
    'business': 1,
    'first': 2,
}


# ──────────────────────────────────────────────
# Price Calculation
# ──────────────────────────────────────────────
def calculate_total_fare(base_fare: int) -> dict:
    """
    Calculate total fare with breakdown.
    base_fare is in rupees (INR), returns amounts in paise for Razorpay.
    """
    convenience_fee = round(base_fare * CONVENIENCE_FEE_PERCENT / 100)
    gst = round(convenience_fee * GST_PERCENT / 100)
    total = base_fare + convenience_fee + gst

    return {
        'base_fare': base_fare,
        'convenience_fee': convenience_fee,
        'gst': gst,
        'total': total,
        'total_paise': total * 100,
    }


# ──────────────────────────────────────────────
# Payment Window Check
# ──────────────────────────────────────────────
def is_payment_window_active(booking: model.Booking) -> bool:
    """Return True if <5 mins since the booking was marked selected."""
    if not booking.selected_at:
        return True  # no timestamp recorded yet — allow
    now = datetime.datetime.now()
    elapsed = (now - booking.selected_at).total_seconds()
    return elapsed < PAYMENT_WINDOW_MINUTES * 60


def seconds_remaining(booking: model.Booking) -> int:
    """Returns seconds left in payment window, or 0 if expired."""
    if not booking.selected_at:
        return PAYMENT_WINDOW_MINUTES * 60
    now = datetime.datetime.now()
    elapsed = (now - booking.selected_at).total_seconds()
    remaining = PAYMENT_WINDOW_MINUTES * 60 - elapsed
    return max(0, int(remaining))


# ──────────────────────────────────────────────
# Create Razorpay Order
# ──────────────────────────────────────────────
def create_razorpay_order(
    razorpay_client: razorpay.Client,
    booking: model.Booking,
    train: Journey,
    user_email: str,
    session: Session,
) -> Tuple[bool, dict]:
    """
    Creates a Razorpay order after all validation checks.
    Returns (success, data_dict).
    """
    # 1. Booking ownership check
    if booking.user_email != user_email:
        return False, {'message': 'Booking does not belong to this user'}

    # 2. Cannot pay for non-selected bookings
    if booking.status not in (Status.SELECTED.value, Status.PAYMENT_PENDING.value, Status.PAYMENT_FAILED.value):
        return False, {'message': f'Booking is not eligible for payment (status: {booking.status})'}

    # 3. Already paid
    if booking.paid:
        return False, {'message': 'Booking is already paid'}

    # 4. Payment window check
    if not is_payment_window_active(booking):
        booking.status = Status.EXPIRED.value
        session.add(booking)
        session.commit()
        return False, {'message': 'Payment window has expired'}

    # 5. Idempotency — reuse existing INITIATED order if one exists
    existing = session.exec(
        select(Payment).where(
            Payment.booking_id == booking.id,
            Payment.status == PaymentStatus.INITIATED.value,
        )
    ).first()

    if existing and is_payment_window_active(booking):
        return True, {
            'order_id': existing.razorpay_order_id,
            'amount': existing.amount,
            'currency': existing.currency,
            'key_id': os.getenv('RAZORPAY_KEY_ID'),
            'fare_breakdown': calculate_total_fare(train.fare[SEAT_INDEX_MAP[booking.seat_class.value]]),
            'seconds_remaining': seconds_remaining(booking),
        }

    # 6. Calculate fare
    index = SEAT_INDEX_MAP.get(booking.seat_class.value if hasattr(booking.seat_class, 'value') else booking.seat_class, 0)
    fare = calculate_total_fare(train.fare[index])

    # 7. Create Razorpay order
    order_params = {
        'amount': fare['total_paise'],
        'currency': 'INR',
        'receipt': f'booking_{booking.id}',
        'notes': {
            'booking_id': str(booking.id),
            'user_email': user_email,
        },
    }
    order = razorpay_client.order.create(data=order_params)

    # 8. Persist payment record
    payment = Payment(
        booking_id=booking.id,  # type: ignore
        user_email=user_email,
        amount=fare['total_paise'],
        currency='INR',
        razorpay_order_id=order['id'],
        status=PaymentStatus.INITIATED.value,
    )
    session.add(payment)

    # 9. Update booking status
    booking.status = Status.PAYMENT_PENDING.value
    if not booking.selected_at:
        booking.selected_at = datetime.datetime.now()
    session.add(booking)
    session.commit()

    return True, {
        'order_id': order['id'],
        'amount': fare['total_paise'],
        'currency': 'INR',
        'key_id': os.getenv('RAZORPAY_KEY_ID'),
        'fare_breakdown': fare,
        'seconds_remaining': seconds_remaining(booking),
    }


# ──────────────────────────────────────────────
# Verify Payment Signature
# ──────────────────────────────────────────────
def verify_and_confirm_payment(
    razorpay_client: razorpay.Client,
    booking_id: int,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    user_email: str,
    session: Session,
) -> Tuple[bool, dict]:
    """Verify Razorpay signature, mark booking CONFIRMED, persist payment."""

    # 1. Verify signature
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        return False, {'message': 'Payment signature verification failed'}

    # 2. Fetch payment record
    payment = session.exec(
        select(Payment).where(Payment.razorpay_order_id == razorpay_order_id)
    ).first()

    if not payment:
        return False, {'message': 'Payment record not found'}

    # 3. Duplicate check
    if payment.status == PaymentStatus.SUCCESS.value:
        return True, {'message': 'Payment already confirmed'}

    # 4. Ownership check
    booking = session.exec(
        select(model.Booking).where(model.Booking.id == booking_id)
    ).first()
    if not booking or booking.user_email != user_email:
        return False, {'message': 'Booking not found or ownership mismatch'}

    # 5. Update payment
    payment.razorpay_payment_id = razorpay_payment_id
    payment.status = PaymentStatus.SUCCESS.value
    payment.updated_at = datetime.datetime.now()
    session.add(payment)

    # 6. Update booking
    booking.paid = True
    booking.status = Status.CONFIRMED.value
    session.add(booking)

    session.commit()
    return True, {'message': 'Payment verified and booking confirmed'}


# ──────────────────────────────────────────────
# Handle Payment Failure
# ──────────────────────────────────────────────
def mark_payment_failed(
    razorpay_order_id: str,
    session: Session,
) -> Tuple[bool, dict]:
    """Mark payment as failed; allow retry."""
    payment = session.exec(
        select(Payment).where(Payment.razorpay_order_id == razorpay_order_id)
    ).first()

    if not payment:
        return False, {'message': 'Payment record not found'}

    payment.status = PaymentStatus.FAILED.value
    payment.updated_at = datetime.datetime.now()
    session.add(payment)

    booking = session.exec(
        select(model.Booking).where(model.Booking.id == payment.booking_id)
    ).first()
    if booking:
        booking.status = Status.PAYMENT_FAILED.value
        session.add(booking)

    session.commit()
    return True, {'message': 'Payment marked as failed'}


# ──────────────────────────────────────────────
# Expire Unpaid Winners & Promote Waitlist
# ──────────────────────────────────────────────
def expire_unpaid_winners(session: Session):
    """
    Background task: find all selected/payment_pending bookings
    where the payment window has lapsed, mark them expired,
    and promote the next waitlisted user.
    """
    now = datetime.datetime.now()
    cutoff = now - datetime.timedelta(minutes=PAYMENT_WINDOW_MINUTES)

    # Find all bookings that have been selected but not paid within the window
    eligible_statuses = [
        Status.SELECTED.value,
        Status.PAYMENT_PENDING.value,
        Status.PAYMENT_FAILED.value,
    ]

    unpaid = session.exec(
        select(model.Booking).where(
            model.Booking.status.in_(eligible_statuses),  # type: ignore
            model.Booking.paid == False,
            model.Booking.selected_at != None,
            model.Booking.selected_at < cutoff,  # type: ignore
        )
    ).all()

    expired_count = 0
    promoted_count = 0

    for booking in unpaid:
        # Mark expired
        booking.status = Status.EXPIRED.value
        session.add(booking)
        expired_count += 1

        # Cancel any INITIATED payments
        payments = session.exec(
            select(Payment).where(
                Payment.booking_id == booking.id,
                Payment.status == PaymentStatus.INITIATED.value,
            )
        ).all()
        for p in payments:
            p.status = PaymentStatus.FAILED.value
            p.updated_at = now
            session.add(p)

        # Promote next waitlist user for the same journey + seat class
        waitlisted = session.exec(
            select(model.Booking).where(
                model.Booking.journey_id == booking.journey_id,
                model.Booking.seat_class == booking.seat_class,
                model.Booking.status == Status.NOTSELECTED.value,
            )
        ).first()

        if waitlisted:
            waitlisted.status = Status.SELECTED.value
            waitlisted.selected_at = now
            session.add(waitlisted)
            promoted_count += 1

    if expired_count > 0:
        session.commit()

    return {'expired': expired_count, 'promoted': promoted_count}
