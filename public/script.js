const loggedInUser = JSON.parse(
    localStorage.getItem("my-ai-user") || "null"
);

if (!loggedInUser?.name || !loggedInUser?.email) {
    window.location.replace("/login.html");
    throw new Error("Login required");
}

document.getElementById("profile-name").textContent =
    loggedInUser.name;

document.getElementById("profile-email").textContent =
    loggedInUser.email;

document.getElementById("profile-avatar").textContent =
    loggedInUser.name.charAt(0).toUpperCase();

document.getElementById("logout-btn")
    .addEventListener("click", () => {

        localStorage.removeItem("my-ai-user");

        window.location.replace("/login.html");

    });const pdfInput = document.getElementById("pdf-upload");
const uploadStatus = document.getElementById("upload-status");
const removePdf = document.getElementById("remove-pdf");

let documentId = null;
const attachmentBtn = document.getElementById("attachment-btn");
const attachmentMenu = document.getElementById("attachment-menu");

attachmentBtn.addEventListener("click", (event) => {
  event.stopPropagation();

  if (busy) return;

  attachmentMenu.hidden = !attachmentMenu.hidden;
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".attachment-wrapper")) {
    attachmentMenu.hidden = true;
  }
});

pdfInput.addEventListener("change", () => {
  attachmentMenu.hidden = true;
});

removePdf.addEventListener("click", () => {
  attachmentMenu.hidden = true;
});

pdfInput.addEventListener("change", async () => {

  const file = pdfInput.files[0];

  if (!file || busy) return;

  documentId = null;

  const formData = new FormData();
  formData.append("pdf", file);

  uploadStatus.textContent = "Processing PDF...";
  sendBtn.disabled = true;
  pdfInput.disabled = true;
  removePdf.disabled = true;
  busy = true;

  try {

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    documentId = data.documentId;
    documentId = data.documentId;

const attachment = document.createElement("div");
attachment.className = "message user pdf-message";

const fileIcon = document.createElement("span");
fileIcon.className = "pdf-icon";
fileIcon.textContent = "📄";

const fileDetails = document.createElement("div");

const fileName = document.createElement("strong");
fileName.textContent = file.name;

const fileType = document.createElement("small");
fileType.textContent = "PDF Document";

fileDetails.append(fileName, fileType);
attachment.append(fileIcon, fileDetails);

const welcome = chatBox.querySelector(".welcome");
if (welcome) welcome.remove();

chatBox.appendChild(attachment);
chatBox.scrollTop = chatBox.scrollHeight;

uploadStatus.textContent = "";

    uploadStatus.textContent =
      `✓ ${file.name} (${data.chunks} chunks)`;

  } catch (error) {

    documentId = null;

    uploadStatus.textContent = error.message;

  } finally {

    sendBtn.disabled = false;
    pdfInput.disabled = false;
    removePdf.disabled = false;
    busy = false;
    pdfInput.value = "";

  }

});

removePdf.addEventListener("click", () => {

  if (busy) return;

  documentId = null;
  pdfInput.value = "";

  uploadStatus.textContent =
    "No document uploaded";

});
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const newChatBtn = document.getElementById("new-chat");
const chatList = document.getElementById("chat-list");

const STORAGE_KEY = "my-ai-chats-" + loggedInUser.email;

let chats = loadChats();      // [{ id, title, messages, updatedAt }]
let currentChatId = null;     // null = new chat, abhi save nahi hui
let busy = false;

/* ---------- Storage ---------- */

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveChats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error("Could not save chats:", error);
  }
}

function getCurrentChat() {
  return chats.find((chat) => chat.id === currentChatId) || null;
}

/* ---------- UI helpers ---------- */

function showWelcome() {
  chatBox.replaceChildren();

  const welcome = document.createElement("div");
  welcome.className = "welcome";

  const title = document.createElement("h1");
  title.textContent = "What can I help with?";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Ask me anything to get started.";

  welcome.append(title, subtitle);
  chatBox.appendChild(welcome);
}

function addMessage(role, content) {
  const welcome = chatBox.querySelector(".welcome");
  if (welcome) welcome.remove();

  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;

  if (role === "assistant") {
    // AI ka jawab markdown hota hai -> colorful HTML (sanitized)
    renderMarkdown(bubble, content);
    bubble.classList.add("rendered");
  } else {
    // User ka text hamesha plain text (XSS safe)
    bubble.textContent = content;
  }

  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  return bubble;
}

function renderChat() {
  const chat = getCurrentChat();

  if (!chat || chat.messages.length === 0) {
    showWelcome();
    return;
  }

  chatBox.replaceChildren();
  chat.messages.forEach((m) => addMessage(m.role, m.content));
}

function renderSidebar() {
  chatList.replaceChildren();

  const sorted = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  sorted.forEach((chat) => {
    const item = document.createElement("div");
    item.className = "chat-item" + (chat.id === currentChatId ? " active" : "");

    const title = document.createElement("span");
    title.className = "chat-title";
    title.textContent = chat.title;
    title.title = chat.title;
    title.addEventListener("click", () => openChat(chat.id));

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete chat");
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    });

    item.append(title, del);
    chatList.appendChild(item);
  });
}

/* ---------- Chat actions ---------- */

function openChat(id) {
  if (busy) return;

  currentChatId = id;
  documentId = null;
  pdfInput.value = "";

  uploadStatus.textContent =
    "No document uploaded";

  renderChat();
  renderSidebar();
}

function deleteChat(id) {
  if (busy) return;

  chats = chats.filter((chat) => chat.id !== id);
  saveChats();

  if (id === currentChatId) {
    currentChatId = null;
    documentId = null;
    pdfInput.value = "";
    uploadStatus.textContent = "No document uploaded";

    renderChat();
  }

  renderSidebar();
}

function startNewChat() {
  if (busy) return;

  currentChatId = null;
  documentId = null;
  pdfInput.value = "";

  uploadStatus.textContent =
    "No document uploaded";

  renderChat();
  renderSidebar();
  input.focus();
}

function createChat(firstMessage) {
  const chat = {
    id: Date.now().toString(),
    title: firstMessage.length > 30 ? firstMessage.slice(0, 30) + "…" : firstMessage,
    messages: [],
    updatedAt: Date.now()
  };
  chats.push(chat);
  currentChatId = chat.id;
  return chat;
}

/* ---------- Events ---------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text || busy) return;

  const chat = getCurrentChat() || createChat(text);

  chat.messages.push({ role: "user", content: text });
  chat.updatedAt = Date.now();
  saveChats();
  renderSidebar();

  addMessage("user", text);
  input.value = "";
  busy = true;
  sendBtn.disabled = true;

  const loading = addMessage("assistant", "Thinking...");
  loading.classList.add("loading");

  let reply = "";

  try {
    const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: chat.messages.slice(-20),
    documentId: documentId
  })
});

    if (!response.ok) {
      let message = "Request failed.";
      try {
        const data = await response.json();
        message = data.error || message;
      } catch {}
      throw new Error(message);
    }

    // Streaming: jawab chunk-by-chunk aata hai (typing effect)
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    loading.classList.remove("loading");
    loading.classList.add("rendered");
    loading.textContent = "";

    // Har chunk pe render nahi karte, har frame pe ek baar (smooth + fast)
    let frame = null;
    const paint = () => {
      frame = null;
      renderMarkdown(loading, reply);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      reply += decoder.decode(value, { stream: true });
      if (!frame) frame = requestAnimationFrame(paint);
    }

    reply += decoder.decode();

if (frame) cancelAnimationFrame(frame);
paint();

    if (!reply.trim()) {
      throw new Error("Empty response from AI.");
    }

    chat.messages.push({ role: "assistant", content: reply });
    chat.updatedAt = Date.now();
    saveChats();
  } catch (error) {
    loading.classList.remove("loading", "rendered");
    loading.classList.add("error");
    loading.textContent = `Error: ${error.message}`;

    // Failed user message ko history se hata do, warna agli request
    // me do user messages lagataar chale jayenge aur API reject karegi.
    chat.messages.pop();
    saveChats();
  } finally {
    busy = false;
    sendBtn.disabled = false;
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
    renderSidebar();
  }
});

// Enter = send, Shift+Enter = new line
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

newChatBtn.addEventListener("click", startNewChat);

/* ---------- Init ---------- */

renderChat();
renderSidebar();