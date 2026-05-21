# shops/admin.py
from django.contrib import admin
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from .models import Shop
from users.models import User


class ShopResource(resources.ModelResource):
    """Resource class for importing/exporting Shop data with owner relationship"""
    
    owner_email = fields.Field(
        column_name='owner_email',
        attribute='owner',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    class Meta:
        model = Shop
        fields = (
            'id', 'name', 'slug', 'owner_email', 'description',
            'contact_email', 'contact_phone', 'address',
            'is_active', 'is_verified', 'created_at', 'updated_at'
        )
        export_order = fields
        import_id_fields = ['slug']  # Use slug as unique identifier
        skip_unchanged = True
        report_skipped = True


@admin.register(Shop)
class ShopAdmin(ImportExportModelAdmin):
    """
    ═══════════════════════════════════════════════════════════════
    SHOP/VENDOR ADMIN - HIGH PRIORITY
    ═══════════════════════════════════════════════════════════════
    Business Context: Multivendor shop management
    UX Goal: Quick vendor verification, status management
    """
    resource_class = ShopResource
    
    # Visual-first list display with status badges
    list_display = (
        'name_display', 
        'owner_display', 
        'status_badges', 
        'contact_info', 
        'created_at'
    )
    list_filter = ('is_active', 'is_verified', 'created_at')
    search_fields = ('name', 'owner__email', 'owner__name', 'slug', 'contact_email')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['owner']
    list_per_page = 50
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('🏪 Shop Information', {
            'fields': ('name', 'slug', 'description', 'owner'),
            'classes': ('wide',)
        }),
        ('📞 Contact Details', {
            'fields': ('contact_email', 'contact_phone', 'address', 'city', 'division', 'postal_code')
        }),
        ('Media', {
            'fields': ('logo', 'cover_photo')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # ───────────────────────────────────────────────────────────────
    # CUSTOM DISPLAY METHODS - Visual Enhancement
    # ───────────────────────────────────────────────────────────────
    
    def name_display(self, obj):
        return format_html('<strong style="color: #6366f1;">🏪 {}</strong>', obj.name)
    name_display.short_description = 'Shop Name'
    name_display.admin_order_field = 'name'
    
    def owner_display(self, obj):
        owner_name = obj.owner.name if hasattr(obj.owner, 'name') and obj.owner.name else obj.owner.email
        return format_html(
            '<div><strong>{}</strong><br><small style="color: #6b7280;">{}</small></div>',
            owner_name,
            obj.owner.email
        )
    owner_display.short_description = 'Owner'
    owner_display.admin_order_field = 'owner__name'
    
    def status_badges(self, obj):
        active_badge = (
            '<span style="padding: 4px 10px; border-radius: 12px; '
            'background-color: {}; color: white; font-size: 10px; '
            'font-weight: 600; margin-right: 5px;">{}</span>'
        )
        active_html = active_badge.format('#10b981', '✓ ACTIVE') if obj.is_active else active_badge.format('#ef4444', '✗ INACTIVE')
        verified_html = active_badge.format('#3b82f6', '✓ VERIFIED') if obj.is_verified else active_badge.format('#f59e0b', '⏳ PENDING')
        return format_html(active_html + verified_html)
    status_badges.short_description = 'Status'
    
    def contact_info(self, obj):
        return format_html(
            '<small style="color: #6b7280;">📧 {}<br>📞 {}</small>',
            obj.contact_email or '-',
            obj.contact_phone or '-'
        )
    contact_info.short_description = 'Contact'
    
    # Bulk actions for shop management
    actions = ['activate_shops', 'deactivate_shops', 'verify_shops']
    
    def activate_shops(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} shops activated.')
    activate_shops.short_description = 'Activate selected shops'
    
    def deactivate_shops(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} shops deactivated.')
    deactivate_shops.short_description = 'Deactivate selected shops'
    
    def verify_shops(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} shops verified.')
    verify_shops.short_description = 'Verify selected shops'
    
    def get_queryset(self, request):
        """Optimize queryset - vendors see only their shops"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # If user is a seller, show only their shop
        if request.user.user_type == 'SELLER':
            return qs.filter(owner=request.user)
        return qs