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
                currentProject.title = typeof currentProject.title === 'string' ? currentProject.title : String(currentProject.title);

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

    // Helper function to only show non-empty values
    const displayInfo = (label, value) => {
        if (!value) return null;
        return (
            <div className="project-info-item">
                <strong>{label}</strong>
                <p>{value}</p>
                <hr /> {/* Line separator */}
            </div>
        );
    };

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{`${project.title} - Ruxin Xie`}</title>
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
                                        alt={`${project.title} Image ${index + 1}`}
                                        width={600}
                                        height={400}
                                        className="project-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-image.jpg';
                                        }}
                                    />
                                    {/* Display description only under the first image */}
                                    {index === 0 && (
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
                        
                        <h2>{project.title}</h2>

                        {displayInfo('Year', project.year)}
                        {displayInfo('Location', project.location)}
                        {displayInfo('Status', project.status)}
                        {displayInfo('Material', project.material)}
                        {displayInfo('Software/Machinery', project["softwares/machinery"])}
                        {displayInfo('Affiliation', project.affliation)}
                        {displayInfo('Course', project.course)}
                        {displayInfo('Team', project.students)}
                        {displayInfo('Role', project.my_role)}

                        {/* Display clickable publications */}
                        {project.publications.length > 0 && (
                            <div className="project-publications">
                                <h4>Publications:</h4>
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

                        {/* Dedication message */}
                        {project.dedication && (
                            <div className="project-dedication">
                                <h4>Dedication:</h4>
                                <p>{project.dedication}</p>
                                <hr />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
