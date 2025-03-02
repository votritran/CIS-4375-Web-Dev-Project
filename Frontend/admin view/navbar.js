function updateNavbar() {
    const authSection = document.getElementById("auth-section");
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    const isLoginPage = window.location.pathname.includes("login.html");

    if (isAdminLoggedIn) {
        authSection.innerHTML = `
            <div class="admin-menu-container">
                <span class="gear-icon">👤</span>
                <select id="adminMenu">
                    <option selected disabled></option>
                    <option value="logout">Log Out</option>
                </select>
            </div>
        `;

        document.getElementById("adminMenu").addEventListener("change", function(event) {
            if (event.target.value === "logout") {
                localStorage.removeItem("isAdminLoggedIn");
                window.location.href = "../user view/login.html"; // Redirect to user login
            }
        });

    } else {
        authSection.innerHTML = isLoginPage 
            ? `<a href="../user view/login.html" id="login-text">Log in</a>` 
            : `<a href="../user view/login.html" id="login-text">Log in</a>`;
    }
}

    // Run updateNavbar on page load
    document.addEventListener("DOMContentLoaded", updateNavbar);
  
