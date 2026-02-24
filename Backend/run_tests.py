#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    # Set test settings
    os.environ['DJANGO_SETTINGS_MODULE'] = 'server.test_settings'
    
    # Run Django tests
    from django.core.management import execute_from_command_line
    
    # Default to running all tests if no args provided
    args = sys.argv
    if len(args) == 1:
        args = ['manage.py', 'test', 'accounts.tests', 'items.tests']
    
    execute_from_command_line(args)