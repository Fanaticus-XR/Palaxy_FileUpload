# Documentations for file uploading

This document is for Fanaticus XR summer intern, maily focusing on file upload section.

## Structure

There are mainly two directories in the repo, the file-upload-system used the [Upload with API Gateway and Lambda](#1) and galaxy-app used the [Upload with Presigned URL](#2).

In galaxy-app, I have developed the web frontend and backend separately.

The frontend pages are in React.

In public folder, there is index.html for React App, which is the test app for uploading function. There are also files called upload.html and create.html, which are the static pages developed in sketch and only support basic web artistic effects.

If you want to run the app, firstly install nodejs. In terminal, run `npm install`, which will install dependencies, then calls the `install` from the `package.json scripts` field, and if there is any severity vulnerabilities, you can run `npm audit fix`. 

Then, run `npm run start`, which will serve your app locally and  you can go to `localhost` (port 3000 in default) and see it running.  

So, http://localhost:3000/ will show you the test app for file uploading function (The frontend is adjustable for all kinds of files). But please go to Backend section to check how the test goes in backend for different files.

To deploy to aws static website hosting, you can follow https://aws.amazon.com/getting-started/projects/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/module-1/. in terminal,  you can run `npm run build`, which runs the build field from the `package.json` `scripts` field, compile the app into folder /build, so you can put the files onto the production server. 

The backend are developed using Nodejs in Lambda function and Gateway API. You can check the aws Gatway API and lambda function with the name S3Uploader. 

For file-upload-system, please check name file-upload-system-backend.

## S3 bucket Uploading logic

I mainly focus on three materials:

https://www.youtube.com/watch?v=IgAE-ycnb94&t=1241s and https://repost.aws/knowledge-center/api-gateway-upload-image-s3

https://www.youtube.com/watch?v=ozX3GbUOfF8 and https://aws.amazon.com/blogs/compute/uploading-to-amazon-s3-directly-from-a-web-or-mobile-application/

https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/

This three materials focus on three different ways to upload files to s3 bucket.

<span id = "1"/>

### 1. Upload with API Gateway and Lambda:

The client end encodes the files (encode images using Base64) and includes it in the JSON of API request (FormData() to wrap it up), starts the uploading. Then the backend system will receive the formData and do the encryption and call putObject to put it to corresponding bucket. (At frontend, it has no limitations of file type, but at backend the system should decrypt the file accordingly).

One request: has a 6 MB [limit](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) on the size of synchronous payloads (which includes API Gateway requests).

![](https://miro.medium.com/v2/resize:fit:1400/1*YHTzxzOKlHjflV1APAhniA.png)



Two request, improved but API Gateway itself has a 10 MB payload size [limit](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html). Check this for more info https://theburningmonk.com/2020/04/hit-the-6mb-lambda-payload-limit-heres-what-you-can-do/

![img](https://miro.medium.com/v2/resize:fit:1400/1*yu4zNsQgKJpE6y4xTHvqcA.png)



To upload an image or PDF as a binary file to an Amazon S3 bucket through API Gateway, [activate binary support](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-payload-encodings-configure-with-console.html).

To grant your API access to your S3 bucket, [create an AWS Identity and Access Management (IAM) role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-service.html). The IAM role must include permissions for API Gateway to perform the [PutObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html) and [GetObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) actions on your S3 bucket.

In these direct solutions, server-side code uses its IAM credentials to *presign* an S3 request. The client can then execute the presigned request to read or write directly to S3, but remember to [configure CORS](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html#how-do-i-enable-cors)!

Limits:

> 1. Lambda max payload size: 
>
>    6MB each for request and response (synchronous)
>
>    256KB (asynchronous)
>
> 2. API Gateway max payload size: 10MB
>
> 3. The bucket where we want to upload should stay private

To upload different types of files, we can set the **Binary Media Types** as  **\*/\*** for the serverless API (but the intergration type method should be AWS Service instead of Lambda function). Check the https://repost.aws/knowledge-center/api-gateway-upload-image-s3 for details.

This way can be extended to multiple types of files.

<span id = "2"/>

### 2. Use pre-signed S3 URL to upload

![img](https://miro.medium.com/v2/resize:fit:1400/1*hqE5vjOnrwW_VaR7eCWGmw.png)

This way we upload the image to S3 using a presigned URL, then pass the S3 object details to the API instead.

A presigned URL is just the URL of an S3 object with a bunch of query string parameters, which contain the signature and other security related data, and will expire in some time. In JavaScript, the [getSignedUrl](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property) or [getSignedUrlPromise](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrlPromise-property) methods are used to generate presigned URLs. Signing is in-memory with no network requests.

But according to my research, this way always requires you to specify the file type (the ContentType in s3Params for presigned URL) at the backend. It means a single presigned url can only be used to upload certain type of file, so the file name and file extension should be defined before uploading. I have not successfully extended it into multiple types (but it can be possible to edit the lambda function to make it able to upload different types of files to different buckets).

For example, you can set this in backend, remember to use PUT:

```javascript
let params = {
  Bucket: 'mybucketname',
  Key: 'anobjectkey',
  Expires: 300
};

let url = await s3.getSignedUrlPromise('putObject', params);
```

Please check https://zaccharles.medium.com/s3-uploads-proxies-vs-presigned-urls-vs-presigned-posts-9661e2b37932 (a very good article) for details.

Extension (Not implemented): This way may also include presigned **POST**,  which will support file size restrictions and different MIME type specification, check this github post for some references: https://github.com/zaccharles/presigned-s3-upload. It may also be connected with https://www.youtube.com/watch?v=7T5VbMEJStQ&t=19s, so it will support different types of files (maybe useful).

### 3. Multipart upload and Transfer acceleration

That's the last thing corresponding to file uploading, as we have known, previous paths will always have limitations on file size, mostly limited in 10 MB. However, for some large files like the MOV media files, it would be difficult to be uploaded. 

Following https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/, we can use mutipart upload and transfer acceleration tech to simpily the large file upload. 



Mutipart upload: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-upload-object.html

1. Initiate Mutipart Upload: In Restful api, there is one called CreateMultipartUpload, it will initiates a multipart upload and returns an upload ID, and the upload ID should be included in your upload part request.

2. Upload Part: One called UploadPart, Upload a part in a multipart upload with upload ID and part num.

3. Complete Mutipart Upload: One called CompleteMultipartUpload. Completes a multipart upload by assembling previously uploaded parts.

4. Stop Mutipart Upload:  One called AbortMultipartUpload. This stops multipart upload and free previous uploaded storage. It should free multipart uploaded parts several times to ensure complete removal.

5. List Parts: One called ListParts. Lists the parts that have been uploaded for a specific multipart upload. This operation must include the upload ID.

6. List Multipart Uploads: One called ListMultipartUploads. This action lists in-progress multipart uploads, which has not been completed or aborted.

   

Transfer Acceleration:

Follow https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration-getting-started.html.

Transfer Acceleration uses the globally distributed edge locations in Amazon CloudFront. As the data arrives at an edge location, data is routed to Amazon S3 over an optimized network path.

Steps: 

1. Enable Transfer Acceleration on a bucket.
2. Transfer data to and from the acceleration-enabled bucket. use `bucketname.s3-accelerate.amazonaws.com` as s3-accelerate endpoint domain name.
3. You can point your Amazon S3 PUT object and GET object requests to the `s3-accelerate` endpoint domain name and use the accelerate endpoint in the AWS CLI, AWS SDKs, and other tools that transfer data to and from Amazon S3.

## Implementation

### Frontend: static html and react app

I have designed static pages for upload and create page, which are corresponding to upload.html and create.html in /public separately. 

You can access this page by appending `/upload.html` to the original address, after `npm start`

The static html frontend is developed using Bootstrap to self adapt the zoom in and zoom out features.

It is better to configure the static html page into React component, but I have not finished the transformation so far.



In src, there are four files for React Test App frontend. In App.js, It involves the main logic for s3 bucket file uploading process. In onFileUpload(), it will first **get** presigned url from API_ENDPOINT, which is the invoke url in Restful API Gateway + routes. Then it will transform file content into binary data and wrap it using blob and corresponding MIME type. It will use fetch to PUT the data to the upload URL.

### Backend: Nodejs in Lambda function

You can check the lambda function like file-upload-system-backend and s3uploader. This two represents two ways: directly post to s3 bucket using API Gateway and upload using presigned url. You can read the code and refer to my previous intro.

# Some implementation issues

1. I have encountered the CORS error for many times. Please make sure that your CORS configuration in either frontend (React) or backend (Nodejs) is correct. Follow https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html and https://stackoverflow.com/questions/57009371/access-to-xmlhttprequest-at-from-origin-localhost3000-has-been-blocked

   add

   ```js
   // This should already be declared in your API file
   var app = express();
   
   // ADD THIS
   var cors = require('cors');
   app.use(cors());
   ```

2. Two ways to encapsulate file content:

   **FormData():**

   Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".

   **Blob():**

   https://developer.mozilla.org/en-US/docs/Web/API/Blob

   The **`Blob`** object represents a blob, which is a file-like object of immutable, raw data; they can be read as text or binary data, or converted into a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) so its methods can be used for processing the data. To construct a `Blob` from other non-blob objects and data, use the [`Blob()`](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob) constructor.

   ## About Download
   There are some materials that I found interesting and has some similar contents as our upload functions:
   https://awstut.com/en/2022/12/30/upload-download-files-to-from-s3-with-presigned-url-en/#toc1
   
   https://saturncloud.io/blog/how-to-download-a-file-from-amazon-s3-using-rest-api/
   
   https://www.geeksforgeeks.org/how-to-upload-and-download-files-from-aws-s3-using-python/
   
   It used the same presigned url method or just the normal http methods (we can do it as we are the one has the AWS credentials to the S3 bucket)to download specific files.

   





