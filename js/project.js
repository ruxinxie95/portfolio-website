$(document).ready(function(){
    // Initialize the slideshow without auto-sliding
    $('.slideshow').slick({
        arrows: true,
        dots: true,
        autoplay: false,
        infinite: false,
        slidesToShow: 1,        // Show 1 slide at a time
        adaptiveHeight: true    // Automatically adjust height to image content
    });

    // Lightbox trigger when clicking on the image in the slideshow
    $('.slideshow a').on('click', function(e) {
        e.preventDefault(); // Prevent default link behavior
        var lightboxSrc = $(this).attr('href');
        // Trigger lightbox manually using the image href
        lightbox.start(this);
    });

    // Lightbox close functionality
    $(document).on('click', '.lightbox', function() {
        // Close the lightbox when clicked outside the image
        lightbox.end();
    });
});
