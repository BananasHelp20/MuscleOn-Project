function syncModes() {
    if (document.getElementById("dev")) document.getElementById("dev").innerText = getSettingsFromLocalStorage().devMode ? "devmode" : "usermode";
    document.getElementById("lightSwitch").innerText = getSettingsFromLocalStorage().mode;
    document.getElementById("modeStylesheet").href = getSettingsFromLocalStorage().mode == "lightmode" ? "./css/light.css" : "./css/dark.css";
}

function initializeLightSwitch() {
    let on = localStorage.getItem("lightSwitch") | true;
    let lightSwitch = document.getElementById("lightSwitch");
    document.getElementById("modeStylesheet").href = on ? "./css/light.css" : "./css/dark.css";
    lightSwitch.innerText = on ? "light mode" : "dark mode"

    lightSwitch.addEventListener("click", () => {
        let settings = getSettingsFromLocalStorage();
        settings.mode = settings.mode == "lightmode" ? "darkmode" : "lightmode"
        document.getElementById("modeStylesheet").href = settings.mode == "lightmode" ? "./css/light.css" : "./css/dark.css";
        document.getElementById("lightSwitch").innerText = settings.mode;
        setUserSettings(settings);
    });
}

function initializeDevMode() {
    let on = getSettingsFromLocalStorage().devMode;
    let devModeSwitch = document.getElementById("dev");
    devModeSwitch.innerText = on ? "devmode" : "usermode";
    
    devModeSwitch.addEventListener("click", () => {
        let settings = getSettingsFromLocalStorage();
        settings.devMode = !settings.devMode;
        devModeSwitch.innerText = settings.devMode ? "devmode" : "usermode";
        setUserSettings(settings);
    });
}

function initializeLogout() {
    let logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener("click", () => {
        logout();
    });

}

function initializeLogin() {
    let loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", () => {
        login();
    });
}

function initializeSignUp() {
    let signUpButton = document.getElementById("signupButton");
    signUpButton.addEventListener("click", () => {
        signUp();
    });
}


function login() { //test this
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if (!email) {
        alert("Bitte fülle das Email-Feld aus!");
        return;
    }
    loadDataFromSpecificUser(email, password).then((answer) => { //do will i, dass, wenn nix gefunden worden is, a Json objekt mit argumente "found", "userId" und "username" returned wird.
        if (answer.found) {
            //user existiert (mit passwort)
            let newDeviceData = {
                running: false,
                loggedIn: true,
                loggedInAsUser: answer.username,
                loggedInWithUserId: answer.userId,
                loadedUserData: true
            }
            localStorage.setItem("deviceData", JSON.stringify(newDeviceData));
            location.href = "./index.html";
        } else {
            alert("Email oder Passwort falsch!");
            return;
        }
    });
}

function logout() {
    let defaultDeviceData = {
        running: false,
        loggedIn: false,
        loggedInAsUser: "",
        loggedInWithUserId: -1,
        loadedUserData: false,
    }
    let defaultSettings = {
        mode: "lightmode",
        viewing: [],
        devMode: false
    }
    localStorage.setItem("deviceData", JSON.stringify(defaultDeviceData));
    localStorage.setItem("userSettings", JSON.stringify(defaultSettings));
    location.reload();
}

function signUp() {
}

function showLoggedIn(deviceData) {
    let loggedInAsDisplay = document.getElementById("currentUser");
    if (deviceData.loggedIn) {
        loggedInAsDisplay.innerHTML = "Eingeloggt als: " + deviceData.loggedInAsUser + " <button id='logoutButton'>Logout</button>";
    } else {
        loggedInAsDisplay.innerHTML = "Du bist nicht eingeloggt. <a href='./login.html'>Login</a> <br>Du hast noch keinen Account? <a href='./signup.html'>Signup</a>";
    }
}

function setModes(data) {
    let lightSwitch = document.getElementById("lightSwitch");
    let devModeSwitch = document.getElementById("dev");
    if (data) {
        localStorage.setItem("lightSwitch", data.lightSwitch);
        localStorage.setItem("devmode", data.devmode);
    } else {
        localStorage.setItem("lightSwitch", true);
        localStorage.setItem("devmode", false);
    }
    let on = localStorage.getItem("lightSwitch");
    document.getElementById("modeStylesheet").href = on ? "./css/light.css" : "./css/dark.css";
    lightSwitch.innerText = on ? "light mode" : "dark mode"
    on = localStorage.getItem("devmode");
    devModeSwitch.innerText = on ? "devmode" : "usermode";
}

function loadAndInitializeChecked(settings) {
    let sessionStatsSection = document.getElementById("dynamicDiv");
    let realTimeStatsSection = document.getElementById("realTimeDiv");
    let longtermStatsSection = document.getElementById("staticDiv");
    localStorage.setItem("userSettings", JSON.stringify(settings));
    if (document.getElementById("viewingRealTime") && document.getElementById("viewingSession") && document.getElementById("viewingLongterm")) {
        if (settings) {
            document.getElementById("viewingRealTime").checked = settings.viewing.realTimeStats;
            document.getElementById("viewingSession").checked = settings.viewing.sessionStats;
            document.getElementById("viewingLongterm").checked = settings.viewing.longtermStats;
        } else {
            document.getElementById("viewingRealTime").checked = true;
            document.getElementById("viewingSession").checked = true;
            document.getElementById("viewingLongterm").checked = true;
        }

        sessionStatsSection.hidden = !settings.viewing.sessionStats;
        realTimeStatsSection.hidden = !settings.viewing.realTimeStats;
        document.getElementById("dynamicHeadline").hidden = !(settings.viewing.realTimeStats || settings.viewing.sessionStats);
        longtermStatsSection.hidden = !settings.viewing.longtermStats;

        document.getElementById("viewingRealTime").addEventListener("click", (event) => {
            let realTimeStatsSection = document.getElementById("realTimeDiv");
            let checked = event.target.checked;
            let deviceData = getDeviceData();
            if (deviceData.loggedIn) {
                let settings = getSettingsFromLocalStorage();
                settings.viewing.realTimeStats = checked;
                localStorage.setItem("userSettings", JSON.stringify(settings));
                setUserSettings(settings);
                realTimeStatsSection.hidden = !checked;
                document.getElementById("dynamicHeadline").hidden = !(settings.viewing.realTimeStats || settings.viewing.sessionStats);
            }
        });

        document.getElementById("viewingSession").addEventListener("click", (event) => {
            let sessionStatsSection = document.getElementById("dynamicDiv");
            let checked = event.target.checked;
            let deviceData = getDeviceData();
            if (deviceData.loggedIn) {
                let settings = getSettingsFromLocalStorage();
                settings.viewing.sessionStats = checked;
                localStorage.setItem("userSettings", JSON.stringify(settings));
                setUserSettings(settings);
                sessionStatsSection.hidden = !checked;
                document.getElementById("dynamicHeadline").hidden = !(settings.viewing.realTimeStats || settings.viewing.sessionStats);
            }
        });

        document.getElementById("viewingLongterm").addEventListener("click", (event) => {
            let longtermStatsSection = document.getElementById("staticDiv");
            let checked = event.target.checked;
            let deviceData = getDeviceData();
            if (deviceData.loggedIn) {
                let settings = getSettingsFromLocalStorage();
                settings.viewing.longtermStats = checked;
                localStorage.setItem("userSettings", JSON.stringify(settings));
                setUserSettings(settings);
                longtermStatsSection.hidden = !checked;
            }
        });
    }
}

function showRealTimeData(userdata) {
    let heartRateDisplay = document.getElementById("heartFrequence");
    let oxygenDisplay = document.getElementById("oxygen");
    let currentMuscleBeingTrainedDisplay = document.getElementById("currentMuscleBeingTrained");
    let currentExerciseDisplay = document.getElementById("currentExercise");

    heartRateDisplay.innerText = userdata.userShortTerm.heartFrequence + " bpm";
    oxygenDisplay.innerText = userdata.userShortTerm.oxygen + " %";
    currentMuscleBeingTrainedDisplay.innerText = userdata.userShortTerm.currentMuscleBeingTrained;
    currentExerciseDisplay.innerText = userdata.userShortTerm.currentExercise;

    document.getElementById("dynamicHeadline").hidden = !(userdata.userSettings.viewing.realTimeStats || userdata.userSettings.viewing.sessionStats);
    document.getElementById("viewingRealTime").checked = userdata.userSettings.viewing.realTimeStats;
    document.getElementById("realTimeDiv").hidden = !userdata.userSettings.viewing.realTimeStats;
}

function showSessionData(userdata) {
    let avgHeartRateDisplay = document.getElementById("averageHeartFrequence");
    let avgOxygenDisplay = document.getElementById("averageOxygen");
    let avgMuscleUsageDisplay = document.getElementById("averageMuscleUsageInPercent");
    let trainedMusclesInCurrentOrLatestSessionDisplay = document.getElementById("trainedMuscles");

    avgHeartRateDisplay.innerText = userdata.userSessionData.averageHeartFrequence + " bpm";
    avgOxygenDisplay.innerText = userdata.userSessionData.averageOxygen + " %";
    avgMuscleUsageDisplay.innerText = userdata.userSessionData.averageMuscleUsageInPercent + " %";

    document.getElementById("viewingSession").checked = userdata.userSettings.viewing.sessionStats;
    document.getElementById("dynamicDiv").hidden = !userdata.userSettings.viewing.sessionStats;
}

function showLongtermData(userdata) {
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

    maxTimeTrainedDisplay.innerText = userdata.userHighscores.maxTimeTrained + " Minuten";
    maxHeartRateDisplay.innerText = userdata.userHighscores.maxHeartRate + " bpm";
    averageTimeTrainedDisplay.innerText = userdata.userLongTermAverages.averageTimeTrained + " Minuten";
    averageHeartFrequenceDisplay.innerText = userdata.userLongTermAverages.averageHeartFrequence + " bpm";
    averageOxygenDisplay.innerText =  userdata.userLongTermAverages.averageOxygen + " %";
    averageMuscleUsageInPercentDisplay.innerText = userdata.userLongTermAverages.averageMuscleUsageInPercent + " %";
    weeklyBurnedCaloriesDisplay.innerText = userdata.userLongTermAverages.weeklyBurnedCalories + " kcal";
    monthlyStrengthIncreaseDisplay.innerText = userdata.userLongTermAverages.monthlyStrengthIncrease + " %";
    weeklyTrainingTimeDisplay.innerText = userdata.userLongTermAverages.weeklyTrainingTime + " Minuten";
    mostTrainedMuscleDisplay.innerText = userdata.userLongTermAverages.mostTrainedMuscle;
    mostDoneExerciseDisplay.innerText = userdata.userLongTermAverages.mostDoneExercise;

    document.getElementById("viewingLongterm").checked = userdata.userSettings.viewing.longtermStats;
    document.getElementById("staticDiv").hidden = !userdata.userSettings.viewing.longtermStats;
}

function getSettingsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("userSettings"));
}

function getDeviceData() {
    return localStorage.getItem("deviceData") ? JSON.parse(localStorage.getItem("deviceData")) : {
        running: false,
        loggedIn: false,
        loggedInAsUser: "",
        loggedInWithUserId: -1,
        loadedUserData: false,
    };
}

async function getUserData() {
    return fetch("/api/getUserData", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.error("Fehler beim Abrufen der Benutzerdaten:", response.statusText);
        }
    });
}

async function setUserSettings(settings) {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    return fetch("/api/setUserSettings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    }).then((response) => {
        if (!response.ok) {
            console.error("Fehler beim aktualliseren der Settings im JSON:", response.statusText);
        }
    });
}

async function loadDataFromSpecificUser(email, password) {
    return fetch("/api/loadUserData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    }).then((response) => {
        if (response.ok) {
            let deviceData = getDeviceData();
            deviceData.loadedUserData = true;
            localStorage.setItem("deviceData", JSON.stringify(deviceData));
            return response.json();
        } else {
            console.error("Fehler beim Abrufen der Benutzerdaten:", response.statusText);
        }
    });
}

async function loadDataFromSpecificUserById(userId) {
    return fetch("/api/loadUserDataById", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
    }).then((response) => {
        if (response.ok) {
            let deviceData = getDeviceData();
            deviceData.loadedUserData = true;
            localStorage.setItem("deviceData", JSON.stringify(deviceData));
            return response.json();
        } else {
            console.error("Fehler beim Abrufen der Benutzerdaten:", response.statusText);
        }
    });
}

function log(string) { //afoch kurze abkürzung
    console.log(string);
}