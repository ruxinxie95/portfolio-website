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
            console.log('Debounced Masonry layout called.');
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
                console.log('Image is intersecting:', entry.target); // Debugging log

                // Remove the observer for the current target to prevent repeated triggers
                observer.unobserve(entry.target);

                // Add both 'fade-in' and 'fadeInSlideUp' classes to trigger CSS transitions
                $(entry.target).removeClass('img-hidden').addClass('fade-in fadeInSlideUp');
                console.log('Added fade-in and fadeInSlideUp class to:', entry.target); // Debugging log

                // Ensure the animation happens even on page refresh or fast loading
                setTimeout(function() {
                    $(entry.target).addClass('fadeInSlideUp');
                }, 50);  // Delay ensures smooth animation triggering after adding the class

                // Once the transition completes, trigger Masonry layout
                $(entry.target).on('transitionend', function() {
                    debouncedLayout();
                    console.log('Transition ended for:', entry.target); // Debugging log
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
            console.log('Observing image:', img[0]); // Debugging log
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
        $.getJSON('/api/getProjects', function(projects) { // Updated API endpoint here
            console.log(`Fetched ${projects.length} project(s) from the server.`);

            // **Sort projects numerically by 'id' in ascending order**
            projects.sort(function(a, b) {
                return a.id - b.id;
            });
            console.log('Projects sorted numerically by id.');

            // Array to keep track of asynchronous image load checks
            let imageChecks = [];

            projects.forEach(function(project, index) { // Added index for first 3 projects
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
                var coverImagePath = `/projects/${project.folder}/images/cover.jpg`; // Ensure this path is correct

                // Create a new Image object to check if the cover image exists
                let imgCheck = new Promise((resolve, reject) => {
                    let img = new Image();
                    img.src = coverImagePath;
                    img.onload = function() {
                        resolve(true);
                    };
                    img.onerror = function() {
                        console.warn(`Cover image not found for project: ${project.title}`);
                        resolve(false); // Resolve with false to indicate missing image
                    };
                });

                // Add the image check promise to the array
                imageChecks.push(imgCheck.then((exists) => {
                    if (exists) {
                        // Create project element with 'img-hidden' class
                        var $article = $(`
                            <article class="project ${categoryClasses} project${project.id}">
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
                        console.log('Appended project:', project.title); // Debugging log

                        // Observe the image for reveal
                        observeImage($article.find('img'));

                        // **Show the first 3 images immediately**
                        if (index < 3) { // Show first 3 images immediately
                            $article.find('img').removeClass('img-hidden').addClass('fade-in fadeInSlideUp');
                            console.log('Displayed first image immediately:', project.title);
                        }
                    }
                    // If the image doesn't exist, do nothing (skip appending)
                }));
            });

            // After all image checks are done, initialize Masonry
            Promise.all(imageChecks).then(() => {

                // Wait for all images to load
                $grid.imagesLoaded(function() {
                    console.log('All images have been loaded.');

                    // Initialize Masonry
                    $grid.masonry({
                        itemSelector: '.project',
                        columnWidth: '.grid-sizer',
                        percentPosition: true,
                        gutter: 10,
                        isFitWidth: true
                    });

                    // Once Masonry has completed layout, make the grid visible
                    $grid.on('layoutComplete', function() {
                        $grid.addClass('is-loaded');
                        console.log('Masonry layout complete.');
                    });

                    console.log('Masonry initialized after projects loaded.');

                    // Optionally, trigger Masonry layout in case some images are already in viewport
                    debouncedLayout();
                });
            });

            // Set up filter buttons after projects are loaded
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to load projects:', textStatus, errorThrown);
            $('.grid').append('<p class="error">Failed to load projects. Please try again later.</p>');
        });
    }

    // Function to add a single filter button
    function addFilterButton(category) {
        var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
        $('.filters').append(`<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`);
        console.log('Added filter button for category:', category);
    }

    // Initiate dynamic loading
    setupFilterButtons(); // Initialize filter button event handlers immediately
    loadProjects();
});
