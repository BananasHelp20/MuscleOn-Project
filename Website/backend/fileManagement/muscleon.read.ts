import { readFile, writeFile } from "fs/promises";
import * as model from "../model/muscleon.model";
import { error, log } from "console";
import { join } from "path";

export async function gatherUserData() {
    let userData: model.User = {
        userProperties: await readFile(join(__dirname, "..", "..", "data", "userProperties.json"), 'utf-8').then((data) => JSON.parse(data)),
        additionalSessions: await readFile(join(__dirname, "..", "..", "data", "userStatic", "additionalSessions.json"), 'utf-8').then((data) => JSON.parse(data)),
        userSessionData: await readFile(join(__dirname, "..", "..", "data", "userDynamic", "session.json"), 'utf-8').then((data) => JSON.parse(data)),
        userShortTerm: await readFile(join(__dirname, "..", "..", "data", "userDynamic", "shortTerm.json"), 'utf-8').then((data) => JSON.parse(data)),
        userHighscores: await readFile(join(__dirname, "..", "..", "data", "userStatic", "highscore.json"), 'utf-8').then((data) => JSON.parse(data)),
        userLongTermAverages: await readFile(join(__dirname, "..", "..", "data", "userStatic", "average.json"), 'utf-8').then((data) => JSON.parse(data)),
        userSettings: await readFile(join(__dirname, "..", "..", "data", "userStatic", "settings.json"), 'utf-8').then((data) => JSON.parse(data)),
        userDefinedExercises: await readFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), 'utf-8').then((data) => JSON.parse(data)),
    };
    return userData;
}

export async function gatherDeviceData() {
    let deviceData: model.DeviceProperties = await readFile(join(__dirname, "..", "..", "data", "device", "currentProperties.json"), 'utf-8').then((data) => JSON.parse(data));
    return deviceData;
}

export async function gatherSupportedExercises() {
    let supportedExercises: model.Exercise[] = await readFile(join(__dirname, "..", "..", "data", "device", "supportedExercises.json"), 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
}

export async function gatherUnsupportedExercises() {
    let supportedExercises: model.Exercise[] = await readFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
}

export async function gatherUserExercises() {
    let supportedExercises: model.Exercise[] = await readFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
}

export async function gatherUserPropertiess() {
    let userProperties: model.UserProperties = await readFile(join(__dirname, "..", "..", "data", "userProperties.json"), 'utf-8').then((data) => JSON.parse(data));
    return userProperties;
}

export async function getTasks(): Promise<string[][]> {
    let noah = await readFile(join(__dirname, "..", "..", "data", "devmode", "noahTasks.json"), "utf-8").then((data) => JSON.parse(data));
    let willi = await readFile(join(__dirname, "..", "..", "data", "devmode", "williTasks.json"), "utf-8").then((data) => JSON.parse(data));
    let tobi = await readFile(join(__dirname, "..", "..", "data", "devmode", "tobiTasks.json"), "utf-8").then((data) => JSON.parse(data));
    return [willi, noah, tobi];
}

export async function appendValidationCode(codeObject:{userId:number, validationCode:string | boolean}) {
    let objects: {userId:number, validationCode:string | boolean}[] = await readFile(join(__dirname, "..", "..", "data", "validationCodes.json"), 'utf-8').then(data => JSON.parse(data));
    objects.push(codeObject);
    await writeFile(join(__dirname, "..", "..", "data", "validationCodes.json"), JSON.stringify(objects, null, 2));
}

export async function getValidationCode(userId:number): Promise<string | boolean> {
    let objects: {userId:number, validationCode:string | boolean}[] = await readFile(join(__dirname, "..", "..", "data", "validationCodes.json"), 'utf-8').then(data => JSON.parse(data));
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].userId == userId) {
            return objects[i].validationCode;
        }
    }
    return false;
}

export async function addExercise(exercise:model.Exercise) {
    let userExercises: model.Exercise[] = await gatherUserExercises();
    let unsuppExercises: model.Exercise[] = await gatherUnsupportedExercises();
    if (exercise.public) unsuppExercises.push(exercise);
    userExercises.push(exercise);

    await writeFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), JSON.stringify(userExercises, null, 2));
    if (exercise.public) await writeFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), JSON.stringify(unsuppExercises, null, 2));
}

export async function validateExercise(name:string): Promise<boolean> {
    let exercises: model.Exercise[] = (await gatherUserExercises()).concat(await gatherSupportedExercises()).concat(await gatherUnsupportedExercises());
    for (let exercise of exercises) {
        if (exercise.name == name) return true;
    }
    return false;
}

export async function saveTasks(tasks:string[][]) {
    await writeFile(join(__dirname, "..", "..", "data", "devmode", "williTasks.json"), JSON.stringify(tasks[0], null, 2));
    await writeFile(join(__dirname, "..", "..", "data", "devmode", "noahTasks.json"), JSON.stringify(tasks[1], null, 2));
    await writeFile(join(__dirname, "..", "..", "data", "devmode", "tobiTasks.json"), JSON.stringify(tasks[2], null, 2));
}

export async function saveExercise(exercise: model.Exercise, newExercise: model.Exercise) {
    // NEW: Validation
    if (!exercise || !exercise.name) {
        throw new Error("Invalid exercise: exercise name is required");
    }
    
    let exercises: model.Exercise[] = await gatherUserExercises();
    let unsupEx: model.Exercise[] = await gatherUnsupportedExercises();
    newExercise.exerciseType = "defined";
    
    // FIXED: Proper loop for user-defined exercises
    let temp: number = -1;
    for (let i: number = 0; i < exercises.length; i++) {
        if (exercises[i]?.name == exercise.name) {
            exercises[i] = newExercise;
            temp = i;
        }
    }

    // FIXED: Separate counter for unsupported exercises
    let tempUnsup: number = -1;
    if (exercise.public) {
        for (let i: number = 0; i < unsupEx.length; i++) {
            if (unsupEx[i]?.name == exercise.name) {
                unsupEx[i] = newExercise;
                tempUnsup = i;
            }
        }
    }

    await writeFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), JSON.stringify(exercises, null, 2));
    if (exercise.public && !newExercise.public) {
        for (let i = 0; i < unsupEx.length; i++) {
            if (unsupEx[i].name == exercise.name) unsupEx.splice(i, 1);
        }
        await writeFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), JSON.stringify(unsupEx, null, 2));
    } else if (!exercise.public && newExercise.public) {
        newExercise.exerciseType = "unsupported";
        unsupEx.push(newExercise);
        await writeFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), JSON.stringify(unsupEx, null, 2));
    } else {
        newExercise.exerciseType = "unsupported";
        if (exercise.public) await writeFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), JSON.stringify(unsupEx, null, 2));
    }
}

export async function deleteExercise(name:string) {
    if (await existsInSupported(name)) return false;
    if (await existsInUnsupported(name) && !await existsInDefined(name)) return false;

    let unsup: model.Exercise[] = await gatherUnsupportedExercises();
    let own: model.Exercise[] = await gatherUserExercises();

    for (let i = 0; i < own.length; i++) {
        if (own[i].name == name) own.splice(i, 1);
    }

    if (await existsInUnsupported(name)) {
        for (let i = 0; i < unsup.length; i++) {
            if (unsup[i].name == name) unsup.splice(i, 1);
        }
        await writeFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), JSON.stringify(unsup, null, 2));
    }
    await writeFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), JSON.stringify(own, null, 2));
    return true;
}

export async function existsInDefined(name:string) {
    let userExercises: model.Exercise[] = await gatherUserExercises();
    for (let exercise of userExercises) {
        if (exercise.name == name) return true;
    }
    return false;
}

export async function existsInUnsupported(name:string) {
    let unsupExercises: model.Exercise[] = await gatherUnsupportedExercises();
    for (let exercise of unsupExercises) {
        if (exercise.name == name) return true;
    }
    return false;
}

export async function existsInSupported(name:string) {
    let exercises: model.Exercise[] = await gatherSupportedExercises();
    for (let exercise of exercises) {
        if (exercise.name == name) return true;
    }
    return false;
}

export async function delValidationCode(userId:number) {
    let objects: {userId:number, validationCode:string | boolean}[] = await readFile(join(__dirname, "..", "..", "data", "validationCodes.json"), 'utf-8').then(data => JSON.parse(data));
    let newObjects: {userId:number, validationCode:string | boolean}[] = [];
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].userId != userId) {
            newObjects.push(objects[i]);
        }
    }
    await writeFile(join(__dirname, "..", "..", "data", "validationCodes.json"), JSON.stringify(newObjects, null, 2));
}

export async function setUserData(userData: model.User) {
    await Promise.all([
        writeFile(join(__dirname, "..", "..", "data", "userProperties.json"), JSON.stringify(userData.userProperties, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userStatic", "additionalSessions.json"), JSON.stringify(userData.additionalSessions, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userDynamic", "session.json"), JSON.stringify(userData.userSessionData, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userDynamic", "shortTerm.json"), JSON.stringify(userData.userShortTerm, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userStatic", "highscore.json"), JSON.stringify(userData.userHighscores, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userStatic", "average.json"), JSON.stringify(userData.userLongTermAverages, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userStatic", "settings.json"), JSON.stringify(userData.userSettings, null, 2)),
        writeFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), JSON.stringify(userData.userDefinedExercises, null, 2))
    ]);
}

export async function setUserSettings(userSettings: model.UserSettings) {
    await writeFile(join(__dirname, "..", "..", "data", "userStatic", "settings.json"), JSON.stringify(userSettings, null, 2)).catch(error => {console.error(error)});
}

export async function setUserProperties(userProperties: model.UserProperties) {
    await writeFile(join(__dirname, "..", "..", "data", "userProperties.json"), JSON.stringify(userProperties, null, 2));
}

export async function setDeviceData(deviceData: model.DeviceProperties) {
    await writeFile(join(__dirname, "..", "..", "data", "device", "currentProperties.json"), JSON.stringify(deviceData, null, 2));
}

export async function saveTrainingsPlan(times: model.ExerciseSelection[]) {
    let userProperties: model.UserProperties = await gatherUserPropertiess();
    let newUserProperties: model.UserProperties = {
        userId: userProperties.userId,
        userName: userProperties.userName,
        password: userProperties.password,
        email: userProperties.email,
        weight: userProperties.weight,
        size: userProperties.size,
        birthday: userProperties.birthday,
        verifiedEmail: userProperties.verifiedEmail,
        currentlyTraining: userProperties.currentlyTraining,
        createdPlan: userProperties.createdPlan,
        pausedSession: userProperties.pausedSession,
        currentlyInExercise: userProperties.currentlyInExercise,
        usualSessionTimes: times 
    };
    await writeFile(join(__dirname, "..", "..", "data", "userProperties.json"), JSON.stringify(newUserProperties, null, 2));
}

export async function clearUserData(userSettings: model.UserSettings) {
    //save everything user-relevant to database, and clear their files afterwards (and replace current settings with parameter)
    //saveUserDataFromFilesToDatabase(); //including settings since they are being changed by the user pretty often (lightswitch, devmode, viewstuff)
    setUserSettings(userSettings);
    /* dont clear testfiles yet
    writeFile(join(__dirname, "..", "..", "data", "userProperties.json"), "");
    writeFile(join(__dirname, "..", "..", "data", "userStatic", "additionalSessions.json"), "");
    writeFile(join(__dirname, "..", "..", "data", "userDynamic", "session.json"), "");
    writeFile(join(__dirname, "..", "..", "data", "userDynamic", "shortTerm.json"), "");
    writeFile(join(__dirname, "..", "..", "data", "userStatic", "highscore.json"), "");
    writeFile(join(__dirname, "..", "..", "data", "userStatic", "average.json"), "");
    */
}

export async function downloadExercises(): Promise<model.Exercise[]> {
    let userExercises: model.Exercise[] = await gatherUserExercises();
    return userExercises;
}

export async function uploadExercises(exercises: model.Exercise[]): Promise<number> {
    if (!Array.isArray(exercises) || exercises.length === 0) {
        throw new Error("Invalid exercises data");
    }

    let userExercises: model.Exercise[] = await gatherUserExercises();
    let unsuppExercises: model.Exercise[] = await gatherUnsupportedExercises();
    let importedCount = 0;

    for (let exercise of exercises) {
        // Validate exercise has required fields
        if (!exercise.name || !exercise.description) {
            console.warn("Skipping invalid exercise:", exercise);
            continue;
        }

        // Set default values
        exercise.exerciseType = "defined";
        exercise.weight = exercise.weight || false;
        exercise.public = exercise.public || false;
        exercise.equipment = exercise.equipment || "None";

        // Simply add the exercise without checking for duplicates
        userExercises.push(exercise);

        // Add to unsupported exercises if public
        if (exercise.public) {
            exercise.exerciseType = "unsupported";
            unsuppExercises.push(exercise);
        }

        importedCount++;
    }

    // Save updated exercises
    await writeFile(join(__dirname, "..", "..", "data", "userStatic", "userdefinedExercises.json"), JSON.stringify(userExercises, null, 2));
    if (unsuppExercises.length > 0) {
        await writeFile(join(__dirname, "..", "..", "data", "device", "unsupportedExercises.json"), JSON.stringify(unsuppExercises, null, 2));
    }

    return importedCount;
}