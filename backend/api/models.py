from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError


class CaseInsensitiveUsernameValidator(UnicodeUsernameValidator):
    """Username validator that ensures case-insensitive uniqueness"""
    pass


class CustomUser(AbstractUser):
    """
    Custom User model with case-insensitive username and standard id primary key
    """
    # Override username to be case-insensitive and unique (but not primary key)
    username = models.CharField(
        'Username',
        max_length=150,
        unique=True,  # Keep unique but not primary key
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
    
    # Enhanced profile fields (consolidated from UserProfile)
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
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.username

class Company(models.Model):
    """Company ESG data from Excel sheet - All fields as text to avoid type issues"""
    isin = models.CharField(max_length=14, primary_key=True)  # ISIN as primary key (text)
    company_name = models.CharField(max_length=200, blank=True, null=True)  # Increased length
    
    # Basic company info from Excel
    bse_symbol = models.CharField(max_length=50, blank=True, null=True)  # BSE Symbol
    nse_symbol = models.CharField(max_length=50, blank=True, null=True)  # NSE Symbol
    sector = models.CharField(max_length=100, blank=True, null=True)  # Sector
    industry = models.CharField(max_length=100, blank=True, null=True)  # Industry
    esg_sector = models.CharField(max_length=100, blank=True, null=True)  # ESG Sector from Excel
    market_cap = models.CharField(max_length=50, blank=True, null=True)  # Mcap as text
    
    # ESG Scores - all as text to avoid conversion issues
    e_pillar = models.CharField(max_length=20, blank=True, null=True)  # E Pillar
    s_pillar = models.CharField(max_length=20, blank=True, null=True)  # S Pillar  
    g_pillar = models.CharField(max_length=20, blank=True, null=True)  # G Pillar
    esg_pillar = models.CharField(max_length=20, blank=True, null=True)  # ESG Pillar
    
    # Screening & Ratings - all as text
    positive_screen = models.CharField(max_length=50, blank=True, null=True)  # Positive Screen
    negative_screen = models.CharField(max_length=50, blank=True, null=True)  # Negative Screen
    controversy_rating = models.CharField(max_length=50, blank=True, null=True)  # Controversy Rating
    composite_rating = models.CharField(max_length=50, blank=True, null=True)  # Composite Rating
    esg_rating = models.CharField(max_length=10, blank=True, null=True)  # ESG Rating (grade)
    
    # PDF File Information
    pdf_filename = models.CharField(max_length=200, blank=True, null=True)  # Matched PDF filename
    has_pdf_report = models.BooleanField(default=False)  # Whether PDF exists for this company
    
    # Excel raw data (for debugging and future use)
    sr_no = models.CharField(max_length=10, blank=True, null=True)  # Sr No. from Excel
    
    # Legacy fields (for backward compatibility)
    grade = models.CharField(max_length=4, blank=True, null=True)  # Maps to esg_rating
    e_score = models.CharField(max_length=20, blank=True, null=True)  # Maps to e_pillar
    s_score = models.CharField(max_length=20, blank=True, null=True)  # Maps to s_pillar
    g_score = models.CharField(max_length=20, blank=True, null=True)  # Maps to g_pillar
    esg_score = models.CharField(max_length=20, blank=True, null=True)  # Maps to esg_pillar
    positive = models.CharField(max_length=15, blank=True, null=True)  # Maps to positive_screen
    negative = models.CharField(max_length=15, blank=True, null=True)  # Maps to negative_screen
    controversy = models.CharField(max_length=15, blank=True, null=True)  # Maps to controversy_rating
    composite = models.CharField(max_length=20, blank=True, null=True)  # Maps to composite_rating
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} ({self.isin})"

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['company_name']

class UserCompany(models.Model):
    """Track which companies are assigned to which users by admins"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='assigned_companies')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='assigned_users')
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='company_assignments_made')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)  # Admin notes about the assignment

    class Meta:
        unique_together = ('user', 'company')  # Prevent duplicate assignments
        ordering = ['-assigned_at']
        verbose_name = "User Company Assignment"
        verbose_name_plural = "User Company Assignments"

    def __str__(self):
        return f"{self.user.username} - {self.company.company_name}"

class Fund(models.Model):
    """Fund data from Excel sheet"""
    fund_name = models.CharField(max_length=200, unique=True)
    score = models.FloatField(null=True, blank=True)
    percentage = models.CharField(max_length=20, blank=True, null=True)
    grade = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.fund_name

    class Meta:
        ordering = ['fund_name']

class Report(models.Model):
    """ESG Reports available in the system"""
    company_name = models.CharField(max_length=200)
    sector = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField()
    rating = models.CharField(max_length=10)  # A+, B, C+, etc.
    report_url = models.URLField(blank=True, null=True)
    report_file = models.FileField(upload_to='reports/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.company_name} - {self.year}"

    class Meta:
        ordering = ['-year', 'company_name']
        unique_together = ['company_name', 'year']

class UserReport(models.Model):
    """Tracks which reports a user owns/has access to"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='owned_reports')
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='owners')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_reports')
    notes = models.TextField(blank=True, null=True)  # Admin notes

    def __str__(self):
        return f"{self.user.username} - {self.report}"

    class Meta:
        unique_together = ['user', 'report']
        ordering = ['-assigned_at']

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
