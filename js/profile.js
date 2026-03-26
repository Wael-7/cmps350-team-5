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

    const followBtn   = document.getElementById("followBtn");
    const editBtn     = document.getElementById("editProfileBtn");

    // Own profile
    if (currentUser.id === targetUser.id) {
        followBtn.style.display  = "none";
        editBtn.style.display    = "inline-block";

        // Remove old listeners by cloning
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);

        newEditBtn.addEventListener("click", () => {
            const updatedUsername = prompt("Update username:", targetUser.username);
            if (updatedUsername === null) return;
            const usernameTrim = updatedUsername.trim();
            if (!usernameTrim) { alert("Username cannot be empty."); return; }

            const existingUser = getUserByUsername(usernameTrim);
            if (existingUser && existingUser.id !== targetUser.id) {
                alert("This username is already taken.");
                return;
            }

            const updatedBio = prompt("Update bio:", targetUser.bio || "");
            if (updatedBio === null) return;

            const updatedPic = prompt("Profile picture URL (leave empty for default):", targetUser.profilePicture || "");
            if (updatedPic === null) return;

            const result = updateUserProfile(targetUser.id, {
                username: usernameTrim,
                bio: updatedBio.trim(),
                profilePicture: updatedPic.trim(),
            });

            if (!result.success) { alert(result.error); return; }
            refreshProfile();
            alert("Profile updated!");
        });

    } else {
        // Another user's profile
        editBtn.style.display   = "none";
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