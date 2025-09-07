// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'src/assets/upload'),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ message: 'Imagen subida correctamente', file: req.file.filename });
});

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));