$(document).ready(function() {
    var $grid = $('.grid');
    var categories = [];

    // Function to fetch and create project articles with images and hover info
    function fetchAndCreateProjectArticle(projectId) {
        $.getJSON(`projects/project${projectId}/project.json`, function(project) {
            if (!project.categories) {
                console.error(`Project ${projectId} is missing 'categories' data.`);
                return;
            }

            var categoryClasses = project.categories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')).join(' ');

            if (!$grid.length) {
                console.error('No grid element found.');
                return;
            }

            var coverImagePath = `projects/project${projectId}/images/cover.jpg`; // Path to cover image

            var $article = $(`
                <article class="project ${categoryClasses} project${project.id}">
                    <a href="project.html?id=${project.id}" class="project-link">
                        <img src="${coverImagePath}" alt="${project.title}" class="wp-post-image img-hidden">
                        <div class="project-info">
                            <h2>${project.title}</h2>
                            <p>${project.year} | ${project.location}</p>
                        </div>
                    </a>
                </article>
            `);

            $grid.append($article);
            observeImage($article.find('img'));  // Add observer for every image

            // Handle categories for filtering
            project.categories.forEach(function(category) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to fetch project data:', textStatus, errorThrown);
        });
    }

    // Assuming a known number of projects, modify accordingly if dynamic
    for (let i = 1; i <= 20; i++) {
        fetchAndCreateProjectArticle(i);
    }

    // Once all projects are likely loaded, set up the filters
    $(document).ajaxStop(function() {
        categories.forEach(function(category) {
            var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            $('.filters').append(`<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`);
        });

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

    // Favicon Animation Functionality
    const faviconFrames = ['icons/favicon1.png', 'icons/favicon2.png', 'icons/favicon3.png'];
    let currentFaviconFrame = 0;
    const faviconTimer = setInterval(function() {
        $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
        currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
    }, 200);
});
