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
                                {typeof item === 'string' && item.includes('|') ? (
                                    // Handle strings with '|' as separator
                                    <a href={item.split('|')[1]} target="_blank" rel="noopener noreferrer">
                                        {item.split('|')[0]}
                                    </a>
                                ) : typeof item === 'object' && item.url ? (
                                    // Handle object with text and url fields
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        {item.text}
                                    </a>
                                ) : (
                                    // Display text if there's no URL or it's not an object
                                    <span>{typeof item === 'string' ? item : item.text || ''}</span>
                                )}
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

            {project.publications && Array.isArray(project.publications) && project.publications.length > 0 && (
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

            {project.social_media && Array.isArray(project.social_media) && project.social_media.length > 0 && (
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

            {project.reference && (
                <div className="project-info-item project-reference">
                    <strong>Reference</strong>
                    <ul>
                        {(Array.isArray(project.reference) ? project.reference : [project.reference]).map((ref, index) => (
                            <li key={index}>
                                {typeof ref === 'string' && ref.includes('|') ? (
                                    <a href={ref.split('|')[1]} target="_blank" rel="noopener noreferrer">
                                        {ref.split('|')[0]}
                                    </a>
                                ) : (
                                    <span>{ref}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                </div>
            )}

            {project.awards && Array.isArray(project.awards) && project.awards.length > 0 && (
                <div className="project-info-item project-awards">
                    <strong>Awards:</strong>
                    <ul>
                        {project.awards.map((award, index) => (
                            <li key={index}>
                                <a href={award.url} target="_blank" rel="noopener noreferrer">
                                    {award.text}
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
