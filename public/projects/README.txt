Google Sheet for Project Data:
URL: Project Data Sheet https://docs.google.com/spreadsheets/d/14wMVLkmvkOsBdpaYvD7KzGjQPH3GT_lkb1A9q9p4icA/edit?gid=0#gid=0
How to update:
Open the Google Sheet linked above.
Edit the project information as needed (add, remove, or modify rows and columns).
DO NOT manually edit the folder contents—the script will automatically handle the JSON files and folder structure.
Running the Script:
After making any changes to the Google Sheet, run the generateProjectFoldersAndJson script in Google Apps Script.
The script will:
Generate or update folders with the naming format project+id_projectname (in camelCase).
Automatically create or update the project.json file in each folder.
Create images and videos subfolders (if they don’t already exist).
Important Notes:
Any manual changes to the folder contents may be overwritten the next time the script is run.
Always ensure the data is correct and up to date in the Google Sheet before running the script.
