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

//------------------------------------------------------------------
// FOLLOW FUNCTIONS
//------------------------------------------------------------------

// Following a user
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

  // Avoid duplicate follows
  if (users[currentIndex].following.includes(targetUserId)) {
    return { success: false, error: "You are already following this user." };
  }

  users[currentIndex].following.push(targetUserId);
  users[targetIndex].followers.push(currentUserId);

  saveUsers(users);
  return { success: true };
}

// Unfollowing a user
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

// Checking if current user is following target user
function isFollowing(currentUserId, targetUserId) {
  const user = getUserById(currentUserId);
  if (!user) return false;
  return user.following.includes(targetUserId);
}

//------------------------------------------------------------------
// POST FUNCTIONS
//------------------------------------------------------------------

// Create a new post
// Returns: { success: true, post } or { success: false, error: "..." }
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

  posts.unshift(newPost); // Add to the top of the feed
  savePosts(posts);

  return { success: true, post: newPost };
}

// Deleting a post (only the author can delete)
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

// Getting a single post by ID
function getPostById(postId) {
  const posts = getPosts();
  return posts.find((p) => p.id === postId) || null;
}

// Getting all posts by a specific user
function getPostsByUser(userId) {
  const posts = getPosts();
  return posts.filter((p) => p.authorId === userId);
}

// Getting news feed posts for a user (posts from users they follow OR their own posts)
function getFeedPosts(userId) {
  const user = getUserById(userId);
  if (!user) return [];

  const posts = getPosts();

  // Return posts from followed users OR own posts, sorted newest first
  return posts
    .filter((p) => user.following.includes(p.authorId) || p.authorId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

//------------------------------------------------------------------
// LIKE FUNCTIONS
//------------------------------------------------------------------

// Toggle like on a post (like if not liked and unlike if already liked)
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

// Checking if a user has liked a post
function hasLiked(postId, userId) {
  const post = getPostById(postId);
  if (!post) return false;
  return post.likes.includes(userId);
}

//------------------------------------------------------------------
// COMMENT FUNCTIONS
//------------------------------------------------------------------

// Function to add a comment to a post
function addComment(postId, userId, content) {
  const posts = getPosts();  // Get all posts from localStorage
  const post = posts.find(p => p.id === postId);

  if (!post) {
    return { success: false, error: "Post not found." };
  }

  const newComment = {
    id: generateId(),  // Generate unique comment ID
    authorId: userId,
    content: content,
    timestamp: new Date().toISOString(),
  };

  post.comments.push(newComment);  // Add the new comment to the post
  savePosts(posts);  // Save the updated posts array to localStorage

  return { success: true, comment: newComment };
}

// Deleting a comment (only the comment author can delete)
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

//------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------

// Format a timestamp into a readable string (e.g. "March 19, 2026 10:30 AM")
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

// Clear ALL data from localStorage (useful for testing/reset)
function clearAllData() {
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.POSTS);
  localStorage.removeItem(KEYS.CURRENT_USER);
  initStorage();
}

