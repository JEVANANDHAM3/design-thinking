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
        seat_key = book.seat_class.value if hasattr(book.seat_class, 'value') else book.seat_class
        b[seat_key].append(book.user_email)
    for user in users:
        if user.email in b['economy']:
            u['economy'].append(user)
        elif user.email in b['business']:
            u['business'].append(user)
        elif user.email in b['first']:
            u['first'].append(user)
    return u

