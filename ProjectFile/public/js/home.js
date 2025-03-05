// JavaScript for slideshow
let slideIndex = 0;

showSlides(); // Run initially to display the first slide.

function showSlides() {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    // Remove active class from all slides and dots
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }

    // Add active class to the current slide and dot
    slides[slideIndex].style.opacity = 0; // Set initial opacity to 0
    slides[slideIndex].classList.add("active");
    dots[slideIndex].classList.add("active");

    // Fade in the current slide
    setTimeout(function() {
        slides[slideIndex].style.opacity = 1; // Set final opacity to 1
    }, 100); // Delay the fade-in effect by 100ms

    // Automatically move to the next slide after a certain time
    setTimeout(showSlides, 10000); // Change slide every 10 seconds
}

function plusSlides(n) {
    slideIndex += n;

    // Handle the wrapping of slides (if we exceed the bounds, go back to the start or end)
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    if (slideIndex >= slides.length) {
        slideIndex = 0; // If next is clicked, go to the first slide
    } else if (slideIndex < 0) {
        slideIndex = slides.length - 1; // If previous is clicked, go to the last slide
    }

    // Remove active class from all slides and dots
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }

    // Add active class to the new slide and dot
    slides[slideIndex].style.opacity = 0; // Set initial opacity to 0
    slides[slideIndex].classList.add("active");
    dots[slideIndex].classList.add("active");

    // Fade in the new slide
    setTimeout(function() {
        slides[slideIndex].style.opacity = 1; // Set final opacity to 1
    }, 100); // Delay the fade-in effect by 100ms
}

// Function to select a slide by clicking the dot
function currentSlide(n) {
    slideIndex = n;
    showSlides(); // Update the slideshow
}

// Add event listeners to the dots
let dots = document.getElementsByClassName("dot");
for (let i = 0; i < dots.length; i++) {
    dots[i].addEventListener('click', function () {
        currentSlide(i); // When a dot is clicked, show the corresponding slide
    });
}

// Add event listeners for swipe gestures
let slideshowContainer = document.querySelector(".slideshow-container");
let touchStartX = 0;
let touchEndX = 0;

slideshowContainer.addEventListener("touchstart", function(event) {
    touchStartX = event.touches[0].clientX;
});

slideshowContainer.addEventListener("touchend", function(event) {
    touchEndX = event.changedTouches[0].clientX;

    if (touchEndX - touchStartX > 50) {
        // Swipe left
        plusSlides(-1);
    } else if (touchStartX - touchEndX > 50) {
        // Swipe right
        plusSlides(1);
    }
});

slideshowContainer.addEventListener("mousedown", function(event) {
    mouseStartX = event.clientX;
});

slideshowContainer.addEventListener("mouseup", function(event) {
    mouseEndX = event.clientX;

    if (mouseEndX - mouseStartX > 50) {
        // Swipe left
        plusSlides(-1);
    } else if (mouseStartX - mouseEndX > 50) {
        // Swipe right
        plusSlides(1);
    }
});
