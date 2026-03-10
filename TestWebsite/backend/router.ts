import e from "express";
import { get } from "http";
import { getUserData, getDeviceProperties, saveToJson, getSupportedExercises } from "./read";
import { User } from "./model";
import * as model from "./model";


const muscleRouter = e.Router();
let userData: model.User[] = await getUserData(); //Hier werden die Daten der User gespeichert
let deviceProperties: model.deviceProperties = await getDeviceProperties(); //Hier werden die Daten der Geräte gespeichert
let supportedExercises: model.supportedExercises = await getSupportedExercises(); //Hier werden die Daten der unterstützten Übungen gespeichert

muscleRouter.get('/api/getData/:id', async (req, res) => {
    res.json(await getUserData());
});

muscleRouter.post('/api/saveSettings/:id', async (req, res) => {
    const settings = await req.body.json();
    if (Number(req.params.id) >= userData.length || Number(req.params.id) < 0) {
        res.statusCode = 404;
        res.json({ message: "User id out of bounds (not found)" });
        return;
    }
    userData[Number(req.params.id)].userSettings = settings;
    res.statusCode = 200;
    res.json({ message: "Settings saved successfully" });
});

muscleRouter.post('/api/addUser', async (req, res) => {
    const newUser = req.body.json();
    const newId = userData.length;
    const newUserData: User = {
        userId: newId,
        userName: newUser.userName,
        userMail: newUser.mail,
        passwd: newUser.passwd,
        weight: newUser.weight,
        size: newUser.size,
        birthday: newUser.birthday,
        sessionTimes: newUser.sessionTimes,
        userSessionData: null,
        userShortTerm: null,
        userHighscores: null,
        userLongTermAverages: null,
        userSettings: newUser.settings
    }
    saveToJson(newUserData);
    res.statusCode = 200;
    res.json({ message: "User added successfully", userId: newId });
});