import os
import django
import urllib.request
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product

image_map = {
    'sugar': 'https://images.unsplash.com/photo-1581428982868-e410dd127a90?w=400&h=400&fit=crop',
    'wheat flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    'purpose flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    'black pepper': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop',
    'pink salt': 'https://images.unsplash.com/photo-1615486511484-91420cb05c84?w=400&h=400&fit=crop',
    'sunflower oil': 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400&h=400&fit=crop',
    'olive oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    'lentils': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&h=400&fit=crop',
    'brown rice': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop',
    'basmati rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    'green bell': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400&h=400&fit=crop',
    'red bell': 'https://images.unsplash.com/photo-1506802913710-11125d8d3b4f?w=400&h=400&fit=crop',
    'roma tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
    'cherry tomato': 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400&h=400&fit=crop',
    'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
    'sweet potato': 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400&h=400&fit=crop',
    'russet potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop',
    'lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop',
    'kale': 'https://images.unsplash.com/photo-1528795259021-d8c86e14354c?w=400&h=400&fit=crop',
    'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
    'granny smith': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
    'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=400&h=400&fit=crop',
}

default_image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop' # generic grocery

def get_image_url(product_name):
    name_lower = product_name.lower()
    for key, url in image_map.items():
        if key in name_lower:
            return url
    return default_image

def update_images():
    products = Product.objects.all()
    count = 0
    
    # Simple cache to avoid re-downloading the same URL multiple times
    downloaded_cache = {}

    for product in products:
        try:
            print(f"Updating real image for {product.name}...")
            url = get_image_url(product.name)
            
            if url not in downloaded_cache:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                response = urllib.request.urlopen(req)
                if response.status == 200:
                    downloaded_cache[url] = response.read()
                else:
                    print(f"Failed to fetch image for {product.name} from {url}")
                    continue

            image_content = downloaded_cache[url]
            filename = f"{product.slug}_real.jpg"
            product.thumbnail.save(filename, ContentFile(image_content), save=False)
            product.save()
            count += 1
            print(f"Successfully updated real image for {product.name}")
        except Exception as e:
            print(f"Error for {product.name}: {e}")
    print(f"Updated {count} products with real images.")

if __name__ == "__main__":
    update_images()
