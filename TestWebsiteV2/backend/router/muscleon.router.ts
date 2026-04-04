import express from 'express';
import {setUserData, gatherSupportedExercises, gatherUserData, gatherDeviceData} from '../read';
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