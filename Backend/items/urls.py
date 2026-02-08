from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
