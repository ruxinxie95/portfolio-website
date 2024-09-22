import os
import json

# Define the project template
template = {
    "id": "",
    "title": "",
    "status": "",  # Options: finished, on-going, conceptual design
    "year": "",
    "location": "",
    "design": "",  # e.g., firm or lab’s name, or "individual"
    "role": "",
    "image_credit": "",
    "url": "",
    "short_description": "",
    "full_description": "",
    "team_credit": "",
    "categories": []  # Default categories field
}

# List of fields to remove from project.json files
fields_to_remove = ["images"]  # Add any fields you want to remove here

# Get the current working directory where the script is located
script_dir = os.path.dirname(os.path.realpath(__file__))

# Set the path to the 'projects' folder relative to the script's location
projects_dir = os.path.join(script_dir, 'public', 'projects')  # Updated path to match your folder structure

# Function to update or create project.json files
def update_project_json(project_folder):
    project_json_path = os.path.join(project_folder, 'project.json')

    # Try to read and parse the existing project.json file, or start with an empty dictionary if it's invalid
    project_data = {}
    if os.path.exists(project_json_path):
        try:
            with open(project_json_path, 'r') as file:
                project_data = json.load(file)
        except (json.JSONDecodeError, IOError):
            print(f"Warning: Invalid or empty JSON file at {project_json_path}. Using template to regenerate.")

    # Update the project_data with fields from the template, but don't overwrite existing content
    for key, value in template.items():
        if key not in project_data:
            project_data[key] = value  # Add the missing key from the template

    # Ensure categories are present or set to a default value
    if not project_data.get('categories'):
        project_data['categories'] = ["architecture", "digital fabrication"]  # Add default categories if none are specified

    # Remove specified fields if they exist in project_data
    for field in fields_to_remove:
        if field in project_data:
            del project_data[field]
            print(f"Removed field '{field}' from {project_json_path}")

    # Write the updated project_data back to the file
    with open(project_json_path, 'w') as file:
        json.dump(project_data, file, indent=4)

# Loop through all project folders inside the 'projects' directory
for folder in os.listdir(projects_dir):
    project_folder = os.path.join(projects_dir, folder)
    
    # Only proceed if it's a directory
    if os.path.isdir(project_folder):
        update_project_json(project_folder)

print("Project files updated successfully!")
