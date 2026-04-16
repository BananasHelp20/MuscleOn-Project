function init() {
    let logoutButton = document.getElementById("logoutButton");
    let loginButton = document.getElementById("loginButton");
    let signUpButton = document.getElementById("signupButton");

    let devModeButton = document.getElementById("dev");

    initializeLightSwitch();
    if (devModeButton) initializeDevMode();

    let deviceData = getDeviceData();

    showLoggedIn(deviceData);
    deviceData.editingPlanSection = false;
    localStorage.setItem("deviceData", JSON.stringify(deviceData));

    if (deviceData.loggedIn) {
        if (document.getElementById("check") && getSettingsFromLocalStorage().devMode) document.getElementById("check").addEventListener("click", () => { //TESTBUTTON
        })

        if (document.getElementById("lockedFromLogin")) document.getElementById("lockedFromLogin").hidden = false;
        if (!deviceData.loadedUserData) loadDataFromSpecificUserById(deviceData.loggedInWithUserId).then(answer => {
            if (!answer.found) {
                alert("requested userdata might have been deleted or doesn't exist");
            }
        });
        showLoggedIn(deviceData);
        initializeLogoutAndDelete(); //wenn logout -> login und signup initialisieren // oder eventuell ned?
        initializeSession();

        getUserData().then((data) => {
            setModes(data.userSettings); //des im localstorage is nur placeholdermäßig bis zum Einloggen, des wos im json steht is des wos braucht wird
            loadAndInitializeChecked(data.userSettings);
            let longtermStatsSection = document.getElementById("staticDiv");
            let realTimeStatsSection = document.getElementById("realTimeDiv");
            let sessionStatsSection = document.getElementById("dynamicDiv");

            if (longtermStatsSection || realTimeStatsSection || sessionStatsSection) {
                setInterval(() => {
                    getUserData().then((userdata) => {
                        localStorage.setItem("userProperties", JSON.stringify(userdata.userProperties));
                        localStorage.setItem("userSettings", JSON.stringify(userdata.userSettings));
                        localStorage.setItem("userData", JSON.stringify(userdata));
                        syncModes();
                        showRealTimeData(userdata);
                        showSessionData(userdata);
                        showLongtermData(userdata);
                    });
                    getSupportedExercises().then(exercises => {
                        localStorage.setItem("supportedExercises", JSON.stringify(exercises));
                    })
                    getUnsupportedExercises().then(exercises => {
                        localStorage.setItem("unsupportedExercises", JSON.stringify(exercises));
                    })
                    getUserDefinedExercises().then(exercises => {
                        localStorage.setItem("userdefinedExercises", JSON.stringify(exercises));
                    }) 
                }, interval);
            }
        });
    } else {
        if (loginButton) initializeLogin(); //wenn login -> logout initialisieren // oder eventuell ned?
        if (signUpButton) initializeSignUp(); //nach signup -> login() // oder eventuell ned?
    }
}
init();