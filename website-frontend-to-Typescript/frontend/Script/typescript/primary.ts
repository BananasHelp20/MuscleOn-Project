import { getIndexOfUserId, initializeLoginAndSignup, updateUI, updateDisplay, initialiseModes} from "./helper";
import { loadDataFromLocalStorage, loadPropertiesFromLocalStorage, loadUserSettingsFromLocalStorage, saveDataToLocalStorage, savePropertiesToLocalStorage, saveUserSettingsToLocalStorage } from "./localSave";
import { DeviceProperties, User, UserSettings } from "./model";
import { getDataFromESP } from "./router";

//important variables
export let avgHeartRateDisplay = document.getElementById("averageHeartFrequence");
export let avgOxygenDisplay = document.getElementById("averageOxygen");
export let avgMuscleUsageDisplay = document.getElementById("averageMuscleUsageInPercent");
export let trainedMusclesInCurrentOrLatestSessionDisplay = document.getElementById("trainedMuscles");

export let heartRateDisplay = document.getElementById("heartFrequence");
export let oxygenDisplay = document.getElementById("oxygen");
export let currentMuscleBeingTrainedDisplay = document.getElementById("currentMuscleBeingTrained");
export let currentExerciseDisplay = document.getElementById("currentExercise");

export let maxTimeTrainedDisplay = document.getElementById("maxTimeTrained");
export let maxDoneInOneForEachExerciseDisplay = document.getElementById("maxDoneInOneForEachExercise");
export let maxHeartRateDisplay = document.getElementById("maxHeartRate");
export let averageTimeTrainedDisplay = document.getElementById("averageTimeTrained");
export let averageHeartFrequenceDisplay = document.getElementById("averageHeartFrequence");
export let averageOxygenDisplay = document.getElementById("averageOxygen")
export let averageMuscleUsageInPercentDisplay = document.getElementById("averageMuscleUsageInPercent");
export let weeklyBurnedCaloriesDisplay = document.getElementById("weeklyBurnedCalories");
export let monthlyStrengthIncreaseDisplay = document.getElementById("monthlyStrengthIncrease");
export let weeklyTrainingTimeDisplay = document.getElementById("weeklyTrainingTime");
export let mostTrainedMuscleDisplay = document.getElementById("mostTrainedMuscle");
export let mostDoneExerciseDisplay = document.getElementById("mostDoneExercise");
export let selectedUserId = 0;

export let longtermStatsSection = document.getElementById("staticDiv");
export let realTimeStatsSection = document.getElementById("realTimeDiv");
export let sessionStatsSection = document.getElementById("dynamicDiv");

//ned verwendet
/*
let userData: User[] = [];
let currentUser: User;
let userSettings: UserSettings = {
    userId: 0,
    mode: "darkmode",
    viewing: ["session", "longterm", "real-time"],
    devMode: false
};

let currentProperties: DeviceProperties = {
    running: false,
    loggedIn: false,
    loggedInAsUser: "",
    loggedInWithUserId: -1
}
let supportedExercises = [];
let devMode = false;*/

//init
export function init() {
    let currentProperties = loadPropertiesFromLocalStorage();
    let userSettings: UserSettings;
    let currentUser: User;

    if (currentProperties.loggedIn) {
        userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
        selectedUserId = currentProperties.loggedInWithUserId;
    }

    initialiseModes();
    updateUI();
    initializeLoginAndSignup();

    if (currentProperties.loggedIn) {
        let userData = loadDataFromLocalStorage();
        setInterval(async () => {
            await getDataFromESP();
            userData = loadDataFromLocalStorage();
            currentUser = userData[getIndexOfUserId(selectedUserId)];
            updateDisplay(currentUser.userId);
            saveUserSettingsToLocalStorage(currentUser.userId);
            savePropertiesToLocalStorage();
        }, 1000);
    }
}