from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Item, ItemReport
from .serializers import (
    ItemSerializer, ItemListSerializer, 
    ItemReportSerializer
)
from .permissions import IsOwnerOrReadOnly


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
    filterset_fields = ['status']
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

