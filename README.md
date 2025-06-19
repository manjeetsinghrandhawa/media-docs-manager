# 📁 File Management System

A full-stack file management application built with React, TypeScript, Node.js, Express, and MongoDB. Features include file upload, preview, download, categorization, and user authentication.

## ✨ Features

- 🔐 **User Authentication** - Register, login, email verification with OTP
- 📤 **File Upload** - Drag & drop or click to upload multiple files
- 🗂️ **File Categories** - Automatic categorization (Text, Audio, Video, Images, PDF, Documents, Archives)
- 👁️ **File Preview** - View files directly in the browser with custom players for audio/video
- ⬇️ **File Download** - Enhanced download functionality with proper headers
- 🔍 **File Search & Filter** - Search by name/type and filter by categories
- 📱 **Responsive Design** - Mobile-first design that works on all devices
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **express-fileupload** for file handling
- **JWT** for authentication
- **Nodemailer** for email services

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd file-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment variables
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment variables
   cp env.example .env
   # Edit .env with your actual values
   ```

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
MONGODB_URL=mongodb://localhost:27017/filemanager
DB_NAME=filemanager

# Server Configuration
PORT=8000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for OTP verification)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password_here

# Cloudinary Configuration (if using)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./controllers/files/

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

#### Frontend (.env)
```env
# API Configuration
REACT_APP_BASE_URL=http://localhost:8000/api/v1

# Backend Server URL
REACT_APP_BACKEND_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:8000`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Application will open on `http://localhost:3000`

## 📱 File Type Support

- **Text Files**: `.txt`, `.md`, `.json`, `.xml`, `.csv`
- **Audio Files**: `.mp3`, `.wav`, `.ogg`
- **Video Files**: `.mp4`, `.webm`, `.avi`
- **Images**: `.jpg`, `.png`, `.gif`, `.svg`
- **Documents**: `.pdf`, `.doc`, `.docx`, `.ppt`, `.xlsx`
- **Archives**: `.zip`, `.rar`, `.tar.gz`

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/sendotp` - Send OTP for verification
- `POST /api/v1/auth/verifyemail` - Verify email with OTP

### File Management
- `POST /api/v1/files/upload` - Upload files
- `GET /api/v1/files/allfiles` - Get user files
- `DELETE /api/v1/files/delete/:id` - Delete file
- `GET /api/v1/files/serve/:fileName` - Serve file content
- `GET /api/v1/files/download/:fileName` - Download file

## 📁 Project Structure

```
file-management-system/
├── backend/
│   ├── config/
│   │   ├── database.ts
│   │   └── cloudinary.ts
│   ├── controllers/
│   │   ├── Auth.ts
│   │   ├── fileUpload.ts
│   │   └── files/          # Uploaded files stored here
│   ├── models/
│   │   ├── User.ts
│   │   ├── File.ts
│   │   └── OTP.ts
│   ├── routes/
│   │   ├── User.ts
│   │   └── FileUpload.ts
│   ├── middlewares/
│   │   └── auth.ts
│   ├── utils/
│   │   ├── mailSender.ts
│   │   └── imageUploader.ts
│   └── index.ts
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   ├── services/
│   │   ├── slices/
│   │   └── types/
│   └── package.json
├── .gitignore
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification with OTP
- File type validation
- File size limits (50MB default)
- CORS configuration
- Input sanitization

## 🎨 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interfaces
- Optimized file upload on mobile
- Responsive file preview modals
- Category filters adapted for small screens
- Proper touch targets (44px minimum)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- File preview may not work for all file types in some browsers
- Large file uploads may take time depending on internet connection
- Email OTP may end up in spam folder

## 🚀 Future Enhancements

- [ ] File sharing with other users
- [ ] Folder organization
- [ ] File versioning
- [ ] Advanced search filters
- [ ] File encryption
- [ ] Bulk operations
- [ ] Cloud storage integration (AWS S3, Google Drive)

## 📞 Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Happy File Managing! 📁✨** 