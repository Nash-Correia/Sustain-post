from django.core.management.base import BaseCommand
from api.models import CustomUser
from django.db import transaction
import os


class Command(BaseCommand):
    help = 'Create a superuser account if it does not exist'

    def add_arguments(self, parser):
        parser.add_argument('--username', default='admin', help='Username for superuser')
        parser.add_argument('--email', default='admin@iias.in', help='Email for superuser')
        parser.add_argument('--password', default='admin123', help='Password for superuser')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        try:
            with transaction.atomic():
                # Check if superuser already exists
                if CustomUser.objects.filter(is_superuser=True).exists():
                    existing_superusers = CustomUser.objects.filter(is_superuser=True)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Superuser(s) already exist: {", ".join([u.username for u in existing_superusers])}'
                        )
                    )
                    return

                # Create superuser
                user = CustomUser.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created superuser: {username} with email: {email}'
                    )
                )
                self.stdout.write(
                    self.style.WARNING(
                        f'Default password is: {password} - Please change it after first login!'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )