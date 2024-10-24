// pages/project/[id].js
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Lightbox from '../../components/Lightbox';
import ProjectInfo from '../../components/ProjectInfo';
import path from 'path';
import fs from 'fs/promises';
import Script from 'next/script';
import { getImagesAndMetadata } from '../../lib/imageUtils';

export async function getServerSideProps(context) {
    const { id } = context.params;

    try {
        const projectsDir = path.join(process.cwd(), 'public', 'projects');
        const files = await fs.readdir(projectsDir, { withFileTypes: true });
        const projectFolders = files.filter(file => file.isDirectory()).map(dir => dir.name);

        let projectData = null;

        for (const folder of projectFolders) {
            const projectJsonPath = path.join(projectsDir, folder, 'project.json');
            try {
                const data = await fs.readFile(projectJsonPath, 'utf8');
                const currentProject = JSON.parse(data);

                // Sanitize project title
                currentProject.project_title = typeof currentProject.project_title === 'string' ? currentProject.project_title : String(currentProject.project_title);

                if (currentProject.id.toString() === id.toString()) {
                    projectData = currentProject;
                    projectData.folder = folder; // Store the actual folder name
                    break;
                }
            } catch (err) {
                console.warn(`project.json not found or invalid for project: ${folder}`);
            }
        }

        if (!projectData) {
            return { notFound: true };
        }

        // Read images and metadata using imageUtils
        const imagesDirPath = path.join(projectsDir, projectData.folder, 'images');
        let imageFiles = [];
        let imageMetadata = {};

        try {
            const { imageFiles: fetchedImages, imageMetadata: fetchedMetadata } = await getImagesAndMetadata(imagesDirPath);
            imageFiles = fetchedImages;
            imageMetadata = fetchedMetadata;
        } catch (err) {
            console.warn(`Images folder not found or empty for project ${id}:`, err);
        }

        projectData.images = imageFiles;
        projectData.imageMetadata = imageMetadata;

        return {
            props: {
                project: projectData,
            },
        };
    } catch (error) {
        console.error(`Error fetching project ${id}:`, error.message);
        return {
            notFound: true,
        };
    }
}

export default function ProjectPage({ project }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    // Mapping of project keys to display labels
    const infoFields = [
        { label: 'Year', key: 'project_year' },
        { label: 'Location', key: 'location' },
        { label: 'Instructor', key: 'instructor' },
        { label: 'Status', key: 'status' },
        { label: 'Material', key: 'material' },
        { label: 'Exhibition', key: 'exhibition' },
        { label: 'Architects', key: 'architects' },
        { label: 'Client', key: 'client' },
        { label: 'Affiliation', key: 'affiliation' },
        { label: 'Course', key: 'course' },
        { label: 'Role', key: 'my_role' },
        { label: 'Designer', key: 'designer' },
        { label: 'Supervisor', key: 'supervisor' },
        { label: 'Lead Investigators', key: 'lead_investigator' },
        { label: 'Researchers', key: 'researcher' },
        { label: 'Students', key: 'student' },
        { label: 'Structural Engineers', key: 'structural_engineer' },
        { label: 'Construction Assistants', key: 'construction_assistant' },
        { label: 'Tool Box', key: 'tool_box' },
        { label: 'Awards', key: 'awards' },
        { label: 'Reference', key: 'reference' },
    ];

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{`${project.project_title} - Ruxin Xie`}</title>
            </Head>

            {/* Load dark mode script before interactive */}
            <Script
                src="/js/darkMode.js"
                strategy="beforeInteractive"
            />

            {/* Load favicon script after interactive and set the favicon */}
            <Script
                src="/js/favicon.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if (window.setFavicon) {
                        window.setFavicon(project.folder);
                    }
                }}
            />

            <Header />

            <div className="container">
                <div className="project-content">
                    {/* Project Images */}
                    <div className="project-images">
                        {project.images.length > 0 ? (
                            <>
                                {project.images.map((image, index) => (
                                    <div key={index} className="project-image-wrapper">
                                        <Lightbox images={[`/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(image)}`]} />
                                        <p className="artist-name">
                                            @{project.imageMetadata[image]?.artist || 'Unknown Artist'}
                                        </p>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p>No images available for this project.</p>
                        )}
                    </div>

                    {/* Project Info */}
                    <ProjectInfo project={project} infoFields={infoFields} />
                </div>
            </div>

            <Footer />
        </>
    );
}
