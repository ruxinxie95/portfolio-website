// js/main.js

$(document).ready(function() {
    // Function to initialize lazy loading
    function initLazyLoading() {
        const lazyImages = $('.lazy');
        lazyImages.each(function() {
            const img = $(this);
            const src = img.attr('data-src');
            img.attr('src', src).on('load', function() {
                img.addClass('loaded');
            });
        });
    }

    // Function to open modal with project details
    function openModal(project) {
        $('.modal').fadeIn();
        $('.modal-content h2').text(project.title);
        $('.modal-content .modal-description').text(project.description);
        $('.modal-content .modal-images').empty();
        project.images.forEach(function(image) {
            $('.modal-content .modal-images').append(`<img src="${image}" alt="${project.title}" />`);
        });
        $('.modal-content .tags').empty();
        project.tags.forEach(function(tag) {
            $('.modal-content .tags').append(`<span class="tag">${tag}</span>`);
        });
    }

    // Function to close modal
    function closeModal() {
        $('.modal').fadeOut();
    }

    // Function to initialize filtering
    function initFiltering() {
        $('.filter-btn').on('click', function() {
            // Remove active class from all buttons
            $('.filter-btn').removeClass('active');
            // Add active class to the clicked button
            $(this).addClass('active');
            // Get the filter category
            const filter = $(this).data('filter');
            
            if (filter === "all") {
                $('.project').show();
            } else {
                $('.project').each(function() {
                    const projectCategories = $(this).data('categories').split(' ');
                    if (projectCategories.includes(filter)) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            }

            // Relayout Masonry after filtering
            $('#projects-grid').masonry('layout');
        });
    }

    // Load Projects from projects.json
    $.getJSON('projects.json', function(data) {
        let projectGrid = $('#projects-grid');
        $.each(data, function(index, project) {
            let projectClass = project.highlight ? 'project highlight' : 'project';
            let categories = project.categories.join(' ');
            let displayCategories = project.categories.join(', ');
            projectGrid.append(`
                <div class="${projectClass}" data-categories="${categories}">
                    <img data-src="${project.cover_image}" alt="${project.title}" class="lazy" />
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${displayCategories}</p>
                    </div>
                </div>
            `);
        });

        // Initialize Lazy Loading
        initLazyLoading();

        // Initialize Filtering
        initFiltering();

        // Initialize Masonry after all images have loaded
        imagesLoaded(projectGrid, function() {
            projectGrid.masonry({
                itemSelector: '.project',
                columnWidth: '.project',
                percentPosition: true,
                gutter: 10 // Adjust gutter as needed
            });
        });
    });

    // Close modal on close button click
    $('.modal .close').on('click', function() {
        closeModal();
    });

    // Close modal when clicking outside the modal content
    $(window).on('click', function(event) {
        if ($(event.target).hasClass('modal')) {
            closeModal();
        }
    });

    // Close modal on pressing the Escape key
    $(document).on('keydown', function(event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });
});
