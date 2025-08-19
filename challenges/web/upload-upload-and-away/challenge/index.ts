import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

let fileCount = 0;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html")); // paths are relative to dist/
});

const imagesDir = path.join(__dirname, "../images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    cb(null, path.basename(file.originalname));
  },
});

const upload = multer({ storage });

app.get("/filecount", (req, res) => {
  res.json({ file_count: fileCount });
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  fileCount++;
  res.send("File uploaded successfully.");
});

app.delete("/images", (req, res) => {
  const imagesDir = path.join(__dirname, "../images");
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).send("Failed to read images directory.");
    }
    let deletePromises = files.map((file) =>
      fs.promises.unlink(path.join(imagesDir, file))
    );
    Promise.allSettled(deletePromises)
      .then(() => {
        fileCount = 0;
        res.send("All files deleted from images directory.");
      })
      .catch(() => res.status(500).send("Failed to delete some files."));
  });
});

app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});

export const flag = "uiuctf{turing_complete_azolwkamgj}";
