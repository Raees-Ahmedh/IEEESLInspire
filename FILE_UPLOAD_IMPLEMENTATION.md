# Course Material File Upload Implementation

## Overview
This implementation adds file upload functionality for course materials using Cloudinary for cloud storage and PostgreSQL for metadata storage.

## Features Implemented

### 1. Backend API Endpoints (`server/src/routes/uploadRoutes.ts`)
- **POST `/api/upload/course-material`** - Upload single file to Cloudinary
- **POST `/api/upload/multiple-course-materials`** - Upload multiple files
- **DELETE `/api/upload/course-material/:id`** - Delete material from Cloudinary and database

### 2. Frontend Upload Service (`client/src/services/uploadService.ts`)
- File validation (size, type)
- Progress tracking
- Error handling
- Batch upload support

### 3. Course Form Integration (`client/src/components/admin/AddCourse.tsx`)
- File selection with validation
- Upload progress indicators
- Error display
- Material management (add/remove)

## Database Schema
The `CourseMaterial` table stores:
- `id` - Primary key
- `materialType` - syllabus/brochure/handbook/application_form
- `fileName` - Original file name
- `filePath` - Cloudinary URL
- `fileType` - MIME type
- `fileSize` - File size in bytes
- `uploadedBy` - User ID
- `uploadedAt` - Timestamp
- `auditInfo` - Audit trail

## File Upload Flow

1. **User selects file** in course form
2. **File validation** checks size (max 10MB) and type
3. **Upload to Cloudinary** with progress tracking
4. **Save metadata** to database
5. **Add material ID** to course form
6. **Submit course** with material IDs

## Supported File Types
- PDF documents
- Microsoft Word (DOC, DOCX)
- Images (JPG, PNG)
- Text files (TXT)

## Configuration Required

### Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Dependencies Added
- `cloudinary` - Cloud storage service
- `multer` - File upload middleware

## Usage

### Adding Course Materials
1. Open course creation form
2. Navigate to "Additional Information" step
3. Select material type (syllabus, brochure, etc.)
4. Choose file (max 10MB)
5. Click "Add Material"
6. File uploads to Cloudinary automatically
7. Material appears in uploaded materials list

### File Management
- View uploaded materials with file details
- Remove materials (deletes from Cloudinary and database)
- Progress indicators during upload
- Error handling for failed uploads

## API Integration

### Upload Single File
```javascript
const result = await uploadService.uploadCourseMaterial(
  file,
  'syllabus',
  userId
);
```

### Upload Multiple Files
```javascript
const result = await uploadService.uploadCourseMaterialsWithProgress(
  materials,
  userId,
  (progress) => console.log(`${progress}% complete`)
);
```

## Error Handling
- File size validation (10MB limit)
- File type validation
- Network error handling
- Cloudinary upload failures
- Database save failures

## Security Features
- File type validation
- Size limits
- Secure Cloudinary URLs
- User authentication (TODO: implement actual user context)

## Future Enhancements
- User authentication integration
- File preview functionality
- Bulk upload interface
- File versioning
- Access control
