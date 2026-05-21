"""
stores/views.py
"""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Store
from .serializers import StoreListSerializer, StoreDetailSerializer


class StoreListView(generics.ListAPIView):
    """
    GET /api/stores/
    Returns all active stores.
    Query params:
      ?feature=leftoverPack  — filter by feature key
    """
    permission_classes = [permissions.AllowAny]
    serializer_class   = StoreListSerializer

    def get_queryset(self):
        qs = (
            Store.objects
            .filter(is_active=True)
            .prefetch_related('features', 'availability', 'leftover_packs')
        )
        feature = self.request.query_params.get('feature')
        if feature:
            qs = qs.filter(features__feature=feature)
        return qs


class StoreDetailView(APIView):
    """
    GET /api/stores/<slug>/
    Returns a single store by slug.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        store = get_object_or_404(
            Store.objects.filter(is_active=True)
            .prefetch_related('features', 'availability', 'leftover_packs'),
            slug=slug,
        )
        serializer = StoreDetailSerializer(store, context={'request': request})
        return Response(serializer.data)