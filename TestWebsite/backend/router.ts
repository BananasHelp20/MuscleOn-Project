import e from "express";
import { get } from "http";
import { deleteUser, getUserData, getDeviceProperties, getSupportedExercises, saveAndOverrideIntoJson, saveAndAddToJson, getSpecificUserData, saveDeviceProperties, saveSupportedExercises } from "./read";
import { User } from "./model";
import * as model from "./model";


export const muscleRouter = e.Router();
let userData: model.User[]; //Hier werden die Daten der User gespeichert
let deviceProperties: model.deviceProperties; //Hier werden die Daten der Geräte gespeichert
let supportedExercises: model.supportedExercises; //Hier werden die Daten der unterstützten Übungen gespeichert
let loggedInUser: number = -1; //Hier wird die ID des aktuell eingeloggten Users gespeichert

muscleRouter.get('/api/getData/all', async (req, res) => {
    res.json({ users: await getUserData() });
});

muscleRouter.post('/api/sendLoggedInUser', async (req, res) => {
    loggedInUser = await req.body.json().userId;
    res.statusCode = 200;
    res.json({ message: "Logged in user updated successfully" });
});

muscleRouter.get('/api/getData/:id', async (req, res) => {
    res.json(await getSpecificUserData(Number(req.params.id)));
});

muscleRouter.post('/api/saveSettings/:id', async (req, res) => {
    const settings = await req.body.json();
    userData = await getUserData();
    if (Number(req.params.id) >= userData.length || Number(req.params.id) < 0) {
        res.statusCode = 404;
        res.json({ message: "User id out of bounds (not found)" });
        return;
    }
    userData[Number(req.params.id)].userSettings = settings;
    saveAndOverrideIntoJson(userData[Number(req.params.id)]);
    res.statusCode = 200;
    res.json({ message: "Settings saved successfully" });
});

muscleRouter.post('/api/addUser', async (req, res) => {
    const newUser = await req.body.json();  // ← await hinzufügen
    userData = await getUserData();  // ← userData aktualisieren
    const newId = userData.length;
    const newUserData: User = {
        userId: newId,
        username: newUser.username,
        userMail: newUser.userMail,  // ← userMail statt mail
        passwd: newUser.passwd,
        weight: newUser.weight,
        size: newUser.size,
        birthday: newUser.birthday,
        sessionTimes: newUser.sessionTimes,
        userSessionData: newUser.userSessionData,  // ← Alle Properties korrekt übernehmen
        userShortTerm: newUser.userShortTerm,
        userHighscores: newUser.userHighscores,
        userLongTermAverages: newUser.userLongTermAverages,
        userSettings: newUser.userSettings  // ← userSettings statt settings
    }
    await saveAndAddToJson(newUserData);
    res.statusCode = 200;
    res.json({ message: "User added successfully", userId: newId });
});

muscleRouter.get('/api/getDeviceProperties', async (req, res) => {
    res.json(deviceProperties);
});

muscleRouter.post('/api/updateDeviceProperties', async (req, res) => {
    const updatedDeviceProperties = await req.body.json();
    deviceProperties = await getDeviceProperties();
    deviceProperties = {
        running: updatedDeviceProperties.running || deviceProperties.running,
        loggedIn: updatedDeviceProperties.loggedIn || deviceProperties.loggedIn,
        loggedInAsUser: updatedDeviceProperties.loggedInAsUser || deviceProperties.loggedInAsUser,
        loggedInWithUserId: updatedDeviceProperties.loggedInWithUserId || deviceProperties.loggedInWithUserId,
    };
    await saveDeviceProperties(deviceProperties);
    res.statusCode = 200;
    res.json({ message: "Device properties updated successfully" });
});

muscleRouter.get('/api/getSupportedExercises', async (req, res) => {
    res.json(supportedExercises);
});

muscleRouter.post('/api/updateSupportedExercises', async (req, res) => {
    const updatedSupportedExercises = await req.body.json();
    supportedExercises = await getSupportedExercises();
    supportedExercises = {
        excercises: updatedSupportedExercises.exercises || supportedExercises.excercises
    };
    await saveSupportedExercises(supportedExercises);
    res.statusCode = 200;
    res.json({ message: "Supported exercises updated successfully" });
});

muscleRouter.post('/api/deleteUser/:id', async (req, res) => {
    userData = await getUserData();
    if (Number(req.params.id) >= userData.length || Number(req.params.id) < 0) {
        res.statusCode = 404;
        res.json({ message: "User id out of bounds (not found)" });
        return;
    }
    userData.splice(Number(req.params.id), 1);
    //Nach dem Löschen eines Users müssen die IDs der nachfolgenden User angepasst werden, damit sie mit ihrem Index übereinstimmen
    for (let i = Number(req.params.id); i < userData.length; i++) {
        userData[i].userId = i;
    }
    await deleteUser(Number(req.params.id));
    res.statusCode = 200;
    res.json({ message: "User deleted successfully" });
});

muscleRouter.post('/api/updateUser/:id', async (req, res) => {
    const updatedUser = await req.body.json();
    userData = await getUserData();
    if (Number(req.params.id) >= userData.length || Number(req.params.id) < 0) {
        res.statusCode = 404;
        res.json({ message: "User id out of bounds (not found)" });
        return;
    }
    const userToUpdate = userData[Number(req.params.id)];
    //Hier werden nur die übergebenen Felder aktualisiert, damit nicht versehentlich Daten gelöscht werden, die nicht im Request enthalten sind
    userData[Number(req.params.id)] = {
        userId: userToUpdate.userId,
        username: updatedUser.username || userToUpdate.username,
        userMail: updatedUser.mail || userToUpdate.userMail,
        passwd: updatedUser.passwd || userToUpdate.passwd,
        weight: updatedUser.weight || userToUpdate.weight,
        size: updatedUser.size || userToUpdate.size,
        birthday: updatedUser.birthday || userToUpdate.birthday,
        sessionTimes: updatedUser.sessionTimes || userToUpdate.sessionTimes,
        userSessionData: updatedUser.userSessionData || userToUpdate.userSessionData,
        userShortTerm: updatedUser.userShortTerm || userToUpdate.userShortTerm,
        userHighscores: updatedUser.userHighscores || userToUpdate.userHighscores,
        userLongTermAverages: updatedUser.userLongTermAverages || userToUpdate.userLongTermAverages,
        userSettings: updatedUser.userSettings || userToUpdate.userSettings
    };
    await saveAndOverrideIntoJson(userData[Number(req.params.id)]);
    res.statusCode = 200;
    res.json({ message: "User updated successfully" });
});