function syncModes() {
    let settings = getSettingsFromLocalStorage();
    if (document.getElementById("dev")) document.getElementById("dev").innerText = settings.devMode ? "devmode" : "usermode";
    if (document.getElementById("lightSwitch")) document.getElementById("lightSwitch").innerText = settings.mode;
    document.getElementById("modeStylesheet").href = settings.mode == "lightmode" ? "./css/light.css" : "./css/dark.css";

    if (settings.devMode && document.getElementById("check")) {
        document.getElementById("check").hidden = false;
        document.getElementById("checkbr").hidden = false;
        document.getElementById("devLists").hidden = false;
    } else if (document.getElementById("check")) {
        document.getElementById("check").hidden = true;
        document.getElementById("checkbr").hidden = true;
        document.getElementById("devLists").hidden = true;
    }
}

function sessionButtonCheck() {
    let deviceProperties = getDeviceData();
    let properties = getUserPropertiesFromLocalStorage();
    if (properties.createdPlan && !deviceProperties.editingPlanSection && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Edit Trainings Plan";
    } else if (!deviceProperties.editingPlanSection && document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Create Trainings Plan";
    } else if (document.getElementById("createTrainingsPlan")) {
        document.getElementById("createTrainingsPlan").innerText = "Save Trainings Plan";
    }
    if (document.getElementById("plan-section")) document.getElementById("plan-section").hidden = !deviceProperties.editingPlanSection;

    if (deviceProperties.startedExercise && document.getElementById("startSkipExercise")) {
        document.getElementById("startSkipExercise").innerText = "Skip Exercise";
    } else if (document.getElementById("startSkipExercise")) {
        document.getElementById("startSkipExercise").innerText = "Start Exercise";
    }

    if (deviceProperties.startedSession && document.getElementById("startStopSession")) {
        document.getElementById("startStopSession").innerText = "Exit Session";
    } else if (document.getElementById("startStopSession")) {

        document.getElementById("startStopSession").innerText = "Start Session";
    }

    const resumeBtn = document.getElementById("resumePauseSession");
    if (resumeBtn) {
        if (properties.currentlyInExercise) {
            resumeBtn.hidden = false;
            resumeBtn.innerText = "Pause Session";
        } else if (deviceProperties.startedExercise) {
            resumeBtn.hidden = false;
            resumeBtn.innerText = "Resume Session";
        } else {
            resumeBtn.hidden = true;
        }
    }

    if (deviceProperties.startedSession && document.getElementById("sessionDiv")) {
        document.getElementById("sessionDiv").hidden = false;
    } else if (document.getElementById("sessionDiv")) {
        document.getElementById("sessionDiv").hidden = true;
    }
}

function showLoggedIn(deviceData) {
    let loggedInAsDisplay = document.getElementById("currentUser");
    if (deviceData.loggedIn && loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = "<span id='inlineUsernameDisplay'>" + deviceData.loggedInAsUser + "</span><button id='logoutButton' class='defaultButton'>Logout</button>";
        initializeLogout();
    } else if (loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = "<button href='./login.html' class='defaultButton' id='inlineLoginButton'>Login</button><button href='./signup.html' id='inlineSignupButton' class='defaultButton'>Signup Now</button>";
    }
}

function setModes(data) {
    let lightSwitch = document.getElementById("lightSwitch");
    let devModeSwitch = document.getElementById("dev");
    if (data) {
        localStorage.setItem("lightSwitch", (data.mode == "lightmode") + "");
        localStorage.setItem("devmode", data.devMode + "");
    } else {
        localStorage.setItem("lightSwitch", true);
        localStorage.setItem("devmode", true);
    }
    if (lightSwitch) document.getElementById("modeStylesheet").href = data ? (data.mode == "lightmode" ? "./css/light.css" : "./css/dark.css") : "./css/light.css";
    if (lightSwitch) lightSwitch.innerText = data ? data.mode : "lightmode";
    if (devModeSwitch) devModeSwitch.innerText = data ? (data.devMode ? "devmode" : "usermode") : "usermode";
}

function showRealTimeData(userdata) {
    let heartRateDisplay = document.getElementById("heartFrequence");
    let currentMuscleBeingTrainedDisplay = document.getElementById("currentMuscleBeingTrained");
    let repDisplay = document.getElementById("repDisplay");
    let setDisplay = document.getElementById("setDisplay");

    let data = userdata.userShortTerm;

    if (data) {
        document.getElementById("realTimeDataDiv").hidden = false;
        // heartRateDisplay.innerText = data.heartFrequency + " bpm";
        currentMuscleBeingTrainedDisplay.innerText = data.trainingMuscle;
        repDisplay.innerText = data.currentReps;
        setDisplay.innerText = data.currentSets;
    } else {
        document.getElementById("realTimeDataDiv").hidden = true;
        // heartRateDisplay.innerText = "0 bpm";
        currentMuscleBeingTrainedDisplay.innerText = "";
        repDisplay.innerText = "0";
        setDisplay.innerHTML = "0";
    }

    document.getElementById("dynamicHeadline").hidden = !(userdata.userSettings.viewing.realTimeStats || userdata.userSettings.viewing.sessionStats);
    document.getElementById("viewingRealTime").checked = userdata.userSettings.viewing.realTimeStats;
    document.getElementById("realTimeDiv").hidden = !userdata.userSettings.viewing.realTimeStats;
}

function showSessionData(userdata) {
    let avgHeartRateDisplay = document.getElementById("averageHeartFrequence");
    let avgMuscleUsageDisplay = document.getElementById("averageMuscleUsageInPercent");
    let trainedMusclesInCurrentOrLatestSessionDisplay = document.getElementById("trainedMuscles");
    let exercisesAheadDisplay = document.getElementById("exercisesAhead");
    let exercisesFinishedDisplay = document.getElementById("exercisesFinished");

    let data = userdata.userSessionData;

    if (data) {
        document.getElementById("dynamicDataDiv").hidden = false;
        // avgHeartRateDisplay.innerText = data.averageHeartFrequence;
        avgMuscleUsageDisplay.innerText = data.averageMuscleUsageInPercent;
        trainedMusclesInCurrentOrLatestSessionDisplay.innerHTML = ""//getMuscleList(data); //aaaah
        exercisesFinishedDisplay.innerHTML = ""//getExerciseList(data);
    } else {
        document.getElementById("dynamicDataDiv").hidden = true;
    }
    document.getElementById("viewingSession").checked = userdata.userSettings.viewing.sessionStats;
    document.getElementById("dynamicDiv").hidden = !userdata.userSettings.viewing.sessionStats;
}

function showLongtermData(userdata) {
    let maxTimeTrainedDisplay = document.getElementById("maxTimeTrained");
    let maxDoneInOneForEachExerciseDisplay = document.getElementById("maxDoneInOneForEachExercise");
    let maxHeartRateDisplay = document.getElementById("maxHeartRate");
    let averageTimeTrainedDisplay = document.getElementById("averageTimeTrained");
    let averageHeartFrequenceDisplay = document.getElementById("averageHeartFrequence");
    let averageMuscleUsageInPercentDisplay = document.getElementById("averageMuscleUsageInPercent");
    let monthlyStrengthIncreaseDisplay = document.getElementById("monthlyStrengthIncrease");
    let weeklyTrainingTimeDisplay = document.getElementById("weeklyTrainingTime");
    let mostTrainedMuscleDisplay = document.getElementById("mostTrainedMuscle");
    let mostDoneExerciseDisplay = document.getElementById("mostDoneExercise");

    let data = userdata.userLongTermAverages;
    let data2 = userdata.userHighscores;

    if (data && data2) {
        document.getElementById("staticDataDiv").hidden = false;
        maxTimeTrainedDisplay.innerText = data2.maxSessionTime;
        maxDoneInOneForEachExerciseDisplay.innerText = data2.maxSetReps;
        // maxHeartRateDisplay.innerText = data.maxHeartRate;
        averageTimeTrainedDisplay.innerText = data.averageSessionTime;
        // averageHeartFrequenceDisplay.innerText = data.averageHeartRate;
        averageMuscleUsageInPercentDisplay.innerText = data.averageUsageInPercent;
        monthlyStrengthIncreaseDisplay.innerText = data.monthlyStrengthIncrease;
        weeklyTrainingTimeDisplay.innerText = data.weeklyTrainingTime;
        mostTrainedMuscleDisplay.innerText = data2.mostTrainedMuscleGroup;
        mostDoneExerciseDisplay.innerText = data2.mostDoneExercise.name;
    } else {
        document.getElementById("staticDataDiv").hidden = true;
    }

    document.getElementById("viewingLongterm").checked = userdata.userSettings.viewing.longtermStats;
    document.getElementById("staticDiv").hidden = !userdata.userSettings.viewing.longtermStats;
}

function showProfileSettings(userdata) {
    let profileSettingsList = document.getElementById("profileSettingsList");
    if (!profileSettingsList) return;
    profileSettingsList.innerHTML = "";
    let email = document.createElement("li");
    email.innerText = "Email: " + userdata.email;
    let userName = document.createElement("li");
    userName.innerText = "Username: " + userdata.userName;
    let weight = document.createElement("li");
    weight.innerText = "Weight: " + userdata.weight + " kg";
    let size = document.createElement("li");
    size.innerText = "Size: " + userdata.size + " cm";
    let birthday = document.createElement("li");
    birthday.innerText = "Birthday: " + userdata.birthday;
    profileSettingsList.appendChild(userName);
    profileSettingsList.appendChild(email);
    profileSettingsList.appendChild(weight);
    profileSettingsList.appendChild(size);
    profileSettingsList.appendChild(birthday);
}

function showButtons(loggedIn) {
    let lockedElements = document.getElementsByClassName("locked");
    let lockedButtons = document.getElementsByClassName("lockedButton");
    if (loggedIn) {
        for (let i = 0; i < lockedElements.length; i++) {
            lockedElements.item(i).classList.add("menuObject");
            lockedElements.item(i).classList.add("menuOption");
            lockedElements.item(i).hidden = false;
            lockedElements.item(i).children.item(0).hidden = false;
        }
        for (let i = 0; i < lockedButtons.length; i++) {
            lockedButtons.item(i).hidden = false;
        }
    } else {
        for (let i = 0; i < lockedElements.length; i++) {
            lockedElements.item(i).classList.remove("menuObject");
            lockedElements.item(i).classList.remove("menuOption");
            lockedElements.item(i).hidden = true;
            lockedElements.item(i).children.item(0).hidden = true;
        }
        for (let i = 0; i < lockedButtons.length; i++) {
            lockedButtons.item(i).hidden = true;
        }
    }
}

//render each exercise as a list in the following format:
function renderExercises(settings) {
    let exercisesDiv = document.getElementById("exercises");
    let exerciseState = settings.viewingExercises;
    if (exercisesDiv) {
        exercisesDiv.innerHTML = "";
        let supportedExercises = getSupportedExercisesFromLS();
        let unsupportedExercises = getUnsupportedExercisesFromLS();
        let userdefinedExercises = getUserdefinedExercisesFromLS();
        let exercisesToRender = [];
        if (exerciseState == "All Exercises") {
            exercisesToRender = supportedExercises.concat(unsupportedExercises).concat(userdefinedExercises);
        } else if (exerciseState == "Supported Exercises") {
            exercisesToRender = supportedExercises;
        } else if (exerciseState == "Community-made Exercises") {
            exercisesToRender = unsupportedExercises;
        } else if (exerciseState == "User-defined Exercises") {
            exercisesToRender = userdefinedExercises;
        } else {
            exercisesToRender = [];
        }

        for (let i = 0; i < exercisesToRender.length; i++) {
            let exercise = exercisesToRender[i];
            let isDefined = exercise.exerciseType != "supported";
            let isDefinedByUser = exercise.userIdCreated == getDeviceData().loggedInWithUserId;
            let exerciseObject = document.createElement("div");
            exerciseObject.classList.add("exerciseObject");
            exerciseObject.id = i;

            let title = document.createElement("span");
            title.classList.add("exerciseTitle");
            title.innerText = exercise.name;

            let description = document.createElement("p");
            description.innerText = exercise.description;

            let createdByUser = document.createElement("span");
            createdByUser.classList.add("exerciseCreatedBy");
            createdByUser.innerText = "Created By " + (exercise.userIdCreated == getUserPropertiesFromLocalStorage().userId ? "You" : "User: " + getUserById(exercise.userIdCreated).userName);

            let equipment = document.createElement("span");
            equipment.classList.add("exerciseEquipment");
            equipment.innerText = "Equipment: " + exercise.equipment;

            let weight = document.createElement("span");
            weight.classList.add("exerciseWeight");
            weight.innerText = "Needs Weight: " + (exercise.needsWeight ? "Yes" : "No");

            let isPublic = document.createElement("span");
            isPublic.classList.add("exercisePublic");
            isPublic.innerText = "Public: " + (exercise.public ? "Yes" : "No");

            let muscleGroupList = document.createElement("dl");
            muscleGroupList.classList.add("muscleGroupList");

            let muscleGroupTitle = document.createElement("dt");
            muscleGroupTitle.classList.add("muscleGroupListObject");
            muscleGroupTitle.innerText = "MuscleGroups: ";
            muscleGroupList.appendChild(muscleGroupTitle);
            exercise.targetedMuscleGroups.forEach((muscleGroup) => {
                let muscleGroupListObject = document.createElement("dd");
                muscleGroupListObject.classList.add("muscleGroupListObject");
                muscleGroupListObject.innerText = "- " + muscleGroup;
                muscleGroupList.appendChild(muscleGroupListObject);
            });

            let delButton = document.createElement("button");
            delButton.innerText = "Delete Exercise";
            delButton.classList.add("defaultButton");
            delButton.addEventListener("click", (event) => {
                enableDeleteExercise(event.target);
            });

            let editButton = document.createElement("button");
            editButton.innerText = "Edit Exercise";
            editButton.classList.add("defaultButton");
            editButton.addEventListener("click", (event) => {
                enableEditExercise(event.target);
            });

            let actionDiv = document.createElement("div");
            actionDiv.appendChild(editButton);
            actionDiv.appendChild(delButton);

            exerciseObject.appendChild(title);
            exerciseObject.appendChild(document.createElement("br"));
            exerciseObject.appendChild(description);
            exerciseObject.appendChild(document.createElement("br"));
            if (isDefined) exerciseObject.appendChild(createdByUser);
            if (isDefined) exerciseObject.appendChild(document.createElement("br"));
            exerciseObject.appendChild(equipment);
            exerciseObject.appendChild(document.createElement("br"));
            exerciseObject.appendChild(weight);
            exerciseObject.appendChild(document.createElement("br"));
            if (isDefined) exerciseObject.appendChild(isPublic);
            if (isDefined) exerciseObject.appendChild(document.createElement("br"));
            exerciseObject.appendChild(muscleGroupList);
            if (isDefinedByUser) exerciseObject.appendChild(actionDiv);
            exercisesDiv.appendChild(exerciseObject);
        }
    }
}

function renderSessionAndExercise(data) {
    if (!document.getElementById("sessionDiv") || !document.getElementById("startStopSession")) return;

    let settings = data.userProperties;
    if (document.getElementById("startSkipExercise")) {
        if (!document.getElementById("startSkipExercise").classList.contains("defaultButton")) document.getElementById("startSkipExercise").classList.add("defaultButton");
    }
    if (document.getElementById("startStopSession")) {
        if (!document.getElementById("startStopSession").classList.contains("defaultButton")) document.getElementById("startStopSession").classList.add("defaultButton");
    }
}
