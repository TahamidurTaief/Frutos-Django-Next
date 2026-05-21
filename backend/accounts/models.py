from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


# ─── UserProfile 

class UserProfile(models.Model):
    user         = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    avatar       = models.ImageField(upload_to='avatars/', blank=True, null=True)
    avatar_url   = models.URLField(blank=True)
    phone        = models.CharField(max_length=50, blank=True)
    bio          = models.TextField(blank=True)

    # Notification preferences
    notif_order_updates  = models.BooleanField(default=True)
    notif_promotions     = models.BooleanField(default=True)
    notif_price_changes  = models.BooleanField(default=True)
    notif_leftover_packs = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'accounts'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s profile"

    @property
    def resolved_avatar(self):
        if self.avatar:
            return self.avatar.url
        return self.avatar_url or ''


# ─── Address 

class Address(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    label      = models.CharField(max_length=50, default='Home')
    street     = models.CharField(max_length=300)
    city       = models.CharField(max_length=100)
    postcode   = models.CharField(max_length=20)
    country    = models.CharField(max_length=100, default='Ireland')
    phone      = models.CharField(max_length=50, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'accounts'
        ordering  = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.label} — {self.street}, {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(
                user=self.user, is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


# ─── Notification 

class Notification(models.Model):
    TYPE_CHOICES = [
        ('order_update',  'Order Update'),
        ('promo',         'Promotional Offer'),
        ('price_change',  'Price Change'),
        ('leftover_pack', 'Leftover Pack Available'),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False, db_index=True)
    # Extra data: order_number, product_id, product_slug, etc.
    metadata   = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        app_label = 'accounts'
        ordering  = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.title}"

    @property
    def icon(self):
        return {
            'order_update':  'local_shipping',
            'promo':         'local_offer',
            'price_change':  'trending_down',
            'leftover_pack': 'inventory_2',
        }.get(self.type, 'notifications')


# Auto-create profile when a User is created
from django.apps import apps

def _setup_user_profile_signal():
    """Setup signal after apps are ready"""
    User = apps.get_model(settings.AUTH_USER_MODEL)
    post_save.disconnect(create_user_profile, sender=User)
    post_save.connect(create_user_profile, sender=User)

@receiver(post_save)
def create_user_profile(sender, instance, created, **kwargs):
    if created and sender.__name__ == 'User':
        UserProfile.objects.get_or_create(user=instance)



import uuid
from django.utils import timezone

class PasswordResetOTP(models.Model):
    email      = models.EmailField(db_index=True)
    otp        = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used    = models.BooleanField(default=False)

    class Meta:
        app_label = 'accounts'

    def is_valid(self):
        return not self.is_used and (timezone.now() - self.created_at).seconds < 600  # 10 min