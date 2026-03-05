import { readFile } from "fs/promises";
import * as model from "./model";
import { join } from "path";
import { read } from "fs";

export let deviceProperties: model.deviceProperties;
export async function getUserData(): Promise<model.User[]> {
    let userData: model.User[] = [];
    let user: model.User;

    let sessionStats: model.userSessionData[] = [];
    let shortTermData: model.userShortTermData[] = [];
    let highscoreData: model.userHighscoreData[] = [];
    let longTermAverageData: model.userLongTermAverageData[] = [];
    let settings: model.userSettings[] = [];
    let properties: model.userProperties[] = [];
    let supportedExercises: model.supportedExercises;

    readFile(join(__dirname, "../jsonData/dynamic/sessionStats.json"), 'utf-8').then(data => {
        sessionStats = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/dynamic/stats.json"), 'utf-8').then(data => {
        shortTermData = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/dynamic/settings.json"), 'utf-8').then(data => {
        settings = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/else/supportedExercises.json"), 'utf-8').then(data => {
        supportedExercises = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/else/users.json"), 'utf-8').then(data => {
        properties = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/static/allTimeHighscores.json"), 'utf-8').then(data => {
        highscoreData = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/static/longTermAverages.json"), 'utf-8').then(data => {
        longTermAverageData = JSON.parse(data);
    });
    readFile(join(__dirname, "../jsonData/else/absoluteProperties.json"), 'utf-8').then(data => {
        deviceProperties = JSON.parse(data);
    });

    for (let i = 0; i < properties.length; i++) {
        let property = properties[getIndexByUserId(properties[i].userId, properties)];
        user = {
            userId: property.userId,
            userName: property.userName,
            passwd: property.passwd,
            userMail: property.userMail,
            weight: property.weight,
            size: property.size,
            birthday: property.birthday,
            sessionTimes: property.sessionTimes,
            additionalSessions: property.additionalSessions,

            userSessionData: sessionStats[getIndexByUserId(property.userId, sessionStats)],
            userShortTerm: shortTermData[getIndexByUserId(property.userId, shortTermData)],
            userSettings: settings[getIndexByUserId(property.userId, settings)],
            userHighscores: highscoreData[getIndexByUserId(property.userId, highscoreData)],
            userLongTermAverages: longTermAverageData[getIndexByUserId(property.userId, longTermAverageData)]
        }
        userData.push(user);
    }
    return userData.sort((a, b) => a.userId - b.userId);
}

function getIndexByUserId(userId: number, properties: any[]): number {
    for (let i = 0; i < properties.length; i++) {
        if (properties[i].userId === userId) {
            return i;
        }
    }
    return -1;
}