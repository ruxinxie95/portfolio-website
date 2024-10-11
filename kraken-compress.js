// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const Kraken = require('kraken');
const fs = require('fs');          // Standard fs module
const fsp = fs.promises;           // fs.promises API
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Kraken API credentials from environment variables
const kraken = new Kraken({
    api_key: process.env.KRAKEN_API_KEY,
    api_secret: process.env.KRAKEN_API_SECRET
});

// Define the directory containing project images
const directory = path.join(__dirname, 'public/projects');

// Function to delay between API requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to download the compressed file
async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close(resolve);
            });
            fileStream.on('error', (error) => {
                fs.unlink(outputPath, () => {}); // Delete the file async if error occurs
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Function to check if a file exists
async function fileExists(filePath) {
    try {
        await fsp.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Function to resize images using Sharp
async function resizeImageIfNeeded(imagePath, resizedPath) {
    try {
        const stats = await fsp.stat(imagePath);
        if (stats.size > 10 * 1024 * 1024) { // Check if larger than 20 MB
            console.log(`Resizing image ${imagePath} before Kraken compression...`);
            await sharp(imagePath)
                .resize({ width: 1200 }) // Resize to 1200 pixels width
                .toFormat('jpeg', { quality: 70 }) // Adjust quality for JPEG images
                .toFormat('png', { compressionLevel: 8 }) // Adjust compression level for PNG images
                .toFile(resizedPath);
            console.log(`Image resized: ${resizedPath}`);
            return resizedPath;
        }
        return imagePath; // Return original path if resizing not needed
    } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
        throw error;
    }
}

// Function to compress images using Kraken.io
async function compressImages() {
    try {
        const projectDirs = await fsp.readdir(directory, { withFileTypes: true });

        // Loop through project folders
        for (const project of projectDirs) {
            if (project.isDirectory()) {
                const imagesDir = path.join(directory, project.name, 'images');
                const compressedDir = path.join(imagesDir, 'compressed');

                // Check if images directory exists
                try {
                    const imagesDirStat = await fsp.stat(imagesDir);
                    if (!imagesDirStat.isDirectory()) {
                        console.warn(`Images directory not found for project ${project.name}. Skipping...`);
                        continue;
                    }
                } catch (err) {
                    console.warn(`Images directory not found for project ${project.name}. Skipping...`);
                    continue;
                }

                // Create a 'compressed' directory if it doesn't exist
                if (!(await fileExists(compressedDir))) {
                    await fsp.mkdir(compressedDir, { recursive: true });
                    console.log(`Created compressed directory: ${compressedDir}`);
                }

                const images = await fsp.readdir(imagesDir);

                for (const image of images) {
                    if (/(\.jpg|\.jpeg|\.png)$/i.test(image)) {
                        const imagePath = path.join(imagesDir, image);
                        const resizedPath = path.join(imagesDir, `resized_${image}`);
                        const outputPath = path.join(compressedDir, image);

                        // Skip compression if the compressed version already exists
                        if (await fileExists(outputPath)) {
                            console.log(`Skipping ${image}, already compressed.`);
                            continue;
                        }

                        console.log(`Processing: ${imagePath}`);

                        // Resize image if needed
                        let finalImagePath;
                        try {
                            finalImagePath = await resizeImageIfNeeded(imagePath, resizedPath);
                        } catch (resizeError) {
                            console.error(`Failed to resize ${imagePath}:`, resizeError);
                            continue; // Skip to the next image
                        }

                        // Retry logic with a maximum of 3 retries
                        const maxRetries = 3;
                        let compressed = false;

                        for (let attempt = 1; attempt <= maxRetries; attempt++) {
                            try {
                                const data = await new Promise((resolve, reject) => {
                                    kraken.upload({
                                        file: fs.createReadStream(finalImagePath),
                                        wait: true,
                                        lossy: true,
                                    }, (err, data) => {
                                        if (err) {
                                            console.error(`Error uploading ${image}:`, err);
                                            reject(err);
                                        } else if (!data.success) {
                                            console.error(`Failed response from Kraken for ${image}:`, data);
                                            reject(new Error(data.message || 'Unknown error'));
                                        } else {
                                            resolve(data);
                                        }
                                    });
                                });

                                if (data && data.success) {
                                    const compressedImageUrl = data.kraked_url;
                                    if (compressedImageUrl) {
                                        await downloadFile(compressedImageUrl, outputPath);
                                        console.log(`${image} compressed and saved to ${outputPath}`);
                                        compressed = true;
                                        break; // Exit retry loop if successful
                                    } else {
                                        console.error(`No URL received from Kraken for ${image}. Response data:`, data);
                                    }
                                } else {
                                    console.error(`Compression failed for ${image} on attempt ${attempt}:`, data ? data.message : "No data received from Kraken.");
                                }
                            } catch (error) {
                                console.error(`Error compressing ${image} on attempt ${attempt}:`, error.stack);
                            }

                            // Delay before retrying
                            if (attempt < maxRetries) {
                                console.log(`Retrying ${image} (attempt ${attempt + 1} of ${maxRetries})...`);
                                await delay(5000); // 5-second delay before retry
                            } else {
                                console.error(`Failed to compress ${image} after ${maxRetries} attempts.`);
                            }
                        }

                        // Add a delay to avoid rate limiting issues
                        await delay(3000); // 3-second delay between requests

                        // Delete resized image if it was created and compression was successful
                        if (finalImagePath !== imagePath && compressed) {
                            try {
                                await fsp.unlink(finalImagePath);
                                console.log(`Deleted resized image: ${finalImagePath}`);
                            } catch (unlinkError) {
                                console.error(`Failed to delete resized image ${finalImagePath}:`, unlinkError);
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Failed to compress images:', err);
    }
}

// Run the compression script
compressImages();
