import os
import django
import glob
from django.core.files.base import ContentFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product

mapping = {
    'all_purpose_flour': 'All-Purpose Flour',
    'basmati_rice': 'Basmati Rice',
    'black_pepper': 'Black Pepper',
    'brown_rice': 'Brown Rice',
    'fuji_apples': 'Fuji Apples',
    'granny_smith_apples': 'Granny Smith Apples',
    'green_bell_peppers': 'Green Bell Peppers',
    'lentils': 'Lentils',
    'olive_oil': 'Olive Oil',
    'pink_salt': 'Himalayan Pink Salt',
    'red_bell_peppers': 'Red Bell Peppers',
    'sugar_professional': 'Sugar',
    'sunflower_oil': 'Sunflower Oil',
    'whole_wheat_flour': 'Whole Wheat Flour',
    'sugar_pack': 'Sugar',
}

artifact_dir = r"C:\Users\USER\.gemini\antigravity-ide\brain\dac707ec-806b-4140-8cd9-b50fc510ba03"
png_files = glob.glob(os.path.join(artifact_dir, "*.png"))

for file_path in png_files:
    basename = os.path.basename(file_path)
    # Remove the timestamp part e.g. sugar_professional_1782816519235.png
    prefix = "_".join(basename.split("_")[:-1])
    
    if prefix in mapping:
        product_name = mapping[prefix]
        products = Product.objects.filter(name=product_name)
        if products.exists():
            with open(file_path, 'rb') as f:
                content = f.read()
            for p in products:
                if p.thumbnail:
                    p.thumbnail.delete(save=False)
                p.thumbnail.save(f"{prefix}.png", ContentFile(content), save=True)
            print(f"Updated {product_name} with {basename}")
