// public/js/darkMode.js
(function() {
    if (typeof window !== 'undefined') {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
        }
    }
})();
