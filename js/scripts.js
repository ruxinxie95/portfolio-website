$(document).ready(function() {
    // Initialize Projects and Filters
    $.getJSON('projects.json', function(data) {
        var $grid = $('.grid');
        var categories = [];

        function createProjectArticle(project, index) {
            var categoryClasses = project.categories.map(function(cat) {
                return cat.toLowerCase().replace(/\s+/g, '-');
            }).join(' ');

            // Use project.id for URL parameter
            return `
                <article class="project ${categoryClasses}">
                    <a href="project.html?id=${project.id}" class="project-link">
                        <img src="${project.cover_image}" alt="${project.title}" class="wp-post-image">
                    </a>
                </article>
            `;
        }

        $.each(data, function(index, project) {
            $grid.append(createProjectArticle(project, index));

            project.categories.forEach(function(category) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            });
        });

        categories.forEach(function(category) {
            var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            $('.filters').append(`<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`);
        });

        // Ensure all images are loaded before initializing Isotope
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
            $grid.isotope({ filter: filterValue }).isotope('layout');
            $('.filter-button').removeClass('active');
            $(this).addClass('active');
        });
    });
    // Enable dark mode by default
    $('body').addClass('dark-mode');

    // Change the icon to the sun since the page starts in dark mode
    $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun');

    // Toggle dark mode on click
    $('.dark-mode-toggle').on('click', function() {
        $('body').toggleClass('dark-mode');

        // Change the icon based on the current mode
        if ($('body').hasClass('dark-mode')) {
            $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun'); // Sun for dark mode
        } else {
            $('.dark-mode-toggle i').removeClass('fa-sun').addClass('fa-moon'); // Moon for light mode
        }
    });
    // "Stop me" Button Functionality
    let clickCount = 0;
    const stopButton = $('#stop-button');
    const messageElement = $('#message');
    const rotatingX = $('.rotating-x');

    stopButton.on('click', function() {
        clickCount++;

        function triggerFlash() {
            messageElement.addClass('flash');
            messageElement.on('animationend', function() {
                messageElement.removeClass('flash');
            });
        }

        if (clickCount <= 2) {
            messageElement.text("No, you can't.");
            triggerFlash();
            if (clickCount === 2) stopButton.text("Stop me again");
        } else if (clickCount < 5) {
            messageElement.text("Really?");
            triggerFlash();
        } else if (clickCount === 5) {
            // Apply the magic bling effect to the button
            stopButton.addClass('bling-disappear');

            // Set a timeout to remove the button and show icons with the message at the same time
            setTimeout(function() {
                stopButton.remove(); // Completely remove the button from the DOM

                // Add the social icons above the message
                $('.stop-me-section').prepend(`
                    <div class="social-icons fade-in">
                        <a href="your-cv-link" target="_blank" class="icon" title="CV">
                            <i class="fas fa-file-alt"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/ruxin-xie/" target="_blank" class="icon" title="LinkedIn">
                            <i class="fab fa-linkedin"></i>
                        </a>
                        <a href="https://www.behance.net/ruxinqq" target="_blank" class="icon" title="Behance">
                            <i class="fab fa-behance"></i>
                        </a>
                    </div>
                `);

                // Keep the message visible and ensure it stays in place
                messageElement.html(`
                    Let's talk! 
                    <span>ruxinx.design@gmail.com | 7348828500</span>
                `);
                // Apply fade-in to both icons and message
                $('.social-icons, #message').addClass('fade-in');
            }, 1000); // Timeout to match the bling animation
        }
    });

    // Favicon Animation Functionality
    const faviconFrames = ['icons/favicon1.png', 'icons/favicon2.png', 'icons/favicon3.png'];
    let currentFaviconFrame = 0;
    const faviconTimer = setInterval(function() {
        $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
        currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
    }, 200);

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

    /* Lightbox Functionality */
    const images = $('.lightbox-trigger');
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightbox-img');
    const lightboxClose = $('.lightbox-close');
    const lightboxPrev = $('.lightbox-prev');
    const lightboxNext = $('.lightbox-next');
    let currentIndex = -1;

    function openLightbox(index) {
        const img = images.eq(index);
        lightboxImg.attr('src', img.attr('src'));
        lightboxImg.attr('alt', img.attr('alt'));
        $('body').addClass('no-scroll');
        lightbox.addClass('active').hide().fadeIn(300);
        currentIndex = index;
    }

    images.on('click', function() {
        const index = images.index(this);
        openLightbox(index);
    });

    function closeLightbox() {
        $('body').removeClass('no-scroll');
        lightbox.fadeOut(300, function() {
            lightbox.removeClass('active');
        });
        currentIndex = -1;
    }

    lightboxClose.on('click', closeLightbox);
    lightbox.on('click', function(e) {
        if ($(e.target).is('#lightbox-img') || $(e.target).is('.lightbox-content')) {
            return;
        }
        closeLightbox();
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    lightboxPrev.on('click', function(e) {
        e.stopPropagation();
        if (currentIndex > 0) {
            openLightbox(currentIndex - 1);
        } else {
            openLightbox(images.length - 1);
        }
    });

    lightboxNext.on('click', function(e) {
        e.stopPropagation();
        if (currentIndex < images.length - 1) {
            openLightbox(currentIndex + 1);
        } else {
            openLightbox(0);
        }
    });

    lightboxImg.on('swipeleft', function() {
        lightboxNext.click();
    });

    lightboxImg.on('swiperight', function() {
        lightboxPrev.click();
    });
});
