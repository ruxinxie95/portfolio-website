$(document).ready(function() {
    // Update the footer with the current year
    $('#current-year').text(new Date().getFullYear());

    // Apply Dark Mode on Page Load
    if (localStorage.getItem('darkMode') === 'enabled') {
        $('body').addClass('dark-mode');
        // Use event delegation-compatible selector
        $(document).find('.dark-mode-toggle i').removeClass('fa-moon').addClass('fa-sun'); // Update icon to sun
    }

    // Dark Mode Toggle Functionality using Event Delegation
    $(document).on('click', '.dark-mode-toggle', function() {
        $('body').toggleClass('dark-mode'); // Toggle dark mode

        if ($('body').hasClass('dark-mode')) {
            $(this).find('i').removeClass('fa-moon').addClass('fa-sun');
            localStorage.setItem('darkMode', 'enabled'); // Save to localStorage
        } else {
            $(this).find('i').removeClass('fa-sun').addClass('fa-moon');
            localStorage.setItem('darkMode', 'disabled'); // Save to localStorage
        }
    });

    // "Stop me" Link Functionality and Persistence with sessionStorage
    let clickCount = sessionStorage.getItem('clickCount') ? parseInt(sessionStorage.getItem('clickCount')) : 0;
    const stopButton = $('#stop-button');
    const messageElement = $('#message');

    function updateMessage() {
        if (clickCount === 0) {
            messageElement.text(""); // No message on initial load
            stopButton.text("Stop me"); // Ensure button text is default
        } else if (clickCount <= 2) {
            messageElement.text("No, you can't.");
            if (clickCount === 2) stopButton.text("Stop me again");
        } else if (clickCount < 5) {
            messageElement.text("Really?");
        } else if (clickCount === 5) {
            stopButton.remove();
            messageElement.html(`
                ruxinx.design@gmail.com | 734-882-8500 | 
                <a href="your-cv-link" target="_blank" aria-label="View CV">CV</a> | 
                <a href="https://www.linkedin.com/in/ruxin-xie/" target="_blank" aria-label="Visit LinkedIn Profile">LinkedIn</a>
            `);
        }
    }
    
    updateMessage();  // Update the message immediately based on stored click count

    // Attach click event using direct selector as 'stop-button' is static
    stopButton.on('click', function(event) {
        event.preventDefault(); // Prevent default <a> behavior
        clickCount++;
        sessionStorage.setItem('clickCount', clickCount); // Save click count to sessionStorage
        updateMessage();
    });
});
