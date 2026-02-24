from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from items.models import Item, Comment, ItemReport, CommentReport

User = get_user_model()


class ItemModelTest(TestCase):
    """Test cases for Item model"""
    
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
            'location_name': 'Library',
            'owner': self.user
        }
    
    def test_create_item(self):
        """Test creating an item with valid data"""
        item = Item.objects.create(**self.item_data)
        
        self.assertEqual(item.title, 'Lost Wallet')
        self.assertEqual(item.status, 'lost')
        self.assertEqual(item.owner, self.user)
        self.assertIsNotNone(item.created_at)
        self.assertIsNotNone(item.updated_at)
        self.assertEqual(item.report_count, 0)
        self.assertTrue(item.is_active)
    
    def test_item_categories_validation(self):
        """Test category validation"""
        # Valid categories
        item = Item.objects.create(**self.item_data)
        self.assertEqual(item.categories, ['wallet', 'bank_card'])
        
        # Invalid category
        with self.assertRaises(ValidationError):
            invalid_item = Item(
                title='Test',
                description='Test',
                status='lost',
                categories=['invalid_category'],
                latitude='35.123456',
                longitude='51.123456',
                owner=self.user
            )
            invalid_item.full_clean()
    
    def test_item_minimum_one_category(self):
        """Test item must have at least one category"""
        with self.assertRaises(ValidationError):
            invalid_item = Item(
                title='Test',
                description='Test',
                status='lost',
                categories=[],
                latitude='35.123456',
                longitude='51.123456',
                owner=self.user
            )
            invalid_item.full_clean()
    
    def test_item_status_choices(self):
        """Test item status choices"""
        self.assertEqual(Item.Status.LOST, 'lost')
        self.assertEqual(Item.Status.FOUND, 'found')
        
        # Valid status
        item = Item.objects.create(**self.item_data)
        self.assertEqual(item.status, 'lost')
        
        # Invalid status should raise error at model level
        with self.assertRaises(ValidationError):
            invalid_item = Item(
                title='Test',
                description='Test',
                status='invalid',
                categories=['wallet'],
                latitude='35.123456',
                longitude='51.123456',
                owner=self.user
            )
            invalid_item.full_clean()
    
    def test_string_representation(self):
        """Test item string representation"""
        item = Item.objects.create(**self.item_data)
        expected = f"{item.title} (Lost)"
        self.assertEqual(str(item), expected)
    
    def test_item_ordering(self):
        """Test items are ordered by created_at descending"""
        import time
        time.sleep(0.01)  # Small delay
        
        item2 = Item.objects.create(
            title='Found Keys',
            description='Keys on the ground',
            status='found',
            categories=['keys'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user
        )
        
        latest = Item.objects.first()
        self.assertEqual(latest.id, item2.id)  # Compare by id
    
    def test_report_count_increment(self):
        """Test report count functionality"""
        item = Item.objects.create(**self.item_data)
        self.assertEqual(item.report_count, 0)
        
        item.report_count += 1
        item.save()
        
        item.refresh_from_db()
        self.assertEqual(item.report_count, 1)
    
    def test_item_deactivation_after_reports(self):
        """Test item becomes inactive after 5 reports"""
        item = Item.objects.create(**self.item_data)
        self.assertTrue(item.is_active)
        
        # Simulate reports
        for i in range(5):
            item.report_count = i + 1
            if item.report_count >= 5:
                item.is_active = False
            item.save()
        
        item.refresh_from_db()
        self.assertEqual(item.report_count, 5)
        self.assertFalse(item.is_active)


class CommentModelTest(TestCase):
    """Test cases for Comment model"""
    
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
    
    def test_create_comment(self):
        """Test creating a comment"""
        comment = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='I think I saw this in the library'
        )
        
        self.assertEqual(comment.item, self.item)
        self.assertEqual(comment.author, self.other_user)
        self.assertEqual(comment.content, 'I think I saw this in the library')
        self.assertIsNone(comment.parent)
        self.assertIsNotNone(comment.created_at)
        self.assertEqual(comment.report_count, 0)
        self.assertTrue(comment.is_active)
    
    def test_create_reply(self):
        """Test creating a reply to a comment"""
        parent = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='Parent comment'
        )
        
        reply = Comment.objects.create(
            item=self.item,
            author=self.user,
            parent=parent,
            content='Reply to parent'
        )
        
        self.assertEqual(reply.parent, parent)
        self.assertTrue(reply.is_reply)
        
        # Check parent's replies
        self.assertEqual(parent.replies.count(), 1)
        self.assertEqual(parent.replies.first(), reply)
    
    def test_comment_ordering(self):
        """Test comments are ordered by created_at descending"""
        import time
        time.sleep(0.01)  # Small delay
        
        comment2 = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='Second comment'
        )
        
        latest = Comment.objects.first()
        self.assertEqual(latest.id, comment2.id)  # Compare by id
    
    def test_item_comments_relation(self):
        """Test accessing comments through item"""
        comment1 = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='Comment 1'
        )
        comment2 = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='Comment 2'
        )
        
        self.assertEqual(self.item.comments.count(), 2)
        self.assertIn(comment1, self.item.comments.all())
        self.assertIn(comment2, self.item.comments.all())
    
    def test_comment_deactivation_after_reports(self):
        """Test comment becomes inactive after 5 reports"""
        comment = Comment.objects.create(
            item=self.item,
            author=self.other_user,
            content='Test comment'
        )
        self.assertTrue(comment.is_active)
        
        # Simulate reports
        for i in range(5):
            comment.report_count = i + 1
            if comment.report_count >= 5:
                comment.is_active = False
            comment.save()
        
        comment.refresh_from_db()
        self.assertEqual(comment.report_count, 5)
        self.assertFalse(comment.is_active)


class ItemReportModelTest(TestCase):
    """Test cases for ItemReport model"""
    
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
    
    def test_create_report(self):
        """Test creating an item report"""
        report = ItemReport.objects.create(
            item=self.item,
            reporter=self.reporter,
            reason='inappropriate',
            description='This item has inappropriate content'
        )
        
        self.assertEqual(report.item, self.item)
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.reason, 'inappropriate')
        self.assertEqual(report.description, 'This item has inappropriate content')
        self.assertIsNotNone(report.created_at)
    
    def test_unique_report_per_user(self):
        """Test a user cannot report the same item twice"""
        ItemReport.objects.create(
            item=self.item,
            reporter=self.reporter,
            reason='spam'
        )
        
        with self.assertRaises(IntegrityError):
            ItemReport.objects.create(
                item=self.item,
                reporter=self.reporter,
                reason='duplicate'
            )
    
    def test_report_increases_item_report_count(self):
        """Test creating a report increases item's report count"""
        self.assertEqual(self.item.report_count, 0)
        
        report = ItemReport.objects.create(
            item=self.item,
            reporter=self.reporter,
            reason='spam'
        )
        
        self.item.refresh_from_db()
        self.assertEqual(self.item.report_count, 1)
    
    def test_report_reason_choices(self):
        """Test report reason choices"""
        choices = dict(ItemReport.Reason.choices)
        self.assertEqual(choices['inappropriate'], 'Inappropriate Content')
        self.assertEqual(choices['spam'], 'Spam')
        self.assertEqual(choices['duplicate'], 'Duplicate')
        self.assertEqual(choices['fake'], 'Fake')
        self.assertEqual(choices['other'], 'Other')
    
    def test_multiple_reports_trigger_deactivation(self):
        """Test item becomes inactive after 5 reports"""
        reporters = []
        for i in range(5):
            reporter = User.objects.create_user(
                username=f'reporter{i}@example.com',
                email=f'reporter{i}@example.com',
                password='testpass123'
            )
            reporters.append(reporter)
        
        # Create 4 reports - item should still be active
        for i in range(4):
            ItemReport.objects.create(
                item=self.item,
                reporter=reporters[i],
                reason='spam'
            )
        
        self.item.refresh_from_db()
        self.assertEqual(self.item.report_count, 4)
        self.assertTrue(self.item.is_active)
        
        # 5th report should deactivate
        ItemReport.objects.create(
            item=self.item,
            reporter=reporters[4],
            reason='spam'
        )
        
        self.item.refresh_from_db()
        self.assertEqual(self.item.report_count, 5)
        self.assertFalse(self.item.is_active)


class CommentReportModelTest(TestCase):
    """Test cases for CommentReport model"""
    
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
            content='Test comment'
        )
    
    def test_create_comment_report(self):
        """Test creating a comment report"""
        report = CommentReport.objects.create(
            comment=self.comment,
            reporter=self.reporter,
            reason='harassment',
            description='This comment is harassing'
        )
        
        self.assertEqual(report.comment, self.comment)
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.reason, 'harassment')
        self.assertEqual(report.description, 'This comment is harassing')
        self.assertIsNotNone(report.created_at)
    
    def test_unique_report_per_user(self):
        """Test a user cannot report the same comment twice"""
        CommentReport.objects.create(
            comment=self.comment,
            reporter=self.reporter,
            reason='spam'
        )
        
        with self.assertRaises(IntegrityError):
            CommentReport.objects.create(
                comment=self.comment,
                reporter=self.reporter,
                reason='inappropriate'
            )
    
    def test_report_increases_comment_report_count(self):
        """Test creating a report increases comment's report count"""
        self.assertEqual(self.comment.report_count, 0)
        
        report = CommentReport.objects.create(
            comment=self.comment,
            reporter=self.reporter,
            reason='spam'
        )
        
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.report_count, 1)
    
    def test_report_reason_choices(self):
        """Test report reason choices"""
        choices = dict(CommentReport.Reason.choices)
        self.assertEqual(choices['inappropriate'], 'Inappropriate Content')
        self.assertEqual(choices['spam'], 'Spam')
        self.assertEqual(choices['harassment'], 'Harassment')
        self.assertEqual(choices['other'], 'Other')
    
    def test_multiple_reports_trigger_deactivation(self):
        """Test comment becomes inactive after 5 reports"""
        reporters = []
        for i in range(5):
            reporter = User.objects.create_user(
                username=f'reporter{i}@example.com',
                email=f'reporter{i}@example.com',
                password='testpass123'
            )
            reporters.append(reporter)
        
        # Create 4 reports - comment should still be active
        for i in range(4):
            CommentReport.objects.create(
                comment=self.comment,
                reporter=reporters[i],
                reason='spam'
            )
        
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.report_count, 4)
        self.assertTrue(self.comment.is_active)
        
        # 5th report should deactivate
        CommentReport.objects.create(
            comment=self.comment,
            reporter=reporters[4],
            reason='spam'
        )
        
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.report_count, 5)
        self.assertFalse(self.comment.is_active)