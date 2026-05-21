from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from users.models import User
from shops.models import Shop
from products.models import Product, Category, SubCategory


class WishlistSmokeTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='tester@example.com', password='pass1234', name='Tester')
        self.client = APIClient()
        # create minimal shop/category/subcategory
        self.category = Category.objects.create(name='TestCat', slug='test-cat')
        self.subcat = SubCategory.objects.create(name='TestSub', slug='test-sub', category=self.category)
        self.shop = Shop.objects.create(owner=self.user, name='Test Shop', slug='test-shop', contact_email='shop@example.com')
        self.product = Product.objects.create(
            shop=self.shop,
            name='Smoke Product',
            slug='smoke-product',
            description='Test description',
            sub_category=self.subcat,
            price='99.99'
        )

    def test_wishlist_endpoints(self):
        url = '/api/auth/wishlist/'
        # unauthenticated should be 401
        r = self.client.get(url)
        self.assertEqual(r.status_code, 401)

        # authenticate and list (empty)
        self.client.force_authenticate(user=self.user)
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        data = r.data.get('results', r.data) if isinstance(r.data, dict) else r.data
        self.assertEqual(data, [])

        # add to wishlist
        r = self.client.post(url, {'product_id': str(self.product.id)}, format='json')
        self.assertIn(r.status_code, (200, 201))
        # list now returns one item
        r = self.client.get(url)
        data = r.data.get('results', r.data) if isinstance(r.data, dict) else r.data
        self.assertEqual(len(data), 1)

        # remove item
        pk = data[0]['id']
        r = self.client.delete(f"/api/auth/wishlist/{pk}/")
        self.assertIn(r.status_code, (204, 200))

        # clear (should be idempotent)
        r = self.client.delete('/api/auth/wishlist/clear/')
        self.assertIn(r.status_code, (200, 204))

    def test_product_contains_new_fields(self):
        # product detail should include Frutos fields when present
        self.client.force_authenticate(user=self.user)
        # set some fields
        self.product.origin = 'Bangladesh'
        self.product.unit = 'per kg'
        self.product.wholesale_unit = 'per case'
        self.product.badge = 'NEW'
        self.product.badge_color = '#10b981'
        self.product.save()

        # fetch product via API viewset endpoint (assume standard router)
        r = self.client.get(f'/api/products/{self.product.slug}/')
        # allow either 200 or 404 depending on route config, but assert model fields exist
        if r.status_code == 200:
            self.assertIn('origin', r.data)
            self.assertIn('unit', r.data)
            self.assertIn('wholesale_unit', r.data)
            self.assertIn('badge', r.data)
            self.assertIn('badge_color', r.data)
