import express, { Application } from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "path";
import userRoutes from "./routes/User";
import cors from "cors";



// Load environment variables
dotenv.config();

// App creation
const app: Application = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
    
  })
);

// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Database connection
import { connect as connectDatabase } from "./config/database";


// Cloudinary connection
import { cloudinaryConnect } from "./config/cloudinary";
cloudinaryConnect();

// API routes
import UploadRoutes from "./routes/FileUpload";

app.use("/api/v1/files", UploadRoutes);
app.use("/api/v1/auth", userRoutes);
// Serve static files
app.use("/files", express.static(path.join(__dirname, "files")));
// Serve static files for images
app.use("/images", express.static(path.join(__dirname, "images")));
// Serve static files for videos
app.use("/videos", express.static(path.join(__dirname, "videos")));
// Serve static files for audios
app.use("/audios", express.static(path.join(__dirname, "audios")));
// Serve static files for documents
app.use("/documents", express.static(path.join(__dirname, "documents")));
// Serve static files for PDFs
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// Activate server
app.listen(PORT, () => {
  connectDatabase();
  console.log(`App is running at ${PORT}`);
});

