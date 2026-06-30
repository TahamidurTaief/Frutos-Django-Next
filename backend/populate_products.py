import os
import django
import random
from decimal import Decimal

def populate():
    from products.models import Product, Category, SubCategory, Brand
    from shops.models import Shop
    from django.contrib.auth import get_user_model

    User = get_user_model()

    # Delete existing
    print("Deleting existing products, subcategories, categories...")
    Product.objects.all().delete()
    SubCategory.objects.all().delete()
    Category.objects.all().delete()
    
    # Need a shop
    shop = Shop.objects.first()
    if not shop:
        owner = User.objects.filter(is_superuser=True).first()
        if not owner:
            owner = User.objects.first()
        if not owner:
            print("No user found. Please create a user first.")
            return
        shop = Shop.objects.create(name="Frutos Shop", owner=owner, is_active=True, is_verified=True)
        print(f"Created shop {shop.name}")
    else:
        print(f"Using shop {shop.name}")

    categories_data = {
        "FRUITS AND VEGETABLES": {
            "Apples & Pears": ["Fuji Apples", "Gala Apples", "Granny Smith Apples", "Honeycrisp Apples", "Red Delicious Apples"],
            "Leafy Greens": ["Spinach", "Kale", "Romaine Lettuce"],
            "Root Vegetables": ["Russet Potatoes", "Sweet Potatoes", "Carrots"],
            "Tomatoes & Peppers": ["Cherry Tomatoes", "Roma Tomatoes", "Red Bell Peppers", "Green Bell Peppers"]
        },
        "Grocery": {
            "Rice, Grains & Beans": ["Basmati Rice", "Brown Rice", "Lentils"],
            "Cooking Oil & Ghee": ["Olive Oil", "Sunflower Oil"],
            "Spices & Seasonings": ["Himalayan Pink Salt", "Black Pepper"],
            "Baking & Flours": ["All-Purpose Flour", "Whole Wheat Flour", "Sugar"]
        }
    }

    units = ["TRAY", "BOX", "LARGE", "KG", "BUNCH", "HALF", "PALLET", "SMALL", "PIECE"]

    for cat_name, subcats in categories_data.items():
        print(f"Creating Category: {cat_name}")
        cat = Category.objects.create(name=cat_name)
        
        for subcat_name, products in subcats.items():
            print(f"  Creating SubCategory: {subcat_name}")
            subcat = SubCategory.objects.create(name=subcat_name, category=cat)
            
            for prod_name in products:
                # Let's create 2 variants of each product (e.g., Class A and Class B)
                for variant in ["Class A", "Class B"]:
                    unit = random.choice(units)
                    wholesale_unit = random.choice(["BOX", "PALLET", "HALF"])
                    price = round(random.uniform(5.0, 50.0), 2)
                    wholesale_price = round(price * 0.8, 2)
                    
                    full_name = f"{prod_name} - {variant}"
                    
                    Product.objects.create(
                        shop=shop,
                        name=full_name,
                        category=cat,
                        sub_category=subcat,
                        price=price,
                        wholesale_price=wholesale_price,
                        minimum_purchase=random.randint(5, 20),
                        stock=random.randint(50, 500),
                        unit=unit,
                        wholesale_unit=wholesale_unit,
                        variant=variant,
                        description=f"<p>High quality {full_name}. Sold per {unit}.</p>",
                        is_active=True
                    )
    
    print("Database populated successfully!")

if __name__ == "__main__":
    populate()
