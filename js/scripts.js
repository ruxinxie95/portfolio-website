$(document).ready(function() {
    // Menu Toggle
    $('.menu-toggle').on('click', function() {
        $('#primary-menu').toggleClass('active');
    });

    // Load JSON data and initialize projects
    $.getJSON('projects.json', function(data) {
        var $grid = $('.grid');

        // Function to create project article HTML
        function createProjectArticle(project, index) {
            // Generate category classes for filtering
            var categoryClasses = project.categories.map(function(cat) {
                return cat.toLowerCase().replace(/\s+/g, '-');
            }).join(' ');
        
            // Highlight project if applicable
            var highlightClass = project.highlight ? ' highlight' : '';
        
            // Create the article element without the header
            var article = `
                <article class="project ${categoryClasses}${highlightClass}">
                    <a href="#" class="project-link" data-index="${index}">
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
        });

        // Initialize Isotope after all images have been loaded
        $grid.imagesLoaded().progress(function() {
            $grid.isotope({
                itemSelector: '.project',
                layoutMode: 'masonry',
                percentPosition: true,
                masonry: {
                    columnWidth: '.project',
                    gutter: 0
                }
            });
        });

        // Filter items on click
        $('.term-list li').on('click', function() {
            var filterValue = $(this).attr('class');
            if(filterValue === 'list-trigger') {
                $('body').toggleClass('simply');
                if($('body').hasClass('simply')) {
                    $grid.isotope('destroy');
                } else {
                    $grid.isotope({
                        itemSelector: '.project',
                        layoutMode: 'masonry',
                        percentPosition: true,
                        masonry: {
                            columnWidth: '.project',
                            gutter: 0
                        }
                    });
                }
            } else {
                if(filterValue === 'All') {
                    $grid.isotope({ filter: '*' });
                } else {
                    $grid.isotope({ filter: '.' + filterValue });
                }
            }
        });

        // Modal functionality
        $('.project-link').on('click', function(e) {
            e.preventDefault();
            var index = $(this).data('index');
            var project = data[index];

            $('#modal-title').text(project.title);
            $('#modal-description').text(project.description);

            var imagesHTML = project.images.map(function(img) {
                return `<img src="${img}" alt="${project.title} Image" class="modal-image">`;
            }).join(' ');
            $('.modal-images').html(imagesHTML);

            $('#projectModal').fadeIn();
        });

        // Close modal
        $('.close-button').on('click', function() {
            $('#projectModal').fadeOut();
        });

        // Close modal when clicking outside content
        $(window).on('click', function(e) {
            if ($(e.target).is('#projectModal')) {
                $('#projectModal').fadeOut();
            }
        });
    });
});
