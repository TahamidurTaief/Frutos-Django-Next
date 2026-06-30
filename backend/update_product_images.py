import os
import django
from django.core.files.base import ContentFile
from io import BytesIO
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is not installed. Please install it.")
    exit(1)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product

def create_image_for_product(name, bg_color=(232, 245, 233), text_color=(46, 125, 50)):
    width, height = 400, 400
    image = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(image)
    
    try:
        # Try to use a larger default font if possible, or just default
        font = ImageFont.truetype("arial.ttf", 32)
    except IOError:
        font = ImageFont.load_default()

    # wrap text simply by splitting words if it's too long
    words = name.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        try:
            bbox = draw.textbbox((0,0), " ".join(current_line), font=font)
            w = bbox[2] - bbox[0]
        except AttributeError:
            w, _ = draw.textsize(" ".join(current_line), font=font)
        
        if w > width - 40:
            current_line.pop()
            lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))

    # Draw lines
    y_text = height / 2 - (len(lines) * 20)
    for line in lines:
        try:
            bbox = draw.textbbox((0,0), line, font=font)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
        except AttributeError:
            w, h = draw.textsize(line, font=font)
        
        x_text = (width - w) / 2
        draw.text((x_text, y_text), line, font=font, fill=text_color)
        y_text += (h + 10)

    buffer = BytesIO()
    image.save(buffer, format='PNG')
    return buffer.getvalue()

def update_images():
    products = Product.objects.all()
    count = 0
    for product in products:
        try:
            print(f"Updating image for {product.name}")
            image_content = create_image_for_product(product.name)
            filename = f"{product.slug}.png"
            product.thumbnail.save(filename, ContentFile(image_content), save=False)
            product.save()
            count += 1
            print(f"Successfully updated image for {product.name}")
        except Exception as e:
            print(f"Error for {product.name}: {e}")
    print(f"Updated {count} products.")

if __name__ == "__main__":
    update_images()
