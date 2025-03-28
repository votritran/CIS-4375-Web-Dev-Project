document.getElementById("forgotPasswordForm").addEventListener("submit", async function (event) {
    event.preventDefault();  

    const email = document.getElementById("email").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMsg = document.getElementById("errorMsg");

    
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match!";
        errorMsg.style.display = "block";
        return;
    }

    // Check if password meets security requirements
    if (!passwordRegex.test(newPassword)) {
        errorMsg.textContent = "Password must be at least 8 characters long, contain 1 number, and 1 special character.";
        errorMsg.style.display = "block";
        return;
    }

    // Proceed with form submission if validation passes
    const response = await fetch("/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, newPassword })  
    });

    const result = await response.json();
    if (response.ok) {
        alert("Password reset successfully! Redirecting to login...");
        window.location.href = "/login";  
    } else {
        errorMsg.textContent = result.message;
        errorMsg.style.display = "block";
    }
});
    