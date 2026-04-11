function syncModes() {
    if (document.getElementById("dev")) document.getElementById("dev").innerText = getSettingsFromLocalStorage().devMode ? "devmode" : "usermode";
    document.getElementById("lightSwitch").innerText = getSettingsFromLocalStorage().mode;
    document.getElementById("modeStylesheet").href = getSettingsFromLocalStorage().mode == "lightmode" ? "./css/light.css" : "./css/dark.css";
}

function initializeLightSwitch() {
    document.getElementById("lightSwitch").innerText = getSettingsFromLocalStorage().mode;
    document.getElementById("modeStylesheet").href = getSettingsFromLocalStorage().mode == "lightmode" ? "./css/light.css" : "./css/dark.css";

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

function initializeLogoutAndDelete() {
    let logoutButton;
    let deleteButton;
    if (document.getElementById("logoutButton")) {
        logoutButton = document.getElementById("logoutButton");
        logoutButton.addEventListener("click", () => {
            logout();
        });
    }
    if (document.getElementById("deleteUserButton")) {
        deleteButton = document.getElementById("deleteUserButton");
        deleteButton.addEventListener("click", () => {
            deleteUser().then(() => {
                logout();
            });
        });
    }
}

function sessionButtonCheck() {
    let deviceProperties = getDeviceData();
    if (deviceProperties.createdPlan && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Alter Trainings Plan";
        document.getElementById("createTrainingsPlan").setAttribute("id", "alterTrainingsPlan");
    } else if (document.getElementById("alterTrainingsPlan")) {
        document.getElementById("alterTrainingsPlan").innerText = "Create Trainings Plan";
        document.getElementById("alterTrainingsPlan").setAttribute("id", "createTrainingsPlan");
    }
}

function initializeSession() {
    if (!document.getElementById("sessionDiv")) {//wenn des session zeigs existiert
        return;
    }

    sessionButtonCheck();
    let startStopSession;
    if (startStopSession = document.getElementById("startSession")) startStopSession.addEventListener("click", () => {
        startStopSession.innerText = "End Session";
        startStopSession.setAttribute("id", "endSession");
        document.getElementById("id", () => {
            document.getElementById("sessionDiv").hidden = false;
        });
    });

    if (startStopSession = document.getElementById("endSession")) startStopSession.addEventListener("click", () => {
        startStopSession.innerText = "Start Session";
        startStopSession.setAttribute("id", "startSession");
        document.getElementById("id", () => {
            document.getElementById("sessionDiv").hidden = true;
        });
    });

    let startStopExercise;
    if (startStopExercise = document.getElementById("startExercise")) startStopExercise.addEventListener("click", () => {
        startStopExercise.innerText = "End Exercise";
        startStopExercise.setAttribute("id", "endExercise");
    });

    if (startStopExercise = document.getElementById("endExercise")) startStopExercise.addEventListener("click", () => {
        startStopExercise.innerText = "Start Exercise";
        startStopExercise.setAttribute("id", "startExercise");
    });

    let createAlterSavePlan;
    if (createAlterSavePlan = document.getElementById("saveTrainingsPlan")) createAlterSavePlan.addEventListener("click", () => {
        document.getElementById("saveTrainingsPlan").setAttribute("id", "createTrainingsPlan");
        sessionButtonCheck();
    });

    if (createAlterSavePlan = document.getElementById("createTrainingsPlan")) createAlterSavePlan.addEventListener("click", () => {
        
    });

    if (createAlterSavePlan = document.getElementById("alterTrainingsPlan")) createAlterSavePlan.addEventListener("click", () => {

    });

    initializePlanTable();
}

function initializeLogin() {
    let loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", () => {
        login();
    });
}

function initializeSignUp() {
    document.getElementById("signupButton").addEventListener("click", () => {
        signUp();
    });
    initializePlanTable();
}

function initializePlanTable() {
    if (document.getElementById("plan")) document.getElementById("plan").addEventListener("click", (event) => {
        document.getElementById("plan-section").hidden = !event.target.checked;
        document.getElementById("plan-table").innerHTML = '<tr><th>Weekday</th><th>From</th><th>To</th><th>&emsp;</th></tr><tr id="day1"><td><input type="text" id="weekday1" placeholder="Monday"></td><td><input type="text" id="from1" placeholder="08:00"></td><td><input type="text" id="to1" placeholder="09:30"></td><td><button id="delete-day">Remove Weekday</button></td></tr>';
        document.getElementById("day1").childNodes.forEach((node) => node.childNodes.forEach((node) => node.value = ""));
    });

    document.getElementById("delete-day").addEventListener("click", (event) => {
        event.target.parentElement.parentElement.remove();
    });

    document.getElementById("add-weekday").addEventListener("click", () => {
        let tr = document.createElement("tr");
        let elemCtr = document.getElementById("plan-table").childNodes.length;
        if (elemCtr > 7) return; //abbrechen wenn scho 7 tage hinzugefügt worden sind, 8 tage in da woche san jetzt ned so reallistisch
        tr.setAttribute("id", "day" + elemCtr);
        let weekday = document.createElement("input");
        weekday.setAttribute("type", "text");
        weekday.setAttribute("id", "weekday" + elemCtr);
        weekday.setAttribute("placeholder", "Montag");
        let from = document.createElement("input");
        from.setAttribute("type", "text");
        from.setAttribute("id", "from" + elemCtr);
        from.setAttribute("placeholder", "08:00");
        let to = document.createElement("input");
        to.setAttribute("type", "text");
        to.setAttribute("id", "to" + elemCtr);
        to.setAttribute("placeholder", "09:30");
        let delButton = document.createElement("button");
        delButton.setAttribute("id", "delete-day");
        delButton.innerText = "remove";
        delButton.addEventListener("click", (event) => {
            event.target.parentElement.parentElement.remove();
        });
        let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
        tds[0].appendChild(weekday);
        tds[1].appendChild(from);
        tds[2].appendChild(to);
        tds[3].appendChild(delButton);
        tr.appendChild(tds[0]);
        tr.appendChild(tds[1]);
        tr.appendChild(tds[2]);
        tr.appendChild(tds[3]);
        document.getElementById("plan-table").appendChild(tr);
    });
}


function login() { //test this
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if (!email) {
        alert("Please fill out E-Mail field!");
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
            showLoggedIn(newDeviceData);
            location.href = "./index.html";
            initializeLogoutAndDelete();
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
    localStorage.setItem("deviceData", JSON.stringify(defaultDeviceData));
    clearUserData();
    showLoggedIn(defaultDeviceData);
    location.reload(); //seite neu laden
}

function signUp() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let email = document.getElementById("email").value;
    let weight = document.getElementById("weight").value;
    let size = document.getElementById("size").value;
    let birthday = document.getElementById("birthday").value;
    if (!(username && email && email.includes("@") && email.includes(".") && weight && size && birthday)) {
        alert("fill in the fields rightously")
        return;
    }
    let data;
    if (document.getElementById("plan").checked) {
        data = {
            userId: -1, //temporär ungültige id, weil i jo ned was wos für a id in da Datenbank nu frei is
            userName: password,
            email: email,
            weight: weight,
            size: size,
            birthday: birthday,
            currentlyTraining: false,
            usualSessionTime: getSessionTimes()
        }
        if (!validateSessionTimes(data.usualSessionTime)) {
            alert("Days must be real weekdays, times must be real times: xx:xx");
            return;
        }
    } else {
        data = {
            userId: -1, //temporär ungültige id, weil i jo ned was wos für a id in da Datenbank nu frei is
            userName: password,
            email: email,
            weight: weight,
            size: size,
            birthday: birthday,
            currentlyTraining: false,
        }
    }
    let completeUserData = {
        userProperties: data,
        userSessionData: null,
        userShortTerm: null,
        userHighscores: null,
        userLongTermAverages: null,
        userSettings: {
            mode: "lightmode",
            viewing: {
                realTimeStats: true,
                sessionStats: true,
                longtermStats: true
            },
            devMode: false
        }
    }
    createNewUser(completeUserData).then(() => {
        login();
    });
}

function getSessionTimes() {
    let table = document.getElementById("plan-table");
    let plan = [];
    let plantime = [];
    for (let i = 0; i < table.children.item(0).children.length; i++) {
        let row = table.children.item(0).children.item(i);
        if (row.getAttribute("id") != null) {
            for (let j = 0; j < row.children.length; j++) {
                let data = row.childNodes.item(j);
                if (data.nodeName != "#text") plantime.push(data.firstChild.value);
            }
            plan.push(plantime);
            plantime = [];
        }
    }

    let plantimeObjects = []
    plantime.forEach((time) => {
        plantimeObjects.push({
            weekday: time[0],
            fromTime: time[1],
            toTime: time[2]
        });
    });
    return plantimeObjects;
}

function validateSessionTimes(times) {
    times.forEach((time) => {
        if (!(
            time.weekday &&
            ( 
                time.weekday.includes("Montag") || 
                time.weekday.includes("Dienstag") || 
                time.weekday.includes("Mittwoch") || 
                time.weekday.includes("Donnerstag") || 
                time.weekday.includes("Freitag") || 
                time.weekday.includes("Samstag") || 
                time.weekday.includes("Sonntag")
            ) &&
            time.fromTime &&
            time.toTime
        )) return false;
    });
    return true;
}

function showLoggedIn(deviceData) {
    let loggedInAsDisplay = document.getElementById("currentUser");
    if (deviceData.loggedIn && loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = deviceData.loggedInAsUser + " <button id='logoutButton'>Logout</button><br><button id='deleteUserButton'>Delete Account</button>";
    } else if (loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = "You are logged out. <a href='./login.html'>Login</a> <br>Don't have an account? <a href='./signup.html'>Signup Now</a>";
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
    if (devModeSwitch) devModeSwitch.innerText = on ? "devmode" : "usermode";
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
    let settings = JSON.parse(localStorage.getItem("userSettings"));
    if (settings == null) {
        log("loading site with default settings...");
        settings = {
            mode: "lightmode",
            viewing: ["nothingToView"],
            devMode: false
        }
    } else {
        log("loading settings with settings of user \"" + getDeviceData().loggedInAsUser + "\"")
    }
    return settings;
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
            console.error("An error ocured while requesting data from backend:", response.statusText);
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
            console.error("An error occured while updating settings", response.statusText);
        }
    });
}

async function loadDataFromSpecificUser(email, password) {
    log("loading Data from Database into JSON");
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
            console.error("An error occured while loading data into JSON:", response.statusText);
        }
    });
}

async function loadDataFromSpecificUserById(userId) {
    log("loading Data from Database into JSON");
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
            console.error("An error occured while loading data into JSON:", response.statusText);
        }
    });
}

async function clearUserData() {
    log("saving Data to Database and logging out");
    let defaultSettings = {
        mode: "lightmode",
        viewing: ["nothingToView"],
        devMode: false
    }
    return fetch("/api/clearUserData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(defaultSettings)
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while logging out:", response.statusText);
        }
    });
}

async function deleteUser() {
    return fetch("/api/deleteUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(getDeviceData())
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while logging out:", response.statusText);
        }
    });
}

async function createNewUser(userData) {
    return fetch("/api/addUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData) //userid muss von der Datenbank verliehen werden
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to create a new user:", response.statusText);
        }
    });
}

function log(string) { //afoch kurze abkürzung
    console.log(string);
}