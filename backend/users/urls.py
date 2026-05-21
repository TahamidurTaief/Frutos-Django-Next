# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    RegisterView,
    RegisterAPIView,
    WholesalerRegistrationAPIView,
    UserProfileView,
    change_password_view,
    AdminUserListView,
    AdminUserDetailView,
    login_view,
    user_profile_view,
    admin_dashboard,
    seller_dashboard,
    customer_dashboard,
    seller_or_admin_view,
    marketplace_view,
    # Vendor views
    VendorRegistrationAPIView,
    VendorProfileView,
    vendor_list_public,
    vendor_detail_public,
    vendor_dashboard_stats,
    vendor_orders_list,
    vendor_order_update_status,
    vendor_order_create,
    vendor_products_list,
    vendor_product_detail,
    VendorTicketListCreateView,
    VendorTicketDetailView,
    admin_vendor_list,
    admin_vendor_approve,
    vendor_shops_list,
    vendor_shop_detail,
    # Notifications
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
)
from .password_reset_views import (
    send_password_reset_otp,
    verify_password_reset_otp,
)
from products.views import WishlistListCreateView, WishlistItemDeleteView, WishlistClearView

urlpatterns = [
    # JWT Authentication endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Custom authentication endpoints
    path('login/', login_view, name='login'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('register-simple/', RegisterView.as_view(), name='register_simple'),
    path('register/wholesaler/', WholesalerRegistrationAPIView.as_view(), name='wholesaler-register'),
    path('register/vendor/', VendorRegistrationAPIView.as_view(), name='vendor-register'),
    
    # Password reset endpoints
    path('password-reset/send-otp/', send_password_reset_otp, name='password-reset-send-otp'),
    path('password-reset/verify/', verify_password_reset_otp, name='password-reset-verify'),

    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/<int:pk>/', UserProfileView.as_view(), name='user_profile_by_id'),
    path('me/', user_profile_view, name='current_user'),
    path('change-password/', change_password_view, name='change_password'),
    
    # Permission-based dashboard endpoints
    path('dashboard/admin/', admin_dashboard, name='admin_dashboard'),
    path('dashboard/seller/', seller_dashboard, name='seller_dashboard'),
    path('dashboard/customer/', customer_dashboard, name='customer_dashboard'),
    
    # Multi-role endpoints
    path('dashboard/seller-admin/', seller_or_admin_view, name='seller_admin_view'),
    path('marketplace/', marketplace_view, name='marketplace_view'),
    
    # Admin management endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),

    # ── Vendor endpoints ──────────────────────────────────────────────────
    # Vendor profile (own)
    path('vendor/profile/', VendorProfileView.as_view(), name='vendor-profile'),
    # Public vendor list / detail
    path('vendors/', vendor_list_public, name='vendor-list'),
    path('vendors/<int:pk>/', vendor_detail_public, name='vendor-detail'),
    # Vendor dashboard API
    path('vendor/dashboard/stats/', vendor_dashboard_stats, name='vendor-dashboard-stats'),
    path('vendor/orders/', vendor_orders_list, name='vendor-orders'),
    path('vendor/orders/<int:pk>/status/', vendor_order_update_status, name='vendor-order-status'),
    path('vendor/orders/create/', vendor_order_create, name='vendor-order-create'),
    path('vendor/products/', vendor_products_list, name='vendor-products'),
    path('vendor/products/<uuid:pk>/', vendor_product_detail, name='vendor-product-detail'),
    # Vendor shops
    path('vendor/shops/', vendor_shops_list, name='vendor-shops'),
    path('vendor/shops/<int:pk>/', vendor_shop_detail, name='vendor-shop-detail'),
    # Vendor tickets
    path('vendor/tickets/', VendorTicketListCreateView.as_view(), name='vendor-tickets'),
    path('vendor/tickets/<int:pk>/', VendorTicketDetailView.as_view(), name='vendor-ticket-detail'),
    # Admin vendor management
    path('admin/vendors/', admin_vendor_list, name='admin-vendor-list'),
    path('admin/vendors/<int:pk>/approve/', admin_vendor_approve, name='admin-vendor-approve'),

    # Notifications (admin-only)
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('notifications/mark-read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    # Wishlist endpoints (user-scoped)
    path('wishlist/', WishlistListCreateView.as_view(), name='wishlist-list-create'),
    path('wishlist/<int:pk>/', WishlistItemDeleteView.as_view(), name='wishlist-item-delete'),
    path('wishlist/clear/', WishlistClearView.as_view(), name='wishlist-clear'),
]
