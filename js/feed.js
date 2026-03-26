// ---------------------------------------------------------------
// feed.js — Feed Page Logic
// ---------------------------------------------------------------

initStorage();
if (!isLoggedIn()) window.location.href = "login.html";

const currentUser = getCurrentUser();

// ---------------------------------------------------------------
// NAVBAR
// ---------------------------------------------------------------

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

function loadFeed() {
    const feedContainer = document.getElementById("feed");
    feedContainer.innerHTML = "";

    const posts = getFeedPosts(currentUser.id);

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
}

function createPostCard(post) {
    const author = getUserById(post.authorId);

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
    timestamp.textContent = formatTimestamp(post.timestamp);

    authorInfo.appendChild(authorName);
    authorInfo.appendChild(timestamp);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.style.display = post.authorId === currentUser.id ? "block" : "none";
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Delete this post?")) {
            const result = deletePost(post.id, currentUser.id);
            if (result.success) loadFeed();
            else alert("Error: " + result.error);
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
    if (hasLiked(post.id, currentUser.id)) likeBtn.classList.add("liked");
    const likeCount = post.likes.length;
    likeBtn.innerHTML = `❤️ ${likeCount} ${likeCount === 1 ? "like" : "likes"}`;
    likeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const result = toggleLike(post.id, currentUser.id);
        if (result.success) {
            // Update like button in place without full reload
            const updatedPost = getPostById(post.id);
            const count = updatedPost.likes.length;
            likeBtn.innerHTML = `❤️ ${count} ${count === 1 ? "like" : "likes"}`;
            if (hasLiked(post.id, currentUser.id)) {
                likeBtn.classList.add("liked");
            } else {
                likeBtn.classList.remove("liked");
            }
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

    const post = getPostById(postId);
    if (!post) return;

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

    function submitComment() {
        const content = textarea.value.trim();
        if (!content) { textarea.focus(); return; }

        const result = addComment(postId, currentUser.id, content);
        if (result.success) {
            textarea.value = "";
            // Update comment count on toggle button
            const updatedPost = getPostById(postId);
            const count = updatedPost.comments.length;
            toggleBtn.innerHTML = `💬 ${count} ${count === 1 ? "comment" : "comments"}`;
            // Re-render comments list
            renderInlineComments(container, postId, toggleBtn);
            container.classList.add("open");
        } else {
            alert("Error: " + result.error);
        }
    }

    inputWrapper.appendChild(textarea);
    inputWrapper.appendChild(submitBtn);
    inputRow.appendChild(inputAvatar);
    inputRow.appendChild(inputWrapper);

    // ---- Comments list ----
    const commentsList = document.createElement("div");
    commentsList.className = "inline-comments-list";

    if (post.comments.length === 0) {
        const empty = document.createElement("p");
        empty.className = "no-comments-msg";
        empty.textContent = "No comments yet. Be the first!";
        commentsList.appendChild(empty);
    } else {
        post.comments.forEach((comment) => {
            const commentAuthor = getUserById(comment.authorId);
            const item = document.createElement("div");
            item.className = "inline-comment-item";

            const commentAvatar = document.createElement("img");
            commentAvatar.className = "inline-comment-avatar";
            commentAvatar.src = commentAuthor && commentAuthor.profilePicture
                ? commentAuthor.profilePicture
                : `https://ui-avatars.com/api/?name=${commentAuthor ? commentAuthor.username : "Unknown"}&background=${commentAuthor ? getAvatarColor(commentAuthor.id) : "d4a853"}&color=fff`;

            const bubble = document.createElement("div");
            bubble.className = "inline-comment-bubble";

            const commentHeader = document.createElement("div");
            commentHeader.className = "inline-comment-header";

            const commentAuthorName = document.createElement("span");
            commentAuthorName.className = "inline-comment-author";
            commentAuthorName.textContent = commentAuthor ? commentAuthor.username : "Unknown";

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
                deleteCommentBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (confirm("Delete this comment?")) {
                        const result = deleteComment(postId, comment.id, currentUser.id);
                        if (result.success) {
                            const updatedPost = getPostById(postId);
                            const count = updatedPost.comments.length;
                            toggleBtn.innerHTML = `💬 ${count} ${count === 1 ? "comment" : "comments"}`;
                            renderInlineComments(container, postId, toggleBtn);
                            container.classList.add("open");
                        }
                    }
                });
                commentHeader.appendChild(deleteCommentBtn);
            }

            item.appendChild(commentAvatar);
            item.appendChild(bubble);
            commentsList.appendChild(item);
        });
    }

    container.appendChild(inputRow);
    container.appendChild(commentsList);
}

// ---------------------------------------------------------------
// DISCOVER USERS SIDEBAR
// ---------------------------------------------------------------

function loadUserList() {
    const userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = "";

    const allUsers = getUsers().filter(u => u.id !== currentUser.id);

    if (allUsers.length === 0) {
        userListContainer.innerHTML = `<p style="font-size:0.82rem; color:var(--text-secondary); text-align:center; padding:12px 0;">No other users yet.</p>`;
        return;
    }

    allUsers.forEach(user => {
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
        const following = isFollowing(currentUser.id, user.id);
        followBtn.className = following ? "btn-follow following" : "btn-follow";
        followBtn.textContent = following ? "Unfollow" : "Follow";

        followBtn.addEventListener("click", () => {
            const result = following
                ? unfollowUser(currentUser.id, user.id)
                : followUser(currentUser.id, user.id);

            if (result.success) {
                loadUserList();
                loadFeed();
            } else {
                alert(result.error);
            }
        });

        userCard.appendChild(userInfo);
        userCard.appendChild(followBtn);
        userListContainer.appendChild(userCard);
    });
}

// ---------------------------------------------------------------
// CREATE POST
// ---------------------------------------------------------------

const createPostForm = document.getElementById("createPostForm");
const postContentInput = document.getElementById("postContent");

createPostForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = postContentInput.value.trim();
    if (!content) { postContentInput.focus(); return; }

    const result = createPost(currentUser.id, content);
    if (result.success) {
        createPostForm.reset();
        modal.classList.add("hidden");
        loadFeed();
        // Show success message
        const successMsg = document.createElement("div");
        successMsg.style.cssText = `
            position: fixed;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #d4a853;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        successMsg.textContent = "✓ Post created! Check your profile page to see it.";
        document.body.appendChild(successMsg);
        setTimeout(() => {
            successMsg.style.opacity = "0";
            successMsg.style.transition = "opacity 0.3s";
            setTimeout(() => successMsg.remove(), 300);
        }, 3000);
    } else {
        alert("Error: " + result.error);
    }
});

// ---------------------------------------------------------------
// INIT
// ---------------------------------------------------------------

loadFeed();
loadUserList();