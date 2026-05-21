# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.html import format_html
from .models import UserProfile, Address, Notification

User = get_user_model()


# ─── Inlines ─────────────────────────────────────────────────────────────────

class UserProfileInline(admin.StackedInline):
    model           = UserProfile
    can_delete      = False
    readonly_fields = ['avatar_preview', 'created_at']
    fields          = [
        'avatar', 'avatar_url', 'avatar_preview', 'phone', 'bio',
        'notif_order_updates', 'notif_promotions',
        'notif_price_changes', 'notif_leftover_packs',
    ]

    def avatar_preview(self, obj):
        url = obj.resolved_avatar
        if url:
            return format_html(
                '<img src="{}" style="height:60px;width:60px;border-radius:50%;object-fit:cover;" />',
                url
            )
        return '—'
    avatar_preview.short_description = 'Preview'


class AddressInline(admin.TabularInline):
    model           = Address
    extra           = 0
    fields          = ['label', 'street', 'city', 'postcode', 'country', 'phone', 'is_default']
    readonly_fields = ['created_at']


# ─── Extended User Admin ──────────────────────────────────────────────────────

class ExtendedUserAdmin(BaseUserAdmin):
    inlines      = [UserProfileInline, AddressInline]
    list_display = ['avatar_thumb', 'username', 'email', 'get_full_name',
                    'is_active', 'date_joined', 'order_count']
    list_display_links = ['avatar_thumb', 'username']

    def avatar_thumb(self, obj):
        try:
            url = obj.profile.resolved_avatar
            if url:
                return format_html(
                    '<img src="{}" style="height:36px;width:36px;border-radius:50%;object-fit:cover;" />',
                    url
                )
        except UserProfile.DoesNotExist:
            pass
        return '—'
    avatar_thumb.short_description = ''

    def order_count(self, obj):
        try:
            from orders.models import Order
            return Order.objects.filter(user=obj).count()
        except Exception:
            return '—'
    order_count.short_description = 'Orders'


# User admin is already registered in users.admin.CustomUserAdmin
# So we don't register it again here


# ─── Notification Admin ───────────────────────────────────────────────────────

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ['user', 'type_badge', 'title', 'is_read', 'created_at']
    list_filter   = ['type', 'is_read', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    list_per_page = 40
    ordering      = ['-created_at']

    TYPE_COLORS = {
        'order_update':  '#00694C',
        'promo':         '#855000',
        'price_change':  '#1976D2',
        'leftover_pack': '#6D4C41',
    }

    def type_badge(self, obj):
        color = self.TYPE_COLORS.get(obj.type, '#6D7A73')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:99px;'
            'font-size:11px;font-weight:700;">{}</span>',
            color, obj.get_type_display(),
        )
    type_badge.short_description = 'Type'

    actions = ['mark_all_read']

    def mark_all_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} notifications marked as read.')
    mark_all_read.short_description = 'Mark selected as read'