
from enum import Enum

from sqlmodel import Field, SQLModel

class SeatClass(str,Enum):
    ECONOMY = "economy"
    BUSINESS = "business"
    FIRST = "first"

class Status(str,Enum):
    PENDING =  'pending'
    SELECTED = 'selected'
    NOTSELECTED = 'notselected'    

class Booking(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_email: str
    journey_id: int
    seat_class: SeatClass
    paid: bool = Field(default=False)
    status: str
