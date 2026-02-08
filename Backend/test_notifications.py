import os
import sys

# Setup Django FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

print('=== COMPLETE NOTIFICATION SYSTEM TEST ===')

from django.contrib.auth import get_user_model
from items.models import Item, Comment, Notification
from django.db import connection

User = get_user_model()

# 1. Check if Notification table exists
tables = connection.introspection.table_names()
print(f'1. Database tables: {len(tables)} tables found')
if 'items_notification' not in tables:
    print('   ❌ Notification table does NOT exist!')
    print('   The Notification model was not added to items/models.py')
    print('   Or migrations were not created')
    exit()
else:
    print('   ✅ Notification table exists')

# 2. Create or get test users
try:
    user_a = User.objects.get(email='user_a@example.com')
    user_b = User.objects.get(email='user_b@example.com')
    print('2. ✅ Users already exist, using them')
except User.DoesNotExist:
    print('2. Creating new test users...')
    user_a = User.objects.create_user(
        email='user_a@example.com',
        password='Test1234!',
        username='user_a@example.com',
        is_active=True
    )
    user_b = User.objects.create_user(
        email='user_b@example.com',
        password='Test1234!',
        username='user_b@example.com',
        is_active=True
    )
    print('   ✅ Created new test users')

print(f'   User A: {user_a.email} (ID: {user_a.id})')
print(f'   User B: {user_b.email} (ID: {user_b.id})')

# 3. Create an item as User A
print('3. Creating test item...')
try:
    item = Item.objects.create(
        title='Test iPhone for Notification Test',
        description='Black iPhone 13 Pro Max with blue case',
        status='lost',
        categories=['electronics', 'phone'],
        latitude=35.7036,
        longitude=51.3515,
        location_name='Computer Science Building',
        owner=user_a,
        is_active=True
    )
    print(f'   ✅ Item created: "{item.title}" (ID: {item.id}) by {user_a.email}')
except Exception as e:
    print(f'   ❌ Failed to create item: {e}')
    exit()

# 4. Create a comment as User B
print('4. Creating test comment...')
try:
    comment = Comment.objects.create(
        item=item,
        author=user_b,
        content='I found a similar phone at the library yesterday! Is it yours?',
        is_active=True
    )
    print(f'   ✅ Comment created by {user_b.email} on item {item.id}')
except Exception as e:
    print(f'   ❌ Failed to create comment: {e}')
    exit()

# 5. Check notifications
print('5. Checking notifications...')
notifications = Notification.objects.filter(recipient=user_a)
notification_count = notifications.count()
print(f'   Total notifications for {user_a.email}: {notification_count}')

if notification_count > 0:
    print('   ✅ NOTIFICATION SYSTEM IS WORKING AUTOMATICALLY!')
    for n in notifications:
        print(f'      - ID {n.id}: {n.message}')
        print(f'        Type: {n.notification_type}, Read: {n.is_read}')
else:
    print('   ❌ NO AUTOMATIC NOTIFICATIONS CREATED')
    
    # Check if signals are connected
    from django.db.models import signals
    print('   Checking signals configuration...')
    
    # Try to check receivers
    try:
        receiver_count = len(signals.post_save.receivers)
        print(f'   Total post_save receivers: {receiver_count}')
    except:
        print('   Could not check receivers')
    
    # Manual test - create notification directly
    print('   Testing manual notification creation...')
    try:
        notification = Notification.objects.create(
            recipient=user_a,
            sender=user_b,
            item=item,
            comment=comment,
            notification_type='comment',
            message=f'{user_b.email} commented on your item'
        )
        print(f'   ✅ Manual notification created (ID: {notification.id})')
        print('   This means the model works, but signals are not triggering')
    except Exception as e:
        print(f'   ❌ Manual creation also failed: {e}')
        print('   There is an issue with the Notification model definition')

# 6. Check items/apps.py configuration
print('\n6. Checking items app configuration...')
try:
    from django.apps import apps
    items_config = apps.get_app_config('items')
    if hasattr(items_config, 'ready'):
        print('   ✅ items/apps.py has ready() method')
        # Check if signals are imported
        import items.signals
        print('   ✅ signals.py can be imported')
    else:
        print('   ❌ items/apps.py does not have ready() method')
except Exception as e:
    print(f'   ❌ Error checking app config: {e}')

print('\n=== TEST COMPLETE ===')