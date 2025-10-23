from django.urls import path
from . import views

urlpatterns = [
    # User management
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('user/register/', views.register_user, name='register_user'),
    
    # Notes management
    path('notes/', views.NoteListCreate.as_view(), name='note_list_create'),
    path('notes/<int:pk>/', views.NoteUpdate.as_view(), name='note_update'),
    path('notes/<int:pk>/delete/', views.NoteDelete.as_view(), name='note_delete'),
    
    # Report management
    path('reports/', views.all_reports, name='all_reports'),  # All available reports
    path('user-reports/', views.user_reports, name='user_reports'),  # User's owned reports
    
    # Admin report management
    path('admin/reports/', views.ReportListCreate.as_view(), name='admin_reports'),
    path('admin/reports/<int:pk>/', views.ReportDetail.as_view(), name='admin_report_detail'),
    path('admin/assign-report/', views.assign_report_to_user, name='assign_report'),
    path('admin/remove-report/<int:user_report_id>/', views.remove_report_from_user, name='remove_report'),
    path('admin/user-reports/', views.admin_user_reports, name='admin_user_reports'),
    path('admin/user-reports/<int:user_id>/', views.admin_user_reports_by_id, name='admin_user_reports_by_id'),
    path('admin/users/', views.admin_users_list, name='admin_users_list'),
    path('admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    
    # Company & Fund Data APIs
    path('companies/', views.company_list, name='companies'),  # All Reports page
    path('my-reports/', views.my_reports, name='my_reports'),  # My Reports page
    path('request-report/', views.request_company_report, name='request_report'),  # Request company report
    path('funds/', views.fund_list, name='funds'),
    
    # Secure PDF Download & Management
    path('reports/download/<str:company_name>/', views.download_company_report, name='download_company_report'),
    path('reports/view/<str:company_name>/', views.view_company_report, name='view_company_report'),
    path('admin/available-reports/', views.list_available_reports, name='list_available_reports'),
    path('admin/assign-available-report/', views.assign_available_report, name='assign_available_report'),
    
    # Admin company assignment management
    path('admin/assign-company/', views.assign_company_to_user, name='assign_company'),
    path('admin/remove-company/<int:assignment_id>/', views.remove_company_from_user, name='remove_company_assignment'),
    path('admin/remove-all-companies/<int:user_id>/', views.remove_all_companies_from_user, name='remove_all_companies'),
    path('admin/company-assignments/', views.admin_user_company_assignments, name='admin_company_assignments'),
    path('admin/sync-excel/', views.sync_excel_data, name='sync_excel'),
]