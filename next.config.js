// next.config.js

module.exports = {
  reactStrictMode: true,
  images: {
      domains: ['aws-storage-projects.s3.us-east-2.amazonaws.com'], // Add your S3 domain here
  },
  env: {
      AWS_BUCKET_NAME: 'aws-storage-projects', // Make sure this matches your bucket name
      AWS_REGION: 'us-east-2', // Make sure this matches your S3 region
  },
};
