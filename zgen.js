let currentCategory = "all";  
const posts = JSON.parse(localStorage.getItem("uus_posts") || "[]");
let loggedInUser = localStorage.getItem("uus_current") || null;
let previewMode = !loggedInUser;


// Elements
const blogFeed = document.getElementById("feed");
const loadMoreBtn = document.getElementById("load-more-btn");
const loginBtn = document.getElementById("open-login");
const loginModal = document.getElementById("loginModal");
const usernameDisplay = document.getElementById("current-user");
const categoryButtons = document.querySelectorAll(".category-btn");
const emojiBtns = ["😂", "😑", "🔥", "😳"];

// Calculate funny score function
function calculateFunnyScore(text) {
  const funnyWords = ["banana", "chicken", "weird", "awkward", "lol", "haha", "dad", "toilet", "silly", "beard", "fart", "goofy"];
  const words = text.toLowerCase().split(/\W+/);
  const total = words.length;
  const matches = words.filter(word => funnyWords.includes(word)).length;
  const score = total === 0 ? 0 : Math.round((matches / total) * 100);
  return score;
}
// Helper to create a post card
function createPostCard(post, isGenerated = false) {
  const card = document.createElement('div');
  card.className = "card bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md";

  const tags = post.tags ? post.tags.split(',').map(tag => <span class="text-xs text-blue-500 mr-1">#${tag.trim()}</span>).join(' ') : '';

  card.innerHTML = `
    <h3 class="text-lg font-bold">${post.title}</h3>
    ${post.image ? <img src="${post.image}" alt="" class="my-2 rounded" /> : ''}
    <p class="text-sm my-2 whitespace-pre-line">${post.content}</p>
    <div class="text-xs text-slate-400 mt-2">${tags}</div>
    <div class="text-xs text-slate-500 mt-1">${isGenerated ? 'Generated Post' : 'User Post'}</div>
  `;
  return card;
}

// Generate fake blog content
function generateContent(seed, tone) {
  const intros = {
    absurd: ["So there I was,", "You won't believe this,", "Once upon a toast,", "As usual,"],
    dry: ["Needless to say,", "Frankly,", "To summarize,", "It's evident that,"],
    'dad-joke': ["Why did the scarecrow win an award?", "I asked my dog for advice,", "Knock knock,", "My fridge is running again,"],
    nonsense: ["Blorp the shnibble,", "Quantum toast is real,", "My sock eloped with a banana,", "Toaster politics are spicy,"],
    surreal: ["The moon borrowed my pen,", "I dreamt in reverse,", "My thoughts became soup,", "Time folded itself,"]
  };

  const bodies = [
    "The reality we knew melted like cheese on a bald eagle.",
    "Clearly, nothing made sense — and that's how it should be.",
    "Experts are still investigating why ducks wear flip-flops.",
    "Scientists found that laughter actually powers microwaves.",
    "I documented everything using an invisible crayon."
  ];

  const intro = seed || intros[tone][Math.floor(Math.random() * intros[tone].length)];
  const body = bodies[Math.floor(Math.random() * bodies.length)];

  return `${intro}\n\n${body}`;
}

// Handle Generate button
document.getElementById('generate-btn').addEventListener('click', () => {
  const seed = document.getElementById('seed-input').value;
  const tone = document.getElementById('tone-select').value;
  const tags = document.getElementById('tag-input').value;

  const post = {
    title: seed || "Untitled Random Rant",
    content: generateContent(seed, tone),
    image: "",
    tags: tags
  };

  // Display post
  const output = document.getElementById('post-output');
  output.innerHTML = "";
  output.appendChild(createPostCard(post, true));
  output.classList.remove("hidden");

  // Save for regeneration
  window.lastGenerated = post;
});

// Handle Regenerate
document.getElementById('regenerate-btn').addEventListener('click', () => {
  const prev = window.lastGenerated;
  if (!prev) return;

  const tone = document.getElementById('tone-select').value;
  prev.content = generateContent(prev.title, tone);

  const output = document.getElementById('post-output');
  output.innerHTML = "";
  output.appendChild(createPostCard(prev, true));
});

// Handle Save Locally
document.getElementById('save-btn').addEventListener('click', () => {
  const post = window.lastGenerated;
  if (!post) return;

  let saved = JSON.parse(localStorage.getItem('useless-saved') || "[]");
  saved.push(post);
  localStorage.setItem('useless-saved', JSON.stringify(saved));
  alert("Post saved locally!");
});

// Clear Generator
document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('seed-input').value = "";
  document.getElementById('tag-input').value = "";
  document.getElementById('post-output').classList.add('hidden');
});

// Open Saved
document.getElementById('open-saved').addEventListener('click', () => {
  const modal = document.getElementById('saved-modal');
  const list = document.getElementById('saved-list');
  const saved = JSON.parse(localStorage.getItem('useless-saved') || "[]");
  list.innerHTML = "";

  saved.forEach(post => {
    list.appendChild(createPostCard(post, true));
  });

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
});

// Close saved modal
document.getElementById('close-saved').addEventListener('click', () => {
  const modal = document.getElementById('saved-modal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
});

// Export all posts
document.getElementById('export-saved').addEventListener('click', () => {
  const saved = JSON.parse(localStorage.getItem('useless-saved') || "[]");
  const blob = new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'uselessly-yours-saved-posts.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Submit user post
document.getElementById('user-post-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const post = {
    title: document.getElementById('post-title').value,
    image: document.getElementById('post-image').value,
    content: document.getElementById('post-content').value,
    tags: document.getElementById('post-tags').value
  };

  document.getElementById('feed').prepend(createPostCard(post, false));
  e.target.reset();
});

// Clear user post form
document.getElementById('clear-post-form').addEventListener('click', () => {
  document.getElementById('user-post-form').reset();
})
// Dummy generator for example
 // Use dummy posts for preview if not logged in
  const postsToShow = previewMode ? generatePreviewPosts() : posts;
  
  let filtered = postsToShow.filter(p => currentCategory === "all" || p.category === currentCategory);
  if (limit) filtered = filtered.slice(0, limit);

  filtered.forEach(post => {
    const funnyScore = calculateFunnyScore(post.title + " " + post.content);
    const card = document.createElement('div');
    card.className = "card bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md";
    
    card.innerHTML = `
      <h3 class="text-lg font-bold">${post.title}</h3>
      ${post.image ? `<img src="${post.image}" alt="" class="my-2 rounded" />` : ''}
      <p class="text-sm my-2">${previewMode ? post.content.substring(0, 100) + '...' : post.content}</p>
      <p class="text-xs text-slate-500 mt-1">${previewMode ? 'Preview Post' : 'Funny Score: ' + funnyScore + '%'}</p>
      ${!previewMode ? `
        <div class="reaction-bar">
          ${emojiBtns.map(emoji => 
            `<button class="reaction-btn" onclick="reactToPost(${post.id}, '${emoji}')">
              ${emoji} 0
            </button>`
          ).join('')}
        </div>` : ''}
    `;
    feed.appendChild(card);
  });

function renderPosts(limit = null) {
  const feed = document.getElementById('feed');
  feed.innerHTML = "";

  // Use dummy posts for preview if not logged in
  const postsToShow = previewMode ? generatePreviewPosts() : posts;

  let filtered = postsToShow.filter(p => currentCategory === "all" || p.category === currentCategory);
  if (limit) filtered = filtered.slice(0, limit);

  filtered.forEach(post => {
    const funnyScore = calculateFunnyScore(post.title + " " + post.content);
    const card = document.createElement('div');
    card.className = "card bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md";
    card.innerHTML = `
      <h3 class="text-lg font-bold">${post.title}</h3>
      ${post.image ? `<img src="${post.image}" alt="" class="my-2 rounded" />` : ''}
      <p class="text-sm my-2">${previewMode ? post.content.substring(0, 100) + '...' : post.content}</p>
      <p class="text-xs text-slate-500 mt-1">${previewMode ? 'Preview Post' : 'Funny Score: ' + funnyScore + '%'}</p>
      ${!previewMode ? `
        <div class="reaction-bar">
          ${emojiBtns.map(emoji => 
            `<button class="reaction-btn" onclick="reactToPost(${post.id}, '${emoji}')">
              ${emoji} 0
            </button>`
          ).join('')}
        </div>` : ''}
    `;
    feed.appendChild(card);
  });
}
// Emoji Reaction
function reactToPost(postId, emoji) {
  alert(`You reacted to post #${postId} with ${emoji}`); // You can store this in localStorage too
}

// Event: Load more
loadMoreBtn.addEventListener("click", () => {
  if (!loggedInUser) {
    loginModal.classList.remove("hidden");
  } else {
    previewMode = false;
    renderPosts();
    loadMoreBtn.classList.add("hidden");
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.querySelector('.cursor');
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
  });
});


// Login events
  // Login events
  loginBtn.addEventListener("click", () => loginModal.classList.remove("hidden"));
  document.getElementById("loginSubmit").addEventListener("click", () => {
    const u = document.getElementById("loginUser").value;
    const p = document.getElementById("loginPass").value;
    const users = JSON.parse(localStorage.getItem("uus_users") || "{}");
    if (users[u] && users[u] === p) {
      loggedInUser = u;
      localStorage.setItem("uus_current", u);
      usernameDisplay.textContent = `Welcome, ${u}`;
      loginModal.classList.add("hidden");
      previewMode = false;
      renderPosts();
      const loadMoreBtn = document.getElementById("load-more-btn");
      if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
    } else {
      alert("Invalid login");
    }
  });
  document.getElementById("registerSubmit").addEventListener("click", () => {
    const u = document.getElementById("loginUser").value;
    const p = document.getElementById("loginPass").value;
    const users = JSON.parse(localStorage.getItem("uus_users") || "{}");
    if (users[u]) {
      alert("User exists");
    } else {
      users[u] = p;
      localStorage.setItem("uus_users", JSON.stringify(users));
      alert("Registered! Please login.");
    }
  });

// Category filter
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    renderPosts(previewMode ? 3 : null);
  });
});

// Init
if (posts.length === 0) generateDummyPosts();
if (loggedInUser) {
  usernameDisplay.textContent = `Welcome, ${loggedInUser}`;
  renderPosts();
  loadMoreBtn.classList.add("hidden");
} else {
  renderPosts(3);
}
