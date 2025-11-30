const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

exports.uploadToS3 = async (buffer, fileName) => {
  const bucket = process.env.AWS_BUCKET_NAME; // rehomifystores

  // Upload file
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: "application/pdf",
    })
  );

  // Generate signed URL valid for 24 hours (86400 sec)
  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: fileName,
    }),
    { expiresIn: 86400 }
  );

  return signedUrl; 
};
