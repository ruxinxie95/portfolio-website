import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                {/* Global stylesheets go here */}
                <link rel="stylesheet" href="/css/style.css" />
                <link rel="stylesheet" href="/css/project-style.css" />
                <link rel="icon" type="image/png" href="/icons/favicon1.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
