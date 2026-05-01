const currentUserId = getCurrentUserId();
if (!currentUserId) window.location.href = "login.html";

const params = new URLSearchParams(window.location.search);
let targetUserId = params.get("id") || currentUserId;

let currentUser = null;
let targetUser = null;

// ---------------------------------------------------------------
// NAVBAR
// ---------------------------------------------------------------

function setupNavbar() {
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
}

// Initialize page
async function initPage() {
    try {
        const response = await fetch(`/api/users/${currentUserId}`);
        if (!response.ok) throw new Error('Failed to load user');
        currentUser = await response.json();

        // Setup navbar with current user data
        setupNavbar();

        // Now fetch target user
        const targetResponse = await fetch(`/api/users/${targetUserId}`);
        if (!targetResponse.ok) throw new Error('User not found');
        targetUser = await targetResponse.json();

        await displayUser();
    } catch (error) {
        console.error('Failed to initialize page:', error);
        window.location.href = "login.html";
    }
}

initPage();

// ---------------------------------------------------------------
// DISPLAY PROFILE
// ---------------------------------------------------------------

async function displayUser() {
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

        const alreadyFollowing = targetUser.followers.includes(currentUser.id);
        followBtn.textContent = alreadyFollowing ? "Unfollow" : "Follow";
        followBtn.style.backgroundColor = alreadyFollowing ? "var(--text-secondary)" : "";

        // Remove old listeners by cloning
        const newFollowBtn = followBtn.cloneNode(true);
        followBtn.parentNode.replaceChild(newFollowBtn, followBtn);

        newFollowBtn.addEventListener("click", async () => {
            try {
                const isCurrentlyFollowing = targetUser.followers.includes(currentUser.id);
                const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
                const response = await fetch(`/api/users/${targetUser.id}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ followerId: currentUser.id }),
                });
                if (response.ok) {
                    await refreshProfile();
                } else {
                    alert('Failed to update follow status');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }

    await renderUserPosts();
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
saveProfileBtn.addEventListener("click", async () => {
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
    } else if (newUsername !== targetUser.username) {
        // Check if username is taken (only if changed)
        try {
            const checkResponse = await fetch(`/api/users?username=${encodeURIComponent(newUsername)}`);
            if (checkResponse.ok) {
                const existing = await checkResponse.json();
                if (existing && existing.id !== targetUser.id) {
                    editUsernameError.textContent = "This username is already taken.";
                    editUsernameError.classList.add("visible");
                    valid = false;
                } else {
                    editUsernameError.classList.remove("visible");
                }
            }
        } catch (error) {
            console.error('Error checking username:', error);
        }
    } else {
        editUsernameError.classList.remove("visible");
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

    try {
        const response = await fetch(`/api/users/${targetUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: newUsername,
                bio: newBio,
                profilePicture: newPic,
            }),
        });
        const result = await response.json();

        if (!result.success) {
            editUsernameError.textContent = result.error;
            editUsernameError.classList.add("visible");
            return;
        }

        // Close form and refresh
        editFormSection.classList.remove("open");
        await refreshProfile();

        // Show success message
        alert("Profile updated successfully!");
    } catch (error) {
        editUsernameError.textContent = 'Network error. Please try again.';
        editUsernameError.classList.add("visible");
    }
});

// ---------------------------------------------------------------
// USER POSTS
// ---------------------------------------------------------------

async function renderUserPosts() {
    const postsContainer = document.getElementById("userPosts");
    postsContainer.innerHTML = "";

    try {
        const response = await fetch(`/api/posts/user/${targetUser.id}`);
        if (!response.ok) throw new Error('Failed to load posts');
        const posts = await response.json();

        const sortedPosts = posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (sortedPosts.length === 0) {
            postsContainer.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        sortedPosts.forEach((post) => {
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
            content.style.pointerEvents = "none";

            const meta = document.createElement("div");
            meta.className = "post-meta";
            meta.textContent = `${formatTimestamp(post.timestamp)} • ${post.likes.length} ${post.likes.length === 1 ? "like" : "likes"} • ${post.comments.length} ${post.comments.length === 1 ? "comment" : "comments"}`;
            meta.style.pointerEvents = "none";

            postCard.appendChild(content);
            postCard.appendChild(meta);
            postsContainer.appendChild(postCard);
        });
    } catch (error) {
        console.error('Failed to load posts:', error);
        postsContainer.innerHTML = "<p>Failed to load posts. Please refresh.</p>";
    }
}

// ---------------------------------------------------------------
// REFRESH
// ---------------------------------------------------------------

async function refreshProfile() {
    try {
        const response = await fetch(`/api/users/${targetUserId}`);
        if (!response.ok) throw new Error('Failed to load user');
        targetUser = await response.json();
        if (!targetUser) return;
        displayUser();
    } catch (error) {
        console.error('Failed to refresh profile:', error);
    }
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