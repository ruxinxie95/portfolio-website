
$(document).ready(function() {
    // Update the footer with the current year
    $('#current-year').text(new Date().getFullYear());

    // Apply Dark Mode on Page Load (Handled by main.js)

    // "Stop me" Button Functionality (Handled by main.js)

    // Function to get query parameters
    function getQueryParam(param) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    let projectId = getQueryParam('id'); // URL format: project.html?id=1

    if (!projectId) {
        $('#project-title').text('Project Not Found');
        $('#project-description').text('No project ID provided.');
        return;
    }

    // Fetch projects.json
    $.getJSON('projects.json', function(data) {
        // Find the project with the matching id
        let project = data.find(p => p.id == projectId);

        if (!project) {
            $('#project-title').text('Project Not Found');
            $('#project-description').text('The requested project does not exist.');
            return;
        }

        // Populate the project details
        $('#project-title').text(project.title);
        $('#project-description').text(project.description);

        // Populate images
        let imagesContainer = $('#project-images');
        imagesContainer.empty(); // Clear any existing content

        project.images.forEach(function(imagePath, index) {
            let imgElement = `
                <img src="${imagePath}" alt="${project.title} Image ${index + 1}" class="lightbox-trigger img-hidden">
            `;
            imagesContainer.append(imgElement);
        });

        // Initialize lightbox after images are loaded
        imagesContainer.imagesLoaded(function() {
            // Remove the img-hidden class from all images once they are loaded
            imagesContainer.find('img').removeClass('img-hidden');
            initializeLightbox(); // Initialize the lightbox after the images are shown
        });
        

    }).fail(function() {
        $('#project-title').text('Error');
        $('#project-description').text('Failed to load project data.');
    });

    // Close Project Button Functionality
    $('#close-project').on('click', function() {
        window.location.href = 'index.html';
    });

    // Function to initialize lightbox (ensure it's called after images are loaded)
    function initializeLightbox() {
        const images = $('.lightbox-trigger');
        const lightbox = $('#lightbox');
        const lightboxImg = $('#lightbox-img');
        const lightboxClose = $('.lightbox-close');
        const lightboxPrev = $('.lightbox-prev');
        const lightboxNext = $('.lightbox-next');
        let currentIndex = -1; // To track the current image

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
    }

    // Favicon Animation Functionality
    const faviconFrames = ['icons/favicon1.png', 'icons/favicon2.png', 'icons/favicon3.png'];
    let currentFaviconFrame = 0;
    const faviconTimer = setInterval(function() {
        $('#dynamic-favicon').attr('href', faviconFrames[currentFaviconFrame]);
        currentFaviconFrame = (currentFaviconFrame + 1) % faviconFrames.length;
    }, 200);
});
