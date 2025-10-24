import os
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from api.models import Company, Fund
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync data from CSV files to Company and Fund models'

    def handle(self, *args, **options):
        # Use BASE_DIR from settings, which is the 'backend' folder
        company_file_path = os.path.join(settings.BASE_DIR, 'media', 'data.xlsx - Company.csv')
        fund_file_path = os.path.join(settings.BASE_DIR, 'media', 'data.xlsx - Fund.csv')

        self.stdout.write(f"Starting CSV sync...")
        self.stdout.write(f"Company file path: {company_file_path}")
        self.stdout.write(f"Fund file path: {fund_file_path}")

        companies_created = 0
        companies_updated = 0
        funds_created = 0
        funds_updated = 0

        # Process Company Data
        try:
            if not os.path.exists(company_file_path):
                raise CommandError(f'Company file not found at: {company_file_path}')
                
            company_df = pd.read_csv(company_file_path)
            
            # Clean column names
            company_df.columns = company_df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('(', '').str.replace(')', '')

            for index, row in company_df.iterrows():
                isin = self._safe_get(row, 'isin')
                if not isin:
                    continue  # Skip rows without an ISIN

                company_data = {
                    'company_name': self._safe_get(row, 'company_name', ''),
                    'sector': self._safe_get(row, 'sector', ''),
                    'esg_sector': self._safe_get(row, 'esg_sector', ''),
                    'bse_symbol': self._safe_get(row, 'bse_symbol', ''),
                    'nse_symbol': self._safe_get(row, 'nse_symbol', ''),
                    'market_cap': self._safe_get(row, 'mcap_rs_cr', ''),
                    'e_score': self._safe_get(row, 'e_pillar', ''),
                    's_score': self._safe_get(row, 's_pillar', ''),
                    'g_score': self._safe_get(row, 'g_pillar', ''),
                    'esg_score': self._safe_get(row, 'esg_pillar', ''),
                    'composite': self._safe_get(row, 'composite_rating', ''),
                    'grade': self._safe_get(row, 'esg_rating', ''),
                    'positive': self._safe_get(row, 'positive_screen', ''),
                    'negative': self._safe_get(row, 'negative_screen', ''),
                    'controversy': self._safe_get(row, 'controversy_rating', ''),
                }
                
                # Use update_or_create to handle both new and existing records
                obj, created = Company.objects.update_or_create(
                    isin=isin,
                    defaults=company_data
                )
                
                if created:
                    companies_created += 1
                else:
                    companies_updated += 1

            self.stdout.write(self.style.SUCCESS(f"Companies: {companies_created} created, {companies_updated} updated"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error processing company data: {e}"))

        # Process Fund Data
        try:
            if not os.path.exists(fund_file_path):
                raise CommandError(f'Fund file not found at: {fund_file_path}')

            fund_df = pd.read_csv(fund_file_path)
            # Add fund processing logic here if needed
            self.stdout.write(self.style.SUCCESS(f"Funds: 0 created, 0 updated (Logic not implemented in this script)"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error processing fund data: {e}"))

    def _safe_get(self, row, key, default=None):
        """Safely get value from row, handling NaN and missing keys"""
        if key not in row.index:
            return default
        value = row.get(key)
        if pd.isna(value):
            return default
        return str(value).strip()