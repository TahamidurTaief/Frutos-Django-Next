import os
import django
import urllib.request
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product

def update_images():
    products = Product.objects.all()
    count = 0
    for product in products:
        if '_real.jpg' not in product.thumbnail.name:
            try:
                print(f"Updating missing real image for {product.name}...")
                
                # Pick a generic food keyword based on product name
                kw = "grocery"
                if "apple" in product.name.lower(): kw = "apple,fruit"
                elif "sugar" in product.name.lower(): kw = "sugar"
                elif "salt" in product.name.lower(): kw = "salt"
                elif "potato" in product.name.lower(): kw = "potato"
                elif "pepper" in product.name.lower(): kw = "pepper,vegetable"
                
                url = f"https://loremflickr.com/400/400/{kw}"
                
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                response = urllib.request.urlopen(req)
                if response.status == 200:
                    image_content = response.read()
                    filename = f"{product.slug}_real.jpg"
                    product.thumbnail.save(filename, ContentFile(image_content), save=False)
                    product.save()
                    count += 1
                    print(f"Successfully updated real image for {product.name}")
                else:
                    print(f"Failed to fetch image for {product.name} from {url}")
            except Exception as e:
                print(f"Error for {product.name}: {e}")
    print(f"Updated {count} products with real images.")

if __name__ == "__main__":
    update_images()
