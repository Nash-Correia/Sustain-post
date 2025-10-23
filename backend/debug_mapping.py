#!/usr/bin/env python
"""Debug script to check Excel mapping functionality"""
import os
import sys
import django
import pandas as pd

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from api.views import get_company_name_mappings
from django.conf import settings

def debug_excel_file():
    """Check Excel file structure"""
    print("=" * 60)
    print("DEBUGGING EXCEL FILE")
    print("=" * 60)
    
    excel_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'data.xlsx')
    print(f"Excel path: {excel_path}")
    print(f"File exists: {os.path.exists(excel_path)}")
    
    if not os.path.exists(excel_path):
        print("❌ Excel file not found!")
        return
    
    try:
        # Read Excel file
        df = pd.read_excel(excel_path)
        print(f"✅ Excel loaded successfully - {len(df)} rows")
        
        print("\n📋 Raw column names:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}: '{col}'")
        
        # Clean column names like in the mapping function
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        print("\n🧹 Cleaned column names:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}: '{col}'")
        
        # Check for required columns
        required_columns = ['Company Name', 'file name']
        for col in required_columns:
            if col in df.columns:
                print(f"✅ Found '{col}' column")
            else:
                print(f"❌ Missing '{col}' column")
        
        if 'Company Name' in df.columns:
            valid_names = df['Company Name'].dropna()
            print(f"📊 Valid company names: {len(valid_names)}")
            
            print("\n📝 First 5 company names:")
            for i, name in enumerate(valid_names.head(5)):
                print(f"  {i+1}: '{name}'")
        
        if 'file name' in df.columns:
            valid_filenames = df['file name'].dropna()
            print(f"📊 Valid filenames: {len(valid_filenames)}")
            
            print("\n📁 First 5 filenames:")
            for i, filename in enumerate(valid_filenames.head(5)):
                print(f"  {i+1}: '{filename}'")
        
        # Show additional columns
        other_cols = ['Sector', 'ESG Rating']
        print("\n📋 Additional columns:")
        for col in other_cols:
            if col in df.columns:
                print(f"  ✅ '{col}' - found")
            else:
                print(f"  ❌ '{col}' - missing")
            
    except Exception as e:
        print(f"❌ Error reading Excel: {e}")
        import traceback
        traceback.print_exc()

def debug_pdf_files():
    """Check PDF files in secure_reports"""
    print("\n" + "=" * 60)
    print("DEBUGGING PDF FILES")
    print("=" * 60)
    
    reports_dir = os.path.join(settings.BASE_DIR, 'media', 'secure_reports')
    print(f"PDF directory: {reports_dir}")
    print(f"Directory exists: {os.path.exists(reports_dir)}")
    
    if not os.path.exists(reports_dir):
        print("❌ secure_reports directory not found!")
        return []
    
    try:
        pdf_files = [f for f in os.listdir(reports_dir) if f.lower().endswith('.pdf')]
        print(f"✅ Found {len(pdf_files)} PDF files")
        
        print("\n📁 PDF files:")
        for i, pdf in enumerate(pdf_files[:10]):  # Show first 10
            print(f"  {i+1}: '{pdf}'")
            
        if len(pdf_files) > 10:
            print(f"  ... and {len(pdf_files) - 10} more")
            
        return pdf_files
        
    except Exception as e:
        print(f"❌ Error listing PDF files: {e}")
        return []

def debug_mapping():
    """Test the mapping function"""
    print("\n" + "=" * 60)
    print("DEBUGGING MAPPING FUNCTION")
    print("=" * 60)
    
    try:
        filename_to_name, name_to_filename = get_company_name_mappings()
        
        print(f"✅ Mapping function executed successfully")
        print(f"📊 Filename->Name mappings: {len(filename_to_name)}")
        print(f"📊 Name->Filename mappings: {len(name_to_filename)}")
        
        if filename_to_name:
            print("\n📝 Sample filename->name mappings:")
            for i, (filename, name) in enumerate(list(filename_to_name.items())[:5]):
                print(f"  '{filename}' -> '{name}'")
                
            print("\n📝 Sample name->filename mappings:")
            for i, (name, filename) in enumerate(list(name_to_filename.items())[:5]):
                print(f"  '{name}' -> '{filename}'")
        else:
            print("\n❌ No mappings created - investigating...")
            
            # Let's debug why no mappings were created
            debug_mapping_detailed()
            
    except Exception as e:
        print(f"❌ Error in mapping function: {e}")
        import traceback
        traceback.print_exc()

def debug_mapping_detailed():
    """Detailed debugging of mapping process"""
    print("\n🔍 DETAILED MAPPING DEBUG")
    print("-" * 40)
    
    try:
        excel_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'data.xlsx')
        reports_dir = os.path.join(settings.BASE_DIR, 'media', 'secure_reports')
        
        # Read Excel
        df = pd.read_excel(excel_path)
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        
        # Get PDF files
        pdf_files = []
        if os.path.exists(reports_dir):
            pdf_files = [f for f in os.listdir(reports_dir) if f.lower().endswith('.pdf')]
        
        print(f"📋 Excel companies: {len(df)}")
        print(f"📁 PDF files: {len(pdf_files)}")
        
        if 'company_name' not in df.columns:
            print("❌ No company_name column in Excel")
            return
            
        # Try to match each company with PDF files
        matches_found = 0
        print("\n🔍 Matching process:")
        
        for idx, row in df.head(5).iterrows():  # Check first 5
            company_name = row.get('company_name')
            if pd.notna(company_name):
                company_name = str(company_name).strip()
                print(f"\n  Company: '{company_name}'")
                
                # Try exact match
                exact_filename = f"{company_name}.pdf"
                if exact_filename in pdf_files:
                    print(f"    ✅ Exact match: {exact_filename}")
                    matches_found += 1
                    continue
                
                # Try case-insensitive match
                for pdf_file in pdf_files:
                    if pdf_file.lower() == exact_filename.lower():
                        print(f"    ✅ Case-insensitive match: {pdf_file}")
                        matches_found += 1
                        break
                else:
                    # Try partial match
                    company_lower = company_name.lower()
                    for pdf_file in pdf_files:
                        if company_lower in pdf_file.lower():
                            print(f"    ✅ Partial match: {pdf_file}")
                            matches_found += 1
                            break
                    else:
                        print(f"    ❌ No match found")
        
        print(f"\n📊 Matches found in first 5: {matches_found}")
        
    except Exception as e:
        print(f"❌ Error in detailed debugging: {e}")

def test_companies_api():
    """Test the new companies API"""
    print("\n" + "=" * 60)
    print("TESTING COMPANIES API")
    print("=" * 60)
    
    try:
        from api.views import company_list
        from django.test import RequestFactory
        
        # Create a mock request
        factory = RequestFactory()
        request = factory.get('/api/companies/')
        
        # Call the API
        response = company_list(request)
        
        print(f"✅ API call successful - Status: {response.status_code}")
        
        if hasattr(response, 'data'):
            companies = response.data
            print(f"📊 Companies returned: {len(companies)}")
            
            if companies:
                print("\n📝 First 3 companies:")
                for i, company in enumerate(companies[:3]):
                    print(f"  {i+1}: {company.get('company_name', 'N/A')} - Sector: {company.get('esg_sector', 'N/A')} - Rating: {company.get('grade', 'N/A')}")
            else:
                print("❌ No companies returned")
                
    except Exception as e:
        print(f"❌ API test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_excel_file()
    pdf_files = debug_pdf_files()
    debug_mapping()
    test_companies_api()
    
    print("\n" + "=" * 60)
    print("DEBUG COMPLETE")
    print("=" * 60)