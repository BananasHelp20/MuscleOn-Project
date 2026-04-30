function init() {
    let deviceData = getDeviceData();
    initalizeDefault(deviceData); //initializes stuff needed wheather or not the user is logged in
    initializeExerciseUpdateLoop(); //loop2

    if (deviceData.loggedIn) { //if somebody is logged in
        getUserData().then((data) => { //get Userdata for inialization
            saveDataToLocalStorage(data); //save the data
            render(deviceData, data); //render everything for the first time on the website
            initializeLoggedIn(deviceData, data); //initialize everything needed if the user is logged in
            initializeDataUpdateLoop(); //start primary data update loop
        });
    } else {
        render(deviceData, null); //render in "no-data-mode"
        initializeLoggedOut(); //initialize everything needed if the user is logged out
    }
}

function requestData(deviceData) {
    if (!deviceData.loadedUserData) loadDataFromSpecificUserById(deviceData.loggedInWithUserId).then(answer => {
        if (!answer.found) {
            alert("requested userdata might have been deleted or doesn't exist");
        }
    });
}

function initalizeDefault(deviceData) {
    initializeLightSwitch();
    initializeExercises();
    initializeDevMode();

    //editing zurücksetzen
    deviceData.editingPlanSection = false;
    localStorage.setItem("deviceData", JSON.stringify(deviceData));

    startGame();
}

function saveDataToLocalStorage(data) {
    localStorage.setItem("userProperties", JSON.stringify(data.userProperties));
    localStorage.setItem("userSettings", JSON.stringify(data.userSettings));
    localStorage.setItem("userData", JSON.stringify(data));
}

function render(deviceData, data) {
    showLoggedIn(deviceData);
    showButtons(deviceData.loggedIn);
    if (deviceData.loggedIn) {
        showProfileSettings(data.userProperties);
        renderExercises(data.userSettings);
        renderSessionAndExercise(data);
        if (document.getElementById("lockedFromLogin")) document.getElementById("lockedFromLogin").hidden = false;
        if (data) {
            /* NED WICHTIG, NUR DEVMODE */
            if (document.getElementById("upcomingFeatures") && data.userSettings.devMode) {
                addAllTasks();
            } else if (document.getElementById("upcomingFeatures"))
                document.getElementById("upcomingFeatures").parentElement.hidden = true;
            /* */
            //syncModes();
            setModes(data.userSettings); //des im localstorage is nur placeholdermäßig bis zum Einloggen, des wos im json steht is des wos braucht wird

        }
    } else {
        console.log(document.getElementsByClassName("loggedOutNotice"));
        if (document.getElementsByClassName("loggedOutNotice")) {
            for (let i = 0; i < document.getElementsByClassName("loggedOutNotice").length; i++) {
                document.getElementsByClassName("loggedOutNotice").item(i).hidden = true;
            }
        }
    }
}

function initializeDataUpdateLoop() {
    let longtermStatsSection = document.getElementById("staticDiv");
    let realTimeStatsSection = document.getElementById("realTimeDiv");
    let sessionStatsSection = document.getElementById("dynamicDiv");

    if (longtermStatsSection || realTimeStatsSection || sessionStatsSection) {
        setInterval(() => {
            getUserData().then((userdata) => {
                localStorage.setItem("userProperties", JSON.stringify(userdata.userProperties));
                localStorage.setItem("userSettings", JSON.stringify(userdata.userSettings));
                localStorage.setItem("userData", JSON.stringify(userdata));
                showRealTimeData(userdata);
                showSessionData(userdata);
                showLongtermData(userdata);
                render(getDeviceData(), userdata);
            });
        }, interval);
    }
}

function initializeExerciseUpdateLoop() {
    setInterval(() => {
        getSupportedExercises().then(exercises => {
            localStorage.setItem("supportedExercises", JSON.stringify(exercises));
        });
        getUnsupportedExercises().then(exercises => {
            localStorage.setItem("unsupportedExercises", JSON.stringify(exercises));
        });
        getUserDefinedExercises().then(exercises => {
            localStorage.setItem("userdefinedExercises", JSON.stringify(exercises));
        });
    }, interval);
}

function initializeLoggedOut() {
    initializeLogin(); //wenn login -> logout initialisieren // oder eventuell ned?
    initializeSignUp(); //nach signup -> login() // oder eventuell ned?
}

function initializeLoggedIn(deviceData, data) {
    let settings = data.userSettings;
    if (document.getElementById("check") && settings.devMode) document.getElementById("check").addEventListener("click", () => {
        deleteValidationCodes(0);
    });
    let changePasswordButton = document.getElementById("changePasswordButton");
    let changePasswordLink = document.getElementById("changePasswordLink");
    let editProfileButton = document.getElementById("editProfileButton");
    let cancelEditProfileButton = document.getElementById("cancelEditProfileButton");
    if (cancelEditProfileButton) cancelEditProfileButton.addEventListener("click", () => {
        disableProfileEditing();
    });
    if (editProfileButton) editProfileButton.addEventListener("click", editListener);
    if (changePasswordLink) changePasswordLink.addEventListener("click", () => {
        window.location.href = "./passwordSite.html";
    });
    if (changePasswordButton) changePasswordButton.addEventListener("click", () => {
        if (validatePasswordChange(getUserPropertiesFromLocalStorage())) {
            changePassword();
        }
    });
    initializeSession();
    initializeLogoutAndDelete(); //wenn logout -> login und signup initialisieren // oder eventuell ned?
    loadAndInitializeChecked(data.userSettings);
}

/* INIT --> MAIN ENTRY POINT */
init();
/* ^THIS CALL RUNS EVERYTHING^ DO NOT DELETE*/