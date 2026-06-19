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

async function deleteExercise(name) {
    return fetch("/api/deleteExercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while deleting into JSON:", response.statusText);
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

async function validateExerciseName(name) {
    return fetch("/api/validateExercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name })
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while saving new exercise into JSON:", response.statusText);
            return undefined;
        }
        return response.json();
    });
}

async function saveTasks(tasks) {
    return fetch("/api/saveTasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tasks),
    }).then((resp) => {
        if (!resp.ok) {
            console.log("Fatal error occured while saving tasks");
        }
    });
}

async function appendExercise(exercise) {
    return fetch("/api/newExercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(exercise)
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while saving new exercise into JSON:", response.statusText);
            return undefined;
        }
        return response.json();
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

async function saveTimes(times) {
    return fetch("/api/saveTimes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to alter or create the trainingsplan:", response.statusText);
        }
    });
}

//session management {

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

async function pauseSession() {
    return fetch("/api/session/pause", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to pause Session:", response.statusText);
        }
    });
}

async function resumeSession() {
    return fetch("/api/session/resume", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to resume Session:", response.statusText);
        }
    });
}

async function startSession() {
    return fetch("/api/session/start", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to start or resume Session:", response.statusText);
        }
        return response.json();
    });
}

async function startExercise() {
    return fetch("/api/exercise/start", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to resume Exercise", response.statusText);
        }
        return response.json();
    });
}

async function skipExercise() {
    return fetch("/api/exercise/skip", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured when trying to skip Exercise:", response.statusText);
        }
        return response.json();
    });
}

// }

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

async function getTasks() {
    return fetch("/api/getTasks", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(resp => {
        if (resp.ok) {
            return resp.json();
        } else {
            console.log("Fatal error occured while getting tasks");
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
            let data = response.json();
            localStorage.setItem("supportedExercises", JSON.stringify(data));
            return data;
        } else {
            console.error("An error ocured while requesting data from backend:", response.statusText);
        }
    });
}

async function getUserById(id) {
    return fetch("/api/getUser/byId", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: id }),
    }).then((response) => {
        if (response.ok) {
            return { userName: id }; //response.json();
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
            let data = response.json();
            localStorage.setItem("unsupportedExercises", JSON.stringify(data));
            return data;
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
            let data = response.json()
            localStorage.setItem("userdefinedExercises", JSON.stringify(data));
            return data;
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
        body: JSON.stringify({userId: props.userId, email: props.email, userName: props.userName})
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while updating settings", response.statusText);
        }
        response.json().then((json) => {
            if (!json.validEmail) alert("Email could not be sent!");
        });
    });
}

async function deleteValidationCodes(userId) {
    return fetch("/api/deleteValidationCodes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({userId: userId})
    }).then((response) => {
        if (!response.ok) {
            console.error("An error occured while deleting validation codes", response.statusText);
        }
    });
}

async function validateMail(code) {
    if (!code || code.length < 4) {
        alert("invalid Code!");
        return false;
    }
    let props = getUserPropertiesFromLocalStorage();
    return fetch("/api/validateMail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({userId: props.userId, validationCode: code})
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.error("An error ocured while requesting data from backend:", response.statusText);
        }
    });
}

async function saveExerciseToJSON(newExercise, oldExercise) {
    return fetch("/api/saveExercise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({oldExercise, newExercise}),
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            console.error("An error ocured while requesting data from backend:", response.statusText);
        }
    });
}