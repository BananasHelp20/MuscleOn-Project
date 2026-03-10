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
    userName: "testUser",
    userPassword: "pwd",
    userMail: "test@example.com",
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

let userData = getDataFromJson();
let userSettings = userData[0].userSettings;

let currentProperties = {
    running: false,
    loggedIn: false,
    loggedInAsUser: userData[0].userName,
    loggedInWithUserId: userData[0].userId
}

let supportedExercises = [];
let devMode = false;

function initialiseModes() {
    document.getElementById("lightSwitch").addEventListener("click", () => {
        userSettings.mode = userSettings.mode === "lightmode" ? "darkmode" : "lightmode";
        if (currentProperties.loggedIn) {
            updateSettings(selectedUserId);
        }
        if (userSettings.mode === "lightmode") {
            document.getElementById("modeStylesheet").setAttribute("href", "./Css/light.css");
            document.getElementById("lightSwitch").innerText = "darkmode";
        } else {
            document.getElementById("modeStylesheet").setAttribute("href", "./Css/dark.css");
            document.getElementById("lightSwitch").innerText = "lightmode";
        }
        if (currentProperties.loggedIn) {
            userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
        }
    });
    document.getElementById("dev")?.addEventListener("click", () => {
        devMode = !devMode;
        if (devMode && document.getElementById("dev")) {
            document.getElementById("dev").innerText = "devmode";
        } else if (document.getElementById("dev")) {
            document.getElementById("dev").innerText = "usermode";
        }
        userSettings.devMode = devMode;
        if (currentProperties.loggedIn) {
            updateSettings(selectedUserId);
        }
        if (currentProperties.loggedIn) {
            userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
        }
    });
    if (currentProperties.loggedIn) {
        initialiseViewingModes();
        updateSettings(selectedUserId);
    }
}

function signup(userName, password, email) {
    let newUserId = userData.length;
    let newUser = {
        userId: newUserId,
        userName: userName,
        userPassword: password,
        userMail: email,
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
    userData.push(newUser);
    saveDataToLocalStorage();
    login(newUser.userId);
}

function login(userId) {
    selectedUserId = userId;
    currentProperties.loggedIn = true;
    currentProperties.loggedInAsUser = userData[getIndexOfUserId(userId)].userName;
    currentProperties.loggedInWithUserId = userId;
    userData = getDataFromJson();
    userSettings = userData[getIndexOfUserId(userId)].userSettings;
    updateSettings(selectedUserId);
    savePropertiesToLocalStorage();
    saveUserSettingsToLocalStorage(userId);
}

function logout() {
    selectedUserId = -1;
    currentProperties.loggedIn = false;
    currentProperties.loggedInAsUser = "";
    currentProperties.loggedInWithUserId = -1;
    userSettings = {
        mode: "darkmode",
        viewing: ["session", "longterm", "real-time"],
        devMode: false
    }
    savePropertiesToLocalStorage();
    saveUserSettingsToLocalStorage(-1);
    location.reload();
}

function initializeLoginAndSignup() {
    if (document.getElementById("logoutButton")) {
        document.getElementById("logoutButton")?.addEventListener("click", () => {
            logout();
        });
    }
    if (document.getElementById("loginButton")) {
        loadDataFromLocalStorage();
        document.getElementById("loginButton")?.addEventListener("click", () => {
            let id = getUserIdFromUsernameAndPassword(document.getElementById("username").value, document.getElementById("password").value);
            if (id !== -1) {
                if (document.getElementById("password") && document.getElementById("username")) {
                    if (userData[getIndexOfUserId(id)].userName == document.getElementById("username").value && userData[getIndexOfUserId(id)].userPassword == document.getElementById("password").value) {
                        login(id);
                        window.location.href = "./index.html";
                    } else {
                        alert("Account nicht gefunden!");
                    }
                } else {
                    alert("you fucked up");
                }
            } else {
                alert("Account nicht gefunden!");
            }
        });
    }
    if (document.getElementById("signupButton")) {
        document.getElementById("signupButton").addEventListener("click", () => {
            let username = document.getElementById("username").value + "";
            let password = document.getElementById("password").value + "";
            let email = document.getElementById("email").value + "";
            if (username != "" && email.includes("@") && email.includes(".")) {
                signup(username, password, email);
                window.location.href = "./index.html";
            } else {
                alert("Invalid Username or Email!");
            }
        });
    }
}

function initialiseViewingModes() {
    const toggleViewingMode = (modeKey) => {
        if (!currentProperties.loggedIn) return;

        const idx = userSettings.viewing.indexOf(modeKey);
        if (idx === -1) {
            userSettings.viewing.push(modeKey);
        } else {
            userSettings.viewing.splice(idx, 1);
        }
        updateSettings(selectedUserId);
    };
    if (document.getElementById("viewingSession") && document.getElementById("viewingRealTime") && document.getElementById("viewingLongterm")) {
        document.getElementById("viewingSession").addEventListener("click", () => {
            toggleViewingMode("session");
        });
        document.getElementById("viewingLongterm").addEventListener("click", () => {
            toggleViewingMode("longterm");
        });
        document.getElementById("viewingRealTime").addEventListener("click", () => {
            toggleViewingMode("real-time");
        });
    }
}


function init() {
    loadDataFromLocalStorage();
    console.log(userData);
    loadPropertiesFromLocalStorage();
    loadUserSettingsFromLocalStorage((currentProperties.loggedIn) ? currentProperties.loggedInWithUserId : -1);
    if (document.getElementById("currentUser") && currentProperties.loggedIn) {
        document.getElementById("currentUser").innerHTML = `Momentan eingeloggt: ${currentProperties.loggedInAsUser} <button id="logoutButton">Logout</button>`;
    } else if (document.getElementById("currentUser")) {
        document.getElementById("currentUser").innerHTML = "Du bist nicht eingeloggt. <a href=\"./login.html\" id=\"loginLink\">Login</a> oder: <a href=\"./signup.html\" id=\"signupLink\">Signup</a>";
    }

    if (userSettings.mode === "lightmode") {
        document.getElementById("modeStylesheet").setAttribute("href", "./Css/light.css");
        document.getElementById("lightSwitch").innerText = "darkmode";
    } else {
        document.getElementById("modeStylesheet").setAttribute("href", "./Css/dark.css");
        document.getElementById("lightSwitch").innerText = "lightmode";
    }

    if (userSettings.devMode && document.getElementById("dev")) {
        document.getElementById("dev").innerText = "devmode";
    } else if (document.getElementById("dev")) {
        document.getElementById("dev").innerText = "usermode";
    }

    initializeLoginAndSignup();
    initialiseModes();
    setInterval(() => {
        updateFromJsonData();
        userData = getDataFromJson();
        userSettings = userData[getIndexOfUserId(selectedUserId)].userSettings;
        updateDisplay(selectedUserId);
    }, 2000);
}