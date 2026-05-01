//------------------------------------------------------------------
// auth.js — Registration & Login logic
//------------------------------------------------------------------

// If already logged in, skip to feed
if (isLoggedIn()) {
  window.location.href = "feed.html";
}

//------------------------------------------------------------------
// HELPERS
//------------------------------------------------------------------

function showError(input, errorEl, message) {
  input.classList.add("error");
  input.classList.remove("valid");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}

function clearError(input, errorEl) {
  input.classList.remove("error");
  errorEl.classList.remove("visible");
}

function markValid(input) {
  input.classList.add("valid");
  input.classList.remove("error");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  // 3–30 characters: letters, numbers, underscores only
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

//------------------------------------------------------------------
// PASSWORD TOGGLE
//------------------------------------------------------------------

function setupToggle(toggleBtn, inputEl, eyeIconEl) {
  toggleBtn.addEventListener("click", () => {
    const isPassword = inputEl.type === "password";
    inputEl.type = isPassword ? "text" : "password";
    eyeIconEl.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
}

//------------------------------------------------------------------
// REGISTER PAGE
//------------------------------------------------------------------

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const globalError = document.getElementById("globalError");

  const usernameError = document.getElementById("usernameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmError = document.getElementById("confirmError");

  const strengthWrapper = document.getElementById("strengthWrapper");
  const strengthFill = document.getElementById("strengthFill");
  const strengthLabel = document.getElementById("strengthLabel");

  // Password strength checker
  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    clearError(passwordInput, passwordError);

    if (val.length === 0) {
      strengthWrapper.classList.remove("visible");
      return;
    }

    strengthWrapper.classList.add("visible");
    const score = getPasswordStrength(val);

    const levels = [
      { label: "Very weak", color: "#e74c3c", width: "20%" },
      { label: "Weak", color: "#e67e22", width: "40%" },
      { label: "Fair", color: "#f1c40f", width: "60%" },
      { label: "Strong", color: "#2ecc71", width: "80%" },
      { label: "Very strong", color: "#27ae60", width: "100%" },
    ];

    const level = levels[Math.min(score - 1, 4)] || levels[0];
    strengthFill.style.width = level.width;
    strengthFill.style.backgroundColor = level.color;
    strengthLabel.textContent = level.label;
  });

  // Setup password toggles
  setupToggle(
    document.getElementById("togglePassword"),
    passwordInput,
    document.getElementById("eyeIcon")
  );
  setupToggle(
    document.getElementById("toggleConfirm"),
    confirmInput,
    document.getElementById("eyeIconConfirm")
  );

  // Live validation on blur
  usernameInput.addEventListener("blur", () => {
    const val = usernameInput.value.trim();
    if (!val) {
      showError(usernameInput, usernameError, "Please enter a username.");
    } else if (!isValidUsername(val)) {
      showError(usernameInput, usernameError, "3–30 characters. Letters, numbers, and underscores only.");
    } else {
      clearError(usernameInput, usernameError);
      markValid(usernameInput);
    }
  });

  emailInput.addEventListener("blur", () => {
    const val = emailInput.value.trim();
    if (!val) {
      showError(emailInput, emailError, "Please enter your email address.");
    } else if (!isValidEmail(val)) {
      showError(emailInput, emailError, "Please enter a valid email address.");
    } else {
      clearError(emailInput, emailError);
      markValid(emailInput);
    }
  });

  passwordInput.addEventListener("blur", () => {
    const val = passwordInput.value;
    if (!val) {
      showError(passwordInput, passwordError, "Please enter a password.");
    } else if (val.length < 8) {
      showError(passwordInput, passwordError, "Password must be at least 8 characters.");
    } else {
      clearError(passwordInput, passwordError);
      markValid(passwordInput);
    }
  });

  confirmInput.addEventListener("blur", () => {
    const val = confirmInput.value;
    if (!val) {
      showError(confirmInput, confirmError, "Please confirm your password.");
    } else if (val !== passwordInput.value) {
      showError(confirmInput, confirmError, "Passwords do not match.");
    } else {
      clearError(confirmInput, confirmError);
      markValid(confirmInput);
    }
  });

  // Form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    globalError.classList.remove("visible");

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    let valid = true;

    if (!username) {
      showError(usernameInput, usernameError, "Please enter a username.");
      valid = false;
    } else if (!isValidUsername(username)) {
      showError(usernameInput, usernameError, "3–30 characters. Letters, numbers, and underscores only.");
      valid = false;
    }

    if (!email) {
      showError(emailInput, emailError, "Please enter your email address.");
      valid = false;
    } else if (!isValidEmail(email)) {
      showError(emailInput, emailError, "Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      showError(passwordInput, passwordError, "Please enter a password.");
      valid = false;
    } else if (password.length < 8) {
      showError(passwordInput, passwordError, "Password must be at least 8 characters.");
      valid = false;
    }

    if (!confirm) {
      showError(confirmInput, confirmError, "Please confirm your password.");
      valid = false;
    } else if (confirm !== password) {
      showError(confirmInput, confirmError, "Passwords do not match.");
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const result = await response.json();

      if (!result.success) {
        globalError.textContent = result.error;
        globalError.classList.add("visible");
        return;
      }

      // Success — redirect to login
      window.location.href = "login.html";
    } catch (error) {
      globalError.textContent = 'Network error. Please try again.';
      globalError.classList.add("visible");
    }
  });
  window.location.href = "login.html";
});
}

// ---------------------------------------------------------------
// LOGIN PAGE
// ---------------------------------------------------------------

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const globalError = document.getElementById("globalError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // Setup password toggle
  setupToggle(
    document.getElementById("togglePassword"),
    passwordInput,
    document.getElementById("eyeIcon")
  );

  // Live validation on blur
  emailInput.addEventListener("blur", () => {
    const val = emailInput.value.trim();
    if (!val) {
      showError(emailInput, emailError, "Please enter your email address.");
    } else if (!isValidEmail(val)) {
      showError(emailInput, emailError, "Please enter a valid email address.");
    } else {
      clearError(emailInput, emailError);
      markValid(emailInput);
    }
  });

  passwordInput.addEventListener("blur", () => {
    const val = passwordInput.value;
    if (!val) {
      showError(passwordInput, passwordError, "Please enter your password.");
    } else {
      clearError(passwordInput, passwordError);
      markValid(passwordInput);
    }
  });

  // Form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    globalError.classList.remove("visible");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let valid = true;

    if (!email) {
      showError(emailInput, emailError, "Please enter your email address.");
      valid = false;
    } else if (!isValidEmail(email)) {
      showError(emailInput, emailError, "Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      showError(passwordInput, passwordError, "Please enter your password.");
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!result.success) {
        globalError.textContent = result.error;
        globalError.classList.add("visible");
        return;
      }

      // Store user ID in localStorage for client-side reference
      setCurrentUser(result.user.id);

      // Success — redirect to feed
      window.location.href = "feed.html";
    } catch (error) {
      globalError.textContent = 'Network error. Please try again.';
      globalError.classList.add("visible");
    }
  });
