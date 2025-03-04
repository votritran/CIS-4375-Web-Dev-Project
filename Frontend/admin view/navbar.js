function updateNavbar() {
    const authSection = document.getElementById("auth-section");
    const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

    if (isAdminLoggedIn) {
        authSection.innerHTML = `
            <select id="adminMenu">
                <option selected disabled>⚙️</option>
                <option value="logout">Sign Out</option>
            </select>
        `;

        document.getElementById("adminMenu").addEventListener("change", function(event) {
            if (event.target.value === "logout") {
                localStorage.removeItem("isAdminLoggedIn");
                window.location.href = "../user%20view/login.html"; 
            }
        });
    } else {
        authSection.innerHTML = `<a href="login.html" id="login-text">Log in</a>`;
    }
}


document.addEventListener("DOMContentLoaded", updateNavbar);
