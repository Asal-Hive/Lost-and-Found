from rest_framework import serializers
from .models import Item, ItemReport
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
