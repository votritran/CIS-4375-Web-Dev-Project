let currentSlideIndex = 0; // Initialize current slide index

// Function to change slides
function changeSlide(direction) {
    const slides = document.querySelectorAll('.event-slide');
    const dots = document.querySelectorAll('.dot');

    slides[currentSlideIndex].classList.remove('active'); // Hide current slide
    dots[currentSlideIndex].classList.remove('active-dot'); // Remove active dot

    currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length; // Calculate next slide index

    slides[currentSlideIndex].classList.add('active'); // Show new slide
    dots[currentSlideIndex].classList.add('active-dot'); // Highlight active dot
}

// Function to show the specific slide when a dot is clicked
function currentSlide(index) {
    const slides = document.querySelectorAll('.event-slide');
    const dots = document.querySelectorAll('.dot');

    slides[currentSlideIndex].classList.remove('active'); // Hide current slide
    dots[currentSlideIndex].classList.remove('active-dot'); // Remove active dot

    currentSlideIndex = index;

    slides[currentSlideIndex].classList.add('active'); // Show selected slide
    dots[currentSlideIndex].classList.add('active-dot'); // Highlight selected dot
}

// Optional: Automatically change slide every 5 seconds
setInterval(() => {
    changeSlide(1); // Move to next slide automatically
}, 10000);