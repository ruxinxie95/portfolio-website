$(document).ready(function() {
    // Update the footer with the current year
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Append the Dark Mode Toggle if it doesn't already exist
    if ($('.dark-mode-toggle').length === 0) {
        $('.stop-me-section').append(`
            <div class="dark-mode-toggle">
                <i class="fas fa-moon"></i> <!-- Moon icon for dark mode -->
            </div>
        `);
    }

    // Apply Dark Mode on Page Load
    if (localStorage.getItem('darkMode') === 'enabled') {
        $('body').addClass('dark-mode');
        $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun'); // Update icon to sun
    }

    // Dark Mode Toggle Functionality
    $('.dark-mode-toggle').on('click', function() {
        $('body').toggleClass('dark-mode'); // Toggle dark mode

        if ($('body').hasClass('dark-mode')) {
            $('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun');
            localStorage.setItem('darkMode', 'enabled'); // Save to localStorage
        } else {
            $('.dark-mode-toggle i').removeClass('fa-sun').addClass('fa-moon');
            localStorage.setItem('darkMode', 'disabled'); // Save to localStorage
        }
    });

    // "Stop me" Link Functionality and Persistence with sessionStorage
    let clickCount = sessionStorage.getItem('clickCount') ? parseInt(sessionStorage.getItem('clickCount')) : 0;
    const stopButton = $('#stop-button');
    const messageElement = $('#message');

    function updateMessage() {
        if (clickCount === 0) {
            messageElement.text(""); // No message on initial load
            stopButton.text("Stop me"); // Ensure button text is default
        } else if (clickCount <= 2) {
            messageElement.text("No, you can't.");
            if (clickCount === 2) stopButton.text("Stop me again");
        } else if (clickCount < 5) {
            messageElement.text("Really?");
        } else if (clickCount === 5) {
            stopButton.remove();
            messageElement.html(`
                ruxinx.design@gmail.com | 734-882-8500 | 
                <a href="your-cv-link" target="_blank" aria-label="View CV">CV</a> | 
                <a href="https://www.linkedin.com/in/ruxin-xie/" target="_blank" aria-label="Visit LinkedIn Profile">LinkedIn</a>
            `);
        }
    }
    
    updateMessage();  // Update the message immediately based on stored click count

    stopButton.on('click', function(event) {
        event.preventDefault(); // Prevent default <a> behavior
        clickCount++;
        sessionStorage.setItem('clickCount', clickCount); // Save click count to sessionStorage
        updateMessage();
    });

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
                <img src="${imagePath}" alt="${project.title} Image ${index + 1}" class="lightbox-trigger">
            `;
            imagesContainer.append(imgElement);
        });

        // Reinitialize lightbox for newly added images
        initializeLightbox();

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
