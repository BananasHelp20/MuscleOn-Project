function syncModes() {
    if (document.getElementById("dev")) document.getElementById("dev").innerText = getSettingsFromLocalStorage().devMode ? "devmode" : "usermode";
    if (document.getElementById("lightSwitch")) document.getElementById("lightSwitch").innerText = getSettingsFromLocalStorage().mode;
    document.getElementById("modeStylesheet").href = getSettingsFromLocalStorage().mode == "lightmode" ? "./css/light.css" : "./css/dark.css";

    if (getSettingsFromLocalStorage().devMode && document.getElementById("check")) {
        document.getElementById("check").hidden = false;
        document.getElementById("checkbr").hidden = false;
    } else if (document.getElementById("check")) {
        document.getElementById("check").hidden = true;
        document.getElementById("checkbr").hidden = true;
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

function showLoggedIn(deviceData) {
    let loggedInAsDisplay = document.getElementById("currentUser");
    if (deviceData.loggedIn && loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = "<span id='inlineUsernameDisplay'>" + deviceData.loggedInAsUser + "</span><button id='logoutButton' class='defaultButton'>Logout</button>";
    } else if (loggedInAsDisplay) {
        loggedInAsDisplay.innerHTML = "<button href='./login.html' class='defaultButton' id='inlineLoginButton'>Login</button><button href='./signup.html' id='inlineSignupButton' class='defaultButton'>Signup Now</button>";
    }
}

function setModes(data) {
    let lightSwitch = document.getElementById("lightSwitch");
    let devModeSwitch = document.getElementById("dev");
    if (data) {
        localStorage.setItem("lightSwitch", (data.mode == "lightmode") + "");
        localStorage.setItem("lightSwitch", data.devMode + "");
    } else {
        localStorage.setItem("lightSwitch", true);
        localStorage.setItem("devmode", true);
    }
    if (lightSwitch) document.getElementById("modeStylesheet").href = data ? (data.mode == "lightmode" ? "./css/light.css" : "./css/dark.css") : "./css/light.css";
    if (lightSwitch) lightSwitch.innerText = data ? data.mode : "lightmode";
    if (devModeSwitch) devModeSwitch.innerText = data ? (data.devMode ? "devmode" : "usermode") : "usermode";
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

function showProfileSettings(userdata) {
    let profileSettingsList = document.getElementById("profileSettingsList");
    if (!profileSettingsList) return;
    profileSettingsList.innerHTML = "";
    let email = document.createElement("li");
    email.innerText = "Email: " + userdata.email;
    let username = document.createElement("li");
    username.innerText = "Username: " + userdata.userName;
    let weight = document.createElement("li");
    weight.innerText = "Weight: " + userdata.weight + " kg";
    let size = document.createElement("li");
    size.innerText = "Size: " + userdata.size + " cm";
    let birthday = document.createElement("li");
    birthday.innerText = "Birthday: " + userdata.birthday;
    profileSettingsList.appendChild(username);
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

        exercisesToRender.forEach((exercise) => {
            let isDefined = exercise.exerciseType != "supported";
            let isDefinedByUser = exercise.userIdCreated == getDeviceData().loggedInWithUserId;
            let exerciseObject = document.createElement("div");
            exerciseObject.classList.add("exerciseObject");

            let title = document.createElement("span");
            title.classList.add("exerciseTitle");
            title.innerText = exercise.name;

            let description = document.createElement("p");
            description.innerText = exercise.description;

            let createdByUser = document.createElement("span");
            createdByUser.classList.add("exerciseCreatedBy");
            createdByUser.innerText = "Created By User: " + exercise.userIdCreated; //getUserOfId(userIdCreated);

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
        });
    }
}

function renderSessionAndExercise(data) {
    if (!document.getElementById("sessionDiv") || !document.getElementById("startStopSession")) return;

    let settings = data.userProperties;
    if (document.getElementById("startStopExercise")) document.getElementById("startStopExercise").innerText = settings.currentlyInExercise ? "Stop Exercise" : "Start Exercise";
    if (document.getElementById("startStopSession")) document.getElementById("startStopSession").innerText = settings.currentlyTraining ? "Stop Session" : "Start Session";
    document.getElementById("sessionDiv").hidden = !settings.currentlyTraining;
}
