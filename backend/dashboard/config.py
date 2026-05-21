# Dashboard Configuration
# Central configuration for the custom admin dashboard

from django.apps import apps

# ============================================================================
# MODEL GROUPING FOR SIDEBAR NAVIGATION
# ============================================================================

# ============================================================================
# MODEL GROUPING FOR SIDEBAR NAVIGATION
# Optimized for Admin Dashboard - Business Logic First
# ============================================================================

MODEL_GROUPS = {
    'dashboard': {
        'title': 'Dashboard',
        'icon': 'bi-speedometer2',
        'models': []  # Dashboard home - no models
    },
    'products': {
        'title': 'Products',
        'icon': 'bi-box-seam',
        'description': 'Manage products, categories, brands, and inventory',
        'models': [
            ('products', 'Product'),
            ('products', 'Category'),
            ('products', 'SubCategory'),
            ('products', 'Brand'),
            ('products', 'Color'),
            ('products', 'Size'),
            ('products', 'ProductAdditionalImage'),
            ('products', 'ProductAdditionalDescription'),
            ('products', 'ProductSpecification'),
            ('products', 'Review'),
            ('products', 'CategoryMinimumOrderQuantity'),
        ]
    },
    'orders': {
        'title': 'Orders',
        'icon': 'bi-cart-check',
        'description': 'Process orders, payments, and coupons',
        'models': [
            ('orders', 'Order'),
            ('orders', 'OrderItem'),
            ('orders', 'OrderUpdate'),
            ('orders', 'OrderPayment'),
            ('orders', 'Coupon'),
        ]
    },
    'shipping': {
        'title': 'Shipping',
        'icon': 'bi-truck',
        'description': 'Configure shipping methods, zones, and rates',
        'models': [
            ('products', 'ShippingCategory'),
            ('orders', 'ShippingMethod'),
            ('orders', 'ShippingTier'),
            ('orders', 'FreeShippingRule'),
        ]
    },
    'users': {
        'title': 'Users',
        'icon': 'bi-people',
        'description': 'Manage customers, wholesalers, and affiliates',
        'models': [
            ('users', 'User'),
            ('users', 'Address'),
            ('users', 'WholesalerProfile'),
            ('users', 'AffiliateProfile'),
        ]
    },
    'vendors': {
        'title': 'Vendors',
        'icon': 'bi-shop-window',
        'description': 'Manage vendor profiles, approvals, and support tickets',
        'models': [
            ('users', 'VendorProfile'),
            ('users', 'VendorTicket'),
        ]
    },
    'shops': {
        'title': 'Shops',
        'icon': 'bi-shop',
        'description': 'Vendor shop management',
        'models': [
            ('shops', 'Shop'),
        ]
    },
    'website': {
        'title': 'Website',
        'icon': 'bi-globe',
        'description': 'Manage content, navigation, banners, and pages',
        'models': [
            ('website', 'NavbarSettings'),
            ('website', 'OfferCategory'),
            ('website', 'HeroBanner'),
            ('website', 'OfferBanner'),
            ('website', 'HorizontalPromoBanner'),
            ('website', 'BlogPost'),
            ('website', 'FooterSection'),
            ('website', 'FooterLink'),
            ('website', 'SocialMediaLink'),
            ('website', 'SiteSettings'),
        ]
    },
    'sections': {
        'title': 'Sections',
        'icon': 'bi-grid-3x3',
        'description': 'Homepage sections and featured content',
        'models': [
            ('sections', 'Section'),
            ('sections', 'SectionItem'),
            ('sections', 'PageSection'),
        ]
    },
}


# ============================================================================
# MODEL PERMISSIONS
# ============================================================================

def get_model_permissions(model):
    """Get standard Django permissions for a model"""
    app_label = model._meta.app_label
    model_name = model._meta.model_name
    
    return {
        'view': f'{app_label}.view_{model_name}',
        'add': f'{app_label}.add_{model_name}',
        'change': f'{app_label}.change_{model_name}',
        'delete': f'{app_label}.delete_{model_name}',
    }


def user_has_model_permission(user, model, action='view'):
    """Check if user has permission for model action"""
    if not user.is_authenticated:
        return False
    
    if not user.is_staff:
        return False
    
    if user.is_superuser:
        return True
    
    perms = get_model_permissions(model)
    perm = perms.get(action)
    
    if perm:
        return user.has_perm(perm)
    
    return False


# ============================================================================
# FIELD TYPE DETECTION
# ============================================================================

def get_field_widget_type(field):
    """Determine the appropriate widget type for a field"""
    from django.db import models
    
    field_class = field.__class__.__name__
    
    # Boolean fields
    if isinstance(field, models.BooleanField):
        return 'checkbox'
    
    # Choice fields
    if hasattr(field, 'choices') and field.choices:
        return 'select'
    
    # Date/Time fields
    if isinstance(field, models.DateTimeField):
        return 'datetime'
    elif isinstance(field, models.DateField):
        return 'date'
    elif isinstance(field, models.TimeField):
        return 'time'
    
    # Numeric fields
    if isinstance(field, (models.IntegerField, models.DecimalField, models.FloatField)):
        return 'number'
    
    # Text fields
    if isinstance(field, models.TextField):
        return 'textarea'
    elif isinstance(field, models.EmailField):
        return 'email'
    elif isinstance(field, models.URLField):
        return 'url'
    
    # File fields
    if isinstance(field, models.ImageField):
        return 'image'
    elif isinstance(field, models.FileField):
        return 'file'
    
    # Relationship fields
    if isinstance(field, models.ForeignKey):
        return 'foreignkey'
    elif isinstance(field, models.ManyToManyField):
        return 'manytomany'
    
    # Default to text input
    return 'text'


def is_field_searchable(field):
    """Check if a field should be included in search"""
    from django.db import models
    
    searchable_types = (
        models.CharField,
        models.TextField,
        models.EmailField,
        models.URLField,
        models.SlugField,
    )
    
    return isinstance(field, searchable_types)


def is_field_filterable(field):
    """Check if a field should be included in filters"""
    from django.db import models
    
    filterable_types = (
        models.BooleanField,
        models.DateField,
        models.DateTimeField,
        models.ForeignKey,
    )
    
    # Also include fields with choices
    if hasattr(field, 'choices') and field.choices:
        return True
    
    return isinstance(field, filterable_types)


# ============================================================================
# LIST DISPLAY CONFIGURATION
# ============================================================================

def get_default_list_fields(model):
    """Get default fields to display in list view"""
    fields = []
    meta = model._meta
    
    # Add first few meaningful fields (max 6 for table layout)
    for field in meta.get_fields():
        if field.auto_created and not field.concrete:
            continue
        
        if not field.editable:
            continue
        
        # Skip large text fields and file fields in list view
        from django.db import models
        if isinstance(field, (models.TextField, models.FileField, models.ImageField)):
            continue
        
        # Skip M2M in list view
        if isinstance(field, models.ManyToManyField):
            continue
        
        fields.append(field.name)
        
        if len(fields) >= 6:
            break
    
    return fields


def get_search_fields(model):
    """Get fields that should be searchable"""
    search_fields = []
    
    for field in model._meta.get_fields():
        if field.auto_created and not field.concrete:
            continue
        
        if is_field_searchable(field):
            search_fields.append(field.name)
    
    return search_fields


def get_filter_fields(model):
    """Get fields that should be filterable"""
    filter_fields = []
    
    for field in model._meta.get_fields():
        if field.auto_created and not field.concrete:
            continue
        
        if is_field_filterable(field):
            filter_fields.append(field.name)
    
    return filter_fields[:5]  # Limit to 5 filters


# ============================================================================
# EXPORT CONFIGURATION
# ============================================================================

EXPORT_FORMATS = {
    'csv': {
        'name': 'CSV',
        'content_type': 'text/csv',
        'extension': 'csv',
    },
    'xlsx': {
        'name': 'Excel',
        'content_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'extension': 'xlsx',
    },
}


# ============================================================================
# PAGINATION
# ============================================================================

DEFAULT_PAGE_SIZE = 25
PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200]
