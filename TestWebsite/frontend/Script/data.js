function updateFromJsonData() {
    fetch("/api/getData/" + selectedUserId) // assemble userData in typescript from json files
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.users.length; i++) {
                userData[getIndexOfUserId(data.users[i].userId)] = data.users[i];
            }
            updateDisplay(selectedUserId);
        })
        .catch(error => {
            console.error("Error fetching JSON:", error);
        });
}

async function getDataFromJson() {
    try {
        const response = await fetch("/api/getData/all");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.users;
    } catch (error) {
        console.error("Error in getDataFromJson:", error);
        return [];
    }
}

function setUserSettings(selectedUserId, userSettings) { //send settings to backend and save them in json file
    let mode = document.getElementById("lightSwitch").innerText;
    let devMode = document.getElementById("dev").innerText === "devmode" ? true : false;

    let settings = {
        username: userData[getIndexOfUserId(selectedUserId)].username,
        userMail: userData[getIndexOfUserId(selectedUserId)].userMail,
        passwd: userData[getIndexOfUserId(selectedUserId)].passwd,
        userId: selectedUserId,
        mode: mode,
        viewing: userSettings.viewing,
        devMode: devMode
    }

    fetch("/api/saveSettings/" + selectedUserId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    }).catch(error => {
        console.error("Fehler beim Senden der Settings:", error);
    });

    userSettings.mode = mode;
    userSettings.viewing = userSettings.viewing;
    userSettings.devMode = devMode;
    userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
}

function addUser(user) {
    fetch("/api/addUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });
}

function deleteUser(userId) {
    fetch("/api/deleteUser/" + userId, {
        method: "DELETE"
    });
}

function updateUser(user) {
    fetch("/api/updateUser/" + user.userId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
}