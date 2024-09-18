/* project1.js */

$(document).ready(function(){
    // Initialize the slideshow without auto-sliding
    $('.slideshow').slick({
        arrows: true,
        dots: true,
        autoplay: false,
        infinite: false,
        centerMode: true,
        centerPadding: '33.33%',  // Start 1/3 from the right, end 1/3 from the left
        slidesToShow: 1
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
