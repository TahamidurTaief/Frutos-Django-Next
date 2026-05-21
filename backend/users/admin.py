from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django import forms
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget

from django.utils import timezone

from .models import User, Address, WholesalerProfile, AffiliateProfile, VendorProfile, VendorTicket

# ------------------------------
# User Creation and Change Forms
# ------------------------------
class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'name', 'user_type')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('email', 'name', 'user_type', 'password', 'is_active', 'is_staff', 'is_superuser')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]

# ------------------------------
# User Resource for Import/Export
# ------------------------------
class UserResource(resources.ModelResource):
    """Resource class for importing/exporting User data with proper field handling"""
    
    # Custom field for user_type display
    user_type_display = fields.Field(
        column_name='user_type_display',
        attribute='get_user_type_display',
        readonly=True
    )
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'name', 'user_type', 'user_type_display',
            'full_name', 'phone', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login'
        )
        export_order = fields
        import_id_fields = ['email']  # Use email as unique identifier for imports
        skip_unchanged = True
        report_skipped = True
    
    def before_import_row(self, row, **kwargs):
        """Validate and preprocess data before import"""
        # Ensure email is lowercase
        if 'email' in row:
            row['email'] = row['email'].lower().strip()
    
    def dehydrate_user_type(self, user):
        """Export user_type code"""
        return user.user_type
    
    def dehydrate_user_type_display(self, user):
        """Export user_type human-readable name"""
        return user.get_user_type_display()

# ------------------------------
# Inline Classes for User Profiles
# ------------------------------
class WholesalerProfileInline(admin.TabularInline):
    model = WholesalerProfile
    fk_name = 'user'
    extra = 0
    fields = ('business_name', 'trade_license', 'approval_status', 'approved_by', 'approved_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


class AffiliateProfileInline(admin.TabularInline):
    model = AffiliateProfile
    fk_name = 'user'
    extra = 0
    fields = ('referral_code', 'approval_status', 'approved_by', 'approved_at')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


# ------------------------------
# User Admin
# ------------------------------
@admin.register(User)
class CustomUserAdmin(ImportExportModelAdmin, BaseUserAdmin):
    """
    ═══════════════════════════════════════════════════════════════
    USER ADMIN - HIGH PRIORITY (Customers & Vendor Accounts)
    ═══════════════════════════════════════════════════════════════
    Business Context: Customer database + vendor account management
    UX Goal: Quick user lookup, role filtering, approval workflows
    """
    form = UserChangeForm
    add_form = UserCreationForm
    resource_class = UserResource

    # Enhanced list display with visual indicators
    list_display = (
        'email_display', 
        'name_display', 
        'user_type_badge', 
        'status_indicator', 
        'contact_display',
        'date_joined'
    )
    list_filter = (
        'user_type',        # Primary filter for multivendor roles
        'is_active', 
        'is_staff', 
        'is_superuser', 
        ('date_joined', admin.DateFieldListFilter)
    )
    search_fields = ('email', 'name', 'full_name', 'phone')
    ordering = ('-date_joined',)
    readonly_fields = ('last_login', 'date_joined')
    filter_horizontal = ('groups', 'user_permissions')
    list_per_page = 50
    date_hierarchy = 'date_joined'

    fieldsets = (
        ('👤 Account Credentials', {
            'fields': ('email', 'password'),
            'classes': ('wide',)
        }),
        ('📝 Personal Information', {
            'fields': ('name', 'full_name', 'phone', 'user_type'),
            'classes': ('wide',)
        }),
        ('🔐 Permissions & Access', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('📅 Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        ('Create New User', {
            'classes': ('wide',),
            'fields': ('email', 'name', 'user_type', 'password1', 'password2'),
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [WholesalerProfileInline, AffiliateProfileInline]
    
    # ───────────────────────────────────────────────────────────────
    # CUSTOM DISPLAY METHODS - Visual Enhancement
    # ───────────────────────────────────────────────────────────────
    
    def email_display(self, obj):
        return format_html('<strong style="color: #2563eb;">{}</strong>', obj.email)
    email_display.short_description = 'Email'
    email_display.admin_order_field = 'email'
    
    def name_display(self, obj):
        return obj.name or obj.full_name or '-'
    name_display.short_description = 'Name'
    name_display.admin_order_field = 'name'
    
    def user_type_badge(self, obj):
        type_colors = {
            'CUSTOMER': '#6b7280',
            'SELLER': '#8b5cf6',
            'WHOLESALER': '#f59e0b',
            'AFFILIATE': '#ec4899',
            'ADMIN': '#ef4444',
        }
        color = type_colors.get(obj.user_type, '#6b7280')
        return format_html(
            '<span style="padding: 4px 10px; border-radius: 12px; '
            'background-color: {}; color: white; font-size: 10px; '
            'font-weight: 600;">{}</span>',
            color,
            obj.get_user_type_display()
        )
    user_type_badge.short_description = 'Role'
    user_type_badge.admin_order_field = 'user_type'
    
    def status_indicator(self, obj):
        if obj.is_superuser:
            return format_html('<span style="color: #ef4444; font-weight: 700;">👑 SUPERUSER</span>')
        elif obj.is_staff:
            return format_html('<span style="color: #8b5cf6; font-weight: 600;">⚙️ STAFF</span>')
        elif obj.is_active:
            return format_html('<span style="color: #10b981; font-weight: 600;">✓ Active</span>')
        else:
            return format_html('<span style="color: #ef4444; font-weight: 600;">✗ Inactive</span>')
    status_indicator.short_description = 'Status'
    
    def contact_display(self, obj):
        return format_html('<small style="color: #6b7280;">{}</small>', obj.phone or '-')
    contact_display.short_description = 'Phone'

    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            defaults['form'] = self.add_form
        defaults.update(kwargs)
        return super().get_form(request, obj, **defaults)

# ------------------------------
# Address Resource for Import/Export
# ------------------------------
class AddressResource(resources.ModelResource):
    """Resource class for importing/exporting Address data with user relationship"""
    
    user_email = fields.Field(
        column_name='user_email',
        attribute='user',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    class Meta:
        model = Address
        fields = (
            'id', 'user_email', 'address_line_1', 'address_line_2',
            'city', 'state', 'postal_code', 'country', 'is_default'
        )
        export_order = fields
        import_id_fields = ['id']
        skip_unchanged = True
        report_skipped = True

# ------------------------------
# Address Admin
# ------------------------------
@admin.register(Address)
class AddressAdmin(ImportExportModelAdmin):
    """Address Admin with Import/Export functionality"""
    resource_class = AddressResource

    list_display = ('user', 'address_line_1', 'city', 'state', 'country', 'is_default')
    list_filter = ('city', 'state', 'country', 'is_default')
    search_fields = ('user__email', 'address_line_1', 'city', 'postal_code', 'country')
    autocomplete_fields = ['user']


# ------------------------------
# WholesalerProfile Resource
# ------------------------------
class WholesalerProfileResource(resources.ModelResource):
    """Resource for WholesalerProfile with approval tracking"""
    
    user_email = fields.Field(
        column_name='user_email',
        attribute='user',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    approval_status_display = fields.Field(
        column_name='approval_status_display',
        attribute='get_approval_status_display',
        readonly=True
    )
    
    approved_by_email = fields.Field(
        column_name='approved_by_email',
        attribute='approved_by',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    class Meta:
        model = WholesalerProfile
        fields = (
            'id', 'user_email', 'business_name', 'trade_license',
            'approval_status', 'approval_status_display', 
            'approved_by_email', 'approved_at', 'created_at', 'updated_at'
        )
        export_order = fields
        import_id_fields = ['id']
        skip_unchanged = True

# ------------------------------
# WholesalerProfile Admin
# ------------------------------
@admin.register(WholesalerProfile)
class WholesalerProfileAdmin(ImportExportModelAdmin):
    """WholesalerProfile Admin with approval workflow"""
    resource_class = WholesalerProfileResource
    
    list_display = ('user', 'business_name', 'approval_status', 'created_at', 'approved_at', 'approved_by')
    list_filter = ('approval_status', 'created_at', 'approved_at')
    search_fields = ('user__email', 'business_name')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('user', 'approved_by')
    
    fieldsets = (
        (None, {'fields': ('user', 'business_name', 'trade_license')}),
        (_('Approval'), {
            'fields': ('approval_status', 'approved_by', 'approved_at'),
            'classes': ('wide',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


# ── Vendor Admin ──────────────────────────────────────────────────────────

@admin.register(VendorProfile)
class VendorProfileAdmin(ImportExportModelAdmin):
    """VendorProfile Admin with approval workflow"""
    list_display = ('business_name', 'user', 'phone', 'division', 'approval_status', 'created_at')
    list_filter = ('approval_status', 'division', 'created_at')
    search_fields = ('business_name', 'user__email', 'phone', 'nid_number')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('user', 'approved_by')

    fieldsets = (
        (None, {'fields': ('user', 'business_name', 'business_description', 'phone')}),
        (_('Location'), {'fields': ('division', 'city', 'address_line', 'postal_code')}),
        (_('Documents'), {'fields': ('nid_number', 'nid_front', 'nid_back', 'tin_number', 'bin_number', 'trade_license_number', 'trade_license')}),
        (_('Banking'), {'fields': ('bank_name', 'bank_account_name', 'bank_account_number', 'bank_branch', 'bank_routing_number', 'mobile_banking_number')}),
        (_('Approval'), {'fields': ('approval_status', 'approved_by', 'approved_at', 'rejection_reason')}),
        (_('Timestamps'), {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    def save_model(self, request, obj, form, change):
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


@admin.register(VendorTicket)
class VendorTicketAdmin(admin.ModelAdmin):
    list_display = ('subject', 'vendor', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('subject', 'vendor__email', 'description')
    readonly_fields = ('created_at',)
    autocomplete_fields = ('vendor',)
# ------------------------------
# AffiliateProfile Resource
# ------------------------------
class AffiliateProfileResource(resources.ModelResource):
    """Resource for AffiliateProfile with approval tracking"""
    
    user_email = fields.Field(
        column_name='user_email',
        attribute='user',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    approval_status_display = fields.Field(
        column_name='approval_status_display',
        attribute='get_approval_status_display',
        readonly=True
    )
    
    approved_by_email = fields.Field(
        column_name='approved_by_email',
        attribute='approved_by',
        widget=ForeignKeyWidget(User, 'email')
    )
    
    class Meta:
        model = AffiliateProfile
        fields = (
            'id', 'user_email', 'referral_code',
            'approval_status', 'approval_status_display',
            'approved_by_email', 'approved_at', 'created_at', 'updated_at'
        )
        export_order = fields
        import_id_fields = ['id']
        skip_unchanged = True

# ------------------------------
# AffiliateProfile Admin
# ------------------------------
@admin.register(AffiliateProfile)
class AffiliateProfileAdmin(ImportExportModelAdmin):
    """AffiliateProfile Admin with approval workflow"""
    resource_class = AffiliateProfileResource
    
    list_display = ('user', 'referral_code', 'approval_status', 'created_at', 'approved_at', 'approved_by')
    list_filter = ('approval_status', 'created_at', 'approved_at')
    search_fields = ('user__email', 'referral_code')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')
    autocomplete_fields = ('user', 'approved_by')
    
    fieldsets = (
        (None, {'fields': ('user', 'referral_code')}),
        (_('Approval'), {
            'fields': ('approval_status', 'approved_by', 'approved_at'),
            'classes': ('wide',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)
