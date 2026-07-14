const STORAGE_KEYS = {
  users: "team-tracker-users",
  entries: "team-tracker-entries",
  notifications: "team-tracker-notifications",
  history: "team-tracker-history",
  currentUser: "team-tracker-current-user"
};

const state = {
  users: [],
  entries: [],
  notifications: [],
  history: [],
  currentUser: null,
  editingId: null,
  view: "login"
};

function initializeSeedData() {
  if (localStorage.getItem(STORAGE_KEYS.users)) {
    return;
  }

  const owner = {
    id: crypto.randomUUID(),
    name: "Alex Morgan",
    email: "owner@team.com",
    username: "owner",
    password: "password123",
    role: "Owner"
  };

  const members = [
    {
      id: crypto.randomUUID(),
      name: "Jamie Chen",
      email: "jamie@team.com",
      username: "jamie",
      password: "password123",
      role: "Team Member"
    },
    {
      id: crypto.randomUUID(),
      name: "Sam Lopez",
      email: "sam@team.com",
      username: "sam",
      password: "password123",
      role: "Team Member"
    }
  ];

  const initialEntries = [
    {
      id: crypto.randomUUID(),
      title: "Sprint planning prep",
      description: "Gathered scope and flagged two dependencies for the next sprint.",
      category: "Task",
      status: "In Progress",
      date: "2026-07-13",
      authorId: members[0].id,
      authorName: members[0].name
    },
    {
      id: crypto.randomUUID(),
      title: "New onboarding flow",
      description: "Drafted a smoother onboarding checklist for the support team.",
      category: "Use Case",
      status: "To Do",
      date: "2026-07-13",
      authorId: members[1].id,
      authorName: members[1].name
    }
  ];

  const initialHistory = [
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: "Owner Alex Morgan created the tracker workspace."
    }
  ];

  state.users = [owner, ...members];
  state.entries = initialEntries;
  state.history = initialHistory;
  state.notifications = [];
  saveState();
}

function loadState() {
  initializeSeedData();
  state.users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]");
  state.entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.entries) || "[]");
  state.notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || "[]");
  state.history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  const storedUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  state.currentUser = storedUser ? JSON.parse(storedUser) : null;
  state.view = state.currentUser ? "dashboard" : "login";
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(state.users));
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(state.notifications));
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
  if (state.currentUser) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(state.currentUser));
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

function addHistory(message) {
  state.history.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    message
  });
  saveState();
}

function addNotification(message, actorName, preview) {
  state.notifications.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    message,
    actorName,
    preview
  });
  saveState();
}

function getCurrentUser() {
  return state.currentUser;
}

function isOwner(user) {
  return user?.role === "Owner";
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const identifier = (formData.get("identifier") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();

  const user = state.users.find((entry) => {
    const usernameMatch = entry.username.toLowerCase() === identifier;
    const emailMatch = entry.email.toLowerCase() === identifier;
    return usernameMatch || emailMatch;
  });

  if (user && user.password === password) {
    state.currentUser = user;
    state.view = "dashboard";
    addHistory(`${user.name} signed in.`);
    saveState();
    render();
    return;
  }

  alert("Invalid username/email or password.");
}

function handleLogout() {
  state.currentUser = null;
  state.view = "login";
  state.editingId = null;
  saveState();
  render();
}

function handleEntrySubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = {
    title: formData.get("title").toString().trim(),
    description: formData.get("description").toString().trim(),
    category: formData.get("category").toString(),
    status: formData.get("status").toString(),
    date: formData.get("date").toString() || new Date().toISOString().slice(0, 10)
  };

  if (!payload.title || !payload.description) {
    alert("Title and description are required.");
    return;
  }

  const currentUser = getCurrentUser();

  if (state.editingId) {
    const target = state.entries.find((entry) => entry.id === state.editingId);
    if (!target) return;
    if (target.authorId !== currentUser.id && !isOwner(currentUser)) {
      alert("You can only edit your own entries.");
      return;
    }
    Object.assign(target, payload, {
      authorName: currentUser.name,
      authorId: currentUser.id
    });
    addHistory(`${currentUser.name} updated entry “${payload.title}”.`);
    if (!isOwner(currentUser)) {
      addNotification(`${currentUser.name} updated an entry`, currentUser.name, payload.title);
    }
    state.editingId = null;
  } else {
    state.entries.unshift({
      id: crypto.randomUUID(),
      ...payload,
      authorId: currentUser.id,
      authorName: currentUser.name
    });
    addHistory(`${currentUser.name} added a new entry “${payload.title}”.`);
    if (!isOwner(currentUser)) {
      addNotification(`${currentUser.name} added a new entry`, currentUser.name, payload.title);
    }
  }

  saveState();
  render();
}

function handleEditEntry(id) {
  state.editingId = id;
  render();
}

function handleDeleteEntry(id) {
  const currentUser = getCurrentUser();
  const entry = state.entries.find((item) => item.id === id);
  if (!entry) return;
  if (entry.authorId !== currentUser.id && !isOwner(currentUser)) {
    alert("You can only delete your own entries.");
    return;
  }
  state.entries = state.entries.filter((item) => item.id !== id);
  addHistory(`${currentUser.name} deleted entry “${entry.title}”.`);
  saveState();
  render();
}

function handleAddMember(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!isOwner(currentUser)) return;

  const formData = new FormData(event.target);
  const name = formData.get("memberName").toString().trim();
  const email = formData.get("memberEmail").toString().trim();
  const password = formData.get("memberPassword").toString();
  const username = formData.get("memberUsername").toString().trim();

  if (!name || !email || !password || !username) {
    alert("Please complete all fields.");
    return;
  }

  const exists = state.users.some((user) => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    alert("A user with that email or username already exists.");
    return;
  }

  state.users.push({
    id: crypto.randomUUID(),
    name,
    email,
    username,
    password,
    role: "Team Member"
  });
  addHistory(`${currentUser.name} added team member ${name}.`);
  saveState();
  render();
}

function handleRemoveMember(userId) {
  const currentUser = getCurrentUser();
  if (!isOwner(currentUser)) return;
  const user = state.users.find((item) => item.id === userId);
  if (!user || user.role === "Owner") return;
  state.users = state.users.filter((item) => item.id !== userId);
  state.entries = state.entries.filter((entry) => entry.authorId !== userId);
  addHistory(`${currentUser.name} removed team member ${user.name}.`);
  saveState();
  render();
}

function renderLogin() {
  const html = `
    <div class="auth-shell">
      <div class="card auth-card">
        <h1>Team Tracker</h1>
        <p>Replace the spreadsheet with a simple shared workspace for daily updates, tasks, and use cases.</p>
        <form class="form-row" onsubmit="handleLogin(event)">
          <label>
            Email or username
            <input name="identifier" placeholder="owner or owner@team.com" required />
          </label>
          <label>
            Password
            <input type="password" name="password" value="password123" required />
          </label>
          <button class="primary" type="submit">Log in</button>
        </form>
        <small>Demo credentials: owner / password123</small>
      </div>
    </div>
  `;
  document.getElementById("app").innerHTML = html;
}

function renderDashboard() {
  const currentUser = getCurrentUser();
  const editingEntry = state.entries.find((entry) => entry.id === state.editingId) || null;
  const ownerNotifications = state.notifications.slice(0, 5);

  document.getElementById("app").innerHTML = `
    <div class="topbar">
      <div class="brand">
        <div class="dot"></div>
        <div>
          <h2 style="margin:0">Team Tracker</h2>
          <small>Shared daily work updates</small>
        </div>
      </div>
      <div class="actions">
        <div class="badge">${ownerNotifications.length} new</div>
        <button class="secondary" onclick="handleLogout()">Log out</button>
      </div>
    </div>

    <div class="grid two">
      <section class="card stack">
        <div class="entry-header">
          <h3 style="margin:0">Dashboard</h3>
          <span class="pill">${currentUser.name} • ${currentUser.role}</span>
        </div>
        <form class="form-row" onsubmit="handleEntrySubmit(event)">
          <label>
            Title
            <input name="title" value="${editingEntry ? editingEntry.title : ""}" required />
          </label>
          <label>
            Description
            <textarea name="description" required>${editingEntry ? editingEntry.description : ""}</textarea>
          </label>
          <div class="form-row" style="grid-template-columns: 1fr 1fr;">
            <label>
              Category
              <select name="category">
                <option value="Task" ${editingEntry?.category === "Task" ? "selected" : ""}>Task</option>
                <option value="Update" ${editingEntry?.category === "Update" ? "selected" : ""}>Update</option>
                <option value="Use Case" ${editingEntry?.category === "Use Case" ? "selected" : ""}>Use Case</option>
              </select>
            </label>
            <label>
              Status
              <select name="status">
                <option value="To Do" ${editingEntry?.status === "To Do" ? "selected" : ""}>To Do</option>
                <option value="In Progress" ${editingEntry?.status === "In Progress" ? "selected" : ""}>In Progress</option>
                <option value="Done" ${editingEntry?.status === "Done" ? "selected" : ""}>Done</option>
              </select>
            </label>
          </div>
          <label>
            Date
            <input name="date" type="date" value="${editingEntry ? editingEntry.date : new Date().toISOString().slice(0, 10)}" />
          </label>
          <div class="row-actions">
            <button class="primary" type="submit">${editingEntry ? "Save changes" : "Add entry"}</button>
            ${editingEntry ? `<button class="secondary" type="button" onclick="cancelEdit()">Cancel</button>` : ""}
          </div>
        </form>

        <div class="entry-list">
          ${state.entries.map((entry) => `
            <article class="entry">
              <div class="entry-header">
                <div>
                  <strong>${entry.title}</strong>
                  <div class="meta">
                    <span class="pill">${entry.category}</span>
                    <span class="pill">${entry.status}</span>
                    <span class="pill">${entry.authorName}</span>
                  </div>
                </div>
                <small>${entry.date}</small>
              </div>
              <p>${entry.description}</p>
              <div class="row-actions">
                ${(entry.authorId === currentUser.id || isOwner(currentUser)) ? `<button class="secondary" onclick="handleEditEntry('${entry.id}')">Edit</button>` : ""}
                ${(entry.authorId === currentUser.id || isOwner(currentUser)) ? `<button class="danger" onclick="handleDeleteEntry('${entry.id}')">Delete</button>` : ""}
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <aside class="card stack">
        <h3 style="margin:0">Notifications</h3>
        <div class="notification-list">
          ${ownerNotifications.length ? ownerNotifications.map((notification) => `
            <div class="notification">
              <strong>${notification.message}</strong>
              <div>${notification.preview}</div>
              <small>${notification.actorName} • ${new Date(notification.createdAt).toLocaleString()}</small>
            </div>
          `).join("") : `<p>No notifications yet.</p>`}
        </div>

        ${isOwner(currentUser) ? `
          <div>
            <h3 style="margin:0">Owner controls</h3>
            <form class="form-row" onsubmit="handleAddMember(event)">
              <label>
                Member name
                <input name="memberName" placeholder="Taylor Brooks" required />
              </label>
              <label>
                Email
                <input name="memberEmail" type="email" placeholder="taylor@team.com" required />
              </label>
              <label>
                Username
                <input name="memberUsername" placeholder="taylor" required />
              </label>
              <label>
                Password
                <input name="memberPassword" type="password" required />
              </label>
              <button class="primary" type="submit">Add team member</button>
            </form>
            <div class="stack" style="margin-top:12px;">
              ${state.users.filter((user) => user.role !== "Owner").map((user) => `
                <div class="entry">
                  <div class="entry-header">
                    <div>
                      <strong>${user.name}</strong>
                      <div><small>${user.email}</small></div>
                    </div>
                    <button class="danger" onclick="handleRemoveMember('${user.id}')">Remove</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div>
          <h3 style="margin:0">Change log</h3>
          <ul>
            ${state.history.slice(0, 8).map((item) => `<li>${item.message} <small>• ${new Date(item.timestamp).toLocaleString()}</small></li>`).join("")}
          </ul>
        </div>
      </aside>
    </div>
  `;
}

function cancelEdit() {
  state.editingId = null;
  render();
}

function render() {
  if (!state.currentUser) {
    renderLogin();
    return;
  }
  renderDashboard();
}

function boot() {
  loadState();
  render();
}

window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.handleEntrySubmit = handleEntrySubmit;
window.handleEditEntry = handleEditEntry;
window.handleDeleteEntry = handleDeleteEntry;
window.handleAddMember = handleAddMember;
window.handleRemoveMember = handleRemoveMember;
window.cancelEdit = cancelEdit;
window.addEventListener("DOMContentLoaded", boot);
