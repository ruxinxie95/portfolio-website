#!/bin/bash

# Define local and S3 paths
LOCAL_PATH="/Users/ruxinxie/Website/portfolio-website/public/projects"
S3_BUCKET_PATH="s3://aws-storage-projects/projects"

# Log debug information
log_debug() {
    echo "DEBUG: $1"
}

# Purge all existing files in the S3 bucket
log_debug "Purging all files in S3 bucket: $S3_BUCKET_PATH..."
aws s3 rm "$S3_BUCKET_PATH" --recursive
if [[ $? -eq 0 ]]; then
    log_debug "S3 bucket purge completed successfully."
else
    log_debug "Failed to purge S3 bucket."
    exit 1
fi

# Find and delete 'project (1).json' files locally
log_debug "Cleaning up invalid files..."
find "$LOCAL_PATH" -type f -name "project (1).json" -exec rm -v {} \;

# Perform S3 sync, ensuring all images and videos are uploaded
log_debug "Starting sync operation to S3..."
aws s3 sync "$LOCAL_PATH" "$S3_BUCKET_PATH" --delete --exclude ".DS_Store" --exclude "**/.DS_Store" --exclude "*.gsheet" --exclude "project (1).json" --exact-timestamps
if [[ $? -eq 0 ]]; then
    log_debug "Sync operation completed successfully."
else
    log_debug "Sync operation failed."
    exit 1
fi

# Completion message
log_debug "All images and videos from $LOCAL_PATH have been uploaded to $S3_BUCKET_PATH, excluding invalid and unwanted files."
