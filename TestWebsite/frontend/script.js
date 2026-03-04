let avgHeartRateDisplay = document.getElementById("averageHeartFrequence");
let avgOxygenDisplay = document.getElementById("averageOxygen");
let avgMuscleUsageDisplay = document.getElementById("averageMuscleUsageInPercent");
let trainedMusclesInCurrentOrLatestSessionDisplay = document.getElementById("trainedMuscles");

let heartRateDisplay = document.getElementById("heartFrequence");
let oxygenDisplay = document.getElementById("oxygen");
let currentMuscleBeingTrainedDisplay = document.getElementById("currentMuscleBeingTrained");
let currentExerciseDisplay = document.getElementById("currentExercise");

let maxTimeTrainedDisplay = document.getElementById("maxTimeTrained");
let maxDoneInOneForEachExerciseDisplay = document.getElementById("maxDoneInOneForEachExercise");
let maxHeartRateDisplay = document.getElementById("maxHeartRate");
let averageTimeTrainedDisplay = document.getElementById("averageTimeTrained");
let averageHeartFrequenceDisplay = document.getElementById("averageHeartFrequence");
let averageOxygenDisplay = document.getElementById("averageOxygen")
let averageMuscleUsageInPercentDisplay = document.getElementById("averageMuscleUsageInPercent");
let weeklyBurnedCaloriesDisplay = document.getElementById("weeklyBurnedCalories");
let monthlyStrengthIncreaseDisplay = document.getElementById("monthlyStrengthIncrease");
let weeklyTrainingTimeDisplay = document.getElementById("weeklyTrainingTime");
let mostTrainedMuscleDisplay = document.getElementById("mostTrainedMuscle");
let mostDoneExerciseDisplay = document.getElementById("mostDoneExercise");
let selectedUserId = 0;

let longtermStatsSection = document.getElementById("staticDiv");
let realTimeStatsSection = document.getElementById("realTimeDiv");
let sessionStatsSection = document.getElementById("dynamicDiv");

let user = {
    userId: 0,
    userSessionData: {
        sessionId: 0,
        averageHeartFrequence: 0,
        averageOxygen: 0,
        averageMuscleUsageInPercent: 0,
        trainedMusclesInCurrentOrLatestSession: []
    },

    userShortTerm: {
        heartFrequence: 0,
        oxygen: 0,
        currentMuscleBeingTrained: "",
        currentExercise: ""
    },

    userHighscores: {
        maxTimeTrained: 0,
        maxDoneInOneForEachExercise: [],
        maxHeartRate: 0,
    },

    userLongTermAverages: {
        averageTimeTrained: 0,
        averageLongtermHeartFrequence: 0,
        averageLongtermOxygen: 0,
        averageLongtermMuscleUsageInPercent: 0,
    },

    userOtherStats: {
        weeklyBurnedCalories: 0,
        monthlyStrengthIncrease: 0,
        weeklyTrainingTime: 0,
        mostTrainedMuscle: "",
        mostDoneExercise: ""
    },

    userSettings: {
        mode: "darkmode",
        viewing: ["session", "longterm", "real-time"],
        devMode: false
    }
}
let userData = [user];

let currentProperties = {
    running: false,
    loggedIn: false,
    loggedInAsUser: ""
}

let supportedExercises = [];
let devMode = false;

function getIndexOfUserId(userId) {
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userId === userId) {
            return i;
        }
    }
    return -1;
}

function init() {
    setInterval(() => {
        //updateFromJsonData();
        updateDisplay(selectedUserId);
    }, 1000);
    document.getElementById("lightSwitch").addEventListener("click", () => {
        userData[getIndexOfUserId(selectedUserId)].userSettings.mode = userData[getIndexOfUserId(selectedUserId)].userSettings.mode === "lightmode" ? "darkmode" : "lightmode";
        updateSettings(selectedUserId);
    });
    document.getElementById("dev").addEventListener("click", () => {
        devMode = !devMode;
        userData[getIndexOfUserId(selectedUserId)].userSettings.devMode = devMode;
        updateSettings(selectedUserId);
    });
    document.getElementById("viewingSession").addEventListener("click", () => {
        if (userData[getIndexOfUserId(selectedUserId)].userSettings.viewing.includes("session")) {
            sessionStatsSection.attributes.hidden = false;
            document.getElementById("viewingSession").checked = true;
        } else {
            sessionStatsSection.attributes.hidden = true;
            document.getElementById("viewingSession").checked = false;
        }
        updateSettings(selectedUserId);
    });
    document.getElementById("viewingLongterm").addEventListener("click", () => {
        if (userData[getIndexOfUserId(selectedUserId)].userSettings.viewing.includes("real-time")) {
            realTimeStatsSection.attributes.hidden = false;
            document.getElementById("viewingRealTime").checked = true;
        } else {
            realTimeStatsSection.attributes.hidden = true;
            document.getElementById("viewingRealTime").checked = false;
        }
        updateSettings(selectedUserId);
    });
    document.getElementById("viewingRealTime").addEventListener("click", () => {
        if (userData[getIndexOfUserId(selectedUserId)].userSettings.viewing.includes("longterm")) {
            longtermStatsSection.attributes.hidden = false;
            document.getElementById("viewingLongterm").checked = true;
        } else {
            longtermStatsSection.attributes.hidden = true;
            document.getElementById("viewingLongterm").checked = false;
        }
        updateSettings(selectedUserId);
    });
}

function setSettings(selectedUserId) { //send settings to backend and save them in json file
    let mode = document.getElementById("lightSwitch").value;
    let viewing = [];
    if (document.getElementById("viewingSession").checked) {
        viewing.push("session");
    }
    if (document.getElementById("viewingLongterm").checked) {
        viewing.push("longterm");
    }
    if (document.getElementById("viewingRealTime").checked) {
        viewing.push("real-time");
    };

    let settings = {
        userId: selectedUserId,
        mode: mode,
        viewing: viewing,
        devMode: devMode
    }

    fetch("/saveSettings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    });

    userData[getIndexOfUserId(selectedUserId)].userSettings.mode = mode;
    userData[getIndexOfUserId(selectedUserId)].userSettings.viewing = viewing;
    userData[getIndexOfUserId(selectedUserId)].userSettings.devMode = devMode;
}


function updateSettings() {
    document.getElementById("lightSwitch").innerText = userData[getIndexOfUserId(selectedUserId)].userSettings.mode === "lightmode" ? "darkmode" : "lightmode";
    document.getElementById("viewingSession").checked = userData[getIndexOfUserId(selectedUserId)].userSettings.viewing.includes("session");
    document.getElementById("viewingLongterm").checked = userData[getIndexOfUserId(selectedUserId)].userSettings.viewing.includes("longterm");
    document.getElementById("viewingRealTime").checked = userData[getIndexOfUserId(selectedUserId)].userSettings.viewing.includes("real-time");
    document.getElementById("dev").innerText = userData[getIndexOfUserId(selectedUserId)].userSettings.devMode ? "devmode" : "usermode";
}

function updateFromJsonData() {
    fetch("/getData") // assemble userData in typescript from json files
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.users.length; i++) {
                userData[getIndexOfUserId(data.users[i].userId)] = data.users[i];
            }
            updateDisplay(selectedUserId);
        })
        .catch(error => {
            console.error("Error fetching JSON:", error);
        });
}

function updateDisplay(selectedUserId) {
    if (selectedUserId === undefined) {
        selectedUserId = userData[0].userId;
    }
    let user = userData[getIndexOfUserId(selectedUserId)];
    if (user) {
        avgHeartRateDisplay.textContent = user.userSessionData.averageHeartFrequence;
        avgOxygenDisplay.textContent = user.userSessionData.averageOxygen;
        avgMuscleUsageDisplay.textContent = user.userSessionData.averageMuscleUsageInPercent;
        trainedMusclesInCurrentOrLatestSessionDisplay.textContent = user.userSessionData.trainedMusclesInCurrentOrLatestSession.join(", ");
        
        heartRateDisplay.textContent = user.userShortTerm.heartFrequence;
        oxygenDisplay.textContent = user.userShortTerm.oxygen;
        currentMuscleBeingTrainedDisplay.textContent = user.userShortTerm.currentMuscleBeingTrained;
        currentExerciseDisplay.textContent = user.userShortTerm.currentExercise;

        maxTimeTrainedDisplay.textContent = user.userHighscores.maxTimeTrained;
        maxDoneInOneForEachExerciseDisplay.textContent = user.userHighscores.maxDoneInOneForEachExercise.join(", ");
        maxHeartRateDisplay.textContent = user.userHighscores.maxHeartRate;

        averageTimeTrainedDisplay.textContent = user.userLongTermAverages.averageTimeTrained;
        averageHeartFrequenceDisplay.textContent = user.userLongTermAverages.averageLongtermHeartFrequence;
        averageOxygenDisplay.textContent = user.userLongTermAverages.averageLongtermOxygen;
        averageMuscleUsageInPercentDisplay.textContent = user.userLongTermAverages.averageLongtermMuscleUsageInPercent;

        weeklyBurnedCaloriesDisplay.textContent = user.userOtherStats.weeklyBurnedCalories;
        monthlyStrengthIncreaseDisplay.textContent = user.userOtherStats.monthlyStrengthIncrease;
        weeklyTrainingTimeDisplay.textContent = user.userOtherStats.weeklyTrainingTime;
        mostTrainedMuscleDisplay.textContent = user.userOtherStats.mostTrainedMuscle;
        mostDoneExerciseDisplay.textContent = user.userOtherStats.mostDoneExercise;
    }
}

init();