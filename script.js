// Fernando McKenzie Portfolio - Interactive JavaScript
// Author: SirCodeX
// Version: 1.0

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all features
  initializeNavigation();
  initializeAnimations();
  initializeForms();
  initializeMobileMenu();
  initializeScrollEffects();
  initializePerformanceOptimizations();
  initializeProfileImage();

  // Clear ServiceWorker cache if it exists
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });

    // Clear caches
    if ("caches" in window) {
      caches.keys().then(function (names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
  }

  console.log("Portfolio loaded successfully! Cache cleared.");
});

// Profile Image Loading
function initializeProfileImage() {
  const profileImg = document.getElementById("profile-img");
  const fallback = document.getElementById("profile-fallback");

  if (profileImg) {
    console.log("🖼️ Attempting to load profile image:", profileImg.src);

    profileImg.onload = function () {
      console.log("✅ Profile image loaded successfully!");
      profileImg.style.display = "block";
      fallback.style.display = "none";
    };

    profileImg.onerror = function () {
      console.error("❌ Profile image failed to load:", profileImg.src);
      console.log("🔄 Trying alternative image paths...");

      // Try different paths
      const alternatives = [
        "assets/images/profl.PNG",
        "./assets/images/profl.PNG",
        "/assets/images/profl.PNG",
      ];

      let currentIndex = alternatives.indexOf(
        profileImg.src.split("?")[0].split("/").slice(-3).join("/")
      );
      if (currentIndex < alternatives.length - 1) {
        profileImg.src = alternatives[currentIndex + 1] + "?v=" + Date.now();
      } else {
        console.log("📝 All image paths failed, showing fallback");
        profileImg.style.display = "none";
        fallback.style.display = "flex";
      }
    };

    // Force reload if needed
    if (profileImg.complete && profileImg.naturalHeight === 0) {
      profileImg.src = profileImg.src + "?v=" + Date.now();
    }
  }
}

// Navigation Features
function initializeNavigation() {
  const nav = document.querySelector("nav");
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  // Throttled navbar scroll effect
  let navTicking = false;
  window.addEventListener("scroll", () => {
    if (!navTicking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 100) {
          nav.classList.add("scrolled");
        } else {
          nav.classList.remove("scrolled");
        }
        navTicking = false;
      });
      navTicking = true;
    }
  });

  // Smooth scrolling for navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Update active nav link
        updateActiveNavLink(link);
      }
    });
  });

  // Throttled active nav link updates
  let navUpdateTicking = false;
  window.addEventListener("scroll", () => {
    if (!navUpdateTicking) {
      requestAnimationFrame(() => {
        updateActiveNavLinkOnScroll();
        navUpdateTicking = false;
      });
      navUpdateTicking = true;
    }
  });
}

function updateActiveNavLink(activeLink) {
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("text-blue-600", "font-semibold");
    link.classList.add("text-gray-600");
  });
  activeLink.classList.remove("text-gray-600");
  activeLink.classList.add("text-blue-600", "font-semibold");
}

function updateActiveNavLinkOnScroll() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
      if (activeLink) {
        updateActiveNavLink(activeLink);
      }
    }
  });
}

// Animation System
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // Animate skill bars when they come into view
        if (entry.target.classList.contains("skill-progress")) {
          animateSkillBar(entry.target);
        }

        // Animate counters
        if (entry.target.classList.contains("counter")) {
          animateCounter(entry.target);
        }
      }
    });
  }, observerOptions);

  // Observe elements for animations
  document
    .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right")
    .forEach((el) => {
      observer.observe(el);
    });
}

function animateSkillBar(skillBar) {
  const targetWidth = skillBar.style.width || "0%";
  skillBar.style.width = "0%";

  setTimeout(() => {
    skillBar.style.width = targetWidth;
  }, 200);
}

function animateCounter(counter) {
  const target = parseInt(counter.textContent);
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    counter.textContent = Math.floor(current);
  }, 16);
}

// Form Handling
function initializeForms() {
  const contactForm = document.querySelector("#professional form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm);
  }

  // Add form input enhancements
  const formInputs = document.querySelectorAll("input, textarea");
  formInputs.forEach((input) => {
    input.classList.add("form-input");

    // Add floating label effect
    input.addEventListener("focus", () => {
      input.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        input.parentElement.classList.remove("focused");
      }
    });
  });
}

function handleContactForm(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const submitButton = e.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;

  // Show loading state
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;
  submitButton.classList.add("loading");

  // Simulate form submission (replace with actual endpoint)
  setTimeout(() => {
    // Success feedback
    showNotification("Message sent successfully!", "success");
    e.target.reset();

    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    submitButton.classList.remove("loading");

    // Track form submission
    trackEvent("contact_form_submit", {
      form_type: "main_contact",
    });
  }, 2000);
}

// Mobile Menu
function initializeMobileMenu() {
  const mobileMenuButton = document.querySelector(".md\\:hidden button");
  const nav = document.querySelector("nav");

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", toggleMobileMenu);
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function toggleMobileMenu() {
  const nav = document.querySelector("nav");
  const mobileMenu =
    document.querySelector(".mobile-menu") || createMobileMenu();

  mobileMenu.classList.toggle("active");
}

function createMobileMenu() {
  const nav = document.querySelector("nav .container");
  const mobileMenu = document.createElement("div");
  mobileMenu.className =
    "mobile-menu fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 md:hidden";

  const menuContent = `
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <span class="text-lg font-bold">Menu</span>
                <button class="text-gray-600" onclick="closeMobileMenu()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <a href="#hero" class="block text-gray-600 hover:text-blue-600 transition-colors">Home</a>
                <a href="#blog" class="block text-gray-600 hover:text-blue-600 transition-colors">Blog</a>
                <a href="#ml-lab" class="block text-gray-600 hover:text-blue-600 transition-colors">ML Lab</a>
                <a href="#supply-chain" class="block text-gray-600 hover:text-blue-600 transition-colors">Supply Chain</a>
                <a href="#professional" class="block text-gray-600 hover:text-blue-600 transition-colors">Professional</a>
            </div>
        </div>
    `;

  mobileMenu.innerHTML = menuContent;
  document.body.appendChild(mobileMenu);

  return mobileMenu;
}

function closeMobileMenu() {
  const mobileMenu = document.querySelector(".mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.remove("active");
  }
}

// Scroll Effects
function initializeScrollEffects() {
  // Throttled parallax effect for hero section (improved performance)
  let ticking = false;
  const parallaxHandler = () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector("#hero");
    if (parallax && scrolled < window.innerHeight) {
      const speed = scrolled * 0.3; // Reduced intensity
      parallax.style.transform = `translateY(${speed}px)`;
    }
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(parallaxHandler);
      ticking = true;
    }
  });

  // Progress indicator
  createScrollProgressIndicator();

  // Back to top button
  createBackToTopButton();
}

function createScrollProgressIndicator() {
  const progressBar = document.createElement("div");
  progressBar.className =
    "fixed top-0 left-0 w-full h-1 bg-blue-600 z-50 transition-all duration-300";
  progressBar.style.width = "0%";
  progressBar.style.transformOrigin = "left";
  document.body.appendChild(progressBar);

  // Throttled progress bar update
  let progressTicking = false;
  window.addEventListener("scroll", () => {
    if (!progressTicking) {
      requestAnimationFrame(() => {
        const scrolled =
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
          100;
        progressBar.style.width = `${Math.min(scrolled, 100)}%`;
        progressTicking = false;
      });
      progressTicking = true;
    }
  });
}

function createBackToTopButton() {
  const backToTop = document.createElement("button");
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.className =
    "fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 opacity-0 pointer-events-none";
  backToTop.setAttribute("aria-label", "Back to top");

  document.body.appendChild(backToTop);

  // Throttled back to top button visibility
  let backToTopTicking = false;
  window.addEventListener("scroll", () => {
    if (!backToTopTicking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 500) {
          backToTop.style.opacity = "1";
          backToTop.style.pointerEvents = "auto";
        } else {
          backToTop.style.opacity = "0";
          backToTop.style.pointerEvents = "none";
        }
        backToTopTicking = false;
      });
      backToTopTicking = true;
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    trackEvent("back_to_top_click");
  });
}

// Performance Optimizations
function initializePerformanceOptimizations() {
  // Lazy loading for images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("loading");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // Optimized scroll handler - removed unnecessary debouncing
  // Main scroll events are already optimized with requestAnimationFrame
}

// Utility Functions
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-6 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
      ? "bg-red-500 text-white"
      : "bg-blue-500 text-white"
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function trackEvent(eventName, parameters = {}) {
  // Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, parameters);
  }

  // Console log for development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    console.log("Event tracked:", eventName, parameters);
  }
}

// Error Handling
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error);
  trackEvent("javascript_error", {
    error_message: e.message,
    error_filename: e.filename,
    error_line: e.lineno,
  });
});

// Service Worker Registration (for PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
