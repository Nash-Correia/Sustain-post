from django.core.management.base import BaseCommand
from api.models import CustomUser
from api.models import Report, UserReport


class Command(BaseCommand):
    help = 'Populate sample reports data for testing'

    def handle(self, *args, **options):
        # Sample companies and reports
        sample_reports = [
            {'company_name': 'Infosys Limited', 'sector': 'Technology', 'year': 2024, 'rating': 'A+'},
            {'company_name': 'Tata Consultancy Services', 'sector': 'Technology', 'year': 2024, 'rating': 'A'},
            {'company_name': 'Wipro Limited', 'sector': 'Technology', 'year': 2024, 'rating': 'B+'},
            {'company_name': 'Reliance Industries', 'sector': 'Energy', 'year': 2024, 'rating': 'B'},
            {'company_name': 'HDFC Bank', 'sector': 'Financial Services', 'year': 2024, 'rating': 'A-'},
            {'company_name': 'ICICI Bank', 'sector': 'Financial Services', 'year': 2024, 'rating': 'B+'},
            {'company_name': 'State Bank of India', 'sector': 'Financial Services', 'year': 2024, 'rating': 'B'},
            {'company_name': 'Bharti Airtel', 'sector': 'Telecommunications', 'year': 2024, 'rating': 'B+'},
            {'company_name': 'Maruti Suzuki', 'sector': 'Automotive', 'year': 2024, 'rating': 'B'},
            {'company_name': 'Asian Paints', 'sector': 'Chemicals', 'year': 2024, 'rating': 'A-'},
            
            # Some 2023 reports
            {'company_name': 'Infosys Limited', 'sector': 'Technology', 'year': 2023, 'rating': 'A'},
            {'company_name': 'Tata Consultancy Services', 'sector': 'Technology', 'year': 2023, 'rating': 'A-'},
            {'company_name': 'HDFC Bank', 'sector': 'Financial Services', 'year': 2023, 'rating': 'B+'},
            {'company_name': 'Reliance Industries', 'sector': 'Energy', 'year': 2023, 'rating': 'B+'},
        ]
        
        created_count = 0
        for report_data in sample_reports:
            report, created = Report.objects.get_or_create(
                company_name=report_data['company_name'],
                year=report_data['year'],
                defaults={
                    'sector': report_data['sector'],
                    'rating': report_data['rating'],
                    'report_url': f"/reports/{report_data['company_name'].replace(' ', '_').lower()}_{report_data['year']}.pdf"
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created report: {report}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} reports')
        )
        
        # Create a sample admin user if it doesn't exist
        admin_username = 'admin'
        if not CustomUser.objects.filter(username=admin_username).exists():
            admin_user = CustomUser.objects.create_user(
                username=admin_username,
                email='admin@example.com',
                password='admin123',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created admin user: {admin_username} (password: admin123)')
            )
        else:
            self.stdout.write('Admin user already exists')
            
        # Create a sample regular user if it doesn't exist
        user_username = 'testuser'
        if not CustomUser.objects.filter(username=user_username).exists():
            regular_user = CustomUser.objects.create_user(
                username=user_username,
                email='test@example.com',
                password='test123'
            )
            
            # Assign a couple of reports to the test user
            infosys_2024 = Report.objects.filter(company_name='Infosys Limited', year=2024).first()
            hdfc_2024 = Report.objects.filter(company_name='HDFC Bank', year=2024).first()
            
            if infosys_2024:
                UserReport.objects.get_or_create(
                    user=regular_user,
                    report=infosys_2024,
                    defaults={'notes': 'Sample assignment for testing'}
                )
                
            if hdfc_2024:
                UserReport.objects.get_or_create(
                    user=regular_user,
                    report=hdfc_2024,
                    defaults={'notes': 'Another sample assignment'}
                )
                
            self.stdout.write(
                self.style.SUCCESS(f'Created test user: {user_username} (password: test123) with sample reports')
            )
        else:
            self.stdout.write('Test user already exists')