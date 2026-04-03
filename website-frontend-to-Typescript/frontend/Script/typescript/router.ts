import { getIndexOfUserId, http, updateDisplay } from "./helper";
import { loadDataFromLocalStorage, loadPropertiesFromLocalStorage, saveDataToLocalStorage, saveUserSettingsToLocalStorage } from "./localSave";
import { User, UserSettings } from "./model";

export async function updateFromESP() {
    let userData = loadDataFromLocalStorage();
    let currentProperties = loadPropertiesFromLocalStorage();
    userData[getIndexOfUserId(currentProperties.loggedInWithUserId)] = await http("GET", "/api/getUser/" + currentProperties.loggedInWithUserId);
    saveDataToLocalStorage(userData);
}

export async function getDataFromESP() {
    saveDataToLocalStorage(await http("GET", "/api/getData"));
}

export async function saveUserSettings(selectedUserId: number, userSettings: UserSettings) { //send settings to backend and save them in json file
    let userData = loadDataFromLocalStorage();

    let settings = {
        username: userData[getIndexOfUserId(selectedUserId)].username,
        userMail: userData[getIndexOfUserId(selectedUserId)].userMail,
        passwd: userData[getIndexOfUserId(selectedUserId)].passwd,
        weight: userData[getIndexOfUserId(selectedUserId)].weight,
        size: userData[getIndexOfUserId(selectedUserId)].size,
        birthday: userData[getIndexOfUserId(selectedUserId)].birthday,
        sessiontimes: userData[getIndexOfUserId(selectedUserId)].sessionTimes,
        userId: selectedUserId,
        mode: userSettings.mode,
        viewing: userSettings.viewing,
        devMode: userSettings.devMode
    };
    await http("POST", "/api/saveSettings/" + selectedUserId, JSON.stringify(settings));
}

export async function addUser(user: User) {
    await http("POST", "/api/addUser", JSON.stringify(user));
}

export async function deleteUser(userId: number) {
    await http("DELETE", "/api/deleteUser/" + userId).then(async () => {
        await getDataFromESP();
    });
}