document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Contact Page Loaded");

    // Toggle Seen Status
    document.querySelectorAll(".seen-btn").forEach(button => {
        button.addEventListener("click", function() {
            const contactId = this.dataset.id;
            const contactBox = document.querySelector(`.contact-box[data-id='${contactId}']`);

            fetch(`/toggle_seen/${contactId}`, {
                method: "PUT"
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.seen) {
                        contactBox.classList.remove("unseen");
                        contactBox.classList.add("seen");
                        this.innerText = "Mark as Unseen"; // Change button text
                    } else {
                        contactBox.classList.remove("seen");
                        contactBox.classList.add("unseen");
                        this.innerText = "Mark as Seen"; // Change button text
                    }
                } else {
                    alert("Failed to toggle seen status.");
                }
            })
            .catch(error => console.error("Error:", error));
        });
    });

    // Delete Contact Request
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function() {
            const contactId = this.dataset.id;
            const contactBox = document.querySelector(`.contact-box[data-id='${contactId}']`);

            fetch(`/delete_contact/${contactId}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Contact request deleted!");
                    contactBox.remove();
                } else {
                    alert("Failed to delete contact request.");
                }
            })
            .catch(error => console.error("Error:", error));
        });
    });
});
