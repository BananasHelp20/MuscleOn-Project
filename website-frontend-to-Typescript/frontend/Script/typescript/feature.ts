import { delay, getIndexOfUserId, updateSettings, updateUI } from "./helper";
import { loadDataFromLocalStorage, loadPropertiesFromLocalStorage, loadUserSettingsFromLocalStorage, saveDataToLocalStorage, savePropertiesToLocalStorage, saveUserSettingsToLocalStorage } from "./localSave";
import { User, UserSettings } from "./model";

export function signup(username: string, password: string, email: string, weight: number, size: number, birthday: string) { // uiuiui
    let userData = loadDataFromLocalStorage();
    let newUserId = userData.length;
    let newUser: User = {
        userId: newUserId,
        username: username,
        passwd: password,
        userMail: email,
        weight: weight,
        size: size,
        sessionTimes: [], //Sessiontimes wird über eien längeren Zeitraum berechnet, wenn der user öfter am selben Tag trainiert. Andere Termine werden als additionalSessions gespeichert.
        birthday: birthday,
        userSessionData: {
            userId: newUserId,
            training: false,
            burnedKalories: 0,
            sessionId: 0,
            averageHeartFrequence: 0,
            averageOxygen: 0,
            averageMuscleUsageInPercent: 0,
            trainedMusclesInCurrentOrLatestSession: []
        },

        userShortTerm: {
            userId: newUserId,
            currentMuscleUsageInPercent: 0,
            heartFrequence: 0,
            oxygen: 0,
            currentMuscleBeingTrained: "",
            currentExercise: ""
        },

        userHighscores: {
            userId: newUserId,
            maxTimeTrained: "0:00:00",
            maxDoneInOneForEachExercise: [],
            maxHeartRate: 0,
        },

        userLongTermAverages: {
            userId: newUserId,
            averageTimeTrained: "0:00:00",
            averageLongtermHeartFrequence: 0,
            averageLongtermOxygen: 0,
            averageLongtermMuscleUsageInPercent: 0,
            weeklyBurnedCalories: 0,
            monthlyStrengthIncrease: 0,
            weeklyTrainingTime: "0:00:00",
            mostTrainedMuscle: "",
            mostDoneExercise: ""
        },

        userSettings: {
            userId: newUserId,
            mode: "darkmode",
            viewing: ["session", "longterm", "real-time"],
            devMode: false
        }
    }
    userData.push(newUser);
    addUser(newUser);
    delay(1500); //wortn, bis er si einloggen kann (bis de daten gespeichert san)
    login(newUser.userId);
}

export function login(userId: number) {
    let userData = loadDataFromLocalStorage();
    let currentProperties = loadPropertiesFromLocalStorage();
    let userSettings = userData[getIndexOfUserId(userId)]?.userSettings;
    if (userId === -1 || getIndexOfUserId(userId) === -1) {
        alert("Keine Daten vom Server erhalten!");
        return;
    }

    let userIndex = -1;
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userId === userId) {
            userIndex = i;
            break;
        }
    }
    
    if (userIndex === -1) {
        alert("Account nicht gefunden, oder nicht in der Datenbank!");
        return;
    }

    let selectedUserId = userId;
    currentProperties.loggedIn = true;
    currentProperties.loggedInAsUser = userData[userIndex].username;
    currentProperties.loggedInWithUserId = userId;
    userSettings = userData[userIndex].userSettings;
    updateSettings(selectedUserId);
    savePropertiesToLocalStorage();
    saveUserSettingsToLocalStorage(userId);
    updateUI();
    window.location.href = "./index.html";
}

export function logout() {
    let currentProperties = loadPropertiesFromLocalStorage();
    let userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
    currentProperties.loggedIn = false;
    currentProperties.loggedInAsUser = "";
    currentProperties.loggedInWithUserId = -1;
    userSettings = {
        userId: -1,
        mode: "darkmode",
        viewing: [],
        devMode: false
    }
    savePropertiesToLocalStorage();
    saveUserSettingsToLocalStorage(-1);
    updateUI();
    location.reload();
}