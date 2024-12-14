import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic'; // For dynamic imports
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchProjectData } from '../../lib/dataUtils';

// Dynamically import heavy components
const ProjectInfo = dynamic(() => import('../../components/ProjectInfo'), { ssr: false });
const ImageGrid = dynamic(() => import('../../components/ImageGrid'), { ssr: false });

/**
 * Fetch project data for the given ID at build time.
 */
export async function getServerSideProps(context) {
    const { id } = context.params;

    try {
        const { projectData } = await fetchProjectData(id); // Get project data
        return { props: { project: projectData } }; // Pass data as props
    } catch (error) {
        console.error('Error fetching project data:', error);
        return { notFound: true }; // Fallback for not found projects
    }
}

/**
 * Project Page Component
 */
export default function ProjectPage({ project }) {
    const router = useRouter();

    // Handle fallback state
    if (router.isFallback) return <div>Loading...</div>;

    // Information fields for the project
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
    ];

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{`${project.project_title} - Ruxin Xie`}</title>
            </Head>

            <Header />

            <main className="container">
                <div className="project-content">
                    {/* Render Project Info */}
                    <ProjectInfo project={project} infoFields={infoFields} />

                    {/* Render Image Grid */}
                    <ImageGrid
                        images={project.images}
                        imageMetadata={project.imageMetadata}
                        description={project.description}
                        videos={project.videos} // Pass videos to the component
                    />
                </div>
            </main>

            <Footer />
        </>
    );
}
