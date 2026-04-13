from sqlmodel import Field, SQLModel
from datetime import datetime

class Publish(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    journey_id: int
    published: bool = Field(default=False)
    published_at: datetime = Field(default=datetime.now())