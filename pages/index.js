// pages/index.js

import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import { useEffect, useState } from 'react';
import styles from '../components/Project.module.css'; // Import the CSS module

import fs from 'fs/promises';
import path from 'path';

export async function getServerSideProps() {
    try {
        const projectsDir = path.join(process.cwd(), 'public/projects');
        const files = await fs.readdir(projectsDir, { withFileTypes: true });
        const projectFolders = files.filter(file => file.isDirectory()).map(dir => dir.name);

        const projects = [];

        for (const folder of projectFolders) {
            const projectJsonPath = path.join(projectsDir, folder, 'project.json');
            const imagesDirPath = path.join(projectsDir, folder, 'images', 'compressed');

            try {
                const data = await fs.readFile(projectJsonPath, 'utf8');
                const projectData = JSON.parse(data);

                const requiredFields = ['id', 'title', 'categories', 'year', 'location', 'description'];
                const hasAllFields = requiredFields.every(field => field in projectData);

                if (hasAllFields) {
                    if (!projectData.folder) {
                        projectData.folder = folder;
                    }

                    try {
                        const imageFiles = await fs.readdir(imagesDirPath);
                        const validImageFiles = imageFiles.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
                        projectData.images = validImageFiles;
                    } catch (err) {
                        console.warn(`Compressed images folder not found or empty for project: ${folder}`);
                        projectData.images = [];
                    }

                    projects.push(projectData);
                } else {
                    const missing = requiredFields.filter(field => !(field in projectData));
                    console.warn(`Project "${folder}" is missing required fields: ${missing.join(', ')}`);
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`project.json not found for project: ${folder}`);
                } else {
                    console.error(`Error processing project "${folder}":`, err);
                }
            }
        }

        projects.sort((a, b) => a.id - b.id);
        return {
            props: {
                projects,
            },
        };
    } catch (err) {
        console.error('Error reading projects directory:', err);
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
        } else {
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

    // Define responsive breakpoints for Masonry
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
                {/* Filter Buttons */}
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
                </div>

                {filteredProjects.length > 0 ? (
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
                                            src={`/projects/${project.folder}/images/compressed/cover.jpg`}
                                            alt={`Cover image for project ${project.title}`}
                                            width={800}  // Replace with actual image width
                                            height={600} // Replace with actual image height
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className={styles.projectImage}
                                        />
                                        
                                        <div className={styles.projectInfo}>
                                            <h2>{project.title}</h2>
                                            <p>{project.year} | {project.location}</p>
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

            {/* Include additional global styles if necessary */}
            <style jsx global>{`
                /* Ensure the container centers correctly */
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px;
                    position: relative;
                }
            `}</style>
        </>
    );
}
