from django.core.management.base import BaseCommand
from api.models import CustomUser
from django.core import serializers
from django.db import transaction
import json
import os


class Command(BaseCommand):
    help = 'Backup or restore user accounts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            choices=['backup', 'restore'],
            required=True,
            help='Action to perform: backup or restore'
        )
        parser.add_argument(
            '--file',
            default='users_backup.json',
            help='Backup file path (default: users_backup.json)'
        )

    def handle(self, *args, **options):
        action = options['action']
        file_path = options['file']

        if action == 'backup':
            self.backup_users(file_path)
        elif action == 'restore':
            self.restore_users(file_path)

    def backup_users(self, file_path):
        try:
            # Get all users with their profiles
            users = User.objects.all()
            
            if not users.exists():
                self.stdout.write(self.style.WARNING('No users found to backup'))
                return

            # Serialize users
            user_data = serializers.serialize('json', users, indent=2)
            
            # Write to file
            with open(file_path, 'w') as f:
                f.write(user_data)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully backed up {users.count()} users to {file_path}'
                )
            )
            
            # Show summary
            superusers = users.filter(is_superuser=True).count()
            staff = users.filter(is_staff=True, is_superuser=False).count()
            regular = users.filter(is_staff=False, is_superuser=False).count()
            
            self.stdout.write(f'  - Superusers: {superusers}')
            self.stdout.write(f'  - Staff: {staff}')
            self.stdout.write(f'  - Regular users: {regular}')

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error backing up users: {str(e)}')
            )

    def restore_users(self, file_path):
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'Backup file not found: {file_path}')
            )
            return

        try:
            with transaction.atomic():
                # Read backup file
                with open(file_path, 'r') as f:
                    user_data = f.read()

                # Check if users already exist
                existing_users = User.objects.count()
                if existing_users > 0:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Found {existing_users} existing users. This will add to them, not replace.'
                        )
                    )
                    
                    response = input('Continue? (y/N): ')
                    if response.lower() != 'y':
                        self.stdout.write('Restore cancelled.')
                        return

                # Deserialize and save users
                restored_count = 0
                skipped_count = 0
                
                for obj in serializers.deserialize('json', user_data):
                    # Check if user already exists by username
                    if CustomUser.objects.filter(username=obj.object.username).exists():
                        self.stdout.write(
                            self.style.WARNING(f'Skipping existing user: {obj.object.username}')
                        )
                        skipped_count += 1
                        continue
                    
                    obj.save()
                    restored_count += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully restored {restored_count} users from {file_path}'
                    )
                )
                
                if skipped_count > 0:
                    self.stdout.write(
                        self.style.WARNING(f'Skipped {skipped_count} existing users')
                    )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error restoring users: {str(e)}')
            )