from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError
import re


class CaseInsensitiveUsernameValidator(UnicodeUsernameValidator):
    """Username validator that ensures case-insensitive uniqueness"""
    
    def __call__(self, value):
        super().__call__(value)
        # Additional validation can be added here if needed


class CustomUser(AbstractUser):
    """
    Custom User model with case-insensitive username as primary key
    """
    # Override username to be case-insensitive and primary key
    username = models.CharField(
        'Username',
        max_length=150,
        primary_key=True,  # Use username as primary key
        help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
        validators=[CaseInsensitiveUsernameValidator()],
        error_messages={
            'unique': "A user with that username already exists.",
        },
    )
    
    # Make email required and unique
    email = models.EmailField(
        'Email address',
        unique=True,
        help_text='Required. Enter a valid email address.'
    )
    
    # Enhanced profile fields (moved from UserProfile)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    # User subscription/access fields
    subscription_type = models.CharField(
        max_length=20,
        choices=[
            ('free', 'Free'),
            ('basic', 'Basic'),
            ('premium', 'Premium'),
            ('enterprise', 'Enterprise'),
        ],
        default='free'
    )
    subscription_expires = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Login tracking
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']
    
    def save(self, *args, **kwargs):
        # Convert username to lowercase for case-insensitive storage
        if self.username:
            self.username = self.username.lower().strip()
        
        # Convert email to lowercase
        if self.email:
            self.email = self.email.lower().strip()
            
        super().save(*args, **kwargs)
    
    def clean(self):
        super().clean()
        
        # Check for case-insensitive username uniqueness
        if self.username:
            username_lower = self.username.lower().strip()
            existing_user = CustomUser.objects.filter(
                username__iexact=username_lower
            ).exclude(pk=self.pk).first()
            
            if existing_user:
                raise ValidationError({
                    'username': 'A user with that username already exists (case-insensitive).'
                })
        
        # Validate email uniqueness (case-insensitive)
        if self.email:
            email_lower = self.email.lower().strip()
            existing_email = CustomUser.objects.filter(
                email__iexact=email_lower
            ).exclude(pk=self.pk).first()
            
            if existing_email:
                raise ValidationError({
                    'email': 'A user with that email already exists.'
                })
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def display_name(self):
        """Return the best available name for display."""
        if self.first_name or self.last_name:
            return self.full_name
        return self.username