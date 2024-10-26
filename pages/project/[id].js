// pages/project/[id].js
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProjectInfo from '../../components/ProjectInfo';
import ImageGrid from '../../components/ImageGrid';
import { fetchProjectData } from '../../lib/dataUtils';

export async function getServerSideProps(context) {
    const { id } = context.params;

    try {
        const { projectData } = await fetchProjectData(id);
        return { props: { project: projectData } };
    } catch (error) {
        console.error(error);
        return { notFound: true };
    }
}

export default function ProjectPage({ project }) {
    const router = useRouter();
    if (router.isFallback) return <div>Loading...</div>;

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

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{`${project.project_title} - Ruxin Xie`}</title>
            </Head>

            <Header />
            <div className="container">
                <div className="project-content">
                    <ProjectInfo project={project} infoFields={infoFields} />
                    <ImageGrid images={project.images} imageMetadata={project.imageMetadata} />
                </div>
            </div>
            <Footer />
        </>
    );
}
