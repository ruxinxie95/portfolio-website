$(document).ready(function() {
    // Fetch the project data
    $.getJSON('projects.json', function(data) {
        let projectGrid = $('#projects-grid');
        
        // Loop through the projects and append the cover image to the grid
        $.each(data, function(index, project) {
            projectGrid.append(`
                <div class="project ${project.category}" style="background-image: url('${project.cover_image}');" data-title="${project.title}">
                    <h3>${project.title}</h3>
                </div>
            `);
        });
    });

    // Filter functionality
    $('.categories a').click(function(e) {
        e.preventDefault();
        const filter = $(this).data('filter');
        $('.project').hide();
        if (filter === 'all') {
            $('.project').show();
        } else {
            $('.project.' + filter).show();
        }
    });

    // Handle project click to show project gallery
    $('#projects-grid').on('click', '.project', function() {
        const projectTitle = $(this).data('title');

        // Find the corresponding project in the JSON data
        $.getJSON('projects.json', function(data) {
            const project = data.find(proj => proj.title === projectTitle);
            
            // Populate the gallery with project details
            $('#project-title').text(project.title);
            $('#project-description').text(project.description);
            const galleryImages = $('#gallery-images');
            galleryImages.empty(); // Clear previous images
            
            $.each(project.images, function(index, image) {
                galleryImages.append(`<img src="${image}" alt="Project Image ${index + 1}">`);
            });

            // Show the gallery section and hide the project grid
            $('#projects-grid').hide();
            $('#project-gallery').show();
        });
    });

    // Back to project grid
    $('#back-to-projects').click(function() {
        $('#project-gallery').hide();
        $('#projects-grid').show();
    });
});
