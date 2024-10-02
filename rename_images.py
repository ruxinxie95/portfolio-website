import os
import re

# Path to the folder containing the images
folder_path = '/Users/ruxinxie/Website/portfolio-website/projects/project9_ridgeline/images'

# Get a list of files in the folder
files = os.listdir(folder_path)

# Filter out files that are images (you can adjust extensions if needed)
image_extensions = ['.jpg', '.jpeg', '.png', '.gif']  # Add any other extensions you need
image_files = [f for f in files if os.path.splitext(f)[1].lower() in image_extensions]

# Custom sorting function to extract the number from the filename and sort by it
def sort_key(filename):
    # Find the first sequence of digits in the filename
    match = re.search(r'(\d+)', filename)
    # If found, return the number as an integer; otherwise, return 0
    return int(match.group(1)) if match else 0

# Sort the image files based on the number in their generic filenames
image_files.sort(key=sort_key)

# Loop through the files and rename them
for i, filename in enumerate(image_files, start=1):
    # Skip any file with "cover" in its name
    if 'cover' in filename.lower():
        print(f'Skipping: {filename}')
        continue

    # Get the file extension
    file_extension = os.path.splitext(filename)[1]
    
    # Create the new file name
    new_filename = f'ridgeline_img_{i}{file_extension}'
    
    # Construct full file paths
    old_file = os.path.join(folder_path, filename)
    new_file = os.path.join(folder_path, new_filename)
    
    # Rename the file
    os.rename(old_file, new_file)
    print(f'Renamed: {filename} -> {new_filename}')

print("Renaming complete!")
