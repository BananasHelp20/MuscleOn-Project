import { readFile, writeFile } from "fs/promises";
import * as model from "./model";
import { join } from "path";
import { read } from "fs";

export async function getSpecificUserData(index: number): Promise<model.User> {
    return (await getUserData())[index];
}

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

    // Alle Dateien GLEICHZEITIG laden mit await
    const [sessionStatsData, statsData, settingsData, exercisesData, usersData, highscoresData, longTermData] = await Promise.all([
        readFile(join(__dirname, "../jsonData/dynamic/sessionStats.json"), 'utf-8').catch(() => '[]'),
        readFile(join(__dirname, "../jsonData/dynamic/stats.json"), 'utf-8').catch(() => '[]'),
        readFile(join(__dirname, "../jsonData/else/settings.json"), 'utf-8').catch(() => '[]'),
        readFile(join(__dirname, "../jsonData/else/supportedExercises.json"), 'utf-8').catch(() => '[]'),
        readFile(join(__dirname, "../jsonData/else/users.json"), 'utf-8').catch(() => '[]'),
        readFile(join(__dirname, "../jsonData/static/allTimeHighscores.json"), 'utf-8').catch(() => '[]'),
        readFile(join(__dirname, "../jsonData/static/average.json"), 'utf-8').catch(() => '[]')
    ]);

    sessionStats = JSON.parse(sessionStatsData);
    shortTermData = JSON.parse(statsData);
    settings = JSON.parse(settingsData);
    supportedExercises = JSON.parse(exercisesData);
    properties = JSON.parse(usersData);
    highscoreData = JSON.parse(highscoresData);
    longTermAverageData = JSON.parse(longTermData);

    for (let i = 0; i < properties.length; i++) {
        let property = properties[getIndexByUserId(properties[i].userId, properties)];
        user = {
            userId: property.userId,
            username: property.username,
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

export async function getDeviceProperties(): Promise<model.deviceProperties> {
    return readFile(join(__dirname, "../jsonData/else/absoluteProperties.json"), 'utf-8').then(data => JSON.parse(data));
}

export async function getSupportedExercises(): Promise<model.supportedExercises> {
    return readFile(join(__dirname, "../jsonData/else/supportedExercises.json"), 'utf-8').then(data => JSON.parse(data));
}

export async function saveSupportedExercises(supportedExercises: model.supportedExercises) {
    return writeFile(join(__dirname, "../jsonData/else/supportedExercises.json"), JSON.stringify(supportedExercises, null, 2));
}

export async function saveDeviceProperties(deviceProperties: model.deviceProperties) {
    return writeFile(join(__dirname, "../jsonData/else/absoluteProperties.json"), JSON.stringify(deviceProperties, null, 2));
}

export async function saveAndAddToJson(userData: model.User) {
    let userProperties: model.userProperties = {
        userId: userData.userId,
        username: userData.username,
        passwd: userData.passwd,
        userMail: userData.userMail,
        weight: userData.weight,
        size: userData.size,
        birthday: userData.birthday,
        sessionTimes: userData.sessionTimes,
        additionalSessions: userData.additionalSessions ? userData.additionalSessions : []
    }
    let sessionStats: model.userSessionData = {
        userId: userData.userId,
        sessionId: userData.userSessionData?.sessionId || 0,
        averageHeartFrequence: userData.userSessionData?.averageHeartFrequence || 0,
        averageOxygen: userData.userSessionData?.averageOxygen || 0,
        averageMuscleUsageInPercent: userData.userSessionData?.averageMuscleUsageInPercent || 0,
        trainedMusclesInCurrentOrLatestSession: userData.userSessionData?.trainedMusclesInCurrentOrLatestSession || [],
        burnedKalories: userData.userSessionData?.burnedKalories || 0,
        training: userData.userSessionData?.training || false
    }
    let shortTermData: model.userShortTermData = {
        userId: userData.userId,
        heartFrequence: userData.userShortTerm?.heartFrequence || 0,
        oxygen: userData.userShortTerm?.oxygen || 0,
        currentMuscleUsageInPercent: userData.userShortTerm?.currentMuscleUsageInPercent || 0,
        currentMuscleBeingTrained: userData.userShortTerm?.currentMuscleBeingTrained || "",
        currentExercise: userData.userShortTerm?.currentExercise || ""
    }
    let settings: model.userSettings = {
        userId: userData.userId,
        mode: userData.userSettings?.mode || "",
        viewing: userData.userSettings?.viewing || [],
        devMode: userData.userSettings?.devMode || false
    }
    let highscoreData: model.userHighscoreData = {
        userId: userData.userId,
        maxTimeTrained: userData.userHighscores?.maxTimeTrained || "0:00:00",
        maxDoneInOneForEachExercise: userData.userHighscores?.maxDoneInOneForEachExercise || [],
        maxHeartRate: userData.userHighscores?.maxHeartRate || 0
    }
    let longTermAverageData: model.userLongTermAverageData = {
        userId: userData.userId,
        averageTimeTrained: userData.userLongTermAverages?.averageTimeTrained || "0:00:00",
        averageLongtermHeartFrequence: userData.userLongTermAverages?.averageLongtermHeartFrequence || 0,
        averageLongtermOxygen: userData.userLongTermAverages?.averageLongtermOxygen || 0,
        averageLongtermMuscleUsageInPercent: userData.userLongTermAverages?.averageLongtermMuscleUsageInPercent || 0,
        weeklyBurnedCalories: userData.userLongTermAverages?.weeklyBurnedCalories || 0,
        mostDoneExercise: userData.userLongTermAverages?.mostDoneExercise || "",
        mostTrainedMuscle: userData.userLongTermAverages?.mostTrainedMuscle || "",
        monthlyStrengthIncrease: userData.userLongTermAverages?.monthlyStrengthIncrease || 0,
        weeklyTrainingTime: userData.userLongTermAverages?.weeklyTrainingTime || "0:00:00"
    }

    let usersJson: model.userProperties[] = await readFile(join(__dirname, "../jsonData/else/users.json"), 'utf-8').then(data => JSON.parse(data));
    let sessionStatsJson: model.userSessionData[] = await readFile(join(__dirname, "../jsonData/dynamic/sessionStats.json"), 'utf-8').then(data => JSON.parse(data));
    let shortTermDataJson: model.userShortTermData[] = await readFile(join(__dirname, "../jsonData/dynamic/stats.json"), 'utf-8').then(data => JSON.parse(data));
    let settingsJson: model.userSettings[] = await readFile(join(__dirname, "../jsonData/else/settings.json"), 'utf-8').then(data => JSON.parse(data));
    let highscoreDataJson: model.userHighscoreData[] = await readFile(join(__dirname, "../jsonData/static/allTimeHighscores.json"), 'utf-8').then(data => JSON.parse(data));
    let longTermAverageDataJson: model.userLongTermAverageData[] = await readFile(join(__dirname, "../jsonData/static/average.json"), 'utf-8').then(data => JSON.parse(data));

    usersJson.push(userProperties);
    sessionStatsJson.push(sessionStats);
    shortTermDataJson.push(shortTermData);
    settingsJson.push(settings);
    highscoreDataJson.push(highscoreData);
    longTermAverageDataJson.push(longTermAverageData);

    await writeFile(join(__dirname, "../jsonData/else/users.json"), JSON.stringify(usersJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/dynamic/sessionStats.json"), JSON.stringify(sessionStatsJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/dynamic/stats.json"), JSON.stringify(shortTermDataJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/else/settings.json"), JSON.stringify(settingsJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/static/allTimeHighscores.json"), JSON.stringify(highscoreDataJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/static/average.json"), JSON.stringify(longTermAverageDataJson, null, 2));
}

export async function saveAndOverrideIntoJson(userData: model.User) {
    let userProperties: model.userProperties = {
        userId: userData.userId,
        username: userData.username,
        passwd: userData.passwd,
        userMail: userData.userMail,
        weight: userData.weight,
        size: userData.size,
        birthday: userData.birthday,
        sessionTimes: userData.sessionTimes,
        additionalSessions: userData.additionalSessions ? userData.additionalSessions : []
    }
    let sessionStats: model.userSessionData = {
        userId: userData.userId,
        sessionId: userData.userSessionData?.sessionId || 0,
        averageHeartFrequence: userData.userSessionData?.averageHeartFrequence || 0,
        averageOxygen: userData.userSessionData?.averageOxygen || 0,
        averageMuscleUsageInPercent: userData.userSessionData?.averageMuscleUsageInPercent || 0,
        trainedMusclesInCurrentOrLatestSession: userData.userSessionData?.trainedMusclesInCurrentOrLatestSession || [],
        burnedKalories: userData.userSessionData?.burnedKalories || 0,
        training: userData.userSessionData?.training || false
    }
    let shortTermData: model.userShortTermData = {
        userId: userData.userId,
        heartFrequence: userData.userShortTerm?.heartFrequence || 0,
        oxygen: userData.userShortTerm?.oxygen || 0,
        currentMuscleUsageInPercent: userData.userShortTerm?.currentMuscleUsageInPercent || 0,
        currentMuscleBeingTrained: userData.userShortTerm?.currentMuscleBeingTrained || "",
        currentExercise: userData.userShortTerm?.currentExercise || ""
    }
    let settings: model.userSettings = {
        userId: userData.userId,
        mode: userData.userSettings?.mode || "",
        viewing: userData.userSettings?.viewing || [],
        devMode: userData.userSettings?.devMode || false
    }
    let highscoreData: model.userHighscoreData = {
        userId: userData.userId,
        maxTimeTrained: userData.userHighscores?.maxTimeTrained || "0:00:00",
        maxDoneInOneForEachExercise: userData.userHighscores?.maxDoneInOneForEachExercise || [],
        maxHeartRate: userData.userHighscores?.maxHeartRate || 0
    }
    let longTermAverageData: model.userLongTermAverageData = {
        userId: userData.userId,
        averageTimeTrained: userData.userLongTermAverages?.averageTimeTrained || "0:00:00",
        averageLongtermHeartFrequence: userData.userLongTermAverages?.averageLongtermHeartFrequence || 0,
        averageLongtermOxygen: userData.userLongTermAverages?.averageLongtermOxygen || 0,
        averageLongtermMuscleUsageInPercent: userData.userLongTermAverages?.averageLongtermMuscleUsageInPercent || 0,
        weeklyBurnedCalories: userData.userLongTermAverages?.weeklyBurnedCalories || 0,
        mostDoneExercise: userData.userLongTermAverages?.mostDoneExercise || "",
        mostTrainedMuscle: userData.userLongTermAverages?.mostTrainedMuscle || "",
        monthlyStrengthIncrease: userData.userLongTermAverages?.monthlyStrengthIncrease || 0,
        weeklyTrainingTime: userData.userLongTermAverages?.weeklyTrainingTime || "0:00:00"
    }

    let usersJson: model.userProperties[] = await readFile(join(__dirname, "../jsonData/else/users.json"), 'utf-8').then(data => JSON.parse(data));
    let sessionStatsJson: model.userSessionData[] = await readFile(join(__dirname, "../jsonData/dynamic/sessionStats.json"), 'utf-8').then(data => JSON.parse(data));
    let shortTermDataJson: model.userShortTermData[] = await readFile(join(__dirname, "../jsonData/dynamic/stats.json"), 'utf-8').then(data => JSON.parse(data));
    let settingsJson: model.userSettings[] = await readFile(join(__dirname, "../jsonData/else/settings.json"), 'utf-8').then(data => JSON.parse(data));
    let highscoreDataJson: model.userHighscoreData[] = await readFile(join(__dirname, "../jsonData/static/allTimeHighscores.json"), 'utf-8').then(data => JSON.parse(data));
    let longTermAverageDataJson: model.userLongTermAverageData[] = await readFile(join(__dirname, "../jsonData/static/average.json"), 'utf-8').then(data => JSON.parse(data));

    usersJson[getIndexByUserId(userData.userId, usersJson)] = userProperties;
    sessionStatsJson[getIndexByUserId(userData.userId, sessionStatsJson)] = sessionStats;
    shortTermDataJson[getIndexByUserId(userData.userId, shortTermDataJson)] = shortTermData;
    settingsJson[getIndexByUserId(userData.userId, settingsJson)] = settings;
    highscoreDataJson[getIndexByUserId(userData.userId, highscoreDataJson)] = highscoreData;
    longTermAverageDataJson[getIndexByUserId(userData.userId, longTermAverageDataJson)] = longTermAverageData;

    await writeFile(join(__dirname, "../jsonData/else/users.json"), JSON.stringify(usersJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/dynamic/sessionStats.json"), JSON.stringify(sessionStatsJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/dynamic/stats.json"), JSON.stringify(shortTermDataJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/else/settings.json"), JSON.stringify(settingsJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/static/allTimeHighscores.json"), JSON.stringify(highscoreDataJson, null, 2));
    await writeFile(join(__dirname, "../jsonData/static/average.json"), JSON.stringify(longTermAverageDataJson, null, 2));
}

export async function saveAndOverrideAllUsers(userData: model.User[]) {
    for (let i = 0; i < userData.length; i++) {
        await saveAndOverrideIntoJson(userData[i]);
    }
}

export async function deleteUser(userId: number) {
    let userData = await getUserData();
    if (userId >= userData.length || userId < 0) {
        throw new Error("User id out of bounds (not found)");
    }
    userData.splice(userId, 1);
    await saveAndOverrideAllUsers(userData);
}