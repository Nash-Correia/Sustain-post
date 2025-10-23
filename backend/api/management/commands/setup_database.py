from django.core.management.base import BaseCommand
from api.models import CustomUser
from django.db import transaction
from api.models import Company, UserCompany
# Import will be handled dynamically
import os


class Command(BaseCommand):
    help = 'Complete database setup: create superuser, sync companies, and setup sample data'

    def add_arguments(self, parser):
        parser.add_argument('--skip-companies', action='store_true', help='Skip company data sync')
        parser.add_argument('--create-demo-user', action='store_true', help='Create a demo user with sample assignments')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== IiAS ESG Platform Database Setup ==='))
        
        # 1. Create superuser if none exists
        self.create_superuser()
        
        # 2. Sync company data unless skipped
        if not options['skip_companies']:
            self.sync_companies()
        
        # 3. Create demo user if requested
        if options['create_demo_user']:
            self.create_demo_user()
        
        # 4. Show summary
        self.show_summary()

    def create_superuser(self):
        self.stdout.write('\n1. Checking superuser accounts...')
        
        if CustomUser.objects.filter(is_superuser=True).exists():
            superusers = CustomUser.objects.filter(is_superuser=True)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Found existing superuser(s): {", ".join([u.username for u in superusers])}')
            )
        else:
            try:
                with transaction.atomic():
                    user = User.objects.create_superuser(
                        username='admin',
                        email='admin@iias.in',
                        password='admin123',
                        first_name='Admin',
                        last_name='User'
                    )
                    self.stdout.write(self.style.SUCCESS('✓ Created superuser: admin'))
                    self.stdout.write(self.style.WARNING('  Username: admin, Password: admin123'))
                    self.stdout.write(self.style.WARNING('  Please change the password after first login!'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error creating superuser: {e}'))

    def sync_companies(self):
        self.stdout.write('\n2. Syncing company data...')
        
        company_count = Company.objects.count()
        if company_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Found {company_count} companies in database'))
        else:
            try:
                # Try to run the sync command
                from django.core.management import call_command
                call_command('sync_excel_to_db')
                self.stdout.write(self.style.SUCCESS(f'✓ Synced {Company.objects.count()} companies'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error syncing companies: {e}'))
                self.stdout.write('  Make sure data.xlsx exists in public/ directory')

    def create_demo_user(self):
        self.stdout.write('\n3. Creating demo user...')
        
        try:
            with transaction.atomic():
                # Create demo user
                demo_user, created = User.objects.get_or_create(
                    username='demo',
                    defaults={
                        'email': 'demo@example.com',
                        'first_name': 'Demo',
                        'last_name': 'User',
                        'is_active': True
                    }
                )
                
                if created:
                    demo_user.set_password('demo123')
                    demo_user.save()
                    self.stdout.write(self.style.SUCCESS('✓ Created demo user: demo'))
                    self.stdout.write('  Username: demo, Password: demo123')
                else:
                    self.stdout.write(self.style.SUCCESS('✓ Demo user already exists'))

                # Assign some sample companies
                if Company.objects.exists():
                    sample_companies = Company.objects.all()[:5]  # First 5 companies
                    admin_user = CustomUser.objects.filter(is_superuser=True).first()
                    
                    assignments_created = 0
                    for company in sample_companies:
                        assignment, created = UserCompany.objects.get_or_create(
                            user=demo_user,
                            company=company,
                            defaults={
                                'assigned_by': admin_user,
                                'is_active': True,
                                'notes': 'Demo assignment created during setup'
                            }
                        )
                        if created:
                            assignments_created += 1
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Assigned {assignments_created} companies to demo user')
                    )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Error creating demo user: {e}'))

    def show_summary(self):
        self.stdout.write('\n=== Database Summary ===')
        
        # Users
        total_users = CustomUser.objects.count()
        superusers = CustomUser.objects.filter(is_superuser=True).count()
        self.stdout.write(f'Users: {total_users} total, {superusers} superusers')
        
        # Companies
        total_companies = Company.objects.count()
        self.stdout.write(f'Companies: {total_companies}')
        
        # Assignments
        total_assignments = UserCompany.objects.count()
        active_assignments = UserCompany.objects.filter(is_active=True).count()
        self.stdout.write(f'Assignments: {active_assignments} active, {total_assignments} total')
        
        self.stdout.write('\n=== Next Steps ===')
        self.stdout.write('1. Start the server: python manage.py runserver')
        self.stdout.write('2. Access admin: http://127.0.0.1:8000/admin/')
        self.stdout.write('3. Test frontend: http://127.0.0.1:3000/')
        self.stdout.write(self.style.SUCCESS('\n✓ Setup complete!'))