"use strict";

const APP_KEY = "cutesy_meows_v1";

const NAMETAGS = [
  "(˶˃ ᵕ ˂˶)",
  "ฅ^ >ヮ<^₎",
  "/ᐠ˵- ᴗ -˵マ ᶻ 𝗓 𐰁"
];

const STICKERS = ["🌸","🌼","🌷","💮","🪻","🌺","🍓","🫧","🎀","✨","🍀"];

const BOT_FRIENDS = [
  { id: "bot1", name: "BloomBun", tag: "🌸 online" },
  { id: "bot2", name: "YarnPaws", tag: "🧶 online" },
  { id: "bot3", name: "PetalWave", tag: "💮 online" },
  { id: "bot4", name: "CozyCat", tag: "🎀 online" }
];

function loadState() {
  const raw = localStorage.getItem(APP_KEY);
  if (!raw) {
    return {
      theme: "pink",
      currentUser: null,
      users: {},
      posts: [],
      shop: { listings: [], cart: [] }
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(APP_KEY);
    return {
      theme: "pink",
      currentUser: null,
      users: {},
      posts: [],
      shop: { listings: [], cart: [] }
    };
  }
}

function saveState(state) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function $(id) {
  return document.getElementById(id);
}

function setMsg(el, text) {
  el.textContent = text || "";
}

function safeLower(s) {
  return String(s || "").trim().toLowerCase();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

/* ---------- DOM refs ---------- */
const authScreen = $("authScreen");
const appScreen = $("appScreen");

const themeSelect = $("themeSelect");
const signOutBtn = $("signOutBtn");

const signupForm = $("signupForm");
const loginForm = $("loginForm");
const signupMsg = $("signupMsg");
const loginMsg = $("loginMsg");

const toLoginBtn = $("toLoginBtn");
const toSignupBtn = $("toSignupBtn");

const meAvatar = $("meAvatar");
const meName = $("meName");
const meTag = $("meTag");

const navButtons = Array.from(document.querySelectorAll(".navbtn"));
const views = ["home","profile","gallery","friends","shop","minigame"].map(v => $(`view-${v}`));

/* Home */
const quickPostForm = $("quickPostForm");
const quickPostText = $("quickPostText");
const postFeed = $("postFeed");

/* AI bot */
const aiChatLog = $("aiChatLog");
const aiChatForm = $("aiChatForm");
const aiChatInput = $("aiChatInput");

/* Profile */
const profileForm = $("profileForm");
const profileMsg = $("profileMsg");
const pfDisplayName = $("pfDisplayName");
const pfBio = $("pfBio");
const pfHobbies = $("pfHobbies");
const pfLevel = $("pfLevel");
const pfAvatar = $("pfAvatar");
const resetDecorBtn = $("resetDecorBtn");
const stickerButtons = $("stickerButtons");
const stickerBoard = $("stickerBoard");

/* Gallery */
const galleryForm = $("galleryForm");
const galleryMsg = $("galleryMsg");
const galImage = $("galImage");
const galCaption = $("galCaption");
const galleryGrid = $("galleryGrid");

/* Friends */
const friendsList = $("friendsList");
const friendChatTitle = $("friendChatTitle");
const friendChatLog = $("friendChatLog");
const friendChatForm = $("friendChatForm");
const friendChatInput = $("friendChatInput");

/* Shop */
const sellForm = $("sellForm");
const sellName = $("sellName");
const sellPrice = $("sellPrice");
const sellPhoto = $("sellPhoto");
const shopGrid = $("shopGrid");
const cartList = $("cartList");
const cartTotal = $("cartTotal");
const checkoutBtn = $("checkoutBtn");
const checkoutArea = $("checkoutArea");
const payBtn = $("payBtn");
const cancelPayBtn = $("cancelPayBtn");
const cardNumber = $("cardNumber");
const cardExp = $("cardExp");
const cardCvc = $("cardCvc");

/* Game */
const yarnCountEl = $("yarnCount");
const gardenLevelEl = $("gardenLevel");
const yarnBtn = $("yarnBtn");
const buySeedBtn = $("buySeedBtn");
const resetGameBtn = $("resetGameBtn");
const gameMsg = $("gameMsg");

/* ---------- App logic ---------- */
let state = loadState();
let activeSticker = null;
let activeFriendId = BOT_FRIENDS[0].id;

function applyTheme(theme) {
  const t = theme || "pink";
  document.body.className = `theme-${t}`;
  themeSelect.value = t;
  state.theme = t;
  saveState(state);
}

function showAuth() {
  authScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
  signOutBtn.disabled = true;
}

function showApp() {
  authScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  signOutBtn.disabled = false;
}

function navTo(viewName) {
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.view === viewName));
  views.forEach(v => v.classList.add("hidden"));
  const el = $(`view-${viewName}`);
  if (el) el.classList.remove("hidden");
}

function getCurrentUser() {
  if (!state.currentUser) return null;
  return state.users[state.currentUser] || null;
}

function requireUser() {
  const u = getCurrentUser();
  if (!u) {
    state.currentUser = null;
    saveState(state);
    showAuth();
    return null;
  }
  return u;
}

function updateSidebar() {
  const u = requireUser();
  if (!u) return;

  meName.textContent = u.displayName || u.name || u.username;
  meTag.textContent = `${u.username} ${u.nametag}`;

  if (u.avatarDataUrl) {
    meAvatar.style.backgroundImage = `url(${u.avatarDataUrl})`;
  } else {
    meAvatar.style.backgroundImage = "";
  }
}

function initStickerButtons() {
  stickerButtons.innerHTML = "";
  STICKERS.forEach(s => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sticker-btn";
    btn.textContent = s;
    btn.addEventListener("click", () => {
      activeSticker = s;
      Array.from(stickerButtons.children).forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
    });
    stickerButtons.appendChild(btn);
  });
}

function renderStickerBoard() {
  const u = requireUser();
  if (!u) return;

  stickerBoard.innerHTML = "";
  const stickers = u.decorStickers || [];
  stickers.forEach((st) => {
    const el = document.createElement("div");
    el.className = "sticker";
    el.textContent = st.symbol;
    el.style.left = `${st.x}%`;
    el.style.top = `${st.y}%`;

    // simple drag
    let dragging = false;

    el.addEventListener("mousedown", (e) => {
      dragging = true;
      el.style.cursor = "grabbing";
      e.preventDefault();
    });

    window.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      const rect = stickerBoard.getBoundingClientRect();
      const xPct = ((parseFloat(el.style.left) / 100) * rect.width) / rect.width * 100;
      const yPct = ((parseFloat(el.style.top) / 100) * rect.height) / rect.height * 100;

      const idx = (u.decorStickers || []).findIndex(s => s.id === st.id);
      if (idx >= 0) {
        u.decorStickers[idx].x = clamp(xPct, 0, 100);
        u.decorStickers[idx].y = clamp(yPct, 0, 100);
        saveUser(u);
      }
    });

    stickerBoard.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const rect = stickerBoard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.left = `${clamp((x / rect.width) * 100, 0, 100)}%`;
      el.style.top = `${clamp((y / rect.height) * 100, 0, 100)}%`;
    });

    stickerBoard.appendChild(el);
  });
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function saveUser(userObj) {
  state.users[userObj.username] = userObj;
  saveState(state);
  updateSidebar();
}

/* ---------- Auth ---------- */
function randomNametag() {
  return NAMETAGS[Math.floor(Math.random() * NAMETAGS.length)];
}

async function handleSignup(e) {
  e.preventDefault();
  setMsg(signupMsg, "");

  const name = $("suName").value.trim();
  const username = $("suUsername").value.trim();
  const email = $("suEmail").value.trim();
  const password = $("suPassword").value;
  const hobbies = $("suHobbies").value.trim();
  const level = document.querySelector('input[name="level"]:checked')?.value || "new";
  const avatarFile = $("suAvatar").files[0];

  if (!name || !username || !email || !password) {
    setMsg(signupMsg, "Please fill everything required.");
    return;
  }

  const unameKey = safeLower(username);
  if (state.users[unameKey]) {
    setMsg(signupMsg, "That username is taken. Try another one.");
    return;
  }

  const emailKey = safeLower(email);
  const emailTaken = Object.values(state.users).some(u => safeLower(u.email) === emailKey);
  if (emailTaken) {
    setMsg(signupMsg, "That email is already used. Try another.");
    return;
  }

  let avatarDataUrl = null;
  try {
    avatarDataUrl = await readFileAsDataURL(avatarFile);
  } catch {
    avatarDataUrl = null;
  }

  const user = {
    username: unameKey,
    name,
    email,
    // demo only - not secure
    password,
    displayName: name,
    hobbies,
    level,
    bio: "",
    avatarDataUrl,
    nametag: randomNametag(),
    decorStickers: [],
    gallery: [],
    friends: BOT_FRIENDS.map(b => b.id),
    chats: {
      ai: [],
      friends: {}
    },
    game: { yarn: 0, gardenLevel: 1 }
  };

  state.users[unameKey] = user;
  state.currentUser = unameKey;
  saveState(state);

  setMsg(signupMsg, "Account created! Taking you to your garden ✿");
  bootIntoApp();
}

function handleLogin(e) {
  e.preventDefault();
  setMsg(loginMsg, "");

  const username = safeLower($("liUsername").value);
  const password = $("liPassword").value;

  const user = state.users[username];
  if (!user) {
    setMsg(loginMsg, "No account found with that username.");
    return;
  }
  if (user.password !== password) {
    setMsg(loginMsg, "Wrong password (demo).");
    return;
  }

  state.currentUser = username;
  saveState(state);
  setMsg(loginMsg, "Logged in! ✿");
  bootIntoApp();
}

function handleSignOut() {
  state.currentUser = null;
  saveState(state);
  showAuth();
}

/* ---------- Home posts ---------- */
function renderPosts() {
  const u = requireUser();
  if (!u) return;

  postFeed.innerHTML = "";
  const posts = state.posts.slice().reverse().slice(0, 25);

  if (posts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tiny muted";
    empty.textContent = "No posts yet. Make your first cute post ✿";
    postFeed.appendChild(empty);
    return;
  }

  posts.forEach(p => {
    const el = document.createElement("div");
    el.className = "post";
    const when = new Date(p.ts).toLocaleString();
    el.innerHTML = `
      <div class="meta">${escapeHtml(p.user)} • ${escapeHtml(when)}</div>
      <div class="text">${escapeHtml(p.text)}</div>
    `;
    postFeed.appendChild(el);
  });
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function handleQuickPost(e) {
  e.preventDefault();
  const u = requireUser();
  if (!u) return;

  const text = quickPostText.value.trim();
  if (!text) return;

  state.posts.push({
    id: uid(),
    user: `${u.displayName || u.username} ${u.nametag}`,
    text,
    ts: Date.now()
  });
  saveState(state);
  quickPostText.value = "";
  renderPosts();
}

/* ---------- AI bot (local demo) ---------- */
function addChatBubble(logEl, who, text, side) {
  const b = document.createElement("div");
  b.className = `bubble ${side}`;
  b.innerHTML = `<div class="who">${escapeHtml(who)}</div><div>${escapeHtml(text)}</div>`;
  logEl.appendChild(b);
  logEl.scrollTop = logEl.scrollHeight;
}

function aiRespond(userText) {
  const t = safeLower(userText);

  if (t.includes("pattern")) return "Try a granny square or a simple beanie! Want a cute flower applique idea too?";
  if (t.includes("beginner") || t.includes("new")) return "Start with single crochet rows + a tiny coaster. Small wins feel magical ✿";
  if (t.includes("yarn")) return "Soft yarn + a comfy hook size helps. What yarn weight are you using?";
  if (t.includes("gift")) return "A plush keychain, a headband, or a coaster set are super giftable!";
  if (t.includes("sell") || t.includes("price")) return "For pricing: materials + time + a little profit. Keep it fair to your effort!";
  if (t.includes("flower")) return "Flower idea: 5 petals, magic ring center, then sew onto anything. It’s adorable.";
  if (t.includes("hi") || t.includes("hello")) return "meow hello! ✿ What are we crocheting today?";

  const replies = [
    "That sounds cute! Add a little flower edge and it becomes extra dreamy ✿",
    "Ooo yes—try pastel colors and a tiny bow 🎀",
    "If it curls, add a bigger hook or loosen tension a bit.",
    "Want a quick idea? Make a mini heart applique and stitch it onto a pouch!"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function renderAiChat() {
  const u = requireUser();
  if (!u) return;

  aiChatLog.innerHTML = "";
  const chat = u.chats.ai || [];
  chat.forEach(m => {
    addChatBubble(aiChatLog, m.who, m.text, m.side);
  });
}

function handleAiChat(e) {
  e.preventDefault();
  const u = requireUser();
  if (!u) return;

  const text = aiChatInput.value.trim();
  if (!text) return;

  u.chats.ai = u.chats.ai || [];
  u.chats.ai.push({ who: "You", text, side: "me", ts: Date.now() });

  const reply = aiRespond(text);
  u.chats.ai.push({ who: "AI Meow Bot", text: reply, side: "them", ts: Date.now() });

  saveUser(u);
  aiChatInput.value = "";
  renderAiChat();
}

/* ---------- Profile ---------- */
function loadProfileForm() {
  const u = requireUser();
  if (!u) return;

  pfDisplayName.value = u.displayName || "";
  pfBio.value = u.bio || "";
  pfHobbies.value = u.hobbies || "";
  pfLevel.value = u.level || "new";

  renderStickerBoard();
}

async function handleProfileSave(e) {
  e.preventDefault();
  const u = requireUser();
  if (!u) return;

  u.displayName = pfDisplayName.value.trim() || u.name || u.username;
  u.bio = pfBio.value.trim();
  u.hobbies = pfHobbies.value.trim();
  u.level = pfLevel.value;

  const file = pfAvatar.files[0];
  if (file) {
    try {
      u.avatarDataUrl = await readFileAsDataURL(file);
    } catch {
      // ignore
    }
  }

  saveUser(u);
  setMsg(profileMsg, "Saved ✿");
  setTimeout(() => setMsg(profileMsg, ""), 1400);
}

function handleClearDecor() {
  const u = requireUser();
  if (!u) return;
  u.decorStickers = [];
  saveUser(u);
  renderStickerBoard();
}

function handleBoardClick(e) {
  const u = requireUser();
  if (!u) return;
  if (!activeSticker) return;

  const rect = stickerBoard.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const st = {
    id: uid(),
    symbol: activeSticker,
    x: clamp((x / rect.width) * 100, 0, 100),
    y: clamp((y / rect.height) * 100, 0, 100)
  };

  u.decorStickers = u.decorStickers || [];
  u.decorStickers.push(st);
  saveUser(u);
  renderStickerBoard();
}

/* ---------- Gallery ---------- */
function renderGallery() {
  const u = requireUser();
  if (!u) return;

  galleryGrid.innerHTML = "";
  const items = u.gallery || [];

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tiny muted";
    empty.textContent = "No images yet. Add your first crochet pic ✿";
    galleryGrid.appendChild(empty);
    return;
  }

  items.slice().reverse().forEach(it => {
    const wrap = document.createElement("div");
    wrap.className = "gitem";

    const img = document.createElement("div");
    img.className = "gimg";
    img.style.backgroundImage = it.dataUrl ? `url(${it.dataUrl})` : "";

    const cap = document.createElement("div");
    cap.className = "gcap";

    const text = document.createElement("span");
    text.textContent = it.caption || "Untitled";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "iconbtn";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const u2 = requireUser();
      if (!u2) return;
      u2.gallery = (u2.gallery || []).filter(x => x.id !== it.id);
      saveUser(u2);
      renderGallery();
    });

    cap.appendChild(text);
    cap.appendChild(del);

    wrap.appendChild(img);
    wrap.appendChild(cap);
    galleryGrid.appendChild(wrap);
  });
}

async function handleGalleryAdd(e) {
  e.preventDefault();
  setMsg(galleryMsg, "");
  const u = requireUser();
  if (!u) return;

  const file = galImage.files[0];
  if (!file) {
    setMsg(galleryMsg, "Please pick an image.");
    return;
  }

  let dataUrl = null;
  try {
    dataUrl = await readFileAsDataURL(file);
  } catch {
    setMsg(galleryMsg, "Could not read that image.");
    return;
  }

  const caption = galCaption.value.trim();
  u.gallery = u.gallery || [];
  u.gallery.push({ id: uid(), dataUrl, caption, ts: Date.now() });

  saveUser(u);
  galImage.value = "";
  galCaption.value = "";
  setMsg(galleryMsg, "Added to gallery ✿");
  setTimeout(() => setMsg(galleryMsg, ""), 1200);
  renderGallery();
}

/* ---------- Friends + chat ---------- */
function renderFriends() {
  const u = requireUser();
  if (!u) return;

  friendsList.innerHTML = "";
  BOT_FRIENDS.forEach(f => {
    const el = document.createElement("div");
    el.className = "friend";

    const left = document.createElement("div");
    left.className = "left";

    const dot = document.createElement("div");
    dot.className = "dot";

    const meta = document.createElement("div");
    meta.innerHTML = `<div class="name">${escapeHtml(f.name)}</div><div class="tag">${escapeHtml(f.tag)}</div>`;

    left.appendChild(dot);
    left.appendChild(meta);

    const open = document.createElement("button");
    open.type = "button";
    open.className = "btn";
    open.textContent = "Chat";
    open.addEventListener("click", () => {
      activeFriendId = f.id;
      friendChatTitle.textContent = `Chat with ${f.name}`;
      renderFriendChat();
    });

    el.appendChild(left);
    el.appendChild(open);
    friendsList.appendChild(el);
  });
}

function friendAutoReply(friendId, userText) {
  const f = BOT_FRIENDS.find(x => x.id === friendId);
  const t = safeLower(userText);

  if (t.includes("pattern")) return `${f.name}: I found a cute flower border idea! Add 3 chains between petals ✿`;
  if (t.includes("sell")) return `${f.name}: Take nice photos by a window + use a simple caption. People love details.`;
  if (t.includes("hi") || t.includes("hello")) return `${f.name}: hiiii ✿ what are you making today?`;

  const replies = [
    `${f.name}: omg cute!! add a tiny bow 🎀`,
    `${f.name}: pastel yarn + flower applique = perfect combo 🌸`,
    `${f.name}: tension tip: relax your hands and breathe ✿`,
    `${f.name}: you should post that in your gallery!`
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function ensureFriendChat(u, friendId) {
  u.chats.friends = u.chats.friends || {};
  u.chats.friends[friendId] = u.chats.friends[friendId] || [];
  return u.chats.friends[friendId];
}

function renderFriendChat() {
  const u = requireUser();
  if (!u) return;

  const f = BOT_FRIENDS.find(x => x.id === activeFriendId) || BOT_FRIENDS[0];
  friendChatTitle.textContent = `Chat with ${f.name}`;
  friendChatLog.innerHTML = "";

  const chat = ensureFriendChat(u, f.id);
  chat.forEach(m => addChatBubble(friendChatLog, m.who, m.text, m.side));

  if (chat.length === 0) {
    addChatBubble(friendChatLog, f.name, "meow hi! want a crochet idea? ✿", "them");
    chat.push({ who: f.name, text: "meow hi! want a crochet idea? ✿", side: "them", ts: Date.now() });
    saveUser(u);
  }
}

function handleFriendChat(e) {
  e.preventDefault();
  const u = requireUser();
  if (!u) return;

  const text = friendChatInput.value.trim();
  if (!text) return;

  const f = BOT_FRIENDS.find(x => x.id === activeFriendId) || BOT_FRIENDS[0];
  const chat = ensureFriendChat(u, f.id);

  chat.push({ who: "You", text, side: "me", ts: Date.now() });
  const reply = friendAutoReply(f.id, text);
  chat.push({ who: f.name, text: reply.replace(`${f.name}: `, ""), side: "them", ts: Date.now() });

  saveUser(u);
  friendChatInput.value = "";
  renderFriendChat();
}

/* ---------- Shop ---------- */
function money(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(0)}`;
}

async function handleSell(e) {
  e.preventDefault();
  const u = requireUser();
  if (!u) return;

  const name = sellName.value.trim();
  const price = Number(sellPrice.value);

  if (!name || !Number.isFinite(price) || price < 1) return;

  let photoUrl = null;
  const file = sellPhoto.files[0];
  if (file) {
    try { photoUrl = await readFileAsDataURL(file); } catch { photoUrl = null; }
  }

  state.shop.listings = state.shop.listings || [];
  state.shop.listings.push({
    id: uid(),
    seller: u.username,
    name,
    price: Math.round(price),
    photoUrl,
    ts: Date.now()
  });

  saveState(state);
  sellName.value = "";
  sellPrice.value = "";
  sellPhoto.value = "";
  renderShop();
  renderCart();
}

function renderShop() {
  shopGrid.innerHTML = "";
  const listings = state.shop.listings || [];

  if (listings.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tiny muted";
    empty.textContent = "No listings yet. Add your first crochet item ✿";
    shopGrid.appendChild(empty);
    return;
  }

  listings.slice().reverse().forEach(it => {
    const card = document.createElement("div");
    card.className = "sitem";

    const img = document.createElement("div");
    img.className = "simg";
    img.style.backgroundImage = it.photoUrl
      ? `url(${it.photoUrl})`
      : "linear-gradient(135deg, rgba(255,111,177,.20), rgba(255,183,214,.20))";

    const body = document.createElement("div");
    body.className = "sbody";

    const row = document.createElement("div");
    row.className = "srow";

    const name = document.createElement("div");
    name.className = "sname";
    name.textContent = it.name;

    const price = document.createElement("div");
    price.className = "sprice";
    price.textContent = money(it.price);

    row.appendChild(name);
    row.appendChild(price);

    const add = document.createElement("button");
    add.type = "button";
    add.className = "btn primary";
    add.textContent = "Add to cart";
    add.addEventListener("click", () => {
      state.shop.cart = state.shop.cart || [];
      state.shop.cart.push({ id: uid(), listingId: it.id });
      saveState(state);
      renderCart();
    });

    body.appendChild(row);
    body.appendChild(add);

    card.appendChild(img);
    card.appendChild(body);

    shopGrid.appendChild(card);
  });
}

function cartTotalValue() {
  const cart = state.shop.cart || [];
  const listings = state.shop.listings || [];
  let total = 0;
  cart.forEach(ci => {
    const it = listings.find(x => x.id === ci.listingId);
    if (it) total += Number(it.price || 0);
  });
  return total;
}

function renderCart() {
  cartList.innerHTML = "";
  const cart = state.shop.cart || [];
  const listings = state.shop.listings || [];

  if (cart.length === 0) {
    const empty = document.createElement("div");
    empty.className = "tiny muted";
    empty.textContent = "Your cart is empty.";
    cartList.appendChild(empty);
    cartTotal.textContent = "$0";
    return;
  }

  cart.forEach(ci => {
    const it = listings.find(x => x.id === ci.listingId);
    if (!it) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const left = document.createElement("div");
    left.innerHTML = `<strong>${escapeHtml(it.name)}</strong><div class="tiny muted">${money(it.price)}</div>`;

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "iconbtn";
    rm.textContent = "Remove";
    rm.addEventListener("click", () => {
      state.shop.cart = (state.shop.cart || []).filter(x => x.id !== ci.id);
      saveState(state);
      renderCart();
    });

    row.appendChild(left);
    row.appendChild(rm);
    cartList.appendChild(row);
  });

  cartTotal.textContent = money(cartTotalValue());
}

function showCheckout(show) {
  checkoutArea.classList.toggle("hidden", !show);
}

function handleCheckout() {
  if ((state.shop.cart || []).length === 0) return;
  showCheckout(true);
}

function handleCancelPay() {
  showCheckout(false);
}

function handlePay() {
  // Demo validation only
  const num = safeLower(cardNumber.value).replaceAll(" ", "");
  const exp = safeLower(cardExp.value);
  const cvc = safeLower(cardCvc.value);

  if (num.length < 12 || exp.length < 4 || cvc.length < 3) {
    alert("Demo: please enter card fields (anything).");
    return;
  }

  alert("Payment complete (fake)! Thanks for supporting crochet ✿");
  state.shop.cart = [];
  saveState(state);
  renderCart();
  showCheckout(false);

  cardNumber.value = "";
  cardExp.value = "";
  cardCvc.value = "";
}

/* ---------- Mini game ---------- */
function renderGame() {
  const u = requireUser();
  if (!u) return;

  u.game = u.game || { yarn: 0, gardenLevel: 1 };
  yarnCountEl.textContent = String(u.game.yarn || 0);
  gardenLevelEl.textContent = String(u.game.gardenLevel || 1);
}

function handleYarnClick() {
  const u = requireUser();
  if (!u) return;

  u.game = u.game || { yarn: 0, gardenLevel: 1 };
  u.game.yarn = (u.game.yarn || 0) + 1;

  saveUser(u);
  renderGame();
}

function handleBuySeed() {
  const u = requireUser();
  if (!u) return;

  u.game = u.game || { yarn: 0, gardenLevel: 1 };
  if ((u.game.yarn || 0) < 10) {
    setMsg(gameMsg, "Not enough yarn yet! Click 🧶 more ✿");
    setTimeout(() => setMsg(gameMsg, ""), 1200);
    return;
  }

  u.game.yarn -= 10;
  u.game.gardenLevel = (u.game.gardenLevel || 1) + 1;

  saveUser(u);
  renderGame();
  setMsg(gameMsg, "Your garden grew! 🌸");
  setTimeout(() => setMsg(gameMsg, ""), 1200);
}

function handleResetGame() {
  const u = requireUser();
  if (!u) return;

  u.game = { yarn: 0, gardenLevel: 1 };
  saveUser(u);
  renderGame();
  setMsg(gameMsg, "Reset ✿");
  setTimeout(() => setMsg(gameMsg, ""), 1200);
}

/* ---------- Boot / render ---------- */
function bootIntoApp() {
  applyTheme(state.theme || "pink");

  const u = requireUser();
  if (!u) return;

  showApp();
  updateSidebar();
  initStickerButtons();

  navTo("home");

  renderPosts();
  renderAiChat();

  loadProfileForm();
  renderGallery();

  renderFriends();
  renderFriendChat();

  renderShop();
  renderCart();

  renderGame();
}

/* ---------- Events ---------- */
themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

signOutBtn.addEventListener("click", handleSignOut);

signupForm.addEventListener("submit", handleSignup);
loginForm.addEventListener("submit", handleLogin);

toLoginBtn.addEventListener("click", () => {
  $("liUsername").focus();
});
toSignupBtn.addEventListener("click", () => {
  $("suName").focus();
});

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navTo(btn.dataset.view);
    if (btn.dataset.view === "profile") loadProfileForm();
    if (btn.dataset.view === "gallery") renderGallery();
    if (btn.dataset.view === "friends") {
      renderFriends();
      renderFriendChat();
    }
    if (btn.dataset.view === "shop") {
      renderShop();
      renderCart();
    }
    if (btn.dataset.view === "minigame") renderGame();
    if (btn.dataset.view === "home") {
      renderPosts();
      renderAiChat();
    }
  });
});

quickPostForm.addEventListener("submit", handleQuickPost);
aiChatForm.addEventListener("submit", handleAiChat);

profileForm.addEventListener("submit", handleProfileSave);
resetDecorBtn.addEventListener("click", handleClearDecor);
stickerBoard.addEventListener("click", handleBoardClick);

galleryForm.addEventListener("submit", handleGalleryAdd);

friendChatForm.addEventListener("submit", handleFriendChat);

sellForm.addEventListener("submit", handleSell);
checkoutBtn.addEventListener("click", handleCheckout);
cancelPayBtn.addEventListener("click", handleCancelPay);
payBtn.addEventListener("click", handlePay);

yarnBtn.addEventListener("click", handleYarnClick);
buySeedBtn.addEventListener("click", handleBuySeed);
resetGameBtn.addEventListener("click", handleResetGame);

/* ---------- Start ---------- */
applyTheme(state.theme || "pink");
if (state.currentUser) {
  bootIntoApp();
} else {
  showAuth();
}
