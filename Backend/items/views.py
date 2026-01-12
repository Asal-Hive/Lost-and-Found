from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Item, ItemReport, Comment, CommentReport
from .serializers import (
    ItemSerializer, ItemListSerializer, 
    ItemReportSerializer,
    CommentSerializer, CommentCreateSerializer,
    CommentReportSerializer
)
from .permissions import IsOwnerOrReadOnly, IsCommentAuthor
from .filters import ItemFilter


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on items
    
    - List: All users can view (no authentication required)
    - Create: Authenticated users only
    - Update/Delete: Only owner can modify
    """
    queryset = Item.objects.filter(is_active=True).select_related('owner')
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ItemFilter
    search_fields = ['title', 'description', 'location_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ItemListSerializer
        return ItemSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def report(self, request, pk=None):
        """
        Report an item
        POST /api/items/{id}/report/
        """
        item = self.get_object()
        
        if item.owner == request.user:
            return Response(
                {'error': 'نمی‌توانید آیتم خود را گزارش کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ItemReportSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(item=item)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_items(self, request):
        """
        Get current user's items
        GET /api/items/my_items/
        """
        items = self.queryset.filter(owner=request.user)
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[])
    def comments(self, request, pk=None):
        """
        Get comments for an item
        GET /api/items/{id}/comments/
        """
        item = self.get_object()
        comments = Comment.objects.filter(
            item=item,
            parent__isnull=True,  # Only top-level comments
            is_active=True
        ).select_related('author').prefetch_related('replies').order_by('-created_at')
        
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on comments
    
    - List: All users can view (no authentication required)
    - Create: Authenticated users only
    - Update/Delete: Only author can modify
    """
    queryset = Comment.objects.filter(is_active=True).select_related('author', 'item', 'parent')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['item', 'parent']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Prefetch replies for better performance
        queryset = queryset.prefetch_related('replies__author', 'replies')
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_permissions(self):
        """
        Override to allow only author to update/delete their comments
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsCommentAuthor()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def report(self, request, pk=None):
        """
        Report a comment
        POST /api/comments/{id}/report/
        """
        comment = self.get_object()
        
        if comment.author == request.user:
            return Response(
                {'error': 'نمی‌توانید کامنت خود را گزارش کنید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CommentReportSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(comment=comment)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)



