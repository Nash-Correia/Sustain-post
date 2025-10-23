from rest_framework import serializers
from .models import Note, Report, UserReport, Company, Fund, UserCompany, CustomUser

class UserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model with profile fields built-in"""
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = CustomUser
        fields = [
            "username", "email", "password", "first_name", "last_name", 
            "phone_number", "organization", "job_title", "bio",
            "subscription_type", "is_verified"
        ]
        extra_kwargs = {"password": {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user

    def update(self, instance, validated_data):
        # Update user fields
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        
        return instance

class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for user details (without password)"""
    
    class Meta:
        model = CustomUser
        fields = [
            "username", "email", "first_name", "last_name", "date_joined", 
            "is_staff", "is_superuser", "phone_number", "organization", 
            "job_title", "bio", "subscription_type", "is_verified", "last_login"
        ]

class NoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author_name"]
        extra_kwargs = {"author": {"read_only": True}}

class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model"""
    class Meta:
        model = Report
        fields = ["id", "company_name", "sector", "year", "rating", "report_url", "report_file", "created_at", "is_active"]

class UserReportSerializer(serializers.ModelSerializer):
    """Serializer for UserReport model"""
    report = ReportSerializer(read_only=True)
    report_id = serializers.IntegerField(write_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    
    class Meta:
        model = UserReport
        fields = ["id", "report", "report_id", "user_username", "assigned_by_username", "assigned_at", "notes"]

class UserReportsListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing user's reports"""
    company_name = serializers.CharField(source='report.company_name', read_only=True)
    sector = serializers.CharField(source='report.sector', read_only=True)
    year = serializers.IntegerField(source='report.year', read_only=True)
    rating = serializers.CharField(source='report.rating', read_only=True)
    report_url = serializers.URLField(source='report.report_url', read_only=True)
    report_file = serializers.FileField(source='report.report_file', read_only=True)
    
    class Meta:
        model = UserReport
        fields = ["id", "company_name", "sector", "year", "rating", "report_url", "report_file", "assigned_at"]

class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    class Meta:
        model = Company
        fields = [
            "isin", "company_name", "sector", "esg_sector", "bse_symbol", "nse_symbol",
            "market_cap", "e_score", "s_score", "g_score", "esg_score", "composite", 
            "grade", "positive", "negative", "controversy", "created_at", "updated_at"
        ]



class UserCompanySerializer(serializers.ModelSerializer):
    """Serializer for UserCompany model"""
    company = CompanySerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    
    class Meta:
        model = UserCompany
        fields = [
            "id", "user", "company", "user_username", "assigned_by_username", 
            "assigned_at", "is_active", "notes"
        ]

class MyReportsSerializer(serializers.ModelSerializer):
    """Serializer for user's assigned companies in My Reports"""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    esg_sector = serializers.SerializerMethodField()  # Get from database
    esg_rating = serializers.SerializerMethodField()  # Get ESG Rating from database
    isin = serializers.CharField(source='company.isin', read_only=True)
    report_filename = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    
    def get_esg_sector(self, obj):
        """Get sector from database"""
        return obj.company.esg_sector or ''
    
    def get_esg_rating(self, obj):
        """Get ESG Rating from database"""
        return obj.company.esg_rating or ''
    
    def get_report_filename(self, obj):
        """Get the PDF filename from database"""
        return obj.company.pdf_filename if obj.company.has_pdf_report else None
    
    def get_download_url(self, obj):
        """Get the secure download URL for this company's report"""
        if obj.company.has_pdf_report and obj.company.pdf_filename:
            return f"/api/reports/download/{obj.company.company_name}/"
        return None
    
    class Meta:
        model = UserCompany
        fields = ["id", "isin", "company_name", "esg_sector", "esg_rating", "assigned_at", "notes", "report_filename", "download_url"]

class FundSerializer(serializers.ModelSerializer):
    """Serializer for Fund model"""
    class Meta:
        model = Fund
        fields = ["id", "fund_name", "score", "percentage", "grade", "created_at", "updated_at"]

class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model with all fields"""
    class Meta:
        model = Company
        fields = [
            "isin", "company_name", "sector", "esg_rating", "pdf_filename",
            "created_at", "updated_at"
        ]

class CompanyListSerializer(serializers.ModelSerializer):
    """Serializer for Company listing - supports both ESG Reports and Comparison Tool"""
    has_pdf_report = serializers.SerializerMethodField()
    
    def get_has_pdf_report(self, obj):
        """Check if company has a PDF report available for download"""
        return bool(obj.pdf_filename and obj.pdf_filename.strip())
    
    class Meta:
        model = Company
        fields = [
            "isin", "company_name", "esg_sector", "esg_rating", "grade",
            "pdf_filename", "has_pdf_report"
        ]