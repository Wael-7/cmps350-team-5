// Initializing and checking user

initStorage();

const currentUser = isLoggedIn() ? getCurrentUser() : null;
const isUserLoggedIn = currentUser !== null;

//Navbar setup

if (isUserLoggedIn) {
    document.querySelector(".user-name").textContent = currentUser.username;
    const avatar = document.querySelector(".user-avatar");
    if (currentUser.profilePicture) {
        avatar.src = currentUser.profilePicture;
    } else {
        avatar.src =
            `https://ui-avatars.com/api/?name=${currentUser.username}&background=d4a853&color=fff`;
    }

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

// Floating button setup

const floatingBtn = document.getElementById("fbCreatePost");
if (!isUserLoggedIn) {
    floatingBtn.disabled = true;
    floatingBtn.style.opacity = "0.5";
    floatingBtn.title = "Please log in to create a post";
}

floatingBtn.addEventListener("click", () => {
    if (!isUserLoggedIn) {
        alert("Please log in to create a post.");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("createPostModal").classList.remove("hidden");
});

// Modal setup


const modal = document.getElementById("createPostModal");
const floatingButton = document.getElementById("fbCreatePost");
const closeButton = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelPost");

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


// Feed setup

function loadFeed() {
    const feedContainer = document.getElementById("feed");
    feedContainer.innerHTML = "";

    const allPosts = getPosts();

    if (allPosts.length === 0) {
        feedContainer.innerHTML = "<p style='text-align: center; color: #999;'>No posts yet. Be the first to share something!</p>";
        return;
    }

    allPosts.forEach((post) => {
        const postCard = createPostCard(post);
        feedContainer.appendChild(postCard);
    });
}

function createPostCard(post) {
    const author = getUserById(post.authorId);

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.postId = post.id;

    const header = document.createElement("div");
    header.className = "post-header";


    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.innerHTML = "🗑️"; // temporary icon
    deleteBtn.style.display = isUserLoggedIn && post.authorId === currentUser.id ? "block" : "none";

    deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this post?")) {
            const result = deletePost(post.id, currentUser.id);
            if (result.success) {
                loadFeed();  // Re-render feed
                alert("Post deleted successfully!");
            } else {
                alert("Error: " + result.error);
            }
        }
    });

    header.appendChild(deleteBtn);


    const authorInfo = document.createElement("div");
    authorInfo.className = "author-info";

    const authorName = document.createElement("h3");
    authorName.className = "author-name";
    authorName.textContent = author ? author.username : "Unknown User";

    const authorAvatar = document.createElement("img");
    authorAvatar.className = "author-avatar";

    const timestamp = document.createElement("span");
    timestamp.className = "post-timestamp";
    timestamp.textContent = formatTimestamp(post.timestamp);

    authorInfo.appendChild(authorName);
    header.appendChild(authorAvatar);
    header.appendChild(authorInfo);
    header.appendChild(timestamp);

    const content = document.createElement("p");
    content.className = "post-content";
    content.textContent = post.content;

    const footer = document.createElement("div");
    footer.className = "post-footer";

    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";
    likeBtn.innerHTML = `🤍 ${post.likes.length}`; //temporary icon
    likeBtn.disabled = !isUserLoggedIn;

    if (!isUserLoggedIn) {
        likeBtn.title = "Login to like";
        likeBtn.style.opacity = "0.5";
        likeBtn.addEventListener("click", () => {
            alert("Please login to like posts");
            window.location.href = "login.html";
        });
    } else {
        likeBtn.addEventListener("click", () => {
            const result = toggleLike(post.id, currentUser.id);
            if (result.success) {
                loadFeed();
            }
        });
    }


    footer.appendChild(likeBtn);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);

    return card;
}

loadFeed();

// Post creation setup

const createPostForm = document.getElementById("createPostForm");
const postContentInput = document.getElementById("postContent");

createPostForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = postContentInput.value.trim();

    if (!content) {
        alert("Post cannot be empty.");
        return;
    }
    const result = createPost(currentUser.id, content);
    if (result.success) {
        createPostForm.reset();
        modal.classList.add("hidden");
        loadFeed();
        alert("Post created successfully!");
    } else {
        alert("Error: " + result.error);
    }
});