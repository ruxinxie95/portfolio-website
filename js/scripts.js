$(document).ready(function() {
    // Load data from JSON
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

        // Filter items on button click
        $('.filters').on('click', 'button', function() {
            var filterValue = $(this).attr('data-filter');
            $grid.isotope({ filter: filterValue });
            $('.filter-button').removeClass('active');
            $(this).addClass('active');
        });
    });

    // Intersection Observer setup
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
        threshold: 0.5
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

    // Dark Mode Toggle
    $('.stop-me-section').prepend(`
        <div class="dark-mode-toggle">
            <i class="fas fa-moon"></i> <!-- Moon icon for dark mode -->
        </div>
    `);

    $('.dark-mode-toggle').on('click', function() {
        $('body').toggleClass('dark-mode'); // Toggle the dark-mode class on body

        // Optionally change the icon based on mode
        if ($('body').hasClass('dark-mode')) {
            $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun'); // Switch to sun icon for light mode
        } else {
            $('.dark-mode-toggle i').removeClass('fa-sun').addClass('fa-moon'); // Switch back to moon icon for dark mode
        }
    });
});
