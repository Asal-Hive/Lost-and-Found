from django.contrib import admin
from .models import Item, ItemReport


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'get_categories', 'owner', 'location_name', 'report_count', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'location_name', 'owner__email']
    readonly_fields = ['created_at', 'updated_at', 'report_count']
    
    def get_categories(self, obj):
        return ', '.join(obj.categories) if obj.categories else '-'
    get_categories.short_description = 'Categories'


@admin.register(ItemReport)
class ItemReportAdmin(admin.ModelAdmin):
    list_display = ['item', 'reporter', 'reason', 'created_at']
    list_filter = ['reason', 'created_at']
    search_fields = ['item__title', 'reporter__email', 'description']
    readonly_fields = ['created_at']

