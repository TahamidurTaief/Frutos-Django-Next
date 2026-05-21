"""
stores/management/commands/seed_stores.py

Run once to import the old static stores.js data into the database:
    python manage.py seed_stores

Safe to re-run — uses update_or_create so it won't duplicate.
"""
from django.core.management.base import BaseCommand
from stores.models import Store, StoreFeature, StoreAvailability, LeftoverPack

STORES = [
    {
        'slug': 'mostoles-centro',
        'name': 'El Árbol — Móstoles Centro',
        'short_name': 'Móstoles Centro',
        'address': 'Calle del Pintor Velázquez, 12',
        'city': '28933 Móstoles, Madrid',
        'full_address': 'Calle del Pintor Velázquez, 12, 28933 Móstoles, Madrid',
        'phone': '+34 912 345 678',
        'open_time': '08:00', 'close_time': '21:00', 'hours': '08:30 — 21:00',
        'map_link': 'https://www.google.com/maps/@40.3217,-3.8654,15z',
        'provenance': 'from Almería',
        'image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
        'order': 1,
        'features': ['leftoverPack', 'clickCollect'],
        'availability': ['Fruits', 'Veg', 'Bread', 'Cheese'],
        'leftover_packs': [
            {'name': 'Organic Harvest Box',   'description': 'Mixed seasonal produce', 'price': '5.50', 'image': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=320&q=80', 'order': 1},
            {'name': 'Daily Bakery Surprise', 'description': 'Fresh bread & pastries', 'price': '3.90', 'image': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&q=80', 'order': 2},
            {'name': 'The Cheesemonger Pack', 'description': 'Cuts from the deli counter', 'price': '8.00', 'image': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=320&q=80', 'order': 3},
        ],
    },
    {
        'slug': 'chamberi',
        'name': 'El Árbol — Chamberí',
        'short_name': 'Chamberí',
        'address': 'Calle de Fuencarral, 122',
        'city': '28010 Madrid',
        'full_address': 'Calle de Fuencarral, 122, 28010 Madrid',
        'phone': '+34 912 456 789',
        'open_time': '09:00', 'close_time': '21:00', 'hours': '09:00 — 21:00',
        'map_link': 'https://www.google.com/maps/@40.4322,-3.7015,15z',
        'provenance': 'from Valencia',
        'image': 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=900&q=80',
        'order': 2,
        'features': ['leftoverPack'],
        'availability': ['Fruits', 'Veg', 'Dairy'],
        'leftover_packs': [
            {'name': 'Garden Medley Box', 'description': 'Seasonal greens & roots', 'price': '4.50', 'image': 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=320&q=80', 'order': 1},
        ],
    },
    {
        'slug': 'salamanca-district',
        'name': 'El Árbol — Salamanca District',
        'short_name': 'Salamanca',
        'address': 'Calle de Serrano, 52',
        'city': '28001 Madrid',
        'full_address': 'Calle de Serrano, 52, 28001 Madrid',
        'phone': '+34 913 567 890',
        'open_time': '08:00', 'close_time': '22:00', 'hours': '08:00 — 22:00',
        'map_link': 'https://www.google.com/maps/place/Calle+de+Serrano,+52/@40.4267,-3.6875,17z',
        'provenance': 'from Murcia',
        'image': 'https://images.unsplash.com/photo-1543168256-418811576931?w=900&q=80',
        'order': 3,
        'features': ['clickCollect'],
        'availability': ['Fruits', 'Veg', 'Cheese', 'Wine'],
        'leftover_packs': [],
    },
    {
        'slug': 'alcorcon-norte',
        'name': 'El Árbol — Alcorcón Norte',
        'short_name': 'Alcorcón Norte',
        'address': 'Av. de Leganés, 34',
        'city': '28921 Alcorcón, Madrid',
        'full_address': 'Av. de Leganés, 34, 28921 Alcorcón, Madrid',
        'phone': '+34 914 678 901',
        'open_time': '08:30', 'close_time': '20:30', 'hours': '08:30 — 20:30',
        'map_link': 'https://www.google.com/maps/@40.3489,-3.8245,15z',
        'provenance': 'from Andalucía',
        'image': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=80',
        'order': 4,
        'features': ['leftoverPack'],
        'availability': ['Fruits', 'Bread'],
        'leftover_packs': [
            {'name': 'Morning Harvest Pack', 'description': 'Seasonal fruits & fresh veg', 'price': '6.00', 'image': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=320&q=80', 'order': 1},
        ],
    },
    {
        'slug': 'leganes-market',
        'name': 'El Árbol — Leganés Market',
        'short_name': 'Leganés Market',
        'address': 'Calle Mayor, 78',
        'city': '28914 Leganés, Madrid',
        'full_address': 'Calle Mayor, 78, 28914 Leganés, Madrid',
        'phone': '+34 914 789 012',
        'open_time': '08:00', 'close_time': '21:00', 'hours': '08:00 — 21:00',
        'map_link': 'https://www.google.com/maps/@40.3281,-3.7642,15z',
        'provenance': 'from Castilla',
        'image': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=900&q=80',
        'order': 5,
        'features': ['leftoverPack', 'clickCollect'],
        'availability': ['Fruits', 'Veg', 'Bread', 'Dairy'],
        'leftover_packs': [
            {'name': 'Evening Veg Bundle', 'description': 'Mixed end-of-day vegetables', 'price': '3.50', 'image': 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=320&q=80', 'order': 1},
        ],
    },
    {
        'slug': 'dhaka-panthopath',
        'name': 'El Árbol — Dhaka Panthopath',
        'short_name': 'Dhaka',
        'address': 'Panthopath, Green Road',
        'city': 'Dhaka 1205',
        'full_address': 'Panthopath, Green Road, Dhaka 1205, Bangladesh',
        'phone': '+8801700895489',
        'open_time': '08:00', 'close_time': '22:00', 'hours': '08:00 — 22:00',
        'map_link': 'https://www.google.com/maps/place/Panthapath/@23.7518,90.3860,16z',
        'provenance': 'from Rajshahi',
        'image': 'https://images.unsplash.com/photo-1543168256-418811576931?w=900&q=80',
        'order': 6,
        'features': ['clickCollect'],
        'availability': ['Fruits', 'Veg', 'Cheese', 'Wine'],
        'leftover_packs': [],
    },
]


class Command(BaseCommand):
    help = 'Seed the stores database from the legacy static data'

    def handle(self, *args, **options):
        for data in STORES:
            features     = data.pop('features', [])
            availability = data.pop('availability', [])
            packs        = data.pop('leftover_packs', [])

            store, created = Store.objects.update_or_create(
                slug=data['slug'],
                defaults=data,
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action}: {store.name}')

            # Features
            StoreFeature.objects.filter(store=store).delete()
            for f in features:
                StoreFeature.objects.create(store=store, feature=f)

            # Availability
            StoreAvailability.objects.filter(store=store).delete()
            for i, cat in enumerate(availability):
                StoreAvailability.objects.create(store=store, category=cat, order=i)

            # Leftover packs
            LeftoverPack.objects.filter(store=store).delete()
            for pack in packs:
                LeftoverPack.objects.create(store=store, **pack)

        self.stdout.write(self.style.SUCCESS(f'\n  {len(STORES)} stores seeded successfully.'))