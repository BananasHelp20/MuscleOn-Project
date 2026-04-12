import express from 'express';
import {setUserData, gatherSupportedExercises, gatherUserData, gatherDeviceData, setDeviceData, setUserSettings, clearUserData, setUserProperties, saveTrainingsPlan} from '../fileManagement/muscleon.read';
import * as model from '../model/muscleon.model';
export let muscleRouter = express.Router();

muscleRouter.get('/getUserData', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherUserData());
});

muscleRouter.get('/getSupportedExercises', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherSupportedExercises());
});
6
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

muscleRouter.post('/setUserProperties', async (req, res) => {
    await setUserProperties(req.body).catch((err) => {
        console.error("Error writing user propertis:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update user properties" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "User properties updated successfully" });
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
    let answer: model.DatabaseAnswer = {
        found: true,
        userId: 0,
        email: "willi@a.at",
        username: "William"
    };
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/loadUserDataById', async (req, res) => {
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und username="", found=false}
    let answer: model.DatabaseAnswer = {
        found: true,
        userId: 0,
        email: "willi@a.at",
        username: "William"
    };
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/clearUserData', async (req, res) => {
    await clearUserData(req.body).catch((err) => {
        console.error("Error clearing data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to clear data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "logging out successful!" });
});

muscleRouter.post('/addUser', async (req, res) => {
    //in req.body san de UserDaten gespeichert, de sollten glei in de Datenbank gespeichert werdnen
    //sie werden anschließend auch in die Json Daten geladen
    res.statusCode = 200;
    res.send({ message: "logging out successful!" });
});

muscleRouter.post('/deleteUser', async (req, res) => {
    let answer: model.DatabaseAnswer = { //Daten des gelöschten Users zurückgeben
        found: true,
        userId: 0,
        email: "willi@a.at",
        username: "William"
    };
    let userToDelete: model.DeviceProperties = req.body; //notwendige Daten vom Users zur löschung stengan im body drin
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/saveTimesNOPE', async (req, res) => {
    await saveTrainingsPlan(req.body).catch((err) => {
        console.error("Error clearing data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to clear data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "logging out successful!" });
});
