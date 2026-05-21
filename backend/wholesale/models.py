# wholesale/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid


class WholesaleUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)
        return self.create_user(email, password, **extra_fields)


class BusinessType(models.TextChoices):
    RESTAURANT = 'restaurant', 'Restaurant / Bistro'
    HOTEL = 'hotel', 'Hotel / Resort'
    CATERING = 'catering', 'Catering Company'
    FOOD_RETAIL = 'food_retail', 'Food Retail / Grocery'
    DARK_KITCHEN = 'dark_kitchen', 'Dark Kitchen'
    CAFE = 'cafe', 'Café / Bakery'
    OTHER = 'other', 'Other'


class MonthlyVolume(models.TextChoices):
    LOW = '400_1000', '€400 – €1,000 / month'
    MED = '1000_3000', '€1,000 – €3,000 / month'
    HIGH = '3000_7000', '€3,000 – €7,000 / month'
    VERY_HIGH = '7000_plus', '€7,000+ / month'


class ApplicationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Review'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'
    SUSPENDED = 'suspended', 'Suspended'


class WholesaleUser(AbstractBaseUser, PermissionsMixin):
    # Override PermissionsMixin fields to avoid reverse accessor clash with auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        blank=True,
        related_name='wholesale_users',
        related_query_name='wholesale_user',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='wholesale_users',
        related_query_name='wholesale_user',
        verbose_name='user permissions',
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)

    # Business info
    business_name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200)
    trade_license_number = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True)
    postcode = models.CharField(max_length=20, blank=True)
    business_type = models.CharField(
        max_length=50,
        choices=BusinessType.choices,
        default=BusinessType.OTHER
    )
    monthly_volume = models.CharField(
        max_length=50,
        choices=MonthlyVolume.choices,
        default=MonthlyVolume.LOW
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING,
        db_index=True
    )

    # Django auth fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Timestamps
    applied_at = models.DateTimeField(default=timezone.now)
    approved_at = models.DateTimeField(null=True, blank=True)

    # Account manager
    account_manager_name = models.CharField(max_length=200, blank=True)
    account_manager_email = models.EmailField(blank=True)

    # Admin notes
    admin_notes = models.TextField(blank=True)

    # Aggregate stats (updated on order)
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    profile_image = models.ImageField(
        upload_to='wholesale/avatars/',
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['business_name', 'contact_name', 'trade_license_number']

    objects = WholesaleUserManager()

    class Meta:
        verbose_name = 'Wholesale User'
        verbose_name_plural = 'Wholesale Users'
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.business_name} <{self.email}>"

    @property
    def is_approved(self):
        return self.status == ApplicationStatus.APPROVED

    @property
    def display_business_type(self):
        return dict(BusinessType.choices).get(self.business_type, self.business_type)

    @property
    def display_volume(self):
        return dict(MonthlyVolume.choices).get(self.monthly_volume, self.monthly_volume)


class WholesaleDocument(models.Model):
    """Optional business documents uploaded by wholesale users."""
    user = models.ForeignKey(
        WholesaleUser, on_delete=models.CASCADE, related_name='documents'
    )
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to='wholesale/documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.business_name} - {self.name}"


class WholesaleNotification(models.Model):
    """Simple notification system for wholesale users."""
    class Type(models.TextChoices):
        APPLICATION = 'application', 'Application Update'
        ORDER = 'order', 'Order Update'
        PRICING = 'pricing', 'Pricing Update'
        GENERAL = 'general', 'General'

    user = models.ForeignKey(
        WholesaleUser, on_delete=models.CASCADE, related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.GENERAL)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.business_name} - {self.title}"




# wholesale content
"""
wholesale/models.py

Content models for the public-facing Wholesale landing page.
Auth / account models (WholesaleAccount, etc.) should stay below — untouched.
"""

from django.db import models


# ─────────────────────────────────────────────────────────────────────────────
# HERO
# ─────────────────────────────────────────────────────────────────────────────

class WholesaleHeroContent(models.Model):
    """
    Singleton-style model.  Only the row where is_active=True is served.
    Stores all copy and the hero image for the top of the Wholesale page.
    """
    headline = models.CharField(
        max_length=200,
        default="Premium produce,",
        help_text="First line of the H1 heading, e.g. 'Premium produce,'",
    )
    headline_em = models.CharField(
        max_length=200,
        default="built for your business.",
        help_text="Second (italic / coloured) line of the H1, e.g. 'built for your business.'",
    )
    subtitle = models.TextField(
        default="El Árbol supplies restaurants, hotels, caterers, and retailers across Spain with directly sourced produce — harvested to order, delivered within 48 hours.",
        help_text="Paragraph beneath the headline (1-2 sentences).",
    )
    trust_text = models.CharField(
        max_length=300,
        default="Trusted by 200+ food businesses · Minimum order from €400/month",
        help_text="Small muted line below the subtitle, e.g. trust signals or minimum order info.",
    )
    hero_image = models.ImageField(
        upload_to="wholesale/hero/",
        help_text="Main hero image displayed on the right side of the section. Recommended: 1200×900px.",
    )

    # Top-right floating badge (e.g. "48h DELIVERY")
    badge_stat = models.CharField(
        max_length=20,
        default="48h",
        help_text="Large value shown in the top-right image badge, e.g. '48h'.",
    )
    badge_label = models.CharField(
        max_length=50,
        default="DELIVERY",
        help_text="Small label under the badge stat, e.g. 'DELIVERY'.",
    )

    # Bottom overlay card
    bottom_badge_title = models.CharField(
        max_length=100,
        default="Harvested to order",
        help_text="Bold title in the bottom-left image overlay card.",
    )
    bottom_badge_subtitle = models.CharField(
        max_length=200,
        default="From 40+ certified farms across Spain",
        help_text="Muted subtitle in the bottom-left image overlay card.",
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Only ONE hero should be active at a time. The first active row is served.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hero Content"
        verbose_name_plural = "Hero Content"

    def __str__(self):
        return f"Wholesale Hero — {self.headline}"


class WholesaleTrustBadge(models.Model):
    """
    Pills shown in the 'Serving' strip at the bottom of the Hero section,
    e.g. 'Fine Dining', 'Hotel Groups', etc.
    """
    hero = models.ForeignKey(
        WholesaleHeroContent,
        on_delete=models.CASCADE,
        related_name="trust_badges",
        help_text="Hero row these badges belong to.",
    )
    label = models.CharField(
        max_length=80,
        help_text="Text shown inside the pill badge, e.g. 'Fine Dining'.",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order — lower numbers appear first.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Trust Badge"
        verbose_name_plural = "Trust Badges"

    def __str__(self):
        return self.label


# ─────────────────────────────────────────────────────────────────────────────
# STATS BAR
# ─────────────────────────────────────────────────────────────────────────────

class WholesaleStat(models.Model):
    """
    Key numbers shown in the dark stats bar (StatsSection),
    e.g. '200+ Business Partners'.
    """
    value = models.CharField(
        max_length=30,
        help_text="The headline number or value, e.g. '200+', '48h', '99.1%'.",
    )
    label = models.CharField(
        max_length=100,
        help_text="Short descriptive label, e.g. 'Business Partners'.",
    )
    sub = models.CharField(
        max_length=200,
        help_text="Smaller subtext beneath the label, e.g. 'Restaurants, hotels & retailers'.",
    )
    icon_svg = models.TextField(
        help_text=(
            "Raw SVG markup for the stat icon.  "
            "Include the full <svg> element.  "
            "Tip: use stroke='currentColor' so the colour is controlled by CSS."
        ),
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order — lower numbers appear first (left → right).",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Stat"
        verbose_name_plural = "Stats"

    def __str__(self):
        return f"{self.value} — {self.label}"


# ─────────────────────────────────────────────────────────────────────────────
# BENEFITS
# ─────────────────────────────────────────────────────────────────────────────

class WholesaleBenefit(models.Model):
    """
    Cards shown in the Benefits section ('Why partner with us').
    Displayed in a 3-column grid on desktop.
    """
    title = models.CharField(
        max_length=150,
        help_text="Card heading, e.g. 'Guaranteed Freshness'.",
    )
    body = models.TextField(
        help_text="1-3 sentence description displayed under the card title.",
    )
    icon_svg = models.TextField(
        help_text=(
            "Raw SVG markup for the icon inside the green rounded square.  "
            "Recommended size: 20×20.  Use stroke='#00694c' for the brand green."
        ),
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order — lower numbers appear first (left → right, top → bottom).",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Uncheck to hide this benefit card without deleting it.",
    )

    class Meta:
        ordering = ["order"]
        verbose_name = "Benefit"
        verbose_name_plural = "Benefits"

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────────────────────────────────────
# CATEGORIES
# ─────────────────────────────────────────────────────────────────────────────

class WholesaleCategory(models.Model):
    """
    Cards shown in the Product Range / Categories section.
    Each card has a coloured icon, an availability badge, and an italic items list.
    """

    BADGE_CHOICES = [
        ("Year-round", "Year-round"),
        ("Seasonal", "Seasonal"),
        ("Limited", "Limited"),
    ]

    title = models.CharField(
        max_length=150,
        help_text="Category heading, e.g. 'Fresh Vegetables'.",
    )
    items = models.TextField(
        help_text=(
            "Comma-separated example items shown in italic below the title.  "
            "e.g. 'Heirloom tomatoes, peppers, courgettes, aubergines, leafy greens'."
        ),
    )
    badge = models.CharField(
        max_length=30,
        choices=BADGE_CHOICES,
        default="Year-round",
        help_text="Availability badge shown in the top-right corner of the card.",
    )
    badge_bg_color = models.CharField(
        max_length=20,
        default="#E7F1DF",
        help_text="Badge background colour as a CSS hex value, e.g. '#E7F1DF'.",
    )
    badge_text_color = models.CharField(
        max_length=20,
        default="#00694c",
        help_text="Badge text colour as a CSS hex value, e.g. '#00694c'.",
    )
    icon_svg = models.TextField(
        help_text=(
            "Raw SVG markup for the category icon.  "
            "Recommended size: 18×18.  Match the stroke colour to the icon background theme."
        ),
    )
    icon_bg_color = models.CharField(
        max_length=20,
        default="#EDFAF2",
        help_text="Icon container background colour as a CSS hex value, e.g. '#EDFAF2'.",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order — lower numbers appear first.",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Uncheck to hide this category without deleting it.",
    )

    class Meta:
        ordering = ["order"]
        verbose_name = "Product Category"
        verbose_name_plural = "Product Categories"

    def __str__(self):
        return self.title


# ─────────────────────────────────────────────────────────────────────────────
# HOW IT WORKS — STEPS
# ─────────────────────────────────────────────────────────────────────────────

class WholesaleStep(models.Model):
    """
    Numbered steps shown in the 'How It Works' section.
    The first step (order=0) is rendered with the filled green circle style.
    """
    number = models.CharField(
        max_length=5,
        help_text="Zero-padded step number string displayed above the title, e.g. '01', '02'.",
    )
    title = models.CharField(
        max_length=150,
        help_text="Step heading, e.g. 'Submit your application'.",
    )
    body = models.TextField(
        help_text="One short sentence describing what happens in this step.",
    )
    icon_svg = models.TextField(
        help_text=(
            "Raw SVG markup for the step icon.  "
            "Recommended size: 20×20.  Use stroke='currentColor' — "
            "the frontend will control colour based on whether the step is first."
        ),
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order — the step with order=0 gets the filled green circle style.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "How It Works Step"
        verbose_name_plural = "How It Works Steps"

    def __str__(self):
        return f"Step {self.number} — {self.title}"


# ─────────────────────────────────────────────────────────────────────────────
# HOW IT WORKS — GUARANTEE BAR
# ─────────────────────────────────────────────────────────────────────────────

class WholesaleGuaranteeBar(models.Model):
    """
    The dark full-width bar shown below the steps.
    Only ONE active row is served.  Use the inline check items to customise the three tick lines.
    """
    title = models.CharField(
        max_length=200,
        default="No long-term commitment required",
        help_text="Bold title on the left side of the bar.",
    )
    subtitle = models.CharField(
        max_length=300,
        default="Rolling monthly arrangement. Upgrade or pause anytime.",
        help_text="Muted subtitle below the bar title.",
    )
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Guarantee Bar"
        verbose_name_plural = "Guarantee Bars"

    def __str__(self):
        return self.title


class WholesaleGuaranteeCheck(models.Model):
    """
    Individual ✓ items on the right side of the Guarantee Bar,
    e.g. '48h setup', 'Cancel anytime', 'No setup fee'.
    """
    bar = models.ForeignKey(
        WholesaleGuaranteeBar,
        on_delete=models.CASCADE,
        related_name="checks",
        help_text="The guarantee bar these checks belong to.",
    )
    text = models.CharField(
        max_length=80,
        help_text="Short label shown next to the green tick, e.g. 'Cancel anytime'.",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order — lower numbers appear first (left → right).",
    )

    class Meta:
        ordering = ["order"]
        verbose_name = "Guarantee Check Item"
        verbose_name_plural = "Guarantee Check Items"

    def __str__(self):
        return self.text