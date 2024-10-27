#!/bin/bash

# Define local and S3 paths
LOCAL_PATH="/Users/ruxinxie/Website/portfolio-website/public/projects"
S3_BUCKET_PATH="s3://aws-storage-projects/projects"

# Run AWS CLI sync command, excluding unwanted files like .DS_Store
aws s3 sync "$LOCAL_PATH" "$S3_BUCKET_PATH" --delete --exclude ".DS_Store" --exclude "*.gsheet"

# Print completion message
echo "Sync complete. Your S3 bucket is now up-to-date with the local 'projects' folder, excluding .DS_Store files."
