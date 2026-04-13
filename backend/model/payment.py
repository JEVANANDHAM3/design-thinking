"""
Payment Model — stores all Razorpay transaction records.
Statuses: INITIATED → SUCCESS | FAILED | REFUNDED
"""

from enum import Enum
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PaymentStatus(str, Enum):
    INITIATED = "initiated"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    booking_id: int = Field(index=True)
    user_email: str = Field(index=True)
    amount: int  # amount in paise (e.g. 50000 = ₹500)
    currency: str = Field(default="INR")
    provider: str = Field(default="razorpay")
    razorpay_order_id: str = Field(unique=True, index=True)
    razorpay_payment_id: Optional[str] = Field(default=None, index=True)
    status: str = Field(default=PaymentStatus.INITIATED.value)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
