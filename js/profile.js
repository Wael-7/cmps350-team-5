// profile.js — User profile and follow/edit logic

initStorage();

const currentUser = isLoggedIn() ? getCurrentUser() : null;
const isUserLoggedIn = currentUser !== null;

const params = new URLSearchParams(window.location.search);
let targetUserId = params.get("id");

if (!targetUserId) {
  if (currentUser) {
    targetUserId = currentUser.id;
  } else {
    window.location.href = "login.html";
  }
}

const targetUser = getUserById(targetUserId);

function setNavbar() {
  const userNameNode = document.querySelector(".user-name");
  const avatarNode = document.querySelector(".user-avatar");
  const profileTile = document.querySelector(".user-profile");

  if (isUserLoggedIn) {
    userNameNode.textContent = currentUser.username;
    profileTile.style.cursor = "pointer";
    profileTile.addEventListener("click", () => {
      window.location.href = `profile.html?id=${currentUser.id}`;
    });

    if (currentUser.profilePicture) {
      avatarNode.src = currentUser.profilePicture;
    } else {
      avatarNode.src = `https://ui-avatars.com/api/?name=${currentUser.username}&background=d4a853&color=fff`;
    }

    document.querySelector(".btn-logout").textContent = "Logout";
    document.querySelector(".btn-logout").addEventListener("click", () => {
      logoutUser();
      window.location.href = "login.html";
    });
  } else {
    userNameNode.textContent = "Guest";
    avatarNode.src = "https://ui-avatars.com/api/?name=Guest&background=d4a853&color=fff";
    document.querySelector(".btn-logout").textContent = "Login";
    document.querySelector(".btn-logout").addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
}

function displayUser() {
  if (!targetUser) {
    document.querySelector(".profile-container").innerHTML = "<p style='text-align:center;color:#999;'>User not found.</p>";
    return;
  }

  document.getElementById("username").textContent = targetUser.username;
  document.getElementById("bio").textContent = targetUser.bio || "No bio yet.";

  const profilePic = document.getElementById("profilePic");
  if (targetUser.profilePicture) {
    profilePic.src = targetUser.profilePicture;
  } else {
    profilePic.src = `https://ui-avatars.com/api/?name=${targetUser.username}&background=d4a853&color=fff`;
  }

  document.getElementById("followersCount").textContent = targetUser.followers.length;
  document.getElementById("followingCount").textContent = targetUser.following.length;

  const followBtn = document.getElementById("followBtn");
  const editBtn = document.getElementById("editProfileBtn");

  if (!isUserLoggedIn || currentUser.id !== targetUser.id) {
    // Show follow/unfollow only for other users (or not logged in)
    editBtn.style.display = "none";
    followBtn.style.display = "inline-block";

    followBtn.disabled = false;
    if (!isUserLoggedIn) {
      followBtn.textContent = "Login to Follow";
      followBtn.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    } else {
      if (isFollowing(currentUser.id, targetUser.id)) {
        followBtn.textContent = "Unfollow";
        followBtn.classList.add("unfollow");
      } else {
        followBtn.textContent = "Follow";
        followBtn.classList.remove("unfollow");
      }

      followBtn.addEventListener("click", () => {
        if (currentUser.id === targetUser.id) return;

        const result = isFollowing(currentUser.id, targetUser.id)
          ? unfollowUser(currentUser.id, targetUser.id)
          : followUser(currentUser.id, targetUser.id);

        if (!result.success) {
          alert(result.error);
          return;
        }

        refreshProfile();
      });
    }
  } else {
    // Own profile => show edit button and hide follow
    followBtn.style.display = "none";
    editBtn.style.display = "inline-block";
    editBtn.textContent = "Edit Profile";

    editBtn.addEventListener("click", () => {
      const updatedUsername = prompt("Update username:", targetUser.username);
      if (updatedUsername === null) return;

      const usernameTrim = updatedUsername.trim();
      if (!usernameTrim) {
        alert("Username cannot be empty.");
        return;
      }

      const existingUser = getUserByUsername(usernameTrim);
      if (existingUser && existingUser.id !== targetUser.id) {
        alert("This username is already taken.");
        return;
      }

      const updatedBio = prompt("Update bio:", targetUser.bio || "");
      if (updatedBio === null) return;

      const updatedProfilePicture = prompt("Profile picture URL (leave empty for default):", targetUser.profilePicture || "");
      if (updatedProfilePicture === null) return;

      const updateResult = updateUserProfile(targetUser.id, {
        username: usernameTrim,
        bio: updatedBio.trim(),
        profilePicture: updatedProfilePicture.trim(),
      });

      if (!updateResult.success) {
        alert(updateResult.error);
        return;
      }

      // If we changed the username in current session, update navbar and storage
      if (currentUser && currentUser.id === targetUser.id) {
        // refresh local user data and currentUser value
      }

      refreshProfile();
      alert("Profile updated!");
    });
  }

  renderUserPosts();
}

function renderUserPosts() {
  const postsContainer = document.getElementById("userPosts");
  postsContainer.innerHTML = "";

  const posts = getPostsByUser(targetUser.id);
  if (posts.length === 0) {
    postsContainer.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  const sorted = posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  sorted.forEach((post) => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";

    const content = document.createElement("p");
    content.textContent = post.content;

    const meta = document.createElement("div");
    meta.className = "post-meta";
    meta.textContent = `${formatTimestamp(post.timestamp)} • ${post.likes.length} likes • ${post.comments.length} comments`;

    postCard.appendChild(content);
    postCard.appendChild(meta);
    postCard.addEventListener("click", () => {
      window.location.href = `post.html?id=${post.id}`;
    });

    postsContainer.appendChild(postCard);
  });
}

function refreshProfile() {
  // refresh data from storage
  const updatedUser = getUserById(targetUser.id);
  if (!updatedUser) return;

  // update targetUser object
  Object.assign(targetUser, updatedUser);

  if (currentUser && currentUser.id === targetUser.id) {
    // refresh current user reference for nav and local state
    const latest = getUserById(currentUser.id);
    if (latest) {
      currentUser.username = latest.username;
      currentUser.bio = latest.bio;
      currentUser.profilePicture = latest.profilePicture;
    }
  }

  displayUser();
}

setNavbar();
displayUser();

// Back to Feed button
const backBtn = document.getElementById("backToFeedBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "feed.html";
  });
}
