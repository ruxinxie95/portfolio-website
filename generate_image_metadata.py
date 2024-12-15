import os
import json
import subprocess
from PIL import Image, ExifTags

def extract_metadata_with_exiftool(file_path):
    """
    Extract metadata using ExifTool, particularly for fields like 'Creator'.
    """
    try:
        # Run the exiftool command and capture the output
        result = subprocess.run(
            ["exiftool", file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if result.returncode != 0:
            print(f"ExifTool error for {file_path}: {result.stderr.strip()}")
            return {}
        
        # Parse metadata output to find key-value pairs
        metadata = {}
        for line in result.stdout.splitlines():
            if ":" in line:
                key, value = map(str.strip, line.split(":", 1))
                metadata[key] = value
        return metadata
    except Exception as e:
        print(f"Error running ExifTool for {file_path}: {e}")
        return {}

def extract_metadata(file_path):
    """
    Extract metadata using Pillow and fallback to ExifTool if necessary.
    """
    metadata = {}
    try:
        with Image.open(file_path) as img:
            # For JPEG and TIFF, use ExifTags
            if img.format in ["JPEG", "TIFF"]:
                exif_data = img.getexif()
                for tag_id, value in exif_data.items():
                    tag = ExifTags.TAGS.get(tag_id, tag_id)
                    metadata[tag] = value
            
            # For PNG, attempt to extract metadata via the `info` attribute
            elif img.format == "PNG":
                png_info = img.info
                metadata.update({k: v for k, v in png_info.items() if isinstance(v, str)})
                
        # Fallback to ExifTool for missing fields or PNG-specific metadata
        if not metadata.get("Creator"):
            exiftool_metadata = extract_metadata_with_exiftool(file_path)
            metadata.update(exiftool_metadata)
    except Exception as e:
        print(f"Error reading metadata for {file_path}: {e}")
    return metadata

def generate_json_metadata(base_folder):
    """
    Generate metadata JSON files for each project folder by consolidating data 
    from the images folder within each project, while excluding unwanted files.
    """
    for root, dirs, files in os.walk(base_folder):
        if "images" in dirs:  # Check if an 'images' folder exists in the current directory
            project_folder = root
            images_folder = os.path.join(root, "images")
            images_metadata = []
            
            # Process files in the images folder
            for file in os.listdir(images_folder):
                # Exclude unwanted files
                if file.lower().endswith((".jpg", ".jpeg", ".png", ".tiff")) and not file.startswith("project (1).json"):
                    file_path = os.path.join(images_folder, file)
                    metadata = extract_metadata(file_path)
                    
                    # Prioritize 'Creator' or 'Artist' fields for the artist name
                    artist_name = metadata.get("Creator") or metadata.get("Artist") or "Ruxin Xie"
                    images_metadata.append({
                        "file_name": file,
                        "artist": artist_name,
                    })
            
            # Exclude `project (1).json` from syncing
            for file in files:
                if file == "project (1).json":
                    print(f"Excluding file: {file}")
            
            # Write metadata JSON in the project folder
            if images_metadata:
                json_path = os.path.join(project_folder, "metadata.json")
                with open(json_path, "w") as json_file:
                    json.dump(images_metadata, json_file, indent=4)
                print(f"Metadata JSON created: {json_path}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python generate_image_metadata.py <folder_path>")
    else:
        folder_path = sys.argv[1]
        generate_json_metadata(folder_path)
