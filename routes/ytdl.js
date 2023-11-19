var express = require('express');
var router = express.Router();
const youtubedl = require('youtube-dl-exec')
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const http = require('http'); // Import the 'http' module
// const fs = require('fs');
const m3u8stream = require('m3u8stream');
const { uploadVideo } = require('../lib/connection');

/* GET users listing. */
router.post('/', function(req, res, next) {
  youtubedl(req.body.url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    // addHeader: ['referer:youtube.com', 'user-agent:googlebot']
  }).then(output =>res.json({output:output.requested_downloads}))
});


router.post("/file",async function(req,res,next){

  // console.log("je")
  const {url,title} = req.body;
console.log(url,title);
  // const m3u8Url = 'https://ev-h.phncdn.com/hls/videos/202308/04/436751971/,1080P_4000K,720P_4000K,480P_2000K,240P_1000K,_436751971.mp4.urlset/index-f1-v1-a1.m3u8?validfrom=1700370485&validto=1700377685&ipa=40.88.228.172&hdl=-1&hash=TbQRug8CBpcdB8EUxz%2BDzJNY0aE%3D';
  // const url = 'https://example.com/video.m3u8';
  const output = fs.createWriteStream(title);
  m3u8stream(url)
    .pipe(output)
    .on('finish', () => {
      res.json({success:true})
      console.log('Video downloaded successfully!');
    })
    .on('error', (err) => {
      res.json({success:false})
      console.error(err);
    });
  

})

const parentId = '1x_tlUfu1MKFsWzZgfqHTS2f7nonUHt7o';

// Example usage
const folderName = 'NewFolder';
const videoFileName = 'vid.mp4';

router.post("/upload",async function(req,res,next){

  const {title} = req.body;
  const result =await uploadVideo(parentId,title);
  
res.json({
  success:result
})
})

module.exports = router;
