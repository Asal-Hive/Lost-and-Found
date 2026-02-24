from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from items.models import Item, Comment, ItemReport, CommentReport
from decimal import Decimal

User = get_user_model()


class ItemViewSetTest(TestCase):
    """Test cases for ItemViewSet"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.user1 = User.objects.create_user(
            username='user1@example.com',
            email='user1@example.com',
            password='testpass123',
            is_active=True
        )
        
        self.user2 = User.objects.create_user(
            username='user2@example.com',
            email='user2@example.com',
            password='testpass123',
            is_active=True
        )
        
        # Create items
        self.item1 = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet', 'bank_card'],
            latitude='35.123456',
            longitude='51.123456',
            location_name='Library',
            owner=self.user1
        )
        
        self.item2 = Item.objects.create(
            title='Found Keys',
            description='Keys on the ground',
            status='found',
            categories=['keys'],
            latitude='35.789012',
            longitude='51.789012',
            location_name='Cafeteria',
            owner=self.user2
        )
        
        # URLs
        self.items_list_url = reverse('item-list')
        self.items_detail_url = lambda pk: reverse('item-detail', args=[pk])
    
    # def test_list_items_public(self):
    #     """Test anyone can list items"""
    #     response = self.client.get(self.items_list_url)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    #     # Handle pagination
    #     if 'results' in response.data:
    #         self.assertEqual(len(response.data['results']), 2)
    #     else:
    #         self.assertEqual(len(response.data), 2)
    
    def test_list_items_shows_only_active(self):
        """Test only active items are shown in list"""
        # Deactivate item1
        self.item1.is_active = False
        self.item1.save()
        
        response = self.client.get(self.items_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data['results'][0]['id'], self.item2.id)
    
    def test_create_item_authenticated(self):
        """Test authenticated user can create item"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'title': 'New Lost Item',
            'description': 'Description of lost item',
            'status': 'lost',
            'categories': ['phone'],
            'latitude': '35.123456',
            'longitude': '51.123456',
            'location_name': 'Gym'
        }
        
        response = self.client.post(self.items_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check item was created with correct owner
        item = Item.objects.get(title='New Lost Item')
        self.assertEqual(item.owner, self.user1)
        self.assertEqual(item.categories, ['phone'])
    
    def test_create_item_unauthenticated(self):
        """Test unauthenticated user cannot create item"""
        data = {
            'title': 'New Lost Item',
            'description': 'Description',
            'status': 'lost',
            'categories': ['phone'],
            'latitude': '35.123456',
            'longitude': '51.123456'
        }
        
        response = self.client.post(self.items_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_own_item(self):
        """Test user can update their own item"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'title': 'Updated Title',
            'description': 'Updated description',
            'status': 'found',  # Change status
            'categories': ['wallet', 'bank_card', 'other'],
            'latitude': '35.123456',
            'longitude': '51.123456'
        }
        
        response = self.client.patch(
            self.items_detail_url(self.item1.id),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check item was updated
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.title, 'Updated Title')
        self.assertEqual(self.item1.status, 'found')
        self.assertEqual(self.item1.categories, ['wallet', 'bank_card', 'other'])
    
    def test_cannot_update_others_item(self):
        """Test user cannot update another user's item"""
        self.client.force_authenticate(user=self.user2)
        
        data = {
            'title': 'Hacked Title',
            'description': 'This should fail'
        }
        
        response = self.client.patch(
            self.items_detail_url(self.item1.id),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_own_item(self):
        """Test user can delete their own item"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.delete(self.items_detail_url(self.item1.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Item should be soft deleted (is_active=False), not actually removed
        self.item1.refresh_from_db()
        self.assertFalse(self.item1.is_active)
    
    def test_cannot_delete_others_item(self):
        """Test user cannot delete another user's item"""
        self.client.force_authenticate(user=self.user2)
        
        response = self.client.delete(self.items_detail_url(self.item1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_filter_by_status(self):
        """Test filtering items by status"""
        response = self.client.get(self.items_list_url, {'status': 'lost'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data['results'][0]['id'], self.item1.id)
    
    def test_filter_by_category(self):
        """Test filtering items by category"""
        response = self.client.get(self.items_list_url, {'categories': 'keys'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data['results'][0]['id'], self.item2.id)
    
    def test_search_by_title(self):
        """Test searching items by title"""
        response = self.client.get(self.items_list_url, {'search': 'Wallet'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data['results'][0]['id'], self.item1.id)
    
    def test_search_by_description(self):
        """Test searching items by description"""
        response = self.client.get(self.items_list_url, {'search': 'ground'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data['results'][0]['id'], self.item2.id)
    
    def test_search_by_location(self):
        """Test searching items by location"""
        response = self.client.get(self.items_list_url, {'search': 'Library'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data['results'][0]['id'], self.item1.id)
    
    def test_my_items_endpoint(self):
        """Test getting current user's items"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.get(reverse('item-my-items'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.item1.id)
    
    def test_my_items_unauthenticated(self):
        """Test my_items requires authentication"""
        response = self.client.get(reverse('item-my-items'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_report_item(self):
        """Test reporting an item"""
        self.client.force_authenticate(user=self.user2)
        
        data = {
            'reason': 'inappropriate',
            'description': 'This item has inappropriate content',
            'item': self.item1.id  # Add item_id
        }
        
        response = self.client.post(
            reverse('item-report', args=[self.item1.id]),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_cannot_report_own_item(self):
        """Test user cannot report their own item"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'reason': 'inappropriate'
        }
        
        response = self.client.post(
            reverse('item-report', args=[self.item1.id]),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_multiple_reports_deactivate_item(self):
        """Test item becomes inactive after 5 reports"""
        self.client.force_authenticate(user=self.user2)
        
        # Create 5 different reporters
        reporters = []
        for i in range(5):
            reporter = User.objects.create_user(
                username=f'reporter{i}@example.com',
                email=f'reporter{i}@example.com',
                password='testpass123',
                is_active=True
            )
            reporters.append(reporter)
        
        # Create 4 reports
        for i in range(4):
            self.client.force_authenticate(user=reporters[i])
            response = self.client.post(
                reverse('item-report', args=[self.item1.id]),
                {'reason': 'spam'},
                format='json'
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Item should still be active
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.report_count, 4)
        self.assertTrue(self.item1.is_active)
        
        # 5th report
        self.client.force_authenticate(user=reporters[4])
        response = self.client.post(
            reverse('item-report', args=[self.item1.id]),
            {'reason': 'spam'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Item should now be inactive
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.report_count, 5)
        self.assertFalse(self.item1.is_active)


class CommentViewSetTest(TestCase):
    """Test cases for CommentViewSet"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.user1 = User.objects.create_user(
            username='user1@example.com',
            email='user1@example.com',
            password='testpass123',
            is_active=True
        )
        
        self.user2 = User.objects.create_user(
            username='user2@example.com',
            email='user2@example.com',
            password='testpass123',
            is_active=True
        )
        
        # Create item
        self.item = Item.objects.create(
            title='Lost Wallet',
            description='Black leather wallet',
            status='lost',
            categories=['wallet'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user1
        )
        
        # Create comments
        self.comment1 = Comment.objects.create(
            item=self.item,
            author=self.user2,
            content='First comment'
        )
        
        self.comment2 = Comment.objects.create(
            item=self.item,
            author=self.user2,
            content='Second comment'
        )
        
        self.reply = Comment.objects.create(
            item=self.item,
            author=self.user1,
            parent=self.comment1,
            content='Reply to first comment'
        )
        
        # URLs
        self.comments_list_url = reverse('comment-list')
        self.comments_detail_url = lambda pk: reverse('comment-detail', args=[pk])
    
    def test_list_comments_public(self):
        """Test anyone can list comments"""
        response = self.client.get(self.comments_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only top-level comments
    
    def test_list_comments_shows_only_active(self):
        """Test only active comments are shown"""
        # Deactivate comment2
        self.comment2.is_active = False
        self.comment2.save()
        
        response = self.client.get(self.comments_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.comment1.id)
    
    def test_create_comment_authenticated(self):
        """Test authenticated user can create comment"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'item': self.item.id,
            'content': 'New comment'
        }
        
        response = self.client.post(self.comments_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check comment was created
        comment = Comment.objects.get(content='New comment')
        self.assertEqual(comment.author, self.user1)
        self.assertEqual(comment.item, self.item)
    
    def test_create_reply(self):
        """Test creating a reply to a comment"""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'item': self.item.id,
            'parent': self.comment1.id,
            'content': 'New reply'
        }
        
        response = self.client.post(self.comments_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check reply was created
        reply = Comment.objects.get(content='New reply')
        self.assertEqual(reply.parent, self.comment1)
        self.assertTrue(reply.is_reply)
    
    def test_create_comment_unauthenticated(self):
        """Test unauthenticated user cannot create comment"""
        data = {
            'item': self.item.id,
            'content': 'New comment'
        }
        
        response = self.client.post(self.comments_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_own_comment(self):
        """Test user can update their own comment"""
        self.client.force_authenticate(user=self.user2)
        
        data = {
            'content': 'Updated comment content'
        }
        
        response = self.client.patch(
            self.comments_detail_url(self.comment1.id),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check comment was updated
        self.comment1.refresh_from_db()
        self.assertEqual(self.comment1.content, 'Updated comment content')
    
    def test_cannot_update_others_comment(self):
        """Test user cannot update another user's comment"""
        self.client.force_authenticate(user=self.user1)  # user1 trying to update user2's comment
        
        data = {
            'content': 'Hacked content'
        }
        
        response = self.client.patch(
            self.comments_detail_url(self.comment1.id),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_own_comment(self):
        """Test user can delete their own comment"""
        self.client.force_authenticate(user=self.user2)
        
        response = self.client.delete(self.comments_detail_url(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Comment should be soft deleted
        self.comment1.refresh_from_db()
        self.assertFalse(self.comment1.is_active)
    
    def test_cannot_delete_others_comment(self):
        """Test user cannot delete another user's comment"""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.delete(self.comments_detail_url(self.comment1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_filter_comments_by_item(self):
        """Test filtering comments by item"""
        # Create another item with comments
        other_item = Item.objects.create(
            title='Found Keys',
            description='Keys',
            status='found',
            categories=['keys'],
            latitude='35.123456',
            longitude='51.123456',
            owner=self.user1
        )
        
        other_comment = Comment.objects.create(
            item=other_item,
            author=self.user2,
            content='Comment on other item'
        )
        
        response = self.client.get(self.comments_list_url, {'item': self.item.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only comments on self.item
        self.assertEqual(response.data[0]['item'], self.item.id)
    
    def test_filter_comments_by_parent(self):
        """Test filtering replies to a comment"""
        response = self.client.get(self.comments_list_url, {'parent': self.comment1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.reply.id)
    
    def test_item_comments_endpoint(self):
        """Test getting comments for a specific item"""
        response = self.client.get(reverse('item-comments', args=[self.item.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Both top-level comments
        self.assertEqual(response.data[0]['id'], self.comment2.id)  # Most recent first
    
    def test_report_comment(self):
        """Test reporting a comment"""
        self.client.force_authenticate(user=self.user1)  # user1 reports user2's comment
        
        data = {
            'reason': 'harassment',
            'description': 'This comment is harassing'
        }
        
        response = self.client.post(
            reverse('comment-report', args=[self.comment1.id]),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check report was created
        self.assertEqual(CommentReport.objects.count(), 1)
        report = CommentReport.objects.first()
        self.assertEqual(report.comment, self.comment1)
        self.assertEqual(report.reporter, self.user1)
        
        # Check comment report count increased
        self.comment1.refresh_from_db()
        self.assertEqual(self.comment1.report_count, 1)
    
    def test_cannot_report_own_comment(self):
        """Test user cannot report their own comment"""
        self.client.force_authenticate(user=self.user2)
        
        data = {
            'reason': 'spam'
        }
        
        response = self.client.post(
            reverse('comment-report', args=[self.comment1.id]),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_multiple_reports_deactivate_comment(self):
        """Test comment becomes inactive after 5 reports"""
        # Create 5 different reporters
        reporters = []
        for i in range(5):
            reporter = User.objects.create_user(
                username=f'reporter{i}@example.com',
                email=f'reporter{i}@example.com',
                password='testpass123',
                is_active=True
            )
            reporters.append(reporter)
        
        # Create 4 reports
        for i in range(4):
            self.client.force_authenticate(user=reporters[i])
            response = self.client.post(
                reverse('comment-report', args=[self.comment1.id]),
                {'reason': 'spam'},
                format='json'
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Comment should still be active
        self.comment1.refresh_from_db()
        self.assertEqual(self.comment1.report_count, 4)
        self.assertTrue(self.comment1.is_active)
        
        # 5th report
        self.client.force_authenticate(user=reporters[4])
        response = self.client.post(
            reverse('comment-report', args=[self.comment1.id]),
            {'reason': 'spam'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Comment should now be inactive
        self.comment1.refresh_from_db()
        self.assertEqual(self.comment1.report_count, 5)
        self.assertFalse(self.comment1.is_active)