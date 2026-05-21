"""
stores/admin.py
"""
from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import Store, StoreFeature, StoreAvailability, LeftoverPack
from .widgets import AMPMTimeWidget


# ── Custom ModelForm — swaps TimeField widgets for AM/PM pickers ───────────────

class StoreAdminForm(forms.ModelForm):
    class Meta:
        model   = Store
        fields  = '__all__'
        widgets = {
            'open_time':  AMPMTimeWidget(),
            'close_time': AMPMTimeWidget(),
        }


# ── Inline helpers ─────────────────────────────────────────────────────────────

class StoreFeatureInline(admin.TabularInline):
    model  = StoreFeature
    extra  = 1
    fields = ('feature',)


class StoreAvailabilityInline(admin.TabularInline):
    model  = StoreAvailability
    extra  = 1
    fields = ('category', 'icon', 'order')

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.form.base_fields['icon'].help_text = (
            'Lucide icon name (kebab-case) — '
            '<a href="https://lucide.dev/icons/" target="_blank">browse icons ↗</a>'
        )
        return formset


class LeftoverPackInline(admin.TabularInline):
    model           = LeftoverPack
    extra           = 1
    fields          = ('name', 'description', 'price', 'image', 'image_preview', 'is_active', 'order')
    readonly_fields = ('image_preview',)

    @admin.display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:48px;border-radius:4px;object-fit:cover;" />',
                obj.image.url,
            )
        return '—'


# ── Store admin ────────────────────────────────────────────────────────────────

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    form = StoreAdminForm          # ← AM/PM picker for open_time / close_time

    list_display        = ('name', 'city', 'hours_display', 'is_active', 'order', 'coords_display', 'updated_at')
    list_editable       = ('is_active', 'order')
    list_filter         = ('is_active', 'city')
    search_fields       = ('name', 'city', 'address', 'slug')
    prepopulated_fields = {'slug': ('name',)}

    # hours / lat / lng auto-filled on save; timestamps are read-only
    readonly_fields = (
        'hours', 'lat', 'lng',
        'created_at', 'updated_at',
        'map_preview', 'image_preview',
    )

    fieldsets = (
        ('Identity', {
            'fields': ('name', 'slug', 'short_name', 'is_active', 'order'),
        }),
        ('Address', {
            'fields': ('address', 'city', 'full_address', 'phone'),
        }),
        ('Hours  ⟵  pick times; "Hours" label auto-generates', {
            'description': (
                'Setting open_time / close_time will automatically generate the "Hours" display label. '
                'No manual entry is required.'
            ),
            'fields': ('open_time', 'close_time', 'hours'),
        }),
        ('Map  ⟵  Paste Google Maps URL', {
            'description': (
                'Both full and short Google Maps URLs (maps.app.goo.gl) will work. '
                'Saving will auto-extract lat/lng.'
            ),
            'fields': ('map_link', 'lat', 'lng', 'map_preview'),
        }),
        ('Media & Provenance', {
            'fields': ('image', 'image_preview', 'provenance'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields':  ('created_at', 'updated_at'),
        }),
    )

    inlines = [StoreFeatureInline, StoreAvailabilityInline, LeftoverPackInline]

    # ── Custom list-view columns ───────────────────────────────────────────────

    @admin.display(description='Hours', ordering='open_time')
    def hours_display(self, obj):
        """Show the auto-calculated AM/PM hours label in the list view."""
        if obj.hours:
            return format_html(
                '<span style="color:#00694c;font-weight:600;white-space:nowrap">{}</span>',
                obj.hours,
            )
        return mark_safe('<span style="color:#aaa">—</span>')

    @admin.display(description='Coordinates')
    def coords_display(self, obj):
        if obj.lat and obj.lng:
            return format_html(
                '<span style="color:#00694C;font-family:monospace">{}, {}</span>',
                round(obj.lat, 4), round(obj.lng, 4),
            )
        return mark_safe('<span style="color:#aaa">—</span>')

    @admin.display(description='Map Preview')
    def map_preview(self, obj):
        if not obj.lat or not obj.lng:
            return '—'
        url = f'https://www.google.com/maps/search/?api=1&query={obj.lat},{obj.lng}'
        return format_html(
            '<a href="{}" target="_blank" style="color:#00694C;font-weight:600">'
            'View on Google Maps ↗</a>',
            url,
        )

    @admin.display(description='Image Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:120px;border-radius:8px;object-fit:cover;" />',
                obj.image.url,
            )
        return '—'


# ── LeftoverPack standalone admin ──────────────────────────────────────────────

@admin.register(LeftoverPack)
class LeftoverPackAdmin(admin.ModelAdmin):
    list_display    = ('name', 'store', 'price', 'is_active', 'order', 'image_preview')
    list_editable   = ('is_active', 'order', 'price')
    list_filter     = ('store', 'is_active')
    search_fields   = ('name', 'store__name')
    readonly_fields = ('image_preview',)

    fieldsets = (
        (None, {
            'fields': ('store', 'name', 'description', 'price', 'is_active', 'order'),
        }),
        ('Image', {
            'fields': ('image', 'image_preview'),
        }),
    )

    @admin.display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:80px;border-radius:6px;object-fit:cover;" />',
                obj.image.url,
            )
        return '—'