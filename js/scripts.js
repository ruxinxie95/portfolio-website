$(document).ready(function() {
    // Load data from JSON (homepage-specific code)
    $.getJSON('projects.json', function(data) {
        var $grid = $('.grid');
        var categories = [];

        // Function to create project articles with images
        function createProjectArticle(project, index) {
            var categoryClasses = project.categories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')).join(' ');

            var $article = $(`
                <article class="project ${categoryClasses}">
                    <a href="project.html?id=${project.id}" class="project-link">
                        <img src="${project.cover_image}" alt="${project.title}" class="wp-post-image img-hidden">
                    </a>
                </article>
            `);
            
            $grid.append($article);
            observeImage($article.find('img'));  // Add observer for every image
        }

        // Append each project to the grid
        $.each(data, function(index, project) {
            createProjectArticle(project, index);

            // Add categories to the filter array
            project.categories.forEach(function(category) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            });
        });

        // Initialize category filters
        categories.forEach(function(category) {
            var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            $('.filters').append(`<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`);
        });

        // Isotope grid setup
        $grid.imagesLoaded().done(function() {
            $grid.isotope({
                itemSelector: '.project',
                layoutMode: 'masonry',
                percentPosition: true,
                masonry: {
                    horizontalOrder: true,
                    columnWidth: '.project'
                }
            });
        });

        // Filter items on button click with strikethrough effect
        $('.filters').on('click', '.filter-button', function() {
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({ filter: filterValue });
            $('.filter-button').removeClass('active');
            $(this).addClass('active');
            
            // Trigger flash effect for strikethrough
            $(this).addClass('flash').one('animationend', function() {
                $(this).removeClass('flash');
            });
        });
    });

    // Intersection Observer setup (homepage-specific code)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.remove('img-hidden');
                    entry.target.classList.add('fade-in');
                }, 1000);
            }
        });
    }, {
        threshold: 0.25
    });

    // Function to observe an image
    function observeImage(img) {
        observer.observe(img[0]);  // Ensure the DOM element is passed
    }

    // Function to check if the element is in the viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // After all images are appended, check which ones are in the viewport
    $(window).on('load', function() {
        $('img').each(function() {
            if (isInViewport(this)) {
                $(this).removeClass('img-hidden').addClass('fade-in');  // Show immediately if in viewport
            }
        });
    });

    // Dark Mode Toggle and Persistence with localStorage

    // First, ensure the toggle is added to the DOM
    if ($('.stop-me-section .dark-mode-toggle').length === 0) {
        $('.stop-me-section').append(`
            <div class="dark-mode-toggle">
                <i class="fas fa-moon"></i> <!-- Moon icon for dark mode -->
            </div>
        `);
    }

    // Apply dark mode if previously set in localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        $('body').addClass('dark-mode');
        $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun');
    }

    // Toggle dark mode on click
    $('.dark-mode-toggle').on('click', function() {
        $('body').toggleClass('dark-mode'); // Toggle the dark-mode class on body

        // Optionally change the icon based on mode
        if ($('body').hasClass('dark-mode')) {
            $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun');
            localStorage.setItem('darkMode', 'enabled'); // Save dark mode state to localStorage
        } else {
            $('.dark-mode-toggle i').removeClass('fa-sun').addClass('fa-moon');
            localStorage.setItem('darkMode', 'disabled'); // Save dark mode state to localStorage
        }
    });

    // "Stop me" Link Functionality and Persistence with sessionStorage
    let clickCount = sessionStorage.getItem('clickCount') ? parseInt(sessionStorage.getItem('clickCount')) : 0;
    const stopButton = $('#stop-button');
    const messageElement = $('#message');

    function updateMessage() {
        if (clickCount === 0) {
            messageElement.text(""); // No message on initial load
            stopButton.text("Stop me"); // Ensure button text is default
        } else if (clickCount <= 2) {
            messageElement.text("No, you can't.");
            if (clickCount === 2) stopButton.text("Stop me again");
        } else if (clickCount < 5) {
            messageElement.text("Really?");
        } else if (clickCount === 5) {
            stopButton.remove();
            messageElement.html(`
                ruxinx.design@gmail.com | 734-882-8500 | 
                <a href="your-cv-link" target="_blank" aria-label="View CV">CV</a> | 
                <a href="https://www.linkedin.com/in/ruxin-xie/" target="_blank" aria-label="Visit LinkedIn Profile">LinkedIn</a>
            `);
        }
    }
    
    updateMessage();  // Update the message immediately based on stored click count

    stopButton.on('click', function(event) {
        event.preventDefault(); // Prevent default <a> behavior
        clickCount++;
        sessionStorage.setItem('clickCount', clickCount); // Save click count to sessionStorage
        updateMessage();
    });

    // Favicon Animation Functionality
    const faviconFrames = ['icons/favicon1.png', 'icons/favicon2.png', 'icons/favicon3.png'];
    let currentFaviconFrame = 0;
    const faviconTimer = setInterval(function() {
        $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
        currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
    }, 200);
});
