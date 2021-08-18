const { GridFSBucket } = require("mongodb");
const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const bucketName = "srv-cdn";
let error = false;

class Mongo {
  constructor() {
    if (!process.env.MONGO_URI) return;

    mongoose.Promise = global.Promise;

    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .catch(() => {});

    mongoose.connection.on("connected", () => {
      this.bucket = new GridFSBucket(mongoose.connection.db, {
        readPreference: "secondaryPreferred",
      });
      console.log("Database connected", process.env.MONGO_URI);
      error = false;
    });

    mongoose.connection.on("disconnected", () => {
      !error && console.error("Database disconnected", process.env.MONGO_URI);
      error = true;
    });

    this.image = multer({
      limits: { fileSize: 1000000 },
      fileFilter: (req, file, cb) =>
        cb(null, file.mimetype.startsWith("image/")),
      storage: {
        _handleFile: (req, file, cb) => handleFile("image", req, file, cb),
        _removeFile: (req, file, cb) => cb(null),
      },
    });

    this.video = multer({
      limits: { fileSize: 5000000 },
      fileFilter: (req, file, cb) =>
        cb(null, file.mimetype.startsWith("video/")),
      storage: {
        _handleFile: (req, file, cb) => handleFile("video", req, file, cb),
        _removeFile: (req, file, cb) => cb(null),
      },
    });

    const handleFile = (type, req, file, cb) => {
      file.filename = uuid() + path.extname(file.originalname);
      file.link = `/${bucketName}/${type}/${file.filename}`;
      file.stream.pipe(
        this.bucket.openUploadStream(file.filename, {
          contentType: file.mimetype,
          metadata: {
            user: req.auth && req.auth.user && req.auth.user.id,
            dir: req.query.dir,
          },
        })
      );
      cb(null, true);
    };
  }

  disconnected() {
    return process.env.MONGO_URI && mongoose.connection.readyState != 1;
  }
}

module.exports = new Mongo();
