

# Sustain Platform — Deployment 

## 1. Service Architecture

The application consists of two main services that must be deployed separately.

| Component       | Source Directory | Technology                   | 
| --------------- | ---------------- | ---------------------------- | 
| **Backend API** | `backend/`       | Django 5.2.6 (Python 3.8+)   | 
| **Frontend UI** | `frontend/`      | Next.js 15.5.3 (Node.js 18+) | 

### Required AWS Infrastructure

* **Database:** Amazon RDS (PostgreSQL).
  The backend requires PostgreSQL for production.
* **File Storage:** Amazon S3.
  The backend must be configured to use S3 for media file (PDF) uploads.

---

## 2. Backend Service (Django API)

Configuration for the `backend/` service:

### ⚙️ Build & Runtime Commands

**Build/Install Command:**
Installs Python dependencies.

```bash
pip install -r requirements.txt
```

**Initialization/Migration Command:**
Run once per deployment before the application starts.

```bash
python manage.py migrate && \
python manage.py migrate && \
python manage.py sync_excel_data && \
python manage.py create_superuser_if_none
```

**Start Command:**
Runs the web server (Elastic Beanstalk injects `$PORT`).

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
```

---

### 🌍 Production Environment Variables

| Variable Name               | Required Production Value                                      |
| --------------------------- | -------------------------------------------------------------- |
| **DEBUG**                   | `False`                                                        |
| **SECRET_KEY**              | *Generate a new strong secret key*                             |
| **DJANGO_ALLOWED_HOSTS**    | e.g. `api.your-domain.com`                                     |
| **CORS_ALLOWED_ORIGINS**    | e.g. `https://your-domain.com`                                 |
| **DB_NAME**                 | `sustain_db` (or your RDS database name)                       |
| **DB_USER**                 | `sustain_user` (or RDS master username)                        |
| **DB_PASS**                 | *RDS database password*                                        |
| **DB_HOST**                 | *RDS instance endpoint URL*                                    |
| **DB_PORT**                 | `5432` (default PostgreSQL port)                               |
| **AWS_ACCESS_KEY_ID**       | The access key for an IAM user with S3 permissions.            |
| **AWS_SECRET_ACCESS_KEY**   | The secret key for the IAM user.                               |
| **AWS_STORAGE_BUCKET_NAME** | The exact name of the S3 bucket created to store media files.  |
| **AWS_S3_REGION_NAME**      | The AWS region where the S3 bucket is located.                 |

---

## 3. Frontend Service (Next.js UI)

Configuration for the `frontend/` service:

### ⚙️ Build & Runtime Commands

**Build Command:**
Installs dependencies and creates the production build.

```bash
npm install && npm run build
```

**Start Command:**
Runs the Next.js server.

```bash
npm start
```

---

### 🌍 Production Environment Variables

| Variable Name                 | Required Production Value              |
| ----------------------------- | -------------------------------------- |
| **NEXT_PUBLIC_API_BASE_URL**  | e.g. `https://api.your-domain.com`     |
| **NEXT_PUBLIC_WEB3FORMS_KEY** | `bd18762e-3479-41e1-a4c0-021ea39a5d6f` |



