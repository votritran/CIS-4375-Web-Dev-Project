
        // Handle form submission with fetch
        document.getElementById("forgotPasswordForm").addEventListener("submit", async function (event) {
            event.preventDefault();  // Prevent the default form submission behavior
    
            const email = document.getElementById("email").value;
            const newPassword = document.getElementById("newPassword").value;
    
            const response = await fetch("/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, newPassword })  // Send email and new password as JSON
            });
    
            const result = await response.json();
            if (response.ok) {
                alert("Password reset successfully! Redirecting to login...");
                window.location.href = "/login";  // Redirect to login page after success
            } else {
                document.getElementById("errorMsg").textContent = result.message;  // Show error message
                document.getElementById("errorMsg").style.display = "block";
            }
        });
    