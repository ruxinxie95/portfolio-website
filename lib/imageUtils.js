import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME;

export async function getImagesAndMetadata(imageUrls) {
    // Ensure imageUrls is an array and iterate over each URL
    if (!Array.isArray(imageUrls)) {
        console.warn("Expected an array of image URLs, received:", imageUrls);
        return { imageFiles: [], imageMetadata: {} };
    }

    // Filter and sort images for organization
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

    for (const url of imageFiles) {
        try {
            // Extract the S3 object key from the URL (removing leading '/' for compatibility)
            const key = new URL(url).pathname.slice(1); 

            // Fetch metadata directly from S3
            const command = new HeadObjectCommand({ Bucket: bucketName, Key: key });
            const response = await s3.send(command);
            const artist = response.Metadata?.artist || 'Ruxin Xie'; // Default artist if none found

            imageMetadata[url] = { artist };
        } catch (error) {
            console.warn(`Failed to retrieve metadata for image ${url}:`, error);
            imageMetadata[url] = { artist: 'Unknown Artist' };
        }
    }

    return { imageFiles, imageMetadata };
}
