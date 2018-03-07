// Import libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

// Instantiate server
const app = express();
// Set server port 
const port = 5000;

// Middleware 
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoURI = 'mongodb://darth:darth@ds259768.mlab.com:59768/mongouploads';
// Create mongo connection 
const conn = mongoose.createConnection(mongoURI);

// Init gfs 
let gfs;

conn.once('open', () => {
  // Initialize stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine 
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename,
          bucketName: 'uploads'
        };
        
        resolve(fileInfo);
      });
    });
  }
});
// Pass storage engine to multer
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  res.render('index');
});

// @route POST /upload 
// @desc Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/');
});

// @route GET /files 
// @desc Display all uploaded files in json
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check for existing files 
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
    
    // Files exist 
    return res.json(files); 
  });
});

// Start server
app.listen(port, () => console.log(`Server started and listening on port ${port}`));
