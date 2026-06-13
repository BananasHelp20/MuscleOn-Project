import express from 'express';
import { setUserData, gatherSupportedExercises, gatherUnsupportedExercises, gatherUserExercises, gatherUserData, gatherDeviceData, setDeviceData, setUserSettings, clearUserData, setUserProperties, saveTrainingsPlan, appendValidationCode, getValidationCode, delValidationCode, addExercise, validateExercise, deleteExercise, saveExercise, getTasks, saveTasks } from '../fileManagement/muscleon.read';
import * as model from '../model/muscleon.model';
// import { resumeExercise, startOrResumeSession, stopExercise, stopSession } from '../databaseManagement/muscleon.calc';
import { sendMail, validateMail } from '../mail/muscleon.mail';
export let muscleRouter = express.Router();

muscleRouter.get('/getUserData', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherUserData());
});

muscleRouter.get('/getTasks', async (req, res) => {
    res.statusCode = 200;
    res.send(await getTasks());
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
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und userName="", found=false}
    let data = await gatherUserData(); //provisorisch
    let answer: model.DatabaseAnswer = {
        found: true,
        userId: data.userProperties.userId,
        email: data.userProperties.email,
        userName: data.userProperties.userName,
        userProperties: data.userProperties,
        userSettings: data.userSettings,
    };
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/loadUserDataById', async (req, res) => {
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und userName="", found=false}
    let data = await gatherUserData(); //provisorisch
    let answer: model.DatabaseAnswer = {
        found: true,
        userId: data.userProperties.userId,
        email: data.userProperties.email,
        userName: data.userProperties.userName,
        userProperties: data.userProperties,
        userSettings: data.userSettings,
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
        userName: "William"
    };
    let userToDelete: model.DeviceProperties = req.body; //notwendige Daten vom Users zur löschung stengan im body drin
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/getUser/byId', async (req, res) => {
    let userIdOfUser: {userId: string | number} = req.body; //such in user aus da Datenbank via id, und sende a databaseAnswer zurück, wie bei deleteUser z.B., do schreibst du dann einfach des komplette Userobjekt in answer.userProperties eini.
    res.sendStatus(200); //provisorisch
});

muscleRouter.post("/saveExercise", async (req, res) => {
    let exercises: { oldExercise: model.Exercise; newExercise: model.Exercise } = req.body;
    await saveExercise(exercises.oldExercise, exercises.newExercise).catch((err) => {
        console.error("Error deleting Exercise:", err);
        res.statusCode = 500;
        res.send({ message: "Error deleting Exercise" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "deleting Exercise successful!" });
});

muscleRouter.post("/saveTasks", async (req, res) => {
    let tasks: string[][] = req.body;
    await saveTasks(tasks).catch((err) => {
        console.error("Error saving tasks:", err);
        res.statusCode = 500;
        res.send({ message: "Error saving tasks" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "saving tasks successful!" });
});

muscleRouter.post('/deleteExercise', async (req, res) => {
    let exerciseToDelete: { name: string } = req.body;
    await deleteExercise(exerciseToDelete.name).catch((err) => {
        console.error("Error deleting Exercise:", err);
        res.statusCode = 500;
        res.send({ message: "Error deleting Exercise" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "deleting Exercise successful!" });
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


muscleRouter.get('/getExercises/supported', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherSupportedExercises());
});

muscleRouter.get('/getExercises/unsupported', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherUnsupportedExercises());
});

muscleRouter.get('/getExercises/user', async (req, res) => {
    res.statusCode = 200;
    res.send(await gatherUserExercises());
});

muscleRouter.get('/session/start', async (req, res) => {
    // await startSession().catch((err) => {
    //     console.error("Error starting session", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error starting session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ // provisorisch
        exercises: (await gatherSupportedExercises()).concat(await gatherUserExercises()),
        exercisesAhead: await gatherSupportedExercises(),
        finishedExercises: await gatherUserExercises(),
    });
});

muscleRouter.get("/exercise/start", async (req, res) => {
    // await startExercise().catch((err) => {
    //     console.error("Error starting exercise:", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error starting exercise" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ //provisorisch
        nextExercise: (await gatherSupportedExercises())[0], //provisorisch
        hasNextExercise: (await gatherSupportedExercises()).length > 1, //provisorisch
    });
});

muscleRouter.get("/exercise/skip", async (req, res) => {
    // await skipExercise().catch((err) => {
    //     console.error("Error skipping exercise:", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error skipping exercise" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({
        nextExercise: (await gatherSupportedExercises())[1], //provisorisch
        hasNextExercise: (await gatherSupportedExercises()).length > 2, //provisorisch
    });
});

muscleRouter.post('/session/stop', async (req, res) => {
    // await stopSession().catch((err) => {
    //     console.error("Error stopping session:", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error stopping session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ message: "stopping session successful!" });
});

muscleRouter.post('/session/pause', async (req, res) => {
    // await pauseSession().catch((err) => {
    //     console.error("Error pausing session", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error pausing session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ message: "pausing session successful!" });
});

muscleRouter.post('/session/resume', async (req, res) => {
    // await resumeSession().catch((err) => {
    //     console.error("Error resuming session", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error resuming session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ message: "resuming session successful!" });
});

muscleRouter.post('/newExercise', async (req, res) => {
    await addExercise(req.body).catch((err) => {
        console.error("Error creating Exercise:", err);
        res.statusCode = 500;
        res.send({ message: "Error creating Exercise" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "creating Exercise successful!" });
});

muscleRouter.post('/validateExercise', async (req, res) => {
    let found = await validateExercise(req.body).catch((err) => {
        console.error("Error validating Exercise:", err);
        res.statusCode = 500;
        res.send({ message: "Error validating Exercise" });
        return;
    });
    res.statusCode = 200;
    res.send({ found: found });
});

muscleRouter.post('/sendValidationMail', async (req, res) => {
    let validationCode = await validateMail(req.body.email);
    if (!validationCode) {
        res.send({validEmail: false});
        return;
    }

    let validationObject = {
        userId: req.body.userId,
        validationCode: validationCode
    }
    if (getValidationCode(req.body.userId) != null) {
        await delValidationCode(req.body.userId);
    }
    await appendValidationCode(validationObject);
    await sendMail({
        from: 'noreply@muscleon.com',
        to: req.body.email,
        subject: 'Email Validation',
        text: `Hey ${req.body.userName},\n your validation code is: ${validationCode}`
    });
    res.send({validEmail: true});
});

muscleRouter.post('/validateMail', async (req, res) => {
    let code = getValidationCode(req.body.userId);
    if (code && req.body.validationCode == code) {
        await delValidationCode(req.body.userId);
        res.send({valid: true});
    } else {
        res.send({valid: false});
    }
});

muscleRouter.post('/deleteValidationCodes', async (req, res) => {
    await delValidationCode(req.body.userId).catch((err) => {
        console.error("Error deleting validation code:", err);
        res.statusCode = 500;
        res.send({ message: "Error deleting validation code" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "validation code deleted successfully!" });
});