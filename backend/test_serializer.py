import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product
from products.serializers import ProductSerializer
from users.models import User
from rest_framework.test import APIRequestFactory

def test():
    # Find a wholesale user
    user = User.objects.filter(user_type='WHOLESALER').first()
    if not user:
        user = User.objects.create(email='wholesale@test.com', user_type='WHOLESALER')
        print("Created wholesale user")
        
    product = Product.objects.first()
    if not product:
        print("No product found")
        return
        
    print(f"Testing with User: {user.email} (Type: {user.user_type})")
    print(f"Product: {product.name}")
    
    factory = APIRequestFactory()
    request = factory.get('/')
    request.user = user
    
    serializer = ProductSerializer(product, context={'request': request})
    try:
        data = serializer.data
        print("Serializer data generated successfully.")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test()
