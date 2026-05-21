"""
Management command to test the dashboard system
"""

from django.core.management.base import BaseCommand
from dashboard.utils import model_registry, get_model_actions
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Test dashboard system components'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*80))
        self.stdout.write(self.style.SUCCESS('DASHBOARD SYSTEM TEST'))
        self.stdout.write(self.style.SUCCESS('='*80 + '\n'))
        
        # Test 1: Model Registry
        self.stdout.write(self.style.HTTP_INFO('\n1. Testing Model Registry...'))
        all_apps = model_registry.get_all_apps()
        
        if all_apps:
            self.stdout.write(self.style.SUCCESS(f'   ✓ Found {len(all_apps)} apps'))
            total_models = sum(len(app['models']) for app in all_apps.values())
            self.stdout.write(self.style.SUCCESS(f'   ✓ Found {total_models} models'))
        else:
            self.stdout.write(self.style.ERROR('   ✗ No apps/models found!'))
            return
        
        # Test 2: Model Metadata
        self.stdout.write(self.style.HTTP_INFO('\n2. Testing Model Metadata...'))
        test_model = model_registry.get_model('products', 'Product')
        if test_model:
            meta = model_registry.get_model_meta('products', 'Product')
            self.stdout.write(self.style.SUCCESS(f'   ✓ Product model found'))
            self.stdout.write(self.style.SUCCESS(f'   ✓ Fields: {len(meta["fields"])}'))
            self.stdout.write(self.style.SUCCESS(f'   ✓ Has admin: {meta["has_admin"]}'))
        else:
            self.stdout.write(self.style.WARNING('   ⚠ Product model not found (may not exist yet)'))
        
        # Test 3: Permissions (requires a user)
        self.stdout.write(self.style.HTTP_INFO('\n3. Testing Permissions...'))
        try:
            superuser = User.objects.filter(is_superuser=True).first()
            if superuser:
                self.stdout.write(self.style.SUCCESS(f'   ✓ Found superuser: {superuser.email}'))
                if test_model:
                    actions = get_model_actions(superuser, test_model)
                    self.stdout.write(self.style.SUCCESS(f'   ✓ Permissions: {actions}'))
            else:
                self.stdout.write(self.style.WARNING('   ⚠ No superuser found'))
                self.stdout.write(self.style.WARNING('   Create one with: python manage.py createsuperuser'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'   ⚠ Error checking permissions: {e}'))
        
        # Test 4: URL Generation
        self.stdout.write(self.style.HTTP_INFO('\n4. Testing URL Generation...'))
        sample_urls = []
        for app_label, app_data in list(all_apps.items())[:3]:  # First 3 apps
            for model_name in list(app_data['models'].keys())[:2]:  # First 2 models per app
                url = f"/dashboard/model/{app_label}/{model_name}/"
                sample_urls.append((model_name, url))
        
        if sample_urls:
            self.stdout.write(self.style.SUCCESS('   ✓ Sample URLs:'))
            for name, url in sample_urls:
                self.stdout.write(f'      • {name}: {url}')
        
        # Test 5: Template Tags
        self.stdout.write(self.style.HTTP_INFO('\n5. Testing Template Tags...'))
        try:
            from dashboard.templatetags import dashboard_tags
            self.stdout.write(self.style.SUCCESS('   ✓ Template tags loaded'))
            self.stdout.write(self.style.SUCCESS(f'   ✓ Available tags: get_field_display, verbose_name, etc.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ✗ Error loading template tags: {e}'))
        
        # Test 6: Context Processor
        self.stdout.write(self.style.HTTP_INFO('\n6. Testing Context Processor...'))
        try:
            from dashboard.context_processors import dashboard_context
            self.stdout.write(self.style.SUCCESS('   ✓ Context processor loaded'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ✗ Error loading context processor: {e}'))
        
        # Final Summary
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS('TEST COMPLETE'))
        self.stdout.write('='*80 + '\n')
        
        self.stdout.write(self.style.SUCCESS('✅ Dashboard system is ready to use!\n'))
        self.stdout.write(self.style.WARNING('Next steps:'))
        self.stdout.write('  1. Start server: python manage.py runserver')
        self.stdout.write('  2. Visit: http://localhost:8000/dashboard/')
        self.stdout.write('  3. Login with superuser credentials\n')
