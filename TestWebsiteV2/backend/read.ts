import { readFile, writeFile } from "fs/promises";
import * as model from "./model/muscleon.model";

export async function gatherUserData() {
    let userData: model.User = {
        userProperties: await readFile("./data/userProperties.json", 'utf-8').then((data) => JSON.parse(data)),
        additionalSessions: await readFile("./data/userStatic/additionalSessions.json", 'utf-8').then((data) => JSON.parse(data)),
        userSessionData: await readFile("./data/userDynamic/session.json", 'utf-8').then((data) => JSON.parse(data)),
        userShortTerm: await readFile("./data/userDynamic/shortTerm.json", 'utf-8').then((data) => JSON.parse(data)),
        userHighscores: await readFile("./data/userStatic/highscore.json", 'utf-8').then((data) => JSON.parse(data)),
        userLongTermAverages: await readFile("./data/userStatic/average.json", 'utf-8').then((data) => JSON.parse(data)),
        userSettings: await readFile("./data/userStatic/settings.json", 'utf-8').then((data) => JSON.parse(data)),
    };
    return userData;
}

export async function gatherDeviceData() {
    let deviceData: model.deviceProperties = await readFile("./data/device/currentProperties.json", 'utf-8').then((data) => JSON.parse(data));
    return deviceData;
}

export async function gatherSupportedExercises() {
    let supportedExercises: model.exercise[] = await readFile("./data/device/supportedExercises.json", 'utf-8').then((data) => JSON.parse(data));
    return supportedExercises;
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
    ]);
}

export async function setDeviceData(deviceData: model.deviceProperties) {
    await writeFile("./data/device/currentProperties.json", JSON.stringify(deviceData, null, 2));
}