$(document).ready(function() {
    var $grid = $('.grid');
    var categories = new Set(); // Use a Set to avoid duplicate categories

    // Initialize Masonry after all images have loaded
    $grid.imagesLoaded().done(function() {
        $grid.masonry({
            itemSelector: '.project',
            columnWidth: '.grid-sizer',
            percentPosition: true,
            gutter: 10
        });
        console.log('Masonry initialized with dynamic projects');
    });

    // Filtering functionality
    $('.filters').on('click', '.filter-button', function() {
        var filterValue = $(this).attr('data-filter');

        if (filterValue === '*') {
            $('.project').removeClass('hidden');
        } else {
            $('.project').each(function() {
                if ($(this).hasClass(filterValue.substring(1))) { // Remove the dot from filterValue
                    $(this).removeClass('hidden');
                } else {
                    $(this).addClass('hidden');
                }
            });
        }

        // Trigger Masonry layout after filtering
        $grid.masonry('layout');

        // Update active button
        $('.filter-button').removeClass('active');
        $(this).addClass('active');

        // Trigger flash effect for strikethrough
        $(this).addClass('flash').one('animationend', function() {
            $(this).removeClass('flash');
        });
    });

    // Intersection Observer setup for image reveal
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

    // After all images are loaded, check which ones are in the viewport
    $(window).on('load', function() {
        $('img').each(function() {
            if (isInViewport(this)) {
                $(this).removeClass('img-hidden').addClass('fade-in');  // Show immediately if in viewport
            } else {
                observeImage($(this)); // Observe images not in viewport
            }
        });
    });

    // Favicon Animation Functionality
    const faviconFrames = ['icons/favicon1.png', 'icons/favicon2.png', 'icons/favicon3.png'];
    let currentFaviconFrame = 0;
    const faviconTimer = setInterval(function() {
        $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
        currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
    }, 200);

    // Dynamic Project Loading
    function loadProjects() {
        $.getJSON('/api/projects', function(projects) {
            console.log(`Fetched ${projects.length} project(s) from the server.`);
            projects.forEach(function(project) {
                // Process categories
                project.categories.forEach(function(category) {
                    categories.add(category);
                });

                // Generate category classes
                var categoryClasses = project.categories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')).join(' ');

                // Path to cover image
                var coverImagePath = `projects/${project.folder}/images/cover.jpg`;

                // Create project element
                var $article = $(`
                    <article class="project ${categoryClasses} project${project.id}">
                        <a href="${project.link || '#'}" class="project-link">
                            <img src="${coverImagePath}" alt="${project.title}" class="wp-post-image img-hidden" loading="lazy">
                            <div class="project-info">
                                <h2>${project.title}</h2>
                                <p>${project.year} | ${project.location}</p>
                            </div>
                        </a>
                    </article>
                `);

                // Append to grid
                $grid.append($article).masonry('appended', $article);

                // Observe the image for reveal
                observeImage($article.find('img'));
            });

            // After all projects are loaded, set up the filters
            setupFilters();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to load projects:', textStatus, errorThrown);
            $('.grid').append('<p class="error">Failed to load projects. Please try again later.</p>');
        });
    }

    function setupFilters() {
        // Add filter buttons based on categories
        if (categories.size > 0) {
            // First, clear existing category buttons except "All"
            $('.filters').find('.filter-button').not('[data-filter="*"]').remove();

            categories.forEach(function(category) {
                var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
                $('.filters').append(`<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`);
            });

            console.log(`Added ${categories.size} filter button(s).`);

            // Relayout Masonry after all images have loaded
            $grid.imagesLoaded().done(function() {
                $grid.masonry('layout');
            });
        }
    }

    // Initiate dynamic loading
    loadProjects();
});
