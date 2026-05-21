# wholesale/utils.py
from .models import WholesaleNotification, WholesaleUser


def notify_wholesale_user(user, notif_type, title, message):
    if not isinstance(user, WholesaleUser):
        return
    WholesaleNotification.objects.create(
        user=user,
        type=notif_type,
        title=title,
        message=message,
    )


def notify_order_placed(user, order_number, total):
    notify_wholesale_user(
        user,
        WholesaleNotification.Type.ORDER,
        f'Order #{order_number} Placed ',
        f'Your order of €{float(total):.2f} has been received and is being processed.',
    )


def notify_order_status_changed(user, order_number, new_status):
    labels = {
        'confirmed':        ('Order Confirmed ',         f'Your order #{order_number} has been confirmed.'),
        'preparing':        ('Order Being Prepared ',   f'Order #{order_number} is now being prepared.'),
        'out_for_delivery': ('Out for Delivery ',        f'Order #{order_number} is on its way to you!'),
        'delivered':        ('Order Delivered ',          f'Order #{order_number} has been delivered. Enjoy!'),
        'cancelled':        ('Order Cancelled ',          f'Order #{order_number} has been cancelled.'),
    }
    title, message = labels.get(
        new_status,
        ('Order Updated', f'Order #{order_number} status changed to {new_status}.')
    )
    notify_wholesale_user(user, WholesaleNotification.Type.ORDER, title, message)