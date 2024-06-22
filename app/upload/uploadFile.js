const { S3Upload } = require("./S3.controller");
const pool = require("../boot/database/db_connect");
const logger = require("../middleware/winston");

const uploadFile = (path, req, sql, callback) => {
  S3Upload(path, req.file, function (s3uploaded) {
    if (s3uploaded.Location) {
      pool.query(sql, [s3uploaded.Location, req.params.id], (err, rows) => {
        if (err) {
          logger.error(err.stack);
          callback({
            error: err,
          });
        } else {
          return callback({
            message: "file uploaded",
            url: s3uploaded.Location,
          });
        }
      });
    } else {
      return callback({
        message: "upload failed",
      });
    }
  });
};

module.exports = uploadFile;
