#!/bin/bash

# Source folder (Google Drive folder)
SRC="/Users/ruxinxie/Library/CloudStorage/GoogleDrive-ruxinx@umich.edu/My Drive/website_projects_folder/"

# Destination folder (local folder)
DEST="/Users/ruxinxie/Website/portfolio-website/public/projects"

# Use rsync to sync the contents (not the folder itself) to the 'projects' folder, excluding 'not selected' and '.DS_Store' files
rsync -avz --delete --exclude '*/not selected' --exclude '.DS_Store' "$SRC" "$DEST/"

echo "Sync complete! 'not selected' folder and '.DS_Store' files have been excluded."
