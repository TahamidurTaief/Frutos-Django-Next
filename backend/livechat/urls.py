from django.urls import path
from .views import LiveChatUsersView, LiveChatHistoryView, AdminChatConversationsView, AdminChatMessagesView

urlpatterns = [
    path('contacts/', LiveChatUsersView.as_view(), name='livechat_contacts'),
    path('history/<int:user_id>/', LiveChatHistoryView.as_view(), name='livechat_history'),
    path('admin/conversations/', AdminChatConversationsView.as_view(), name='admin_chat_conversations'),
    path('admin/messages/', AdminChatMessagesView.as_view(), name='admin_chat_messages'),
]
