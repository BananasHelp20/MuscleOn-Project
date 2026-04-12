let interval = 250; //globale Variable für de Aktuallisierung in Millisekunden

function syncModes() {
    if (document.getElementById("dev")) document.getElementById("dev").innerText = getSettingsFromLocalStorage().devMode ? "devmode" : "usermode";
    document.getElementById("lightSwitch").innerText = getSettingsFromLocalStorage().mode;
    document.getElementById("modeStylesheet").href = getSettingsFromLocalStorage().mode == "lightmode" ? "./css/light.css" : "./css/dark.css";

    if (getSettingsFromLocalStorage().devMode && document.getElementById("check")) {
        document.getElementById("check").hidden = false;
        document.getElementById("checkbr").hidden = false;
    } else if (document.getElementById("check")) {
        document.getElementById("check").hidden = true;
        document.getElementById("checkbr").hidden = true;
    }
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
    if (getSettingsFromLocalStorage().createdPlan && !deviceProperties.editingPlanSection && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Alter Trainings Plan";
    } else if (!deviceProperties.editingPlanSection && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Create Trainings Plan";
    } else if (document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Save Trainings Plan";
    }
    if (document.getElementById("plan-section")) document.getElementById("plan-section").hidden = !deviceProperties.editingPlanSection;

    if (deviceProperties.inExercise && document.getElementById("startStopExercise")) {
        document.getElementById("startStopExercise").innerText = "End Exercise";
    } else if (document.getElementById("startStopExercise")) {
        document.getElementById("startStopExercise").innerText = "Start Exercise";
    }

    if (deviceProperties.sessionRunning && document.getElementById("startStopSession")) {
        document.getElementById("startStopSession").innerText = "End Session";
        if (document.getElementById("sessionDiv")) document.getElementById("sessionDiv").hidden = false;
    } else if (document.getElementById("startStopSession")) {
        document.getElementById("startStopSession").innerText = "Start Session";
        if (document.getElementById("sessionDiv")) document.getElementById("sessionDiv").hidden = true;
    }
}

function initializeSession() {
    if (!document.getElementById("sessionDiv")) {//wenn des session zeigs existiert
        return;
    }

    sessionButtonCheck();
    if (document.getElementById("startStopSession")) document.getElementById("startStopSession").addEventListener("click", () => {
        let device = getDeviceData();
        device.sessionRunning = !device.sessionRunning;
        if (device.sessionRunning) {
            startSession();
        } else {
            stopSession();
        }
        localStorage.setItem("deviceData", JSON.stringify(device));
        sessionButtonCheck();
    });

    if (document.getElementById("startStopExercise")) document.getElementById("startStopExercise").addEventListener("click", () => {
        let device = getDeviceData();
        device.inExercise = !device.inExercise;
        if (device.inExercise) {
            startExercise();
        } else {
            stopExercise();
        }
        localStorage.setItem("deviceData", JSON.stringify(device));
        sessionButtonCheck();
    });

    if (document.getElementById("createTrainingsPlan")) document.getElementById("createTrainingsPlan").addEventListener("click", () => {
        let device = getDeviceData();
        let properties = getUserPropertiesFromLocalStorage();
        if (device.editingPlanSection) { //on trying to save
            let times = getSessionTimes();
            if (validateSessionTimes(times)) {
                device.editingPlanSection = false;
                document.getElementById("plan-table").innerHTML = "";
                saveTimes(times);
                properties.createdPlan = true;
            } else {
                alert("Training days not valid");
            }
        } else { //on activation
            device.editingPlanSection = true;
            if (properties.createdPlan) {
                for (time of properties.usualSessionTimes) {
                    addWeekday(time);
                    // addExercise(time);
                }
            }
        }
        localStorage.setItem("deviceData", JSON.stringify(device));
        sessionButtonCheck();
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

function getRealChildren(children) {
    let real = [];
    for (i in children) {
        let child = children.item(i);
        if (child.nodeName != "#text") real.push(child);
    }
    return real;
}

function getRealChildrenWithId(children) {
    let real = [];
    for (i in children) {
        let child = children.item(i);
        if (child.nodeName != "#text" && child.getAttribute("id") != null) real.push(child);
    }
    return real;
}

function getMuscleGroups() {
    return [
        "Chest",
        "Upper Back (Traps & Rhomboids)",
        "Mid-Back (Lats)",
        "Lower Back (Erector Spinae)",
        "Shoulders (Deltoids)",
        "Biceps",
        "Triceps",
        "Core (Abs & Obliques)",
        "Glutes",
        "Quadriceps",
        "Hamstrings",
        "Calves, (Gastrocnemius & Soleus)"
    ]
}

function setMuscleGroupOptions(elem) {
    let muscleGroups = getMuscleGroups();
    for (let group of muscleGroups) {
        let option = document.createElement("option");
        option.text = group;
        elem.add(option);
    }
}

function setExerciseOptions(elem) {
    let exerciseTypeExercises = [getSupportedExercises(), getUnsupportedExercises(), getUserDefinedExercises()];
    let exerciseTypes = [document.createElement("optgroup"), document.createElement("optgroup"), document.createElement("optgroup")];
    exerciseTypes[0].label = "Supported Exercises";
    exerciseTypes[1].label = "Unsupported Exercises";
    exerciseTypes[2].label = "Own Exercises";
    let muscleGroups = getMuscleGroups();
    for (let exerciseType in exerciseTypes) {
        if (exerciseType == 1 && exerciseTypeExercises[1].length == 0) return;
        if (exerciseType == 2 && exerciseTypeExercises[2].length == 0) return;
        elem.appendChild(exerciseTypes[exerciseType]);
        for (let group of muscleGroups) {
            let groupGroup = document.createElement("optgroup");
            groupGroup.label = group.name;
            elem.appendChild(groupGroup);
            for (let exercise of exerciseTypeExercises[exerciseType]) {
                let option = document.createElement("option");
                option.text = exercise.name;
                elem.add(option);
            }
        }
    }
}

function getFreeSessionId() {
    let ids = [];
    let table = document.getElementById("plan-table");
    for (i in table.children) {
        let row = table.children.item(i);
        ids.push(Number(row.getAttribute("id")));
    }
    ids.sort();
    for (let i = 0; i <= 2000000 && ids.includes(id); i++) {
        id = i;
    }

    if (id > 2000000) {
        alert("you can only have 2,000,000 Sessions! (if you see this, you're absolutely based)");
        return null;
    }
    return id;
}

function addWeekday(data) {
    let weekdayData = (data) ? data.times : null;
    let sessionId = getFreeSessionId();
    
    let weekday = document.createElement("input");
    weekday.setAttribute("type", "text");
    weekday.setAttribute("id", "weekday" + (data) ? data.sessionId : sessionId);
    weekday.setAttribute("placeholder", "Monday");
    if (weekdayData) weekday.value = weekdayData.weekday;

    let from = document.createElement("input");
    from.setAttribute("type", "text");
    from.setAttribute("id", "from" + (data) ? data.sessionId : sessionId);
    from.setAttribute("placeholder", "08:00");
    if (weekdayData) from.value = weekdayData.fromTime;

    let to = document.createElement("input");
    to.setAttribute("type", "text");
    to.setAttribute("id", "to" + (data) ? data.sessionId : sessionId);
    to.setAttribute("placeholder", "09:30");
    if (weekdayData) to.value = weekdayData.toTime;

    let primaryMuscleGroup = document.createElement("select");
    primaryMuscleGroup.setAttribute("name","selectMuscleGroup");
    primaryMuscleGroup.setAttribute("id", "selectMuscleGroup");
    setMuscleGroupOptions(primaryMuscleGroup);
    if (data) primaryMuscleGroup.value = data.primaryMuscleGroup;

    let delButton = document.createElement("button");
    delButton.setAttribute("id", "delete-day");
    delButton.innerText = "remove day";
    delButton.addEventListener("click", (event) => {
        if (document.getElementById("plan-table").children.length > 1) event.target.parentElement.parentElement.remove();
    });

    let removeExercisesForDayButton = document.createElement("button");
    removeExercisesForDayButton.setAttribute("id", "remove-exercises");
    removeExercisesForDayButton.innerText = "remove exercises";
    removeExercisesForDayButton.addEventListener("click", (event) => {
        if (document.getElementById("exercise-table")) removeExercise(event.target.parentElement.parentElement.getAttribute("id"));
    });
    
    let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
    tds[0].appendChild(weekday);
    tds[1].appendChild(from);
    tds[2].appendChild(to);
    tds[3].appendChild(primaryMuscleGroup);
    tds[4].appendChild(delButton);
    tds[5].appendChild(removeExercisesForDayButton)

    let tr = document.createElement("tr");
    tr.setAttribute("id", "" + (data) ? data.sessionId : sessionId);
    tds.forEach((td) => {
        tr.appendChild(td);
    });
    document.getElementById("plan-table").appendChild(tr);
}
//TODO: add exercises for each weekday (mapped by table row id)

//parameter data: de bisherigen Sessiondaten, von einem Tag (moch des so, das du beim add exercises button a input host, wost in tag dazuschreibst oda so) mit leerem exercises element (optional))
function addExerciseSelection(data) { //FAAAAACK i glaub du muast jetzt a table aus tables mochn, oder dynamisch tables zu an div adden
    let elemCtr = document.getElementById("plan-table").children.length;
    let exerciseData = (data) ? data.exercises : null;
    if (data && !data.exercises) return;

    let day = document.getElementById("plan-table").children.item(elemCtr);
    let table = getEmptyExerciseTable(data);
}

function getEmptyExerciseTable(time) {
    let table = document.createElement("table");
    let ths = [document.createElement("th"), document.createElement("th"), document.createElement("th"), document.createElement("th"), document.createElement("th")]

    ths[0].innerText = "Exercise";
    ths[1].innerText = "Required Equipment";
    ths[2].innerText = "Reps";
    ths[3].innerText = "Sets";
    ths[4].innerText = "Weight";

    let mainTh = document.createElement("th");
    mainTh.innerText = "Day: " + time.times.weekday + " from " + time.times.fromTime + " to " + time.times.toTime;
    mainTh.setAttribute("colspan", ths.length);

    let headerRow = document.createElement("tr");
    headerRow.appendChild(mainTh);

    let headersRow = document.createElement("tr");
    ths.forEach((th) => {
        headersRow.appendChild(th);
    })

    let thead = document.createElement("thead");
    thead.appendChild(headerRow);
    thead.appendChild(headersRow);

    let tbody = document.createElement("tbody");
    tbody.setAttribute("id", "exercise-table" + time.sessionId);

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}

function initializePlanTable() {
    if (document.getElementById("plan")) document.getElementById("plan").addEventListener("click", (event) => {
        document.getElementById("plan-section").hidden = !event.target.checked;
        if (document.getElementById("plan-section").hidden) {
            document.getElementById("plan-table").innerHTML = '';
        } else {
            addWeekday(null);
        }
        document.getElementById("day1").childNodes.forEach((node) => node.childNodes.forEach((node) => node.value = ""));
    });

    if (document.getElementById("delete-day")) document.getElementById("delete-day").addEventListener("click", (event) => {
        if (document.getElementById("plan-table").children.length > 1) event.target.parentElement.parentElement.remove();
    });

    if (document.getElementById("add-weekday")) document.getElementById("add-weekday").addEventListener("click", () => {
        addWeekday(null);
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
                loadedUserData: true,
                sessionRunning: false,
                inExercise: false,
                editingPlanSection: false
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
        sessionRunning: false,
        inExercise: false,
        editingPlanSection: false
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
    let createdPlan = false;
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
        createdPlan = true;
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
            createdPlan: createdPlan,
            devMode: false
        }
    }
    createNewUser(completeUserData).then(() => {
        login();
    });
}

function getSessionTimes() {
    if (!document.getElementById("plan-table") || !document.getElementById("exercise-table")) return;
    
    let table = document.getElementById("plan-table");
    let exerciseTable = document.getElementById("exercise-table");
    let plan = []
    let plantime = [];
    let primaryMuscleGroups = [];
    let exercises = [[]];

    for (let i = 0; i < table.children.length; i++) {
        for (let j = 0; j < table.children.item(i).children.length; j++) {
            let row = table.children.item(i).children.item(j).children.item(0);
            if (row.getAttribute("id") != null && row.getAttribute("type") != null && row.nodeName != "select") {
                plantime.push(row.value);
            } else if (row.getAttribute("id") != null && row.nodeName == "select") {
                primaryMuscleGroups.push(row.value);
            }
        }
        plan.push(plantime);
        plantime = [];
    }
    let plantimeObjects = [];
    for (index in plan) {
        let time = plan[i];
        plantimeObjects.push({
            primaryMuscleGroup: primaryMuscleGroups[i],
            exercises: exercises[i],
            times: {
                weekday: time[0],
                fromTime: time[1],
                toTime: time[2]
            }
        });
    }
    return plantimeObjects;
}

function validateSessionTimes(times) {
    if (times.length == 0) return false;
    for (index in times) {
        let time = times[index]
        if (!(
            time.weekday &&
            (
                time.weekday == "Montag" || "Monday" ||
                time.weekday == "Dienstag" || "Tuesday" ||
                time.weekday == "Mittwoch" || "Wednesday" ||
                time.weekday == "Donnerstag" || "Thursday" ||
                time.weekday == "Freitag" || "Friday" ||
                time.weekday == "Samstag" || "Saturday" ||
                time.weekday == "Sonntag" || "Sunday"
            ) &&
            time.fromTime &&
            (
                time.fromTime.length == 5 || time.fromTime.length == 4
            ) &&
            time.toTime &&
            (
                time.toTime.length == 5 || time.toTime.length == 4
            )
        )) {
            return false
        };
    };
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
    averageOxygenDisplay.innerText = userdata.userLongTermAverages.averageOxygen + " %";
    averageMuscleUsageInPercentDisplay.innerText = userdata.userLongTermAverages.averageMuscleUsageInPercent + " %";
    weeklyBurnedCaloriesDisplay.innerText = userdata.userLongTermAverages.weeklyBurnedCalories + " kcal";
    monthlyStrengthIncreaseDisplay.innerText = userdata.userLongTermAverages.monthlyStrengthIncrease + " %";
    weeklyTrainingTimeDisplay.innerText = userdata.userLongTermAverages.weeklyTrainingTime + " Minuten";
    mostTrainedMuscleDisplay.innerText = userdata.userLongTermAverages.mostTrainedMuscle;
    mostDoneExerciseDisplay.innerText = userdata.userLongTermAverages.mostDoneExercise;

    document.getElementById("viewingLongterm").checked = userdata.userSettings.viewing.longtermStats;
    document.getElementById("staticDiv").hidden = !userdata.userSettings.viewing.longtermStats;
}

function getUserDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem("userData"));
}

function getUserPropertiesFromLocalStorage() {
    let properties = JSON.parse(localStorage.getItem("userProperties"));
    if (properties == null) {
        alert("userproperties are NULL!");
    } else {
        //log("loading settings of user \"" + getDeviceData().loggedInAsUser + "\"")
    }
    return properties;
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
        //log("loading settings of user \"" + getDeviceData().loggedInAsUser + "\"")
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
        sessionRunning: false,
        inExercise: false,
        editingPlanSection: false
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

async function setUserProperties(properties) {
    localStorage.setItem("userProperties", JSON.stringify(properties));
    return fetch("/api/setUserProperties", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(properties)
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while updating user properties", response.statusText);
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

async function startSession() {
    return fetch("/api/session/start", {
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

async function stopSession() {
    return fetch("/api/session/stop", {
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

async function startExercise() {
    return fetch("/api/exercise/start", {
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

async function stopExercise() {
    return fetch("/api/exercise/stop", {
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

async function saveTimes(times) {
    return fetch("/api/saveTimes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(times) //userid muss von der Datenbank verliehen werden
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to alter or create the trainingsplan:", response.statusText);
        }
    });
}

async function getAllExercises() {
    return fetch("/api/getExercises/all", {
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

async function getSupportedExercises() {
    return fetch("/api/getExercises/supported", {
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

async function getUnsupportedExercises() {
    return fetch("/api/getExercises/unsupported", {
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

async function getUserDefinedExercises() {
    return fetch("/api/getExercises/user", {
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

function log(string) { //afoch kurze abkürzung
    console.log(string);
}