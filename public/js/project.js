//public/js/project.js
$(document).ready(function() {
    // Update the footer with the current year
    $('#current-year').text(new Date().getFullYear());

    // Function to get query parameters (project ID)
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

    // Fetch the project.json data (which now includes image filenames) for the specific project
    $.getJSON(`/api/getProjects`, function(projects) {
        const projectData = projects.find(p => p.id === parseInt(projectId));

        if (!projectData) {
            $('#project-title').text('Project Not Found');
            $('#project-description').text('No project data available.');
            return;
        }

        console.log("Loaded project data:", projectData);
        
        // Populate the project details
        $('#project-title').text(projectData.title);
        $('#project-description').text(projectData.description || "No description available.");

        // Populate team credit if available
        if (projectData.team_credit) {
            $('#project-description').append(`<p>Team Credit: ${projectData.team_credit}</p>`);
        }

        // Load images dynamically from the project data
        let imagesContainer = $('#project-images');
        imagesContainer.empty(); // Clear any existing content

        if (projectData.images && projectData.images.length > 0) {
            projectData.images.forEach(function(image, index) {
                let imgPath = `/projects/${projectData.folder}/images/${image}`;
                let imgElement = `<img src="${imgPath}" alt="Project ${projectId} Image ${index + 1}" class="lightbox-trigger img-hidden">`;
                imagesContainer.append(imgElement);
            });

            // Initialize lightbox after images are loaded
            imagesContainer.imagesLoaded(function() {
                console.log("Images loaded");
                imagesContainer.find('img').removeClass('img-hidden');
                initializeLightbox(); // Initialize the lightbox after the images are shown
            });
        } else {
            console.log("No images found for this project");
            $('#project-description').text('No images available for this project.');
        }
    }).fail(function(jqxhr, textStatus, error) {
        console.log("Failed to load project data:", textStatus, error);
        $('#project-title').text('Error');
        $('#project-description').text('Failed to load project data.');
    });

    // Close Project Button Functionality
    $('#close-project').on('click', function() {
        window.location.href = 'index.html';
    });

    // Function to initialize lightbox
    function initializeLightbox() {
        // console.log("Initializing lightbox");
        const images = $('.lightbox-trigger');
        const lightbox = $('#lightbox');
        const lightboxImg = $('#lightbox-img');
        const lightboxClose = $('.lightbox-close');
        const lightboxPrev = $('.lightbox-prev');
        const lightboxNext = $('.lightbox-next');
        let currentIndex = -1; // To track the current image

        function openLightbox(index) {
            // console.log("Opening lightbox for image index:", index);
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
});
