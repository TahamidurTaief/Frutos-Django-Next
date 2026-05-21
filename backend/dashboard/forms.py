from django import forms
from products.models import Product, Brand, SubCategory, Color, Size, ShippingCategory
from orders.models import Order
from shops.models import Shop
from users.models import Address
from django_ckeditor_5.widgets import CKEditor5Widget
from django.db import transaction


class ProductForm(forms.ModelForm):
    """
    ModelForm for Product CRUD operations with dynamic Color/Size creation
    Uses Bootstrap 5 classes for styling with CKEditor 5 for rich text
    """
    
    description = forms.CharField(
        widget=CKEditor5Widget(config_name='default'),
        required=True,
        label='Product Description'
    )
    
    # Custom fields for adding new colors and sizes
    new_colors = forms.CharField(
        required=False,
        label='Add New Colors',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter color names separated by commas (e.g., Red, Blue, Green)',
        }),
        help_text='Enter new color names separated by commas. They will be created if they don\'t exist.'
    )
    
    new_sizes = forms.CharField(
        required=False,
        label='Add New Sizes',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter size names separated by commas (e.g., S, M, L, XL)',
        }),
        help_text='Enter new size names separated by commas. They will be created if they don\'t exist.'
    )
    
    class Meta:
        model = Product
        fields = [
            'shop', 'brand', 'name', 'sub_category', 'shipping_category',
            'description', 'price', 'discount_price', 'wholesale_price',
            'minimum_purchase', 'affiliate_commission_rate', 'stock',
            'weight', 'length', 'width', 'height',
            'thumbnail', 'colors', 'sizes', 'is_active'
        ]
        # Note: slug is auto-generated from name, so we don't include it in the form
        widgets = {
            'shop': forms.Select(attrs={'class': 'form-select form-select-sm'}),
            'brand': forms.Select(attrs={'class': 'form-select form-select-sm'}),
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter product name'}),
            'sub_category': forms.Select(attrs={'class': 'form-select form-select-sm'}),
            'shipping_category': forms.Select(attrs={'class': 'form-select form-select-sm'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'discount_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'wholesale_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'minimum_purchase': forms.NumberInput(attrs={'class': 'form-control'}),
            'affiliate_commission_rate': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'stock': forms.NumberInput(attrs={'class': 'form-control'}),
            'weight': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'length': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'width': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'height': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'thumbnail': forms.FileInput(attrs={'class': 'form-control'}),
            'colors': forms.CheckboxSelectMultiple(),
            'sizes': forms.CheckboxSelectMultiple(),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make some fields optional
        self.fields['brand'].required = False
        self.fields['shipping_category'].required = False
        self.fields['discount_price'].required = False
        self.fields['wholesale_price'].required = False
        self.fields['affiliate_commission_rate'].required = False
        self.fields['weight'].required = False
        self.fields['length'].required = False
        self.fields['width'].required = False
        self.fields['height'].required = False
        self.fields['thumbnail'].required = False
        self.fields['colors'].required = False
        self.fields['sizes'].required = False
    
    def clean_new_colors(self):
        """Parse and validate new color names"""
        new_colors = self.cleaned_data.get('new_colors', '')
        if new_colors:
            colors = [c.strip() for c in new_colors.split(',') if c.strip()]
            return colors
        return []
    
    def clean_new_sizes(self):
        """Parse and validate new size names"""
        new_sizes = self.cleaned_data.get('new_sizes', '')
        if new_sizes:
            sizes = [s.strip() for s in new_sizes.split(',') if s.strip()]
            return sizes
        return []
    
    @transaction.atomic
    def save(self, commit=True):
        """Save product and handle dynamic color/size creation"""
        instance = super().save(commit=False)
        
        if commit:
            instance.save()
            
            # Handle many-to-many fields
            # First, save the initially selected colors/sizes
            self.save_m2m()
            
            # Then handle new colors
            new_colors = self.cleaned_data.get('new_colors', [])
            if new_colors:
                for color_name in new_colors:
                    # Get or create color (prevents duplicates)
                    color, created = Color.objects.get_or_create(
                        name__iexact=color_name,
                        defaults={'name': color_name, 'hex_code': '#000000'}  # Default hex
                    )
                    instance.colors.add(color)
            
            # Handle new sizes
            new_sizes = self.cleaned_data.get('new_sizes', [])
            if new_sizes:
                for size_name in new_sizes:
                    # Get or create size (prevents duplicates)
                    size, created = Size.objects.get_or_create(
                        name__iexact=size_name,
                        defaults={'name': size_name}
                    )
                    instance.sizes.add(size)
        
        return instance


class OrderForm(forms.ModelForm):
    """
    ModelForm for Order CRUD operations
    Uses Bootstrap 5 classes for styling
    """
    
    class Meta:
        model = Order
        fields = [
            'user', 'status', 'payment_status',
            'customer_name', 'customer_email', 'customer_phone',
            'shipping_address', 'shipping_method',
            'tracking_number', 'total_amount', 'cart_subtotal'
        ]
        widgets = {
            'user': forms.Select(attrs={'class': 'form-select', 'style': 'background-color: white;'}),
            'status': forms.Select(attrs={'class': 'form-select', 'style': 'background-color: white;'}),
            'payment_status': forms.Select(attrs={'class': 'form-select', 'style': 'background-color: white;'}),
            'customer_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Customer name'}),
            'customer_email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'customer@example.com'}),
            'customer_phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Phone number'}),
            'shipping_address': forms.Select(attrs={'class': 'form-select', 'style': 'background-color: white;'}),
            'shipping_method': forms.Select(attrs={'class': 'form-select', 'style': 'background-color: white;'}),
            'tracking_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Tracking number'}),
            'total_amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'cart_subtotal': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make some fields optional
        self.fields['user'].required = False
        self.fields['shipping_address'].required = False
        self.fields['shipping_method'].required = False
        self.fields['tracking_number'].required = False
