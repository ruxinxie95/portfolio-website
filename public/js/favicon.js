// public/js/favicon.js
window.setFavicon = function(projectFolder) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = `/icons/${encodeURIComponent(projectFolder)}/favicon.png`;
    document.head.appendChild(link);
};
