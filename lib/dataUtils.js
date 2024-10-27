//lib/dataUtils.js
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getImagesAndMetadata } from './imageUtils';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME;

export async function fetchProjectData(projectId) {
    // List all project folders
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

    // Locate the correct project based on projectId
    for (const projFolder of projectFolders) {
        const projectJsonUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/projects/${encodeURIComponent(projFolder)}/project.json`;

        try {
            const response = await fetch(projectJsonUrl);
            if (!response.ok) throw new Error('Failed to fetch JSON data');

            const currentProject = await response.json();
            if (!currentProject || typeof currentProject !== 'object') {
                throw new Error(`Invalid JSON format for project ${projectId}`);
            }

            if (currentProject.id.toString() === projectId.toString()) {
                projectData = currentProject;
                folder = projFolder;
                break;
            }
        } catch (err) {
            console.warn(`Failed to fetch project data for ${projFolder}`, err);
        }
    }

    if (!projectData) throw new Error(`Project ${projectId} not found`);

    // List all images in the project's images folder
    const imageFilesResponse = await s3.send(
        new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `projects/${folder}/images/`,
        })
    );

    // Get URLs for each image file
    const imageFiles = imageFilesResponse.Contents
        ? imageFilesResponse.Contents.map(item => `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`)
        : [];

    // Retrieve image metadata
    const { imageMetadata } = await getImagesAndMetadata(imageFiles);

    // Add images and metadata to projectData
    projectData.images = imageFiles;
    projectData.imageMetadata = imageMetadata;

    return { projectData };
}
