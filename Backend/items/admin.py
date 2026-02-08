from django.contrib import admin
from .models import Item, ItemReport, Comment, CommentReport


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'get_categories', 'owner', 'location_name', 'report_count', 'is_active', 'created_at']
    list_filter = ['status', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'location_name', 'owner__email']
    readonly_fields = ['created_at', 'updated_at', 'report_count']
    
    def get_categories(self, obj):
        return ', '.join(obj.categories) if obj.categories else '-'
    get_categories.short_description = 'Categories'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['content', 'item', 'author', 'parent', 'report_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['content', 'item__title', 'author__email']
    readonly_fields = ['created_at', 'updated_at', 'report_count']
    raw_id_fields = ['item', 'author', 'parent']


@admin.register(CommentReport)
class CommentReportAdmin(admin.ModelAdmin):
    list_display = ['comment', 'reporter', 'reason', 'created_at']
    list_filter = ['reason', 'created_at']
    search_fields = ['comment__content', 'reporter__email', 'description']
    readonly_fields = ['created_at']
    raw_id_fields = ['comment', 'reporter']


@admin.register(ItemReport)
class ItemReportAdmin(admin.ModelAdmin):
    list_display = ['item', 'reporter', 'reason', 'created_at']
    list_filter = ['reason', 'created_at']
    search_fields = ['item__title', 'reporter__email', 'description']
    readonly_fields = ['created_at']

