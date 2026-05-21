"""
Core Model Inspector - PRODUCTION GRADE
Introspects Django models ONLY using real fields
Zero hallucination - all data from Django meta API
"""

from django.apps import apps
from django.db import models
from django.forms import modelform_factory
from .config import MODEL_GROUPS


class ModelInspector:
    """Introspects Django models safely"""
    
    @staticmethod
    def get_model(app_label, model_name):
        """Get model class safely"""
        try:
            return apps.get_model(app_label, model_name)
        except LookupError:
            return None
    
    @staticmethod
    def get_real_fields(model):
        """Get ONLY real database fields (no reverse relations, no helpers)"""
        real_fields = []
        
        for field in model._meta.get_fields():
            # Skip reverse relations
            if field.auto_created and not field.concrete:
                continue
            
            real_fields.append(field)
        
        return real_fields
    
    @staticmethod
    def get_editable_fields(model):
        """Get fields for forms (exclude auto PK, timestamps, auto-generated slugs)"""
        editable = []
        
        for field in ModelInspector.get_real_fields(model):
            # Skip auto primary keys
            if field.primary_key and isinstance(field, (models.AutoField, models.BigAutoField)):
                continue
            
            # Skip UUIDField primary keys (auto-generated)
            if field.primary_key and isinstance(field, models.UUIDField):
                continue
            
            # Skip auto timestamps
            if isinstance(field, models.DateTimeField):
                if getattr(field, 'auto_now', False) or getattr(field, 'auto_now_add', False):
                    continue
            
            # Skip slug fields (auto-generated from name/title)
            if isinstance(field, models.SlugField):
                continue
            
            # Skip order_number field (auto-generated)
            if field.name == 'order_number':
                continue
            
            if field.editable:
                editable.append(field)
        
        return editable
    
    @staticmethod
    def get_list_display_fields(model):
        """Get fields suitable for table display"""
        display_fields = []
        
        # Fields to skip (not useful in list view)
        skip_fields = ['slug', 'shipping_category', 'password', 'token']
        
        for field in ModelInspector.get_real_fields(model):
            # Skip specific fields
            if field.name in skip_fields:
                continue
                
            # Skip TextField (too large)
            if isinstance(field, models.TextField):
                continue
            
            # Skip M2M (complex)
            if isinstance(field, models.ManyToManyField):
                continue
            
            display_fields.append(field)
            
            # Limit to 8 columns
            if len(display_fields) >= 8:
                break
        
        return display_fields
    
    @staticmethod
    def get_searchable_fields(model):
        """Get text fields for search"""
        searchable = []
        
        text_types = (models.CharField, models.TextField, models.EmailField, models.URLField, models.SlugField)
        
        for field in ModelInspector.get_real_fields(model):
            if isinstance(field, text_types):
                searchable.append(field.name)
        
        return searchable
    
    @staticmethod
    def get_filterable_fields(model):
        """Get fields for sidebar filters"""
        filterable = []
        
        for field in ModelInspector.get_real_fields(model):
            # Boolean
            if isinstance(field, models.BooleanField):
                filterable.append(field)
            # Date
            elif isinstance(field, (models.DateField, models.DateTimeField)):
                filterable.append(field)
            # FK
            elif isinstance(field, models.ForeignKey):
                filterable.append(field)
            # Choices
            elif hasattr(field, 'choices') and field.choices:
                filterable.append(field)
            
            if len(filterable) >= 5:
                break
        
        return filterable


class ModelFormFactory:
    """Creates ModelForms dynamically with ONLY real fields"""
    
    @staticmethod
    def create_form(model, instance=None):
        """
        Create ModelForm for model
        Uses ONLY real editable fields
        """
        editable_fields = [f.name for f in ModelInspector.get_editable_fields(model)]
        
        form_class = modelform_factory(
            model,
            fields=editable_fields,
        )
        
        if instance:
            return form_class(instance=instance)
        
        return form_class()


class ModelDataFormatter:
    """Formats field values for display"""
    
    @staticmethod
    def format_field_value(obj, field):
        """Get display-ready value for a field"""
        from django.utils.html import format_html
        
        value = getattr(obj, field.name, None)
        
        if value is None:
            return format_html('<span class="text-muted">—</span>')
        
        # Boolean
        if isinstance(field, models.BooleanField):
            if value:
                return format_html('<span class="badge bg-success"><i class="bi bi-check-circle"></i> Yes</span>')
            else:
                return format_html('<span class="badge bg-secondary"><i class="bi bi-x-circle"></i> No</span>')
        
        # Choices
        if hasattr(field, 'choices') and field.choices:
            display_method = f'get_{field.name}_display'
            if hasattr(obj, display_method):
                choice_value = getattr(obj, display_method)()
                return format_html('<span class="badge bg-info">{}</span>', choice_value)
        
        # DateTime
        if isinstance(field, models.DateTimeField):
            return value.strftime('%Y-%m-%d %H:%M')
        elif isinstance(field, models.DateField):
            return value.strftime('%Y-%m-%d')
        
        # FK
        if isinstance(field, models.ForeignKey):
            return str(value)
        
        # File/Image
        if isinstance(field, (models.FileField, models.ImageField)):
            if value:
                import os
                filename = os.path.basename(value.name)
                if isinstance(field, models.ImageField):
                    return format_html('<i class="bi bi-image text-primary"></i> {}', filename)
                return format_html('<i class="bi bi-file-earmark text-secondary"></i> {}', filename)
            return '—'
        
        # Decimal
        if isinstance(field, models.DecimalField):
            return f"{value:,.2f}"
        
        # String
        value_str = str(value)
        if len(value_str) > 60:
            return value_str[:57] + '...'
        
        return value_str


def get_model_groups():
    """Get grouped models for sidebar navigation"""
    from .config import MODEL_GROUPS
    
    groups = []
    
    for group_key, group_data in MODEL_GROUPS.items():
        if group_key == 'dashboard':
            continue
        
        models_in_group = []
        
        for app_label, model_name in group_data['models']:
            model_class = ModelInspector.get_model(app_label, model_name)
            
            if model_class:
                models_in_group.append({
                    'app_label': app_label,
                    'model_name': model_name,
                    'model_class': model_class,
                    'verbose_name': model_class._meta.verbose_name,
                    'verbose_name_plural': model_class._meta.verbose_name_plural,
                })
        
        if models_in_group:
            groups.append({
                'key': group_key,
                'title': group_data['title'],
                'icon': group_data['icon'],
                'models': models_in_group
            })
    
    return groups
