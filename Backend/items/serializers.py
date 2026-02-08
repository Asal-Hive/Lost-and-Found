from rest_framework import serializers
from .models import Item, ItemReport, Comment, CommentReport, Notification
from django.contrib.auth import get_user_model

User = get_user_model()


class ItemSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'image', 'status', 'categories',
            'latitude', 'longitude', 'location_name',
            'owner', 'owner_email', 'owner_name',
            'created_at', 'updated_at', 'report_count', 'is_active'
        ]
        read_only_fields = ['id', 'owner', 'owner_email', 'owner_name', 'created_at', 'updated_at', 'report_count', 'is_active']
    
    def validate_categories(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError('At least one category must be selected.')
        
        valid_categories = [choice[0] for choice in Item.Category.choices]
        for cat in value:
            if cat not in valid_categories:
                raise serializers.ValidationError(f'Invalid category: {cat}')
        
        return value
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ItemListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    
    class Meta:
        model = Item
        fields = [
            'id', 'title', 'image', 'status', 'categories',
            'latitude', 'longitude', 'location_name',
            'owner_email',
            'created_at', 'is_active'
        ]


class ItemReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    
    class Meta:
        model = ItemReport
        fields = ['id', 'item', 'reporter', 'reporter_email', 'reason', 'description', 'created_at']
        read_only_fields = ['id', 'reporter', 'reporter_email', 'created_at']
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        # Check if user already reported this item
        item = data.get('item')
        user = self.context['request'].user
        if ItemReport.objects.filter(item=item, reporter=user).exists():
            raise serializers.ValidationError('شما قبلاً این آیتم را گزارش کرده‌اید.')
        return data


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments with nested replies"""
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    replies_count = serializers.IntegerField(source='replies.count', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'item', 'author', 'author_email', 'author_name',
            'parent', 'content', 'created_at', 'updated_at',
            'report_count', 'is_active', 'replies_count', 'replies'
        ]
        read_only_fields = [
            'id', 'author', 'author_email', 'author_name',
            'created_at', 'updated_at', 'report_count', 'is_active',
            'replies_count', 'replies'
        ]
    
    def get_replies(self, obj):
        """Get active replies to this comment (without nested replies to avoid recursion)"""
        replies = obj.replies.filter(is_active=True).order_by('created_at')
        # Use a simpler serializer for replies to avoid infinite recursion
        return [
            {
                'id': reply.id,
                'item': reply.item.id,
                'author': reply.author.id,
                'author_email': reply.author.email,
                'author_name': reply.author.username,
                'parent': reply.parent.id if reply.parent else None,
                'content': reply.content,
                'created_at': reply.created_at.isoformat(),
                'updated_at': reply.updated_at.isoformat(),
                'report_count': reply.report_count,
                'is_active': reply.is_active,
                'replies_count': 0,
                'replies': []  # Replies don't have nested replies
            }
            for reply in replies
        ]


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments (without nested replies)"""
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'item', 'author', 'author_email', 'author_name',
            'parent', 'content', 'created_at', 'updated_at',
            'report_count', 'is_active'
        ]
        read_only_fields = [
            'id', 'author', 'author_email', 'author_name',
            'created_at', 'updated_at', 'report_count', 'is_active'
        ]
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        # If parent is set, verify it belongs to the same item
        parent = data.get('parent')
        item = data.get('item')
        if parent and parent.item != item:
            raise serializers.ValidationError('پاسخ باید به کامنت همان آیتم باشد.')
        return data


class CommentReportSerializer(serializers.ModelSerializer):
    """Serializer for comment reports"""
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    
    class Meta:
        model = CommentReport
        fields = ['id', 'comment', 'reporter', 'reporter_email', 'reason', 'description', 'created_at']
        read_only_fields = ['id', 'comment', 'reporter', 'reporter_email', 'created_at']
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        # Get comment from context (set by view) or from data
        comment = self.context.get('comment') or data.get('comment')
        if not comment:
            raise serializers.ValidationError({'comment': 'این فیلد الزامی است.'})
        
        user = self.context['request'].user
        if CommentReport.objects.filter(comment=comment, reporter=user).exists():
            raise serializers.ValidationError('شما قبلاً این کامنت را گزارش کرده‌اید.')
        # Don't allow users to report their own comments
        if comment.author == user:
            raise serializers.ValidationError('نمی‌توانید کامنت خود را گزارش کنید.')
        return data
class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    item_title = serializers.CharField(source='item.title', read_only=True)
    comment_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'sender', 'sender_email', 'sender_name',
            'item', 'item_title', 'comment', 'notification_type',
            'message', 'is_read', 'created_at', 'comment_preview'
        ]
        read_only_fields = [
            'id', 'recipient', 'sender', 'sender_email', 'sender_name',
            'item', 'item_title', 'comment', 'notification_type',
            'message', 'created_at', 'comment_preview'
        ]
    
    def get_comment_preview(self, obj):
        if obj.comment and obj.comment.content:
            preview = obj.comment.content[:50]
            if len(obj.comment.content) > 50:
                preview += "..."
            return preview
        return None