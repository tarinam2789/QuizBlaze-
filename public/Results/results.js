

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("quizAppUserName") || "Guest";
  const urlParams = new URLSearchParams(window.location.search);
  
 
  const currentUserEl = document.getElementById("currentUser");
  const scoreEl = document.getElementById("score");
  const totalEl = document.getElementById("total");
  const percentageEl = document.getElementById("percentageDisplay");
  const resultDateEl = document.getElementById("resultDate");
  const feedbackEl = document.getElementById("feedback");
  const progressCircle = document.getElementById("progressCircle");


  let score = parseInt(urlParams.get("score"));
  let total = parseInt(urlParams.get("total"));

  if (isNaN(score) || isNaN(total)) {
    const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    const last = history[history.length - 1];
    if (last) {
      score = last.score;
      total = last.total;
    } else {
      score = 0;
      total = 10;
    }
  }


  const correctCount = score / 10;
  const percentage = total > 0 ? Math.round((score / (total * 10)) * 100) : 0;

  
  currentUserEl.textContent = user;
  scoreEl.textContent = correctCount;
  totalEl.textContent = total;
  percentageEl.textContent = percentage + "%";
  resultDateEl.textContent = new Date().toLocaleDateString();

  setTimeout(() => {
    progressCircle.style.background = `conic-gradient(var(--clr-accent) 0deg, var(--clr-accent) ${percentage * 3.6}deg, #e0e0e0 ${percentage * 3.6}deg 360deg)`;
    progressCircle.setAttribute("aria-valuenow", percentage);
  }, 300);

  
  const feedbackData = getFeedback(percentage);
  feedbackEl.textContent = feedbackData.text;
  feedbackEl.style.color = feedbackData.color;


  if (percentage >= 80) {
    celebrate();
  }


  if (score === 0 && percentage === 0) {
    feedbackEl.textContent = "No results to show. Try taking the quiz!";
  }
});

function getFeedback(percentage) {
  if (percentage >= 90) {
    return { text: "👏 Fantastic! Your knowledge shines bright!", color: "var(--clr-feedback-high)" };
  } else if (percentage >= 75) {
    return { text: "🎉 Awesome! You’ve got this down cold!", color: "var(--clr-feedback-mid)" };
  } else if (percentage >= 50) {
    return { text: "👍 Good effort! You're getting there!", color: "var(--clr-feedback-low)" };
  } else {
    return { text: "🌱 Every step counts—keep going and you'll get there!", color: "var(--clr-feedback-fail)" };
  }
}

function celebrate() {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    colors: ["#ff6f91", "#7f7afc", "#5a4fcf", "#ffc107"],
  });
}

