import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import { useEffect, useState } from 'react';
import styles from '../components/Project.module.css';
import Publications from '../components/Publications'; // Import the new component
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function getServerSideProps() {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const projects = [];

    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: 'projects/',
            Delimiter: '/',
        });

        const data = await s3.send(command);
        const projectFolders = data.CommonPrefixes.map(prefix => prefix.Prefix.split('/')[1]);

        for (const folder of projectFolders) {
            const projectJsonUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/projects/${encodeURIComponent(folder)}/project.json`;
            //console.log(`Fetching JSON from: ${projectJsonUrl}`); // Log the URL to validate

            try {
                const response = await fetch(projectJsonUrl);
                if (!response.ok) {
                    console.warn(`Failed to fetch JSON data for ${folder} (status: ${response.status})`);
                    continue;
                }

                const projectData = await response.json();
                const requiredFields = ['id', 'project_title', 'categories', 'project_year', 'location', 'description'];
                const hasAllFields = requiredFields.every(field => field in projectData);

                if (hasAllFields) {
                    projectData.folder = folder;
                    const s3BaseUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/projects/${encodeURIComponent(folder)}/images`;

                    projectData.coverImage = `${s3BaseUrl}/cover.jpg`;
                    projectData.images = [`${s3BaseUrl}/1.jpg`, `${s3BaseUrl}/2.jpg`];
                    
                    // Log URLs for images
                    //console.log(`Cover Image URL: ${projectData.coverImage}`);
                    projectData.images.forEach((image, index) => {
                        //console.log(`Image ${index + 1} URL: ${image}`);
                    });

                    projects.push(projectData);
                } else {
                    const missing = requiredFields.filter(field => !(field in projectData));
                    console.warn(`Project "${folder}" is missing required fields: ${missing.join(', ')}`);
                }
            } catch (err) {
                console.warn(`Error processing project "${folder}":`, err);
            }
        }

        projects.sort((a, b) => a.id - b.id);
        return {
            props: {
                projects,
            },
        };
    } catch (err) {
        console.error('Error fetching project data from S3:', err);
        return {
            props: {
                projects: [],
            },
        };
    }
}

export default function Home({ projects = [] }) {
    const [categories, setCategories] = useState([]);
    const [activeFilter, setActiveFilter] = useState('*');
    const [filteredProjects, setFilteredProjects] = useState(projects);

    useEffect(() => {
        const categorySet = new Set();
        projects.forEach(project => {
            project.categories.forEach(cat => categorySet.add(cat));
        });
        setCategories(Array.from(categorySet));
    }, [projects]);

    useEffect(() => {
        if (activeFilter === '*') {
            setFilteredProjects(projects);
        } else if (activeFilter !== 'publications') {
            const filterClass = activeFilter.startsWith('.') ? activeFilter.substring(1) : activeFilter;
            setFilteredProjects(
                projects.filter(project =>
                    project.categories
                        .map(cat => cat.toLowerCase().replace(/\s+/g, '-'))
                        .includes(filterClass)
                )
            );
        }
    }, [activeFilter, projects]);

    const breakpointColumnsObj = {
        default: 3,
        1200: 3,
        1024: 2,
        768: 1
    };

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Projects - Ruxin Xie</title>
            </Head>

            <Header />

            <div className={styles.container}>
                <div className={styles.filters}>
                    <button
                        data-filter="*"
                        className={`${styles.filterButton} ${activeFilter === '*' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('*')}
                        aria-pressed={activeFilter === '*' ? 'true' : 'false'}
                    >
                        All
                    </button>
                    {categories.map((category, index) => {
                        const filterClass = category.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <button
                                key={index}
                                data-filter={`.${filterClass}`}
                                className={`${styles.filterButton} ${activeFilter === `.${filterClass}` ? styles.active : ''}`}
                                onClick={() => setActiveFilter(`.${filterClass}`)}
                                aria-pressed={activeFilter === `.${filterClass}` ? 'true' : 'false'}
                            >
                                {category}
                            </button>
                        );
                    })}
                    <button
                        data-filter="publications"
                        className={`${styles.filterButton} ${activeFilter === 'publications' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('publications')}
                        aria-pressed={activeFilter === 'publications' ? 'true' : 'false'}
                    >
                        Publications
                    </button>
                </div>

                {activeFilter === 'publications' ? (
                    <Publications />
                ) : filteredProjects.length > 0 ? (
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className={styles.myMasonryGrid}
                        columnClassName={styles.myMasonryGridColumn}
                    >
                        {filteredProjects.map((project) => (
                            <article
                                key={project.id}
                                className={`${styles.project} ${project.categories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')).join(' ')}`}
                            >
                                <Link href={`/project/${project.id}`}>
                                    <div className={styles.projectLink}>
                                        <Image
                                            src={project.coverImage}
                                            alt={`Cover image for project ${project.project_title}`}
                                            width={800}
                                            height={600}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className={styles.projectImage}
                                            unoptimized
                                        />

                                        <div className={styles.projectInfo}>
                                            <h2>{project.project_title}</h2>
                                            <p>{project.project_year} | {project.location}</p>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </Masonry>
                ) : (
                    <p>No projects found.</p>
                )}
            </div>

            <Footer />
        </>
    );
}
