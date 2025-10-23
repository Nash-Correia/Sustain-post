# Sustain - ESG Rating & Analysis Platform

A comprehensive ESG (Environmental, Social, and Governance) rating and analysis platform that provides institutional investors with detailed ESG reports, comparison tools, and portfolio analysis capabilities.

## 🚀 Features

### Core Functionality
- **ESG Reports Management**: Access and manage ESG reports for various companies
- **Rating System**: View ESG ratings with detailed breakdowns across E, S, and G pillars
- **Comparison Tools**: Compare ESG performance across companies, funds, and sectors
- **Portfolio Analysis**: Analyze ESG performance of investment portfolios
- **Secure PDF Reports**: Download and view detailed ESG assessment reports
- **User Management**: Role-based access control with admin capabilities

### User Features
- **My Reports**: Personal collection of assigned ESG reports
- **All Reports**: Browse comprehensive database of available ESG reports
- **Interactive Tables**: Sortable and filterable data tables
- **PDF Viewer**: Integrated PDF viewing for detailed reports
- **Notes System**: Add and manage personal notes on companies
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **User Management**: Create and manage user accounts
- **Report Assignment**: Assign reports to specific users
- **Company Management**: Manage company data and assignments
- **Bulk Operations**: Efficiently manage multiple assignments
- **Analytics Dashboard**: Overview of system usage and data

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 with React 19
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Custom component library with Lucide React icons
- **Animations**: Framer Motion for smooth interactions
- **TypeScript**: Full TypeScript support for type safety

### Backend
- **Framework**: Django 5.2.6 with Django REST Framework
- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **API**: RESTful API design with comprehensive endpoints
- **File Handling**: Secure PDF storage and serving
- **Data Processing**: Pandas for Excel data import/processing

### Key Libraries
- **Frontend**: class-variance-authority, zod for validation
- **Backend**: django-cors-headers, python-dotenv, openpyxl

## 📁 Project Structure

```
sustain/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── product/        # Main application pages
│   │   ├── notes/          # Notes management
│   │   └── methodology/    # ESG methodology
│   ├── components/         # Reusable React components
│   │   ├── auth/          # Authentication components
│   │   ├── product/       # ESG data components
│   │   ├── ui/            # Base UI components
│   │   └── nav/           # Navigation components
│   ├── lib/               # Utility functions and API clients
│   └── public/            # Static assets and data files
├── backend/                # Django backend application
│   ├── api/               # Main API application
│   │   ├── models.py      # Database models
│   │   ├── views.py       # API endpoints
│   │   ├── serializers.py # Data serialization
│   │   └── urls.py        # API routing
│   └── backend/           # Django project settings
└── env/                   # Python virtual environment
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Python** 3.8+ and pip
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sustain
   ```

2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create virtual environment
   python -m venv env
   
   # Activate virtual environment
   # Windows:
   env\Scripts\activate
   # macOS/Linux:
   source env/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser (optional)
   python manage.py createsuperuser
   
   # Start development server
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   # Open new terminal and navigate to frontend
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

### Environment Configuration

Create a `.env` file in the backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 🔧 Usage

### Development Servers
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

### API Endpoints

#### Authentication
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token
- `GET /api/profile/` - Get user profile

#### Companies & Reports
- `GET /api/companies/` - List all companies
- `GET /api/my-reports/` - Get user's assigned reports
- `POST /api/request-report/` - Request access to a report

#### Admin Endpoints
- `GET /api/admin/users/` - List all users
- `POST /api/admin/assign-available-report/` - Assign report to user
- `GET /api/admin/user-reports/{user_id}/` - Get user's reports

#### File Operations
- `GET /api/reports/download/{company_name}/` - Download report PDF
- `GET /api/reports/view/{company_name}/` - View report PDF

### Key Components

#### ESG Rating System
The platform uses a comprehensive ESG rating system with:
- **Environmental (E) Pillar**: Climate change, resource efficiency, pollution
- **Social (S) Pillar**: Human rights, community relations, employee welfare
- **Governance (G) Pillar**: Board structure, business ethics, transparency
- **Overall ESG Rating**: Composite score from A+ to D

#### Comparison Tools
- **Company Comparison**: Side-by-side ESG performance analysis
- **Sector Analysis**: Industry-specific ESG benchmarking
- **Portfolio Assessment**: Aggregate ESG scoring for fund holdings

## 📊 Data Management

### Excel Integration
The system supports Excel data import for:
- Company ESG data and ratings
- Sector classifications and benchmarks
- Fund holdings and portfolio data

### Database Schema
Key models include:
- **Company**: ESG data and ratings
- **UserCompany**: User-company assignments
- **CustomUser**: Extended user model with profile fields
- **Notes**: User annotations and comments

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and user role separation
- **Secure File Serving**: Protected PDF download endpoints
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Comprehensive data validation using Zod and DRF serializers

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```env
   DEBUG=False
   SECRET_KEY=production-secret-key
   ALLOWED_HOSTS=yourdomain.com
   DATABASE_URL=postgresql://user:pass@localhost/dbname
   ```

2. **Database Migration**
   ```bash
   python manage.py collectstatic
   python manage.py migrate
   ```

3. **Frontend Build**
   ```bash
   npm run build
   npm start
   ```

### Deployment Options
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, DigitalOcean, AWS, or any Python hosting
- **Database**: PostgreSQL, MySQL, or cloud database services

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices for frontend code
- Use Django conventions for backend development
- Maintain consistent code formatting with ESLint and Prettier
- Write descriptive commit messages
- Add appropriate tests for new features

## 📝 License

This project is proprietary software developed for Institutional Investor Advisory Services India Limited.

## 📧 Support

For technical support or questions about the ESG platform, please contact the development team.

---

**Built for better ESG analysis and sustainable investing**
