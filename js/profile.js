initStorage();
if (!isLoggedIn()) window.location.href = "login.html";

const currentUser = getCurrentUser();

const params = new URLSearchParams(window.location.search);
let targetUserId = params.get("id") || currentUser.id;

let targetUser = getUserById(targetUserId);

// ---------------------------------------------------------------
// NAVBAR
// ---------------------------------------------------------------

document.getElementById("navUsername").textContent = currentUser.username;
const navAvatar = document.getElementById("navAvatar");
navAvatar.src = currentUser.profilePicture
    ? currentUser.profilePicture
    : `https://ui-avatars.com/api/?name=${currentUser.username}&background=${getAvatarColor(currentUser.id)}&color=fff`;

const navUserProfile = document.getElementById("navUserProfile");
navUserProfile.style.cursor = "pointer";
navUserProfile.addEventListener("click", () => {
    window.location.href = `profile.html?id=${currentUser.id}`;
});

document.getElementById("navLogout").addEventListener("click", () => {
    logoutUser();
    window.location.href = "login.html";
});

// Initialize theme
initTheme();

// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
    toggleTheme();
});

// ---------------------------------------------------------------
// DISPLAY PROFILE
// ---------------------------------------------------------------

function displayUser() {
    if (!targetUser) {
        document.querySelector(".profile-container").innerHTML =
            "<p style='text-align:center;color:#999;padding:40px;'>User not found.</p>";
        return;
    }

    // Profile picture
    const profilePic = document.getElementById("profilePic");
    profilePic.src = targetUser.profilePicture
        ? targetUser.profilePicture
        : `https://ui-avatars.com/api/?name=${targetUser.username}&background=${getAvatarColor(targetUser.id)}&color=fff`;

    // Username, bio, stats
    document.getElementById("username").textContent = targetUser.username;
    document.getElementById("bio").textContent = targetUser.bio || "No bio yet.";
    document.getElementById("followersCount").textContent = targetUser.followers.length;
    document.getElementById("followingCount").textContent = targetUser.following.length;

    const followBtn = document.getElementById("followBtn");
    const editBtn = document.getElementById("editProfileBtn");

    // Own profile
    if (currentUser.id === targetUser.id) {
        followBtn.style.display = "none";
        editBtn.style.display = "inline-block";
    } else {
        // Another user's profile
        editBtn.style.display = "none";
        followBtn.style.display = "inline-block";

        const alreadyFollowing = isFollowing(currentUser.id, targetUser.id);
        followBtn.textContent = alreadyFollowing ? "Unfollow" : "Follow";
        followBtn.style.backgroundColor = alreadyFollowing ? "var(--text-secondary)" : "";

        // Remove old listeners by cloning
        const newFollowBtn = followBtn.cloneNode(true);
        followBtn.parentNode.replaceChild(newFollowBtn, followBtn);

        newFollowBtn.addEventListener("click", () => {
            const result = isFollowing(currentUser.id, targetUser.id)
                ? unfollowUser(currentUser.id, targetUser.id)
                : followUser(currentUser.id, targetUser.id);

            if (!result.success) { alert(result.error); return; }
            refreshProfile();
        });
    }

    renderUserPosts();
}

// =============================================
// INLINE EDIT FORM
// =============================================

const editFormSection = document.getElementById("editFormSection");
const editUsernameInput = document.getElementById("editUsername");
const editBioInput = document.getElementById("editBio");
const editPicInput = document.getElementById("editProfilePic");
const editUsernameError = document.getElementById("editUsernameError");
const editPicError = document.getElementById("editPicError");
const editBtn = document.getElementById("editProfileBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");

// Open edit form — pre-fill with current values
editBtn.addEventListener("click", () => {
    editUsernameInput.value = targetUser.username;
    editBioInput.value = targetUser.bio || "";
    editPicInput.value = targetUser.profilePicture || "";
    editUsernameError.classList.remove("visible");
    editPicError.classList.remove("visible");
    editFormSection.classList.add("open");
    editFormSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// Cancel — close form
cancelEditBtn.addEventListener("click", () => {
    editFormSection.classList.remove("open");
});

// Save changes
saveProfileBtn.addEventListener("click", () => {
    const newUsername = editUsernameInput.value.trim();
    const newBio = editBioInput.value.trim();
    const newPic = editPicInput.value.trim();

    let valid = true;

    // Validate username
    if (!newUsername) {
        editUsernameError.textContent = "Username cannot be empty.";
        editUsernameError.classList.add("visible");
        valid = false;
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(newUsername)) {
        editUsernameError.textContent = "3–30 characters. Letters, numbers, underscores only.";
        editUsernameError.classList.add("visible");
        valid = false;
    } else {
        const existing = getUserByUsername(newUsername);
        if (existing && existing.id !== targetUser.id) {
            editUsernameError.textContent = "This username is already taken.";
            editUsernameError.classList.add("visible");
            valid = false;
        } else {
            editUsernameError.classList.remove("visible");
        }
    }

    // Validate profile picture URL (optional)
    if (newPic && !newPic.startsWith("http")) {
        editPicError.textContent = "Please enter a valid URL starting with http.";
        editPicError.classList.add("visible");
        valid = false;
    } else {
        editPicError.classList.remove("visible");
    }

    if (!valid) return;

    const result = updateUserProfile(targetUser.id, {
        username: newUsername,
        bio: newBio,
        profilePicture: newPic,
    });

    if (!result.success) {
        editUsernameError.textContent = result.error;
        editUsernameError.classList.add("visible");
        return;
    }

    // Close form and refresh
    editFormSection.classList.remove("open");
    refreshProfile();

    // Update navbar if it's the current user
    if (currentUser.id === targetUser.id) {
        const updatedCurrentUser = getCurrentUser();
        document.getElementById("navUsername").textContent = updatedCurrentUser.username;
        const navAvatar = document.getElementById("navAvatar");
        navAvatar.src = updatedCurrentUser.profilePicture
            ? updatedCurrentUser.profilePicture
            : `https://ui-avatars.com/api/?name=${updatedCurrentUser.username}&background=${getAvatarColor(updatedCurrentUser.id)}&color=fff`;
    }

    // Show success message
    alert("Profile updated successfully!");
});

// ---------------------------------------------------------------
// USER POSTS
// ---------------------------------------------------------------

function renderUserPosts() {
    const postsContainer = document.getElementById("userPosts");
    postsContainer.innerHTML = "";

    const posts = getPostsByUser(targetUser.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (posts.length === 0) {
        postsContainer.innerHTML = "<p>No posts yet.</p>";
        return;
    }

    posts.forEach((post) => {
        const postCard = document.createElement("div");
        postCard.className = "post-card";
        postCard.style.cursor = "pointer";
        postCard.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `post.html?id=${post.id}`;
        });

        const content = document.createElement("p");
        content.textContent = post.content;
        content.style.pointerEvents = "none"; // Prevent content from intercepting clicks

        const meta = document.createElement("div");
        meta.className = "post-meta";
        meta.textContent = `${formatTimestamp(post.timestamp)} • ${post.likes.length} ${post.likes.length === 1 ? "like" : "likes"} • ${post.comments.length} ${post.comments.length === 1 ? "comment" : "comments"}`;
        meta.style.pointerEvents = "none"; // Prevent meta from intercepting clicks

        postCard.appendChild(content);
        postCard.appendChild(meta);
        postsContainer.appendChild(postCard);
    });
}

// ---------------------------------------------------------------
// REFRESH
// ---------------------------------------------------------------

function refreshProfile() {
    targetUser = getUserById(targetUserId);
    if (!targetUser) return;
    displayUser();
}

// ---------------------------------------------------------------
// BACK BUTTON
// ---------------------------------------------------------------

document.getElementById("backToFeedBtn").addEventListener("click", () => {
    window.location.href = "feed.html";
});

// ---------------------------------------------------------------
// INIT
// ---------------------------------------------------------------

displayUser();