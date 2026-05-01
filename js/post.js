// Check if user is logged in
if (!isLoggedIn()) window.location.href = "login.html";

let currentUser = null;

// Fetch current user data from API
async function initPage() {
    const currentUserId = getCurrentUserId();
    try {
        const response = await fetch(`/api/users/${currentUserId}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        currentUser = await response.json();
        setupNavbar();
        loadPost();
    } catch (error) {
        console.error("Error loading user:", error);
        window.location.href = "login.html";
    }
}

function setupNavbar() {
    document.querySelector(".user-name").textContent = currentUser.username;
    const avatar = document.querySelector(".user-avatar");
    avatar.src = currentUser.profilePicture
        ? currentUser.profilePicture
        : `https://ui-avatars.com/api/?name=${currentUser.username}&background=${getAvatarColor(currentUser.id)}&color=fff`;

    const userProfileContainer = document.querySelector(".user-profile");
    userProfileContainer.style.cursor = "pointer";
    userProfileContainer.addEventListener("click", () => {
        window.location.href = `profile.html?id=${currentUser.id}`;
    });

    document.querySelector(".btn-logout").addEventListener("click", () => {
        logoutUser();
        window.location.href = "login.html";
    });
}

// ---------------------------------------------------------------
// NAVBAR SETUP (handled in initPage)
// ---------------------------------------------------------------

// Initialize theme
initTheme();

// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
    toggleTheme();
});

// ---------------------------------------------------------------
// GET POST ID FROM URL
// ---------------------------------------------------------------

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

// ---------------------------------------------------------------
// LOAD AND DISPLAY POST
// ---------------------------------------------------------------

async function loadPost() {
    if (!postId) {
        window.location.href = "feed.html";
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error("Post not found");
        const post = await response.json();
        const author = post.author;
        const singlePostDiv = document.getElementById("singlePost");

        // Author avatar
        const authorAvatar = singlePostDiv.querySelector(".author-avatar");
        authorAvatar.src = author && author.profilePicture
            ? author.profilePicture
            : `https://ui-avatars.com/api/?name=${author ? author.username : "Unknown"}&background=${author ? getAvatarColor(author.id) : "d4a853"}&color=fff`;
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
            deleteBtn.addEventListener("click", async () => {
                const confirmed = await showConfirmation("Delete this post?");
                if (!confirmed) return;

                try {
                    const deleteResponse = await fetch(`/api/posts/${post.id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ authorId: currentUser.id })
                    });
                    if (!deleteResponse.ok) throw new Error("Failed to delete post");
                    showToast("Post deleted successfully.", "success");
                    window.location.href = `profile.html?id=${currentUser.id}`;
                } catch (error) {
                    showToast("Error: " + error.message, "error");
                }
            });
        }

        // Load comments
        await loadComments(post);
    } catch (error) {
        console.error("Error loading post:", error);
        document.querySelector(".post-container").innerHTML =
            '<p style="text-align:center; color:#999; margin-top:40px;">Post not found.</p>';
    }
}

// ---------------------------------------------------------------
// LIKE BUTTON
// ---------------------------------------------------------------

async function updateLikeButton(post) {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = likeBtn.querySelector(".like-count");
    const count = post.likes ? post.likes.length : 0;

    likeCount.textContent = `${count} ${count === 1 ? "like" : "likes"}`;

    // Highlight if already liked
    const hasLiked = post.likes && post.likes.some(like => like.userId === currentUser.id);
    if (hasLiked) {
        likeBtn.classList.add("liked");
    } else {
        likeBtn.classList.remove("liked");
    }

    likeBtn.onclick = async () => {
        try {
            const response = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.id, postId: post.id })
            });
            if (!response.ok) throw new Error("Failed to toggle like");
            const result = await response.json();
            // Refetch post to get updated like count
            const postResponse = await fetch(`/api/posts/${post.id}`);
            if (postResponse.ok) {
                const updatedPost = await postResponse.json();
                await updateLikeButton(updatedPost);
            }
        } catch (error) {
            showToast("Error: " + error.message, "error");
        }
    };
}

// ---------------------------------------------------------------
// COMMENTS
// ---------------------------------------------------------------

async function loadComments(post) {
    const commentsList = document.getElementById("commentsList");
    commentsList.innerHTML = "";

    try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (!response.ok) throw new Error("Failed to load comments");
        const comments = await response.json();

        if (!comments || comments.length === 0) {
            commentsList.innerHTML = `<li class="no-comments">No comments yet. Be the first to comment!</li>`;
            return;
        }

        comments.forEach((comment) => {
            const author = comment.author;
            const li = document.createElement("li");
            li.className = "comment-item";

            li.innerHTML = `
            <div class="comment-header">
                <img
                    class="comment-avatar"
                    src="${author && author.profilePicture
                    ? author.profilePicture
                    : `https://ui-avatars.com/api/?name=${author ? author.username : "Unknown"}&background=${author ? getAvatarColor(author.id) : "d4a853"}&color=fff`}"
                    alt="avatar"
                />
                <div class="comment-meta">
                    <span class="comment-author">${author ? author.username : "Unknown"}</span>
                    <span class="comment-timestamp">${formatTimestamp(comment.createdAt)}</span>
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
            btn.addEventListener("click", async () => {
                const commentId = btn.dataset.commentId;
                const confirmed = await showConfirmation("Delete this comment?");
                if (!confirmed) return;

                try {
                    const deleteResponse = await fetch(`/api/comments/${commentId}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ authorId: currentUser.id })
                    });
                    if (!deleteResponse.ok) throw new Error("Failed to delete comment");
                    showToast("Comment deleted successfully.", "success");
                    await loadComments(post);
                } catch (error) {
                    showToast("Error: " + error.message, "error");
                }
            });
        });
    } catch (error) {
        console.error("Error loading comments:", error);
        commentsList.innerHTML = `<li class="no-comments">Error loading comments</li>`;
    }
}

async function handleAddComment() {
    const commentInput = document.getElementById("commentInput");
    const content = commentInput.value.trim();

    if (!content) {
        commentInput.focus();
        return;
    }

    try {
        const response = await fetch("/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, authorId: currentUser.id, content })
        });
        if (!response.ok) throw new Error("Failed to add comment");
        commentInput.value = "";
        // Refetch post to get updated comments
        const postResponse = await fetch(`/api/posts/${postId}`);
        if (postResponse.ok) {
            const post = await postResponse.json();
            await loadComments(post);
        }
    } catch (error) {
        showToast("Error: " + error.message, "error");
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

//Initialize page by loading the post
initPage();