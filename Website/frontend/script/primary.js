function init() {
    let deviceData = getDeviceData();
    initalizeDefault(deviceData);
    initializeExerciseUpdateLoop(); //loop2

    if (deviceData.loggedIn) {
        getUserData().then((data) => {
            saveDataToLocalStorage(data);
            render(deviceData, data);
            initializeLoggedIn(deviceData, data);
            initializeDataUpdateLoop(); //loop
        });
    } else {
        render(deviceData, null);
        initializeLoggedOut();
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
    //nur vorerst
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

    if (deviceData.loggedIn) {
        renderExercises(data.userSettings);
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
         //TESTBUTTON
    })
    
    initializeSession();
    initializeLogoutAndDelete(); //wenn logout -> login und signup initialisieren // oder eventuell ned?
    loadAndInitializeChecked(data.userSettings);
}

/* INIT */

init();

/* ^THIS CALL RUNS EVERYTHING^ DO NOT DELETE*/