#!/bin/bash

# Define local and S3 paths
LOCAL_PATH="/Users/ruxinxie/Website/portfolio-website/public/projects"
S3_BUCKET_PATH="s3://aws-storage-projects/projects"

# Log debug information
log_debug() {
    echo "DEBUG: $1"
}

# Sync only `metadata.json` files to S3
log_debug "Starting sync operation for metadata.json files..."
aws s3 sync "$LOCAL_PATH" "$S3_BUCKET_PATH" --exclude "*" --include "*/metadata.json" --exact-timestamps
if [[ $? -eq 0 ]]; then
    log_debug "Sync operation for metadata.json files completed successfully."
else
    log_debug "Sync operation failed."
    exit 1
fi

# Completion message
log_debug "All metadata.json files from $LOCAL_PATH have been uploaded to $S3_BUCKET_PATH."
