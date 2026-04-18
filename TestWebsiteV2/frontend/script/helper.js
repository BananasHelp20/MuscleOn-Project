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
    let properties = getUserPropertiesFromLocalStorage();
    if (properties.createdPlan && !deviceProperties.editingPlanSection && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Alter Trainings Plan";
    } else if (!deviceProperties.editingPlanSection && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Create Trainings Plan";
    } else if (document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Save Trainings Plan";
    }
    if (document.getElementById("plan-section")) document.getElementById("plan-section").hidden = !deviceProperties.editingPlanSection;

    if (properties.currentlyInExercise && document.getElementById("startStopExercise")) {
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
    sessionButtonCheck();
    if (document.getElementById("startStopSession")) document.getElementById("startStopSession").addEventListener("click", () => {
        let device = getUserPropertiesFromLocalStorage();
        device.currentlyInExercise = !device.currentlyTraining;
        if (device.currentExercise) {
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
        log(properties.createdPlan);
        log(properties.usualSessionTimes)
        if (device.editingPlanSection) { //on trying to save
            let times = getSessionTimes();
            if (validateSessionTimes(times)) {
                device.editingPlanSection = false;
                document.getElementById("plan-table").innerHTML = "";
                document.getElementById("exercise-tables").innerHTML = "";
                properties.usualSessionTimes = times;
                properties.createdPlan = true;
                setUserProperties(properties);
            } else {
                alert("Training days not valid");
            }
        } else { //on activation
            device.editingPlanSection = true;
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
    initializePlanTable();
}

function initializeLogin() {
    let loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", () => {
        login();
    });
}

function initializeSignUp() {
    document.getElementById("plan").checked = false;
    document.getElementById("plan-table").childNodes.forEach((node) => node.childNodes.forEach((node) => node.value = ""));
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

    let NULL = document.createElement("option");
    NULL.value = -1;
    NULL.label = "Select Muscle Group";
    elem.add(NULL);

    for (let group of muscleGroups) {
        let option = document.createElement("option");
        option.text = group;
        elem.add(option);
    }
}

function setExerciseOptions(elem) {
    let exerciseTypes = [document.createElement("optgroup"), document.createElement("optgroup"), document.createElement("optgroup")];
    exerciseTypes[0].label = "Supported Exercises";
    exerciseTypes[1].label = "Unsupported Exercises";
    exerciseTypes[2].label = "Own Exercises";
    let muscleGroups = getMuscleGroups();

    let NULL = document.createElement("option");
    NULL.value = "Select Exercises";
    NULL.label = "Select Exercises";
    elem.add(NULL);

    let exercises = [getSupportedExercisesFromLS(), getUnsupportedExercisesFromLS(), getUserdefinedExercisesFromLS()]
    let prefixes = ["s", "u", "d"];

    for (let k = 0; k < exercises.length; k++) { //des wor fü denkoabeit
        if (exercises[k].length > 0) {
            elem.add(exerciseTypes[k]);
            for (let i = 0; i < muscleGroups.length; i++) {
                let options = [];
                for (let j = 0; j < exercises[k].length; j++) {
                    if (exercises[k][j].targetedMuscleGroups.includes(muscleGroups[i])) {
                        let opt = document.createElement("option");
                        opt.label = exercises[k][j].name;
                        opt.value = prefixes[k] + exercises[k][j].name;
                        options.push(opt);
                    }
                }
                if (options.length > 0) {
                    let optGr = document.createElement("optgroup");
                    optGr.label = muscleGroups[i];
                    elem.add(optGr);
                    options.forEach((opt) => {
                        elem.add(opt);
                    })
                }
            }
        }
    }
}

function getFreeSessionId() {
    let ids = [];
    let table = document.getElementById("plan-table");
    let id = 0;

    if (table.children.length != 0) {
        for (let i = 0; i < table.children.length; i++) {
            let row = table.children.item(i);
            ids.push(Number(row.getAttribute("id")));
        }
        ids.sort();
    }

    for (let i = 1; i <= 2000000 && ids.includes(id); i++) {
        id = i;
    }

    if (id > 2000000) {
        alert("you can only have 2,000,000 Sessions! (if you see this, you're absolutely based)");
        return null;
    }
    return id == -1 ? null : id;
}

function findExerciseTableById(sessionId) {
    for (let i = 0; i < document.getElementById("exercise-tables").children.length; i++) {
        let tbodyIndex;
        for (let j = 0; j < document.getElementById("exercise-tables").children.item(i).children.length; j++) {
            if (document.getElementById("exercise-tables").children.item(i).children.item(j).getAttribute("id")) tbodyIndex = j;
        }
        if (document.getElementById("exercise-tables").children.item(i).children.item(tbodyIndex).getAttribute("id") == "exercise-table" + sessionId) return i;
    }
    return -1;
}

function addExercises(sessionId) {
    let foundIndex = findTimeTableById(sessionId);
    if (foundIndex == -1) {
        log("something went wrong: " + foundIndex);
        return;
    }
    let row = document.getElementById("plan-table").children.item(foundIndex);
    let times = {
        sessionId: sessionId,
        times: {
            weekday: row.children.item(0).children.item(0).value,
            fromTime: row.children.item(1).children.item(0).value,
            toTime: row.children.item(2).children.item(0).value
        }
    }

    let newTable = getEmptyExerciseTable(times);
    document.getElementById("exercise-tables").appendChild(newTable);
}

function findTimeTableById(sessionId) {
    for (let i = 0; i < document.getElementById("plan-table").children.length; i++) {
        if (document.getElementById("plan-table").children.item(i).getAttribute("id") == "" + sessionId) return i;
    }
    return -1;
}

function removeExercises(sessionId) {
    let foundIndex = findExerciseTableById(sessionId);
    if (foundIndex == -1) {
        log("something went wrong: " + foundIndex);
        return;
    }

    document.getElementById("exercise-tables").children.item(foundIndex).remove();
}

function addWeekday(data) {
    let weekdayData = (data) ? data.times : null;
    let sessionId = data ? data.sessionId : getFreeSessionId();

    let weekday = document.createElement("input");
    weekday.setAttribute("type", "text");
    weekday.setAttribute("id", "weekday" + sessionId);
    weekday.setAttribute("placeholder", "Monday");
    if (weekdayData) weekday.value = weekdayData.weekday;
    weekday.addEventListener("input", (event) => {
        let id = event.target.parentElement.parentElement.getAttribute("id");
        let foundIndex = findExerciseTableById(id);
        if (foundIndex != -1) {
            let exTableBody = document.getElementById("exercise-table" + id);
            let exTableHead = exTableBody.parentElement.children.item(0);
            exTableHead.children.item(0).children.item(0).children.item(0).innerText = "Session: " + event.target.value;
        }
    })

    let from = document.createElement("input");
    from.setAttribute("type", "text");
    from.setAttribute("id", "from" + sessionId);
    from.setAttribute("placeholder", "08:00");
    if (weekdayData) from.value = weekdayData.fromTime;
    from.addEventListener("input", (event) => {
        let id = event.target.parentElement.parentElement.getAttribute("id");
        let foundIndex = findExerciseTableById(id);
        if (foundIndex != -1) {
            let exTableBody = document.getElementById("exercise-table" + id);
            let exTableHead = exTableBody.parentElement.children.item(0);
            exTableHead.children.item(0).children.item(0).children.item(1).innerText = " from: " + event.target.value;
        }
    })

    let to = document.createElement("input");
    to.setAttribute("type", "text");
    to.setAttribute("id", "to" + sessionId);
    to.setAttribute("placeholder", "09:30");
    if (weekdayData) to.value = weekdayData.toTime;
    to.addEventListener("input", (event) => {
        let id = event.target.parentElement.parentElement.getAttribute("id");
        let foundIndex = findExerciseTableById(id);
        if (foundIndex != -1) {
            let exTableBody = document.getElementById("exercise-table" + id);
            let exTableHead = exTableBody.parentElement.children.item(0);
            exTableHead.children.item(0).children.item(0).children.item(2).innerText = " to: " + event.target.value;
        }
    })

    let primaryMuscleGroup = document.createElement("select");
    primaryMuscleGroup.setAttribute("name", "selectMuscleGroup");
    primaryMuscleGroup.setAttribute("id", "selectMuscleGroup");
    setMuscleGroupOptions(primaryMuscleGroup);
    if (data) primaryMuscleGroup.value = data.primaryMuscleGroup;

    let delButton = document.createElement("button");
    delButton.setAttribute("id", "delete-day");
    delButton.innerText = "remove day";
    delButton.addEventListener("click", (event) => {
        if (document.getElementById("plan-table").children.length > 1) event.target.parentElement.parentElement.remove();
        if (document.getElementById("plan-table").children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
        if (findExerciseTableById(Number(event.target.parentElement.parentElement.getAttribute("id"))) != -1) removeExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
    });

    let removeExercisesForDayButton = document.createElement("button");
    removeExercisesForDayButton.setAttribute("id", "exercise-controlButton");
    if (data && data.exercises) {
        removeExercisesForDayButton.innerText = "remove exercises";
    } else {
        removeExercisesForDayButton.innerText = "add exercises";
    }
    removeExercisesForDayButton.addEventListener("click", (event) => {
        if (document.getElementById("exercise-table" + event.target.parentElement.parentElement.getAttribute("id"))) {
            removeExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
            event.target.innerText = "add exercises";
        } else {
            addExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
            event.target.innerText = "remove exercises";
        }
    });

    let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
    tds[0].appendChild(weekday);
    tds[1].appendChild(from);
    tds[2].appendChild(to);
    tds[3].appendChild(primaryMuscleGroup);
    tds[4].appendChild(delButton);
    tds[5].appendChild(removeExercisesForDayButton)

    let tr = document.createElement("tr");
    tr.setAttribute("id", "" + sessionId);
    tds.forEach((td) => {
        tr.appendChild(td);
    });
    document.getElementById("plan-table").appendChild(tr);
}

function initSelectExercise(elem, id, data) {
    elem.parentElement.parentElement.children.item(1).innerText = data[id].equipment;
    elem.parentElement.parentElement.children.item(4).innerHTML = "";
    if (data[id].weight == true) {
        let input = document.createElement("input");
        input.placeholder = "15";
        input.id = "weight" + elem.parentElement.parentElement.getAttribute("id");
        elem.parentElement.parentElement.children.item(4).appendChild(input);
    } else {
        elem.parentElement.parentElement.children.item(4).innerHTML = " - ";
    }
}

function setSelectedExercise(elem) {
    let id = elem.value;
    if (id.startsWith("s")) {
        id = id.substring(1);
        getSupportedExercises().then(data => {
            initSelectExercise(elem, getIndexOfName(data, id), data);
        });
    } else if (id.startsWith("u")) {
        id = id.substring(1);
        getUnsupportedExercises().then(data => {
            initSelectExercise(elem, getIndexOfName(data, id), data);
        });
    } else { //starts with d
        id = id.substring(1);
        getUserDefinedExercises().then(data => {
            initSelectExercise(elem, getIndexOfName(data, id), data);
        });
    }
}

function getIndexOfName(array, name) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].name == name) return i;
    }
    return -1;
}

//parameter data: de bisherigen Sessiondaten, von einem Tag (moch des so, das du beim add exercises button a input host, wost in tag dazuschreibst oda so) mit leerem exercises element (optional))
function loadExerciseSelection(data) { //FAAAAACK i glaub du muast jetzt a table aus tables mochn, oder dynamisch tables zu an div adden
    let sessionId = data.sessionId;
    let exerciseData = (data) ? data.exercises : null;
    if (data && !data.exercises) return;

    let exerciseDiv = document.getElementById("exercise-tables");
    let exerciseTable = getEmptyExerciseTable(data);

    let delButton = document.createElement("button");
    delButton.setAttribute("id", "delete-exercise");
    delButton.innerText = "remove exercise";
    delButton.addEventListener("click", (event) => {
        if (event.target.parentElement.parentElement.parentElement.children.length > 1) event.target.parentElement.parentElement.remove();
        if (event.target.parentElement.parentElement.parentElement.children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
    });

    let tbody = document.createElement("tbody");
    tbody.setAttribute("id", "exercise-table" + sessionId);

    for (i in exerciseData) {
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
        tds[5].appendChild(delButton);

        let tr = document.createElement("tr");
        tr.setAttribute("id", i);
        tds.forEach((td) => {
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    }

    exerciseTable.appendChild(tbody);
    exerciseDiv.appendChild(exerciseTable);
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
    mainTh.innerHTML = "<span>Day: " + time.times.weekday + "</span><span> from " + time.times.fromTime + "</span><span> to " + time.times.toTime + "</span>";
    mainTh.setAttribute("colspan", ths.length - 1);

    let addButton = document.createElement("button");
    addButton.innerText = "Add new Exercise";

    let tr = document.createElement("tr");
    tr.setAttribute("id", event.target.parentElement.parentElement.parentElement.children.length);

    addButton.addEventListener("click", (event) => {
        let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
        let inputs = [document.createElement("input"), document.createElement("input"), document.createElement("input")];

        let select = document.createElement("select");
        setExerciseOptions(select);
        select.addEventListener("change", (event) => {
            setSelectedExercise(event.target);
        });
        select.value = "Select Exercise";
        tds[0].appendChild(select);

        tds[1].innerText = "No Exercise Selected";

        inputs[0].setAttribute("id", "reps" + tr.getAttribute("id"));
        inputs[0].placeholder = 5;
        tds[2].appendChild(inputs[0]);

        inputs[1].setAttribute("id", "sets" + tr.getAttribute("id"));
        inputs[1].placeholder = 3;
        tds[3].appendChild(inputs[1]);

        tds[4].innerText = "No Exercise Selected"

        let delButton = document.createElement("button");
        delButton.setAttribute("id", "delete-exercise");
        delButton.innerText = "remove exercise";
        delButton.addEventListener("click", (event) => {
            if (event.target.parentElement.parentElement.parentElement.children.length > 1) event.target.parentElement.parentElement.remove();
            if (event.target.parentElement.parentElement.parentElement.children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
        });
        tds[5].appendChild(delButton);

        tds.forEach((td) => {
            tr.appendChild(td);
        });
        event.target.parentElement.parentElement.parentElement.parentElement.children.item(1).appendChild(tr);
    });

    let addButtonTh = document.createElement("th");
    addButtonTh.appendChild(addButton);

    let headerRow = document.createElement("tr");
    headerRow.appendChild(mainTh);
    headerRow.appendChild(addButtonTh);

    let headersRow = document.createElement("tr");
    ths.forEach((th) => {
        headersRow.appendChild(th);
    })

    let thead = document.createElement("thead");
    thead.appendChild(headerRow);
    thead.appendChild(headersRow);

    table.appendChild(thead);
    if (!time.primaryMuscleGroup) {
        let tbody = document.createElement("tbody");
        tbody.setAttribute("id", "exercise-table" + time.sessionId);
        table.appendChild(tbody);
    }

    return table;
}

function initializeExercises() {
    let exerciseDiv = document.getElementById("exerciseDisplay");
    let exerciseSwitch = document.getElementById("exerciseSwitch");
    let settings = getSettingsFromLocalStorage();

    if (exerciseSwitch) exerciseSwitch.innerText = settings.viewingExercises ? settings.viewingExercises : "All Exercises";

    if (exerciseSwitch) exerciseSwitch.addEventListener("click", (event) => {
        if (event.target.innerText == "All Exercises") {
            event.target.innerText = "User-defined Exercises";
        } else if (event.target.innerText == "User-defined Exercises") {
            event.target.innerText = "Community-made Exercises";
        } else if (event.target.innerText == "Community-made Exercises") {
            event.target.innerText = "Supported Exercises";
        } else if (event.target.innerText == "Supported Exercises") {
            event.target.innerText = "All Exercises";
        } else {
            event.target.innerText = "All Exercises";
        }
        let settings = getSettingsFromLocalStorage();
        let device = getDeviceData();

        settings.viewingExercises = event.target.innerText;
        localStorage.setItem("userSettings", JSON.stringify(settings));
        
        if (device.loggedIn) setUserSettings(settings);

        //updateExerciseDisplay();
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
            }
            localStorage.setItem("deviceData", JSON.stringify(newDeviceData));
            localStorage.setItem("userSettings", JSON.stringify(answer.userSettings))
            localStorage.setItem("userProperties", JSON.stringify(answer.userProperties))
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
    if (!document.getElementById("plan-table") || !document.getElementById("exercise-tables")) return;

    let table = document.getElementById("plan-table");
    let exerciseTables = document.getElementById("exercise-tables");
    let plan = []
    let plantime = [];
    let primaryMuscleGroups = [];
    let exercises = [[]];
    let ids = [];

    for (let i = 0; i < table.children.length; i++) {
        ids.push(table.children.item(i).getAttribute("id"));
        for (let j = 0; j < table.children.item(i).children.length; j++) {
            let row = table.children.item(i).children.item(j).children.item(0);
            if (row.getAttribute("id") != null && row.getAttribute("type") != null && row.nodeName != "SELECT") {
                plantime.push(row.value);
            }
            if (row.getAttribute("id") != null && row.nodeName == "SELECT") {
                primaryMuscleGroups.push(row.value);
            }
        }
        plan.push(plantime);
        plantime = [];
    }

    for (let i = 0; i < exerciseTables.children.length; i++) {
        let tbodyIndex;
        for (let j = 0; j < exerciseTables.children.item(i).children.length; j++) { //tables durchgeh
            if (exerciseTables.children.item(i).children.item(j).getAttribute("id")) tbodyIndex = j;
        }

        for (let j = 0; j < exerciseTables.children.item(i).children.item(tbodyIndex).children.length; j++) { //rows durchgehen
            let row = exerciseTables.children.item(i).children.item(tbodyIndex).children.item(j);
            let allExercises = [];
            let thisExercise;
            if (row.children.item(0).children.item(0).value.charAt(0) == "s") {
                allExercises = getSupportedExercisesFromLS();
                thisExercise = allExercises[getIndexOfName(allExercises, row.children.item(0).children.item(0).value.substring(1))];
            } else if (row.children.item(0).children.item(0).value.charAt(0) == "u") {
                allExercises = getUnsupportedExercisesFromLS();
                thisExercise = allExercises[getIndexOfName(allExercises, row.children.item(0).children.item(0).value.substring(1))];
            } else {
                allExercises = getUserdefinedExercisesFromLS();
                thisExercise = allExercises[getIndexOfName(allExercises, row.children.item(0).children.item(0).value.substring(1))];
            }
            if (!exercises[i]) exercises.push([]);
            if (!thisExercise) return null;
            exercises[i].push({
                exerciseType: row.children.item(0).children.item(0).value.charAt(0) == "s" ? "supported" : row.children.item(0).children.item(0).value.charAt(0) == "u" ? "unsupported" : "defined-by-user",
                name: thisExercise.name,
                targetedMuscleGroups: thisExercise.targetedMuscleGroups,
                equipment: thisExercise.equipment,
                reps: row.children.item(2).children.item(0).value,
                sets: row.children.item(3).children.item(0).value,
                weight: (row.children.item(4).children.item(0)) ? row.children.item(4).children.item(0).value : null
            });
        }
    }
    let plantimeObjects = [];
    for (let index = 0; index < plan.length; index++) {
        let time = plan[index];
        let object = {
            sessionId: ids[index],
            primaryMuscleGroup: primaryMuscleGroups[index],
            exercises: exercises[getIndexOfSessionId(ids[index])] != null ? exercises[getIndexOfSessionId(ids[index])] : [], //des mit da id is so a gschicht, finde de exercisetabelle mit da passenden id, und füg de daten davon ein
            times: {
                weekday: time[0],
                fromTime: time[1],
                toTime: time[2]
            }
        };
        plantimeObjects.push(object);
    }
    return plantimeObjects; //geht
}

function getIndexOfSessionId(id) {
    let exerciseTables = document.getElementById("exercise-tables");
    for (let i = 0; i < exerciseTables.children.length; i++) {
        let table = exerciseTables.children.item(i);
        let tbodyIndex;
        for (let j = 0; j < table.children.length; j++) {
            if (table.children.item(j).getAttribute("id")) tbodyIndex = j;
        }
        if (id == Number(table.children.item(tbodyIndex).getAttribute("id").charAt(table.children.item(tbodyIndex).getAttribute("id").length - 1))) return i;
    }
    return -1;
}

function getExerciseWithId(id) {
    let exercises;
    if (id.startsWith("s")) {
        id = id.substring(1);
        exercises = getSupportedExercisesFromLS();
        for (let i = 0; i < exercises.length; i++) {
            if (id == exercises[i].name) {
                return exercises[i];
            }
        }
    } else if (id.startsWith("u")) {
        id = id.substring(1);
        exercises = getUnsupportedExercisesFromLS();
        for (let i = 0; i < exercises.length; i++) {
            if (id == exercises[i].name) {
                return exercises[i];
            }
        }
    } else {
        id = id.substring(1);
        exercises = getUserdefinedExercisesFromLS();
        for (let i = 0; i < exercises.length; i++) {
            if (id == exercises[i].name) {
                return exercises[i];
            }
        }
    }
    return null;
}

function validateSessionTimes(data) {
    if (!data) return false;
    for (let i = 0; i < data.length; i++) {
        let exercises = data[i].exercies ? data[i].exercises : null;
        let time = data[i].times;
        if (!time || data[i].primaryMuscleGroup == "" || data[i].sessionId == -1) {
            console.error("if 1");
            return false;
        }
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
            console.error("if 2");
            return false;
        }
        if (exercises) {
            for (let exercise of exercises) {
                if (!(
                    exercise.exerciseType &&
                    exercise.name &&
                    exercise.targetedMuscleGroups &&
                    exercise.targetedMuscleGroups.length != 0 &&
                    exercise.equipment &&
                    exercise.reps &&
                    exercise.sets &&
                    !isNaN(Number(exercise.reps)) &&
                    !isNaN(Number(exercise.sets)) &&
                    exercise.reps != "" &&
                    exercise.sets != ""
                )) {
                    console.error("if 3 (" + exercise + ")");
                    return false;
                }
            }
        }
    }
    return true;
}

function showLoggedIn(deviceData) {
    let loggedInAsDisplay = document.getElementById("currentUser");
    if (deviceData.loggedIn && loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = deviceData.loggedInAsUser + " <button id='logoutButton'>Logout</button>";
    } else if (loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = "You are logged out. <a href='./login.html'>Login</a> <br>Don't have an account? <a href='./signup.html'>Signup Now</a>";
    }
}

function setModes(data) {
    let lightSwitch = document.getElementById("lightSwitch");
    let devModeSwitch = document.getElementById("dev");
    log(data);
    if (data) {
        localStorage.setItem("lightSwitch", (data.mode == "lightmode") + "");
        localStorage.setItem("lightSwitch", data.devMode + "");
    } else {
        localStorage.setItem("lightSwitch", true);
        localStorage.setItem("devmode", true);
    }
    document.getElementById("modeStylesheet").href = data ? (data.mode == "lightmode" ? "./css/light.css" : "./css/dark.css") :  "./css/light.css";
    lightSwitch.innerText = data ? data.mode : "lightmode";
    if (devModeSwitch) devModeSwitch.innerText = data? (data.devMode ? "devmode" : "usermode") : "usermode";
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
                settings.viewing.realTimeStats = checked;
                localStorage.setItem("userSettings", JSON.stringify(settings));
                setUserSettings(settings);
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
                settings.viewing.sessionStats = checked;
                localStorage.setItem("userSettings", JSON.stringify(settings));
                setUserSettings(settings);
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
                settings.viewing.longtermStats = checked;
                localStorage.setItem("userSettings", JSON.stringify(settings));
                setUserSettings(settings);
                if (longtermStatsSection) longtermStatsSection.hidden = !checked;
            }
        });
    }
}

function showRealTimeData(userdata) {
    // let heartRateDisplay = document.getElementById("heartFrequence");
    // let oxygenDisplay = document.getElementById("oxygen");
    // let currentMuscleBeingTrainedDisplay = document.getElementById("currentMuscleBeingTrained");
    // let currentExerciseDisplay = document.getElementById("currentExercise");

    // heartRateDisplay.innerText = userdata.userShortTerm.heartFrequence + " bpm";
    // oxygenDisplay.innerText = userdata.userShortTerm.oxygen + " %";
    // currentMuscleBeingTrainedDisplay.innerText = userdata.userShortTerm.currentMuscleBeingTrained;
    // currentExerciseDisplay.innerText = userdata.userShortTerm.currentExercise;

    document.getElementById("dynamicHeadline").hidden = !(userdata.userSettings.viewing.realTimeStats || userdata.userSettings.viewing.sessionStats);
    document.getElementById("viewingRealTime").checked = userdata.userSettings.viewing.realTimeStats;
    document.getElementById("realTimeDiv").hidden = !userdata.userSettings.viewing.realTimeStats;
}

function showSessionData(userdata) {
    // let avgHeartRateDisplay = document.getElementById("averageHeartFrequence");
    // let avgOxygenDisplay = document.getElementById("averageOxygen");
    // let avgMuscleUsageDisplay = document.getElementById("averageMuscleUsageInPercent");
    // let trainedMusclesInCurrentOrLatestSessionDisplay = document.getElementById("trainedMuscles");

    // avgHeartRateDisplay.innerText = userdata.userSessionData.averageHeartFrequence + " bpm";
    // avgOxygenDisplay.innerText = userdata.userSessionData.averageOxygen + " %";
    // avgMuscleUsageDisplay.innerText = userdata.userSessionData.averageMuscleUsageInPercent + " %";

    document.getElementById("viewingSession").checked = userdata.userSettings.viewing.sessionStats;
    document.getElementById("dynamicDiv").hidden = !userdata.userSettings.viewing.sessionStats;
}

function showLongtermData(userdata) {
    // let maxTimeTrainedDisplay = document.getElementById("maxTimeTrained");
    // let maxDoneInOneForEachExerciseDisplay = document.getElementById("maxDoneInOneForEachExercise");
    // let maxHeartRateDisplay = document.getElementById("maxHeartRate");
    // let averageTimeTrainedDisplay = document.getElementById("averageTimeTrained");
    // let averageHeartFrequenceDisplay = document.getElementById("averageHeartFrequence");
    // let averageOxygenDisplay = document.getElementById("averageOxygen")
    // let averageMuscleUsageInPercentDisplay = document.getElementById("averageMuscleUsageInPercent");
    // let weeklyBurnedCaloriesDisplay = document.getElementById("weeklyBurnedCalories");
    // let monthlyStrengthIncreaseDisplay = document.getElementById("monthlyStrengthIncrease");
    // let weeklyTrainingTimeDisplay = document.getElementById("weeklyTrainingTime");
    // let mostTrainedMuscleDisplay = document.getElementById("mostTrainedMuscle");
    // let mostDoneExerciseDisplay = document.getElementById("mostDoneExercise");

    // maxTimeTrainedDisplay.innerText = userdata.userHighscores.maxTimeTrained + " Minuten";
    // maxHeartRateDisplay.innerText = userdata.userHighscores.maxHeartRate + " bpm";
    // averageTimeTrainedDisplay.innerText = userdata.userLongTermAverages.averageTimeTrained + " Minuten";
    // averageHeartFrequenceDisplay.innerText = userdata.userLongTermAverages.averageHeartFrequence + " bpm";
    // averageOxygenDisplay.innerText = userdata.userLongTermAverages.averageOxygen + " %";
    // averageMuscleUsageInPercentDisplay.innerText = userdata.userLongTermAverages.averageMuscleUsageInPercent + " %";
    // weeklyBurnedCaloriesDisplay.innerText = userdata.userLongTermAverages.weeklyBurnedCalories + " kcal";
    // monthlyStrengthIncreaseDisplay.innerText = userdata.userLongTermAverages.monthlyStrengthIncrease + " %";
    // weeklyTrainingTimeDisplay.innerText = userdata.userLongTermAverages.weeklyTrainingTime + " Minuten";
    // mostTrainedMuscleDisplay.innerText = userdata.userLongTermAverages.mostTrainedMuscle;
    // mostDoneExerciseDisplay.innerText = userdata.userLongTermAverages.mostDoneExercise;

    document.getElementById("viewingLongterm").checked = userdata.userSettings.viewing.longtermStats;
    document.getElementById("staticDiv").hidden = !userdata.userSettings.viewing.longtermStats;
}

function getUserDataFromLocalStorage() {
    try {
        let data = localStorage.getItem("userData");
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        log("Error parsing userData from localStorage:", error);
        return null;
    }
}

function getUserPropertiesFromLocalStorage() {
    let properties;
    try {
        let data = localStorage.getItem("userProperties");
        if (data) {
            properties = JSON.parse(data);
        }
    } catch (error) {
        properties = null;
    }

    if (properties == null) {
        properties = {
            userId: 0,
            userName: "dev",
            password: "",
            email: "dave@dev.com",
            weight: 70,
            size: 175,
            birthday: "1980-01-01",
            currentlyTraining: false,
            currentlyInExercise: false,
            createdPlan: false,
            usualSessionTimes: []
        }
        log("userproperties are NULL!");
    } else {
        //log("loading settings of user \"" + getDeviceData().loggedInAsUser + "\"")
    }
    return properties;
}

function getSettingsFromLocalStorage() { //MOCH DO KA log() EINI!
    let settings;
    try {
        if (localStorage.getItem("userSettings")) {
            settings = JSON.parse(localStorage.getItem("userSettings"));
        }
    } catch (error) {
        settings = null;
    }

    if (settings == null) {
        settings = {
            mode: "lightmode",
            viewing: {
                realTimeStats: false,
                sessionStats: false,
                longtermStats: false,
            },
            devMode: false
        }
    } else {
        //log("loading settings of user \"" + getDeviceData().loggedInAsUser + "\"")
    }
    return settings;
}

function getSupportedExercisesFromLS() {
    let ex = JSON.parse(localStorage.getItem("supportedExercises"));
    return ex ? ex : [];
}

function getUnsupportedExercisesFromLS() {
    let ex = JSON.parse(localStorage.getItem("unsupportedExercises"));
    return ex ? ex : [];
}

function getUserdefinedExercisesFromLS() {
    let ex = JSON.parse(localStorage.getItem("userdefinedExercises"));
    return ex ? ex : [];
}

function getDeviceData() {
    return localStorage.getItem("deviceData") ? JSON.parse(localStorage.getItem("deviceData")) : {
        running: false,
        loggedIn: false,
        loggedInAsUser: "",
        loggedInWithUserId: -1,
        loadedUserData: false,
        sessionRunning: false,
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
        viewing: null,
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
        body: {
            message: "start!"
        }
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to start or resume Session:", response.statusText);
        }
    });
}

async function stopSession() {
    return fetch("/api/session/stop", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to stop Session:", response.statusText);
        }
    });
}

async function startExercise() {
    return fetch("/api/exercise/start", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to resume Exercise", response.statusText);
        }
    });
}

async function stopExercise() {
    return fetch("/api/exercise/stop", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to stop Exercise:", response.statusText);
        }
    });
}

async function saveTimes(times) {
    return fetch("/api/saveTimes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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
            localStorage.setItem("supportedExercises", JSON.stringify(response.json));
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
            localStorage.setItem("unsupportedExercises", JSON.stringify(response.json));
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
            localStorage.setItem("userdefinedExercises", JSON.stringify(response.json));
            return response.json();
        } else {
            console.error("An error ocured while requesting data from backend:", response.statusText);
        }
    });
}

function log(string) { //für devmode
    if (getSettingsFromLocalStorage().devMode) console.log(string);
}