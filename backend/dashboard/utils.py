"""
Dashboard Utilities - PRODUCTION-GRADE Model Introspection
ONLY uses REAL model fields from model._meta.get_fields()
NO HALLUCINATED FIELDS - All introspection from Django internals
"""

from django.apps import apps
from django.contrib import admin
from django.db import models
from django.forms import modelform_factory
from django.contrib.contenttypes.models import ContentType
from collections import defaultdict
import csv
import io


def get_model_class(app_label, model_name):
    """
    Safely get model class
    Returns None if not found
    """
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None


def get_real_fields(model):
    """
    Extract ONLY real database fields from model
    Excludes:
    - Reverse relations (auto_created=True, concrete=False)
    - Methods
    - Properties
    - UI helpers
    
    Returns: List of field objects
    """
    real_fields = []
    
    for field in model._meta.get_fields():
        # Skip reverse relations
        if field.auto_created and not field.concrete:
            continue
        
        # Skip non-editable fields (like AutoField primary keys)
        # unless it's the actual primary key
        if not field.editable and not field.primary_key:
            continue
        
        real_fields.append(field)
    
    return real_fields


def get_editable_fields(model):
    """
    Get fields that should appear in forms
    Excludes auto fields and primary keys
    """
    editable_fields = []
    
    for field in get_real_fields(model):
        # Skip primary key if auto-generated
        if field.primary_key and isinstance(field, (models.AutoField, models.BigAutoField, models.UUIDField)):
            continue
        
        # Skip auto timestamps if auto_now or auto_now_add
        if isinstance(field, models.DateTimeField):
            if getattr(field, 'auto_now', False) or getattr(field, 'auto_now_add', False):
                continue
        
        if field.editable:
            editable_fields.append(field)
    
    return editable_fields


def get_listable_fields(model):
    """
    Get fields suitable for list display
    Excludes large text fields, files, many-to-many
    """
    listable = []
    
    for field in get_real_fields(model):
        # Skip large text fields
        if isinstance(field, models.TextField):
            continue
        
        # Skip file fields (show icon/link instead)
        if isinstance(field, (models.FileField, models.ImageField)):
            continue
        
        # Skip M2M (too complex for list view)
        if isinstance(field, models.ManyToManyField):
            continue
        
        listable.append(field)
    
    return listable[:8]  # Limit to 8 columns for readability


def get_searchable_fields(model):
    """
    Get fields that can be searched with text query
    Only text-based fields
    """
    searchable = []
    
    text_field_types = (
        models.CharField,
        models.TextField,
        models.EmailField,
        models.URLField,
        models.SlugField,
    )
    
    for field in get_real_fields(model):
        if isinstance(field, text_field_types):
            searchable.append(field.name)
    
    return searchable


def get_filterable_fields(model):
    """
    Get fields suitable for filtering
    Boolean, date, FK, and choice fields
    """
    filterable = []
    
    for field in get_real_fields(model):
        # Boolean fields
        if isinstance(field, models.BooleanField):
            filterable.append(field)
            continue
        
        # Date fields
        if isinstance(field, (models.DateField, models.DateTimeField)):
            filterable.append(field)
            continue
        
        # Foreign key
        if isinstance(field, models.ForeignKey):
            filterable.append(field)
            continue
        
        # Fields with choices
        if hasattr(field, 'choices') and field.choices:
            filterable.append(field)
            continue
    
    return filterable[:6]  # Limit to 6 filters


def get_field_value_display(obj, field):
    """
    Get display value for a field
    Handles all field types properly
    """
    from django.utils.html import format_html
    
    value = getattr(obj, field.name, None)
    
    if value is None:
        return format_html('<span class="text-muted">—</span>')
    
    # Boolean fields
    if isinstance(field, models.BooleanField):
        if value:
            return format_html('<span class="badge bg-success">Yes</span>')
        else:
            return format_html('<span class="badge bg-secondary">No</span>')
    
    # Choice fields
    if hasattr(field, 'choices') and field.choices:
        display_method = f'get_{field.name}_display'
        if hasattr(obj, display_method):
            return getattr(obj, display_method)()
    
    # Date/DateTime fields
    if isinstance(field, models.DateTimeField):
        return value.strftime('%Y-%m-%d %H:%M')
    elif isinstance(field, models.DateField):
        return value.strftime('%Y-%m-%d')
    
    # Foreign Key
    if isinstance(field, models.ForeignKey):
        return str(value)
    
    # Image/File fields - show filename only
    if isinstance(field, (models.FileField, models.ImageField)):
        if value:
            import os
            return os.path.basename(value.name)
        return '—'
    
    # Decimal/Float - format nicely
    if isinstance(field, models.DecimalField):
        return f"{value:,.2f}"
    
    # Regular value
    value_str = str(value)
    
    # Truncate long strings
    if len(value_str) > 50:
        return value_str[:47] + '...'
    
    return value_str


class ModelRegistry:
    """
    Central registry for all models in the project
    Auto-discovers models and provides metadata
    Thread-safe singleton
    """
    
    _instance = None
    _registry = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._build_registry()
        return cls._instance
    
    def _build_registry(self):
        """Build complete registry of all models

        This method constructs two internal mappings:
        - self._apps: maps app_label -> {name, label, models: {ModelName: metadata}}
        - self._models_by_key: maps 'app_label.modelname' -> metadata

        The public accessor get_all_apps() returns the apps mapping for compatibility.
        """
        from .config import MODEL_GROUPS
        from django.apps import apps as django_apps

        # Clear previous state
        self._models_by_key = {}
        self._apps = {}

        # Build from explicit MODEL_GROUPS configuration
        for group_key, group_data in MODEL_GROUPS.items():
            if group_key == 'dashboard':
                continue  # Skip dashboard home

            for app_label, model_name in group_data['models']:
                model_class = get_model_class(app_label, model_name)

                if model_class is None:
                    # Skip models that don't exist in this environment
                    continue

                # Admin configuration (if any)
                admin_config = self._get_admin_config(model_class)

                # Field metadata
                fields_meta = self._get_model_fields(model_class)

                metadata = {
                    'model': model_class,
                    'app_label': app_label,
                    'model_name': model_name,
                    'verbose_name': model_class._meta.verbose_name,
                    'verbose_name_plural': model_class._meta.verbose_name_plural,
                    'fields': fields_meta,
                    'admin_config': admin_config,
                    'has_admin': admin_config is not None,
                }

                key = f"{app_label}.{model_name.lower()}"
                self._models_by_key[key] = metadata

                # Ensure app entry exists
                if app_label not in self._apps:
                    try:
                        app_config = django_apps.get_app_config(app_label)
                        app_name = app_config.verbose_name
                    except Exception:
                        app_name = app_label

                    self._apps[app_label] = {
                        'name': app_name,
                        'label': app_label,
                        'models': {},
                    }

                self._apps[app_label]['models'][model_name] = metadata

        # For backward compatibility expose apps mapping as _registry
        self._registry = self._apps

    
    def _get_admin_config(self, model):
        """Extract admin configuration for a model"""
        try:
            admin_site = admin.site._registry.get(model)
            if admin_site:
                return {
                    'list_display': getattr(admin_site, 'list_display', None),
                    'list_filter': getattr(admin_site, 'list_filter', None),
                    'search_fields': getattr(admin_site, 'search_fields', None),
                    'list_editable': getattr(admin_site, 'list_editable', None),
                    'ordering': getattr(admin_site, 'ordering', None),
                    'readonly_fields': getattr(admin_site, 'readonly_fields', None),
                    'fieldsets': getattr(admin_site, 'fieldsets', None),
                }
        except:
            pass
        return None
    
    def _get_model_fields(self, model):
        """Get all fields for a model with metadata"""
        fields = []
        
        for field in model._meta.get_fields():
            if field.auto_created and not field.concrete:
                # Skip auto-created reverse relations unless needed
                continue
            
            field_info = {
                'name': field.name,
                'verbose_name': getattr(field, 'verbose_name', field.name),
                'type': field.get_internal_type() if hasattr(field, 'get_internal_type') else 'Unknown',
                'editable': getattr(field, 'editable', True),
                'blank': getattr(field, 'blank', False),
                'null': getattr(field, 'null', False),
                'help_text': getattr(field, 'help_text', ''),
                'choices': getattr(field, 'choices', None),
                'is_relation': field.is_relation,
                'many_to_many': field.many_to_many if hasattr(field, 'many_to_many') else False,
                'related_model': field.related_model.__name__ if field.is_relation and hasattr(field, 'related_model') else None,
            }
            
            fields.append(field_info)
        
        return fields
    
    def get_all_apps(self):
        """Get all registered apps"""
        return self._registry
    
    def get_app(self, app_label):
        """Get specific app"""
        return self._registry.get(app_label)
    
    def get_model_meta(self, app_label, model_name):
        """Get metadata for a specific model"""
        app = self._registry.get(app_label)
        if app:
            return app['models'].get(model_name)
        return None
    
    def get_model(self, app_label, model_name):
        """Get the actual model class"""
        try:
            return apps.get_model(app_label, model_name)
        except LookupError:
            return None


# Singleton instance
model_registry = ModelRegistry()


def get_field_display_value(obj, field_name):
    """
    Get display value for a field, handling special cases:
    - Foreign keys (show related object)
    - Boolean fields (show icons)
    - Choice fields (show display value)
    - DateTime fields (formatted)
    - Images/Files (show preview/link)
    """
    from django.utils.html import format_html
    from django.utils import timezone
    
    try:
        field = obj._meta.get_field(field_name)
        value = getattr(obj, field_name)
        
        # Handle None/empty
        if value is None or value == '':
            return format_html('<span class="text-muted">—</span>')
        
        # Boolean fields
        if isinstance(field, models.BooleanField):
            if value:
                return format_html(
                    '<span class="badge bg-success"><i class="ri-check-line"></i> Yes</span>'
                )
            return format_html(
                '<span class="badge bg-secondary"><i class="ri-close-line"></i> No</span>'
            )
        
        # Choice fields
        if field.choices:
            display_method = f'get_{field_name}_display'
            if hasattr(obj, display_method):
                return getattr(obj, display_method)()
        
        # Foreign key
        if isinstance(field, models.ForeignKey):
            related_obj = getattr(obj, field_name)
            if related_obj:
                return str(related_obj)
            return format_html('<span class="text-muted">None</span>')
        
        # Many-to-many
        if isinstance(field, models.ManyToManyField):
            related_objs = value.all()
            if related_objs:
                return ', '.join([str(obj) for obj in related_objs[:3]])
            return format_html('<span class="text-muted">None</span>')
        
        # Image field
        if isinstance(field, models.ImageField):
            if value:
                return format_html(
                    '<img src="{}" alt="Image" style="max-height: 40px; max-width: 60px; border-radius: 4px;">',
                    value.url
                )
            return format_html('<span class="text-muted">No image</span>')
        
        # File field
        if isinstance(field, models.FileField):
            if value:
                return format_html(
                    '<a href="{}" target="_blank" class="btn btn-sm btn-outline-primary">'
                    '<i class="ri-file-line"></i> View File</a>',
                    value.url
                )
            return format_html('<span class="text-muted">No file</span>')
        
        # DateTime field
        if isinstance(field, (models.DateTimeField, models.DateField)):
            if isinstance(value, str):
                return value
            if hasattr(value, 'strftime'):
                if isinstance(field, models.DateTimeField):
                    return value.strftime('%Y-%m-%d %H:%M:%S')
                return value.strftime('%Y-%m-%d')
        
        # Default: return string representation
        return str(value)
    
    except Exception as e:
        return format_html('<span class="text-danger">Error: {}</span>', str(e))


def get_model_fields_for_list(model, admin_config=None):
    """
    Get fields to display in list view
    Priority: admin.list_display > first 5-7 meaningful fields
    """
    # Use admin list_display if available
    if admin_config and admin_config.get('list_display'):
        return [f for f in admin_config['list_display'] if f != '__str__']
    
    # Auto-select meaningful fields
    fields = []
    
    for field in model._meta.get_fields():
        # Skip auto-created reverse relations
        if field.auto_created and not field.concrete:
            continue
        
        # Skip large text fields for list view
        if isinstance(field, (models.TextField,)):
            continue
        
        # Skip password fields
        if 'password' in field.name.lower():
            continue
        
        # Add field
        if hasattr(field, 'editable') and field.editable:
            fields.append(field.name)
        
        # Limit to reasonable number
        if len(fields) >= 7:
            break
    
    return fields


def get_search_fields(model, admin_config=None):
    """Get fields suitable for search"""
    if admin_config and admin_config.get('search_fields'):
        return admin_config['search_fields']
    
    search_fields = []
    for field in model._meta.get_fields():
        if isinstance(field, (models.CharField, models.TextField)):
            if field.editable and not 'password' in field.name.lower():
                search_fields.append(field.name)
    
    return search_fields[:5]  # Limit search fields


def get_filter_fields(model, admin_config=None):
    """Get fields suitable for filtering"""
    if admin_config and admin_config.get('list_filter'):
        return admin_config['list_filter']
    
    filter_fields = []
    for field in model._meta.get_fields():
        if isinstance(field, (models.BooleanField, models.ForeignKey)):
            filter_fields.append(field.name)
        elif hasattr(field, 'choices') and field.choices:
            filter_fields.append(field.name)
    
    return filter_fields[:5]


def get_app_icon(app_label):
    """Get icon for an app"""
    icon_map = {
        'users': 'ri-user-line',
        'shops': 'ri-store-line',
        'products': 'ri-shopping-bag-line',
        'orders': 'ri-shopping-cart-line',
        'sections': 'ri-layout-grid-line',
        'website': 'ri-global-line',
        'dashboard': 'ri-dashboard-line',
    }
    return icon_map.get(app_label, 'ri-folder-line')


def get_model_icon(model_name):
    """Get icon for a model"""
    icon_map = {
        'User': 'ri-user-line',
        'Shop': 'ri-store-2-line',
        'Product': 'ri-product-hunt-line',
        'Category': 'ri-folder-line',
        'Order': 'ri-file-list-line',
        'Brand': 'ri-vip-crown-line',
        'Coupon': 'ri-coupon-line',
        'Address': 'ri-map-pin-line',
    }
    return icon_map.get(model_name, 'ri-file-line')


def check_model_permission(user, model, permission_type):
    """
    Check if user has permission for a model
    permission_type: 'view', 'add', 'change', 'delete'
    """
    app_label = model._meta.app_label
    model_name = model._meta.model_name
    
    perm_code = f"{app_label}.{permission_type}_{model_name}"
    
    return user.has_perm(perm_code) or user.is_superuser


def get_model_actions(user, model):
    """Get available actions for a model based on permissions"""
    actions = {}
    
    for action in ['view', 'add', 'change', 'delete']:
        actions[action] = check_model_permission(user, model, action)
    
    return actions
