import os
import json

# Define the project template with required fields
template = {
    "id": "",
    "title": "",
    "categories": [],
    "year": "",
    "location": "",
    "description": "",
    "folder": ""
}

# List of fields to remove from project.json files
fields_to_remove = ["images"]  # Add any fields you want to remove here

# List of valid categories (optional)
valid_categories = ["Design", "Photography", "Architecture", "Digital Fabrication"]  # Update as needed

# Get the current working directory where the script is located
script_dir = os.path.dirname(os.path.realpath(__file__))

# Set the path to the 'projects' folder relative to the script's location
projects_dir = os.path.join(script_dir, 'public', 'projects')  # Ensure this path is correct

# Function to update or create project.json files
def update_project_json(project_folder):
    project_json_path = os.path.join(project_folder, 'project.json')

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

    # Update the project_data with fields from the template, but don't overwrite existing content
    for key, value in template.items():
        if key not in project_data:
            project_data[key] = value  # Add the missing key from the template

    # Ensure 'folder' field matches the actual folder name
    if project_data.get('folder') != os.path.basename(project_folder):
        print(f"Updating 'folder' field in {project_json_path} to match the folder name.")
        project_data['folder'] = os.path.basename(project_folder)

    # Validate and clean categories
    if 'categories' in project_data and isinstance(project_data['categories'], list):
        cleaned_categories = []
        for category in project_data['categories']:
            # Remove any unwanted characters or fix typos
            clean_category = category.strip()
            # Optionally, enforce valid categories
            if clean_category in valid_categories:
                cleaned_categories.append(clean_category)
            else:
                print(f"Warning: Invalid category '{clean_category}' in {project_json_path}. It will be removed.")
        project_data['categories'] = cleaned_categories
    else:
        # Assign default categories if none are present
        project_data['categories'] = ["Design", "Photography"]
        print(f"Assigned default categories to {project_json_path}.")

    # Remove specified fields if they exist in project_data
    for field in fields_to_remove:
        if field in project_data:
            del project_data[field]
            print(f"Removed field '{field}' from {project_json_path}")

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
