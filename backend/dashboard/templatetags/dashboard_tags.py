from django import template
from decimal import Decimal
from dashboard.utils import get_field_display_value

register = template.Library()


@register.filter
def mul(value, arg):
    """Multiply value by argument"""
    try:
        return Decimal(str(value)) * Decimal(str(arg))
    except (ValueError, TypeError):
        return 0


@register.filter
def status_badge_class(status):
    """Return CSS class for order status badge"""
    badge_map = {
        'PENDING': 'badge-pending',
        'PROCESSING': 'badge-processing',
        'SHIPPED': 'badge-shipped',
        'DELIVERED': 'badge-delivered',
        'CANCELLED': 'badge-cancelled',
        'PAID': 'badge-paid',
        'FAILED': 'badge-failed',
    }
    return badge_map.get(status, 'badge-pending')


@register.filter
def status_display_name(status):
    """Return display name for status"""
    status_names = {
        'PENDING': 'Pending',
        'PROCESSING': 'Processing',
        'SHIPPED': 'Shipped',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled',
        'PAID': 'Paid',
        'FAILED': 'Failed',
    }
    return status_names.get(status, status)


# ============================================================================
# GENERIC DASHBOARD TEMPLATE TAGS
# ============================================================================

@register.simple_tag
def get_field_display(obj, field_name):
    """
    Template tag to display a field value with proper formatting
    Usage: {% get_field_display object 'field_name' %}
    """
    return get_field_display_value(obj, field_name)


@register.filter
def get_item(dictionary, key):
    """
    Get item from dictionary
    Usage: {{ my_dict|get_item:key }}
    """
    return dictionary.get(key)


@register.filter
def verbose_name(model):
    """
    Get verbose name of a model
    Usage: {{ model|verbose_name }}
    """
    return model._meta.verbose_name


@register.filter
def verbose_name_plural(model):
    """
    Get verbose name plural of a model
    Usage: {{ model|verbose_name_plural }}
    """
    return model._meta.verbose_name_plural


@register.simple_tag
def field_verbose_name(model, field_name):
    """
    Return the verbose name for a given model field.
    Usage: {% field_verbose_name model 'field_name' %}
    """
    try:
        return model._meta.get_field(field_name).verbose_name
    except Exception:
        return field_name.replace('_', ' ').title()


@register.filter
def field_type(field):
    """
    Get the type of a form field
    Usage: {{ form.field_name|field_type }}
    """
    return field.field.__class__.__name__


@register.filter
def add_class(field, css_class):
    """
    Add CSS class to a form field
    Usage: {{ form.field_name|add_class:"form-control" }}
    """
    return field.as_widget(attrs={'class': css_class})

