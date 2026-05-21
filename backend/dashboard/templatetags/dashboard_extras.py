from django import template
from django.db import models
from dashboard.model_inspector import ModelDataFormatter

register = template.Library()

@register.filter
def get_attr(obj, attr_name):
    """Get attribute or call callable for display"""
    try:
        val = getattr(obj, attr_name)
        if callable(val):
            try:
                return val()
            except TypeError:
                return val
        return val
    except Exception:
        return ''


@register.filter
def format_field_value(obj, field_name):
    """Format field value for display using ModelDataFormatter"""
    try:
        # Get field from model
        field = obj._meta.get_field(field_name)
        return ModelDataFormatter.format_field_value(obj, field)
    except Exception as e:
        # Fallback to simple getattr
        try:
            value = getattr(obj, field_name)
            if value is None:
                return '—'
            return str(value)
        except:
            return '—'

