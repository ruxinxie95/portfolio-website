// api/get-project-images/[projectId].js

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    const { projectId } = req.query;

    if (!projectId) {
        res.status(400).json({ error: 'Project ID is required.' });
        return;
    }

    const imageFolder = path.join(process.cwd(), 'public', 'projects', `project${projectId}`, 'images');


    fs.access(imageFolder, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).json({ error: 'Project folder not found.' });
            return;
        }

        fs.readdir(imageFolder, (err, files) => {
            if (err) {
                res.status(500).json({ error: 'Unable to read image folder.' });
                return;
            }

            const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif'));

            res.status(200).json(imageFiles);
        });
    });
};
