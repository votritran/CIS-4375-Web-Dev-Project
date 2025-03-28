document.getElementById("changePasswordForm").addEventListener("submit", function(event) {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("error-message");

    // password rules
    const passwordRegex = /^(?=.*\d)(?=.*[\W_]).{8,}$/; 

    if (newPassword !== confirmPassword) {
        event.preventDefault();
        errorMessage.textContent = "Passwords do not match!";
        errorMessage.style.display = "block";
        return;
    }

    if (!passwordRegex.test(newPassword)) {
        event.preventDefault();
        errorMessage.textContent = "Password must be at least 8 characters, contain 1 number, and 1 special character.";
        errorMessage.style.display = "block";
        return;
    }

    errorMessage.style.display = "none";
});