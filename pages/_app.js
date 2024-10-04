import '../public/css/style.css'; // Ensure your global CSS is imported here
import '../public/css/project-style.css'; // If project-specific CSS is needed globally

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;
