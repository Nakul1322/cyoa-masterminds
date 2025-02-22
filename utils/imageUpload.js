const AWS = require('aws-sdk');
const path = require('path')
const uuid= require('uuid')
require('dotenv').config()
var fs = require("fs");

const imageUpload = async(file) => {

    // Configure AWS with your access and secret key.
    const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, region: AWS_REGION });

    // Create an s3 instance
    const s3 = new AWS.S3();
    const filename = path.basename(file.name)
  
    //const base64 = "data:image/gif;base64," + fs.readFileSync(file, 'base64')

    //const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    // // Getting the file type, ie: jpeg, png or gif
    // const type = base64.split(';')[0].split('/')[1];

    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a different Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
    const params = {
        Bucket: S3_BUCKET,
        Key: uuid.v1()+filename, // type is not required
        Body: file.data,
        ACL: 'public-read',
        //ContentEncoding: 'base64', // required
        ContentType: 'image/jpeg' // required. Notice the back ticks
    }

    // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    let location = '';
    let key = '';
    try {
        const { Location, Key } = await s3.upload(params).promise();
        location = Location;
        key = Key;
    } catch (error) {
         console.log(error)
    }

    // Save the Location (url) to your database and Key if needs be.
    // As good developers, we should return the url and let other function do the saving to database etc
    console.log(location, key);

    return location;
}

module.exports = imageUpload;
