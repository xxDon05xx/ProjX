const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const { Student, Guide, Reminder, GuideTodo, Note, Announcement, Project } = require("./models/model");

const app = express();

// Session Middleware
app.use(
  session({
    secret: "your-very-strong-secret-key", // Hardcoded session secret (change for production)
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://PJX_db_user:AWT%40976@awt-cluster.hhqsevw.mongodb.net/PJX?retryWrites=true&w=majority&appName=AWT-Cluster",
      collectionName: "sessions",
    }),
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // Set to true in production with HTTPS
    },
  })
);

// Middleware
app.use(express.static(path.join(__dirname, "login"))); // Serve CSS/JS/html
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const uri = "mongodb+srv://PJX_db_user:AWT%40976@awt-cluster.hhqsevw.mongodb.net/PJX?retryWrites=true&w=majority&appName=AWT-Cluster";
mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Authentication Middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
}

// Generate Unique ID
async function generateUniqueID(prefix, rollNumber, Model, field) {
  let id, exists, counter = 1;
  do {
    id = prefix + rollNumber + (counter > 1 ? "-" + counter : "");
    exists = await Model.findOne({ [field]: id });
    counter++;
  } while (exists);
  return id;
}

// Routes
// Serve login and signup pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "signup.html"));
});

// Protected dashboard routes
app.get("/student-dashboard.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "login", "stud_dash.html"));
});

app.get("/guide-dashboard.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "login", "guide_dash.html"));
});
// app.get("/guide-proj.html", isAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, "login", "guide_proj.html"));
// });

// Check session status
app.get("/check-session", (req, res) => {
  if (req.session.userId) {
    res.json({ 
      success: true, 
      userId: req.session.userId, 
      role: req.session.role 
    });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

// POST login
app.post("/", async (req, res) => {
  const { userID, password } = req.body;

  try {
    let user;
    let role;
    if (userID.startsWith("S")) {
      user = await Student.findOne({ studentID: userID, password: password });
      role = "student";
    } else if (userID.startsWith("G")) {
      user = await Guide.findOne({ guideID: userID, password: password });
      role = "guide";
    } else {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (user) {
      // Store user info in session
      req.session.userId = userID;
      req.session.role = role;
      res.json({ success: true, message: "Login successful", user: { userID, role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// POST Sign up
app.post("/signup", async (req, res) => {
  try {
    const { role, name, rollNumber, password, course, department } = req.body;

    let newUser;

    if (role === "student") {
      const studentID = await generateUniqueID("S", rollNumber, Student, "studentID");
      newUser = new Student({ 
        studentID, 
        name, 
        rollNumber, 
        password,  
        course, 
        department 
      });
      await newUser.save();
      return res.json({ success: true, studentID });
    } else if (role === "guide") {
      const guideID = await generateUniqueID("G", rollNumber, Guide, "guideID");
      newUser = new Guide({ 
        guideID, 
        name, 
        rollNumber, 
        password, 
        course, 
        department
      });
      await newUser.save();
      return res.json({ success: true, guideID });
    }

    res.json({ success: false, message: "Invalid role selected." });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error during signup." });
  }
});

// Projects
app.get("/projects", isAuthenticated, async (req, res) => {
  try {
    const guideID=req.session.userId;
    console.log(guideID);
    const projects = await Project.find({guideID});

    // console.log(projects);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/projects/search", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.query;
    const projects = await Project.find({
      Title: { $regex: name, $options: 'i' }
    })
    .select('Title currentStatus percentage')
    .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/projects/stats", isAuthenticated, async (req, res) => {
  try {
    const ongoing = await Project.countDocuments({ currentStatus: "In Progress" });
    const completed = await Project.countDocuments({ currentStatus: "Completed" });
    const pending = await Project.countDocuments({ currentStatus: "Pending" });
    
    res.json({ ongoing, completed, pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//API ENPOINTS STUDNT PROJCT

// API endpoints
app.get('/stud/projects', async (req, res) => {
  try {
    const studentID=req.session.userId;
    // console.log(studentID);
    const projects = await Project.find({studentID});
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(501).json({ error: 'Failed to fetch projects' });
  }
});


// Get single project by ID
// app.get('/projects/:id', async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }
//     res.json(project);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// Add new project
app.post('/stud/projects', async (req, res) => {
  try {
    console.log("HIIII");
    const lastProject = await Project.findOne().sort({ projectID: -1 });
    const newProjectID = lastProject ? lastProject.projectID + 1 : 1;
    
    const projectData = {
      ...req.body,
      projectID: newProjectID
    };
    console.log(projectData);
    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(501).send(err);
  }
});

// Update project
app.put('/stud/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete project
app.delete('/stud/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get all guides
app.get('/guides', async (req, res) => {
  try {
    const guides = await Guide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).send(err);
  }
});



// API ENDPOINTS GUIDE PAGE

// Get all projects
app.get('/projects', async (req, res) => {
  try {
    const guideID=req.session.userId;
    console.log(guideID);
    const projects = await Project.find({guideID});
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(501).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by ID
app.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get projects by guideID
app.get('/projects/guide/:guideID', async (req, res) => {
  try {
    const projects = await Project.find({ guideID: req.params.guideID });
    res.json(projects);
  } catch (err) {
    console.error('Error fetching guide projects:', err);
    res.status(500).json({ error: 'Failed to fetch guide projects' });
  }
});

// Update project (for guide evaluations and progress updates)
app.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Get all guides
app.get('/guides', async (req, res) => {
  try {
    const guides = await Guide.find();
    res.json(guides);
  } catch (err) {
    console.error('Error fetching guides:', err);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get single guide by ID
app.get('/guides/:guideID', async (req, res) => {
  try {
    const guide = await Guide.findOne({ guideID: req.params.guideID });
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }
    res.json(guide);
  } catch (err) {
    console.error('Error fetching guide:', err);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
});

// Add new project
app.post('/projects', async (req, res) => {
  try {
    const lastProject = await Project.findOne().sort({ projectID: -1 });
    const newProjectID = lastProject ? lastProject.projectID + 1 : 1;
    
    const projectData = {
      ...req.body,
      projectID: newProjectID
    };
    
    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update project
app.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete project
app.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get all guides
app.get('/guides', async (req, res) => {
  try {
    const guides = await Guide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Notes
app.get("/notes", isAuthenticated, async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/notes", isAuthenticated, async (req, res) => {
  try {
    const newNote = new Note(req.body);
    await newNote.save();
    res.json({ message: "Note added!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/notes/:id", isAuthenticated, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements
app.get("/announcements", async (req, res) => {//, isAuthenticated to be added
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/announcements", isAuthenticated, async (req, res) => { //isAuthenticated, 
  try {
    console.log(req.session.userId);
    const {guide_id,announcement_text}=req.body;
    console.log(announcement_text);
    const newAnn=new Announcement({
        guide_id,
        announcement_text
    })
    await newAnn.save();
    res.json({ message: "Announcement added!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/announcements/:id", isAuthenticated, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Todos
app.get("/todos", isAuthenticated, async (req, res) => {
  try {
    const guideId=req.session.userId;
    const todos = await GuideTodo.find({guideID:guideId});
    console.log("todos",todos)
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/todos", isAuthenticated, async (req, res) => {
  try {
    const {description}=req.body;
    // console.log(description);
    const guideID=req.session.userId;
    const newTodo=new GuideTodo({
        guideID,
        description:description
    });
    // console.log(newTodo);
    await newTodo.save();
    res.json({ message: "Todo added!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/todos/:id", isAuthenticated, async (req, res) => {
  try {
    await GuideTodo.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Todo updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/todos/:id", isAuthenticated, async (req, res) => {
  try {
    await GuideTodo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Reminder


app.get('/reminders', async (req, res) => {
  try {
    console.log("HI");
    const studentID=req.session.userId;
    console.log(studentID);
    const reminders = await Reminder.find({studentID});
    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/reminders", async (req, res) => {
  try {
    const studentID=req.session.userId;
    const { day, month, year, reminder} = req.body;

    if (!day || !month || !year || !reminder) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const newReminder = new Reminder({ day, month, year, reminder,studentID });
    await newReminder.save();

    res.json({ success: true, id: newReminder._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete('/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Reminder.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//user Name
app.get("/get-user", async (req, res) => {
  try {
    const studentID = req.session.userId;
    console.log("SID", studentID);

    const student = await Student.findOne({ studentID }).select("name");

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ name: student.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.get("/stud/get-user", async (req, res) => {
  try {
    const studentID = req.session.userId;
    console.log("SID2", studentID);

    const student = await Student.findOne({ studentID }).select("studentID name");

if (!student) {
  return res.status(404).json({ error: "Student not found" });
}

res.json({ studentID: student.studentID, name: student.name });;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});