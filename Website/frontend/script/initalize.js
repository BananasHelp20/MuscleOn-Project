//global variables/constants
const interval = 250; //für de Aktuallisierung in Millisekunden

function initializeLightSwitch() {
    let lightSwitch = document.getElementById("lightSwitch")
    if (lightSwitch) lightSwitch.innerText = getSettingsFromLocalStorage().mode;
    document.getElementById("modeStylesheet").href = getSettingsFromLocalStorage().mode == "lightmode" ? "./css/light.css" : "./css/dark.css";

    if (lightSwitch) lightSwitch.addEventListener("click", () => {
        let settings = getSettingsFromLocalStorage();
        settings.mode = settings.mode == "lightmode" ? "darkmode" : "lightmode"
        document.getElementById("modeStylesheet").href = settings.mode == "lightmode" ? "./css/light.css" : "./css/dark.css";
        document.getElementById("lightSwitch").innerText = settings.mode;
        setUserSettings(settings);
    });
}

function initializeDevMode() {
    if (!document.getElementById("dev")) return;
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

function initializeSession() {
    sessionButtonCheck();
    if (document.getElementById("startStopSession")) document.getElementById("startStopSession").addEventListener("click", () => {
        let device = getUserPropertiesFromLocalStorage();
        device.currentlyTraining = !device.currentlyTraining;
        if (device.currentlyTraining) {
            startSession();
        } else {
            stopSession();
        }
        localStorage.setItem("deviceData", JSON.stringify(device));
        sessionButtonCheck();
    });

    if (document.getElementById("startStopExercise")) document.getElementById("startStopExercise").addEventListener("click", () => {
        let device = getUserPropertiesFromLocalStorage();
        device.currentlyInExercise = !device.currentlyInExercise;
        if (device.currentlyInExercise) {
            startExercise();
        } else {
            stopExercise();
        }
        localStorage.setItem("userProperties", JSON.stringify(device));
        sessionButtonCheck();
    });

    if (document.getElementById("createTrainingsPlan")) document.getElementById("createTrainingsPlan").addEventListener("click", () => {
        let device = getDeviceData();
        let properties = getUserPropertiesFromLocalStorage();
        if (device.editingPlanSection) { //on trying to save
            let times = getSessionTimes();
            if (validateSessionTimes(times)) {
                document.getElementById("cancelTrainingsPlan").hidden = true;
                device.editingPlanSection = false;
                document.getElementById("plan-table").innerHTML = "";
                document.getElementById("exercise-tables").innerHTML = "<h3>Exercises</h3>";
                properties.usualSessionTimes = times;
                properties.createdPlan = true;
                setUserProperties(properties);
            } else {
                alert("Training days not valid");
            }
        } else { //on activation
            device.editingPlanSection = true;
            document.getElementById("cancelTrainingsPlan").hidden = false;
            if (properties.createdPlan && properties.usualSessionTimes) {
                for (time of properties.usualSessionTimes) {
                    addWeekday(time);
                }

                for (time of properties.usualSessionTimes) {
                    if (time.exercises) {
                        loadExerciseSelection(time);
                    }
                }
            }
        }
        localStorage.setItem("deviceData", JSON.stringify(device));
        sessionButtonCheck();
    });

    if (document.getElementById("cancelTrainingsPlan")) document.getElementById("cancelTrainingsPlan").addEventListener("click", () => {
        let device = getDeviceData();
        document.getElementById("cancelTrainingsPlan").hidden = true;
        device.editingPlanSection = false;
        document.getElementById("plan-table").innerHTML = "";
        document.getElementById("exercise-tables").innerHTML = "<h3>Exercises</h3>";
        localStorage.setItem("deviceData", JSON.stringify(device));
        sessionButtonCheck();
    });

    initializePlanTable();
}

function initializeLogin() {
    let loginButton = document.getElementById("loginButton");
    if (!loginButton) return;
    loginButton.addEventListener("click", () => {
        login();
    });
}

function initializeSignUp() {
    if (!document.getElementById("signupButton")) return; 
    document.getElementById("plan").checked = false;
    document.getElementById("plan-table").childNodes.forEach((node) => node.childNodes.forEach((node) => node.value = ""));
    document.getElementById("signupButton").addEventListener("click", () => {
        signUp();
    });
    initializePlanTable();
}

//parameter data: de bisherigen Sessiondaten, von einem Tag (moch des so, das du beim add exercises button a input host, wost in tag dazuschreibst oda so) mit leerem exercises element (optional))
function loadExerciseSelection(data) { //FAAAAACK i glaub du muast jetzt a table aus tables mochn, oder dynamisch tables zu an div adden
    let sessionId = data.sessionId;
    let exerciseData = (data) ? data.exercises : null;
    if (data && !data.exercises) return;
    document.getElementById("exercise-tables").hidden = false;
    let exerciseDiv = document.getElementById("exercise-tables");
    let exerciseTable = getEmptyExerciseTable(data);

    let tbody = document.createElement("tbody");
    tbody.setAttribute("id", "exercise-table" + sessionId);

    for (i in exerciseData) {
        let delButton = document.createElement("button");
        delButton.setAttribute("class", "tableButton");
        delButton.setAttribute("id", "delete-exercise");
        delButton.innerText = "remove exercise";
        delButton.addEventListener("click", (event) => {
            if (event.target.parentElement.parentElement.parentElement.children.length > 1) event.target.parentElement.parentElement.remove();
            if (event.target.parentElement.parentElement.parentElement.children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
        });

        let select = document.createElement("select");
        setExerciseOptions(select);
        select.addEventListener("change", (event) => {
            setSelectedExercise(event.target);
        });
        let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
        let inputs = [document.createElement("input"), document.createElement("input"), document.createElement("input")];
        select.value = exerciseData[i].exerciseType.charAt(0) + exerciseData[i].name; //problems here (select value is empty string after assignment)
        tds[0].appendChild(select);
        tds[1].innerText = exerciseData[i].equipment;
        inputs[0].setAttribute("id", "reps" + i);
        inputs[0].value = exerciseData[i].reps;
        tds[2].appendChild(inputs[0]);
        inputs[1].setAttribute("id", "sets" + i);
        inputs[1].value = exerciseData[i].sets;
        tds[3].appendChild(inputs[1]);
        if (exerciseData[i].weight) {
            inputs[2].setAttribute("id", "weight" + i);
            inputs[2].value = exerciseData[i].weight;
            tds[4].appendChild(inputs[2]);
        } else {
            tds[4].innerText = " - ";
        }
        tds[5].setAttribute("class", "tableButtonContainer");
        tds[5].appendChild(delButton);

        let tr = document.createElement("tr");
        tr.setAttribute("id", i);
        tds.forEach((td) => {
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    }
    exerciseTable.appendChild(tbody);
    if (exerciseData.length != 0) exerciseDiv.appendChild(exerciseTable);
    if (exerciseData.length == 0) {
        exerciseDiv.hidden = true;
    }
}

function initializeExercises() {
    let exerciseDiv = document.getElementById("exerciseDisplay");
    let exerciseSwitch = document.getElementById("exerciseSwitch");
    let settings = getSettingsFromLocalStorage();
    let addExerciseBtn = document.getElementById("addExercise");

    if (exerciseSwitch) exerciseSwitch.innerText = settings.viewingExercises ? settings.viewingExercises : "All Exercises";

    if (exerciseSwitch) exerciseSwitch.addEventListener("click", (event) => {
        if (event.target.innerText == "All Exercises") {
            event.target.innerText = "User-defined Exercises";
        } else if (event.target.innerText == "User-defined Exercises") {
            event.target.innerText = "Community-made Exercises";
        } else if (event.target.innerText == "Community-made Exercises") {
            event.target.innerText = "Supported Exercises";
        } else if (event.target.innerText == "Supported Exercises") {
            event.target.innerText = "None";
        } else if (event.target.innerText == "None") {
            event.target.innerText = "All Exercises";
        }
        let settings = getSettingsFromLocalStorage();
        let device = getDeviceData();

        settings.viewingExercises = event.target.innerText;
        localStorage.setItem("userSettings", JSON.stringify(settings));

        if (device.loggedIn) setUserSettings(settings);

        renderExercises(settings);
    });

    if (addExerciseBtn) addExerciseBtn.addEventListener("click", () => {
        if (addExerciseBtn.innerText == "Save Exercise") {
            if (saveExercise() != false) {
                addExerciseBtn.innerText = "Add New Exercise";
                document.getElementById("exerciseForm").hidden = true;
                document.getElementById("cancelExerciseAddition").hidden = true;
            }
        } else {
            addExerciseBtn.innerText = "Save Exercise";
            document.getElementById("exerciseForm").hidden = false;
            document.getElementById("cancelExerciseAddition").hidden = false;
            addExercise();
        }
    });

    if (document.getElementById("cancelExerciseAddition")) document.getElementById("cancelExerciseAddition").addEventListener("click", () => {
        let muscleGroupSelection = document.getElementById("muscleGroupSelection");
        let exName = document.getElementById("exerciseName");
        let exDescription = document.getElementById("exerciseDescription");
        let exEquipment = document.getElementById("equipment");
        addExerciseBtn.innerText = "Add New Exercise";
        document.getElementById("cancelExerciseAddition").hidden = true;
        document.getElementById("exerciseForm").hidden = true;
        for (let i = 0; i < muscleGroupSelection.children; i++) {
        let liElem = muscleGroupSelection.children.item(i);
            if (liElem.nodeName == "dd" && liElem.children.item(1).checked) liElem.children.item(1).checked = false;
        }
        document.getElementById("public").checked = false;
        document.getElementById("usesWeight").checked = false;
        exEquipment.value = "";
        exName.value = "";
        exDescription.value = "";
    });
}

function initializePlanTable() {
    if (document.getElementById("plan")) document.getElementById("plan").addEventListener("click", (event) => {
        document.getElementById("plan-section").hidden = !event.target.checked;
        if (document.getElementById("plan-section").hidden) {
            document.getElementById("plan-table").innerHTML = '';
        } else {
            addWeekday(null);
        }
        document.getElementById("plan-table").childNodes.forEach((node) => node.childNodes.forEach((node) => node.value = ""));
    });

    if (document.getElementById("delete-day")) document.getElementById("delete-day").addEventListener("click", (event) => {
        if (document.getElementById("plan-table").children.length > 1) event.target.parentElement.parentElement.remove();
    });

    if (document.getElementById("add-weekday")) document.getElementById("add-weekday").addEventListener("click", () => {
        addWeekday(null);
    });
}

function loadAndInitializeChecked(settings) {
    let sessionStatsSection = document.getElementById("dynamicDiv");
    let realTimeStatsSection = document.getElementById("realTimeDiv");
    let longtermStatsSection = document.getElementById("staticDiv");

    if (!sessionStatsSection || !realTimeStatsSection || !longtermStatsSection) return;
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

        if (sessionStatsSection) sessionStatsSection.hidden = !settings.viewing.sessionStats;
        if (realTimeStatsSection) realTimeStatsSection.hidden = !settings.viewing.realTimeStats;
        if (document.getElementById("dynamicHeadline")) document.getElementById("dynamicHeadline").hidden = !(settings.viewing.realTimeStats || settings.viewing.sessionStats);
        if (longtermStatsSection) longtermStatsSection.hidden = !settings.viewing.longtermStats;

        document.getElementById("viewingRealTime").addEventListener("click", (event) => {
            let realTimeStatsSection = document.getElementById("realTimeDiv");
            let checked = event.target.checked;
            let deviceData = getDeviceData();
            if (deviceData.loggedIn) {
                let settings = getSettingsFromLocalStorage();
                if (settings.viewing) settings.viewing.realTimeStats = checked;
                if (settings.viewing) localStorage.setItem("userSettings", JSON.stringify(settings));
                if (settings.viewing) setUserSettings(settings);
                if (realTimeStatsSection) realTimeStatsSection.hidden = !checked;
                if (document.getElementById("dynamicHeadline")) document.getElementById("dynamicHeadline").hidden = !(settings.viewing.realTimeStats || settings.viewing.sessionStats);
            }
        });

        document.getElementById("viewingSession").addEventListener("click", (event) => {
            let sessionStatsSection = document.getElementById("dynamicDiv");
            let checked = event.target.checked;
            let deviceData = getDeviceData();
            if (deviceData.loggedIn) {
                let settings = getSettingsFromLocalStorage();
                if (settings.viewing) settings.viewing.sessionStats = checked;
                if (settings.viewing) localStorage.setItem("userSettings", JSON.stringify(settings));
                if (settings.viewing) setUserSettings(settings);
                if (sessionStatsSection) sessionStatsSection.hidden = !checked;
                if (document.getElementById("dynamicHeadline")) document.getElementById("dynamicHeadline").hidden = !(settings.viewing.realTimeStats || settings.viewing.sessionStats);
            }
        });

        document.getElementById("viewingLongterm").addEventListener("click", (event) => {
            let longtermStatsSection = document.getElementById("staticDiv");
            let checked = event.target.checked;
            let deviceData = getDeviceData();
            if (deviceData.loggedIn) {
                let settings = getSettingsFromLocalStorage();
                if (settings.viewing) settings.viewing.longtermStats = checked;
                if (settings.viewing) localStorage.setItem("userSettings", JSON.stringify(settings));
                if (settings.viewing) setUserSettings(settings);
                if (longtermStatsSection) longtermStatsSection.hidden = !checked;
            }
        });
    }
}