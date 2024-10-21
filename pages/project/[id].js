// pages/project/[id].js

import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import path from 'path';
import fs from 'fs/promises';
import Script from 'next/script';

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

        // Read images from the images directory
        const imagesDirPath = path.join(projectsDir, projectData.folder, 'images');
        let imageFiles = [];
        try {
            const imageFilesRaw = await fs.readdir(imagesDirPath);
            imageFiles = imageFilesRaw.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        } catch (err) {
            console.warn(`Images folder not found or empty for project ${id}:`, err);
        }

        projectData.images = imageFiles;

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

    // Helper function to display information based on data type
    const displayInfo = (label, value, keyProp) => {
        if (!value) return null;

        // Handle arrays
        if (Array.isArray(value)) {
            if (value.length === 0) return null;
            return (
                <div key={keyProp} className="project-info-item">
                    <strong>{label}:</strong>
                    <ul>
                        {value.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                    <hr /> {/* Line separator */}
                </div>
            );
        }

        // Handle strings and other types
        if (typeof value === 'string' && value.trim() === '') return null;

        return (
            <div key={keyProp} className="project-info-item">
                <strong>{label}:</strong>
                <p>{value}</p>
                <hr /> {/* Line separator */}
            </div>
        );
    };

    // Mapping of project keys to display labels
    const infoFields = [
        { label: 'Year', key: 'project_year' },
        { label: 'Location', key: 'location' },
        { label: 'Status', key: 'status' },
        { label: 'Exhibition', key: 'exhibition' },
        { label: 'Architects', key: 'architects' },
        { label: 'Client', key: 'client' },
        { label: 'Affiliation', key: 'affliation' }, // Ensure this matches your JSON key
        { label: 'Course', key: 'course' },
        { label: 'Team', key: 'students' },
        { label: 'Role', key: 'my_role' },
        { label: 'Designer', key: 'designer' },
        { label: 'Supervisor', key: 'supervisor' },
        { label: 'Lead Investigators', key: 'lead_investigators' },
        { label: 'Construction Assistants', key: 'construction_assistants' },
        { label: 'Researchers', key: 'researchers' },
        { label: 'Structural Engineers', key: 'structureal_engineers' },
        { label: 'Material', key: 'material' },
        { label: 'Software/Machinery', key: 'softwares/machinery' },
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

            <Script
                id="dynamic-favicon"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            const link = document.createElement('link');
                            link.rel = 'icon';
                            link.type = 'image/png';
                            link.href = '/icons/${encodeURIComponent(project.folder)}/favicon.png';
                            document.head.appendChild(link);
                        })();
                    `,
                }}
            />

            <Script
                id="dark-mode-script"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            if (localStorage.getItem('darkMode') === 'enabled') {
                                document.body.classList.add('dark-mode');
                            }
                        })();
                    `,
                }}
            />

            <Header />

            <div className="container">
                <div className="project-content">
                    {/* Project Images */}
                    <div className="project-images">
                        {project.images.length > 0 ? (
                            project.images.map((image, index) => (
                                <div key={index} className="project-image-wrapper">
                                    <Image
                                        src={`/projects/${encodeURIComponent(project.folder)}/images/${encodeURIComponent(image)}`}
                                        alt={`${project.project_title} Image ${index + 1}`}
                                        width={600}
                                        height={400}
                                        className="project-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-image.jpg';
                                        }}
                                    />
                                    {/* Display description only under the first image */}
                                    {index === 0 && project.description && (
                                        <p className="project-description">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No images available for this project.</p>
                        )}
                    </div>

                    {/* Project Info (without the description) */}
                    <div className="project-info">
                        <Link href="/" className="back-button">
                            ← Back to Projects
                        </Link>
                        
                        <h2 className="project-title">{project.project_title}</h2>


                        {infoFields.map(({ label, key }) => displayInfo(label, project[key], key))}

                        {/* Display clickable publications */}
                        {project.publications && project.publications.length > 0 && (
                            <div className="project-info-item project-publications">
                                <strong>Publications:</strong>
                                <ul>
                                    {project.publications.map((pub, index) => (
                                        <li key={index}>
                                            <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                                {pub.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <hr />
                            </div>
                        )}
                       
                        {/* Display social media links */}
                        {project.social_media && project.social_media.length > 0 && (
                            <div className="project-info-item project-social-media">
                                <strong>Social Media:</strong>
                                <ul>
                                    {project.social_media.map((social, index) => (
                                        <li key={index}>
                                            <a href={social.url} target="_blank" rel="noopener noreferrer">
                                                {social.platform}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <hr />
                            </div>
                        )}

                        {/* Dedication message */}
                        {project.dedication && project.dedication.trim() !== '' && (
                            <div className="project-info-item project-dedication">
                                <strong>Dedication:</strong>
                                <p>{project.dedication}</p>
                                <hr />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
