'use strict';

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Upload a file buffer to S3
 * @param {Buffer} fileBuffer - The file buffer from multer memory storage
 * @param {string} key - The S3 object key (path in bucket)
 * @param {string} mimetype - The file MIME type
 * @returns {string} The public URL of the uploaded file
 */
const uploadToS3 = async (fileBuffer, key, mimetype) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  return `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
};

/**
 * Delete a file from S3
 * @param {string} key - The S3 object key to delete
 */
const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Extract S3 key from a full S3 URL
 * @param {string} url - The full S3 URL
 * @returns {string|null} The S3 key or null if not an S3 URL
 */
const getKeyFromUrl = (url) => {
  if (!url) return null;
  const prefix = `https://${BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`;
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  return null;
};

module.exports = {
  s3Client,
  uploadToS3,
  deleteFromS3,
  getKeyFromUrl,
};
