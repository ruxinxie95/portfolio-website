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

    return (
        <>
            <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{`${project.title} - Ruxin Xie`}</title>

                {/* Removed dynamic favicon link from Head */}
                {/* Styles are already included globally in _document.js */}
            </Head>

            {/* Add the dynamic favicon using next/script */}
            <Script
                id="dynamic-favicon"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            const link = document.createElement('link');
                            link.rel = 'icon';
                            link.type = 'image/png';
                            link.href = '/icons/${encodeURIComponent(project.folder)}/favicon.png'; // Assuming each project has its own favicon
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
                                </div>
                            ))
                        ) : (
                            <p>No images available for this project.</p>
                        )}
                    </div>
                    <div className="project-info">

                        <Link href="/" className="back-button">
                            ← Back to Projects
                        </Link>
                        <h2>{project.title}</h2>
                        <p>{project.year} | {project.location}</p>
                        <p>{project.description}</p>
                        {/* Add more project details as needed */}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
