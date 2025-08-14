const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { GridFSBucket } = require("mongodb");
require('dotenv').config();

let bucket, gridfs;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Initialize GridFSBucket
    bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'mediaFiles',
    });

    // Initialize gridfs-stream (optional, if you're using it elsewhere)
    gridfs = Grid(db, mongoose.mongo);
    gridfs.collection('mediaFiles');

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

connectDB();

module.exports = {
  getConnection: () => {
    if (!bucket || !gridfs) {
      throw new Error('GridFS not initialized yet. Wait for DB connection.');
    }
    return { bucket, gridfs };
  },
};
