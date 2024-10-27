#!/bin/bash

# Define local and S3 paths
LOCAL_PATH="/Users/ruxinxie/Website/portfolio-website/public/projects/project01_timbrelyn"
S3_BUCKET_PATH="s3://aws-storage-projects/projects/project01_timbrelyn"

# Function to upload a single file with metadata
upload_with_metadata() {
    local file_path="$1"
    local s3_key="$2"

    # Extract the artist name using ExifTool
    artist=$(exiftool -Artist "$file_path" | awk -F ': ' '{print $2}')

    # Fallback to 'Unknown Artist' if no artist metadata is found
    if [ -z "$artist" ]; then
        artist="Unknown Artist"
    fi

    # Upload the file with custom metadata
    aws s3 cp "$file_path" "$S3_BUCKET_PATH/$s3_key" \
        --metadata "artist=$artist" \
        --exclude ".DS_Store" \
        --exclude "*.gsheet"
    
    echo "Uploaded $s3_key with artist metadata: $artist"
}

export -f upload_with_metadata
export LOCAL_PATH
export S3_BUCKET_PATH

# Find all image files (adjust file types as needed)
find "$LOCAL_PATH" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r file; do
    # Determine the S3 key by removing the local path prefix
    s3_key="${file#$LOCAL_PATH/}"
    upload_with_metadata "$file" "$s3_key"
done

# Optionally, handle other non-image files with standard sync
aws s3 sync "$LOCAL_PATH" "$S3_BUCKET_PATH" --delete --exclude ".DS_Store" --exclude "*.gsheet" --exclude "*.jpg" --exclude "*.jpeg" --exclude "*.png"

# Print completion message
echo "Sync complete. Your S3 bucket is now up-to-date with the local 'projects' folder, excluding .DS_Store and .gsheet files."
