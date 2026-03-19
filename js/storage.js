//------------------------------------------------------------------
// storage.js — All localStorage read/write logic
//------------------------------------------------------------------

const KEYS = {
  USERS: "sm_users",
  POSTS: "sm_posts",
  CURRENT_USER: "sm_current_user",
};

//------------------------------------------------------------------
// INITIALIZATION
// Sets up empty data structures if localStorage is empty
//------------------------------------------------------------------
 
function initStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.POSTS)) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify([]));
  }
}
 
//------------------------------------------------------------------
// HELPER FUNCTIONS
// Internal utilities for reading and writing to localStorage
//------------------------------------------------------------------
 
function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
}
 
function saveUsers(users) {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}
 
function getPosts() {
  return JSON.parse(localStorage.getItem(KEYS.POSTS)) || [];
}
 
function savePosts(posts) {
  localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
}
 
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

//------------------------------------------------------------------
// SESSION MANAGEMENT
// Tracks which user is currently logged in
//------------------------------------------------------------------
 
function setCurrentUser(userId) {
  localStorage.setItem(KEYS.CURRENT_USER, userId);
}
 
function getCurrentUser() {
  const userId = localStorage.getItem(KEYS.CURRENT_USER);
  if (!userId) return null;
  return getUserById(userId);
}
 
function logoutUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}
 
function isLoggedIn() {
  return localStorage.getItem(KEYS.CURRENT_USER) !== null;
}
 
//------------------------------------------------------------------
// USER FUNCTIONS
//------------------------------------------------------------------
 
// Registering a new user
function registerUser(username, email, password) {
  const users = getUsers();
 
  // Check if email already exists
  const emailExists = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (emailExists) {
    return { success: false, error: "Email is already registered." };
  }
 
  // Checking if username already exists
  const usernameExists = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (usernameExists) {
    return { success: false, error: "Username is already taken." };
  }
 
  const newUser = {
    id: generateId(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: password, 
    bio: "",
    profilePicture: "",
    followers: [],  
    following: [],  
    createdAt: new Date().toISOString(),
  };
 
  users.push(newUser);
  saveUsers(users);
 
  return { success: true, user: newUser };
}
 
// Logging in an existing user
function loginUser(email, password) {
  const users = getUsers();
 
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
 
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }
 
  setCurrentUser(user.id);
  return { success: true, user };
}
 
// Getting a single user by their ID
function getUserById(userId) {
  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
}
 
// Getting a single user by their username
function getUserByUsername(username) {
  const users = getUsers();
  return (
    users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ||
    null
  );
}
 
// Updating a user's profile
function updateUserProfile(userId, updates) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
 
  if (index === -1) {
    return { success: false, error: "User not found." };
  }
 
  // Only allow safe fields to be updated
  const allowedFields = ["username", "bio", "profilePicture"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      users[index][field] = updates[field];
    }
  });
 
  saveUsers(users);
  return { success: true, user: users[index] };
}