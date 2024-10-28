#!/bin/bash

# Define local and S3 paths
LOCAL_PATH="/Users/ruxinxie/Website/portfolio-website/public/projects"
S3_BUCKET_PATH="s3://aws-storage-projects/projects"

# Sync all files with --exact-timestamps for unchanged files, excluding .DS_Store files
aws s3 sync "$LOCAL_PATH" "$S3_BUCKET_PATH" --delete --exclude ".DS_Store" --exclude "**/.DS_Store" --exclude "*.gsheet" --exact-timestamps

# Add metadata to new or updated image and video files, excluding .DS_Store
find "$LOCAL_PATH" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.mp4" \) -not -name ".DS_Store" | while read -r file; do
    # Determine the S3 key by removing the local path prefix
    s3_key="${file#$LOCAL_PATH/}"

    # Check if metadata needs to be updated by fetching artist information
    artist=$(exiftool -Artist "$file" | awk -F ': ' '{print $2}')
    [ -z "$artist" ] && artist="Unknown Artist"

    # Update metadata on S3
    aws s3 cp "$file" "$S3_BUCKET_PATH/$s3_key" --metadata "artist=$artist" --metadata-directive REPLACE --exclude ".DS_Store" --exclude "**/.DS_Store" --exclude "*.gsheet"
    echo "Updated metadata for $s3_key with artist: $artist"
done

# Completion message
echo "Sync complete. Your S3 bucket is up-to-date with all files and updated metadata, excluding .DS_Store files."
