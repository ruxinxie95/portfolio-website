$(document).ready(function() {
    $.getJSON('projects.json', function(data) {
        let projectGrid = $('#projects-grid');
        $.each(data, function(index, project) {
            projectGrid.append(`
                <div class="project">
                    <img src="${project.cover_image}" alt="${project.title}" />
                </div>
            `);
        });
    });
});
