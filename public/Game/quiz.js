

const questionText = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-container"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const progressBarFull = document.getElementById("progressBarFull");
const timerDisplay = document.querySelector(".time-duration");
const feedbackMessage = document.getElementById("feedback-message");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const clickSound = document.getElementById("clickSound");

let questions = [];
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timer = null;
let timeLeft = 15;

const QUESTION_BONUS = 10;
const queryParams = new URLSearchParams(window.location.search);
let MAX_QUESTIONS = parseInt(queryParams.get("questions")) || 10;
let reviewLog = [];

function playSound(audioElement) {
  if (!audioElement) return;
  try {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log("Audio play failed:", e));
  } catch (e) {
    console.error("Audio error:", e);
  }
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

const user = localStorage.getItem("quizAppUserName");
if (!user) {
  alert("Please sign in to play the quiz.");
  window.location.href = "../sigin/signin.html";
}

// Fetch questions from API
fetch(`/api/trivia?amount=${MAX_QUESTIONS}&type=multiple`)
  .then(res => {
    if (!res.ok) throw new Error('Trivia API failed');
    return res.json();
  })
  .then(data => {
    questions = data.map(q => {
      const answers = [...q.incorrect_answers, q.correct_answer];
      const shuffled = answers.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(q.correct_answer) + 1;

      return {
        question: decodeHTML(q.question),
        answer: correctIndex,
        choice1: decodeHTML(shuffled[0]),
        choice2: decodeHTML(shuffled[1]),
        choice3: decodeHTML(shuffled[2]),
        choice4: decodeHTML(shuffled[3])
      };
    });
    startGame();
  })
  .catch(error => {
    alert("Failed to load quiz questions.");
    console.error(error);
  });

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function startGame() {
  questionCounter = 0;
  score = 0;
  reviewLog = [];
  availableQuestions = [...questions];
  scoreText.innerText = score;
  // Removed renderProgressBoxes
  getNewQuestion();
}

function getNewQuestion() {
  feedbackMessage.innerText = ""; // Clear feedback
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    saveResults();
    return;
  }

  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const qIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[qIndex];
  questionText.innerText = currentQuestion.question;

  choices.forEach(choice => {
    const number = choice.querySelector(".choice-text").dataset["number"];
    choice.querySelector(".choice-text").innerText = currentQuestion["choice" + number];
    choice.classList.remove("correct", "incorrect"); // reset any styling
  });

  availableQuestions.splice(qIndex, 1);
  acceptingAnswers = true;
  resetTimer();
  startTimer();
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 15;
  if (timerDisplay) timerDisplay.textContent = `${timeLeft}s`;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    if (timerDisplay) timerDisplay.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      acceptingAnswers = false;
      playSound(wrongSound);
      // Show feedback for time out
      feedbackMessage.innerHTML = `<span style="color:#e74c3c; font-weight:600;">Time's up! Correct answer: ${currentQuestion["choice" + currentQuestion.answer]}</span>`;
      setTimeout(getNewQuestion, 1500);
    }
  }, 1000);
}

function saveResults() {
  const name = localStorage.getItem("quizAppUserName") || "Anonymous";
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");

  const percentage = MAX_QUESTIONS > 0
    ? Math.round((score / (MAX_QUESTIONS * QUESTION_BONUS)) * 100)
    : 0;

  history.push({
    date: new Date().toISOString(),
    score: score,
    total: MAX_QUESTIONS,
    percentage: percentage
  });

  localStorage.setItem("quizHistory", JSON.stringify(history));
  localStorage.setItem("quizReview", JSON.stringify(reviewLog));

  fetch('/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  }).finally(() => {
    window.location.href = `../Results/results.html?score=${score}&total=${MAX_QUESTIONS}`;
  });
}

choices.forEach(choice => {
  choice.addEventListener("click", () => {
    if (!acceptingAnswers) return;

    playSound(clickSound);
    acceptingAnswers = false;
    clearInterval(timer);

    const selectedChoice = choice;
    const selectedAnswer = selectedChoice.querySelector(".choice-text").dataset["number"];
    const isCorrect = selectedAnswer == currentQuestion.answer;

    reviewLog.push({
      question: currentQuestion,
      chosen: parseInt(selectedAnswer),
      correct: currentQuestion.answer,
      explanation: currentQuestion.explanation || null
    });

    selectedChoice.classList.add(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      incrementScore(QUESTION_BONUS);
      playSound(correctSound);
      feedbackMessage.innerHTML = `<span style="color:#2ecc71;">Correct!</span>`;
    } else {
      playSound(wrongSound);
      const correctAnswerText = currentQuestion["choice" + currentQuestion.answer];
      feedbackMessage.innerHTML = `<span style="color:#e74c3c;">Incorrect! Correct answer: ${correctAnswerText}</span>`;
    }

    setTimeout(() => {
      selectedChoice.classList.remove("correct", "incorrect");
      getNewQuestion();
    }, 1500);
  });
});

function incrementScore(num) {
  score += num;
  if (scoreText) scoreText.innerText = score;
}

function toggleMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

