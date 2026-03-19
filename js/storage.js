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