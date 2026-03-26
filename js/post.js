// ============================================================
// post.js — Single post page logic
// Hive Social Media Platform — CMPS 350
// ============================================================

// Initialize storage and get current user
initStorage();
initTheme();
if (!isLoggedIn()) window.location.href = "login.html";

const currentUser = getCurrentUser();

// ============================================================
// NAVBAR SETUP
// ============================================================

document.querySelector(".user-name").textContent = currentUser.username;
const avatar = document.querySelector(".user-avatar");
avatar.src = currentUser.profilePicture
    ? currentUser.profilePicture
    : `https://ui-avatars.com/api/?name=${currentUser.username}&background=d4a853&color=fff`;

const userProfileContainer = document.querySelector(".user-profile");
userProfileContainer.style.cursor = "pointer";
userProfileContainer.addEventListener("click", () => {
    window.location.href = `profile.html?id=${currentUser.id}`;
});

document.querySelector(".btn-logout").addEventListener("click", () => {
    logoutUser();
    window.location.href = "login.html";
});

// ============================================================
// GET POST ID FROM URL
// ============================================================

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

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
            '<p style="text-align:center; color:#999; margin-top:40px;">Post not found.</p>';
        return;
    }

    const author = getUserById(post.authorId);
    const singlePostDiv = document.getElementById("singlePost");

    // Author avatar
    const authorAvatar = singlePostDiv.querySelector(".author-avatar");
    authorAvatar.src = author && author.profilePicture
        ? author.profilePicture
        : `https://ui-avatars.com/api/?name=${author ? author.username : "Unknown"}&background=d4a853&color=fff`;
    authorAvatar.style.cursor = "pointer";
    authorAvatar.addEventListener("click", () => {
        if (author) window.location.href = `profile.html?id=${author.id}`;
    });

    // Author name
    const authorNameEl = singlePostDiv.querySelector(".author-name");
    authorNameEl.textContent = author ? author.username : "Unknown User";
    authorNameEl.style.cursor = "pointer";
    authorNameEl.addEventListener("click", () => {
        if (author) window.location.href = `profile.html?id=${author.id}`;
    });

    // Timestamp & content
    singlePostDiv.querySelector(".post-timestamp").textContent = formatTimestamp(post.timestamp);
    singlePostDiv.querySelector(".post-content").textContent = post.content;

    // Like button
    updateLikeButton(post);

    // Delete button (only visible to post author)
    const deleteBtn = singlePostDiv.querySelector("#deletePostBtn");
    if (post.authorId === currentUser.id) {
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

    // Load comments
    loadComments();
}

// ============================================================
// LIKE BUTTON
// ============================================================

function updateLikeButton(post) {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = likeBtn.querySelector(".like-count");
    const count = post.likes.length;

    likeCount.textContent = `${count} ${count === 1 ? "like" : "likes"}`;

    // Highlight if already liked
    if (hasLiked(post.id, currentUser.id)) {
        likeBtn.classList.add("liked");
    } else {
        likeBtn.classList.remove("liked");
    }

    likeBtn.onclick = () => {
        const result = toggleLike(post.id, currentUser.id);
        if (result.success) {
            updateLikeButton(getPostById(post.id));
        }
    };
}

// ============================================================
// COMMENTS
// ============================================================

function loadComments() {
    const post = getPostById(postId);
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";

    if (!post.comments || post.comments.length === 0) {
        commentsList.innerHTML = `<li class="no-comments">No comments yet. Be the first to comment!</li>`;
        return;
    }

    post.comments.forEach((comment) => {
        const author = getUserById(comment.authorId);
        const li = document.createElement("li");
        li.className = "comment-item";

        li.innerHTML = `
            <div class="comment-header">
                <img
                    class="comment-avatar"
                    src="${author && author.profilePicture
                        ? author.profilePicture
                        : `https://ui-avatars.com/api/?name=${author ? author.username : "Unknown"}&background=d4a853&color=fff`}"
                    alt="avatar"
                />
                <div class="comment-meta">
                    <span class="comment-author">${author ? author.username : "Unknown"}</span>
                    <span class="comment-timestamp">${formatTimestamp(comment.timestamp)}</span>
                </div>
                ${comment.authorId === currentUser.id
                    ? `<button class="btn-delete-comment" data-comment-id="${comment.id}">🗑️</button>`
                    : ""}
            </div>
            <p class="comment-content">${comment.content}</p>
        `;

        commentsList.appendChild(li);
    });

    // Delete comment buttons
    commentsList.querySelectorAll(".btn-delete-comment").forEach((btn) => {
        btn.addEventListener("click", () => {
            const commentId = btn.dataset.commentId;
            if (confirm("Delete this comment?")) {
                const result = deleteComment(postId, commentId, currentUser.id);
                if (result.success) {
                    loadComments();
                } else {
                    alert("Error: " + result.error);
                }
            }
        });
    });
}

function handleAddComment() {
    const commentInput = document.getElementById("commentInput");
    const content = commentInput.value.trim();

    if (!content) {
        commentInput.focus();
        return;
    }

    const result = addComment(postId, currentUser.id, content);

    if (result.success) {
        commentInput.value = "";
        loadComments();
    } else {
        alert("Error: " + result.error);
    }
}

// Submit comment on button click
document.getElementById("submitComment").addEventListener("click", handleAddComment);

// Also allow Ctrl+Enter to submit
document.getElementById("commentInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
        handleAddComment();
    }
});

// ============================================================
// INIT
// ============================================================

loadPost();