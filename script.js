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

// Generate FAQ cards when the page loads
window.onload = generateFaqCards;
