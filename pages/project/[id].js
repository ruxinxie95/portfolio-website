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
import { useState } from 'react';

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

    // Define infoFields array within the component, excluding 'description'
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

    // Function to group grid images based on labels (e.g., grid1, grid2)
    const groupGridImages = () => {
        const gridGroups = {};
        project.images.forEach(image => {
            const gridMatch = image.match(/grid(\d+)_img\d+/); // Updated regex with underscore
            if (gridMatch) {
                const gridGroup = gridMatch[1];
                if (!gridGroups[gridGroup]) {
                    gridGroups[gridGroup] = [];
                }
                gridGroups[gridGroup].push(image);
            }
        });
        return gridGroups;
    };

    const gridGroups = groupGridImages();

    // Identify the cover image explicitly named 'cover'
    const coverImage = project.images.find(img => img.includes('cover'));

    // Exclude the cover image and any images containing 'grid' from the remaining images
    const remainingNonGridImages = project.images.filter(img => img !== coverImage && !img.includes('grid'));

    // State for Lightbox
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Combine all images into a single array for Lightbox
    const allImages = [
        coverImage,
        ...Object.values(gridGroups).flat(),
        ...remainingNonGridImages,
    ].filter(Boolean); // Remove any undefined or null values

    // Handlers to open and close Lightbox
    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => setIsLightboxOpen(false);

    const goPrev = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
        );
    };

    const goNext = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
    };

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
                    <div className="project-images">
                        {/* Cover Image */}
                        {coverImage && (
                            <div className="cover-image-wrapper">
                                <img
                                    src={`/projects/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(coverImage)}`}
                                    alt="Cover"
                                    className="cover-image"
                                    onClick={() => openLightbox(0)} // Assuming coverImage is the first image
                                />
                                <p className="artist-name">© {project.imageMetadata[coverImage]?.artist || 'Unknown Artist'}</p>
                            </div>
                        )}
                        {/* Project Description */}
                        {project.description && (
                            <div className="project-description">
                                {project.description}
                            </div>
                        )}

                        {/* Grid Images */}
                        {Object.keys(gridGroups).map((gridGroup, groupIndex) => (
                            <div key={`grid-${gridGroup}-${groupIndex}`} className={`grid-container grid-${gridGroup}`}>
                                {gridGroups[gridGroup].map((image, imageIndex) => {
                                    // Calculate the global index for the image
                                    const globalIndex = 1 + Object.values(gridGroups).slice(0, groupIndex).flat().length + imageIndex;
                                    return (
                                        <div key={imageIndex} className={`grid-image-${gridGroups[gridGroup].length}`}>
                                            <img
                                                src={`/projects/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(image)}`}
                                                alt={`Grid ${gridGroup} Image ${imageIndex + 1}`}
                                                className="grid-image"
                                                onClick={() => openLightbox(globalIndex)}
                                            />
                                            <p className="artist-name">© {project.imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Remaining non-grid images */}
                        {remainingNonGridImages.map((image, index) => {
                            // Calculate the global index for the image
                            const globalIndex = 1 + Object.values(gridGroups).flat().length + index;
                            return (
                                <div key={index} className="project-image-wrapper">
                                    <img
                                        src={`/projects/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(image)}`}
                                        alt={`Project Image ${index + 1}`}
                                        className="project-image"
                                        onClick={() => openLightbox(globalIndex)}
                                    />
                                    <p className="artist-name">© {project.imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                                </div>
                            );
                        })}

                        {/* Lightbox Component */}
                        {isLightboxOpen && (
                            <Lightbox
                                images={allImages.map((img) => `/projects/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(img)}`)}
                                currentImage={allImages[currentImageIndex] ? `/projects/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(allImages[currentImageIndex])}` : null}
                                onClose={closeLightbox}
                                onPrev={goPrev}
                                onNext={goNext}
                            />
                        )}



                    </div>

                    {/* Render the ProjectInfo component */}
                    <ProjectInfo project={project} infoFields={infoFields} />
                </div>
            </div>

            <Footer />
        </>
    );
}
