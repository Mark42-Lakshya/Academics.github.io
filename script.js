
/* =====================================
   1. STARFIELD SIMULATION
===================================== */

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let width = 0;
let height = 0;

const mouse = {
    x: null,
    y: null,
    radius: 120
};

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


// CREATE STAR OBJECTS

function createStars() {

    stars = [];

    // Number of stars depends on screen area
    const numberOfStars = Math.min(
        350,
        Math.max(90, Math.floor(width * height / 4500))
    );

    for (let i = 0; i < numberOfStars; i++) {

        stars.push({

            x: Math.random() * width,
            y: Math.random() * height,

            radius: Math.random() * 1.5 + 0.3,

            opacity: Math.random() * 0.7 + 0.2,

            twinkleSpeed: Math.random() * 0.015 + 0.003,

            twinkleDirection: Math.random() < 0.5 ? 1 : -1,

            speed: Math.random() * 0.15 + 0.025

        });

    }

}


// RESIZE CANVAS

function resizeCanvas() {

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// MOUSE INTERACTION

window.addEventListener("mousemove", function(event) {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

});

window.addEventListener("mouseout", function(event) {

    if (!event.relatedTarget) {
        mouse.x = null;
        mouse.y = null;
    }

});

window.addEventListener("touchstart", function() {

    // Do not require mouse interaction on touch devices
    mouse.x = null;
    mouse.y = null;

}, { passive: true });


// DRAW STARS

function drawStars() {

    ctx.clearRect(0, 0, width, height);

    stars.forEach(function(star) {

        // TWINKLING EFFECT

        if (!reduceMotion) {

            star.opacity +=
                star.twinkleSpeed * star.twinkleDirection;

            if (star.opacity >= 0.95) {
                star.twinkleDirection = -1;
            }

            if (star.opacity <= 0.2) {
                star.twinkleDirection = 1;
            }

            // SLOW VERTICAL MOVEMENT

            star.y -= star.speed;

            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }

        }

        // MOUSE INTERACTION

        let drawX = star.x;
        let drawY = star.y;

        if (mouse.x !== null && mouse.y !== null) {

            const dx = star.x - mouse.x;
            const dy = star.y - mouse.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius && distance > 0) {

                const force = (mouse.radius - distance) / mouse.radius;

                drawX += (dx / distance) * force * 12;
                drawY += (dy / distance) * force * 12;

            }

        }

        // DRAW INDIVIDUAL STAR

        ctx.beginPath();

        ctx.arc(
            drawX,
            drawY,
            star.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(190, 220, 255, ${star.opacity})`;

        ctx.shadowBlur = 8;
        ctx.shadowColor = "#60a5fa";

        ctx.fill();

    });

    ctx.shadowBlur = 0;

    if (!reduceMotion) {
        requestAnimationFrame(drawStars);
    }

}


// START SIMULATION

drawStars();


/* =====================================
   2. SCROLL REVEAL ANIMATION
===================================== */

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(

    function(entries) {

        entries.forEach(function(entry) {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                // Stop observing once revealed
                revealObserver.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.12
    }

);

revealElements.forEach(function(element) {

    revealObserver.observe(element);

});


/* =====================================
   3. ACTIVE NAVIGATION ICON
===================================== */

const sections = document.querySelectorAll("main section[id]");

const navItems = document.querySelectorAll(".nav-item");

const navObserver = new IntersectionObserver(

    function(entries) {

        entries.forEach(function(entry) {

            if (entry.isIntersecting) {

                const currentId = entry.target.id;

                navItems.forEach(function(link) {

                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === "#" + currentId
                    );

                });

            }

        });

    },

    {
        rootMargin: "-40% 0px -40% 0px"
    }

);

sections.forEach(function(section) {

    navObserver.observe(section);

});


/* =====================================
   4. INTERACTIVE PROJECT CARDS
===================================== */

const detailButtons = document.querySelectorAll(".details-btn");

detailButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const card = button.closest(".project-card");

        const isExpanded = card.classList.toggle("expanded");

        button.textContent = isExpanded
            ? "Hide Details −"
            : "View Details +";

        button.setAttribute(
            "aria-expanded",
            String(isExpanded)
        );

    });

});


/* =====================================
   5. PAUSE ANIMATION WHEN TAB IS HIDDEN
===================================== */

// This avoids unnecessary work when the user
// switches to another browser tab.

let animationRunning = !document.hidden;

document.addEventListener("visibilitychange", function() {

    if (reduceMotion) return;

    if (document.hidden) {

        animationRunning = false;

    } else if (!animationRunning) {

        animationRunning = true;
        drawStars();

    }

});
