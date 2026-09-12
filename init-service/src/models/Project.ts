import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  replId: { type: String, required: true, unique: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Project = mongoose.model("Project", ProjectSchema);
