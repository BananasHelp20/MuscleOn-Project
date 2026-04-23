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
        viewing: {
            sessionStats: false,
            realTimeStats: false,
            longtermStats: false
        },
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

async function sendValidationMail() {
    let props = getUserPropertiesFromLocalStorage();
    return fetch("/api/sendValidationMail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({userId: props.userId, email: props.email})
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while updating settings", response.statusText);
        }
        response.json().then((json) => {
            if (!json.validEmail) alert("Email could not be sent!");
        });
    });
}

async function validateMail(code) {
    if (!code || code.length < 4) {
        alert("invalid Code!");
        return false;
    }
    let props = getUserPropertiesFromLocalStorage();
    return fetch("/api/getUserData", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        body: {userId: props.userId, validationCode: code}
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.error("An error ocured while requesting data from backend:", response.statusText);
        }
    });
}