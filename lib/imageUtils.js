// lib/imageUtils.js
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Fetch image files and their metadata from S3.
 * @param {Array} imageUrls - Array of image URLs to fetch metadata for.
 * @returns {Object} - Object containing image files and their metadata.
 */
export async function getImagesAndMetadata(imageUrls) {
    if (!Array.isArray(imageUrls)) {
        console.warn("Expected an array of image URLs, received:", imageUrls);
        return { imageFiles: [], imageMetadata: {} };
    }

    // Filter and sort image files
    const imageFiles = imageUrls
        .filter(file => /\.(jpg|jpeg|png|gif|tiff)$/i.test(file) && !file.includes('.DS_Store'))
        .sort((a, b) => {
            if (a.toLowerCase().includes('cover')) return -1;
            if (b.toLowerCase().includes('cover')) return 1;
            const aNum = parseInt(a.replace(/\D/g, ''), 10);
            const bNum = parseInt(b.replace(/\D/g, ''), 10);
            return aNum - bNum;
        });

    const imageMetadata = {};

    // Fetch artist metadata from the corresponding metadata.json file
    for (const url of imageFiles) {
        try {
            const key = new URL(url).pathname.slice(1); // Extract the S3 key from the URL
            const projectPath = key.split('/').slice(0, -2).join('/'); // Extract the project folder path

            // Define the S3 key for the metadata.json file in the images folder
            const metadataJsonKey = `${projectPath}/metadata.json`;

            console.log(`Fetching metadata.json for project at: ${metadataJsonKey}`);

            // Fetch metadata.json file from S3
            const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: metadataJsonKey });
            const response = await s3.send(getObjectCommand);

            // Parse the metadata.json content
            const metadataJson = JSON.parse(await streamToString(response.Body));

            // Find artist metadata for the current image
            const imageFileName = path.basename(url);
            const metadataEntry = metadataJson.find(entry => entry.file_name === imageFileName);

            const artist = metadataEntry?.artist || 'Ruxin Xie'; // Fallback if artist is not found
            console.log(`Artist for ${url}: ${artist}`);

            // Store the metadata
            imageMetadata[url] = { artist };
        } catch (error) {
            // If fetching metadata.json fails, set a fallback artist
            console.warn(`Failed to retrieve metadata for image ${url}:`, error.message);
            imageMetadata[url] = { artist: 'Ruxin Xie' };
        }
    }

    // Return the list of image files and their corresponding metadata
    return { imageFiles, imageMetadata };
}

/**
 * Convert a readable stream to a string.
 * @param {Readable} stream - The readable stream.
 * @returns {Promise<string>} - The string content of the stream.
 */
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        stream.on('error', reject);
    });
}
