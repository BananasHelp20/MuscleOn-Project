function addExercises(sessionId) {
    document.getElementById("exercise-tables").hidden = false;
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
            toTime: row.children.item(2).children.item(0).value,
        },
    };

    let newTable = getEmptyExerciseTable(times);
    document.getElementById("exercise-tables").appendChild(newTable);
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
    let weekdayData = data ? data.times : null;
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
    });

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
            exTableHead.children.item(0).children.item(0).children.item(1).innerText = " from " + event.target.value;
        }
    });

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
            exTableHead.children.item(0).children.item(0).children.item(2).innerText = " to " + event.target.value;
        }
    });

    let primaryMuscleGroup = document.createElement("select");
    primaryMuscleGroup.setAttribute("name", "selectMuscleGroup");
    primaryMuscleGroup.setAttribute("id", "selectMuscleGroup");
    setMuscleGroupOptions(primaryMuscleGroup);
    if (data) primaryMuscleGroup.value = data.primaryMuscleGroup;

    let delButton = document.createElement("button");
    delButton.setAttribute("class", "tableButton");
    delButton.setAttribute("id", "delete-day");
    delButton.innerText = "remove day";
    delButton.addEventListener("click", (event) => {
        if (document.getElementById("plan-table").children.length > 1) event.target.parentElement.parentElement.remove();
        if (document.getElementById("plan-table").children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
        if (findExerciseTableById(Number(event.target.parentElement.parentElement.getAttribute("id"))) != -1) removeExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
    });

    let removeExercisesForDayButton = document.createElement("button");
    removeExercisesForDayButton.setAttribute("class", "tableButton");
    removeExercisesForDayButton.setAttribute("id", "exercise-controlButton");
    if (data && data.exercises.length != 0) {
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
    tds[4].setAttribute("class", "tableButtonContainer");
    tds[4].appendChild(delButton);
    tds[5].setAttribute("class", "tableButtonContainer");
    tds[5].appendChild(removeExercisesForDayButton);

    let tr = document.createElement("tr");
    tr.setAttribute("id", "" + sessionId);
    tds.forEach((td) => {
        tr.appendChild(td);
    });
    document.getElementById("plan-table").appendChild(tr);
}

function login() {
    //test this
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if (!email) {
        alert("Please fill out E-Mail field!");
        return;
    }
    loadDataFromSpecificUser(email, password).then((answer) => {
        //do will i, dass, wenn nix gefunden worden is, a Json objekt mit argumente "found", "userId" und "userName" returned wird.
        if (answer.found) {
            //user existiert (mit passwort)
            let newDeviceData = {
                running: false,
                loggedIn: true,
                loggedInAsUser: answer.userName,
                loggedInWithUserId: answer.userId,
                loadedUserData: true,
                sessionRunning: false,
            };
            localStorage.setItem("deviceData", JSON.stringify(newDeviceData));
            localStorage.setItem("userSettings", JSON.stringify(answer.userSettings));
            localStorage.setItem("userProperties", JSON.stringify(answer.userProperties));
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
    };
    let props = getUserPropertiesFromLocalStorage();
    props.currentlyTraining = false;
    props.currentlyInExercise = false;
    setUserProperties(props).then(() => {
        localStorage.setItem("deviceData", JSON.stringify(defaultDeviceData));
        clearUserData();
        showLoggedIn(defaultDeviceData);
        location.href = "./index.html";
    });
}

function signUp() {
    let userName = document.getElementById("userName").value;
    let password = document.getElementById("password").value;
    let email = document.getElementById("email").value;
    let weight = document.getElementById("weight").value;
    let size = document.getElementById("size").value;
    let birthday = document.getElementById("birthday").value;
    if (!(userName && email && email.includes("@") && email.includes(".") && weight && size && birthday)) {
        alert("fill in the fields rightously");
        return;
    }
    let data;
    let createdPlan = false;
    if (document.getElementById("plan").checked) {
        data = {
            userId: -1, //temporär ungültige id, weil i jo ned was wos für a id in da Datenbank nu frei is
            userName: userName,
            password: password,
            email: email,
            weight: weight,
            size: size,
            birthday: birthday,
            currentlyTraining: false,
            usualSessionTimes: getSessionTimes(),
        };
        createdPlan = true;
        if (!validateSessionTimes(data.usualSessionTimes)) {
            alert("Days must be real weekdays, times must be real times: xx:xx");
            return;
        }
    } else {
        data = {
            userId: -1, //temporär ungültige id, weil i jo ned was wos für a id in da Datenbank nu frei is
            userName: userName,
            password: password,
            email: email,
            weight: weight,
            size: size,
            birthday: birthday,
            currentlyTraining: false,
        };
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
                longtermStats: true,
            },
            createdPlan: createdPlan,
            devMode: false,
        },
    };
    sendValidationMail(email).then(async () => {
        let validCode = false;
        while (!validCode) {
            let validationCode = prompt("A validation mail has been sent to your email address. Please enter the validation code here:");

            if (!validationCode) {
                return; // User cancelled
            }

            let isValid = await validateMail(validationCode);
            if (isValid.valid) {
                validCode = true;
                createNewUser(completeUserData).then(() => {
                    login();
                });
            } else {
                alert("Code is not valid!");
            }
        }
    });
}

function addExercise() {
    let muscleGroups = getMuscleGroups();
    let muscleGroupSelection = document.getElementById("muscleGroupSelection");
    let musclegroupSelectionTitle = document.createElement("dt");
    musclegroupSelectionTitle.innerText = "Muscle Groups targeted: ";
    muscleGroupSelection.appendChild(musclegroupSelectionTitle);
    for (let i = 0; i < muscleGroups.length; i++) {
        let listelem = document.createElement("dd");
        let uses = document.createElement("input");
        uses.setAttribute("type", "checkbox");
        let text = document.createElement("span");
        text.innerText = "- " + muscleGroups[i];
        listelem.appendChild(text);
        listelem.appendChild(uses);
        muscleGroupSelection.appendChild(listelem);
    }
}

function saveExercise(exerciseSaveButton, mode) {
    let exerciseObject = mode == "save" ? exerciseSaveButton.parentElement?.parentElement : document.getElementById("exerciseForm");
    if (!exerciseObject) {
        log("Error: exerciseObject not found for saveExercise");
        return;
    }

    let oldExerciseJSON = JSON.parse(localStorage.getItem("exerciseBackupObject_" + exerciseSaveButton.parentElement.parentElement.getAttribute("id")));
    
    let exerciseObjectChildren = exerciseObject.children;

    let definedName = exerciseObjectChildren.item(mode == "save" ? 0 : 1).value;
    let definedDescription = exerciseObjectChildren.item(mode == "save" ? 2 : 4).value;
    let definedEqipment = exerciseObjectChildren.item(mode == "save" ? 6 : 9).value;
    let definedWeight = exerciseObjectChildren.item(mode == "save" ? 8 : 11).children.item(1).checked;
    let definedVisibility = exerciseObjectChildren.item(mode == "save" ? 10 : 12).children.item(1).checked;
    let definedGroups = exerciseObjectChildren.item(mode == "save" ? 12 : 7).children;
    let definedGroupStrings = [];

    for (let i = 0; i < definedGroups.length; i++) {
        if (definedGroups.item(i).nodeName != "DT" && definedGroups.item(i).children.item(1).checked) {
            definedGroupStrings.push(definedGroups.item(i).innerText.substring(2));
        }
    }

    let title = document.createElement("span");
    title.classList.add("exerciseTitle");
    title.innerText = definedName;

    let description = document.createElement("p");
    description.innerText = definedDescription;

    let createdByUser = exerciseObjectChildren.item(4);

    let equipment = document.createElement("span");
    equipment.classList.add("exerciseEquipment");
    equipment.innerText = "Equipment: " + ((definedEqipment && definedEqipment != "None") ? definedEqipment : "None");

    let weight = document.createElement("span");
    weight.classList.add("exerciseWeight");
    weight.innerText = "Needs Weight: " + (definedWeight ? "Yes" : "No");

    let isPublic = document.createElement("span");
    isPublic.classList.add("exercisePublic");
    isPublic.innerText = "Visible for other Users: " + (definedVisibility ? "Yes" : "No");

    let muscleGroupList = document.createElement("dl");
    muscleGroupList.classList.add("muscleGroupList");

    let muscleGroupTitle = document.createElement("dt");
    muscleGroupTitle.classList.add("muscleGroupListObject");
    muscleGroupTitle.innerText = "MuscleGroups: ";
    muscleGroupList.appendChild(muscleGroupTitle);
    definedGroupStrings.forEach((muscleGroup) => {
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
    actionDiv.classList.add("lockedButton");
    actionDiv.appendChild(editButton);
    actionDiv.appendChild(delButton);


    exerciseObject.innerHTML = "";

    exerciseObject.appendChild(title);
    exerciseObject.appendChild(document.createElement("br"));
    exerciseObject.appendChild(description);
    exerciseObject.appendChild(document.createElement("br"));
    exerciseObject.appendChild(createdByUser);
    exerciseObject.appendChild(document.createElement("br"));
    exerciseObject.appendChild(equipment);
    exerciseObject.appendChild(document.createElement("br"));
    exerciseObject.appendChild(weight);
    exerciseObject.appendChild(document.createElement("br"));
    exerciseObject.appendChild(isPublic);
    exerciseObject.appendChild(document.createElement("br"));
    exerciseObject.appendChild(muscleGroupList);
    exerciseObject.appendChild(actionDiv);

    let exercise = {
        userIdCreated: getUserPropertiesFromLocalStorage().userId,
        name: definedName,
        equipment: definedEqipment,
        description: definedDescription,
        targetedMuscleGroups: definedGroupStrings,
        public: definedVisibility,
        weight: definedWeight
    };

    // NEW: Check ob neues oder bestehendes Exercise
    if (oldExerciseJSON == null) {
        // Neues Exercise erstellen
        appendExercise(exercise);
    } else {
        // Bestehendes Exercise speichern
        saveExerciseToJSON(exercise, oldExerciseJSON);
    }
}

let saveListener = () => {
    saveProfileSettings();
};
let editListener = () => {
    enableProfileEditing();
};

function validatePasswordChange(userProperties) {
    let currentPassword = document.getElementById("currentPassword").value;
    let newPassword = document.getElementById("newPassword").value;
    let confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match!");
        return false;
    }
    if (currentPassword !== userProperties.password) {
        alert("Current password is incorrect!");
        return false;
    }
    if (currentPassword == newPassword) {
        alert("New password cannot be the same as the current password!");
        return false;
    }
    return true;
}

function changePassword() {
    let userProperties = getUserPropertiesFromLocalStorage();
    userProperties.password = document.getElementById("newPassword").value;
    setUserProperties(userProperties).then(() => {
        logout();
    });
}

function disableProfileEditing() {
    document.getElementById("cancelEditProfileButton").hidden = true;
    document.getElementById("editProfileButton").innerHTML = "Edit Profile";
    document.getElementById("editProfileButton").removeEventListener("click", saveListener);
    document.getElementById("editProfileButton").addEventListener("click", editListener);
    showProfileSettings(getUserPropertiesFromLocalStorage());
}

function enableProfileEditing() {
    document.getElementById("cancelEditProfileButton").hidden = false;
    document.getElementById("editProfileButton").innerHTML = "Save Profile";
    document.getElementById("editProfileButton").removeEventListener("click", editListener);
    document.getElementById("editProfileButton").addEventListener("click", saveListener);
    let profileSettingsList = document.getElementById("profileSettingsList");
    let email = document.createElement("input");
    email.value = profileSettingsList.children.item(1).innerText.split(": ")[1];
    email.type = "email";
    email.id = "emailInput";
    email.classList.add("styledInput");
    let userName = document.createElement("input");
    userName.value = profileSettingsList.children.item(0).innerText.split(": ")[1];
    userName.type = "text";
    userName.id = "userNameInput";
    userName.classList.add("styledInput");
    let weight = document.createElement("input");
    weight.value = profileSettingsList.children.item(2).innerText.split(": ")[1].split(" ")[0];
    weight.type = "number";
    weight.id = "weightInput";
    weight.classList.add("styledInput");
    let size = document.createElement("input");
    size.value = profileSettingsList.children.item(3).innerText.split(": ")[1].split(" ")[0];
    size.type = "number";
    size.id = "sizeInput";
    size.classList.add("styledInput");
    let birthday = document.createElement("input");
    birthday.value = profileSettingsList.children.item(4).innerText.split(": ")[1];
    birthday.type = "date";
    birthday.id = "birthdayInput";
    birthday.classList.add("styledInput");
    profileSettingsList.children.item(0).innerHTML = "<span>Username: </span>";
    profileSettingsList.children.item(0).appendChild(userName);
    profileSettingsList.children.item(1).innerHTML = "<span>Email: </span>";
    profileSettingsList.children.item(1).appendChild(email);
    profileSettingsList.children.item(2).innerHTML = "<span>Weight: </span>";
    profileSettingsList.children.item(2).appendChild(weight);
    profileSettingsList.children.item(3).innerHTML = "<span>Size: </span>";
    profileSettingsList.children.item(3).appendChild(size);
    profileSettingsList.children.item(4).innerHTML = "<span>Birthday: </span>";
    profileSettingsList.children.item(4).appendChild(birthday);
}

function saveProfileSettings() {
    let profileSettingsList = document.getElementById("profileSettingsList");
    let newUserData = getUserPropertiesFromLocalStorage();
    newUserData.userName = document.getElementById("userNameInput").value;
    newUserData.email = document.getElementById("emailInput").value;
    newUserData.weight = parseInt(document.getElementById("weightInput").value);
    newUserData.size = parseInt(document.getElementById("sizeInput").value);
    newUserData.birthday = document.getElementById("birthdayInput").value;
    document.getElementById("cancelEditProfileButton").hidden = true;
    document.getElementById("editProfileButton").innerHTML = "Edit Profile";
    setUserProperties(newUserData);
    showProfileSettings(newUserData);
    document.getElementById("editProfileButton").removeEventListener("click", saveListener);
    document.getElementById("editProfileButton").addEventListener("click", editListener);
}

function enableDeleteExercise(exerciseDeleteButton) {
    let exerciseObjectChildren = exerciseDeleteButton.parentElement.parentElement.children;
    let definedName = exerciseObjectChildren.item(0).innerText;
    
    deleteExercise(definedName);
    exerciseDeleteButton.parentElement.parentElement.remove();
}

function enableEditExercise(exerciseEditButton) {
    let exerciseObjectChildren = exerciseEditButton.parentElement.parentElement.children;

    let definedName = exerciseObjectChildren.item(0).innerText;
    let definedDescription = exerciseObjectChildren.item(2).innerText;
    let definedEqipment = exerciseObjectChildren.item(6).innerText.split(": ")[1];
    if (!definedEqipment) definedEqipment = "None";
    let definedWeight = exerciseObjectChildren.item(8).innerText.split(": ")[1] == "Yes" ? true : false;
    let definedVisibility = exerciseObjectChildren.item(10).innerText.includes("Yes") ? true : false;
    let definedGroups = exerciseObjectChildren.item(12).children;
    let definedGroupStrings = [];

    for (let i = 0; i < definedGroups.length; i++) {
        if (definedGroups.item(i).nodeName != "DT") {
            definedGroupStrings.push(definedGroups.item(i).innerText.substring(2));
        }
    }

    let title = document.createElement("input");
    title.classList.add("exerciseTitle");
    title.classList.add("styledInput");
    title.value = definedName;
    title.placeholder = "Bicep Curls";
    title.setAttribute("type", "text");

    let description = document.createElement("textarea");
    description.classList.add("styledArea");
    description.value = definedDescription;
    description.placeholder = "You Curl A Bicep, or idk something like that";

    let createdBy = exerciseObjectChildren.item(4);

    let equipment = document.createElement("input");
    equipment.classList.add("styledInput");
    equipment.setAttribute("type", "text");
    equipment.classList.add("exerciseEquipment");
    equipment.value = definedEqipment;
    equipment.placeholder = "Kettlebell";

    let weight = document.createElement("input");
    weight.setAttribute("type", "checkbox");
    weight.checked = definedWeight;

    let weightSpan = document.createElement("span");
    weightSpan.innerText = "Uses Weight: ";

    let weightDiv = document.createElement("div");
    weightDiv.appendChild(weightSpan);
    weightDiv.appendChild(weight);

    let visibility = document.createElement("input");
    visibility.setAttribute("type", "checkbox");
    visibility.checked = definedVisibility;

    let visibSpan = document.createElement("span");
    visibSpan.innerText = "Visible for other users: ";
    let visibilityDiv = document.createElement("div");
    visibilityDiv.appendChild(visibSpan);
    visibilityDiv.appendChild(visibility);

    let object = exerciseEditButton.parentElement.parentElement;

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "cancel";
    cancelButton.classList.add("defaultButton");
    cancelButton.addEventListener("click", (event) => {
        let definedName = exerciseObjectChildren.item(0).value;
        object.innerHTML = "";
        object.innerHTML = localStorage.getItem("exerciseBackup_" + definedName);
        
        // Re-attach event listeners to the restored buttons
        let restoredActionDiv = object.lastChild;
        let editButton = restoredActionDiv.children.item(0);
        let deleteButton = restoredActionDiv.children.item(1);
        
        editButton.addEventListener("click", (event) => {
            enableEditExercise(event.target);
        });
        
        deleteButton.addEventListener("click", (event) => {
            enableDeleteExercise(event.target);
        });
    });

    let saveButton = document.createElement("button");
    saveButton.innerText = "save changes";
    saveButton.classList.add("defaultButton");
    saveButton.addEventListener("click", (event) => {
        saveExercise(event.target, "save");
    });

    let actionDiv = document.createElement("div");
    actionDiv.appendChild(saveButton);
    actionDiv.appendChild(cancelButton);

    let muscleGroups = getMuscleGroups();
    let muscleGroupSelection = document.createElement("dl");
    let musclegroupSelectionTitle = document.createElement("dt");
    musclegroupSelectionTitle.innerText = "Muscle Groups targeted: ";
    muscleGroupSelection.appendChild(musclegroupSelectionTitle);

    for (let i = 0; i < muscleGroups.length; i++) {
        let listelem = document.createElement("dd");
        let uses = document.createElement("input");
        uses.setAttribute("type", "checkbox");
        uses.checked = definedGroupStrings.includes(muscleGroups[i]);
        let text = document.createElement("span");
        text.innerText = "- " + muscleGroups[i];
        listelem.appendChild(text);
        listelem.appendChild(uses);
        muscleGroupSelection.appendChild(listelem);
    }
    
    localStorage.setItem("exerciseBackup_" + definedName, object.innerHTML);
    
    let exerciseBackupObject = {
        userIdCreated: getUserPropertiesFromLocalStorage().userId,
        exerciseType: "defined",
        name: definedName,
        equipment: definedEqipment,
        description: definedDescription,
        targetedMuscleGroups: definedGroupStrings,
        public: definedVisibility ? definedVisibility : false,
        weight: definedWeight ? definedWeight : false,
    };
    
    localStorage.setItem("exerciseBackupObject_" + exerciseEditButton.parentElement.parentElement.getAttribute("id"), JSON.stringify(exerciseBackupObject));

    object.innerHTML = "";
    object.appendChild(title);
    object.appendChild(document.createElement("br"));
    object.appendChild(description);
    object.appendChild(document.createElement("br"));
    object.appendChild(createdBy);
    object.appendChild(document.createElement("br"));
    object.appendChild(equipment);
    object.appendChild(document.createElement("br"));
    object.appendChild(weightDiv);
    object.appendChild(document.createElement("br"));
    object.appendChild(visibilityDiv);
    object.appendChild(document.createElement("br"));
    object.appendChild(muscleGroupSelection);
    object.appendChild(document.createElement("br"));
    object.appendChild(actionDiv);
}