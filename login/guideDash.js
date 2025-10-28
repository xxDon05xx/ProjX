// API Base URL
const API_BASE = "http://localhost:5000";

// ================== PROJECTS ==================
let projects = [];

// Load projects from database
async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects/`);
    projects = await res.json();
    renderProjects();
    updateStats();
  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

// Render Projects
function renderProjects(filter = "") {
  const list = document.getElementById("projectsList");
  list.innerHTML = "";
  
  let filtered = projects;
  if (filter) {
    filtered = projects.filter(p =>
      p.Title.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  if (filtered.length === 0 && filter) {
    alert("No projects found!");
    return;
  }
  
  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "project-item";
    div.innerHTML = `
      <div>
        <strong>${p.title}</strong> 
        <span class="pill">${p.currentStatus}</span>
      </div>
      <div>${p.percentage}%</div>
    `;
    list.appendChild(div);
  });
}

// Search project
async function searchProject() {
  const searchTerm = document.getElementById("projectName").value.trim();
  
  if (!searchTerm) {
    loadProjects(); // Load all if search is empty
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/projects/search?name=${encodeURIComponent(searchTerm)}`);
    projects = await res.json();
    renderProjects();
    updateStats();
  } catch (err) {
    console.error("Error searching projects:", err);
  }
}

// Update Stats from backend
async function updateStats() {
  try {
    const res = await fetch(`${API_BASE}/projects/stats`);
    const stats = await res.json();
    
    document.getElementById("statOngoing").textContent = stats.ongoing;
    document.getElementById("statCompleted").textContent = stats.completed;
    document.getElementById("statPending").textContent = stats.pending;
  } catch (err) {
    console.error("Error updating stats:", err);
  }
}

// ================== ANNOUNCEMENTS ==================
async function loadAnnouncements() {
  const res = await fetch(`${API_BASE}/announcements`);
  const data = await res.json();
  renderAnnouncements(data);
}

function renderAnnouncements(announcements) {
  const list = document.getElementById("announcementsList");
  list.innerHTML = "";
  announcements.forEach(a => {
    const div = document.createElement("div");
    div.className = "announcement-item";
    div.innerHTML = `
      <span>${a.announcement_text}</span>
      <button class="close-btn" onclick="deleteAnnouncement('${a._id}')">×</button>
    `;
    list.appendChild(div);
  });
}

async function addAnnouncement(e) {
  e.preventDefault();
  let input = document.getElementById("announcementInput");
  let text = input.value.trim();
  console.log(text);
  if (!text) return;

  try {
    await fetch(`${API_BASE}/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      guide_id: "GSAM",
      announcement_text: text
    })
  });
  } catch (error) {
    console.log(error);
  }
  

  input.value = "";
  loadAnnouncements();
}

async function deleteAnnouncement(id) {
  await fetch(`${API_BASE}/announcements/${id}`, { method: "DELETE" });
  loadAnnouncements();
}

// ================== NOTES ==================
async function loadNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  const data = await res.json();
  renderNotes(data);
}

function renderNotes(notes) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  notes.forEach(n => {
    const div = document.createElement("div");
    div.className = "note-item";
    div.innerHTML = `
      <span>${n.note_text}</span>
      <button class="close-btn" onclick="deleteNote('${n._id}')">×</button>
    `;
    list.appendChild(div);
  });
}

async function addNote(e) {
  e.preventDefault();
  let input = document.getElementById("noteInput");
  let text = input.value.trim();
  if (!text) return;

  await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      note_id: Date.now(),
      guide_id: 1,
      note_text: text
    })
  });

  input.value = "";
  loadNotes();
}

async function deleteNote(id) {
  await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
  loadNotes();
}

// ================== TODOS ==================
async function loadTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  console.log("HI");
  const data = await res.json();
  console.log(data);
  renderTodos(data);
}

function renderTodos(todos) {
  const list = document.getElementById("todosList");
  list.innerHTML = "";
  todos.forEach(t => {
    const div = document.createElement("div");
    div.className = "todo-item";
    div.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${t.completed ? 'checked' : ''} 
             onchange="toggleTodo('${t._id}', ${!t.completed})">
      <span class="todo-text ${t.completed ? 'completed' : ''}">${t.description}</span>
      <button class="close-btn" onclick="deleteTodo('${t._id}')">×</button>
    `;
    list.appendChild(div);
  });
}

async function addTodo(e) {
  e.preventDefault();
  let input = document.getElementById("todoInput");
  let text = input.value.trim();
  if (!text) return;

  await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: text
    })
  });

  input.value = "";
  loadTodos();
}

async function toggleTodo(id, completed) {
  await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
  loadTodos();
}
document.getElementById("dashboardBtn").addEventListener("click", () => {
      window.location.href = "/guide-dashboard.html"; // Already on guide dashboard
    });

    document.getElementById("projectsBtn").addEventListener("click", () => {
      window.location.href = "/guide_proj.html";
    });
    document.getElementById("logBtn").addEventListener("click", () => {
      window.location.href = "/login.html";
    });
// ================== INIT ==================
loadProjects();
loadAnnouncements();
loadNotes();
loadTodos();