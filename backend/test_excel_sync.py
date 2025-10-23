"""
Test script to run the Excel sync management command
Usage: python test_excel_sync.py
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command
from api.models import Company, Fund

def test_excel_sync():
    print("Testing Excel sync functionality...")
    
    # Check initial counts
    initial_companies = Company.objects.count()
    initial_funds = Fund.objects.count()
    
    print(f"Initial Company count: {initial_companies}")
    print(f"Initial Fund count: {initial_funds}")
    
    try:
        # Run the sync command
        call_command('sync_excel_data', verbosity=2)
        
        # Check final counts
        final_companies = Company.objects.count()
        final_funds = Fund.objects.count()
        
        print(f"Final Company count: {final_companies}")
        print(f"Final Fund count: {final_funds}")
        
        print("Excel sync test completed successfully!")
        
    except Exception as e:
        print(f"Error during Excel sync: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    test_excel_sync()