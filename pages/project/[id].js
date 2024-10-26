//pages/project/[id].js
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
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    const files = await fs.readdir(projectsDir, { withFileTypes: true });
    const projectFolders = files.filter(file => file.isDirectory()).map(dir => dir.name);

    let projectData = null;
    let folder = '';

    for (const projFolder of projectFolders) {
        const projectJsonPath = path.join(projectsDir, projFolder, 'project.json');
        try {
            const data = await fs.readFile(projectJsonPath, 'utf8');
            const currentProject = JSON.parse(data);

            if (currentProject.id.toString() === id.toString()) {
                projectData = currentProject;
                folder = projFolder; // Set folder when project is found
                break;
            }
        } catch (err) {
            console.warn(`project.json not found or invalid for project: ${projFolder}`);
        }
    }

    if (!projectData) {
        return { notFound: true };
    }

    const s3BaseUrl = `https://aws-storage-projects.s3.us-east-2.amazonaws.com/projects/${encodeURIComponent(folder)}/images`;

    const imagesDirPath = path.join(projectsDir, folder, 'images');
    let imageFiles = [];
    let imageMetadata = {};

    try {
        const { imageFiles: fetchedImages, imageMetadata: fetchedMetadata } = await getImagesAndMetadata(imagesDirPath);
        imageFiles = fetchedImages.map(file => `${s3BaseUrl}/${encodeURIComponent(file)}`);
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
}

export default function ProjectPage({ project }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

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

    const groupGridImages = () => {
        const gridGroups = {};
        project.images.forEach(image => {
            const gridMatch = image.match(/grid(-?\d+)_img\d+/);

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
    const coverImage = project.images.find(img => img.includes('cover'));
    const remainingNonGridImages = project.images.filter(img => img !== coverImage && !img.includes('grid'));

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const allImages = [
        coverImage,
        ...Object.values(gridGroups).flat(),
        ...remainingNonGridImages,
    ].filter(Boolean);

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

    let currentIndex = 1;
    const grid1Index = currentIndex;
    currentIndex += gridGroups['1']?.length || 0;

    const firstImageIndex = currentIndex;
    currentIndex += 1;

    const grid2Index = currentIndex;
    currentIndex += gridGroups['2']?.length || 0;

    const secondImageIndex = currentIndex;
    currentIndex += 1;

    const grid3Index = currentIndex;
    currentIndex += gridGroups['3']?.length || 0;

    const remainingImagesStartIndex = currentIndex;

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{`${project.project_title} - Ruxin Xie`}</title>
            </Head>

            <Script src="/js/darkMode.js" strategy="beforeInteractive" />
            <Script src="/js/favicon.js" strategy="afterInteractive" onLoad={() => {
                if (window.setFavicon) window.setFavicon(project.folder);
            }} />

            <Header />

            <div className="container">
                <div className="project-content">
                    <div className="project-images">
                        {coverImage && (
                            <div className="cover-image-wrapper">
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    className="cover-image"
                                    onClick={() => openLightbox(0)}
                                />
                                <p className="artist-name">© {project.imageMetadata[coverImage]?.artist || 'Unknown Artist'}</p>
                            </div>
                        )}

                        {project.description && (
                            <div className="project-description">
                                {project.description}
                            </div>
                        )}

                        {gridGroups['1'] && (
                            <div key="grid-1" className="grid-container grid-1">
                                {gridGroups['1'].map((image, imageIndex) => (
                                    <div key={imageIndex} className="grid-image-2">
                                        <img
                                            src={image}
                                            alt={`Grid 1 Image ${imageIndex + 1}`}
                                            className="grid-image"
                                            onClick={() => openLightbox(grid1Index + imageIndex)}
                                        />
                                        <p className="artist-name">© {project.imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {remainingNonGridImages[0] && (
                            <div className="project-image-wrapper">
                                <img
                                    src={remainingNonGridImages[0]}
                                    alt="Project Image 1"
                                    className="project-image"
                                    onClick={() => openLightbox(firstImageIndex)}
                                />
                                <p className="artist-name">© {project.imageMetadata[remainingNonGridImages[0]]?.artist || 'Unknown Artist'}</p>
                            </div>
                        )}

                        {gridGroups['2'] && (
                            <div key="grid-2" className="grid-container grid-2">
                                {gridGroups['2'].map((image, imageIndex) => (
                                    <div key={imageIndex} className="grid-image-2">
                                        <img
                                            src={image}
                                            alt={`Grid 2 Image ${imageIndex + 1}`}
                                            className="grid-image"
                                            onClick={() => openLightbox(grid2Index + imageIndex)}
                                        />
                                        <p className="artist-name">© {project.imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {remainingNonGridImages[1] && (
                            <div className="project-image-wrapper">
                                <img
                                    src={remainingNonGridImages[1]}
                                    alt="Project Image 2"
                                    className="project-image"
                                    onClick={() => openLightbox(secondImageIndex)}
                                />
                                <p className="artist-name">© {project.imageMetadata[remainingNonGridImages[1]]?.artist || 'Unknown Artist'}</p>
                            </div>
                        )}

                        {gridGroups['3'] && (
                            <div key="grid-3" className="grid-container grid-3">
                                {gridGroups['3'].map((image, imageIndex) => (
                                    <div key={imageIndex} className="grid-image-2">
                                        <img
                                            src={image}
                                            alt={`Grid 3 Image ${imageIndex + 1}`}
                                            className="grid-image"
                                            onClick={() => openLightbox(grid3Index + imageIndex)}
                                        />
                                        <p className="artist-name">© {project.imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {remainingNonGridImages.slice(2).map((image, index) => {
                            const globalIndex = remainingImagesStartIndex + index;
                            return (
                                <div key={index} className="project-image-wrapper">
                                    <img
                                        src={image}
                                        alt={`Project Image ${index + 3}`}
                                        className="project-image"
                                        onClick={() => openLightbox(globalIndex)}
                                    />
                                    <p className="artist-name">© {project.imageMetadata[image]?.artist || 'Unknown Artist'}</p>
                                </div>
                            );
                        })}
                    </div>

                    <ProjectInfo project={project} infoFields={infoFields} />
                </div>
            </div>

            <Footer />

            {isLightboxOpen && (
                <Lightbox
                    images={allImages}
                    currentImage={allImages[currentImageIndex]}
                    onClose={closeLightbox}
                    onPrev={goPrev}
                    onNext={goNext}
                />
            )}
        </>
    );
}
    