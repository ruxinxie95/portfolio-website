// next.config.js

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['aws-storage-projects.s3.us-east-2.amazonaws.com'], // S3 bucket domain
  },
  env: {
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
  },
};
