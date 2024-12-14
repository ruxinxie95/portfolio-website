import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client with AWS region
const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Fetch image files and their metadata from S3.
 * @param {Array} imageUrls - Array of image URLs to fetch metadata for.
 * @returns {Object} - Object containing image files and their metadata.
 */
export async function getImagesAndMetadata(imageUrls) {
    // Ensure imageUrls is an array
    if (!Array.isArray(imageUrls)) {
        console.warn("Expected an array of image URLs, received:", imageUrls);
        return { imageFiles: [], imageMetadata: {} };
    }

    // Filter and sort image files
    const imageFiles = imageUrls
        .filter(file => /\.(jpg|jpeg|png|gif|tiff)$/i.test(file) && !file.includes('.DS_Store'))
        .sort((a, b) => {
            // Prioritize cover images and sort numerically
            if (a.toLowerCase().includes('cover')) return -1;
            if (b.toLowerCase().includes('cover')) return 1;
            const aNum = parseInt(a.replace(/\D/g, ''), 10);
            const bNum = parseInt(b.replace(/\D/g, ''), 10);
            return aNum - bNum;
        });

    const imageMetadata = {};

    // Fetch metadata for each image
    for (const url of imageFiles) {
        try {
            // Extract the S3 object key from the URL
            const key = new URL(url).pathname.slice(1);

            // Fetch metadata from S3
            const command = new HeadObjectCommand({ Bucket: bucketName, Key: key });
            const response = await s3.send(command);

            // Default artist is "Ruxin Xie" if not provided
            const artist = response.Metadata?.artist || 'Ruxin Xie';
            imageMetadata[url] = { artist };
        } catch (error) {
            // Log warning and default artist to "Ruxin Xie"
            console.warn(`Failed to retrieve metadata for image ${url}:`, error.message);
            imageMetadata[url] = { artist: 'Ruxin Xie' };
        }
    }

    return { imageFiles, imageMetadata };
}
