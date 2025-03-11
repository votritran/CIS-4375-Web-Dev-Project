document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    let formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        contactType: document.getElementById("contactType").value,
        Language: document.getElementById("Language").value,
        Subject: document.getElementById("Subject").value,
        message: document.getElementById("message").value
    };

    fetch("/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("Thank you for contacting us! You will hear back from us within 24-48 business hours.");
            window.location.href = "/contactus"; // Refresh page
        } else {
            alert("There was an error sending your message. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to send message. Please check your connection and try again.");
    });
});