# shops/serializers.py
from rest_framework import serializers
from .models import Shop

class ShopSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    logo_url = serializers.SerializerMethodField()
    cover_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'slug', 'owner', 'description', 'logo', 'logo_url',
            'cover_photo', 'cover_photo_url', 'contact_email', 'contact_phone',
            'address', 'city', 'division', 'postal_code',
            'is_active', 'is_verified', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'slug']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and hasattr(obj.logo, 'url'):
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def get_cover_photo_url(self, obj):
        request = self.context.get('request')
        if obj.cover_photo and hasattr(obj.cover_photo, 'url'):
            if request:
                return request.build_absolute_uri(obj.cover_photo.url)
            return obj.cover_photo.url
        return None