import e from "express";
import { get } from "http";
import { getUserData } from "./read";

export const muscleRouter = e.Router();

muscleRouter.get('/getData', async (req, res) => {
    res.json(await getUserData());
});

muscleRouter.post('/saveSettings', async (req, res) => {
    console.log(req.body);
    res.json({ message: "Settings saved successfully" });
});

//@Copilot, das da ist JavaScript Endpunkt:
/*fetch("/saveSettings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    });*/