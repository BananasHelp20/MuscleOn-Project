import express from 'express';
import { setUserData, gatherSupportedExercises, gatherUnsupportedExercises, gatherUserExercises, gatherUserData, gatherDeviceData, setDeviceData, setUserSettings, clearUserData, setUserProperties, saveTrainingsPlan, appendValidationCode, getValidationCode, delValidationCode, addExercise, validateExercise, deleteExercise, saveExercise, getTasks, saveTasks, downloadExercises, uploadExercises } from '../fileManagement/muscleon.read';
import * as model from '../model/muscleon.model';
// import { resumeExercise, startOrResumeSession, stopExercise, stopSession } from '../databaseManagement/muscleon.calc';
import { sendMail, validateMail } from '../mail/muscleon.mail';
export let muscleRouter = express.Router();

muscleRouter.get('/getUserData', async (req, res) => { //Userdaten aus den JSON files holen und zurücksenden, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und userName="", found=false}
    res.statusCode = 200;
    res.send(await gatherUserData());
});

muscleRouter.get('/getTasks', async (req, res) => { //Tasks aus den JSON files holen und zurücksenden.
    res.statusCode = 200;
    res.send(await getTasks());
});

muscleRouter.get('/getSupportedExercises', async (req, res) => { //SupportedExercises aus den JSON files holen und zurücksenden.
    res.statusCode = 200;
    res.send(await gatherSupportedExercises());
});

muscleRouter.get('/getDeviceData', async (req, res) => { //DeviceData aus den JSON files holen und zurücksenden.
    res.statusCode = 200;
    res.send(await gatherDeviceData());
});

muscleRouter.post('/setUserData', async (req, res) => { //Nutzerdaten empfangen und lokale files überschreiben, wenn user ned gefunen wurde, wird ein error geworfen
    await setUserData(req.body).catch((err) => {
        console.error("Error writing user data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update user data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "User data updated successfully" });
});

muscleRouter.post('/setUserSettings', async (req, res) => { //Quasi selbes wie setUserData, nur spezifisch für settings
    await setUserSettings(req.body).catch((err) => {
        console.error("Error writing user settings:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update user settings" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "User settings updated successfully" });
});

muscleRouter.post('/setUserProperties', async (req, res) => { //selbes prinzip wie setUserSettings
    await setUserProperties(req.body).catch((err) => {
        console.error("Error writing user propertis:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update user properties" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "User properties updated successfully" });
});

muscleRouter.post('/setDeviceData', async (req, res) => { //selbes wie setUserSettings, nur für DeviceData
    await setDeviceData(req.body).catch((err) => {
        console.error("Error writing device data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to update device data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "Device data updated successfully" });
});

muscleRouter.post('/loadUserData', async (req, res) => { //Dies ist wohl eine eher komplexe Funktion:
    /**
     * Hier werden alle lokalen JSON files die den momentanen Nutzer betreffen aus der Datenbank geladen.
     * Damit werden die lokalen files überschrieben, und in currentProerties.json wird die userId wie auch der name des momentanen Nutzers gespeichert.
     * 
     */
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und userName="", found=false}
    let data = await gatherUserData(); //kann erst gemacht werden, wenn alle Files fertig beschrieben wurden.
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

muscleRouter.post('/loadUserDataById', async (req, res) => { //gleiches wie loadUserData, nur diesmal basierend auf der ID
    /**
     * Hier werden alle lokalen JSON files die den momentanen Nutzer betreffen aus der Datenbank geladen.
     * Damit werden die lokalen files überschrieben, und in currentProerties.json wird die userId wie auch der name des momentanen Nutzers gespeichert.
     * 
     */
    // daten von da Datenbank holen und in de JSON dateien schreiben, wenn user ned gefunden wurde, ein dem entsprechendes objekt answer zurücksenden { userid=-1, und userName="", found=false}
    let data = await gatherUserData(); //kann erst gemacht werden, wenn alle Files fertig beschrieben wurden.
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

muscleRouter.post('/clearUserData', async (req, res) => { //Alle JSON files die den Nutzer betreffen werden gecleared bzw zurückgesetzt, also bei den meisten auf "[]" oder "{}" gsetzt, dies zeigt, das momentan niemand eingeloggt ist.
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
    /*
    Wenn ein nutzer erstellt wird, werden die Daten des nutzers aus req.body ausgelesen. Dann wird in der Datenbank ein Nutzer angelegt mit diesen Daten.
    Von dem neuen Datenbank nutzer wird dann die ID abgefragt, da diese bis zu diesem Zeitpunkt noch nicht feststeht.
    Danach wird loadDatabyuserID mit dieser ID aufgerufen, um die Daten des neuen Nutzers in die JSON files zu laden.
    */
    res.statusCode = 200;
    res.send({ message: "creating user successful!", created: true }); //created sollte false sein wenn fehler aufgetreten sind.
});

muscleRouter.post('/deleteUser', async (req, res) => {// Nutzer in der Datenbank löschen, danach JSON files zurücksetzen.
    let answer: model.DatabaseAnswer = { //Daten des gelöschten Users zurückgeben, dies sind testdaten
        found: true,
        userId: 0,
        email: "willi@a.at",
        userName: "William"
    };
    let userToDelete: model.DeviceProperties = req.body; //notwendige Daten vom Users zur löschung stengan im body drin
    res.statusCode = 200;
    res.send(answer);
});

muscleRouter.post('/getUser/byId', async (req, res) => { //sucht Nutzer in der Datenbank
    let userIdOfUser: {userId: string | number} = req.body; //such in user aus da Datenbank via id, und sende a databaseAnswer zurück, wie bei deleteUser z.B., do schreibst du dann einfach des komplette Userobjekt in answer.userProperties eini.
    res.sendStatus(200); //provisorisch
});

muscleRouter.post("/saveExercise", async (req, res) => { // Exercise speichern
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

muscleRouter.post("/saveTasks", async (req, res) => { // tasks speichern
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

muscleRouter.post('/deleteExercise', async (req, res) => { // exercise löschen
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

muscleRouter.post('/saveTimesNOPE', async (req, res) => { //ghostcode bzw gerade nicht verwendet
    await saveTrainingsPlan(req.body).catch((err) => {
        console.error("Error clearing data:", err);
        res.statusCode = 500;
        res.send({ message: "Failed to clear data" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "logging out successful!" });
});


muscleRouter.get('/getExercises/supported', async (req, res) => { //supported exercises holen
    res.statusCode = 200;
    res.send(await gatherSupportedExercises());
});

muscleRouter.get('/getExercises/unsupported', async (req, res) => { //unsupportet exercises holen
    res.statusCode = 200;
    res.send(await gatherUnsupportedExercises());
});

muscleRouter.get('/getExercises/user', async (req, res) => { // userdefined exercises holen
    res.statusCode = 200;
    res.send(await gatherUserExercises());
});

muscleRouter.get('/downloadExercises', async (req, res) => { // download user exercises as JSON file
    try {
        const exercises = await downloadExercises();
        res.setHeader("Content-Disposition", "attachment; filename=userdefinedExercises.json");
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.send(JSON.stringify(exercises, null, 2));
    } catch (error) {
        console.error("Error downloading exercises:", error);
        res.statusCode = 500;
        res.send({ message: "Failed to download exercises" });
    }
});

muscleRouter.post('/uploadExercises', async (req, res) => { // upload user exercises from JSON file
    try {
        const { exercises } = req.body;
        
        if (!exercises || !Array.isArray(exercises)) {
            res.statusCode = 400;
            res.send({ message: "Invalid request: exercises array required" });
            return;
        }

        const importedCount = await uploadExercises(exercises);
        res.statusCode = 200;
        res.send({ message: "Exercises uploaded successfully", importedCount: importedCount });
    } catch (error) {
        console.error("Error uploading exercises:", error);
        res.statusCode = 500;
        res.send({ message: "Failed to upload exercises: " + (error instanceof Error ? error.message : "Unknown error") });
    }
});

muscleRouter.get('/session/start', async (req, res) => { //session starten (auskommentierter code ist noch nicht implementiert momentan)
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

muscleRouter.get("/exercise/start", async (req, res) => { // exercise starten (auskommentierter code ist noch nicht implementiert momentan)
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

muscleRouter.get("/exercise/skip", async (req, res) => {// exercise skippen (auskommentierter code ist noch nicht implementiert momentan)
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

muscleRouter.post('/session/stop', async (req, res) => { // session stoppen (auskommentierter code ist noch nicht implementiert momentan)
    // await stopSession().catch((err) => {
    //     console.error("Error stopping session:", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error stopping session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ message: "stopping session successful!" });
});

muscleRouter.post('/session/pause', async (req, res) => { // session pausieren (auskommentierter code ist noch nicht implementiert momentan)
    // await pauseSession().catch((err) => {
    //     console.error("Error pausing session", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error pausing session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ message: "pausing session successful!" });
});

muscleRouter.post('/session/resume', async (req, res) => { // session resumen (auskommentierter code ist noch nicht implementiert momentan)
    // await resumeSession().catch((err) => {
    //     console.error("Error resuming session", err);
    //     res.statusCode = 500;
    //     res.send({ message: "Error resuming session" });
    //     return;
    // });
    res.statusCode = 200;
    res.send({ message: "resuming session successful!" });
});

muscleRouter.post('/newExercise', async (req, res) => { // neue Exercise starten
    await addExercise(req.body).catch((err) => {
        console.error("Error creating Exercise:", err);
        res.statusCode = 500;
        res.send({ message: "Error creating Exercise" });
        return;
    });
    res.statusCode = 200;
    res.send({ message: "creating Exercise successful!" });
});

muscleRouter.post('/validateExercise', async (req, res) => { //exercise validieren
    let found = await validateExercise(req.body.name).catch((err) => {
        console.error("Error validating Exercise:", err);
        res.statusCode = 500;
        res.send({ message: "Error validating Exercise" });
        return;
    });
    res.statusCode = 200;
    res.send({ found: found });
});

muscleRouter.post('/sendValidationMail', async (req, res) => { //validationmail senden
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
    let code = await getValidationCode(req.body.userId);
    console.log("Validation code for userId", req.body.userId, "is:", code);
    if (code && req.body.validationCode == code) {
        await delValidationCode(req.body.userId);
        res.send({valid: true});
    } else {
        console.error("Invalid validation code provided for userId:", req.body.userId);
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