import django
import os
import sys
import datetime
from django.utils import timezone
import random

sys.path.append(r'd:\Final\Frutos-Django-Next\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from wholesale.models import WholesaleUser, WholesaleDailyReport

user = WholesaleUser.objects.filter(email='remedyshop@gmail.com').first()

if not user:
    print("User remedyshop@gmail.com not found!")
    sys.exit()

print(f"Found user: {user.business_name} ({user.email})")

WholesaleDailyReport.objects.filter(user=user).delete()

for i in range(5):
    report_date = timezone.now().date() - datetime.timedelta(days=i)
    report = WholesaleDailyReport.objects.create(
        user=user,
        cash=random.randint(50, 500),
        bank=random.randint(100, 1000),
        expenses=random.randint(10, 100),
        store=random.randint(200, 800),
        purchase=random.randint(50, 300),
        purchase_note=f"Dummy purchase note for {report_date}",
        date=report_date
    )
    print(f"Created report for {report_date}")
