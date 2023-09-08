//import CryptoJS from 'crypto-js';

// function getHash(file) {
//     return new Promise((resolve, reject) => {
//         var reader = new FileReader();
//         reader.onload = function (event) {
//             var res = event.target.result;
//             var fileData = new Blob([res]); // Declare and initialize fileData
//             res = CryptoJS.lib.WordArray.create(res);
//             var sha1 = CryptoJS.SHA1(res).toString();
//             resolve({
//                 hash: sha1,
//                 fileData: fileData // Use the fileData variable
//             });
//         };
//         reader.readAsArrayBuffer(file);
//     });
// }

// function uploadFile(url, fileData) {
//     return new Promise((resolve, reject) => {
//         let request = new XMLHttpRequest()
//         request.onreadystatechange = function () {
//             if (request.readyState == 4 && request.status == 200) {
//                 resolve(request.getResponseHeader("etag"))
//             }
//         }
//         request.upload.onprogress = function (e) {
//             if (e.lengthComputable) {
//                 console.log('进度：' + e.loaded / e.total)
//             }
//         }
//         request.open('PUT', url);
//         request.setRequestHeader('Content-type', '');
//         request.send(fileData);
//     })
// }

import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [etag, setEtag] = useState('');

  function getHash(file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = function (event) {
        var res = event.target.result;
        var fileData = new Blob([res]);
        res = CryptoJS.lib.WordArray.create(res);
        var sha1 = CryptoJS.SHA1(res).toString();
        resolve({
          hash: sha1,
          fileData: fileData
        });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function uploadFile(url, fileData) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          resolve(request.getResponseHeader("etag"));
        }
      };
      request.upload.onprogress = function (e) {
        if (e.lengthComputable) {
          const progressPercentage = (e.loaded / e.total) * 100;
          setProgress(progressPercentage);
        }
      };
      request.open('PUT', url);
      request.setRequestHeader('Content-type', '');
      request.send(fileData);
    });
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    
    getHash(file)
      .then(result => {
        const { hash, fileData } = result;
        console.log('Hash:', hash);

        const uploadUrl = 'YOUR_UPLOAD_URL_HERE';
        return uploadFile(uploadUrl, fileData);
      })
      .then(responseEtag => {
        console.log('Uploaded ETag:', responseEtag);
        setEtag(responseEtag);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {progress > 0 && <p>Progress: {progress.toFixed(2)}%</p>}
      {etag && <p>Uploaded ETag: {etag}</p>}
    </div>
  );
}

export default FileUploader;
