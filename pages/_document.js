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
