import os
import django
import requests
from django.core.files.base import ContentFile
from time import sleep

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product

def get_wiki_image(query):
    mapping = {
        'Sunflower Oil': 'Sunflower_oil',
        'Sugar': 'Sugar',
        'Granny Smith Apples': 'Granny_Smith',
        'Kale': 'Kale',
        'Roma Tomatoes': 'Roma_tomato',
        'Carrots': 'Carrot',
        'Lentils': 'Lentil',
        'Himalayan Pink Salt': 'Himalayan_salt',
        'Whole Wheat Flour': 'Whole_wheat_flour',
        'Honeycrisp Apples': 'Honeycrisp',
        'Spinach': 'Spinach',
        'Sweet Potatoes': 'Sweet_potato',
        'Black Pepper': 'Black_pepper',
        'Olive Oil': 'Olive_oil',
        'All-Purpose Flour': 'Flour',
        'Romaine Lettuce': 'Romaine_lettuce',
        'Fuji Apples': 'Fuji_(apple)',
        'Red Bell Peppers': 'Bell_pepper'
    }
    title = mapping.get(query, query.replace(' ', '_'))
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=pageimages&format=json&pithumbsize=800"
    try:
        # Wikipedia requires a descriptive User-Agent
        headers = {'User-Agent': 'FrutosStoreBot/1.0 (contact@frutos.com) python-requests/2.31'}
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        pages = data.get('query', {}).get('pages', {})
        for pid, pdata in pages.items():
            if 'thumbnail' in pdata:
                return pdata['thumbnail']['source']
    except Exception as e:
        print(f"Error fetching JSON for {title}: {e}")
    return None

def download_images():
    missing_products = [
        'Sunflower Oil', 'Sugar', 'Granny Smith Apples', 'Kale', 'Roma Tomatoes', 
        'Carrots', 'Lentils', 'Himalayan Pink Salt', 'Whole Wheat Flour', 'Honeycrisp Apples', 
        'Spinach', 'Sweet Potatoes', 'Black Pepper', 'Olive Oil', 'All-Purpose Flour', 
        'Romaine Lettuce', 'Fuji Apples', 'Red Bell Peppers'
    ]
    for name in missing_products:
        print(f"Fetching Wikipedia image for {name}...")
        img_url = get_wiki_image(name)
        if img_url:
            print(f"  Downloading {img_url}...")
            try:
                headers = {'User-Agent': 'FrutosStoreBot/1.0 (contact@frutos.com) python-requests/2.31'}
                r = requests.get(img_url, headers=headers)
                if r.status_code == 200:
                    ext = img_url.split('.')[-1].split('?')[0]
                    slug_base = name.lower().replace(' ', '-')
                    filename = f"{slug_base}_wiki.{ext}"
                    for variant in Product.objects.filter(name=name):
                        variant.thumbnail.save(filename, ContentFile(r.content), save=True)
                    print(f"  -> Successfully updated {name}")
                else:
                    print(f"  -> Failed to download image")
            except Exception as e:
                print(f"  -> Error: {e}")
        else:
            print(f"  -> No image found on Wikipedia")
        sleep(0.5)

if __name__ == '__main__':
    download_images()
