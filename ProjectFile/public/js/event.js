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


 // Function to toggle the visibility of the dropdown form
 function toggleForm() {
    const form = document.querySelector('.dropdown-form');
    const button = document.querySelector('.dropdown-btn');
    
    // Toggle the visibility of the form
    form.style.display = (form.style.display === 'block') ? 'none' : 'block';
    
    // Toggle the active state of the button
    button.classList.toggle('active');
}

  // Populate the update form with the selected event's data
// Populate the update form with the selected event's data
function populateUpdateForm() {
    const eventId = document.getElementById("eventSelect").value;

    if (eventId) {
        // Show the update form
        document.getElementById("updateEventDropdown").style.display = "block";

        // Fetch the event data
        fetch(`/adminevent/getEvent/${eventId}`)
            .then(response => response.json())
            .then(event => {
                // Populate the form fields with the event data
                document.getElementById("eventId").value = event.EventID;
                document.getElementById("eventName").value = event.EventName;
                document.getElementById("eventDescription").value = event.EventDescription;
                document.getElementById("eventDate").value = event.EventDate;
                document.getElementById("eventTime").value = event.EventTime;
            })
            .catch(err => console.error("Error fetching event data:", err));
    } else {
        // Hide the form if no event is selected
        document.getElementById("updateEventDropdown").style.display = "none";
    }
}


function toggleUpdateForm() {
    const form = document.getElementById('updateEventDropdown');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}



