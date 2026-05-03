// ---------------------------------------------------------------
// feed.js — Feed Page Logic
// ---------------------------------------------------------------

// Get current user ID and load user profile
const currentUserId = getCurrentUserId();
if (!currentUserId) {
    window.location.href = "login.html";
    throw new Error("Not logged in");
}

let currentUser = null;

// Initialize page
async function initPage() {
    try {
        const response = await fetch(`/api/users/${currentUserId}`);
        if (response.status === 404) {
            logoutUser();
            window.location.href = "login.html";
            return;
        }
        if (!response.ok) throw new Error('Failed to load user');
        currentUser = await response.json();

        // Setup navbar with user data
        document.querySelector(".user-name").textContent = currentUser.username;
        const navAvatar = document.querySelector(".user-avatar");
        navAvatar.src = currentUser.profilePicture
            ? currentUser.profilePicture
            : `https://ui-avatars.com/api/?name=${currentUser.username}&background=${getAvatarColor(currentUser.id)}&color=fff`;

        const userProfileContainer = document.querySelector(".user-profile");
        userProfileContainer.style.cursor = "pointer";
        userProfileContainer.addEventListener("click", () => {
            window.location.href = `profile.html?id=${currentUser.id}`;
        });

        // Load feed and sidebar
        loadFeed();
        loadUserList();
    } catch (error) {
        console.error('Failed to initialize page:', error);
        const feed = document.getElementById("feed");
        if (feed) feed.innerHTML = `<div style="text-align:center; color:red; padding:48px 20px;">Failed to load. Please refresh the page.</div>`;
    }
}

initPage();

// ---------------------------------------------------------------
// NAVBAR
// ---------------------------------------------------------------

document.querySelector(".btn-logout").addEventListener("click", () => {
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
// FLOATING BUTTON + MODAL
// ---------------------------------------------------------------

const modal = document.getElementById("createPostModal");
const floatingBtn = document.getElementById("fbCreatePost");
const closeButton = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelPost");

floatingBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

closeButton.addEventListener("click", () => {
    modal.classList.add("hidden");
});

cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

// ---------------------------------------------------------------
// FEED
// ---------------------------------------------------------------

async function loadFeed() {
    const feedContainer = document.getElementById("feed");
    feedContainer.innerHTML = "";

    try {
        const response = await fetch(`/api/feed?userId=${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to load feed');
        const posts = await response.json();

        if (posts.length === 0) {
            feedContainer.innerHTML = `
              <div style="text-align:center; color:var(--text-secondary); padding:48px 20px;">
                  <p style="font-size:1rem; margin-bottom:8px;">Your feed is empty.</p>
                  <p style="font-size:0.875rem;">Follow people from the sidebar to see their posts here.</p>
              </div>`;
            return;
        }

        posts.forEach((post) => {
            const postCard = createPostCard(post);
            feedContainer.appendChild(postCard);
        });
    } catch (error) {
        console.error('Failed to load feed:', error);
        feedContainer.innerHTML = `<div style="text-align:center; color:red;">Failed to load feed. Please refresh.</div>`;
    }
}

function createPostCard(post) {
    const author = post.author;  // Author comes from API

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.postId = post.id;

    // ---- Header ----
    const header = document.createElement("div");
    header.className = "post-header";

    const authorAvatar = document.createElement("img");
    authorAvatar.className = "author-avatar";
    authorAvatar.src = author && author.profilePicture
        ? author.profilePicture
        : `https://ui-avatars.com/api/?name=${author ? author.username : "Unknown"}&background=${author ? getAvatarColor(author.id) : "d4a853"}&color=fff`;
    authorAvatar.style.cursor = "pointer";
    authorAvatar.addEventListener("click", (e) => {
        e.stopPropagation();
        if (author) window.location.href = `profile.html?id=${author.id}`;
    });

    const authorInfo = document.createElement("div");
    authorInfo.className = "author-info";

    const authorName = document.createElement("h3");
    authorName.className = "author-name";
    authorName.textContent = author ? author.username : "Unknown User";
    authorName.style.cursor = "pointer";
    authorName.addEventListener("click", (e) => {
        e.stopPropagation();
        if (author) window.location.href = `profile.html?id=${author.id}`;
    });

    const timestamp = document.createElement("span");
    timestamp.className = "post-timestamp";
    timestamp.textContent = formatTimestamp(post.createdAt);

    authorInfo.appendChild(authorName);
    authorInfo.appendChild(timestamp);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.style.display = post.authorId === currentUser.id ? "block" : "none";
    deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirmation("Delete this post?");
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/posts/${post.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authorId: currentUser.id }),
            });
            if (response.ok) {
                showToast("Post deleted successfully.", "success");
                loadFeed();
            } else {
                const result = await response.json();
                showToast("Error: " + result.error, "error");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        }
    });

    header.appendChild(authorAvatar);
    header.appendChild(authorInfo);
    header.appendChild(deleteBtn);

    // ---- Content ----
    const content = document.createElement("p");
    content.className = "post-content";
    content.textContent = post.content;

    // ---- Footer: Like + Comment toggle ----
    const footer = document.createElement("div");
    footer.className = "post-footer";

    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";
    const likeCount = post.likes.length;
    likeBtn.innerHTML = `❤️ ${likeCount} ${likeCount === 1 ? "like" : "likes"}`;
    likeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, postId: post.id }),
            });
            if (response.ok) {
                const result = await response.json();
                likeBtn.classList.toggle("liked", result.liked);
                // Refetch post to get updated like count
                const postResponse = await fetch(`/api/posts/${post.id}`);
                const updatedPost = await postResponse.json();
                const count = updatedPost.likes.length;
                likeBtn.innerHTML = `❤️ ${count} ${count === 1 ? "like" : "likes"}`;
                showToast(result.liked ? "Post liked!" : "Post unliked.", "success");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        }
    });

    const commentCount = post.comments.length;
    const toggleCommentsBtn = document.createElement("button");
    toggleCommentsBtn.className = "btn-toggle-comments";
    toggleCommentsBtn.innerHTML = `💬 ${commentCount} ${commentCount === 1 ? "comment" : "comments"}`;
    toggleCommentsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const commentsSection = card.querySelector(".inline-comments");
        commentsSection.classList.toggle("open");
        toggleCommentsBtn.classList.toggle("active");
    });

    footer.appendChild(likeBtn);
    footer.appendChild(toggleCommentsBtn);

    // ---- Inline Comments Section ----
    const inlineComments = document.createElement("div");
    inlineComments.className = "inline-comments";
    renderInlineComments(inlineComments, post.id, toggleCommentsBtn);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);
    card.appendChild(inlineComments);

    // Add click event to navigate to post page
    card.addEventListener("click", (e) => {
        // Only navigate if not clicking on interactive elements
        if (!e.target.closest('.btn-delete, .like-btn, .btn-toggle-comments, .author-avatar, .author-name')) {
            window.location.href = `post.html?id=${post.id}`;
        }
    });

    return card;
}

function renderInlineComments(container, postId, toggleBtn) {
    container.innerHTML = "";

    // ---- Add comment input row ----
    const inputRow = document.createElement("div");
    inputRow.className = "comment-input-row";

    const inputAvatar = document.createElement("img");
    inputAvatar.className = "comment-input-avatar";
    inputAvatar.src = currentUser.profilePicture
        ? currentUser.profilePicture
        : `https://ui-avatars.com/api/?name=${currentUser.username}&background=${getAvatarColor(currentUser.id)}&color=fff`;

    const inputWrapper = document.createElement("div");
    inputWrapper.className = "comment-input-wrapper";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Write a comment...";
    textarea.addEventListener("click", (e) => e.stopPropagation());
    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.ctrlKey) submitComment();
    });

    const submitBtn = document.createElement("button");
    submitBtn.className = "btn-submit-inline-comment";
    submitBtn.textContent = "Post";
    submitBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        submitComment();
    });

    async function submitComment() {
        const content = textarea.value.trim();
        if (!content) { textarea.focus(); return; }

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, authorId: currentUser.id, content }),
            });
            if (response.ok) {
                textarea.value = "";
                // Reload the entire comments section
                const postResponse = await fetch(`/api/posts/${postId}`);
                const updatedPost = await postResponse.json();
                const count = updatedPost.comments.length;
                toggleBtn.innerHTML = `💬 ${count} ${count === 1 ? "comment" : "comments"}`;
                renderInlineComments(container, postId, toggleBtn);
                container.classList.add("open");
                showToast("Comment added!", "success");
            } else {
                const result = await response.json();
                showToast("Error: " + result.error, "error");
            }
        } catch (error) {
            showToast("Network error. Please try again.", "error");
        }
    }

    inputWrapper.appendChild(textarea);
    inputWrapper.appendChild(submitBtn);
    inputRow.appendChild(inputAvatar);
    inputRow.appendChild(inputWrapper);

    // ---- Comments list ----
    const commentsList = document.createElement("div");
    commentsList.className = "inline-comments-list";

    // Fetch comments for this post
    fetch(`/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(comments => {
            if (comments.length === 0) {
                const empty = document.createElement("p");
                empty.className = "no-comments-msg";
                empty.textContent = "No comments yet. Be the first!";
                commentsList.appendChild(empty);
            } else {
                comments.forEach((comment) => {
                    const item = document.createElement("div");
                    item.className = "inline-comment-item";

                    const commentAvatar = document.createElement("img");
                    commentAvatar.className = "inline-comment-avatar";
                    commentAvatar.src = comment.author && comment.author.profilePicture
                        ? comment.author.profilePicture
                        : `https://ui-avatars.com/api/?name=${comment.author ? comment.author.username : "Unknown"}&background=${comment.author ? getAvatarColor(comment.author.id) : "d4a853"}&color=fff`;

                    const bubble = document.createElement("div");
                    bubble.className = "inline-comment-bubble";

                    const commentHeader = document.createElement("div");
                    commentHeader.className = "inline-comment-header";

                    const commentAuthorName = document.createElement("span");
                    commentAuthorName.className = "inline-comment-author";
                    commentAuthorName.textContent = comment.author ? comment.author.username : "Unknown";

                    const commentTime = document.createElement("span");
                    commentTime.className = "inline-comment-time";
                    commentTime.textContent = formatTimestamp(comment.timestamp);

                    commentHeader.appendChild(commentAuthorName);
                    commentHeader.appendChild(commentTime);

                    const commentText = document.createElement("p");
                    commentText.className = "inline-comment-text";
                    commentText.textContent = comment.content;

                    bubble.appendChild(commentHeader);
                    bubble.appendChild(commentText);

                    // Delete comment button (only for comment author)
                    if (comment.authorId === currentUser.id) {
                        const deleteCommentBtn = document.createElement("button");
                        deleteCommentBtn.className = "btn-delete-inline-comment";
                        deleteCommentBtn.textContent = "🗑️";
                        deleteCommentBtn.addEventListener("click", async (e) => {
                            e.stopPropagation();
                            const confirmed = await showConfirmation("Delete this comment?");
                            if (!confirmed) return;

                            try {
                                const response = await fetch(`/api/comments/${comment.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ authorId: currentUser.id }),
                                });
                                if (response.ok) {
                                    showToast("Comment deleted successfully.", "success");
                                    renderInlineComments(container, postId, toggleBtn);
                                    container.classList.add("open");
                                } else {
                                    const result = await response.json();
                                    showToast("Error: " + result.error, "error");
                                }
                            } catch (error) {
                                showToast("Network error. Please try again.", "error");
                            }
                        });
                        commentHeader.appendChild(deleteCommentBtn);
                    }

                    item.appendChild(commentAvatar);
                    item.appendChild(bubble);
                    commentsList.appendChild(item);
                });
            }
        })
        .catch(error => {
            console.error('Failed to load comments:', error);
            const empty = document.createElement("p");
            empty.className = "no-comments-msg";
            empty.textContent = "Failed to load comments.";
            commentsList.appendChild(empty);
        });

    container.appendChild(inputRow);
    container.appendChild(commentsList);
}

// ---------------------------------------------------------------
// DISCOVER USERS SIDEBAR
// ---------------------------------------------------------------

async function loadUserList() {
    const userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = "";

    try {
        const response = await fetch('/api/users/discover');
        if (!response.ok) throw new Error('Failed to load users');
        const allUsers = await response.json();
        const allUsers_filtered = allUsers.filter(u => u.id !== currentUser.id);

        if (allUsers_filtered.length === 0) {
            userListContainer.innerHTML = `<p style="font-size:0.82rem; color:var(--text-secondary); text-align:center; padding:12px 0;">No other users yet.</p>`;
            return;
        }

        allUsers_filtered.forEach(user => {
            const userCard = document.createElement("div");
            userCard.className = "user-card";

            const userInfo = document.createElement("div");
            userInfo.className = "user-info";

            const avatar = document.createElement("img");
            avatar.className = "user-avatar-small";
            avatar.src = user.profilePicture
                ? user.profilePicture
                : `https://ui-avatars.com/api/?name=${user.username}&background=${getAvatarColor(user.id)}&color=fff`;

            const name = document.createElement("span");
            name.className = "user-name-small";
            name.textContent = user.username;
            name.style.cursor = "pointer";
            name.addEventListener("click", () => {
                window.location.href = `profile.html?id=${user.id}`;
            });

            userInfo.appendChild(avatar);
            userInfo.appendChild(name);

            const followBtn = document.createElement("button");
            const following = currentUser.following && currentUser.following.some(f => f.followingId === user.id);
            followBtn.className = following ? "btn-follow following" : "btn-follow";
            followBtn.textContent = following ? "Unfollow" : "Follow";

            followBtn.addEventListener("click", async () => {
                try {
                    const isCurrentlyFollowing = currentUser.following && currentUser.following.some(f => f.followingId === user.id);
                    const action = isCurrentlyFollowing ? 'unfollow' : 'follow';
                    const resp = await fetch('/api/follow', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ followerId: currentUser.id, followingId: user.id, action }),
                    });
                    if (resp.ok) {
                        // Refresh currentUser so follow state is up-to-date before re-rendering
                        const userResp = await fetch(`/api/users/${currentUser.id}`);
                        if (userResp.ok) currentUser = await userResp.json();
                        loadUserList();
                        loadFeed();
                    } else {
                        alert('Failed to update follow status');
                    }
                } catch (error) {
                    alert('Network error. Please try again.');
                }
            });

            userCard.appendChild(userInfo);
            userCard.appendChild(followBtn);
            userListContainer.appendChild(userCard);
        });
    } catch (error) {
        console.error('Failed to load users:', error);
        userListContainer.innerHTML = `<p style="font-size:0.82rem; color:red;">Failed to load users.</p>`;
    }
}

// ---------------------------------------------------------------
// CREATE POST
// ---------------------------------------------------------------

const createPostForm = document.getElementById("createPostForm");
const postContentInput = document.getElementById("postContent");

createPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = postContentInput.value.trim();
    if (!content) { postContentInput.focus(); return; }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorId: currentUser.id, content }),
        });
        if (response.ok) {
            createPostForm.reset();
            modal.classList.add("hidden");
            loadFeed();
            showToast("Post created successfully!", "success");
        } else {
            const result = await response.json();
            showToast("Error: " + result.error, "error");
        }
    } catch (error) {
        showToast("Network error. Please try again.", "error");
    }
});

