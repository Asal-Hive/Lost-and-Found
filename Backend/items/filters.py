import django_filters
from .models import Item


class ItemFilter(django_filters.FilterSet):
    """
    Custom filter for items with support for:
    - Status filtering
    - Category filtering (JSONField contains)
    - Location name filtering
    """
    status = django_filters.ChoiceFilter(choices=Item.Status.choices)
    category = django_filters.CharFilter(method='filter_by_category', label='Category')
    location = django_filters.CharFilter(field_name='location_name', lookup_expr='icontains')
    
    class Meta:
        model = Item
        fields = ['status', 'category', 'location']
    
    def filter_by_category(self, queryset, name, value):
        """
        Filter items that contain the specified category in their categories JSONField
        For JSONField arrays, we check if the array contains the value
        Uses Python-level filtering for compatibility across all database backends
        """
        if not value:
            return queryset
        
        # Get all item IDs that have the category in their categories list
        # We need to evaluate the queryset to check the JSONField, but we can't use .only()
        # when select_related is already used. So we'll get all items and filter in Python.
        item_ids = []
        # Create a new queryset without select_related to avoid conflicts
        # We only need id and categories for filtering
        base_queryset = queryset.model.objects.filter(
            id__in=queryset.values_list('id', flat=True)
        )
        
        for item in base_queryset.only('id', 'categories'):
            try:
                if isinstance(item.categories, list) and value in item.categories:
                    item_ids.append(item.id)
            except (AttributeError, TypeError):
                # Skip items with invalid categories data
                continue
        
        # Return queryset filtered by IDs
        if item_ids:
            return queryset.filter(id__in=item_ids)
        else:
            # Return empty queryset if no matches
            return queryset.none()

