function init() {
    let logoutButton = document.getElementById("logoutButton");
    let loginButton = document.getElementById("loginButton");
    let signUpButton = document.getElementById("signupButton");

    let devModeButton = document.getElementById("dev");

    initializeLightSwitch();
    if (devModeButton) initializeDevMode();

    let deviceData = getDeviceData();
    showLoggedIn(deviceData);

    if (deviceData.loggedIn) {
        if (!deviceData.loadedUserData) loadDataFromSpecificUserById(deviceData.loggedInWithUserId).then(answer => {
            if (!answer.found) {
                alert("requested userdata might have been deleted or doesn't exist");
            }
        });
        showLoggedIn(deviceData);
        initializeLogoutAndDelete(); //wenn logout -> login und signup initialisieren // oder eventuell ned?

        getUserData().then((data) => {
            setModes(data.userSettings); //des im localstorage is nur placeholdermäßig bis zum Einloggen, des wos im json steht is des wos braucht wird
            loadAndInitializeChecked(data.userSettings);
            let longtermStatsSection = document.getElementById("staticDiv");
            let realTimeStatsSection = document.getElementById("realTimeDiv");
            let sessionStatsSection = document.getElementById("dynamicDiv");

            if (longtermStatsSection || realTimeStatsSection || sessionStatsSection) {
                setInterval(() => {
                    getUserData().then((userdata) => {
                        localStorage.setItem("userSettings", JSON.stringify(userdata.userSettings));
                        syncModes();
                        showRealTimeData(userdata);
                        showSessionData(userdata);
                        showLongtermData(userdata);
                    });
                }, 1000);
            }
        });
    } else {
        if (loginButton) initializeLogin(); //wenn login -> logout initialisieren // oder eventuell ned?
        if (signUpButton) initializeSignUp(); //nach signup -> login() // oder eventuell ned?
    }
}

init();