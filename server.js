const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes (adjust as needed for security)
app.use(cors());

// Prevent caching to ensure the latest data is fetched
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch projects.json
app.get('/api/projects', (req, res) => {
    const projectsDir = path.join(__dirname, 'public', 'projects');
    console.log(`Scanning projects directory: ${projectsDir}`);

    fs.readdir(projectsDir, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading projects directory:', err);
            return res.status(500).json({ error: 'Failed to read projects directory.' });
        }

        // Filter directories only
        const projectFolders = files.filter(file => file.isDirectory()).map(dir => dir.name);
        console.log(`Found ${projectFolders.length} project folder(s):`, projectFolders);

        const projects = [];

        projectFolders.forEach(folder => {
            const projectJsonPath = path.join(projectsDir, folder, 'project.json');
            console.log(`Processing folder: ${folder}`);

            if (fs.existsSync(projectJsonPath)) {
                try {
                    const projectData = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
                    console.log(`Loaded project.json for ${folder}:`, projectData);

                    // Ensure all required fields are present
                    const requiredFields = ['id', 'title', 'categories', 'year', 'location', 'description'];
                    const hasAllFields = requiredFields.every(field => field in projectData);

                    if (hasAllFields) {
                        // Automatically assign 'folder' if missing
                        if (!projectData.folder) {
                            projectData.folder = folder;
                            console.log(`Added 'folder' field to project "${folder}":`, projectData.folder);
                        }

                        projects.push(projectData);
                    } else {
                        const missing = requiredFields.filter(field => !(field in projectData));
                        console.warn(`Project "${folder}" is missing required fields: ${missing.join(', ')}`);
                    }
                } catch (parseError) {
                    console.error(`Error parsing project.json in folder "${folder}":`, parseError);
                }
            } else {
                console.warn(`project.json not found for project: ${folder}`);
            }
        });

        console.log(`Total projects loaded: ${projects.length}`);
        // **New Sorting Step Begins**
        // Sort the projects array numerically based on the 'id' field in ascending order
        projects.sort((a, b) => a.id - b.id);
        console.log('Projects sorted numerically by id:', projects.map(p => p.id));
        // **New Sorting Step Ends**

        // Check if no projects are loaded
        if (projects.length === 0) {
            console.warn('No valid projects found.');
        }

        res.json(projects);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
