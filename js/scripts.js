$(document).ready(function() {
    // Load JSON data and initialize projects
    $.getJSON('projects.json', function(data) {
        var $grid = $('.grid');
        var categories = [];

        // Function to create project article HTML
        function createProjectArticle(project, index) {
            var categoryClasses = project.categories.map(function(cat) {
                return cat.toLowerCase().replace(/\s+/g, '-');
            }).join(' ');

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

            // Collect unique categories for filter buttons
            project.categories.forEach(function(category) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            });
        });

        // Create filter buttons dynamically
        categories.forEach(function(category) {
            var categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            var button = `<button data-filter=".${categoryClass}" class="filter-button">${category}</button>`;
            $('.filters').append(button);
        });

        // Ensure all images are loaded before initializing Isotope
        $grid.imagesLoaded().done(function() {
            // Initialize Isotope without transition on layout change
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
            
            // Apply the filter and force a layout reflow after the filter
            $grid.isotope({ filter: filterValue }).isotope('layout');

            // Highlight the active button
            $('.filter-button').removeClass('active');
            $(this).addClass('active');
        });
    });
});
