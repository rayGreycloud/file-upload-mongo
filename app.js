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


// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
app.listen(port, () => console.log(`Server started and listening on port ${port}`));
