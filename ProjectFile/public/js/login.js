document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const emailOrUsername = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email_or_username: emailOrUsername, password: password })
    });

    const result = await response.json();
    if (response.ok) {
        if (result.redirect) {
            
            if (result.message && result.redirect === "/forgot-password-email") {
                alert(result.message);
            }

            localStorage.setItem("userRole", result.role);
            window.location.href = result.redirect;
        }
    } else {
        document.getElementById("errorMsg").textContent = result.message;
        document.getElementById("errorMsg").style.display = "block";
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const userRole = localStorage.getItem("userRole");
    if (userRole === "admin") {
        document.getElementById("menu-link").href = "/admin_menu";
        document.getElementById("cakeorder-link").href = "/admin_CakeOrder";
    }
});