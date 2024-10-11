$(document).ready(function() {
    var $grid = $('.grid');
    var categories = new Set(); // Use a Set to avoid duplicate categories

    // Debounce function to limit the rate of function execution
    function debounce(fn, delay) {
        let timer = null;
        return function() {
            let context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        };
    }

    // Debounced Masonry layout to optimize performance
    const debouncedLayout = debounce(function() {
        if ($grid.data('masonry')) { // Check if Masonry is initialized
            $grid.masonry('layout');
            // console.log('Debounced Masonry layout called.');
        }
    }, 100);

    // Filtering functionality (event handler setup)
    function setupFilterButtons() {
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
            debouncedLayout();

            // Update active button
            $('.filter-button').removeClass('active');
            $(this).addClass('active');

            // Trigger flash effect for strikethrough
            $(this).addClass('flash').one('transitionend', function() {
                $(this).removeClass('flash');
            });
        });
    }

    // Intersection Observer setup for image reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove the observer for the current target to prevent repeated triggers
                observer.unobserve(entry.target);

                // Add both 'fade-in' and 'fadeInSlideUp' classes to trigger CSS transitions
                $(entry.target).removeClass('img-hidden').addClass('fade-in fadeInSlideUp');

                // Ensure the animation happens even on page refresh or fast loading
                setTimeout(function() {
                    $(entry.target).addClass('fadeInSlideUp');
                }, 50);  // Delay ensures smooth animation triggering after adding the class

                // Once the transition completes, trigger Masonry layout
                $(entry.target).on('transitionend', function() {
                    debouncedLayout();
                });
            }
        });
    }, {
        threshold: 0.1 // Lower threshold so the effect triggers when at least 10% of the image is visible
    });

    // Function to observe an image
    function observeImage(img) {
        if (img.length) { // Ensure the jQuery object has elements
            observer.observe(img[0]);  // Ensure the DOM element is passed
        } else {
            console.warn('No image found to observe.');
        }
    }

    // Favicon Animation Functionality
    const faviconFrames = ['/icons/favicon1.png', '/icons/favicon2.png', '/icons/favicon3.png'];
    let currentFaviconFrame = 0;
    const faviconTimer = setInterval(function() {
        $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
        currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
    }, 200);

    // Dynamic Project Loading
    function loadProjects() {
        $.getJSON('/api/getProjects', function(projects) {
            // **Sort projects numerically by 'id' in ascending order**
            projects.sort(function(a, b) {
                return parseInt(a.id, 10) - parseInt(b.id, 10);
            });
            console.log('Sorted projects:', projects.map(p => p.id));

            // Array to keep track of image existence checks
            let imageChecks = projects.map(project => {
                let coverImagePath = `/projects/${project.folder}/images/compressed/cover.jpg`;
                return new Promise((resolve) => {
                    let img = new Image();
                    img.src = coverImagePath;
                    img.onload = () => resolve({ project, exists: true });
                    img.onerror = () => resolve({ project, exists: false });
                });
            });

            // Wait for all image checks to complete
            Promise.all(imageChecks).then(results => {
                // Filter out projects with missing images, maintaining sorted order
                let existingProjects = results
                    .filter(result => result.exists)
                    .map(result => result.project);

                // Append projects to the grid in sorted order
                existingProjects.forEach((project, index) => {
                    // Process categories
                    project.categories.forEach(function(category) {
                        if (!categories.has(category)) { // Only add if it's a new category
                            categories.add(category);
                            addFilterButton(category); // Add filter button immediately
                        }
                    });

                    // Generate category classes
                    var categoryClasses = project.categories.map(cat => cat.toLowerCase().replace(/\s+/g, '-')).join(' ');

                    // Path to cover image
                    var coverImagePath = `/projects/${project.folder}/images/cover.jpg`;
                    console.log('Loading image from:', coverImagePath);

                    // Create project element with 'img-hidden' class
                    var $article = $(`
                        <article class="project ${categoryClasses} project${project.id}" data-id="${project.id}">
                            <a href="project.html?id=${project.id}" class="project-link">
                                <img src="${coverImagePath}" alt="${project.title}" class="wp-post-image img-hidden" loading="lazy">
                                <div class="project-info">
                                    <h2>${project.title}</h2>
                                    <p>${project.year} | ${project.location}</p>
                                </div>
                            </a>
                        </article>
                    `);

                    // Append to grid
                    $grid.append($article);

                    // Observe the image for reveal
                    // observeImage($article.find('img'));
                    $article.find('img').removeClass('img-hidden').addClass('fade-in fadeInSlideUp');


                    // **Show the first 3 images immediately**
                    if (index < 3) { // Show first 3 images immediately
                        $article.find('img').removeClass('img-hidden').addClass('fade-in fadeInSlideUp');
                    }
                });

                // Initialize Masonry after all items are appended and images are loaded
                $grid.imagesLoaded(function() {
                    $grid.masonry({
                        itemSelector: '.project',
                        columnWidth: '.grid-sizer',
                        percentPosition: true,
                        gutter: 10,
                        isFitWidth: true,
                        horizontalOrder: true,
                        originLeft: true,
                        originTop: true
                    });

                    // Once Masonry has completed layout, make the grid visible
                    $grid.on('layoutComplete', function() {
                        $grid.addClass('is-loaded');
                    });

                    debouncedLayout();
                });
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            $('.grid').append('<p class="error">Failed to load projects. Please try again later.</p>');
        });
    }

    // Function to add a single filter button
    function addFilterButton(category) {
        var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
        $('.filters').append(`<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`);
    }

    // Initiate dynamic loading
    setupFilterButtons(); // Initialize filter button event handlers immediately
    loadProjects();
});
