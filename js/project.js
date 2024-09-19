$(document).ready(function () {
    // Slick carousel initialization
    $('.slideshow').slick({
        arrows: true,
        dots: true,
        autoplay: false,
        infinite: false,
        slidesToShow: 1,
        adaptiveHeight: true,
    });

    // Click event to zoom into the project
    $('.project').on('click', function () {
        $('#page').addClass('zoomed');
        $('body').css('overflow', 'hidden'); // Prevent scrolling while zoomed in
    });

    // Close the project view
    $('#close-project').on('click', function () {
        $('#page').removeClass('zoomed');
        $('body').css('overflow', 'auto');
    });
});
