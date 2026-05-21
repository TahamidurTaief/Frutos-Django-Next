"""
stores/urls.py

Mount in your root urls.py:
    path('api/stores/', include('stores.urls')),
"""
from django.urls import path
from .views import StoreListView, StoreDetailView

urlpatterns = [
    path('',        StoreListView.as_view(),  name='store-list'),
    path('<slug:slug>/', StoreDetailView.as_view(), name='store-detail'),
]