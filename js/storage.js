//------------------------------------------------------------------
// storage.js — Session, Theme, and Utility Functions
//------------------------------------------------------------------

const KEYS = {
  CURRENT_USER: "sm_current_user",
  THEME: "sm_theme",
};

// Color palette for user avatars
const AVATAR_COLORS = [
  "d4a853", // Golden
  "e74c3c", // Red
  "3498db", // Blue
  "2ecc71", // Green
  "f39c12", // Orange
  "9b59b6", // Purple
  "1abc9c", // Turquoise
  "e67e22", // Dark Orange
  "34495e", // Dark Blue Gray
  "16a085", // Dark Turquoise
];

function getAvatarColor(userId) {
  // Generate a consistent color for each user based on their ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

//------------------------------------------------------------------
// SESSION MANAGEMENT
//------------------------------------------------------------------

function setCurrentUser(userId) {
  localStorage.setItem(KEYS.CURRENT_USER, userId);
}

function getCurrentUserId() {
  return localStorage.getItem(KEYS.CURRENT_USER);
}

function logoutUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

function isLoggedIn() {
  return localStorage.getItem(KEYS.CURRENT_USER) !== null;
}

//------------------------------------------------------------------
// THEME MANAGEMENT
//------------------------------------------------------------------

function setTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'light';
}

function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}

function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
}

//------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

function showConfirmation(message) {
  return new Promise((resolve) => {
    const existing = document.getElementById("confirmOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "confirmOverlay";
    overlay.className = "confirm-overlay";

    const box = document.createElement("div");
    box.className = "confirm-box";

    const text = document.createElement("p");
    text.textContent = message;

    const actions = document.createElement("div");
    actions.className = "confirm-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "confirm-btn cancel";
    cancelBtn.textContent = "Cancel";

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "confirm-btn confirm";
    confirmBtn.textContent = "Delete";

    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });

    confirmBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    box.appendChild(text);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    cancelBtn.focus();
  });
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

