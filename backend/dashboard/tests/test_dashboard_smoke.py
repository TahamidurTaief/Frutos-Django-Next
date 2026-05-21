from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()


class DashboardSmokeTests(TestCase):
    def setUp(self):
        # staff user required for dashboard access
        self.user = User.objects.create_user(email='admin@example.com', password='adminpass', name='Admin')
        self.user.is_staff = True
        self.user.save()

    def test_dashboard_home_requires_login_and_returns_200_for_staff(self):
        self.client.force_login(self.user)
        r = self.client.get('/dashboard/')
        self.assertEqual(r.status_code, 200)

    def test_add_color_and_size_api(self):
        self.client.force_login(self.user)
        # add color
        r = self.client.post('/dashboard/api/add-color/', data='{"name":"Teal","hex_code":"#008080"}', content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertIn('success', r.json())
        # add size
        r = self.client.post('/dashboard/api/add-size/', data='{"name":"XL"}', content_type='application/json')
        self.assertEqual(r.status_code, 200)
        self.assertIn('success', r.json())
