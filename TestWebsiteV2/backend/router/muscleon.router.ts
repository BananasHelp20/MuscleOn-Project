import express from 'express';
import {setUserData, gatherSupportedExercises, gatherUserData, gatherDeviceData, setDeviceData, setUserSettings} from '../read';
import { DatabaseAnswer } from '../model/muscleon.model';
export let muscleRouter = express.Router();

muscleRouter.get('/getUserData', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherUserData());
});

muscleRouter.get('/getSupportedExercises', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherSupportedExercises());
});

muscleRouter.get('/getDeviceData', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherDeviceData());
});

muscleRouter.post('/setUserData', async (req, res) => {
    await setUserData(req.body).catch((err) => {
        console.error("Error writing user data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update user data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "User data updated successfully" });
});

muscleRouter.post('/setUserSettings', async (req, res) => {
    await setUserSettings(req.body).catch((err) => {
        console.error("Error writing user settings:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update user settings" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "User settings updated successfully" });
});

muscleRouter.post('/setDeviceData', async (req, res) => {
    await setDeviceData(req.body).catch((err) => {
        console.error("Error writing device data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update device data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "Device data updated successfully" });
});

muscleRouter.post('/loadUserData', async (req, res) => {
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und username="", found=false}
    let answer: DatabaseAnswer = {
        found: true,
        userId: 0,
        username: "William"
    };
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/loadUserDataById', async (req, res) => {
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und username="", found=false}
    let answer: DatabaseAnswer = {
        found: true,
        userId: 0,
        username: "William"
    };
    res.statusCode = 200;
    res.send(answer);
});