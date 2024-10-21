import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                {/* Global stylesheets */}
                <link rel="stylesheet" href="/css/style.css" />
                <link rel="stylesheet" href="/css/project-style.css" />
                <link rel="icon" type="image/png" href="/icons/favicon1.png" />

                {/* Moved Font Awesome stylesheet here */}
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                    integrity="sha512-dymNQjHh5PjQ++o7CJhKnEwVfD6UquXKmjJyluQFhVz4e4kN4ZOkLzK1v4aOqYFfgrky1vcL9RYoK/5Iu6Z9BA=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
