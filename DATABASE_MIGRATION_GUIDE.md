# Database Migration & User Management Guide

## 🚨 Problem: Users Get Deleted During Migrations

### Why This Happens
When you run `rm db.sqlite3` followed by `python manage.py migrate`, you're **deleting the entire database file**, which contains:
- All user accounts (including superusers)
- User profiles and settings
- Company data
- User-company assignments
- All other application data

## ✅ Solution: Proper Migration Workflow

### 1. **Normal Migrations (95% of cases)**
For model field changes, adding new fields, etc.:

```bash
# Make migration files
python manage.py makemigrations

# Apply migrations (keeps all data)
python manage.py migrate
```

### 2. **When You Need to Reset Schema**
If you must reset the database structure:

```bash
# 1. Backup users first
python manage.py backup_restore_users --action=backup --file=users_backup.json

# 2. Delete and recreate database
rm db.sqlite3
python manage.py migrate

# 3. Restore users
python manage.py backup_restore_users --action=restore --file=users_backup.json

# 4. Sync company data
python manage.py sync_excel_to_db
```

### 3. **Fresh Database Setup**
For completely new setup:

```bash
# Complete setup in one command
python manage.py setup_database --create-demo-user

# Or step by step:
python manage.py migrate
python manage.py create_superuser_if_none
python manage.py sync_excel_to_db
```

## 🛠 Available Management Commands

### 1. `create_superuser_if_none`
Creates admin user only if no superuser exists:
```bash
# Use defaults (admin/admin@iias.in/admin123)
python manage.py create_superuser_if_none

# Custom credentials
python manage.py create_superuser_if_none --username=myuser --email=admin@company.com --password=securepass
```

### 2. `backup_restore_users`
Backup and restore user accounts:
```bash
# Backup all users
python manage.py backup_restore_users --action=backup --file=users_backup.json

# Restore users
python manage.py backup_restore_users --action=restore --file=users_backup.json
```

### 3. `setup_database`
Complete database initialization:
```bash
# Full setup with demo data
python manage.py setup_database --create-demo-user

# Setup without company sync
python manage.py setup_database --skip-companies
```

### 4. `sync_excel_to_db`
Sync company data from Excel:
```bash
python manage.py sync_excel_to_db
```

## 📋 Migration Best Practices

### ✅ DO:
- Always use `python manage.py migrate` for normal changes
- Backup users before major schema changes
- Test migrations on a copy of your database first
- Use management commands for consistent setup

### ❌ DON'T:
- Delete `db.sqlite3` unless absolutely necessary
- Make migrations without backing up important data
- Skip migration files (always commit them to git)

## 🔄 Common Migration Scenarios

### **Adding a New Field**
```bash
# Add field to model in models.py
python manage.py makemigrations
python manage.py migrate
# ✅ Users preserved
```

### **Changing Field Type**
```bash
# 1. Backup users first
python manage.py backup_restore_users --action=backup

# 2. Change model field
python manage.py makemigrations
python manage.py migrate

# 3. If migration fails, restore:
python manage.py backup_restore_users --action=restore
```

### **Major Schema Redesign**
```bash
# 1. Backup everything
python manage.py dumpdata --indent=2 > full_backup.json
python manage.py backup_restore_users --action=backup

# 2. Reset database
rm db.sqlite3
python manage.py migrate

# 3. Restore users and critical data
python manage.py backup_restore_users --action=restore
python manage.py sync_excel_to_db
```

## 🔐 User Management

### **Default Admin Account**
After fresh setup:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@iias.in

**⚠️ Change the default password immediately!**

### **Demo Account**
When using `--create-demo-user`:
- **Username:** demo
- **Password:** demo123
- **Email:** demo@example.com
- **Assignments:** 5 sample companies

## 🚀 Quick Recovery

If you accidentally deleted users:

```bash
# If you have a backup
python manage.py backup_restore_users --action=restore --file=users_backup.json

# If no backup, create new admin
python manage.py create_superuser_if_none

# Full reset with demo data
python manage.py setup_database --create-demo-user
```

## 📊 Check Database Status

```bash
# Check what's in your database
python manage.py shell -c "
from django.contrib.auth.models import User
from api.models import Company, UserCompany
print(f'Users: {User.objects.count()}')
print(f'Superusers: {User.objects.filter(is_superuser=True).count()}')
print(f'Companies: {Company.objects.count()}')
print(f'Assignments: {UserCompany.objects.count()}')
"
```

## 🎯 Summary

The key is to **never delete `db.sqlite3`** unless you have proper backups. Use Django's migration system, which is designed to preserve data while changing schema structure.