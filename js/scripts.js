$(document).ready(function() {
    // -----------------------------
    // 1. Initialize Projects and Filters
    // -----------------------------
    
    // Load JSON data and initialize projects
    $.getJSON('projects.json', function(data) {
        var $grid = $('.grid');
        var categories = [];

        // Function to create project article HTML
        function createProjectArticle(project, index) {
            var categoryClasses = project.categories.map(function(cat) {
                return cat.toLowerCase().replace(/\s+/g, '-');
            }).join(' ');

            var article = `
                <article class="project ${categoryClasses}">
                    <a href="projects/project${index + 1}/project${index + 1}.html" class="project-link">
                        <img src="${project.cover_image}" alt="${project.title}" class="wp-post-image">
                    </a>
                </article>
            `;
            return article;
        }

        // Iterate over each project and append to grid
        $.each(data, function(index, project) {
            var articleHTML = createProjectArticle(project, index);
            $grid.append(articleHTML);

            // Collect unique categories for filter buttons
            project.categories.forEach(function(category) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            });
        });

        // Create filter buttons dynamically
        categories.forEach(function(category) {
            var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            var button = `<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`;
            $('.filters').append(button);
        });

        // Ensure all images are loaded before initializing Isotope
        $grid.imagesLoaded().done(function() {
            // Initialize Isotope with masonry layout
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
            
            // Apply the filter and force a layout reflow after the filter
            $grid.isotope({ filter: filterValue }).isotope('layout');

            // Highlight the active button
            $('.filter-button').removeClass('active');
            $(this).addClass('active');
        });
    });

    // -----------------------------
    // 2. "Stop me" Button Functionality
    // -----------------------------

    let clickCount = 0;
    const stopButton = $('#stop-button');
    const messageElement = $('#message');
    const rotatingX = $('.rotating-x');

    stopButton.on('click', function() {
        clickCount++;

        // Function to trigger the flash effect
        function triggerFlash() {
            messageElement.addClass('flash');
            // Remove the class after the animation ends to allow re-triggering
            messageElement.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function() {
                messageElement.removeClass('flash');
                // Unbind the event to prevent multiple triggers
                messageElement.off('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd');
            });
        }

        if (clickCount <= 2) {
            // First and second clicks
            messageElement.text("No, you can't.");
            triggerFlash();
            if (clickCount === 2) {
                stopButton.text("Stop me again");
            }
        } else if (clickCount < 5) {
            // Third and fourth clicks
            messageElement.text("Really?");
            triggerFlash();
        } else if (clickCount === 5) {
            // Fifth click
            messageElement.html(`
                Let's talk! 
                <a href="mailto:ruxinx.design@gmail.com">ruxinx.design@gmail.com</a><br>
                Phone: 7348828500
            `);
            triggerFlash();
            stopButton.prop('disabled', true); // Disable the button after 5 clicks
            rotatingX.css('animation-play-state', 'paused'); // Stop the spinning X
        }
    });

    // -----------------------------
    // 3. Favicon Animation Functionality
    // -----------------------------

    // Array of favicon frame URLs
    const faviconFrames = [
        'icons/favicon1.png',
        'icons/favicon2.png',
        'icons/favicon3.png'
    ];

    let currentFaviconFrame = 0; // Tracks the current frame index
    const totalFaviconFrames = faviconFrames.length;
    const faviconFrameInterval = 200; // Time between frames in milliseconds (adjust for speed)

    // Function to update the favicon
    function updateFavicon() {
        const favicon = document.getElementById('dynamic-favicon');
        if (favicon) {
            favicon.href = faviconFrames[currentFaviconFrame];
            currentFaviconFrame = (currentFaviconFrame + 1) % totalFaviconFrames;
        }
    }

    // Start the favicon animation when the page loads
    const faviconTimer = setInterval(updateFavicon, faviconFrameInterval);

    // Optional: Stop favicon animation when "Stop me" button is clicked and reaches the fifth click
    // Already handled in the "Stop me" button functionality above by stopping the rotating X
    // If you also want to stop the favicon animation, uncomment the following lines:

    /*
    stopButton.on('click', function() {
        if (clickCount === 5) {
            clearInterval(faviconTimer); // Stop the favicon animation
        }
    });
    */
});
