// components/ProjectInfo.js
import Link from 'next/link';

const ProjectInfo = ({ project, infoFields }) => {
    const displayInfo = (label, value, keyProp) => {
        if (!value) return null;

        if (Array.isArray(value)) {
            if (value.length === 0) return null;
            return (
                <div key={keyProp} className="project-info-item">
                    <strong>{label}</strong>
                    <ul>
                        {value.map((item, index) => (
                            <li key={index}>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    {item.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <hr />
                </div>
            );
        }

        if (typeof value === 'string' && value.trim() === '') return null;

        return (
            <div key={keyProp} className="project-info-item">
                <strong>{label}</strong>
                <p>{value}</p>
                <hr />
            </div>
        );
    };

    return (
        <div className="project-info">
            <Link href="/" className="back-button">
                ← Back to Projects
            </Link>

            <h2 className="project-title">{project.project_title}</h2>

            {infoFields.map(({ label, key }) => displayInfo(label, project[key], key))}

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

            {project.social_media && project.social_media.length > 0 && (
                <div className="project-info-item project-social-media">
                    <strong>Social Media:</strong>
                    <ul>
                        {project.social_media.map((social, index) => (
                            <li key={index}>
                                <a href={social.url} target="_blank" rel="noopener noreferrer">
                                    {social.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <hr />
                </div>
            )}

            {project.dedication && project.dedication.trim() !== '' && (
                <div className="project-info-item project-dedication">
                    <strong>Dedication:</strong>
                    <p>{project.dedication}</p>
                    <hr />
                </div>
            )}
        </div>
    );
};

export default ProjectInfo;
