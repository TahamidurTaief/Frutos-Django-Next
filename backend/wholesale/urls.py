# wholesale/urls.py
from django.urls import path
from .views import (
    WholesaleRegisterView,
    WholesaleLoginView,
    WholesaleTokenRefreshView,
    WholesaleProfileView,
    WholesaleProfileImageView,
    ChangePasswordView,
    WholesaleNotificationListView,
    WholesaleNotificationUnreadCountView,
    WholesaleMarkNotificationsReadView,
    WholesaleNotificationDeleteView,  
    WholesaleStatusView,
    WholesaleSendPasswordResetOTPView,
    WholesaleVerifyOTPAndResetPasswordView,
    wholesale_benefits,
    wholesale_categories,
    wholesale_guarantee,
    wholesale_hero,
    wholesale_page_content,
    wholesale_stats,
    wholesale_steps,
)

app_name = 'wholesale'

urlpatterns = [
    # ─── Auth ────────────────────────────────────────────────
    path('auth/register/',        WholesaleRegisterView.as_view(),       name='register'),
    path('auth/login/',           WholesaleLoginView.as_view(),          name='login'),
    path('auth/refresh/',         WholesaleTokenRefreshView.as_view(),   name='token-refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(),          name='change-password'),

    # ─── Profile ──────────────────────────────────────────────
    path('profile/',       WholesaleProfileView.as_view(),      name='profile'),
    path('profile/image/', WholesaleProfileImageView.as_view(), name='wholesale-profile-image'),

    # ─── Notifications ────────────────────────────────────────
    path('notifications/',               WholesaleNotificationListView.as_view(),        name='notifications'),
    path('notifications/unread-count/',  WholesaleNotificationUnreadCountView.as_view(), name='notifications-count'),
    path('notifications/mark-read/',     WholesaleMarkNotificationsReadView.as_view(),   name='notifications-mark-read'),
    path('notifications/<int:pk>/delete/', WholesaleNotificationDeleteView.as_view(),    name='notification-delete'),  # ✅ নতুন

    # ─── Misc ─────────────────────────────────────────────────
    path('status/', WholesaleStatusView.as_view(), name='status'),

    # ─── Password Reset ───────────────────────────────────────
    path('auth/password-reset/send-otp/', WholesaleSendPasswordResetOTPView.as_view(),      name='ws-password-reset-send'),
    path('auth/password-reset/verify/',   WholesaleVerifyOTPAndResetPasswordView.as_view(), name='ws-password-reset-verify'),


     # Single combined endpoint — Next.js server component uses this
    path("content/",    wholesale_page_content, name="page-content"),
 
    # Individual section endpoints (useful for partial refreshes / ISR tags)
    path("hero/",       wholesale_hero,         name="hero"),
    path("stats/",      wholesale_stats,        name="stats"),
    path("benefits/",   wholesale_benefits,     name="benefits"),
    path("categories/", wholesale_categories,   name="categories"),
    path("steps/",      wholesale_steps,        name="steps"),
    path("guarantee/",  wholesale_guarantee,    name="guarantee"),
]