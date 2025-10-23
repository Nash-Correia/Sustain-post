// Authentication service to connect React with Django backend

const API_BASE_URL = 'http://127.0.0.1:8000/api';




export interface ApiMessage {
  message?: string;
}

export interface AssignReportResult extends ApiMessage {
  assignment_id?: number;
  user_id?: number;
  report_id?: number;
  company_name?: string;
  isin?: string;
  filename?: string;
  notes?: string;
}

export interface RequestReportResponse extends ApiMessage {
  request_id?: number;
}

export interface AssignCompanyResult extends ApiMessage {
  assignment_id?: number;
  user_id?: number;
  company_isin?: string;
  notes?: string;
}






export interface User {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
  is_staff: boolean;
  is_superuser: boolean;
  phone_number?: string;
  organization?: string;
  job_title?: string;
  bio?: string;
  subscription_type?: string;
  is_verified: boolean;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  organization?: string;
  job_title?: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    console.log('🔧 makeRequest called:', { url, hasToken: !!this.accessToken });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if we have a token
    if (this.accessToken && !url.includes('token/') && !url.includes('register/')) {
      console.log('🔑 Adding authorization header');
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    } else {
      console.log('🚫 No token or skipping auth for:', url);
    }

    console.log('🌐 Making request to:', `${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    // If token expired, try to refresh
    if (response.status === 401 && this.refreshToken && !url.includes('token/')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${this.accessToken}`,
        };
        return fetch(`${API_BASE_URL}${url}`, config);
      }
    }

    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest('/user/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle validation errors from Django
      if (error.details) {
        const fieldErrors = error.details;
        // Extract the first error message for display
        const firstError = Object.values(fieldErrors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          throw new Error(firstError[0]);
        }
      }
      
      throw new Error(error.error || error.detail || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest('/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid credentials');
    }

    const tokenData = await response.json();
    this.setTokens(tokenData.access, tokenData.refresh);

    // Get user profile
    const user = await this.getCurrentUser();
    
    return {
      user,
      access: tokenData.access,
      refresh: tokenData.refresh,
    };
  }

  async logout() {
    this.clearTokens();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest('/profile/');

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear tokens
        this.clearTokens();
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  async updateProfile(userData: Partial<RegisterData>): Promise<User> {
    const response = await this.makeRequest('/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access);
        }
        return true;
      }
    } catch (error: unknown) {
      console.error('Token refresh failed:', error);
     }

    this.clearTokens();
    return false;
  }

  private setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const authService = new AuthService();

// Notes API functions
export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
}

export const notesAPI = {
  async getNotes(): Promise<Note[]> {
    const response = await authService['makeRequest']('/notes/');
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  },

  async createNote(note: { title: string; content: string }): Promise<Note> {
    const response = await authService['makeRequest']('/notes/', {
      method: 'POST',
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    return response.json();
  },

  async updateNote(id: number, note: { title: string; content: string }): Promise<Note> {
    const response = await authService['makeRequest'](`/notes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error('Failed to update note');
    }
    return response.json();
  },

  async deleteNote(id: number): Promise<void> {
    const response = await authService['makeRequest'](`/notes/${id}/delete/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  },
};

// Report-related interfaces
export interface Report {
  id: number;
  company_name: string;
  sector?: string;
  year: number;
  rating: string;
  report_url?: string;
  report_file?: string;
  created_at: string;
  is_active: boolean;
}

export interface UserReport {
  id: number;
  company_name: string;
  sector?: string;
  year: number;
  rating: string;
  report_url?: string;
  report_file?: string;
  assigned_at: string;
}

export interface AdminUserReport {
  id: number;
  user_id: number;
  username: string;
  user_email: string;
  report_id: number;
  company_name: string;
  year: number;
  assigned_at: string;
  assigned_by?: string;
  notes?: string;
}

export interface UserCompanyAssignment {
  id: number;
  user_id: number;
  username: string;
  user_email: string;
  company_name: string;
  isin: string;
  sector?: string;
  assigned_at: string;
  assigned_by?: string;
  notes?: string;
  has_pdf_report?: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  organization?: string;
}

export interface AvailableReport {
  isin: string;
  company_name: string;
  sector?: string;
  esg_rating?: string;
  pdf_filename?: string;
  has_pdf_report?: boolean;
}

export interface AvailableReportsResponse {
  reports: AvailableReport[];
}

// Report Management APIs
export const reportsAPI = {
  // User APIs
  async getAllReports(): Promise<Report[]> {
    const response = await authService['makeRequest']('/reports/');
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  async getUserReports(): Promise<UserReport[]> {
    const response = await authService['makeRequest']('/user-reports/');
    if (!response.ok) {
      throw new Error('Failed to fetch user reports');
    }
    return response.json();
  },

  // Admin APIs
  async getAdminReports(): Promise<Report[]> {
    const response = await authService['makeRequest']('/admin/reports/');
    if (!response.ok) {
      throw new Error('Failed to fetch admin reports');
    }
    return response.json();
  },

  async createReport(report: Omit<Report, 'id' | 'created_at' | 'is_active'>): Promise<Report> {
    const response = await authService['makeRequest']('/admin/reports/', {
      method: 'POST',
      body: JSON.stringify(report),
    });
    if (!response.ok) {
      throw new Error('Failed to create report');
    }
    return response.json();
  },

async assignReportToUser(
  userId: number,
  reportId: number,
  notes?: string
): Promise<AssignReportResult> {
  const response = await authService['makeRequest']('/admin/assign-report/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, report_id: reportId, notes: notes || '' }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign report');
  }
  const data: AssignReportResult = await response.json();
  return data;
},


  async removeReportFromUser(assignmentId: number): Promise<void> {
    const response = await authService['makeRequest'](`/admin/remove-company/${assignmentId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove company assignment from user');
    }
  },

  async removeAllReportsFromUser(userId: number): Promise<void> {
    const response = await authService['makeRequest'](`/admin/remove-all-companies/${userId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove all company assignments from user');
    }
  },

  async getAdminUserReports(): Promise<AdminUserReport[]> {
    const response = await authService['makeRequest']('/admin/user-reports/');
    if (!response.ok) {
      throw new Error('Failed to fetch admin user reports');
    }
    return response.json();
  },

  async getAdminUserReportsById(userId: number): Promise<UserCompanyAssignment[]> {
    const response = await authService['makeRequest'](`/admin/user-reports/${userId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch user reports');
    }
    return response.json();
  },

  async getAdminUsersList(): Promise<AdminUser[]> {
    const response = await authService['makeRequest']('/admin/users/');
    if (!response.ok) {
      throw new Error('Failed to fetch users list');
    }
    return response.json();
  },

  async getAvailableReports(): Promise<AvailableReport[]> {
    const response = await authService['makeRequest']('/admin/available-reports/');
    if (!response.ok) {
      throw new Error('Failed to fetch available reports');
    }
    return response.json();
  },

async assignAvailableReport(
  userId: number,
  companyName: string,
  filename: string,
  notes?: string
): Promise<AssignReportResult> {
  const response = await authService['makeRequest']('/admin/assign-available-report/', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      company_name: companyName,
      filename,
      notes: notes || '',
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to assign report');
  }
  const data: AssignReportResult = await response.json();
  return data;
},

  // New: assign by username + isin to match backend API
  async assignAvailableReportByUsername(username: string, isin: string, notes?: string): Promise<AssignReportResult> {
    const response = await authService['makeRequest']('/admin/assign-available-report/', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        isin: isin,
        notes: notes || ''
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to assign report');
    }
    return response.json();
  },

  async deleteUser(userId: number): Promise<{ message: string; deleted_user_id: number }> {
    const response = await authService['makeRequest'](`/admin/users/${userId}/delete/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }
    return response.json();
  },
};

// Company-related interfaces
export interface Company {
  isin: string;
  company_name: string;
  sector?: string;
  esg_sector?: string;
  bse_symbol?: string;
  nse_symbol?: string;
  market_cap?: string;
  e_score?: string;
  s_score?: string;
  g_score?: string;
  esg_score?: string;
  composite?: string;
  grade?: string;
  positive?: string;
  negative?: string;
  controversy?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyListItem {
  isin: string;
  company_name: string;
  esg_sector?: string;
  esg_rating?: string;
  grade?: string; // Legacy field for ESG Comparison Tool
  pdf_filename?: string;
  has_pdf_report?: boolean;
}

export interface MyReportItem {
  id: number;
  isin: string;
  company_name: string;
  esg_sector?: string;
  esg_rating?: string;
  assigned_at: string;
  notes?: string;
  report_filename?: string;
  download_url?: string;
}



// Company Management APIs
export const companyAPI = {
  // Public APIs
  async getAllCompanies(): Promise<CompanyListItem[]> {
    console.log('🌐 Making API request to /companies/...');
    
    // Try direct fetch first to see if authService.makeRequest is the issue
    try {
      console.log('🔄 Trying direct fetch approach...');
      const directResponse = await fetch(`${API_BASE_URL}/companies/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        console.log('✅ Direct fetch succeeded:', data?.length, 'companies received');
        return data;
      } else {
        console.warn('⚠️ Direct fetch failed, trying authService.makeRequest...');
      }
    } catch (error: unknown) {
      console.warn('⚠️ Direct fetch error:', error, 'trying authService.makeRequest...');
     }
    
    // Fallback to original method
    const response = await authService['makeRequest']('/companies/');
    console.log('📡 AuthService response status:', response.status);
    console.log('📡 AuthService response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AuthService API Error Response:', errorText);
      throw new Error(`Failed to fetch companies: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📊 AuthService API Response data:', data?.length, 'companies received');
    return data;
  },

  async getMyReports(): Promise<MyReportItem[]> {
    const response = await authService['makeRequest']('/my-reports/');
    if (!response.ok) {
      throw new Error('Failed to fetch my reports');
    }
    return response.json();
  },

  async downloadCompanyReport(companyName: string): Promise<Blob> {
    const response = await authService['makeRequest'](`/reports/download/${encodeURIComponent(companyName)}/`);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You do not have access to this report');
      } else if (response.status === 404) {
        throw new Error('Report not found');
      }
      throw new Error('Failed to download report');
    }
    return response.blob();
  },

  async requestCompanyReport(companyName: string, notes?: string): Promise<RequestReportResponse> {
    const response = await authService['makeRequest']('/request-report/', {
      method: 'POST',
      body: JSON.stringify({
        company_name: companyName,
        notes: notes || ''
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request report');
    }
    return response.json();
  },

  // Admin APIs
  async assignCompanyToUser(userId: number, companyIsin: string, notes?: string): Promise<AssignCompanyResult> {
    const response = await authService['makeRequest']('/admin/assign-company/', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        company_isin: companyIsin,
        notes: notes || ''
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign company');
    }
    return response.json();
  },

  async removeCompanyFromUser(assignmentId: number): Promise<void> {
    const response = await authService['makeRequest'](`/admin/remove-company/${assignmentId}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove company from user');
    }
  },

  async getAdminCompanyAssignments(): Promise<UserCompanyAssignment[]> {
    const response = await authService['makeRequest']('/admin/company-assignments/');
    if (!response.ok) {
      throw new Error('Failed to fetch company assignments');
    }
    return response.json();
  },
};

