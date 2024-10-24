// utils/imageUtils.js
import path from 'path';
import fs from 'fs/promises';
import { exiftool } from 'exiftool-vendored';

export async function getImagesAndMetadata(imagesDirPath) {
    const imageFilesRaw = await fs.readdir(imagesDirPath);
    const imageFiles = imageFilesRaw
        .filter(file => /\.(jpg|jpeg|png|gif|tiff)$/i.test(file))
        .sort((a, b) => {
            if (a.toLowerCase() === 'cover.jpg') return -1;
            if (b.toLowerCase() === 'cover.jpg') return 1;
            const aNum = parseInt(a.replace(/\D/g, ''), 10);
            const bNum = parseInt(b.replace(/\D/g, ''), 10);
            return aNum - bNum;
        });

    const imageMetadata = {};
    for (const file of imageFiles) {
        const filePath = path.join(imagesDirPath, file);
        try {
            const metadata = await exiftool.read(filePath);
            const artist = metadata.Artist || 'Ruxin Xie';
            imageMetadata[file] = { artist };
        } catch (error) {
            console.warn(`Failed to read metadata for image ${file}:`, error);
            imageMetadata[file] = { artist: 'Unknown Artist' };
        }
    }

    return { imageFiles, imageMetadata };
}
