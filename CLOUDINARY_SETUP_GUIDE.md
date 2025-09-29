# Cloudinary Setup and File Management Guide

## 🔧 **Cloudinary Account Setup**

### 1. **Create Cloudinary Account**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. **Get Your Credentials**
1. Log into your Cloudinary dashboard
2. Go to **Settings** → **API Keys**
3. Copy the following values:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

### 3. **Add to Environment Variables**
Add these to your `server/.env` file:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📁 **Where to Find Uploaded Files**

### **In Cloudinary Dashboard:**
1. **Media Library**: Go to your Cloudinary dashboard → **Media Library**
2. **Folder Structure**: Files are stored in `course-materials/` folder
3. **File Naming**: Files are named like `course-material-[timestamp]-[random]`

### **File Organization:**
```
course-materials/
├── course-material-1703123456789-abc123def-Project Requirements Report.pdf
├── course-material-1703123456790-xyz789ghi-Course Syllabus.docx
├── course-material-1703123456791-def456jkl-Student Handbook.jpg
└── ...
```

**File Naming Pattern:**
- Format: `course-material-[timestamp]-[random]-[original-filename-with-extension]`
- Example: `course-material-1703123456789-abc123def-Project Requirements Report.pdf`
- Full original filename with extension is preserved

## 🔍 **File Type Detection Fix**

### **Problem Fixed:**
- **Before**: All files were being converted to PNG due to `resource_type: 'auto'`
- **After**: Files maintain their original format based on MIME type

### **Resource Type Mapping:**
- **PDFs**: `resource_type: 'raw'` → Preserves as PDF
- **Images**: `resource_type: 'image'` → Optimized images
- **Videos**: `resource_type: 'video'` → Video files
- **Documents**: `resource_type: 'raw'` → Preserves original format

## 🧪 **Testing Upload Functionality**

### **Test Single File Upload:**
```bash
curl -X POST http://localhost:4000/api/upload/course-material \
  -F "file=@test.pdf" \
  -F "materialType=syllabus" \
  -F "uploadedBy=1"
```

### **Test Multiple File Upload:**
```bash
curl -X POST http://localhost:4000/api/upload/multiple-course-materials \
  -F "files=@file1.pdf" \
  -F "files=@file2.docx" \
  -F "materials=[{\"materialType\":\"syllabus\"},{\"materialType\":\"brochure\"}]" \
  -F "uploadedBy=1"
```

## 📊 **Monitoring Uploads**

### **Check Upload Status:**
1. **Server Logs**: Check console for upload success/error messages
2. **Database**: Check `CourseMaterial` table for uploaded files
3. **Cloudinary**: Check Media Library for uploaded files

### **Common Issues:**
- **File Size**: Max 10MB per file
- **File Types**: PDF, DOC, DOCX, JPG, PNG, TXT only
- **Authentication**: Ensure user is logged in
- **Network**: Check internet connection for Cloudinary uploads

## 🔧 **Troubleshooting**

### **Files Not Appearing in Cloudinary:**
1. Check environment variables are set correctly
2. Verify Cloudinary credentials are valid
3. Check server logs for upload errors
4. Ensure file size is under 10MB

### **Wrong File Type:**
1. The fix above should resolve this
2. Restart the server after making changes
3. Test with a new file upload

### **Upload Fails:**
1. Check file size (must be < 10MB)
2. Verify file type is supported
3. Check Cloudinary account limits
4. Verify network connection

## 📈 **Cloudinary Dashboard Features**

### **Media Library:**
- View all uploaded files
- Search by filename or tags
- Download original files
- Generate different formats/sizes

### **Analytics:**
- Storage usage
- Bandwidth usage
- Transformations used
- API calls made

### **Settings:**
- Upload presets
- Security settings
- API keys management
- Usage limits

## 🚀 **Next Steps**

1. **Set up Cloudinary account** and get credentials
2. **Add credentials** to your `.env` file
3. **Restart the server** to apply changes
4. **Test upload functionality** with different file types
5. **Check Cloudinary dashboard** to verify files are uploaded correctly

## 📞 **Support**

If you encounter issues:
1. Check the server console for error messages
2. Verify Cloudinary credentials are correct
3. Test with a simple file upload first
4. Check Cloudinary dashboard for uploaded files
