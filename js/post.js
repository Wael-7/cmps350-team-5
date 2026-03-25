// Initialize storage and get current user
initStorage();
const currentUser = isLoggedIn() ? getCurrentUser() : null;
const isUserLoggedIn = currentUser !== null;
if (!isLoggedIn()) window.location.href = "login.html";

// Navbar setup
if (isUserLoggedIn) {
    const userNameEl = document.querySelector(".user-name");
    const avatar = document.querySelector(".user-avatar");

    userNameEl.textContent = currentUser.username;
    if (currentUser.profilePicture) {
        avatar.src = currentUser.profilePicture;
    } else {
        avatar.src =
            `https://ui-avatars.com/api/?name=${currentUser.username}&background=d4a853&color=fff`;
    }

    // Navigation: navbar user profile click leads to profile page
    const userProfileContainer = document.querySelector(".user-profile");
    userProfileContainer.style.cursor = "pointer";
    userProfileContainer.addEventListener("click", () => {
        window.location.href = `profile.html?id=${currentUser.id}`;
    });

    document.querySelector(".btn-logout").addEventListener("click", () => {
        logoutUser();
        window.location.href = "login.html";
    });
} else {
    document.querySelector(".user-name").textContent = "Guest";
    document.querySelector(".btn-logout").textContent = "Login";
    document.querySelector(".btn-logout").addEventListener("click", () => {
        window.location.href = "login.html";
    });
}

// Get post ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');



// ============================================================
// LOAD AND DISPLAY POST
// ============================================================

function loadPost() {
    if (!postId) {
        window.location.href = "feed.html";
        return;
    }

    const post = getPostById(postId);
    if (!post) {
        document.querySelector(".post-container").innerHTML =
            '<p style="text-align: center; color: #999;">Post not found.</p>';
        return;
    }

    const author = getUserById(post.authorId);
    const singlePostDiv = document.getElementById("singlePost");

    // Set author avatar
    const authorAvatar = singlePostDiv.querySelector(".author-avatar");
    if (author && author.profilePicture) {
        authorAvatar.src = author.profilePicture;
    } else {
        authorAvatar.src = `https://ui-avatars.com/api/?name=${author ? author.username : "Unknown"}&background=d4a853&color=fff`;
    }
    authorAvatar.style.cursor = "pointer";
    authorAvatar.addEventListener("click", () => {
        if (author) {
            window.location.href = `profile.html?id=${author.id}`;
        }
    });

    // Set author name
    const authorNameEl = singlePostDiv.querySelector(".author-name");
    authorNameEl.textContent = author ? author.username : "Unknown User";
    authorNameEl.style.cursor = "pointer";
    authorNameEl.addEventListener("click", () => {
        if (author) {
            window.location.href = `profile.html?id=${author.id}`;
        }
    });

    // Set timestamp
    singlePostDiv.querySelector(".post-timestamp").textContent =
        formatTimestamp(post.timestamp);

    // Set post content
    singlePostDiv.querySelector(".post-content").textContent = post.content;

    // Setup like button
    updateLikeButton(post);

    // Setup delete button
    const deleteBtn = singlePostDiv.querySelector("#deletePostBtn");
    if (isUserLoggedIn && post.authorId === currentUser.id) {
        deleteBtn.style.display = "block";
        deleteBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete this post?")) {
                const result = deletePost(post.id, currentUser.id);
                if (result.success) {
                    window.location.href = "feed.html";
                } else {
                    alert("Error: " + result.error);
                }
            }
        });
    }
}

function updateLikeButton(post) {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = likeBtn.querySelector(".like-count");
    const count = post.likes.length;
    likeCount.textContent = `${count} ${count === 1 ? 'like' : 'likes'}`;

    if (isUserLoggedIn && hasLiked(post.id, currentUser.id)) {
        likeBtn.style.opacity = "1";
    } else {
        likeBtn.style.opacity = "0.7";
    }

    likeBtn.disabled = !isUserLoggedIn;

    if (!isUserLoggedIn) {
        likeBtn.addEventListener("click", () => {
            alert("Please login to like posts");
            window.location.href = "login.html";
        });
    } else {
        likeBtn.onclick = () => {
            const result = toggleLike(post.id, currentUser.id);
            if (result.success) {
                const updatedPost = getPostById(post.id);
                updateLikeButton(updatedPost);
            }
        };
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

loadPost();