# 🚀 ProjX – Academic Project Management System

> A full-stack web application that streamlines academic project tracking between **students** and their **guides (supervisors)**, featuring role-based dashboards, real-time progress tracking, announcements, reminders, and more.

---

## 📌 Overview

ProjX is designed for academic institutions to manage final-year or semester-long projects end-to-end. Students can submit and track projects, while guides can evaluate progress, post announcements, and maintain to-do lists — all through a clean, session-secured web interface.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB Atlas (via Mongoose ODM) |
| **Session Management** | `express-session` + `connect-mongo` |
| **Frontend** | HTML5, Vanilla CSS, Vanilla JavaScript |
| **Styling Utility** | Tailwind CSS (config present) |
| **Dev Tooling** | Nodemon |

---

## ✨ Features

### 🎓 Student Portal
- Secure login/signup with role-based ID assignment (`S<rollNumber>`)
- Personal project dashboard — view, add, edit, delete projects
- Project status tracking: **Pending → In Progress → Completed**
- Calendar-based **reminder system**
- View guide announcements in real time

### 🧑‍🏫 Guide Portal
- Secure login/signup with role-based ID assignment (`G<rollNumber>`)
- Manage and evaluate assigned student projects
- Post and delete **announcements** to all students
- Personal **to-do list** with completion tracking
- Search projects by title; view stats (ongoing / completed / pending)

### 🔒 Security
- Session-based authentication with `express-session`
- Sessions persisted in MongoDB via `connect-mongo`
- Protected routes using `isAuthenticated` middleware
- Automatic redirect to login for unauthenticated access

---

## 📁 Project Structure

```
ProjX/
├── server1.js          # Main Express server & all API routes
├── models/
│   └── model.js        # Mongoose schemas & models
├── login/              # Frontend (served as static files)
│   ├── login.html      # Login page
│   ├── signup.html     # Registration page
│   ├── stud_dash.html  # Student dashboard
│   ├── guide_dash.html # Guide dashboard
│   ├── stud_proj.html  # Student project management page
│   ├── guide_proj.html # Guide project management page
│   ├── Calendar.html   # Student reminder calendar
│   ├── login.css       # Shared stylesheet
│   ├── login.js        # Login logic
│   ├── signup.js       # Signup logic
│   ├── guideDash.js    # Guide dashboard logic
│   └── guide_proj.js   # Guide project logic
├── package.json
├── tailwind.config.js
└── .gitignore
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB instance)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ProjX.git
cd ProjX
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

A template is provided — just copy it and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/PJX?retryWrites=true&w=majority&appName=<AppName>
SESSION_SECRET=your-strong-secret-key
PORT=5000
```

> The `.env` file is already in `.gitignore` — your credentials will never be accidentally committed.

### 4. Run the development server

```bash
npm run dev      # with hot-reload via nodemon
# or
npm start        # standard node
```

### 5. Open in browser

```
http://localhost:5000
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/` | Login |
| `POST` | `/signup` | Register student or guide |
| `POST` | `/logout` | Destroy session |
| `GET` | `/check-session` | Check current session status |

### Projects (Guide)
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/projects` | Get all projects for logged-in guide |
| `GET` | `/projects/stats` | Get project counts by status |
| `GET` | `/projects/search?name=` | Search projects by title |
| `GET` | `/projects/:id` | Get a single project by ID |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |

### Projects (Student)
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/stud/projects` | Get all projects for logged-in student |
| `POST` | `/stud/projects` | Add a new project |
| `PUT` | `/stud/projects/:id` | Update a student's project |
| `DELETE` | `/stud/projects/:id` | Delete a student's project |

### Guides
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/guides` | Get all guides |
| `GET` | `/guides/:guideID` | Get a specific guide |

### Notes, Announcements, Todos, Reminders
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET/POST/DELETE` | `/notes` | ✅ | Manage notes |
| `GET/POST/DELETE` | `/announcements` | ✅ | Manage announcements |
| `GET/POST/PUT/DELETE` | `/todos` | ✅ | Guide to-do list |
| `GET/POST/DELETE` | `/reminders` | — | Student calendar reminders |

### User Info
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/get-user` | Get currently logged-in student name |
| `GET` | `/stud/get-user` | Get student ID and name |

---

## 🗃️ Data Models

| Model | Key Fields |
|---|---|
| `Student` | `studentID`, `name`, `rollNumber`, `password`, `course`, `department` |
| `Guide` | `guideID`, `name`, `rollNumber`, `password`, `course`, `department` |
| `Project` | `title`, `currentStatus`, `percentage`, `guideID`, `studentID`, `desc`, `lastUpdate`, `lastEval` |
| `Reminder` | `day`, `month`, `year`, `reminder`, `studentID` |
| `GuideTodo` | `description`, `guideID`, `completed` |
| `Note` | `content`, `createdAt` |
| `Announcement` | `guide_id`, `announcement_text`, timestamps |

---

## 🚧 Roadmap / Improvements

- [ ] Move credentials to `.env` (remove hardcoded secrets)
- [ ] Add password hashing (bcrypt)
- [ ] Add input validation (Joi / express-validator)
- [ ] Write unit & integration tests (Jest + Supertest)
- [ ] Implement forgot-password flow
- [ ] Add file/report upload support per project

---

## 📄 License

This project is licensed under the **MIT License**.

---

*Built with ❤️ as a portfolio project demonstrating full-stack Node.js development with MongoDB and session-based authentication.*
