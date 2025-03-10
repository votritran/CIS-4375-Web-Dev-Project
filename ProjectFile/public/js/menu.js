// menu.js
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const menuContainers = document.querySelectorAll('.menu-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetCategory = tab.getAttribute('data-tab');

            // Remove active class from all tabs and hide all menu containers
            tabs.forEach(tab => tab.classList.remove('active'));
            menuContainers.forEach(container => container.classList.remove('active'));

            // Add active class to clicked tab and show the corresponding menu container
            tab.classList.add('active');
            document.getElementById(targetCategory).classList.add('active');
        });
    });

    // Set the first tab as active and show its content by default
    if (tabs.length > 0) {
        tabs[0].classList.add('active');
        menuContainers[0].classList.add('active');
    }
});
