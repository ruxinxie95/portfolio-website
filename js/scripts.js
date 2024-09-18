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
        
            // Create the article element with a link to the individual project page
            var article = `
                <article class="project ${categoryClasses}">
                    <a href="projects/project${index + 1}.html" class="project-link">
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
    });

    // Slideshow functionality for project pages
    if ($('.slideshow').length > 0) {
        $('.slideshow').slick({
            arrows: true,
            dots: true,
            autoplay: false,  // Disable auto-sliding
            infinite: false,
            centerMode: true,
            centerPadding: '33.33%', // Slideshow starts 1/3 from the right and ends 1/3 from the left
            slidesToShow: 1
        });

        // Lightbox trigger for images in the slideshow
        $('.slideshow img').on('click', function(e) {
            e.preventDefault();
            var lightboxSrc = $(this).attr('src');
            lightbox.start($(this)[0]); // Manually trigger lightbox with image clicked
        });

        // Lightbox close when clicked outside of the image
        $(document).on('click', '.lightbox', function() {
            lightbox.end();
        });
    }
});
