//pages/api/getProjects.js
const fs = require('fs').promises;
const path = require('path');

export default async function handler(req, res) {
    try {
        // Update the path to point to the 'public' directory
        const projectsDir = path.join(process.cwd(), 'public', 'projects');

        console.log(`Scanning projects directory: ${projectsDir}`);

        // Check if the projects directory exists
        try {
            await fs.access(projectsDir);
            // console.log('Projects directory exists.');
        } catch (err) {
            console.error('Projects directory does not exist:', err);
            return res.status(500).json({ error: 'Projects directory not found.' });
        }

        const files = await fs.readdir(projectsDir, { withFileTypes: true });
        const projectFolders = files.filter(file => file.isDirectory()).map(dir => dir.name);

        const projects = [];

        for (const folder of projectFolders) {
            const projectJsonPath = path.join(projectsDir, folder, 'project.json');
            const imagesDirPath = path.join(projectsDir, folder, 'images', 'compressed'); // Updated path

            try {
                const data = await fs.readFile(projectJsonPath, 'utf8');
                const projectData = JSON.parse(data);

                const requiredFields = ['id', 'title', 'categories', 'year', 'location', 'description'];
                const hasAllFields = requiredFields.every(field => field in projectData);

                if (hasAllFields) {
                    if (!projectData.folder) {
                        projectData.folder = folder;
                    }

                    try {
                        const imageFiles = await fs.readdir(imagesDirPath);
                        const validImageFiles = imageFiles.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
                        projectData.images = validImageFiles;
                    } catch (err) {
                        console.warn(`Compressed images folder not found or empty for project: ${folder}`);
                        projectData.images = [];
                    }

                    projects.push(projectData);
                } else {
                    const missing = requiredFields.filter(field => !(field in projectData));
                    console.warn(`Project "${folder}" is missing required fields: ${missing.join(', ')}`);
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`project.json not found for project: ${folder}`);
                } else {
                    console.error(`Error processing project "${folder}":`, err);
                }
            }
        }

        projects.sort((a, b) => a.id - b.id);
        res.status(200).json(projects);
    } catch (err) {
        console.error('Error reading projects directory:', err);
        res.status(500).json({ error: 'Failed to read projects directory.' });
    }
}
