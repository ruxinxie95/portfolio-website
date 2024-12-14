import { useEffect, useState } from 'react';
import styles from './Project.module.css';

export default function Publications() {
    const [publications, setPublications] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPublications() {
            try {
                const res = await fetch('/data/publications.json');
                if (!res.ok) throw new Error(`Failed to fetch publications: ${res.statusText}`);
                const data = await res.json();
                setPublications(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        }

        fetchPublications();
    }, []);

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!publications.length) {
        return <p>Loading publications...</p>;
    }

    return (
        <div className={styles.publications}>
            {publications.map((pub, index) => (
                <p key={index}>
                    {pub.authors}. {pub.year}.{' '}
                    <i>{pub.title}</i>.{' '}
                    {pub.journal ? (
                        <>
                            <i>{pub.journal}</i> {pub.volume}: {pub.doi}.
                        </>
                    ) : (
                        <>
                            <i>{pub.booktitle}</i>, {pub.pages}.
                            {pub.editors && ` ${pub.editors}.`}
                            {pub.platform && ` ${pub.platform}.`}
                            {pub.note && ` ${pub.note}`}
                        </>
                    )}
                    {pub.doiUrl && (
                        <a
                            href={`https://doi.org/${pub.doiUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.doiLink}
                        >
                            (https://doi.org/{pub.doiUrl})
                        </a>
                    )}
                </p>
            ))}
        </div>
    );
}
