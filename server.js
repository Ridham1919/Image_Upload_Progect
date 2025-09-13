import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const app = express();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dhj2oktlp",
  api_key: "993431971476121",
  api_secret: "jlOL3gHwlu0388ufIqBj9dYJT9k",
});

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://ridhammakwana19_db_user:6NwNf28emlht74X5@cluster0.amykvce.mongodb.net/",
    {
      dbName: "Authentication_Project",
    }
  )
  .then(() => console.log("MongoDB Connected...!"))
  .catch((err) => console.log(err));

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));

// Rendering EJS file
app.get("/", (req, res) => {
  res.render("index.ejs", { url: null });
});

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// Mongoose Schema
const fileSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgUrl: String,
});

const File = mongoose.model("cloudinary", fileSchema);

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Multer file details
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Upload to Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(filePath, {
      folder: "Ridham_19",
    });

    // Save to MongoDB
    const db = await File.create({
      filename: originalName,
      public_id: cloudinaryRes.public_id,
      imgUrl: cloudinaryRes.secure_url,
    });

    // Render file URL
    res.render("index.ejs", { url: cloudinaryRes.secure_url });

    // Or if you want JSON response:
    // res.json({ message: "File uploaded successfully", cloudinaryRes });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload Failed!");
  }
});

// Start Server
const port = 1000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
