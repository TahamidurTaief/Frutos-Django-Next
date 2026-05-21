# shops/models.py
from django.db import models
from django.conf import settings
from utils.image_optimizer import ImageOptimizer


class Shop(models.Model):
    """
    Shop model - a vendor can own multiple shops.
    Products belong to a shop, orders are linked through products.
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='shops', db_index=True,
        help_text="Vendor who owns this shop"
    )
    name = models.CharField(max_length=255, unique=True, db_index=True)
    slug = models.SlugField(unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='shops/logos/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='shops/covers/', blank=True, null=True)
    contact_email = models.EmailField(db_index=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    division = models.CharField(max_length=50, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Is the shop currently open for business?", db_index=True)
    is_verified = models.BooleanField(default=False, help_text="Has the shop been verified by the admin?", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'is_verified'], name='shop_active_verified_idx'),
            models.Index(fields=['is_active', '-created_at'], name='shop_active_created_idx'),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            unique_slug = base_slug
            counter = 1
            while Shop.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug

        if self.logo and hasattr(self.logo, 'file'):
            try:
                optimized = ImageOptimizer.optimize_logo_image(self.logo.file)
                if optimized:
                    self.logo.file = optimized
            except Exception:
                pass

        if self.cover_photo and hasattr(self.cover_photo, 'file'):
            try:
                optimized = ImageOptimizer.optimize_banner_image(self.cover_photo.file)
                if optimized:
                    self.cover_photo.file = optimized
            except Exception:
                pass

        super().save(*args, **kwargs)
