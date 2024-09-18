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
});
