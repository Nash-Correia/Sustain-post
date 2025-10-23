"""
Django management command to load all Excel data into the database
Usage: python manage.py load_excel_data
"""
import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import transaction
from api.models import Company, Fund
import glob


class Command(BaseCommand):
    help = 'Load all Excel data into database with PDF filename mapping'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reload data (clears existing data)',
        )
        parser.add_argument(
            '--excel-path',
            type=str,
            help='Custom path to Excel file',
            default=None
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting Excel data loading...'))

        # Determine Excel file path
        if options['excel_path']:
            excel_path = options['excel_path']
        else:
            excel_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'data.xlsx')

        if not os.path.exists(excel_path):
            self.stdout.write(self.style.ERROR(f'❌ Excel file not found: {excel_path}'))
            return

        # Get PDF files mapping
        pdf_mapping = self.get_pdf_filename_mapping()
        self.stdout.write(self.style.SUCCESS(f'📁 Found {len(pdf_mapping)} PDF files'))

        # Clear existing data if force flag is used
        if options['force']:
            self.stdout.write(self.style.WARNING('🗑️  Clearing existing data...'))
            Company.objects.all().delete()

        # Load Excel data
        try:
            with transaction.atomic():
                companies_loaded = self.load_companies_data(excel_path, pdf_mapping)
                funds_loaded = self.load_funds_data(excel_path)

            self.stdout.write(self.style.SUCCESS(
                f'✅ Successfully loaded {companies_loaded} companies and {funds_loaded} funds'
            ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error loading data: {str(e)}'))
            raise

    def get_pdf_filename_mapping(self):
        """Create mapping of company names to PDF filenames"""
        pdf_dir = os.path.join(settings.BASE_DIR, 'media', 'secure_reports')
        if not os.path.exists(pdf_dir):
            self.stdout.write(self.style.WARNING(f'⚠️  PDF directory not found: {pdf_dir}'))
            return {}

        pdf_files = glob.glob(os.path.join(pdf_dir, '*.pdf'))
        pdf_mapping = {}

        for pdf_path in pdf_files:
            filename = os.path.basename(pdf_path)
            # Convert filename to company name format
            # "Bajaj_Finance_Limited.pdf" -> "Bajaj Finance Limited"
            company_name = filename.replace('.pdf', '').replace('_', ' ')
            pdf_mapping[company_name.upper()] = filename

        return pdf_mapping

    def load_companies_data(self, excel_path, pdf_mapping):
        """Load companies data from Excel"""
        self.stdout.write('📊 Loading companies data from Excel...')
        
        df = pd.read_excel(excel_path)
        df.columns = df.columns.str.strip()  # Clean column names
        
        companies_loaded = 0
        
        for _, row in df.iterrows():
            try:
                # Basic company information
                isin = str(row.get('ISIN', '')).strip() if pd.notna(row.get('ISIN')) else ''
                company_name = str(row.get('Company Name', '')).strip() if pd.notna(row.get('Company Name')) else ''
                
                if not isin or not company_name:
                    continue  # Skip rows without essential data
                
                # Check if PDF exists for this company
                company_name_upper = company_name.upper()
                pdf_filename = None
                has_pdf = False
                
                # Try exact match first
                if company_name_upper in pdf_mapping:
                    pdf_filename = pdf_mapping[company_name_upper]
                    has_pdf = True
                else:
                    # Try partial matches
                    for pdf_company, pdf_file in pdf_mapping.items():
                        if self.companies_match(company_name_upper, pdf_company):
                            pdf_filename = pdf_file
                            has_pdf = True
                            break
                
                # Create or update company record
                company, created = Company.objects.update_or_create(
                    isin=isin,
                    defaults={
                        # Basic info
                        'company_name': company_name,
                        'sr_no': str(row.get('Sr No.', '')).strip() if pd.notna(row.get('Sr No.')) else '',
                        'bse_symbol': str(row.get('BSE Symbol', '')).strip() if pd.notna(row.get('BSE Symbol')) else '',
                        'nse_symbol': str(row.get('NSE Symbol', '')).strip() if pd.notna(row.get('NSE Symbol')) else '',
                        'sector': str(row.get('Sector', '')).strip() if pd.notna(row.get('Sector')) else '',
                        'industry': str(row.get('Industry', '')).strip() if pd.notna(row.get('Industry')) else '',
                        'esg_sector': str(row.get('ESG Sector', '')).strip() if pd.notna(row.get('ESG Sector')) else '',
                        'market_cap': str(row.get('Mcap', '')).strip() if pd.notna(row.get('Mcap')) else '',
                        
                        # ESG Scores
                        'e_pillar': str(row.get('E Pillar', '')).strip() if pd.notna(row.get('E Pillar')) else '',
                        's_pillar': str(row.get('S Pillar', '')).strip() if pd.notna(row.get('S Pillar')) else '',
                        'g_pillar': str(row.get('G Pillar', '')).strip() if pd.notna(row.get('G Pillar')) else '',
                        'esg_pillar': str(row.get('ESG Pillar', '')).strip() if pd.notna(row.get('ESG Pillar')) else '',
                        
                        # Screening and Ratings
                        'positive_screen': str(row.get('Positive Screen', '')).strip() if pd.notna(row.get('Positive Screen')) else '',
                        'negative_screen': str(row.get('Negative Screen', '')).strip() if pd.notna(row.get('Negative Screen')) else '',
                        'controversy_rating': str(row.get('Controversy Rating', '')).strip() if pd.notna(row.get('Controversy Rating')) else '',
                        'composite_rating': str(row.get('Composite Rating', '')).strip() if pd.notna(row.get('Composite Rating')) else '',
                        'esg_rating': str(row.get('ESG Rating', '')).strip() if pd.notna(row.get('ESG Rating')) else '',
                        
                        # PDF Information
                        'pdf_filename': pdf_filename,
                        'has_pdf_report': has_pdf,
                        
                        # Legacy fields (for backward compatibility)
                        'grade': str(row.get('ESG Rating', '')).strip() if pd.notna(row.get('ESG Rating')) else '',
                        'e_score': str(row.get('E Pillar', '')).strip() if pd.notna(row.get('E Pillar')) else '',
                        's_score': str(row.get('S Pillar', '')).strip() if pd.notna(row.get('S Pillar')) else '',
                        'g_score': str(row.get('G Pillar', '')).strip() if pd.notna(row.get('G Pillar')) else '',
                        'esg_score': str(row.get('ESG Pillar', '')).strip() if pd.notna(row.get('ESG Pillar')) else '',
                        'positive': str(row.get('Positive Screen', '')).strip() if pd.notna(row.get('Positive Screen')) else '',
                        'negative': str(row.get('Negative Screen', '')).strip() if pd.notna(row.get('Negative Screen')) else '',
                        'controversy': str(row.get('Controversy Rating', '')).strip() if pd.notna(row.get('Controversy Rating')) else '',
                        'composite': str(row.get('Composite Rating', '')).strip() if pd.notna(row.get('Composite Rating')) else '',
                    }
                )
                
                if created:
                    self.stdout.write(f'➕ Created: {company_name}')
                else:
                    self.stdout.write(f'🔄 Updated: {company_name}')
                    
                companies_loaded += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error processing row: {str(e)}'))
                continue
        
        return companies_loaded

    def load_funds_data(self, excel_path):
        """Load funds data from Excel if exists"""
        # This can be expanded later if there's a funds sheet
        return 0

    def companies_match(self, name1, name2):
        """Check if two company names are similar enough to be the same company"""
        # Remove common words that might differ
        stop_words = ['LIMITED', 'LTD', 'PRIVATE', 'PVT', 'COMPANY', 'CO', 'CORPORATION', 'CORP', 'INC']
        
        def clean_name(name):
            name = name.upper().strip()
            for word in stop_words:
                name = name.replace(f' {word}', '').replace(f'{word} ', '').replace(word, '')
            return name.strip()
        
        clean1 = clean_name(name1)
        clean2 = clean_name(name2)
        
        # Check if one is contained in the other (for partial matches)
        return clean1 in clean2 or clean2 in clean1 or clean1 == clean2