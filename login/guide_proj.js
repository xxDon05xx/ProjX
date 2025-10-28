// API Base URL
const API_BASE = "http://localhost:5000";
// Check session on page load
async function checkSession() {
  try {
    const response = await fetch(`${API_BASE}/check-session`, {
      credentials: "include",
    });
    const data = await response.json();
    if (!data.success || data.role !== "guide") {
      window.location.href = "/login.html";
    } else {
      loadProjects();
      setupEventListeners();
    }
  } catch (err) {
    console.error("Session check error:", err);
    window.location.href = "/login.html";
  }
}

// ================== PROJECTS ==================
let projects = [];
let currentStatusFilter = 'All';
let searchTerm = '';

// Load projects from database
async function loadProjects() {
  try {
    console.log("Loading projects...");
    const res = await fetch(`${API_BASE}/projects`, {
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/login.html";
      return;
    }
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    projects = await res.json(); // Added await
    console.log("Projects:", projects);
    renderProjects();
    updateStats();
  } catch (err) {
    console.error("Error loading projects:", err);
    alert("Failed to load projects");
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', function(e) {
    searchTerm = e.target.value.toLowerCase();
    renderProjects();
  });

  // Status filter buttons
  const statusButtons = document.querySelectorAll('.status-btn');
  statusButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      statusButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentStatusFilter = this.getAttribute('data-status');
      renderProjects();
    });
  });
}

// Render all projects
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  console.log("Rendering projects...");
  grid.innerHTML = '';

  // Filter projects
  let filteredProjects = projects;

  // Apply status filter
  if (currentStatusFilter !== 'All') {
    filteredProjects = filteredProjects.filter(p => p.currentStatus === currentStatusFilter);
  }

  // Apply search filter
  if (searchTerm) {
    filteredProjects = filteredProjects.filter(p => 
      p.title.toLowerCase().includes(searchTerm) || 
      p.desc.toLowerCase().includes(searchTerm) ||
      p.studentID.toLowerCase().includes(searchTerm)
    );
  }

  // Show empty state if no projects
  if (filteredProjects.length === 0) {
    grid.innerHTML = '<div class="empty-state">No projects found</div>';
    updateStats();
    return;
  }

  // Render each project
  filteredProjects.forEach(project => {
    const card = createProjectCard(project);
    grid.appendChild(card);
  });

  updateStats();
}

// Create a project card element
function createProjectCard(project) {
  const statusClass = project.currentStatus.toLowerCase().replace(' ', '-');
  
  const card = document.createElement('div');
  card.className = 'project-card';
  card.innerHTML = `
    <div class="project-header">
      <div>
        <div class="project-title">${escapeHtml(project.title)}</div>
        <div class="student-info">Student ID: ${escapeHtml(project.studentID)}</div>
        <div class="project-description">${escapeHtml(project.desc)}</div>
      </div>
    </div>
    <div class="project-badges">
      <span class="badge status-${statusClass}">
        ${escapeHtml(project.currentStatus)}
      </span>
    </div>
    
    <div class="update-section">
      <div class="update-header">
        <span class="update-label">Latest Student Update</span>
      </div>
      <div class="update-display ${!project.lastUpdate ? 'no-update' : ''}">
        ${project.lastUpdate ? escapeHtml(project.lastUpdate) : 'No update submitted yet'}
      </div>
      
      <div class="evaluation-section">
        <label class="eval-label">Guide Evaluation & Set Progress:</label>
        <textarea class="eval-input" id="eval-${project._id}" placeholder="Enter your evaluation comments..."></textarea>
        <div class="eval-actions">
          <select class="progress-input" id="status-eval-${project._id}" style="width: 140px;">
            <option value="Planning" ${project.currentStatus === 'Planning' ? 'selected' : ''}>Planning</option>
            <option value="In Progress" ${project.currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Testing" ${project.currentStatus === 'Testing' ? 'selected' : ''}>Testing</option>
            <option value="Completed" ${project.currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="On Hold" ${project.currentStatus === 'On Hold' ? 'selected' : ''}>On Hold</option>
          </select>
          <input type="number" class="progress-input" id="progress-eval-${project._id}" 
            placeholder="Progress %" min="0" max="100" value="${project.percentage}">
          <button class="set-progress-btn" onclick="evaluateProject('${project._id}')">Evaluate & Update</button>
        </div>
        ${project.lastEval && project.lastEval !== 'Evaluation Pending' ? 
          `<div class="last-eval-text">Last evaluation: ${escapeHtml(project.lastEval)}</div>` : ''}
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-header">
        <span>Progress</span>
        <span id="progress-${project._id}">${project.percentage}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="fill-${project._id}" style="width: ${project.percentage}%"></div>
      </div>
    </div>
    <div class="project-footer">
      <span></span>
      <button class="delete-btn" onclick="deleteProject('${project._id}')">Delete Project</button>
    </div>
  `;
  return card;
}

// Update statistics
function updateStats() {
  document.getElementById('totalProjects').textContent = projects.length;
  document.getElementById('activeProjects').textContent = 
    projects.filter(p => p.currentStatus !== 'Completed').length;
  document.getElementById('progressProjects').textContent = 
    projects.filter(p => p.currentStatus === 'In Progress').length;
  document.getElementById('completedProjects').textContent = 
    projects.filter(p => p.currentStatus === 'Completed').length;
}

// Evaluate project - main function for guide
function evaluateProject(projectId) {
  const evaluation = document.getElementById(`eval-${projectId}`).value.trim();
  const progressValue = parseInt(document.getElementById(`progress-eval-${projectId}`).value);
  const statusValue = document.getElementById(`status-eval-${projectId}`).value;

  if (!evaluation) {
    alert('Please enter evaluation comments');
    return;
  }

  if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
    alert('Please enter a valid progress percentage (0-100)');
    return;
  }

  // Update the project with evaluation, progress, and status
  const updateData = {
    lastEval: evaluation,
    percentage: progressValue,
    currentStatus: statusValue
  };

  fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'credentials': 'include'
    },
    body: JSON.stringify(updateData),
    credentials: 'include'
  })
  .then(res => {
    if (res.ok) {
      // Clear the evaluation input
      document.getElementById(`eval-${projectId}`).value = '';
      loadProjects();
      alert('Evaluation saved and progress updated successfully!');
    } else {
      throw new Error('Failed to update project');
    }
  })
  .catch(err => {
    console.log(projectId);
    console.error("Error updating project:", err);
    alert('Error saving evaluation!');
  });
}

// Delete project
function deleteProject(projectId) {
  if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    .then(res => {
      if (res.ok) {
        loadProjects();
        alert('Project deleted successfully!');
      } else {
        throw new Error('Failed to delete project');
      }
    })
    .catch(err => {
      console.error("Error deleting project:", err);
      alert('Error deleting project!');
    });
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Initialize on page load
window.onload = checkSession;