"""
Management command to list all models discovered by the dashboard system
"""

from django.core.management.base import BaseCommand
from dashboard.utils import model_registry


class Command(BaseCommand):
    help = 'List all models discovered by the dashboard system'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*80))
        self.stdout.write(self.style.SUCCESS('DASHBOARD MODEL REGISTRY'))
        self.stdout.write(self.style.SUCCESS('='*80 + '\n'))
        
        all_apps = model_registry.get_all_apps()
        
        if not all_apps:
            self.stdout.write(self.style.WARNING('No apps/models found!'))
            return
        
        total_models = 0
        
        for app_label, app_data in all_apps.items():
            self.stdout.write(self.style.HTTP_INFO(f"\n📦 App: {app_data['name']} ({app_label})"))
            self.stdout.write('-' * 80)
            
            models = app_data['models']
            total_models += len(models)
            
            for model_name, model_meta in models.items():
                has_admin = '✓ Admin' if model_meta['has_admin'] else '✗ No Admin'
                fields_count = len(model_meta['fields'])
                
                self.stdout.write(
                    f"  • {model_name} "
                    f"({model_meta['verbose_name_plural']}) "
                    f"[{fields_count} fields] "
                    f"{has_admin}"
                )
                
                # Show URL
                url = f"/dashboard/model/{app_label}/{model_name}/"
                self.stdout.write(self.style.SUCCESS(f"    URL: {url}"))
        
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f"\nTotal: {len(all_apps)} apps, {total_models} models"))
        self.stdout.write(self.style.SUCCESS('='*80 + '\n'))
        
        self.stdout.write(self.style.WARNING('\n💡 TIP: Access any model at:'))
        self.stdout.write(self.style.WARNING('   http://localhost:8000/dashboard/model/{app}/{Model}/\n'))
