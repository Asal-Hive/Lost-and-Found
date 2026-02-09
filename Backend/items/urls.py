from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, CommentViewSet, ChatbotSearchAPIView

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('chatbot/search/', ChatbotSearchAPIView.as_view(), name='chatbot-search'),
    path('', include(router.urls)),
]
