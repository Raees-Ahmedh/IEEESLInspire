# 🗄️ Complete Database Restore Guide

## ⚠️ **CRITICAL: Foreign Key Relationships**

This database has **complex relationships** that must be restored in the correct order to avoid foreign key constraint errors.

## 📋 **Step-by-Step Restore Process**

### **Step 1: Prerequisites**
```bash
# 1. Ensure you have the complete backup files:
# - complete_backup_YYYY-MM-DD.json
# - backup_database.js
# - restore_database.js
# - prisma/schema.prisma

# 2. Setup environment
# cp .env.example .env
# Edit .env with your database credentials

#Main Steps Start
# 3. Install dependencies
npm install

# 4. Setup database schema
# npx prisma migrate dev --name init
# OR if using existing database:
npx prisma db push
```

### **Step 2: Restore Process**

#### **Option A: Automatic Restore (Recommended)**
```bash
# Navigate to server directory
cd server

# Run the restore script
node restore_database.js

#Main steps over
```

#### **Option B: Manual Verification**
```bash
# 1. Check backup file exists
ls database_backup/

# 2. Verify backup integrity
node -e "const backup = JSON.parse(require('fs').readFileSync('database_backup/complete_backup_YYYY-MM-DD.json', 'utf8')); console.log('Backup version:', backup.version); console.log('Total records:', Object.values(backup.totalRecords).reduce((a,b) => a+b, 0));"

# 3. Run restore
node restore_database.js
```

## 🔄 **Restore Order (CRITICAL)**

The restore script handles this automatically, but here's the order for reference:

### **🗑️ Clear Order (Reverse Dependencies)**
1. **Dependent Tables First:**
   - StudentBookmark → StudentApplication → StudentProfile
   - UserPermission → TaskComment → Task
   - NewsArticle → Event → CourseAnalytics
   - CourseMaterial → SearchAnalytics → UserActivityLog
   - SystemSetting

2. **Academic Structure:**
   - Course → CourseRequirement → ValidCombination
   - Department → Faculty → SubField → MajorField
   - Subject → Stream → CareerPathway

3. **Independent Tables:**
   - Framework → University → User

### **📥 Restore Order (Dependencies First)**
1. **Independent Tables:**
   - User → University → Framework

2. **Academic Structure:**
   - MajorField → SubField → Subject → Stream → CareerPathway

3. **University Structure:**
   - Faculty → Department

4. **Courses:**
   - CourseRequirement → Course → ValidCombination

5. **User Data:**
   - StudentProfile → UserPermission → StudentBookmark → StudentApplication

6. **Content:**
   - Event → NewsArticle → Task → TaskComment

7. **Analytics:**
   - CourseMaterial → CourseAnalytics → SearchAnalytics → UserActivityLog → SystemSetting

## 🚨 **Common Issues & Solutions**

### **Issue 1: Foreign Key Constraint Errors**
```bash
# Error: Foreign key constraint failed
# Solution: The restore script handles this automatically
# If manual restore, ensure you follow the exact order above
```

### **Issue 2: Duplicate Key Errors**
```bash
# Error: Unique constraint failed
# Solution: Clear database first or use --force flag
npx prisma db push --force-reset
```

### **Issue 3: Connection Errors**
```bash
# Error: Database connection failed
# Solution: Check your .env file
# Ensure DATABASE_URL is correct
# Test connection: npx prisma db pull
```

### **Issue 4: Schema Mismatch**
```bash
# Error: Schema doesn't match
# Solution: Update schema first
npx prisma db push
# Then run restore
```

## ✅ **Verification Steps**

### **After Restore, Verify:**
```bash
# 1. Check record counts
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function verify() {
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.university.count(),
    prisma.faculty.count(),
    prisma.department.count()
  ]);
  console.log('Users:', counts[0]);
  console.log('Courses:', counts[1]);
  console.log('Universities:', counts[2]);
  console.log('Faculties:', counts[3]);
  console.log('Departments:', counts[4]);
  await prisma.\$disconnect();
}
verify();
"

# 2. Test relationships
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function testRelations() {
  const course = await prisma.course.findFirst({
    include: {
      university: true,
      faculty: true,
      department: true
    }
  });
  console.log('Course with relations:', course ? '✅ Working' : '❌ Failed');
  await prisma.\$disconnect();
}
testRelations();
"
```

## 📦 **Files to Share**

### **Essential Files:**
1. `complete_backup_YYYY-MM-DD.json` - Your data
2. `backup_database.js` - Backup script
3. `restore_database.js` - Restore script
4. `prisma/schema.prisma` - Database schema
5. `.env.example` - Environment template
6. `RESTORE_GUIDE.md` - This guide

### **Recipient Setup:**
```bash
# 1. Clone/download project
# 2. Install dependencies: npm install
# 3. Setup environment: cp .env.example .env
# 4. Edit .env with database credentials
# 5. Setup schema: npx prisma db push
# 6. Restore data: node restore_database.js
# 7. Verify: Check record counts and relationships
```

## 🎯 **Success Indicators**

✅ **Restore Successful When:**
- No foreign key constraint errors
- All record counts match backup
- Relationships work (courses have universities, etc.)
- Application starts without errors
- All user roles work correctly

❌ **Restore Failed When:**
- Foreign key constraint errors
- Missing relationships
- Application crashes
- User authentication fails
- Course search returns no results

## 🆘 **Emergency Recovery**

If restore fails:
```bash
# 1. Clear everything and start over
npx prisma db push --force-reset

# 2. Run restore again
node restore_database.js

# 3. If still failing, check backup file integrity
node -e "console.log('Backup valid:', JSON.parse(require('fs').readFileSync('database_backup/complete_backup_YYYY-MM-DD.json', 'utf8')).version)"
```
