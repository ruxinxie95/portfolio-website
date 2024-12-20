import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getImagesAndMetadata } from './imageUtils';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Fetch project data, images, and videos from S3.
 * @param {string} projectId - ID of the project to fetch.
 * @returns {Object} - Project data including images, videos, and metadata.
 * @throws {Error} - Throws error if project data cannot be found.
 */
export async function fetchProjectData(projectId) {
    // Fetch list of project folders
    const data = await s3.send(
        new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `projects/`,
            Delimiter: '/',
        })
    );

    const projectFolders = data.CommonPrefixes.map(prefix => prefix.Prefix.split('/')[1]);
    let projectData = null;
    let folder = '';

    for (const projFolder of projectFolders) {
        const projectJsonUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/projects/${encodeURIComponent(projFolder)}/project.json`;

        try {
            const response = await fetch(projectJsonUrl);
            if (!response.ok) throw new Error('Failed to fetch JSON data');

            const currentProject = await response.json();
            if (!currentProject || typeof currentProject !== 'object') {
                throw new Error(`Invalid JSON format for project ${projectId}`);
            }

            // Match project ID and set projectData
            if (currentProject.id.toString() === projectId.toString()) {
                projectData = currentProject;
                folder = projFolder;
                break;
            }
        } catch (err) {
            console.warn(`Failed to fetch project data for ${projFolder}`, err.message);
        }
    }

    if (!projectData) throw new Error(`Project ${projectId} not found`);

    // Fetch image files
    const imageFilesResponse = await s3.send(
        new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `projects/${folder}/images/`,
        })
    );

    const imageFiles = imageFilesResponse.Contents
        ? imageFilesResponse.Contents.map(item => `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`)
        : [];

    const { imageMetadata } = await getImagesAndMetadata(imageFiles);

    // Include image metadata in projectData
    projectData.images = imageFiles;
    projectData.imageMetadata = imageMetadata;

    // Fetch video files
    const videoFilesResponse = await s3.send(
        new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `projects/${folder}/videos/`,
        })
    );

    const videoFiles = videoFilesResponse.Contents
        ? videoFilesResponse.Contents.map(item => `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`)
        : [];

    projectData.videos = videoFiles;

    return { projectData };
}
