import os
import json
import re

# Define the project template with required fields
template = {
    "id": 0,  # Placeholder; will be overwritten with folder number
    "title": "",
    "categories": [],  # This field will not be modified if already present
    "year": "",
    "location": "",
    "description": "",
    "folder": ""  # This will be updated with the folder name
}

# Get the current working directory where the script is located
script_dir = os.path.dirname(os.path.realpath(__file__))

# Set the path to the 'projects' folder relative to the script's location
projects_dir = os.path.join(script_dir, 'projects')  # Ensure this path is correct

# Function to extract the numeric ID from the folder name
def extract_id_from_folder(folder_name):
    match = re.search(r'(\d+)', folder_name)
    if match:
        return int(match.group(1))
    else:
        return None

# Function to update or create project.json files
def update_project_json(project_folder):
    project_json_path = os.path.join(project_folder, 'project.json')
    folder_name = os.path.basename(project_folder)

    # Extract the numeric ID from the folder name
    project_id = extract_id_from_folder(folder_name)
    if project_id is None:
        print(f"Warning: Could not extract numeric ID from folder name '{folder_name}'. Skipping 'id' update.")
    
    # Try to read and parse the existing project.json file, or start with an empty dictionary if it's invalid
    project_data = {}
    if os.path.exists(project_json_path):
        try:
            with open(project_json_path, 'r') as file:
                project_data = json.load(file)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Invalid or empty JSON file at {project_json_path}. Using template to regenerate.")
    else:
        print(f"Warning: project.json not found at {project_json_path}. Creating a new one based on the template.")

    # Update the project_data with fields from the template, but don't overwrite existing content except 'id' and 'folder'
    for key, value in template.items():
        if key != 'id' and key != 'folder' and key not in project_data:
            project_data[key] = value  # Add missing keys from the template, but don't overwrite existing values

    # Overwrite the 'id' field if a valid project_id was extracted
    if project_id is not None:
        if project_data.get('id') != project_id:
            print(f"Updating 'id' field in {project_json_path} to {project_id}.")
            project_data['id'] = project_id

    # Ensure 'folder' field matches the actual folder name
    if project_data.get('folder') != folder_name:
        print(f"Updating 'folder' field in {project_json_path} to match the folder name.")
        project_data['folder'] = folder_name

    # Do NOT modify the categories field, if it's already present in the project_data
    # No need to check or assign default categories if the field exists.

    # Write the updated project_data back to the file
    try:
        with open(project_json_path, 'w') as file:
            json.dump(project_data, file, indent=4)
        print(f"Updated {project_json_path} successfully.")
    except IOError as e:
        print(f"Error writing to {project_json_path}: {e}")

# Loop through all project folders inside the 'projects' directory
def main():
    if not os.path.exists(projects_dir):
        print(f"Error: The projects directory '{projects_dir}' does not exist.")
        return

    for folder in os.listdir(projects_dir):
        project_folder = os.path.join(projects_dir, folder)
        
        # Only proceed if it's a directory
        if os.path.isdir(project_folder):
            update_project_json(project_folder)
    
    print("All project.json files have been updated successfully!")

if __name__ == "__main__":
    main()
