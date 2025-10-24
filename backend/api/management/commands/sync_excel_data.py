import os
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from api.models import Company, Fund
import logging

# Set up logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync data from Excel file to Company and Fund models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file-path',
            type=str,
            default=os.path.join(settings.BASE_DIR, '/api/data/data.xlsx'),
            help='Path to the Excel file (default: frontend/public/data.xlsx)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update existing records',
        )

    def handle(self, *args, **options):
        file_path = options['file_path']
        force_update = options['force']
        
        self.stdout.write(f"Starting Excel sync from: {file_path}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise CommandError(f'Excel file not found at: {file_path}')
        
        try:
            # Read Excel file
            excel_data = pd.read_excel(file_path)
            
            # Log the columns to understand the structure
            self.stdout.write(f"Excel columns: {list(excel_data.columns)}")
            
            # Clean column names (remove spaces, convert to lowercase)
            excel_data.columns = excel_data.columns.str.strip().str.lower().str.replace(' ', '_')
            
            companies_created = 0
            companies_updated = 0
            funds_created = 0
            funds_updated = 0
            
            # Process each row
            for index, row in excel_data.iterrows():
                try:
                    # Determine if this is a company or fund based on available data
                    # You can modify this logic based on your Excel structure
                    
                    # Check if this looks like a company row (has company-specific fields)
                    if self._is_company_row(row):
                        created, updated = self._process_company_row(row, force_update)
                        if created:
                            companies_created += 1
                        if updated:
                            companies_updated += 1
                    
                    # Check if this looks like a fund row (has fund-specific fields)
                    elif self._is_fund_row(row):
                        created, updated = self._process_fund_row(row, force_update)
                        if created:
                            funds_created += 1
                        if updated:
                            funds_updated += 1
                    
                    else:
                        # Try to process as both company and fund if data allows
                        # This handles cases where one row contains both company and fund data
                        if self._has_company_data(row):
                            created, updated = self._process_company_row(row, force_update)
                            if created:
                                companies_created += 1
                            if updated:
                                companies_updated += 1
                        
                        if self._has_fund_data(row):
                            created, updated = self._process_fund_row(row, force_update)
                            if created:
                                funds_created += 1
                            if updated:
                                funds_updated += 1
                
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing row {index}: {str(e)}")
                    )
                    continue
            
            # Success message
            self.stdout.write(
                self.style.SUCCESS(
                    f"Sync completed successfully!\n"
                    f"Companies: {companies_created} created, {companies_updated} updated\n"
                    f"Funds: {funds_created} created, {funds_updated} updated"
                )
            )
        
        except Exception as e:
            raise CommandError(f"Error reading Excel file: {str(e)}")
    
    def _is_company_row(self, row):
        """Check if row contains company-specific data"""
        # Based on actual Excel columns: ['Sr No.', 'ISIN', 'BSE Symbol', 'NSE Symbol', 'Company Name', ...]
        company_indicators = ['company_name', 'isin', 'sector', 'esg_pillar']
        return any(col in row.index and pd.notna(row.get(col)) for col in company_indicators)
    
    def _is_fund_row(self, row):
        """Check if row contains fund-specific data"""
        # This Excel doesn't seem to have fund data, return False
        return False
    
    def _has_company_data(self, row):
        """Check if row has any company data fields"""
        return 'company_name' in row.index and pd.notna(row.get('company_name'))
    
    def _has_fund_data(self, row):
        """Check if row has any fund data fields"""
        # This Excel doesn't contain fund data
        return False
    
    def _safe_get(self, row, key, default=None):
        """Safely get value from row, handling NaN and missing keys"""
        if key not in row.index:
            return default
        value = row.get(key)
        if pd.isna(value):
            return default
        return value
    
    def _safe_float(self, value):
        """Safely convert to float, handling None and NaN"""
        if value is None or pd.isna(value):
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _process_company_row(self, row, force_update=False):
        """Process a single company row from Excel"""
        company_name = self._safe_get(row, 'company_name')
        if not company_name:
            return False, False
        
        # Get ISIN first as it's now the primary key
        isin = self._safe_get(row, 'isin')
        if not isin:
            return False, False  # Skip rows without ISIN
        
        # Map Excel columns to model fields - all as strings to avoid type issues
        company_data = {
            'isin': str(isin),  # Primary key as string
            'company_name': str(company_name) if company_name else '',
            'sector': str(self._safe_get(row, 'sector') or ''),
            'esg_sector': str(self._safe_get(row, 'esg_sector') or ''),
            'bse_symbol': str(self._safe_get(row, 'bse_symbol') or ''),
            'nse_symbol': str(self._safe_get(row, 'nse_symbol') or ''),
            'market_cap': str(self._safe_get(row, 'mcap') or ''),
            
            # ESG Scores - convert to strings
            'esg_score': str(self._safe_get(row, 'esg_pillar') or ''),
            'e_score': str(self._safe_get(row, 'e_pillar') or ''),
            's_score': str(self._safe_get(row, 's_pillar') or ''),
            'g_score': str(self._safe_get(row, 'g_pillar') or ''),
            
            # Screening & Ratings - as strings
            'positive': str(self._safe_get(row, 'positive_screen') or ''),
            'negative': str(self._safe_get(row, 'negative_screen') or ''),
            'controversy': str(self._safe_get(row, 'controversy_rating') or ''),
            'composite': str(self._safe_get(row, 'composite_rating') or ''),
            'grade': str(self._safe_get(row, 'esg_rating') or ''),
        }
        
        # Try to get or create company using ISIN as primary key
        try:
            company = Company.objects.get(isin=isin)
            created = False
            updated = False
            if force_update:
                # Update existing company
                for key, value in company_data.items():
                    if value:  # Only update non-empty values
                        setattr(company, key, value)
                company.save()
                updated = True
        except Company.DoesNotExist:
            # Create new company
            company = Company.objects.create(**company_data)
            created = True
            updated = False
        
        return created, updated
    
    def _process_fund_row(self, row, force_update=False):
        """Process a single fund row from Excel"""
        fund_name = self._safe_get(row, 'fund_name')
        if not fund_name:
            return False, False
        
        # Prepare fund data
        fund_data = {
            'name': fund_name,
            'fund_type': self._safe_get(row, 'fund_type'),
            'investment_style': self._safe_get(row, 'investment_style'),
            'aum': self._safe_float(self._safe_get(row, 'aum')),
            'expense_ratio': self._safe_float(self._safe_get(row, 'expense_ratio')),
            'inception_date': self._safe_get(row, 'inception_date'),
            'manager_name': self._safe_get(row, 'manager_name'),
            'benchmark': self._safe_get(row, 'benchmark'),
            'description': self._safe_get(row, 'description'),
        }
        
        # Try to get or create fund
        fund, created = Fund.objects.get_or_create(
            name=fund_name,
            defaults=fund_data
        )
        
        updated = False
        if not created and force_update:
            # Update existing fund
            for key, value in fund_data.items():
                if value is not None:  # Only update non-null values
                    setattr(fund, key, value)
            fund.save()
            updated = True
        
        return created, updated