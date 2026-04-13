
from datetime import date, time

from sqlmodel import ARRAY, Column, Field, Integer, SQLModel


class Journey(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    train_number: int 
    train_name: str
    from_station: str
    to_station: str
    departure_time: str
    departure_date: date
    arrival_time: str
    arrival_date: date
    seats: list[int] = Field(
        default_factory= lambda : [0,0,0],
        sa_column=Column(ARRAY(Integer))
    )
    fare: list[int] = Field(
        default_factory= lambda : [0,0,0],
        sa_column=Column(ARRAY(Integer))
    )
    takkal: bool
    closing_time: time
    opening_date: date
    opening_time: time
    duration: int
    closing_date: date