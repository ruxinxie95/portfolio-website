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
                messageElement.html(`
                    Let's talk! 
                    <a href="mailto:ruxinx.design@gmail.com">ruxinx.design@gmail.com</a><br>
                    Phone: 7348828500
                `);
                triggerFlash();
                stopButton.prop('disabled', true);
                rotatingX.css('animation-play-state', 'paused');
            }
        });

        // Favicon Animation Functionality
        const faviconFrames = ['icons/favicon1.png', 'icons/favicon2.png', 'icons/favicon3.png'];
        let currentFaviconFrame = 0;
        const faviconTimer = setInterval(function() {
            $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
            currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
        }, 200);

    /* Lightbox Functionality */

        // Get all lightbox-trigger images
        const images = $('.lightbox-trigger');
        const lightbox = $('#lightbox');
        const lightboxImg = $('#lightbox-img');
        const lightboxClose = $('.lightbox-close');
        const lightboxPrev = $('.lightbox-prev');
        const lightboxNext = $('.lightbox-next');
        let currentIndex = -1; // To track the current image

        // Function to open lightbox at a specific index
        function openLightbox(index) {
            const img = images.eq(index);
            lightboxImg.attr('src', img.attr('src'));
            lightboxImg.attr('alt', img.attr('alt'));
            $('body').addClass('no-scroll');
            lightbox.addClass('active').hide().fadeIn(300);
            currentIndex = index;
        }
        

        // Click event to open lightbox
        images.on('click', function() {
            const index = images.index(this);
            openLightbox(index);
        });

        // Function to close lightbox
        function closeLightbox() {
            $('body').removeClass('no-scroll');
            lightbox.fadeOut(300, function() {
                lightbox.removeClass('active');
            });
            currentIndex = -1;
        }
        

        // Click event to close lightbox
        lightboxClose.on('click', closeLightbox);

        // Click outside the image to close lightbox
        lightbox.on('click', function(e) {
            if ($(e.target).is('#lightbox-img') || $(e.target).is('.lightbox-content')) {
                return;
            }
            closeLightbox();
        });

        // Press 'Esc' key to close lightbox
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });

        // Navigate to previous image
        lightboxPrev.on('click', function(e) {
            e.stopPropagation(); // Prevent triggering the lightbox click event
            if (currentIndex > 0) {
                openLightbox(currentIndex - 1);
            } else {
                openLightbox(images.length - 1); // Loop to last image
            }
        });

        // Navigate to next image
        lightboxNext.on('click', function(e) {
            e.stopPropagation();
            if (currentIndex < images.length - 1) {
                openLightbox(currentIndex + 1);
            } else {
                openLightbox(0); // Loop to first image
            }
        });

        // Optional: Swipe gestures for touch devices
        lightboxImg.on('swipeleft', function() {
            lightboxNext.click();
        });

        lightboxImg.on('swiperight', function() {
            lightboxPrev.click();
        });
    });
