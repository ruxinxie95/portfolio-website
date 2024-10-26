import { exiftool } from 'exiftool-vendored';

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
            const metadata = await exiftool.read(url);  // This may need to read a file rather than URL in some cases
            const artist = metadata.Artist || 'Ruxin Xie';
            imageMetadata[url] = { artist };
        } catch (error) {
            console.warn(`Failed to read metadata for image ${url}:`, error);
            imageMetadata[url] = { artist: 'Unknown Artist' };
        }
    }

    return { imageFiles, imageMetadata };
}
