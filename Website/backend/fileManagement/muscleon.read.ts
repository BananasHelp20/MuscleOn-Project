import { readFile, writeFile } from "fs/promises";
import * as model from "../model/muscleon.model";
import { error, log } from "console";

export async function gatherUserData() {
    let userData: model.User = {
        userProperties: await readFile("./data/userProperties.json", 'utf-8').then((data) => JSON.parse(data)),
        additionalSessions: await readFile("./data/userStatic/additionalSessions.json", 'utf-8').then((data) => JSON.parse(data)),
        userSessionData: await readFile("./data/userDynamic/session.json", 'utf-8').then((data) => JSON.parse(data)),
        userShortTerm: await readFile("./data/userDynamic/shortTerm.json", 'utf-8').then((data) => JSON.parse(data)),
        userHighscores: await readFile("./data/userStatic/highscore.json", 'utf-8').then((data) => JSON.parse(data)),
        userLongTermAverages: await readFile("./data/userStatic/average.json", 'utf-8').then((data) => JSON.parse(data)),
        userSettings: await readFile("./data/userStatic/settings.json", 'utf-8').then((data) => JSON.parse(data)),
        userDefinedExercises: await readFile("./data/userStatic/userdefinedExercises.json", 'utf-8').then((data) => JSON.parse(data)),
    };
    return userData;
}

export async function gatherDeviceData() {
    let deviceData: model.DeviceProperties = await readFile("./data/device/currentProperties.json", 'utf-8').then((data) => JSON.parse(data));
    return deviceData;
}

export async function gatherSupportedExercises() {
    let supportedExercises: model.Exercise[] = await readFile("./data/device/supportedExercises.json", 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
}

export async function gatherUnsupportedExercises() {
    let supportedExercises: model.Exercise[] = await readFile("./data/device/unsupportedExercises.json", 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
}

export async function gatherUserExercises() {
    let supportedExercises: model.Exercise[] = await readFile("./data/userStatic/userdefinedExercises.json", 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
}

export async function gatherUserPropertiess() {
    let userProperties: model.UserProperties = await readFile("./data/userProperties.json", 'utf-8').then((data) => JSON.parse(data));
    return userProperties;
}

export async function appendValidationCode(codeObject:{userId:number, validationCode:string | boolean}) {
    let objects: {userId:number, validationCode:string | boolean}[] = await readFile("./data/validationCodes.json", 'utf-8').then(data => JSON.parse(data));
    objects.push(codeObject);
    await writeFile("./data/validationCodes.json", JSON.stringify(objects))
}

export async function getValidationCode(userId:number): Promise<string | boolean> {
    let objects: {userId:number, validationCode:string | boolean}[] = await readFile("./data/validationCodes.json", 'utf-8').then(data => JSON.parse(data));
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].userId == userId) {
            return objects[i].validationCode;
        }
    }
    return false;
}

export async function addExercise(exercise:model.Exercise) {
    let userExercises: model.Exercise[] = await gatherUserExercises();
    let unsuppExercises: model.Exercise[] = await gatherSupportedExercises();
    if (exercise.public) unsuppExercises.push(exercise);
    userExercises.push(exercise);

    await writeFile("./data/userStatic/userdefinedExercises.json", JSON.stringify(userExercises, null, 2));
    if (exercise.public) await writeFile("./data/device/unsupportedExercises.json", JSON.stringify(unsuppExercises, null, 2));
}

export async function validateExercise(name:string): Promise<boolean> {
    let exercises: model.Exercise[] = (await gatherUserExercises()).concat(await gatherSupportedExercises()).concat(await gatherUnsupportedExercises());
    for (let exercise of exercises) {
        if (exercise.name == name) return true;
    }
    return false;
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
        await writeFile("./data/device/unsupportedExercises.json", JSON.stringify(unsup, null, 2));
    }
    await writeFile("./data/userStatic/userdefinedExercises.json", JSON.stringify(own, null, 2));
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
    let objects: {userId:number, validationCode:string | boolean}[] = await readFile("./data/validationCodes.json", 'utf-8').then(data => JSON.parse(data));
    let newObjects: {userId:number, validationCode:string | boolean}[] = [];
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].userId != userId) {
            newObjects.push(objects[i]);
        }
    }
    await writeFile("./data/validationCodes.json", JSON.stringify(newObjects));
}

export async function setUserData(userData: model.User) {
    await Promise.all([
        writeFile("./data/userProperties.json", JSON.stringify(userData.userProperties, null, 2)),
        writeFile("./data/userStatic/additionalSessions.json", JSON.stringify(userData.additionalSessions, null, 2)),
        writeFile("./data/userDynamic/session.json", JSON.stringify(userData.userSessionData, null, 2)),
        writeFile("./data/userDynamic/shortTerm.json", JSON.stringify(userData.userShortTerm, null, 2)),
        writeFile("./data/userStatic/highscore.json", JSON.stringify(userData.userHighscores, null, 2)),
        writeFile("./data/userStatic/average.json", JSON.stringify(userData.userLongTermAverages, null, 2)),
        writeFile("./data/userStatic/settings.json", JSON.stringify(userData.userSettings, null, 2)),
        writeFile("./data/userStatic/userdefinedExercises.json", JSON.stringify(userData.userDefinedExercises, null, 2))
    ]);
}

export async function setUserSettings(userSettings: model.UserSettings) {
    await writeFile("./data/userStatic/settings.json", JSON.stringify(userSettings, null, 2)).catch(error => {console.error(error)});
}

export async function setUserProperties(userProperties: model.UserProperties) {
    await writeFile("./data/userProperties.json", JSON.stringify(userProperties, null, 2));
}

export async function setDeviceData(deviceData: model.DeviceProperties) {
    await writeFile("./data/device/currentProperties.json", JSON.stringify(deviceData, null, 2));
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
        currentlyInExercise: userProperties.currentlyInExercise,
        usualSessionTimes: times 
    };
    await writeFile("./data/userProperties.json", JSON.stringify(newUserProperties, null, 2));
}

export async function clearUserData(userSettings: model.UserSettings) {
    //save everything user-relevant to database, and clear their files afterwards (and replace current settings with parameter)
    //saveUserDataFromFilesToDatabase(); //including settings since they are being changed by the user pretty often (lightswitch, devmode, viewstuff)
    setUserSettings(userSettings);
    /* dont clear testfiles yet
    writeFile("./data/userProperties.json", "");
    writeFile("./data/userStatic/additionalSessions.json", "");
    writeFile("./data/userDynamic/session.json", "");
    writeFile("./data/userDynamic/shortTerm.json", "");
    writeFile("./data/userStatic/highscore.json", "");
    writeFile("./data/userStatic/average.json", "");
    */
}