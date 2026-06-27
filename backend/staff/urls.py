from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'admin/employees', views.AdminStaffViewSet, basename='admin-staff')
router.register(r'admin/shifts', views.AdminStaffShiftViewSet, basename='admin-shifts')
router.register(r'admin/tasks', views.AdminStaffTaskViewSet, basename='admin-tasks')
router.register(r'announcements', views.AnnouncementViewSet, basename='announcements')
urlpatterns = [
    # Admin APIs
    path('', include(router.urls)),
    
    # Staff APIs
    path('me/dashboard/', views.MyStaffDashboardView.as_view(), name='staff-dashboard'),
    path('me/tasks/', views.MyStaffTasksView.as_view(), name='staff-tasks-list'),
    path('me/tasks/<int:pk>/', views.MyStaffTaskUpdateView.as_view(), name='staff-task-update'),
    path('me/notifications/<int:pk>/', views.MyStaffNotificationDetailView.as_view(), name='staff-notification-detail'),
    
    # Staff Day Off Requests handled via Router
    path('me/day-off-requests/', views.MyStaffDayOffRequestViewSet.as_view({'get': 'list', 'post': 'create'}), name='staff-day-off-requests-list'),
    path('me/day-off-requests/<int:pk>/', views.MyStaffDayOffRequestViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='staff-day-off-requests-detail'),
]
