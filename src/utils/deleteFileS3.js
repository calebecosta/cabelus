import { unlink } from 'fs';
import { resolve } from 'path';
import aws from 'aws-sdk';
import { promisify } from 'util';

const s3 = new aws.S3();

export default async (key) => {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      })
      .promise()
      .then((response) => {
        console.log(response.status);
      })
      .catch((response) => {
        console.log(response.status);
      });
  }
  return promisify(unlink)(
    resolve(__dirname, '..', '..', 'temp', 'uploads', 'img', key)
  );
};
