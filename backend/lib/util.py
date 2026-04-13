import model
from model.user import User
from model.booking import Booking
def segregate_user(users ,booking):
    b = {
        'economy': [],
        'business': [],
        'first': []
    }
    u = {
        'economy': [],
        'business': [],
        'first': []
    }
    for book in booking:
        b[book.seat_class.value].append(book.user_email)
    for user in users:
        if user.email in b['economy']:
            u['economy'].append(user)
        elif user.email in b['business']:
            u['business'].append(user)
        elif user.email in b['first']:
            u['first'].append(user)
    return u

