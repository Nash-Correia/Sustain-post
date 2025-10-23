from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.db.models import Count
from django.utils.html import format_html
from django.shortcuts import render, redirect
from django.urls import path, reverse
from django.utils.safestring import mark_safe
from .models import CustomUser, Company, UserCompany, Fund, Report, UserReport, Note

# Inline for UserCompany assignments
class UserCompanyInline(admin.TabularInline):
    model = UserCompany
    fk_name = 'user'  # Specify which foreign key to use
    extra = 1
    fields = ('company', 'is_active', 'notes')
    autocomplete_fields = ['company']

# Custom User Admin for CustomUser
class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserCompanyInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'subscription_type', 'assigned_companies_count', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'subscription_type', 'is_verified', 'date_joined')
    
    # Add the profile fields to the user admin
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('phone_number', 'organization', 'job_title', 'bio')
        }),
        ('Subscription & Access', {
            'fields': ('subscription_type', 'subscription_expires', 'is_verified')
        }),
        ('Security', {
            'fields': ('failed_login_attempts', 'last_failed_login', 'is_locked')
        }),
    )
    
    def assigned_companies_count(self, obj):
        count = obj.assigned_companies.filter(is_active=True).count()
        if count > 0:
            return format_html('<span style="color: green;"><strong>{}</strong></span>', count)
        return count
    assigned_companies_count.short_description = 'Assigned Companies'

# Company Admin
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'isin', 'esg_sector', 'grade', 'assigned_users_count', 'created_at')
    list_filter = ('esg_sector', 'grade', 'market_cap')
    search_fields = ('company_name', 'isin', 'bse_symbol', 'nse_symbol')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('company_name',)
    actions = ['assign_to_users']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('isin', 'company_name', 'sector', 'esg_sector')
        }),
        ('Stock Symbols', {
            'fields': ('bse_symbol', 'nse_symbol', 'market_cap'),
            'classes': ('collapse',)
        }),
        ('ESG Scores', {
            'fields': ('e_score', 's_score', 'g_score', 'esg_score'),
            'classes': ('collapse',)
        }),
        ('Ratings & Screening', {
            'fields': ('composite', 'grade', 'positive', 'negative', 'controversy'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def assigned_users_count(self, obj):
        count = obj.assigned_users.filter(is_active=True).count()
        if count > 0:
            return format_html('<span style="color: blue;"><strong>{}</strong></span>', count)
        return count
    assigned_users_count.short_description = 'Assigned Users'
    
    def assign_to_users(self, request, queryset):
        if 'apply' in request.POST:
            # Get selected user IDs from form
            user_ids = request.POST.getlist('users')
            if user_ids:
                users = CustomUser.objects.filter(username__in=user_ids)  # Use username instead of id
                created_count = 0
                for company in queryset:
                    for user in users:
                        assignment, created = UserCompany.objects.get_or_create(
                            user=user,
                            company=company,
                            defaults={
                                'assigned_by': request.user,
                                'is_active': True,
                                'notes': f'Bulk assigned via admin panel'
                            }
                        )
                        if created:
                            created_count += 1
                self.message_user(request, f'{created_count} new assignments were created.')
                return redirect('admin:api_usercompany_changelist')
        
        # Show form to select users
        users = CustomUser.objects.filter(is_active=True).order_by('username')
        context = {
            'title': f'Assign {queryset.count()} companies to users',
            'companies': queryset,
            'users': users,
            'action_checkbox_name': admin.ACTION_CHECKBOX_NAME,
            'queryset': queryset,
        }
        return render(request, 'admin/assign_companies_to_users.html', context)
    
    assign_to_users.short_description = "Assign selected companies to users"

# UserCompany Admin - Main interface for managing assignments
@admin.register(UserCompany)
class UserCompanyAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'company_isin', 'company_grade', 'assigned_by', 'assigned_at', 'is_active')
    list_filter = ('is_active', 'assigned_at', 'company__esg_sector', 'company__grade')
    search_fields = ('user__username', 'user__email', 'company__company_name', 'company__isin')
    autocomplete_fields = ['user', 'company', 'assigned_by']
    readonly_fields = ('assigned_at',)
    date_hierarchy = 'assigned_at'
    actions = ['activate_assignments', 'deactivate_assignments', 'bulk_assign_to_user']
    
    fieldsets = (
        ('Assignment Details', {
            'fields': ('user', 'company', 'is_active')
        }),
        ('Administrative', {
            'fields': ('assigned_by', 'assigned_at', 'notes')
        })
    )
    
    def company_name(self, obj):
        return obj.company.company_name
    company_name.short_description = 'Company Name'
    
    def company_isin(self, obj):
        return obj.company.isin
    company_isin.short_description = 'ISIN'
    
    def company_grade(self, obj):
        grade = obj.company.grade
        if grade:
            color = 'green' if grade.startswith('A') else 'orange' if grade.startswith('B') else 'red'
            return format_html('<span style="color: {};"><strong>{}</strong></span>', color, grade)
        return '-'
    company_grade.short_description = 'ESG Grade'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set assigned_by for new assignments
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)
    
    def activate_assignments(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} assignments were activated.')
    activate_assignments.short_description = "Activate selected assignments"
    
    def deactivate_assignments(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} assignments were deactivated.')
    deactivate_assignments.short_description = "Deactivate selected assignments"

# Fund Admin
@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
    list_display = ('fund_name', 'score', 'percentage', 'grade', 'created_at')
    list_filter = ('grade', 'created_at')
    search_fields = ('fund_name',)
    readonly_fields = ('created_at', 'updated_at')

# Report Admin
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'sector', 'year', 'rating', 'is_active', 'owners_count')
    list_filter = ('year', 'rating', 'is_active', 'sector')
    search_fields = ('company_name',)
    readonly_fields = ('created_at', 'updated_at')
    
    def owners_count(self, obj):
        count = obj.owners.count()
        return count
    owners_count.short_description = 'Users with Access'

# UserReport Admin
@admin.register(UserReport)
class UserReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'report_company', 'report_year', 'assigned_at', 'assigned_by')
    list_filter = ('assigned_at', 'report__year', 'report__rating')
    search_fields = ('user__username', 'report__company_name')
    autocomplete_fields = ['user', 'report', 'assigned_by']
    readonly_fields = ('assigned_at',)
    
    def report_company(self, obj):
        return obj.report.company_name
    report_company.short_description = 'Company'
    
    def report_year(self, obj):
        return obj.report.year
    report_year.short_description = 'Year'

# Note Admin
@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('title', 'content')
    readonly_fields = ('created_at',)

# Unregister the default User admin and register our custom one
admin.site.register(CustomUser, CustomUserAdmin)

# Customize admin site headers
admin.site.site_header = "IiAS ESG Platform Admin"
admin.site.site_title = "IiAS Admin Portal"
admin.site.index_title = "Welcome to IiAS ESG Platform Administration"
