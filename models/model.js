const mongoose = require("mongoose");

// Student Schema
const studentSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  name: String,
  rollNumber: String,
  password: String,
  course: String,
  department: String
}, { collection: "students" });

// Guide Schema
const guideSchema = new mongoose.Schema({
  guideID: { type: String, required: true },
  name: String,
  rollNumber: String,
  password: String,
  course: String,
  department: String
}, { collection: "guides" });

// Placeholder GuideTodo Schema (Replace with actual schema)
const guideTodoSchema = new mongoose.Schema({
  description: String,
  guideID:String,
  completed: { type: Boolean, default: false }
}, { collection: "guideTodos" });

// Placeholder Note Schema (Replace with actual schema)
const noteSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: "notes" });

// Placeholder Announcement Schema (Replace with actual schema)
const announcementSchema = new mongoose.Schema({
  guide_id:String,
  announcement_text: String,
},{timestamps:true} ,{ collection: "announcements" });

// Placeholder Project Schema (Replace with actual schema)
const projectSchema = new mongoose.Schema({
  title: String,
  currentStatus: { type: String, enum: ["In Progress", "Completed", "Pending"] },
  percentage: Number,
  guideID: String,
  desc: String,
  studentID:String,
  lastUpdate: String,
  lastEval: String
}, { collection: "projects" });

//Reminder
const reminderSchema = new mongoose.Schema({
  day: Number,
  month: Number,
  year: Number,
  reminder: String,
  studentID:String
},{ collection: "reminders" });

// Export Models
module.exports = {
  Student: mongoose.model("students", studentSchema),
  Guide: mongoose.model("guides", guideSchema),
  Reminder: mongoose.model("Reminder", reminderSchema),
  GuideTodo: mongoose.model("guideTodos", guideTodoSchema),
  Note: mongoose.model("notes", noteSchema),
  Announcement: mongoose.model("announcements", announcementSchema),
  Project: mongoose.model("projects", projectSchema)
};