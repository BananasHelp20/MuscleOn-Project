import { getIndexOfUserId, initializeLoginAndSignup, updateUI, updateDisplay} from "./helper";
import { loadPropertiesFromLocalStorage, loadUserSettingsFromLocalStorage, saveDataToLocalStorage, savePropertiesToLocalStorage, saveUserSettingsToLocalStorage } from "./localSave";
import { DeviceProperties, User, UserSettings } from "./model";

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

//setters required
export let userData: User[] = [];
export let currentUser: User;
export let userSettings: UserSettings = {
    userId: 0,
    mode: "darkmode",
    viewing: ["session", "longterm", "real-time"],
    devMode: false
};

export let currentProperties: deviceProperties = {
    running: false,
    loggedIn: false,
    loggedInAsUser: "",
    loggedInWithUserId: -1
}
export let supportedExercises = [];
export let devMode = false;

//init
export function init() {
    currentProperties = loadPropertiesFromLocalStorage();

    if (currentProperties.loggedIn) {
        userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
        selectedUserId = currentProperties.loggedInWithUserId;
    }

    initialiseModes();
    updateUI();
    initializeLoginAndSignup();

    setInterval(() => {
        userData = getUserDataFromESP();
        currentUser = userData[getIndexOfUserId(selectedUserId)];
        updateDisplay(currentUser.userId);
        saveDataToLocalStorage(userData);
        saveUserSettingsToLocalStorage(currentUser.userId);
        savePropertiesToLocalStorage();
    }, 1000);
}