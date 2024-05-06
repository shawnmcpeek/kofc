// Function to generate FAQ cards
function generateFaqCards() {
  const faqContainer = document.getElementById("faqCards");

  // Loop through faqData array and create cards
  faqData.forEach((faq, index) => {
    // Create the main card container
    const faqCard = document.createElement("div");
    faqCard.classList.add("faq-card");
    faqCard.onclick = function () {
      toggleAnswer(index + 1);
    };

    // Create question paragraph
    const question = document.createElement("p");
    question.innerHTML = `<strong>${faq.question}</strong>`;
    faqCard.appendChild(question);

    // Create answer paragraph
    const answer = document.createElement("div");
    answer.classList.add("answer");
    answer.id = `answer${index + 1}`;
    answer.innerHTML = `<p>${faq.answer}</p>`;
    faqCard.appendChild(answer);

    // Append the card to the faqContainer
    faqContainer.appendChild(faqCard);
  });
}

// Toggle answer visibility
function toggleAnswer(faqId) {
  var answer = document.getElementById("answer" + faqId);
  answer.classList.toggle("show");
}

// Function to toggle navigation menu
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// Function to set active link based on current page
function setActiveLink() {
  var currentLocation = window.location.pathname;
  var links = document.getElementById("myTopnav").getElementsByTagName("a");

  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.href.endsWith(currentLocation)) {
      link.classList.add("active");
    }
  }
}

// Call setActiveLink function when the page loads
window.onload = function () {
  setActiveLink();

  // Additional code to change navbar color to blue
  var links = document.getElementById("myTopnav").getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      // Remove active class from all links
      for (var j = 0; j < links.length; j++) {
        links[j].classList.remove("active");
      }
      // Add active class to clicked link
      this.classList.add("active");
    });
  }

  // Generate FAQ cards when the page loads
  generateFaqCards();

  // Dynamically update copyright year
  document.getElementById("copyright-year").textContent =
    new Date().getFullYear();
};
