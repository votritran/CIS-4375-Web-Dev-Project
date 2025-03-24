// Load confetti animation on page load
window.launchConfetti = function () {
    // Strong confetti burst lower on the screen
    confetti({
        particleCount: 250,   // More confetti for a bigger effect
        spread: 140,         // Wider spread
        startVelocity: 70,   // Shoots out fast
        scalar: 2,           // Bigger confetti
        origin: { x: 0.5, y: 0.7 }, // Starts lower (70% down the screen)
        colors: [
            "#FFB6C1", // Light Pink
            "#FFDAB9", // Peach
            "#FAFAD2", // Light Yellow
            "#B0E0E6", // Soft Blue
            "#E6E6FA", // Lavender
            "#D8BFD8", // Thistle
            "#C3B1E1", // Soft Purple
        ], // Pastel color palette
        shapes: ["circle", "square", "heart"], // Adds hearts along with other shapes
        gravity: 1.2,         // Falls naturally
        ticks: 220,           // Keeps confetti on screen longer
        opacity: 1,           // Ensures no transparency (solid colors)
    });

    // Stop confetti after 5 seconds
    setTimeout(() => {
        confetti.reset();
    }, 5000);
};
