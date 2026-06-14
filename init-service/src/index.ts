import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config();
import { copyS3Folder } from "./aws.js";


const app = express();
app.use(express.json())
app.use(cors())

app.post("/project", async (req, res) => {
    
    const {replId, language } = req.body;

    if (!replId) {
        res.status(400).send("Bad request");
        return;
    }

 await copyS3Folder(`base/${language}`, `code/${replId}`);

    res.send("Project created");
})

const port = process.env.PORT || 3000;

app.listen(port , () => {
    console.log(`lsitening on ${port}`)
})
