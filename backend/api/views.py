from django.shortcuts import get_object_or_404
from django.http import HttpResponse, FileResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken

import os
import pandas as pd

from .serializers import (
    UserSerializer, UserDetailSerializer, NoteSerializer,
    ReportSerializer, UserReportSerializer, UserReportsListSerializer,
    CompanySerializer, CompanyListSerializer, FundSerializer,
    UserCompanySerializer, MyReportsSerializer
)

from .models import Note, Report, UserReport, Company, Fund, UserCompany, CustomUser

User = get_user_model()  # Standardize user model

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    try:
        print("Registration attempt:", request.data)  # Debug log
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Return user data with tokens
            user_data = UserDetailSerializer(user).data
            
            return Response({
                'user': user_data,
                'access': str(access_token),
                'refresh': str(refresh),
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)  # Debug log
            return Response({
                'error': 'Registration failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print("Registration error:", str(e))  # Debug log
        return Response({
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# Utilities
# =========================
def get_company_name_mappings():
    """
    Load Excel data and create mappings between:
    - PDF filename -> Company display data
    - Company name -> PDF filename
    """
    try:
        excel_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'data.xlsx')
        if not os.path.exists(excel_path):
            return {}, {}

        df = pd.read_excel(excel_path)
        df.columns = df.columns.str.strip()

        filename_to_company_data = {}
        name_to_filename = {}

        reports_dir = os.path.join(settings.BASE_DIR, 'media', 'secure_reports')
        pdf_files = [f for f in os.listdir(reports_dir)] if os.path.exists(reports_dir) else []
        pdf_files = [f for f in pdf_files if f.lower().endswith('.pdf')]

        for _, row in df.iterrows():
            company_name = row.get('Company Name')
            pdf_filename = row.get('file name')
            sector = row.get('Sector', '')
            esg_rating = row.get('ESG Rating', '')

            if pd.notna(company_name) and pd.notna(pdf_filename):
                company_name = str(company_name).strip()
                pdf_filename = str(pdf_filename).strip()

                if pdf_filename in pdf_files:
                    company_data = {
                        'company_name': company_name,
                        'pdf_filename': pdf_filename,
                        'sector': str(sector) if pd.notna(sector) else '',
                        'esg_rating': str(esg_rating) if pd.notna(esg_rating) else ''
                    }
                    filename_to_company_data[pdf_filename] = company_data
                    name_to_filename[company_name] = pdf_filename

        return filename_to_company_data, name_to_filename

    except Exception as e:
        print(f"Error loading company mappings: {str(e)}")
        return {}, {}


def _secure_pdf_path(filename: str) -> str:
    return os.path.join(settings.BASE_DIR, 'media', 'secure_reports', filename)


# =========================
# Auth / Profile
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    return Response(UserDetailSerializer(request.user).data)


# =========================
# Companies & Funds
# =========================
@api_view(['GET'])
@permission_classes([AllowAny])  # Public for All Reports
def company_list(request):
    """Get all companies data for All Reports page from database"""
    try:
        companies = (Company.objects
                     .filter(company_name__isnull=False)
                     .exclude(company_name__exact='')
                     .order_by('company_name'))
        serializer = CompanyListSerializer(companies, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error fetching companies: {str(e)}")
        return Response({'error': 'Failed to fetch companies data'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def fund_list(request):
    """Get all funds data from database"""
    funds = Fund.objects.all()
    serializer = FundSerializer(funds, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_company_report(request):
    """User request to purchase/access a company report (placeholder flow)"""
    try:
        company_name = request.data.get('company_name')
        _user_notes = request.data.get('notes', '')
        if not company_name:
            return Response({'error': 'company_name is required'},
                            status=status.HTTP_400_BAD_REQUEST)

        existing_access = UserCompany.objects.filter(
            user=request.user,
            company__company_name__iexact=company_name,
            is_active=True
        ).exists()

        if existing_access:
            return Response({'error': 'You already have access to this company report'},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': f'Your request for {company_name} report has been submitted. Admin will review.',
            'company_name': company_name,
            'status': 'pending'
        })
    except Exception as e:
        return Response({'error': f'Failed to process request: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# =========================
# My Reports (Company assignments)
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reports(request):
    """
    Get companies assigned to the authenticated user by admin for My Reports page
    """
    user_companies = (UserCompany.objects
                      .filter(user=request.user, is_active=True)
                      .select_related('company')
                      .order_by('-assigned_at'))
    return Response(MyReportsSerializer(user_companies, many=True).data)


# =========================
# UserReport ownership (separate from Company assignments)
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reports(request):
    """Get reports owned by the current user"""
    user_reports_qs = UserReport.objects.filter(user=request.user, report__is_active=True)
    serializer = UserReportsListSerializer(user_reports_qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_reports(request):
    """Get all available active reports"""
    reports = Report.objects.filter(is_active=True)
    return Response(ReportSerializer(reports, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def assign_report_to_user(request):
    """Admin: Assign a Report object to a user (UserReport)"""
    user_id = request.data.get('user_id')
    report_id = request.data.get('report_id')
    notes = request.data.get('notes', '')

    if not user_id or not report_id:
        return Response({'error': 'user_id and report_id are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        report = Report.objects.get(id=report_id)
    except (User.DoesNotExist, Report.DoesNotExist):
        return Response({'error': 'User or Report not found'}, status=status.HTTP_404_NOT_FOUND)

    user_report, created = UserReport.objects.get_or_create(
        user=user, report=report,
        defaults={'assigned_by': request.user, 'notes': notes}
    )
    if not created:
        return Response({'error': 'User already owns this report'}, status=status.HTTP_400_BAD_REQUEST)

    return Response(UserReportSerializer(user_report).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def remove_report_from_user(request, user_report_id):
    """Admin: Remove a user-report assignment"""
    try:
        user_report = UserReport.objects.get(id=user_report_id)
        user_report.delete()
        return Response({'message': 'Report removed from user'}, status=status.HTTP_200_OK)
    except UserReport.DoesNotExist:
        return Response({'error': 'UserReport not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_reports(request):
    """Admin: Get all user report assignments"""
    user_reports = UserReport.objects.select_related('user', 'report', 'assigned_by').all()
    data = []
    for ur in user_reports:
        data.append({
            'id': ur.id,
            'user_id': ur.user.id,
            'username': ur.user.username,
            'user_email': ur.user.email,
            'report_id': ur.report.id,
            'company_name': ur.report.company_name,
            'year': ur.report.year,
            'assigned_at': ur.assigned_at,
            'assigned_by': ur.assigned_by.username if ur.assigned_by else None,
            'notes': ur.notes
        })
    return Response(data)


@api_view(['GET'])
def admin_user_reports_by_id(request, user_id):
    """Get user company assignments for a specific user - Direct access for admin panel"""
    user_companies = UserCompany.objects.select_related('user', 'company', 'assigned_by').filter(
        user_id=user_id, 
        is_active=True
    )
    data = []
    for uc in user_companies:
        data.append({
            'id': uc.id,
            'user_id': uc.user.id,
            'username': uc.user.username,
            'user_email': uc.user.email,
            'company_name': uc.company.company_name,
            'isin': uc.company.isin,
            'sector': uc.company.sector,
            'assigned_at': uc.assigned_at,
            'assigned_by': uc.assigned_by.username if uc.assigned_by else None,
            'notes': uc.notes,
            'has_pdf_report': uc.company.has_pdf_report
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """Admin: Get list of users for assignment"""
    users = CustomUser.objects.all()
    data = []
    for user in users:
        data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'organization': user.organization or ''
        })
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    """Admin: Delete a user and all associated data"""
    try:
        user = get_object_or_404(CustomUser, id=user_id)
        
        # Prevent deletion of admin users
        if user.is_staff:
            return Response({
                'error': 'Cannot delete admin users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent deletion of the current user
        if user == request.user:
            return Response({
                'error': 'Cannot delete your own account'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Store username for response
        username = user.username
        
        # Delete the user (this will cascade delete related records)
        user.delete()
        
        return Response({
            'message': f'User "{username}" has been successfully deleted',
            'deleted_user_id': user_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to delete user: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# Admin: Company assignments (UserCompany)
# =========================
@api_view(['POST'])
@permission_classes([IsAdminUser])
def assign_company_to_user(request):
    """Admin: Assign a company to a user for My Reports"""
    user_id = request.data.get('user_id')
    company_isin = request.data.get('company_isin')
    notes = request.data.get('notes', '')

    if not user_id or not company_isin:
        return Response({'error': 'user_id and company_isin are required'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        company = Company.objects.get(isin=company_isin)

        existing_assignment = UserCompany.objects.filter(user=user, company=company).first()
        if existing_assignment:
            if not existing_assignment.is_active:
                existing_assignment.is_active = True
                existing_assignment.assigned_by = request.user
                existing_assignment.notes = notes
                existing_assignment.save()
                return Response({
                    'message': 'Company assignment reactivated',
                    'assignment': UserCompanySerializer(existing_assignment).data
                })
            return Response({'error': 'Company already assigned to this user'},
                            status=status.HTTP_400_BAD_REQUEST)

        assignment = UserCompany.objects.create(
            user=user, company=company, assigned_by=request.user, notes=notes
        )
        return Response({
            'message': 'Company assigned successfully',
            'assignment': UserCompanySerializer(assignment).data
        }, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Company.DoesNotExist:
        return Response({'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Failed to assign company: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_company_assignments(request):
    """Admin: Get all active user-company assignments"""
    assignments = (UserCompany.objects
                   .filter(is_active=True)
                   .select_related('user', 'company', 'assigned_by')
                   .order_by('-assigned_at'))
    return Response(UserCompanySerializer(assignments, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def sync_excel_data(request):
    """Admin: Manually trigger Excel data sync (calls management command)"""
    try:
        from django.core.management import call_command
        call_command('sync_excel_data')
        return Response({'message': 'Excel data sync completed successfully'})
    except Exception as e:
        return Response({'error': f'Failed to sync Excel data: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# Secure PDF Serving (by company_name)
# =========================
def find_company_pdf(company_name):
    """Find PDF file for a company using Excel mapping (Company Name -> file name)"""
    reports_dir = os.path.join(settings.BASE_DIR, 'media', 'secure_reports')
    if not os.path.exists(reports_dir):
        return None
    _filename_to_company_data, name_to_filename = get_company_name_mappings()
    pdf_filename = name_to_filename.get(company_name)
    if pdf_filename and os.path.exists(os.path.join(reports_dir, pdf_filename)):
        return pdf_filename
    return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_company_report(request, company_name):
    """Serve PDF report as attachment if user has access to the company"""
    try:
        user_company = (UserCompany.objects
                        .filter(user=request.user,
                                company__company_name=company_name,
                                is_active=True)
                        .select_related('company')
                        .first())
        if not user_company:
            return Response({'error': 'You do not have access to this company report'},
                            status=status.HTTP_403_FORBIDDEN)

        company = user_company.company
        if not company.pdf_filename or not company.has_pdf_report:
            return Response({'error': 'No PDF report available for this company'},
                            status=status.HTTP_404_NOT_FOUND)

        file_path = _secure_pdf_path(company.pdf_filename)
        if not os.path.exists(file_path):
            return Response({'error': 'Report file not found on server'},
                            status=status.HTTP_404_NOT_FOUND)

        return FileResponse(open(file_path, 'rb'),
                            content_type='application/pdf',
                            as_attachment=True,
                            filename=company.pdf_filename)
    except IOError:
        return Response({'error': 'Error reading report file'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_company_report(request, company_name):
    """Serve PDF inline if user has access to the company"""
    try:
        user_company = (UserCompany.objects
                        .filter(user=request.user,
                                company__company_name=company_name,
                                is_active=True)
                        .select_related('company')
                        .first())
        if not user_company:
            return Response({'error': 'You do not have access to this company report'},
                            status=status.HTTP_403_FORBIDDEN)

        company = user_company.company
        if not company.pdf_filename or not company.has_pdf_report:
            return Response({'error': 'No PDF report available for this company'},
                            status=status.HTTP_404_NOT_FOUND)

        file_path = _secure_pdf_path(company.pdf_filename)
        if not os.path.exists(file_path):
            return Response({'error': 'Report file not found on server'},
                            status=status.HTTP_404_NOT_FOUND)

        resp = FileResponse(open(file_path, 'rb'),
                            content_type='application/pdf',
                            as_attachment=False,
                            filename=company.pdf_filename)
        resp['Content-Disposition'] = f'inline; filename="{company.pdf_filename}"'
        resp['X-Frame-Options'] = 'SAMEORIGIN'
        return resp
    except IOError:
        return Response({'error': 'Error reading report file'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': f'Server error: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# Admin: Available report files (canonical DB-driven views)
# =========================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_available_reports(request):
    """Admin: List all companies that have a PDF registered in the database."""
    try:
        companies = Company.objects.filter(pdf_filename__isnull=False).exclude(pdf_filename='')
        serializer = CompanyListSerializer(companies, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def assign_available_report(request):
    """Admin: Assign an available report (by ISIN) to a user.

    Expected payload: { username: <str>, isin: <str>, notes?: <str> }
    If the company referenced by ISIN does not exist, return 404.
    """
    try:
        username = request.data.get('username')
        isin = request.data.get('isin')
        notes = request.data.get('notes', '')

        if not username or not isin:
            return Response({"error": "Username and ISIN are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(CustomUser, username=username)
        company = get_object_or_404(Company, isin=isin)

        user_company, created = UserCompany.objects.get_or_create(
            user=user,
            company=company,
            defaults={
                'assigned_by': request.user,
                'notes': notes,
                'is_active': True
            }
        )

        if not created:
            return Response({"message": "Report already assigned to user"}, status=status.HTTP_200_OK)

        return Response({"message": f"Report {company.company_name} assigned to {user.username}"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =========================
# Missing Views for URLs
# =========================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    user = request.user
    serializer = UserDetailSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NoteListCreate(generics.ListCreateAPIView):
    """List and create notes"""
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class NoteUpdate(generics.UpdateAPIView):
    """Update a note"""
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

class NoteDelete(generics.DestroyAPIView):
    """Delete a note"""
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

class ReportListCreate(generics.ListCreateAPIView):
    """Admin: List and create reports"""
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Report.objects.all()

class ReportDetail(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, or delete a report"""
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]
    queryset = Report.objects.all()

# Duplicate admin_users_list function removed - using the one above that returns the correct format

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_company_report(request, company_name):
    """Download PDF report by company name"""
    try:
        # Get company by name and find PDF filename
        company = Company.objects.filter(company_name__iexact=company_name).first()
        if not company or not company.pdf_filename:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Construct file path
        file_path = os.path.join(settings.BASE_DIR, 'media', 'secure_reports', company.pdf_filename)
        if not os.path.exists(file_path):
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Return file for download
        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=company.pdf_filename,
            content_type='application/pdf'
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_company_report(request, company_name):
    """View PDF report by company name"""
    try:
        # Get company by name and find PDF filename
        company = Company.objects.filter(company_name__iexact=company_name).first()
        if not company or not company.pdf_filename:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Construct file path
        file_path = os.path.join(settings.BASE_DIR, 'media', 'secure_reports', company.pdf_filename)
        if not os.path.exists(file_path):
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Return file for viewing
        return FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
            filename=company.pdf_filename
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_available_reports(request):
    """Admin: List all available PDF reports"""
    try:
        companies = Company.objects.filter(pdf_filename__isnull=False).exclude(pdf_filename='')
        serializer = CompanyListSerializer(companies, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def assign_available_report(request):
    """Admin: Assign an available report to a user"""
    try:
        username = request.data.get('username')
        isin = request.data.get('isin')
        
        if not username or not isin:
            return Response(
                {"error": "Username and ISIN are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user and company
        user = get_object_or_404(CustomUser, username=username)
        company = get_object_or_404(Company, isin=isin)
        
        # Create user-company assignment
        user_company, created = UserCompany.objects.get_or_create(
            user=user,
            company=company
        )
        
        if not created:
            return Response(
                {"message": "Report already assigned to user"}, 
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"message": f"Report {company.company_name} assigned to {user.username}"}, 
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def remove_company_from_user(request, assignment_id):
    """Admin: Remove company assignment from user"""
    try:
        user_company = get_object_or_404(UserCompany, id=assignment_id)
        company_name = user_company.company.company_name
        username = user_company.user.username
        user_company.delete()
        
        return Response({
            "message": f"Removed {company_name} from {username}"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def remove_all_companies_from_user(request, user_id):
    """Admin: Remove all company assignments from a user"""
    try:
        user = get_object_or_404(CustomUser, id=user_id)
        assignments = UserCompany.objects.filter(user=user)
        count = assignments.count()
        assignments.delete()
        
        return Response({
            "message": f"Removed {count} company assignments from {user.username}"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_user_company_assignments(request):
    """Admin: Get all user-company assignments"""
    try:
        assignments = UserCompany.objects.all().select_related('user', 'company')
        data = []
        for assignment in assignments:
            data.append({
                'id': assignment.id,
                'username': assignment.user.username,
                'company_name': assignment.company.company_name,
                'isin': assignment.company.isin,
                'date_added': assignment.date_added
            })
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def sync_excel_data(request):
    """Admin: Sync data from Excel file to database"""
    try:
        # Run the management command to load Excel data
        from django.core.management import call_command
        call_command('load_excel_data')
        return Response({"message": "Excel data synchronized successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
