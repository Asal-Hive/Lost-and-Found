from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from items.models import Item, Comment, ItemReport, CommentReport
from items.serializers import (
    ItemSerializer, ItemListSerializer, ItemReportSerializer,
    CommentSerializer, CommentCreateSerializer, CommentReportSerializer
)

User = get_user_model()


class ItemSerializerTest(TestCase):
    """Test cases for ItemSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        
        self.item_data = {
            'title': 'Lost Wallet',
            'description': 'Black leather wallet with ID cards',
            'status': 'lost',
            'categories': ['wallet', 'bank_card'],
            'latitude': '35.123456',
            'longitude': '51.123456',
            'location_name': 'Library'
        }
        
        self.context = {'request': type('Request', (), {'user': self.user})}
    
    def test_serializer_contains_expected_fields(self):
        """Test serializer includes all expected fields"""
        item = Item.objects.create(owner=self.user, **self.item_data)
        serializer = ItemSerializer(item)
        
        expected_fields = [
            'id', 'title', 'description', 'image', 'status', 'categories',
            'latitude', 'longitude', 'location_name', 'owner', 'owner_email',
            'owner_name', 'created_at', 'updated_at', 'report_count', 'is_active'
        ]
        
        self.assertEqual(set(serializer.data.keys()), set(expected_fields))
    
    def test_owner_fields_read_only(self):
        """Test owner-related fields are read-only"""
        serializer = ItemSerializer(data=self.item_data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        # Owner should be set from context, not from data
        self.assertNotIn('owner', serializer.validated_data)
    
    def test_validate_categories(self):
        """Test category validation"""
        # Valid categories
        data = self.item_data.copy()
        serializer = ItemSerializer(data=data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        # Empty categories
        data['categories'] = []
        serializer = ItemSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn('categories', serializer.errors)
        
        # Invalid category
        data['categories'] = ['invalid_category']
        serializer = ItemSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn('categories', serializer.errors)
    
    def test_create_sets_owner(self):
        """Test create method sets owner from context"""
        serializer = ItemSerializer(data=self.item_data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        item = serializer.save()
        self.assertEqual(item.owner, self.user)
    
    def test_serializer_output(self):
        """Test serializer output format"""
        item = Item.objects.create(owner=self.user, **self.item_data)
        serializer = ItemSerializer(item)
        
        self.assertEqual(serializer.data['id'], item.id)
        self.assertEqual(serializer.data['title'], item.title)
        self.assertEqual(serializer.data['owner_email'], self.user.email)
        self.assertEqual(serializer.data['owner_name'], self.user.username)


class ItemListSerializerTest(TestCase):
    """Test cases for ItemListSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        
        self.item = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet'],
            latitude='35.123456',
            longitude='51.123456',
            location_name='Library',
            owner=self.user
        )
    
    def test_serializer_contains_list_fields(self):
        """Test list serializer has lighter fields"""
        serializer = ItemListSerializer(self.item)
        
        expected_fields = [
            'id', 'title', 'image', 'status', 'categories',
            'latitude', 'longitude', 'location_name', 'owner_email',
            'created_at', 'is_active'
        ]
        
        self.assertEqual(set(serializer.data.keys()), set(expected_fields))
        
        # Should not include detailed fields
        self.assertNotIn('description', serializer.data)
        self.assertNotIn('report_count', serializer.data)


class ItemReportSerializerTest(TestCase):
    """Test cases for ItemReportSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        
        self.reporter = User.objects.create_user(
            username='reporter@example.com',
            email='reporter@example.com',
            password='testpass123'
        )
        
        self.item = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user
        )
        
        self.context = {'request': type('Request', (), {'user': self.reporter})}
    
    def test_serializer_contains_fields(self):
        """Test report serializer fields"""
        report = ItemReport.objects.create(
            item=self.item,
            reporter=self.reporter,
            reason='spam'
        )
        serializer = ItemReportSerializer(report)
        
        expected_fields = [
            'id', 'item', 'reporter', 'reporter_email', 'reason',
            'description', 'created_at'
        ]
        
        self.assertEqual(set(serializer.data.keys()), set(expected_fields))
    
    def test_create_sets_reporter(self):
        """Test create sets reporter from context"""
        data = {
            'item': self.item.id,
            'reason': 'spam',
            'description': 'This is spam'
        }
        serializer = ItemReportSerializer(data=data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        report = serializer.save(item=self.item)
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.item, self.item)
        self.assertEqual(report.reason, 'spam')
    
    def test_prevent_duplicate_report(self):
        """Test preventing duplicate reports"""
        ItemReport.objects.create(
            item=self.item,
            reporter=self.reporter,
            reason='spam'
        )
        
        data = {
            'item': self.item.id,
            'reason': 'spam'
        }
        serializer = ItemReportSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class CommentSerializerTest(TestCase):
    """Test cases for CommentSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        
        self.other_user = User.objects.create_user(
            username='other@example.com',
            email='other@example.com',
            password='testpass123'
        )
        
        self.item = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user
        )
        
        self.comment = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='Test comment'
        )
        
        self.reply = Comment.objects.create(
            item=self.item,
            author=self.user,
            parent=self.comment,
            content='Test reply'
        )
    
    def test_serializer_contains_fields(self):
        """Test comment serializer fields"""
        serializer = CommentSerializer(self.comment)
        
        expected_fields = [
            'id', 'item', 'author', 'author_email', 'author_name',
            'parent', 'content', 'created_at', 'updated_at',
            'report_count', 'is_active', 'replies_count', 'replies'
        ]
        
        self.assertEqual(set(serializer.data.keys()), set(expected_fields))
    
    def test_replies_serialization(self):
        """Test replies are properly serialized"""
        serializer = CommentSerializer(self.comment)
        
        self.assertEqual(serializer.data['replies_count'], 1)
        self.assertEqual(len(serializer.data['replies']), 1)
        self.assertEqual(serializer.data['replies'][0]['content'], 'Test reply')
        self.assertEqual(serializer.data['replies'][0]['author_email'], self.user.email)
    
    def test_replies_have_no_nested_replies(self):
        """Test replies don't include further nested replies"""
        # Create a reply to the reply (should not appear)
        nested_reply = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            parent=self.reply,
            content='Nested reply'
        )
        
        serializer = CommentSerializer(self.comment)
        
        # First level reply should exist
        self.assertEqual(len(serializer.data['replies']), 1)
        
        # The reply should not have its own replies
        reply_data = serializer.data['replies'][0]
        self.assertEqual(reply_data['replies_count'], 0)
        self.assertEqual(reply_data['replies'], [])
    
    def test_read_only_fields(self):
        """Test read-only fields are not writable"""
        data = {
            'content': 'New content',
            'author': self.user.id,  # Should be ignored
            'report_count': 10,  # Should be ignored
        }
        serializer = CommentSerializer(self.comment, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        
        # These fields should not be in validated_data
        self.assertNotIn('author', serializer.validated_data)
        self.assertNotIn('report_count', serializer.validated_data)


class CommentCreateSerializerTest(TestCase):
    """Test cases for CommentCreateSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        
        self.item = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user
        )
        
        self.parent_comment = Comment.objects.create(
            item=self.item,
            author=self.user,
            content='Parent comment'
        )
        
        self.context = {'request': type('Request', (), {'user': self.user})}
    
    def test_create_comment(self):
        """Test creating a comment"""
        data = {
            'item': self.item.id,
            'content': 'New comment'
        }
        serializer = CommentCreateSerializer(data=data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        comment = serializer.save()
        self.assertEqual(comment.author, self.user)
        self.assertEqual(comment.content, 'New comment')
        self.assertIsNone(comment.parent)
    
    def test_create_reply(self):
        """Test creating a reply"""
        data = {
            'item': self.item.id,
            'parent': self.parent_comment.id,
            'content': 'Reply comment'
        }
        serializer = CommentCreateSerializer(data=data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        comment = serializer.save()
        self.assertEqual(comment.parent, self.parent_comment)
        self.assertEqual(comment.content, 'Reply comment')
    
    def test_reply_must_belong_to_same_item(self):
        """Test reply must be to a comment on the same item"""
        # Create another item
        other_item = Item.objects.create(
            title='Found Keys',
            description='Keys on ground',
            status='found',
            categories=['keys'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user
        )
        
        # Comment on other item
        other_comment = Comment.objects.create(
            item=other_item,
            author=self.user,
            content='Other item comment'
        )
        
        data = {
            'item': self.item.id,
            'parent': other_comment.id,
            'content': 'This should fail'
        }
        serializer = CommentCreateSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class CommentReportSerializerTest(TestCase):
    """Test cases for CommentReportSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            password='testpass123'
        )
        
        self.reporter = User.objects.create_user(
            username='reporter@example.com',
            email='reporter@example.com',
            password='testpass123'
        )
        
        self.item = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user
        )
        
        self.comment = Comment.objects.create(
            item=self.item,
            author=self.user,
            content='Comment to report'
        )
        
        self.context = {
            'request': type('Request', (), {'user': self.reporter}),
            'comment': self.comment
        }
    
    def test_create_report(self):
        """Test creating a comment report"""
        data = {
            'reason': 'harassment',
            'description': 'This comment is harassing'
        }
        serializer = CommentReportSerializer(data=data, context=self.context)
        self.assertTrue(serializer.is_valid())
        
        report = serializer.save(comment=self.comment)
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.comment, self.comment)
        self.assertEqual(report.reason, 'harassment')
    
    def test_prevent_duplicate_report(self):
        """Test preventing duplicate reports"""
        CommentReport.objects.create(
            comment=self.comment,
            reporter=self.reporter,
            reason='spam'
        )
        
        data = {
            'reason': 'harassment'
        }
        serializer = CommentReportSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_prevent_reporting_own_comment(self):
        """Test user cannot report their own comment"""
        self.context['request'].user = self.user  # Set reporter to comment author
        
        data = {
            'reason': 'spam'
        }
        serializer = CommentReportSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)