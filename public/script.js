

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  const isDark = body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);

  const modeBtn = document.querySelector(".mode-toggle");
  if (modeBtn) {
    modeBtn.textContent = isDark ? "🌙" : "🌞";
    modeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
}


function initDarkMode() {
  const savedMode = localStorage.getItem("darkMode") === "true";
  if (savedMode) {
    document.body.classList.add("dark-mode");
    const modeBtn = document.querySelector(".mode-toggle");
    if (modeBtn) {
      modeBtn.textContent = "🌙";
      modeBtn.setAttribute("aria-label", "Switch to light mode");
    }
  }
}


function playClickSound() {
  const clickSound = document.getElementById("clickSound");
  if (!clickSound) {
    console.warn("click.wav not found in DOM");
    return;
  }
  clickSound.currentTime = 0;
  clickSound.play().catch(e => console.warn("Audio play failed:", e));
}


function addRippleEffect(event) {
  const button = event.currentTarget;
  if (!button) return;

  const ripple = document.createElement("span");
  ripple.classList.add("ripple-effect");

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}


function bindGlobalEffects() {
  const buttons = document.querySelectorAll("button, a.btn");

  buttons.forEach(btn => {
    if (btn.hasAttribute("disabled")) return;

    btn.addEventListener("click", playClickSound);
    btn.addEventListener("click", addRippleEffect);

    btn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        playClickSound();
        addRippleEffect(e);
      }
    });
  });
}

function highlightActiveNav() {
  const links = document.querySelectorAll(".nav-link");
  const path = window.location.pathname;

  links.forEach(link => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active-nav");
    }
  });
}


function initCarousel() {
  const carousel = document.querySelector(".carousel");
  if (carousel && typeof bootstrap !== "undefined" && bootstrap.Carousel) {
    const carouselInstance = new bootstrap.Carousel(carousel, {
      interval: 3000, 
      ride: "carousel",
      wrap: true,
      pause: "hover" 
    });


    carousel.addEventListener("mouseenter", () => {
      carouselInstance.pause();
    });
    
    carousel.addEventListener("mouseleave", () => {
      carouselInstance.cycle();
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  bindGlobalEffects();
  highlightActiveNav();
  initCarousel(); 
});