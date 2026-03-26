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
    username: "testUser",
    passwd: "pwd",
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
        maxTimeTrained: "0:00:00",
        maxDoneInOneForEachExercise: [],
        maxHeartRate: 0,
    },

    userLongTermAverages: {
        userId: 0,
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
        userId: 0,
        mode: "darkmode",
        viewing: ["session", "longterm", "real-time"],
        devMode: false
    }
}

let userData = [];
let userSettings = {
    mode: "darkmode",
    viewing: ["session", "longterm", "real-time"],
    devMode: false
};

let currentProperties = {
    running: false,
    loggedIn: false,
    loggedInAsUser: "",
    loggedInWithUserId: -1
}

let supportedExercises = [];
let devMode = false;

function initialiseModes() {
    document.getElementById("lightSwitch").addEventListener("click", () => {
        userSettings.mode = userSettings.mode == "lightmode" ? "darkmode" : "lightmode";
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

async function signup(username, password, email) {
    userData = loadDataFromLocalStorage() || [];
    let newUserId = userData.length;
    let newUser = {
        userId: newUserId,
        username: username,
        passwd: password,
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
    saveDataToLocalStorage();
    sendDataToJson(userData); //was ned ob des wirkli do her muss
    await addUser(newUser);
    login(newUser.userId);
}

function login(userId) {
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

    selectedUserId = userId;
    currentProperties.loggedIn = true;
    currentProperties.loggedInAsUser = userData[userIndex].username;
    currentProperties.loggedInWithUserId = userId;
    userSettings = userData[userIndex].userSettings;
    updateSettings(selectedUserId);
    savePropertiesToLocalStorage();
    saveDataToLocalStorage();
    saveUserSettingsToLocalStorage(userId);
}

function logout() {
    selectedUserId = -1;
    currentProperties.loggedIn = false;
    currentProperties.loggedInAsUser = "";
    currentProperties.loggedInWithUserId = -1;
    userSettings = {
        mode: "darkmode",
        viewing: [],
        devMode: false
    }
    savePropertiesToLocalStorage();
    saveUserSettingsToLocalStorage(-1);
    initializeUI();
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
        document.getElementById("loginButton")?.addEventListener("click", async () => {
            try {
                const username = document.getElementById("username").value;
                const password = document.getElementById("password").value;
                
                if (!username) {
                    alert("Benutzername erforderlich!");
                    return;
                }
                
                // Lade Daten vom Backend
                const data = loadDataFromLocalStorage();
                console.log("Daten vom Backend:", data);
                
                if (!data || data.length === 0) {
                    alert("Keine Benutzer auf dem Server gefunden!");
                    return;
                }
                
                // Suche Benutzer
                let foundUserId = -1;
                for (let user of data) {
                    if (user.username === username && user.passwd === password) {
                        foundUserId = user.userId;
                        break;
                    }
                }
                
                if (foundUserId !== -1) {
                    await login(foundUserId);
                    window.location.href = "./index.html";
                } else {
                    alert("Keine Daten vom Server erhalten!");
                }
            } catch (error) {
                console.error("Error beim Login:", error);
                alert("Fehler beim Laden der Benutzerdaten: " + error.message);
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
                alert("Invalid username or Email!");
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
    loadPropertiesFromLocalStorage();
    loadDataFromLocalStorage();
    loadUserSettingsFromLocalStorage((currentProperties.loggedIn) ? currentProperties.loggedInWithUserId : -1);

    if (currentProperties.loggedIn) {
        selectedUserId = currentProperties.loggedInWithUserId;
    }

    initialiseModes();
    initializeLoginAndSignup();

    if (userData.length === 0) {
        getDataFromJson().then(data => {
            userData = data;
            if (userData.length > 0 && !currentProperties.loggedIn) {
                userSettings = userData[0].userSettings;
            }
            initializeUI();
        }).catch(error => console.error("Error loading data:", error));
    } else {
        initializeUI();
    }
}

function initializeUI() {
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
    
    setInterval(async () => {
        await getDataFromJson().then(data => {
            if (data && data.length > 0) {
                userData = data;
                if (selectedUserId >= 0) {
                    userSettings = userData[getIndexOfUserId(selectedUserId)]?.userSettings || userSettings;
                }
                updateDisplay(selectedUserId);
                saveDataToLocalStorage();
            }
        }).catch(error => console.error("Error updating data:", error));
    }, 1000);
}