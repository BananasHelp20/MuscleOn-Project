function updateFromJsonData() {
    fetch("/getData") // assemble userData in typescript from json files
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

function setUserSettings(selectedUserId) { //send settings to backend and save them in json file
    let mode = document.getElementById("lightSwitch").innerText;
    let devMode = document.getElementById("dev").innerText === "devmode" ? true : false;

    let settings = {
        userName: userData[getIndexOfUserId(selectedUserId)].userName,
        userMail: userData[getIndexOfUserId(selectedUserId)].userMail,
        userPassword: userData[getIndexOfUserId(selectedUserId)].userPassword,
        userId: selectedUserId,
        mode: mode,
        viewing: userSettings.viewing,
        devMode: devMode
    }

    fetch("/saveSettings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    });

    userSettings.mode = mode;
    userSettings.viewing = viewing;
    userSettings.devMode = devMode;
    userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
}