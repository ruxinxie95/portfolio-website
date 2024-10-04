// pages/index.js
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export async function getServerSideProps() {
    try {
        const res = await fetch(`http://localhost:3000/api/getProjects`);
        const projects = await res.json();
        console.log('Fetched projects:', projects); // Add this line

        if (!projects || !Array.isArray(projects)) {
            throw new Error('Invalid project data received');
        }

        return {
            props: {
                projects,
            },
        };
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return {
            props: {
                projects: [],
            },
        };
    }
}

export default function Home({ projects = [] }) {
    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Projects - Ruxin Xie</title>
            </Head>

            <Header />

            <div className="container">
                {projects.length > 0 ? (
                    <div className="grid is-loaded">
                        {projects.map((project) => (
                            <article key={project.id} className={`project ${project.categories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')).join(' ')}`}>
                                <Link href={`/project/${project.id}`}>
                                    <Image
                                        src={`/projects/${project.folder}/images/cover.jpg`}
                                        alt={project.title}
                                        width={300}
                                        height={200}
                                        className="project-image"
                                    />
                                    <div className="project-info">
                                        <h2>{project.title}</h2>
                                        <p>{project.year} | {project.location}</p>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p>No projects found.</p>
                )}
            </div>

            <Footer />
        </>
    );
}
