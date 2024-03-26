var express = require("express");
var router = express.Router();
const youtubedl = require("youtube-dl-exec");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const http = require("http"); // Import the 'http' module
// const fs = require('fs');
const m3u8stream = require("m3u8stream");
const { uploadVideo } = require("../lib/connection");

const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "4.224.35.195", // MinIO server endpoint
  port: 80, // MinIO server port
  useSSL: false, // Use SSL (true/false)
  accessKey: "vXzrmMY3S3JVRYAquzWk", // Your MinIO access key
  secretKey: "Xg6zGT3jGDSyGj05d7p42V7HQap4GWFli7EoC4Qo", // Your MinIO secret key
});

router.get("/buckets", async function (req, res, next) {
  minioClient.listBuckets(function (err, buckets) {
    if (err) {
      return console.error("Error listing buckets: ", err);
    }
    console.log("Buckets:", buckets);
    res.json({ buckets });
  });
});

/* GET users listing. */
router.post("/", function (req, res, next) {
  youtubedl(req.body.url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    // addHeader: ['referer:youtube.com', 'user-agent:googlebot']
  }).then((output) => res.json({ output: output.requested_downloads }));
});

router.post("/file", async function (req, res, next) {
  // console.log("je")
  const { url, title } = req.body;
  console.log(url, title);
  // const m3u8Url = 'https://ev-h.phncdn.com/hls/videos/202308/04/436751971/,1080P_4000K,720P_4000K,480P_2000K,240P_1000K,_436751971.mp4.urlset/index-f1-v1-a1.m3u8?validfrom=1700370485&validto=1700377685&ipa=40.88.228.172&hdl=-1&hash=TbQRug8CBpcdB8EUxz%2BDzJNY0aE%3D';
  // const url = 'https://example.com/video.m3u8';
  const output = fs.createWriteStream(title);
  m3u8stream(url)
    .pipe(output)
    .on("finish", () => {
      res.json({ success: true });
      console.log("Video downloaded successfully!");
    })
    .on("error", (err) => {
      res.json({ success: false });
      console.error(err);
    });
});

const parentId = "1x_tlUfu1MKFsWzZgfqHTS2f7nonUHt7o";

// Example usage
const folderName = "NewFolder";
const videoFileName = "vid.mp4";

router.post("/upload", async function (req, res, next) {
  const { title } = req.body;
  // const result =await uploadVideo(parentId,title);

  const stream = fs.createReadStream(title);
  console.log(title,stream);
  fs.stat(title, (err, stats) => {
    if (err) return console.log("error");
    console.log(stats.size)
    minioClient.putObject(
      "kiitconnect",
      "video.mp4",
      stream,
      stats.size,
      (err, result) => {
        if (err) {
          console.log("error stats",err);
          return;
        }
        console.log("success", result);
        fs.unlinkSync(title);
        res.json({
          success: "true",
        });
      }
    );
  });
});

module.exports = router;
