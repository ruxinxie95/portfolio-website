$(document).ready(function() {
    // Load Projects
    $.getJSON('projects.json', function(data) {
        let projectGrid = $('#projects-grid');
        $.each(data, function(index, project) {
            let projectClass = project.highlight ? 'project highlight' : 'project';
            // Join multiple categories with a space for data-categories attribute
            let categories = project.categories.join(' ');
            // Join categories with a comma for display
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

        // Click event to open modal
        $('.project').on('click', function() {
            let categories = $(this).data('categories').split(' ');
            // Find the project in data based on title or another unique identifier
            // Here, we'll use the index based on the DOM order
            let index = $(this).index();
            let project = data[index];
            openModal(project);
        });
    });

    // Set Active Navigation Link
    const currentPage = window.location.pathname.split("/").pop();
    $('.nav-link').each(function() {
        const linkPage = $(this).attr('href');
        if (linkPage === currentPage) {
            $(this).addClass('active');
        }
    });

    // Smooth Scrolling for Internal Links
    $('a[href^="#"]').on('click', function(event) {
        event.preventDefault();
        const target = this.hash;
        const $target = $(target);
        $('html, body').animate({
            scrollTop: $target.offset().top - 60 // Adjust offset for sticky header
        }, 500);
    });

    // Function to Open Modal
    function openModal(project) {
        $('.modal-content h2').text(project.title);
        $('.modal-description').text(project.description);
        $('.modal-images').html(project.images.map(img => `<img src="${img}" alt="${project.title} Image">`).join(''));
        $('.tags').html(project.tags.map(tag => `<span class="tag">${tag}</span>`).join(' '));
        $('.modal').fadeIn();

        // Focus Management
        $('.close').focus();

        // Close Modal on Close Button Click
        $('.close').on('click', closeModal);

        // Close Modal on Escape Key
        $(document).on('keydown.modal', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Close Modal When Clicking Outside Content
        $('.modal').on('click', function(event) {
            if ($(event.target).hasClass('modal')) {
                closeModal();
            }
        });
    }

    // Function to Close Modal
    function closeModal() {
        $('.modal').fadeOut(function() {
            $('.modal-content h2').text('');
            $('.modal-description').text('');
            $('.modal-images').html('');
            $('.tags').html('');
            $('.close').off('click');
            $(document).off('keydown.modal');
        });
    }

    // Function to Initialize Lazy Loading
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Function to Initialize Filtering
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
        });
    }

    // Initialize Filtering after projects are loaded
    $.getJSON('projects.json', function(data) {
        initFiltering();
    });
});
