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
        startedExercise: false,
        startedSession: false,
    };
}