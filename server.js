const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Serve static files like HTML, CSS, and JavaScript
app.use(express.static(path.join(__dirname)));

// Define a route to get images from a specific project folder
app.get('/get-project-images/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    const imageFolder = path.join(__dirname, `projects/project${projectId}/images`);

    // Check if the directory exists
    if (!fs.existsSync(imageFolder)) {
        return res.status(404).send('Project folder not found');
    }

    fs.readdir(imageFolder, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to read image folder');
        }
        // Filter out only image files (assuming jpg/png format)
        const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
        res.json(imageFiles);
    });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
