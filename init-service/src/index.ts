import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config();
import { copyS3Folder, folderExists } from "./aws.js";
import mongoose from "mongoose";
import { Project } from "./models/Project.js";

const app = express();
app.use(express.json())
const frontendUrl = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: frontendUrl === "*" ? "*" : frontendUrl }))

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/replit")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/project", async (req, res) => {
    
    const {replId, language } = req.body;

    if (!replId) {
        res.status(400).send("Bad request");
        return;
    }

    const exists = await folderExists(`code/${replId}`);
    if (!exists) {
        await copyS3Folder(`base/${language}`, `code/${replId}`);
        await Project.create({ replId, language });
        res.send("Project created");
    } else {
        res.send("Project already exists, restoring old code instead!");
    }
})

app.get("/projects", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).send("Error fetching projects");
    }
});

const port = process.env.PORT || 3000;

app.listen(port , () => {
    console.log(`lsitening on ${port}`)
})
