import { getIndexOfUserId } from "./helper";
import { DeviceProperties, User, UserSettings } from "./model";

export function savePropertiesToLocalStorage() {
    localStorage.setItem("currentProperties", JSON.stringify(currentProperties));
}

export function saveDataToLocalStorage(userData: User[]) {
    localStorage.setItem("userData", JSON.stringify(userData));
}

export function loadDataFromLocalStorage(): User[] {
    let savedData = localStorage.getItem("userData");
    if (savedData) {
        let userData = JSON.parse(savedData);
        return userData;
    }
    return [];
}

export function saveUserSettingsToLocalStorage(userId: number) {
    localStorage.setItem("userSettings" + userId, JSON.stringify(userSettings));
}

export function loadPropertiesFromLocalStorage(): DeviceProperties {
    let savedProperties = localStorage.getItem("currentProperties");
    if (savedProperties) {
        let currentProperties = JSON.parse(savedProperties);
        return currentProperties;
    }
    return {
        running: false,
        loggedIn: false,
        loggedInAsUser: "",
        loggedInWithUserId: -1
    };
}

export function loadUserSettingsFromLocalStorage(userId: number): UserSettings {
    let userData: User[] = loadDataFromLocalStorage();
    let currentProperties: DeviceProperties = loadPropertiesFromLocalStorage();
    let userSettings = userData[getIndexOfUserId(userId)]?.userSettings;
    if (currentProperties.loggedIn && userData.length > 0) {
        if (getIndexOfUserId(selectedUserId) !== -1) {
            return userSettings;
        }
    }
    return {
        userId: userId,
        mode: "darkmode",
        viewing: ["session", "longterm", "real-time"],
        devMode: false
    };
}