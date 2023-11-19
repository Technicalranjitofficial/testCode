const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

// Load the key directly from the JSON file
const key = require('../crediential.json');

// Set the current time and expiration time
const currentTime = Math.floor(Date.now() / 1000); // in seconds
const expirationTime = currentTime + 3600; // 1 hour

// Generate a JWT token
const jwToken = jwt.sign(
  {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    iat: currentTime,
    exp: expirationTime,
  },
  key.private_key,
  {
    algorithm: 'RS256',
  }
);

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: key.client_email,
    private_key: key.private_key,
  },
  scopes: 'https://www.googleapis.com/auth/drive',
});

const drive = google.drive({
  version: 'v3',
  auth: auth,
});



// createSubFolder(folderName, parentId)
//   .then((result) => {
//     console.log(result);
//     // Upload video to the created folder
//     uploadVideo(result.folderId, videoFileName);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

async function createSubFolder(name, parentId) {
  try {
    if (!name || !parentId) {
      return {
        success: false,
        folderId: '',
      };
    }

    const folderMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const driveResponse = await drive.files.create({
      requestBody: folderMetadata,
    });

    return {
      success: true,
      folderId: driveResponse.data.id,
    };
  } catch (error) {
    console.error('Error creating subfolder in Google Drive:', error);
    return {
      success: false,
      folderId: '',
    };
  }
}

exports.uploadVideo = async(parentFolderId, videoFileName)=> {
  try {
    const videoFileMetadata = {
      name: videoFileName,
      parents: [parentFolderId],
    };

    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(videoFileName),
    };

   await drive.files.create({
      requestBody: videoFileMetadata,
      media: media,
    });

    fs.unlinkSync(videoFileName);
    return true;
    // console.log('Video file uploaded. File Id:', driveResponse.data.id);
  } catch (error) {
    console.error('Error uploading video to Google Drive:', error);
    return false;
  }
}
