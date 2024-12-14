import Link from 'next/link';
import { memo, useMemo } from 'react';

const ProjectInfo = memo(({ project, infoFields }) => {
    /**
     * Renders a single piece of project information.
     * Handles various data types, including arrays and strings with separators.
     */
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
                                    <a href={item.split('|')[1]} target="_blank" rel="noopener noreferrer">
                                        {item.split('|')[0]}
                                    </a>
                                ) : typeof item === 'object' && item.url ? (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        {item.text}
                                    </a>
                                ) : (
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

    const memoizedInfoFields = useMemo(() => {
        return infoFields.map(({ label, key }) => displayInfo(label, project[key], key));
    }, [infoFields, project]);

    return (
        <div className="project-info">
            {/* Back Link */}
            <Link href="/" className="back-button">
                ← Back to Projects
            </Link>

            {/* Project Title */}
            <h2 className="project-title">{project.project_title}</h2>

            {/* Dynamic Info Fields */}
            {memoizedInfoFields}

            {/* Publications */}
            {project.publications?.length > 0 && (
                <div className="project-info-item project-publications">
                    <strong>Publications:</strong>
                    <div>
                        {project.publications.map((pub, index) => (
                            <div key={index} className="publication-item">
                                <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                    {pub.text}
                                </a>
                            </div>
                        ))}
                    </div>
                    <hr />
                </div>
            )}


            {/* Social Media */}
            {project.social_media?.length > 0 && (
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

            {/* References */}
            {project.reference && (
                <div className="project-info-item project-reference">
                    <strong>Reference</strong>
                    <div>
                        {(Array.isArray(project.reference) ? project.reference : [project.reference]).map((ref, index) => (
                            <div key={index} className="reference-item">
                                {typeof ref === 'string' && ref.includes('|') ? (
                                    <a href={ref.split('|')[1]} target="_blank" rel="noopener noreferrer">
                                        {ref.split('|')[0]}
                                    </a>
                                ) : (
                                    <span>{ref}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <hr />
                </div>
            )}


            {/* Awards */}
            {project.awards?.length > 0 && (
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

            {/* Dedication */}
            {project.dedication?.trim() && (
                <div className="project-info-item project-dedication">
                    <strong>Dedication:</strong>
                    <p>{project.dedication}</p>
                    <hr />
                </div>
            )}
        </div>
    );
});

export default ProjectInfo;
