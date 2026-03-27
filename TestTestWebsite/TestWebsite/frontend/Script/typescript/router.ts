import { getIndexOfUserId, updateDisplay } from "./helper";
import { User } from "./model";
import { userData } from "./primary";

export function updateFromJsonData(selectedUserId: number) {
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

export async function getDataFromJson() {
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

export async function setUserSettings(selectedUserId: number, userSettings: any) { //send settings to backend and save them in json file
    let mode = document.getElementById("lightSwitch")!.innerText;
    let devMode = document.getElementById("dev")!.innerText === "devmode" ? true : false;

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
    });

    userSettings.mode = mode;
    userSettings.viewing = userSettings.viewing;
    userSettings.devMode = devMode;
    userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
}

export async function addUser(user: User) {
    const response = await fetch("/api/addUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });
}

export async function deleteUser(userId: number) {
    const response = await fetch("/api/deleteUser/" + userId, {
        method: "DELETE"
    });
}

export async function updateUser(user: User) {
    const response = await fetch("/api/updateUser/" + user.userId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
}