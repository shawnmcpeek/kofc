// Navigation toggle function
document.addEventListener('DOMContentLoaded', function() {
    // Set active link in navigation
    setActiveLink();

    // Mobile Navigation Setup
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.nav-links');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            mobileNav.classList.toggle('responsive');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !mobileNav.contains(event.target)) {
                mobileNav.classList.remove('responsive');
            }
        });
    }

    // Set copyright year
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Initialize counter if on counter page
    const form = document.getElementById("cashCounterForm");
    if (form) {
        initializeCounter();
    }

    // Handle contact form if present
    const contactForm = document.querySelector('form[action="https://api.web3forms.com/submit"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            console.log('Contact form submitted');
        });
    }

    // Setup navigation links
    const navigationLinks = document.querySelectorAll('.nav-links a');
    navigationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('href');
            window.location.href = targetPage;
        });
    });
});

// Initialize counter functionality
function initializeCounter() {
    const countCoinsCheckbox = document.getElementById("countCoins");
    const coinInputs = document.getElementById("coinInputs");
    const calculateButton = document.getElementById("calculateButton");
    const totalResult = document.getElementById("totalResult");

    countCoinsCheckbox.addEventListener("change", () => {
        coinInputs.style.display = countCoinsCheckbox.checked ? "block" : "none";
    });

    calculateButton.addEventListener("click", () => {
        // Retrieve and calculate values from input fields
        const hundreds = parseInt(document.getElementById("hundreds").value, 10) || 0;
        const fifties = parseInt(document.getElementById("fifties").value, 10) || 0;
        const twenties = parseInt(document.getElementById("twenties").value, 10) || 0;
        const tens = parseInt(document.getElementById("tens").value, 10) || 0;
        const fives = parseInt(document.getElementById("fives").value, 10) || 0;
        const twos = parseInt(document.getElementById("twos").value, 10) || 0;
        const ones = parseInt(document.getElementById("ones").value, 10) || 0;
        const checks = parseFloat(document.getElementById("checks").value) || 0;

        if (countCoinsCheckbox.checked) {
            const dollars = parseInt(document.getElementById("dollars").value, 10) || 0;
            const halfDollars = parseInt(document.getElementById("halfDollars").value, 10) || 0;
            const quarters = parseInt(document.getElementById("quarters").value, 10) || 0;
            const dimes = parseInt(document.getElementById("dimes").value, 10) || 0;
            const nickels = parseInt(document.getElementById("nickels").value, 10) || 0;
            const pennies = parseInt(document.getElementById("pennies").value, 10) || 0;

            // Calculate the total value of coins
            const sumTotal =
                hundreds * 100 +
                fifties * 50 +
                twenties * 20 +
                tens * 10 +
                fives * 5 +
                twos * 2 +
                ones * 1 +
                checks +
                dollars * 1 +
                halfDollars * 0.5 +
                quarters * 0.25 +
                dimes * 0.1 +
                nickels * 0.05 +
                pennies * 0.01;

            totalResult.textContent = `Total money counted: $${sumTotal.toFixed(2)}`;
        } else {
            // Calculate the total value of bills and checks
            const sum =
                hundreds * 100 +
                fifties * 50 +
                twenties * 20 +
                tens * 10 +
                fives * 5 +
                twos * 2 +
                ones * 1 +
                checks;

            totalResult.textContent = `Total money counted: $${sum.toFixed(2)}`;
        }
    });
}

// Function to set active link based on current page
function setActiveLink() {
    const currentLocation = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        if (link.href.endsWith(currentLocation)) {
            link.classList.add('active');
        }
    });
}