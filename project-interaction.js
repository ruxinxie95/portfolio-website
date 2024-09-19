$(document).ready(function () {
    // Fade in transition for page content
    $('#page').fadeIn(800);

    // Smooth scroll for the close button
    $('.close-project').on('click', function (e) {
        e.preventDefault();
        $('#page').fadeOut(800, function () {
            window.location.href = "../../index.html";
        });
    });
});
