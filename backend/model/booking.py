
from enum import Enum
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

class SeatClass(str,Enum):
    ECONOMY = "economy"
    BUSINESS = "business"
    FIRST = "first"

class Status(str,Enum):
    PENDING =  'pending'
    SELECTED = 'selected'
    NOTSELECTED = 'notselected'
    PAYMENT_PENDING = 'payment_pending'   # winner – awaiting payment
    CONFIRMED = 'confirmed'               # payment successful
    PAYMENT_FAILED = 'payment_failed'     # payment attempt failed
    EXPIRED = 'expired'                   # payment window lapsed

class Booking(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_email: str
    journey_id: int
    seat_class: SeatClass
    paid: bool = Field(default=False)
    status: str
    # Timestamp when user was selected as winner (for 5-min payment window)
    selected_at: Optional[datetime] = Field(default=None)
