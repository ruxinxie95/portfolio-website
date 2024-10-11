// pages/project/[id].js

import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import path from 'path';
import fs from 'fs/promises';

export async function getServerSideProps(context) {
    const { id } = context.params;

    try {
        // Construct the path to the specific project's project.json
        const projectJsonPath = path.join(process.cwd(), 'public', 'projects', `project${id}`, 'project.json');
        
        // Check if project.json exists
        await fs.access(projectJsonPath);

        // Read and parse project.json
        const projectData = JSON.parse(await fs.readFile(projectJsonPath, 'utf8'));

        // Ensure required fields exist
        const requiredFields = ['id', 'title', 'categories', 'year', 'location', 'description'];
        const hasAllFields = requiredFields.every(field => field in projectData);

        if (!hasAllFields) {
            throw new Error(`Project ${id} is missing required fields.`);
        }

        // Ensure 'folder' field is present
        if (!projectData.folder) {
            projectData.folder = `project${id}`;
        }

        // Read images from the images directory
        const imagesDirPath = path.join(process.cwd(), 'public', 'projects', projectData.folder, 'images');
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
        console.error(`Error fetching project ${id}:`, error);
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
                <title>{project.title} - Ruxin Xie</title>

                {/* Pre-Apply Dark Mode to Prevent Flicker */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                if (localStorage.getItem('darkMode') === 'enabled') {
                                    document.body.classList.add('dark-mode');
                                }
                            })();
                        `,
                    }}
                ></script>

                {/* Dynamic Favicon (Optional, if used in project pages) */}
                <link id="dynamic-favicon" rel="icon" type="image/png" href="/icons/favicon1.png" />

                {/* Include Font Awesome */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />

                {/* Note: Styles are already included globally in _document.js */}
            </Head>

            <Header />

            <div className="container">
                <div className="project-content">
                    <div className="project-images">
                        {project.images.length > 0 ? (
                            project.images.map((image, index) => (
                                <div key={index} className="project-image-wrapper">
                                    <Image
                                        src={`/projects/${project.folder}/images/compressed/${image}`}
                                        alt={`${project.title} Image ${index + 1}`}
                                        width={600}
                                        height={400}
                                        className="project-image"
                                    />
                                </div>
                            ))
                        ) : (
                            <p>No images available for this project.</p>
                        )}
                    </div>
                    <div className="project-info">
                        <Link href="/" className="back-button">← Back to Projects</Link>
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
