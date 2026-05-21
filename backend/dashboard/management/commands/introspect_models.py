"""
Django Management Command: Introspect Models
Discovers all models and their REAL fields across the Django project
"""
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models


class Command(BaseCommand):
    help = 'Introspect all Django models and their real fields'

    def get_field_type(self, field):
        """Get human-readable field type"""
        field_class = field.__class__.__name__
        
        # Map Django field types to categories
        text_fields = ['CharField', 'TextField', 'SlugField', 'EmailField', 'URLField', 'RichTextField']
        number_fields = ['IntegerField', 'BigIntegerField', 'PositiveIntegerField', 
                         'PositiveSmallIntegerField', 'SmallIntegerField', 'DecimalField', 'FloatField']
        bool_fields = ['BooleanField', 'NullBooleanField']
        date_fields = ['DateField', 'DateTimeField', 'TimeField']
        file_fields = ['FileField', 'ImageField']
        relation_fields = ['ForeignKey', 'OneToOneField', 'ManyToManyField']
        
        if field_class in text_fields:
            return 'text'
        elif field_class in number_fields:
            return 'number'
        elif field_class in bool_fields:
            return 'boolean'
        elif field_class in date_fields:
            return 'date'
        elif field_class in file_fields:
            return 'file'
        elif field_class in relation_fields:
            return 'relation'
        else:
            return 'other'

    def introspect_project(self):
        """Introspect all models in the project"""
        
        # Exclude Django system apps
        exclude_apps = [
            'admin', 'auth', 'contenttypes', 'sessions', 'messages', 
            'staticfiles', 'rest_framework', 'rest_framework_simplejwt',
            'token_blacklist', 'drf_spectacular', 'corsheaders', 'import_export', 
            'ckeditor', 'django_filters', 'django_extensions'
        ]
        
        project_data = {}
        
        for app_config in apps.get_app_configs():
            app_label = app_config.label
            
            # Skip excluded apps
            if app_label in exclude_apps:
                continue
                
            models_list = []
            
            for model in app_config.get_models():
                model_name = model.__name__
                model_meta = model._meta
                
                # Extract REAL fields only (exclude auto-generated and methods)
                fields = []
                for field in model_meta.get_fields():
                    # Skip reverse relations
                    if field.auto_created and not field.concrete:
                        continue
                    
                    field_info = {
                        'name': field.name,
                        'verbose_name': getattr(field, 'verbose_name', field.name),
                        'field_class': field.__class__.__name__,
                        'field_type': self.get_field_type(field),
                        'required': not getattr(field, 'blank', True),
                        'null': getattr(field, 'null', False),
                        'unique': getattr(field, 'unique', False),
                        'editable': getattr(field, 'editable', True),
                        'db_index': getattr(field, 'db_index', False),
                    }
                    
                    # Additional info for specific field types
                    if isinstance(field, models.CharField):
                        field_info['max_length'] = field.max_length
                    elif isinstance(field, models.DecimalField):
                        field_info['max_digits'] = field.max_digits
                        field_info['decimal_places'] = field.decimal_places
                    elif isinstance(field, (models.ForeignKey, models.OneToOneField)):
                        field_info['related_model'] = field.related_model.__name__
                        field_info['related_app'] = field.related_model._meta.app_label
                    elif isinstance(field, models.ManyToManyField):
                        field_info['related_model'] = field.related_model.__name__
                        field_info['related_app'] = field.related_model._meta.app_label
                    
                    # Choices
                    if hasattr(field, 'choices') and field.choices:
                        field_info['has_choices'] = True
                        field_info['choices_count'] = len(field.choices)
                    
                    fields.append(field_info)
                
                model_data = {
                    'name': model_name,
                    'verbose_name': model_meta.verbose_name,
                    'verbose_name_plural': model_meta.verbose_name_plural,
                    'app_label': app_label,
                    'db_table': model_meta.db_table,
                    'fields': fields,
                }
                
                models_list.append(model_data)
            
            if models_list:
                project_data[app_label] = {
                    'app_name': app_config.name,
                    'verbose_name': app_config.verbose_name,
                    'models': models_list
                }
        
        return project_data

    def handle(self, *args, **options):
        """Execute the command"""
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("DJANGO PROJECT MODEL INTROSPECTION REPORT"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        data = self.introspect_project()
        
        total_models = sum(len(app_data['models']) for app_data in data.values())
        self.stdout.write(f"Total Apps: {len(data)}")
        self.stdout.write(f"Total Models: {total_models}")
        self.stdout.write("")
        self.stdout.write("=" * 80)
        
        for app_label, app_data in sorted(data.items()):
            self.stdout.write("")
            self.stdout.write(self.style.HTTP_INFO(f"APP: {app_label}"))
            self.stdout.write(f"Name: {app_data['app_name']}")
            self.stdout.write(f"Models: {len(app_data['models'])}")
            self.stdout.write("-" * 80)
            
            for model in app_data['models']:
                self.stdout.write("")
                self.stdout.write(self.style.WARNING(f"  MODEL: {model['name']}"))
                self.stdout.write(f"  Verbose Name: {model['verbose_name']}")
                self.stdout.write(f"  Table: {model['db_table']}")
                self.stdout.write(f"  Fields ({len(model['fields'])}):")
                
                for field in model['fields']:
                    required_str = "REQUIRED" if field['required'] else "optional"
                    unique_str = " UNIQUE" if field['unique'] else ""
                    index_str = " INDEXED" if field['db_index'] else ""
                    
                    field_display = f"    - {field['name']} ({field['field_class']})"
                    field_display += f" [{required_str}{unique_str}{index_str}]"
                    
                    if 'related_model' in field:
                        field_display += f" -> {field['related_app']}.{field['related_model']}"
                    
                    if 'max_length' in field:
                        field_display += f" max_length={field['max_length']}"
                    
                    if 'has_choices' in field:
                        field_display += f" choices={field['choices_count']}"
                    
                    self.stdout.write(field_display)
        
        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("INTROSPECTION COMPLETE"))
        self.stdout.write("=" * 80)
