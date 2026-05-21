from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db import models
from import_export.admin import ImportExportModelAdmin
from .models import (
    NavbarSettings, OfferCategory, HeroBanner, OfferBanner, 
    HorizontalPromoBanner, BlogPost, FooterSection, FooterLink, 
    SocialMediaLink, SiteSettings
)

@admin.register(NavbarSettings)
class NavbarSettingsAdmin(ImportExportModelAdmin):
    list_display = ['name', 'link_type', 'url', 'order', 'colored_is_active', 'show_in_mobile', 'show_in_desktop']
    list_filter = ['link_type', 'is_active', 'show_in_mobile', 'show_in_desktop']
    search_fields = ['name', 'url']
    list_editable = ['order', 'show_in_mobile', 'show_in_desktop']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Link Information', {
            'fields': ('name', 'link_type', 'url', 'icon_class'),
        }),
        ('Hierarchy & Navigation', {
            'fields': ('parent', 'order'),
        }),
        ('Display Options', {
            'fields': ('show_in_mobile', 'show_in_desktop', 'is_active'),
        }),
    )
    
    def colored_is_active(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: #10b981; font-weight: bold;">● Active</span>'
            )
        return format_html(
            '<span style="color: #ef4444; font-weight: bold;">● Inactive</span>'
        )
    colored_is_active.short_description = 'Status'

@admin.register(OfferCategory)
class OfferCategoryAdmin(ImportExportModelAdmin):
    list_display = ['title', 'name', 'category_display', 'slug', 'order', 'badge_display', 'featured_badge', 'colored_status']
    list_filter = ['is_active', 'is_featured', 'order', 'badge_color', 'category']
    search_fields = ['name', 'title', 'category__name', 'slug', 'description']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    autocomplete_fields = ['category']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'title', 'category', 'slug'),
            'description': 'Internal name, display title, category, and URL slug (slug will be auto-generated if left empty)'
        }),
        ('Landing Page Link', {
            'fields': ('link',),
            'description': 'URL of the landing page where users will be redirected when clicking this offer (e.g., https://example.com or /products)'
        }),
        ('Content', {
            'fields': ('description',),
            'description': 'Detailed description of the special offer (shown in hover modal)'
        }),
        ('Display Options', {
            'fields': ('order', 'is_featured', 'badge_text', 'badge_color', 'icon_class'),
            'description': 'Control the display order, featured status, and badge appearance'
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        """Customize form to add help text for fields"""
        form = super().get_form(request, obj, **kwargs)
        if 'slug' in form.base_fields:
            form.base_fields['slug'].help_text = 'Leave empty to auto-generate from name. Must be unique.'
            form.base_fields['slug'].required = False
        if 'link' in form.base_fields:
            form.base_fields['link'].help_text = 'Enter the landing page URL (e.g., /products?offer=flash-sale or https://example.com/offers)'
        if 'badge_color' in form.base_fields:
            form.base_fields['badge_color'].help_text = 'Choose badge color: red, blue, green, orange, etc.'
        return form
    
    def category_display(self, obj):
        if obj.category:
            return format_html(
                '<span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">{}</span>',
                obj.category.name
            )
        return format_html('<span style="color: #9ca3af; font-size: 12px;">No category</span>')
    category_display.short_description = 'Category'
    
    def badge_display(self, obj):
        if obj.badge_text:
            color_map = {
                'red': 'background: #fee2e2; color: #991b1b;',
                'blue': 'background: #dbeafe; color: #1e40af;',
                'green': 'background: #d1fae5; color: #065f46;',
                'orange': 'background: #ffedd5; color: #9a3412;',
            }
            color_style = color_map.get(obj.badge_color, 'background: #fee2e2; color: #991b1b;')
            return format_html(
                '<span style="{}; padding: 2px 8px; border-radius: 12px; font-size: 12px;">{}</span>',
                color_style, obj.badge_text
            )
        return format_html('<span style="color: #9ca3af; font-size: 12px;">No badge</span>')
    badge_display.short_description = 'Badge'
    
    def featured_badge(self, obj):
        if obj.is_featured:
            return format_html(
                '<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px;">⭐ Featured</span>'
            )
        return format_html(
            '<span style="background: #f3f4f6; color: #1f2937; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Regular</span>'
        )
    featured_badge.short_description = 'Featured'
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 12px;">● Active</span>'
            )
        return format_html(
            '<span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-size: 12px;">● Inactive</span>'
        )
    colored_status.short_description = 'Status'

@admin.register(HeroBanner)
class HeroBannerAdmin(ImportExportModelAdmin):
    list_display = ['title', 'order', 'autoplay_duration', 'colored_status', 'enhanced_image_preview', 'created_at']
    list_filter = [
        'is_active', 
        'created_at',
        'autoplay_duration'
    ]
    search_fields = ['title', 'subtitle', 'description']
    list_editable = ['order', 'autoplay_duration']
    ordering = ['order', '-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'enhanced_image_preview']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle', 'description'),
            'description': 'Create compelling hero content that captures attention'
        }),
        ('Visual Content', {
            'fields': ('image', 'image_url', 'enhanced_image_preview'),
            'description': 'High-quality hero image (recommended: 1920x600px)'
        }),
        ('Call to Action', {
            'fields': ('button_text', 'button_url'),
            'description': 'Primary action button configuration'
        }),
        ('Display Settings', {
            'fields': ('order', 'autoplay_duration', 'is_active'),
            'description': 'Control banner order and timing'
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'System-generated information'
        })
    )
    
    def enhanced_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="flex items-center space-x-3">'
                '<img src="{}" class="w-20 h-12 object-cover rounded-lg shadow-sm border border-gray-200" />'
                '<div class="flex flex-col">'
                '<span class="text-sm font-medium text-gray-900">Uploaded File</span>'
                '<span class="text-xs text-gray-500">📁 Local Image</span>'
                '</div>'
                '</div>', 
                obj.image.url
            )
        elif obj.image_url:
            return format_html(
                '<div class="flex items-center space-x-3">'
                '<img src="{}" class="w-20 h-12 object-cover rounded-lg shadow-sm border border-gray-200" />'
                '<div class="flex flex-col">'
                '<span class="text-sm font-medium text-gray-900">External URL</span>'
                '<span class="text-xs text-gray-500">🌐 Remote Image</span>'
                '</div>'
                '</div>', 
                obj.image_url
            )
        return format_html(
            '<div class="flex items-center justify-center w-20 h-12 bg-gray-100 rounded-lg border border-gray-200">'
            '<span class="text-gray-400 text-xs">No Image</span>'
            '</div>'
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Active'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Inactive'
            '</span>'
        )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

@admin.register(OfferBanner)
class OfferBannerAdmin(ImportExportModelAdmin):
    list_display = ['title', 'banner_type_badge', 'discount_tag', 'coupon_code', 'order', 'colored_status', 'enhanced_image_preview']
    list_filter = [
        'banner_type', 
        'is_active', 
        'show_on_mobile', 
        'show_on_desktop',
        'created_at',
        'order'
    ]
    search_fields = ['title', 'description', 'coupon_code', 'button_text']
    list_editable = ['order']
    ordering = ['banner_type', 'order']
    readonly_fields = ['id', 'created_at', 'updated_at', 'enhanced_image_preview']
    
    
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'subtitle', 'description', 'banner_type'),
            'description': 'Basic banner information and content'
        }),
        ('Visual Design', {
            'fields': ('image', 'image_url', 'alt_text', 'gradient_colors', 'enhanced_image_preview'),
            'description': 'Visual content and styling options'
        }),
        ('Promotional Content', {
            'fields': ('discount_text', 'coupon_code', 'button_text', 'button_url'),
            'description': 'Offer details and call-to-action'
        }),
        ('Display Options', {
            'fields': ('order', 'show_on_mobile', 'show_on_desktop', 'is_active'),
            'description': 'Control banner visibility and placement'
        }),
        ('SEO & Metadata', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',),
            'description': 'Search engine optimization'
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'System-generated information'
        })
    )
    
    def banner_type_badge(self, obj):
        colors = {
            'main': 'bg-blue-100 text-blue-800',
            'vertical': 'bg-purple-100 text-purple-800',
            'horizontal': 'bg-green-100 text-green-800'
        }
        color = colors.get(obj.banner_type, 'bg-gray-100 text-gray-800')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {}">{}</span>',
            color, obj.get_banner_type_display()
        )
    
    def discount_tag(self, obj):
        if obj.discount_text:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">'
                '🏷️ {}</span>',
                obj.discount_text
            )
        return '—'
    
    def enhanced_image_preview(self, obj):
        if obj.image:
            try:
                return format_html(
                    '<div class="flex items-center space-x-2">'
                    '<img src="{}" class="w-16 h-10 object-cover rounded shadow-sm border" />'
                    '<span class="text-xs text-gray-500">📁</span>'
                    '</div>', 
                    obj.image.url
                )
            except (ValueError, AttributeError):
                return format_html(
                    '<div class="flex items-center justify-center w-16 h-10 bg-red-100 rounded border">'
                    '<span class="text-red-400 text-xs">❌</span>'
                    '</div>'
                )
        elif obj.image_url:
            return format_html(
                '<div class="flex items-center space-x-2">'
                '<img src="{}" class="w-16 h-10 object-cover rounded shadow-sm border" />'
                '<span class="text-xs text-gray-500">🌐</span>'
                '</div>', 
                obj.image_url
            )
        return format_html(
            '<div class="flex items-center justify-center w-16 h-10 bg-gray-100 rounded border">'
            '<span class="text-gray-400 text-xs">📷</span>'
            '</div>'
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Live'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Draft'
            '</span>'
        )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

@admin.register(HorizontalPromoBanner)
class HorizontalPromoBannerAdmin(ImportExportModelAdmin):
    list_display = ['title', 'button_text', 'order', 'colored_status', 'enhanced_image_preview', 'created_at']
    list_filter = [
        'is_active', 
        'created_at',
        'order'
    ]
    search_fields = ['title', 'subtitle', 'button_text']
    list_editable = ['order']
    ordering = ['order', '-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'enhanced_image_preview']
    
    
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle'),
            'description': 'Main promotional banner content'
        }),
        ('Visual Content', {
            'fields': ('image', 'image_url', 'overlay_colors', 'enhanced_image_preview'),
            'description': 'Banner image and visual effects'
        }),
        ('Call to Action', {
            'fields': ('button_text', 'button_url'),
            'description': 'Configure button text and destination'
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active'),
            'description': 'Control banner ordering and visibility'
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'System-generated information'
        })
    )
    
    def enhanced_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="flex items-center space-x-3">'
                '<img src="{}" class="w-24 h-14 object-cover rounded-lg shadow-sm border border-gray-200" />'
                '<div class="flex flex-col">'
                '<span class="text-sm font-medium text-gray-900">Uploaded</span>'
                '<span class="text-xs text-gray-500">📁 Local File</span>'
                '</div>'
                '</div>', 
                obj.image.url
            )
        elif obj.image_url:
            return format_html(
                '<div class="flex items-center space-x-3">'
                '<img src="{}" class="w-24 h-14 object-cover rounded-lg shadow-sm border border-gray-200" />'
                '<div class="flex flex-col">'
                '<span class="text-sm font-medium text-gray-900">External</span>'
                '<span class="text-xs text-gray-500">🌐 Remote URL</span>'
                '</div>'
                '</div>', 
                obj.image_url
            )
        return format_html(
            '<div class="flex items-center justify-center w-24 h-14 bg-gray-100 rounded-lg border border-gray-200">'
            '<span class="text-gray-400 text-xs">No Image</span>'
            '</div>'
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Active'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Inactive'
            '</span>'
        )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
@admin.register(BlogPost)
class BlogPostAdmin(ImportExportModelAdmin):
    list_display = ['title', 'slug', 'publish_date', 'featured_badge', 'order', 'colored_status', 'enhanced_image_preview']
    list_filter = [
        'is_featured', 
        'is_active', 
        'publish_date',
        'order'
    ]
    search_fields = ['title', 'description', 'slug']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-is_featured', 'order', '-publish_date']
    
    
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description'),
            'description': 'Basic blog post information'
        }),
        ('Content', {
            'fields': ('content',),
            'description': 'Main blog post content'
        }),
        ('Featured Image', {
            'fields': ('featured_image', 'featured_image_url', 'enhanced_image_preview'),
            'description': 'Blog post featured image'
        }),
        ('Publication', {
            'fields': ('is_featured', 'order', 'is_active'),
            'description': 'Publication settings'
        }),
    )
    
    def featured_badge(self, obj):
        if obj.is_featured:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⭐ Featured</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Regular</span>'
        )
    
    def enhanced_image_preview(self, obj):
        if obj.featured_image:
            return format_html(
                '<img src="{}" class="w-16 h-10 object-cover rounded shadow-sm border" />', 
                obj.featured_image.url
            )
        elif obj.featured_image_url:
            return format_html(
                '<img src="{}" class="w-16 h-10 object-cover rounded shadow-sm border" />', 
                obj.featured_image_url
            )
        return format_html(
            '<div class="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center">'
            '<span class="text-gray-400 text-xs">📷</span>'
            '</div>'
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Published'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Draft'
            '</span>'
        )

class FooterLinkInline(admin.TabularInline):
    model = FooterLink
    extra = 0
    fields = ['text', 'url', 'icon_class', 'order', 'open_in_new_tab', 'is_active']

@admin.register(FooterSection)
class FooterSectionAdmin(ImportExportModelAdmin):
    list_display = ['title', 'section_type_badge', 'order', 'colored_status', 'link_count']
    list_filter = [
        'section_type', 
        'is_active',
        'order'
    ]
    search_fields = ['title']
    list_editable = ['order']
    ordering = ['section_type', 'order']
    inlines = [FooterLinkInline]
    
    
    fieldsets = (
        ('Section Information', {
            'fields': ('title', 'section_type', 'order'),
            'description': 'Footer section configuration'
        }),
        ('Settings', {
            'fields': ('is_active',),
            'description': 'Section visibility settings'
        }),
    )
    
    def section_type_badge(self, obj):
        colors = {
            'links': 'bg-blue-100 text-blue-800',
            'social': 'bg-purple-100 text-purple-800',
            'contact': 'bg-green-100 text-green-800',
            'legal': 'bg-gray-100 text-gray-800'
        }
        color = colors.get(obj.section_type, 'bg-gray-100 text-gray-800')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {}">{}</span>',
            color, obj.get_section_type_display()
        )
    
    def link_count(self, obj):
        count = obj.links.filter(is_active=True).count()
        total = obj.links.count()
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">'
            '🔗 {}/{} active'
            '</span>', 
            count, total
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Active'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Inactive'
            '</span>'
        )

@admin.register(FooterLink)
class FooterLinkAdmin(ImportExportModelAdmin):
    list_display = ['text', 'section', 'url_preview', 'order', 'link_type_badge', 'colored_status']
    list_filter = [
        'section__section_type', 
        'open_in_new_tab', 
        'is_active',
        'order'
    ]
    search_fields = ['text', 'url']
    list_editable = ['order']
    ordering = ['section', 'order']
    
    
    fieldsets = (
        ('Link Information', {
            'fields': ('section', 'text', 'url'),
            'description': 'Link basic information'
        }),
        ('Appearance', {
            'fields': ('icon_class', 'order'),
            'description': 'Visual and ordering settings'
        }),
        ('Behavior', {
            'fields': ('open_in_new_tab', 'is_active'),
            'description': 'Link behavior settings'
        }),
    )
    
    def url_preview(self, obj):
        if len(obj.url) > 30:
            return format_html(
                '<span class="text-blue-600 hover:text-blue-800" title="{}">{}</span>',
                obj.url, f"{obj.url[:30]}..."
            )
        return format_html(
            '<span class="text-blue-600 hover:text-blue-800">{}</span>',
            obj.url
        )
    
    def link_type_badge(self, obj):
        if obj.open_in_new_tab:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">'
                '🔗 External'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">'
            '🏠 Internal'
            '</span>'
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Active'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Inactive'
            '</span>'
        )

@admin.register(SocialMediaLink)
class SocialMediaLinkAdmin(ImportExportModelAdmin):
    list_display = ['platform_badge', 'url_preview', 'order', 'colored_status']
    list_filter = [
        'platform', 
        'is_active',
        'order'
    ]
    search_fields = ['platform', 'url']
    list_editable = ['order']
    ordering = ['order', 'platform']
    
    
    fieldsets = (
        ('Platform Information', {
            'fields': ('platform', 'url', 'icon_class'),
            'description': 'Social media platform information'
        }),
        ('Settings', {
            'fields': ('order', 'is_active'),
            'description': 'Display and ordering settings'
        }),
    )
    
    def platform_badge(self, obj):
        icons = {
            'facebook': '📘',
            'twitter': '🐦', 
            'instagram': '📷',
            'linkedin': '💼',
            'youtube': '📺',
            'tiktok': '🎵',
            'pinterest': '📌'
        }
        icon = icons.get(obj.platform.lower(), '🌐')
        colors = {
            'facebook': 'bg-blue-100 text-blue-800',
            'twitter': 'bg-sky-100 text-sky-800',
            'instagram': 'bg-pink-100 text-pink-800',
            'linkedin': 'bg-indigo-100 text-indigo-800',
            'youtube': 'bg-red-100 text-red-800',
            'tiktok': 'bg-gray-100 text-gray-800',
            'pinterest': 'bg-red-100 text-red-800'
        }
        color = colors.get(obj.platform.lower(), 'bg-gray-100 text-gray-800')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {}">'
            '{} {}'
            '</span>',
            color, icon, obj.platform.title()
        )
    
    def url_preview(self, obj):
        return format_html(
            '<a href="{}" target="_blank" class="text-blue-600 hover:text-blue-800 underline" title="{}">'
            '🔗 Open Link'
            '</a>',
            obj.url, obj.url
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Active'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Inactive'
            '</span>'
        )

@admin.register(SiteSettings)
class SiteSettingsAdmin(ImportExportModelAdmin):
    list_display = ['key', 'setting_type_badge', 'group_badge', 'value_preview', 'colored_status']
    list_filter = [
        'setting_type', 
        'group', 
        'is_active'
    ]
    search_fields = ['key', 'value', 'description']
    list_editable = []
    ordering = ['group', 'key']
    
    
    
    fieldsets = (
        ('Setting Information', {
            'fields': ('key', 'setting_type', 'group'),
            'description': 'Basic setting configuration'
        }),
        ('Value', {
            'fields': ('value',),
            'description': 'Setting value'
        }),
        ('Meta', {
            'fields': ('description', 'is_active'),
            'description': 'Additional information'
        }),
    )
    
    def setting_type_badge(self, obj):
        colors = {
            'text': 'bg-blue-100 text-blue-800',
            'number': 'bg-green-100 text-green-800',
            'boolean': 'bg-purple-100 text-purple-800',
            'json': 'bg-yellow-100 text-yellow-800',
            'url': 'bg-pink-100 text-pink-800'
        }
        icons = {
            'text': '📝',
            'number': '🔢',
            'boolean': '✅',
            'json': '📄',
            'url': '🔗'
        }
        color = colors.get(obj.setting_type, 'bg-gray-100 text-gray-800')
        icon = icons.get(obj.setting_type, '⚙️')
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {}">'
            '{} {}'
            '</span>',
            color, icon, obj.setting_type.title()
        )
    
    def group_badge(self, obj):
        if obj.group:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">'
                '📁 {}'
                '</span>',
                obj.group
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">'
            'No Group'
            '</span>'
        )
    
    def value_preview(self, obj):
        if len(obj.value) > 50:
            return format_html(
                '<span class="text-gray-700" title="{}">{}<span class="text-gray-400">...</span></span>',
                obj.value, obj.value[:50]
            )
        return format_html(
            '<span class="text-gray-700">{}</span>',
            obj.value
        )
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">'
                '<span class="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>Active'
                '</span>'
            )
        return format_html(
            '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">'
            '<span class="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>Inactive'
            '</span>'
        )

# Admin site customization for Unfold theme
admin.site.site_header = "🛒 iCommerce Website Management"
admin.site.site_title = "iCommerce Admin"
admin.site.index_title = "Welcome to iCommerce Website Management"
