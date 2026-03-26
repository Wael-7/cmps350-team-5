// =================================================================
// storage.js — All localStorage read/write logic
// Social Media Platform — CMPS 350
// =================================================================

const KEYS = {
  USERS: "sm_users",
  POSTS: "sm_posts",
  CURRENT_USER: "sm_current_user",
  THEME: "sm_theme",
};

// =================================================================
// INITIALIZATION
// =================================================================

function initStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.POSTS)) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify([]));
  }
}

// =================================================================
// HELPERS
// =================================================================

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

// =================================================================
// SESSION MANAGEMENT
// =================================================================

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

// =================================================================
// THEME MANAGEMENT
// =================================================================

// Call once on every page load to apply saved theme
function initTheme() {
  const saved = localStorage.getItem(KEYS.THEME) || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}

// Toggle between light and dark, persist to localStorage
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(KEYS.THEME, next);
  updateThemeIcon(next);
}

// Update the toggle button icon if it exists on the page
function updateThemeIcon(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  if (theme === "dark") {
    // Moon icon
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
    btn.title = "Switch to light mode";
  } else {
    // Sun icon
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;
    btn.title = "Switch to dark mode";
  }
}

// =================================================================
// USER FUNCTIONS
// =================================================================

function registerUser(username, email, password) {
  const users = getUsers();

  const emailExists = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (emailExists) {
    return { success: false, error: "Email is already registered." };
  }

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

function getUserById(userId) {
  const users = getUsers();
  return users.find((u) => u.id === userId) || null;
}

function getUserByUsername(username) {
  const users = getUsers();
  return (
    users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ||
    null
  );
}

function updateUserProfile(userId, updates) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, error: "User not found." };
  }

  const allowedFields = ["username", "bio", "profilePicture"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      users[index][field] = updates[field];
    }
  });

  saveUsers(users);
  return { success: true, user: users[index] };
}

// =================================================================
// FOLLOW FUNCTIONS
// =================================================================

function followUser(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    return { success: false, error: "You cannot follow yourself." };
  }

  const users = getUsers();
  const currentIndex = users.findIndex((u) => u.id === currentUserId);
  const targetIndex = users.findIndex((u) => u.id === targetUserId);

  if (currentIndex === -1 || targetIndex === -1) {
    return { success: false, error: "User not found." };
  }

  if (users[currentIndex].following.includes(targetUserId)) {
    return { success: false, error: "You are already following this user." };
  }

  users[currentIndex].following.push(targetUserId);
  users[targetIndex].followers.push(currentUserId);

  saveUsers(users);
  return { success: true };
}

function unfollowUser(currentUserId, targetUserId) {
  const users = getUsers();
  const currentIndex = users.findIndex((u) => u.id === currentUserId);
  const targetIndex = users.findIndex((u) => u.id === targetUserId);

  if (currentIndex === -1 || targetIndex === -1) {
    return { success: false, error: "User not found." };
  }

  users[currentIndex].following = users[currentIndex].following.filter(
    (id) => id !== targetUserId
  );
  users[targetIndex].followers = users[targetIndex].followers.filter(
    (id) => id !== currentUserId
  );

  saveUsers(users);
  return { success: true };
}

function isFollowing(currentUserId, targetUserId) {
  const user = getUserById(currentUserId);
  if (!user) return false;
  return user.following.includes(targetUserId);
}

// =================================================================
// POST FUNCTIONS
// =================================================================

function createPost(authorId, content) {
  if (!content || content.trim() === "") {
    return { success: false, error: "Post content cannot be empty." };
  }

  const posts = getPosts();

  const newPost = {
    id: generateId(),
    authorId: authorId,
    content: content.trim(),
    timestamp: new Date().toISOString(),
    likes: [],
    comments: [],
  };

  posts.unshift(newPost);
  savePosts(posts);

  return { success: true, post: newPost };
}

function deletePost(postId, requestingUserId) {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === postId);

  if (index === -1) {
    return { success: false, error: "Post not found." };
  }

  if (posts[index].authorId !== requestingUserId) {
    return { success: false, error: "You can only delete your own posts." };
  }

  posts.splice(index, 1);
  savePosts(posts);

  return { success: true };
}

function getPostById(postId) {
  const posts = getPosts();
  return posts.find((p) => p.id === postId) || null;
}

function getPostsByUser(userId) {
  const posts = getPosts();
  return posts.filter((p) => p.authorId === userId);
}

function getFeedPosts(userId) {
  const user = getUserById(userId);
  if (!user) return [];

  const posts = getPosts();

  return posts
    .filter((p) => user.following.includes(p.authorId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// =================================================================
// LIKE FUNCTIONS
// =================================================================

function toggleLike(postId, userId) {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === postId);

  if (index === -1) {
    return { success: false, error: "Post not found." };
  }

  const alreadyLiked = posts[index].likes.includes(userId);

  if (alreadyLiked) {
    posts[index].likes = posts[index].likes.filter((id) => id !== userId);
  } else {
    posts[index].likes.push(userId);
  }

  savePosts(posts);

  return {
    success: true,
    liked: !alreadyLiked,
    likeCount: posts[index].likes.length,
  };
}

function hasLiked(postId, userId) {
  const post = getPostById(postId);
  if (!post) return false;
  return post.likes.includes(userId);
}

// =================================================================
// COMMENT FUNCTIONS
// =================================================================

function addComment(postId, authorId, content) {
  if (!content || content.trim() === "") {
    return { success: false, error: "Comment cannot be empty." };
  }

  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === postId);

  if (index === -1) {
    return { success: false, error: "Post not found." };
  }

  const newComment = {
    id: generateId(),
    authorId: authorId,
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };

  posts[index].comments.push(newComment);
  savePosts(posts);

  return { success: true, comment: newComment };
}

function deleteComment(postId, commentId, requestingUserId) {
  const posts = getPosts();
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    return { success: false, error: "Post not found." };
  }

  const commentIndex = posts[postIndex].comments.findIndex(
    (c) => c.id === commentId
  );

  if (commentIndex === -1) {
    return { success: false, error: "Comment not found." };
  }

  if (posts[postIndex].comments[commentIndex].authorId !== requestingUserId) {
    return { success: false, error: "You can only delete your own comments." };
  }

  posts[postIndex].comments.splice(commentIndex, 1);
  savePosts(posts);

  return { success: true };
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

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

function clearAllData() {
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.POSTS);
  localStorage.removeItem(KEYS.CURRENT_USER);
  initStorage();
}