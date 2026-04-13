from fastapi import Depends, FastAPI, HTTPException, Request
from sqlmodel import SQLModel, Session, create_engine, select
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager
from datetime import date
from . import model
from .model.booking import Status
from .model.journey import Journey
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .lib.sampling import sample_objects
from .lib.util import segregate_user
import traceback
import datetime

load_dotenv()

SECRET_KEY = str(os.getenv('SECRET_KEY'))
ALGORITHM = str(os.getenv('ALGORITHM'))

dataBase_url = os.getenv("DATABASE_URL")

engine = create_engine(url=str(dataBase_url),echo=True)

def connect_create_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


@asynccontextmanager
async def lifespan(app:FastAPI):
    connect_create_db()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    str(os.getenv('FRONTEND_URL')),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  
    allow_headers=["*"],   
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # 🔥 payload = what you stored in jwt()
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
@app.post('/add_user')
async def addUser(user: model.User, session: Session = Depends(get_session)):
    try:
        existing_user = session.exec(
            select(model.User).where(model.User.email == user.email)
        ).first()
        if existing_user:
            return {
                'ok': True,
                'user_id': existing_user.id,
                'points': existing_user.points
            }   
        session.add(user)
        session.commit()
        session.refresh(user)
        return{
            'ok': True,
            'user_id': user.id,
            'user_points': user.points
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }
@app.post('/add_train')
async def addTrain(train: Journey, session: Session = Depends(get_session)):
    session.add(train)
    session.commit()
    session.refresh(train)
    publish = model.Publish(
        journey_id=train.id, # type: ignore
    )
    session.add(publish)
    session.commit()
    session.refresh(publish)
    return{
        'ok': True,
        'journey_id': train.id 
    }

@app.get('/get_trains')
async def getTrains(from_station: str, to_station: str,date: date, session: Session = Depends(get_session)):
    try: 
        un_published_trains = session.exec(
            select(model.Publish).where(model.Publish.published == False)
        ).all()
        journeys = []
        print(un_published_trains)
        for journey in un_published_trains:
            itrian = session.exec(
                select(Journey).where(Journey.id == journey.journey_id, Journey.departure_date == date,Journey.from_station == from_station, Journey.to_station == to_station)
            ).first()
            if itrian:
                journeys.append(itrian)
        print(journeys)
        if len(journeys) == 0:
            return {
            'ok': True,
            'journeys': []
            }
        return {
            'ok': True,  
            'journeys': journeys
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/one_train')
async def getOneTrain(journey_id: int, session: Session = Depends(get_session)):
    try:
        train = session.exec(
            select(Journey).where(Journey.id == journey_id)
        ).one()
        print(train)
        return {
            'ok': True,
            'train': train
        }
    except Exception as e:
        return {
            'ok': False,
            'message': 'Train not found'
        }

@app.get('/check_lottery')
async def checkLottery(email: str, journey_id: int, session: Session = Depends(get_session)):
    try:
        booking = session.exec(
            select(model.Booking).where(model.Booking.user_email == email, model.Booking.journey_id == journey_id)
        ).first()
        if booking:
            return {
                'ok': True,
                'booking_id': booking.id
            }
        return {
            'ok': False,
            'message': 'Booking not found'
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.post('/lottery')
async def lottery(booking: model.Booking,session: Session = Depends(get_session)):
    try:
        session.add(booking)
        session.commit()
        session.refresh(booking)
        print(booking)        
        return {
            'ok': True,
            'booking_id': booking.id
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'ok': False,
            'message': str(e)
        }



@app.post('/publish_lottery')
async def publishLottery(journey_id: int, session: Session = Depends(get_session)):
    try:
        publish = session.exec(
            select(model.Publish).where(model.Publish.journey_id == journey_id)
        ).one()

        if publish:
            #get all the user from the booking table
            train: Journey = session.exec(
                select(Journey).where(Journey.id == journey_id)
            ).one()
            booking = session.exec(
                select(model.Booking).where(model.Booking.journey_id == journey_id)
            ).all()

            users = []
            for b in booking:
                user = session.exec(
                    select(model.User).where(model.User.email == b.user_email)
                ).one()
                users.append(user)
            
            seg_user = segregate_user(users,booking)

            for i,seat_class in enumerate(['economy','business','first']):
                if len(seg_user[seat_class]) != 0:
                    selected_users = sample_objects(seg_user[seat_class], train.seats[i], lambda u: u.points, replace=False)
                    print(f'{selected_users=}')
                    for user in selected_users:
                        user.points -= 20
                        #send the email
                        for b in booking:
                            if b.user_email == user.email:
                                b.status = Status.SELECTED.value
                                session.add(b)
                        session.add(user)
                    not_selected = [u for u in seg_user[seat_class] if u not in selected_users]
                    for user in not_selected:
                        user.points += 50
                        #send the email
                        for b in booking:
                            if b.user_email == user.email:
                                b.status = Status.NOTSELECTED.value
                                session.add(b)
                        session.add(user) 

            publish.published = True
            session.add(publish)
            session.commit()
            session.refresh(publish)
            return {
                'ok': True,
                'publish_id': publish.id
            }
        return {
            'ok': False,
            'message': 'Publish not found'
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/un_published_trains')
async def unPublishedTrains(session: Session = Depends(get_session)):
    try:
        publish = session.exec(
            select(model.Publish).where(model.Publish.published == False)
        ).all()
        trains = []
        if len(publish) == 0:
            return {
                'ok': True,
                'trains': []
            }
        for p in publish:
            train = session.exec(
                select(Journey).where(Journey.id == p.journey_id)
            ).one() 
            if train:
                trains.append(train)
        return {
            'ok': True,
            'trains': trains
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }
@app.get('/my_ticket')
async def myTicket(email:str, session: Session = Depends(get_session)):

    try:
        print(email)
        booking = session.exec(
            select(model.Booking).where(model.Booking.user_email == email)
        ).all()
        trains = []
        print(booking)
        if booking:
            for b in booking:
                train = session.exec(
                    select(Journey).where(Journey.id == b.journey_id)
                ).one() 
                if train:
                    trains.append(train)
            print(
                {
                    'ok': True,
                    'booking': booking,
                    'trains': trains
                }
            )
            return {
                'ok': True,
                'booking': booking,
                'trains': trains
            }
        return {
            'ok': False,
            'message': 'Booking not found'
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/booking')
async def booking(bookingId: int, session: Session = Depends(get_session)):
    try:
        booking = session.exec(
            select(model.Booking).where(model.Booking.id == bookingId)
        ).one()
        jorney_id = booking.journey_id
        seat_class = booking.seat_class
        train = session.exec(
            select(Journey).where(Journey.id == jorney_id)
        ).one()
        index = -1
        if seat_class == 'economy':
            index = 0
        elif seat_class == 'business':
            index = 1
        elif seat_class == 'first':
            index = 2
        if train:
            return {
                'ok': True,
                # 'amount': train.fare[index],
                'paid': booking.paid,
                'status': booking.status
            }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.post('/pay')
async def pay(request: Request, session: Session = Depends(get_session)):
    data = await request.json()
    bookingId = data.get('bookingId')
    try:
        booking = session.exec(
            select(model.Booking).where(model.Booking.id == bookingId)
        ).one()
        booking.paid = True
        session.add(booking)
        session.commit()
        session.refresh(booking)
        return {
            'ok': True,
            'message': 'Payment successful'
        }
    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }

@app.get('/get_time')
async def getTime(journey_id: int, session: Session = Depends(get_session)):
    try:
        train = session.exec(
            select(Journey).where(Journey.id == journey_id)
        ).one()

        now = datetime.datetime.now()

        # Combine date + time properly
        opening_dt = datetime.datetime.combine(train.opening_date, train.opening_time)
        closing_dt = datetime.datetime.combine(train.closing_date, train.closing_time)

        # Before opening
        if now < opening_dt:
            diff = (opening_dt - now)
            print(diff)
            return {
                'ok': True,
                'seconds': diff.total_seconds()+2,
                'status': 'opening',
            }

        # After closing
        if now > closing_dt:
            return {
                'ok': True,
                'status': 'closed',
            }

        # Currently open
        diff = (closing_dt - now)

        return {
            'ok': True,
            'seconds': diff.total_seconds()+2,
            'status': 'open',
        }

    except Exception as e:
        return {
            'ok': False,
            'message': str(e)
        }