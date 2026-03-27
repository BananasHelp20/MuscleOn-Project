import { getIndexOfUserId } from "./helper";
import { deviceProperties, User, userProperties, UserSettings } from "./model";
import { currentProperties, userData, userSettings} from "./primary";

export function savePropertiesToLocalStorage() {
    localStorage.setItem("currentProperties", JSON.stringify(currentProperties));
}

export function saveDataToLocalStorage() {
    localStorage.setItem("userData", JSON.stringify(userData));
}

export function loadDataFromLocalStorage(): User[] {
    let savedData = localStorage.getItem("userData");
    if (savedData) {
        return JSON.parse(savedData);
    }
    return [];
}

export function loadPropertiesFromLocalStorage(): deviceProperties {
    let savedProperties = localStorage.getItem("currentProperties");
    if (savedProperties) {
        return JSON.parse(savedProperties);
    }
    return {
        running: false,
        loggedIn: false,
        loggedInAsUser: "",
        loggedInWithUserId: -1
    };
}

export function saveUserSettingsToLocalStorage(userId: number) {
    localStorage.setItem("userSettings" + userId, JSON.stringify(userSettings));
}

export function loadUserSettingsFromLocalStorage(userId: number): UserSettings {
    let savedUserSettings = localStorage.getItem("userSettings" + userId);
    let userDataset: UserSettings = userData[getIndexOfUserId(userId)].userSettings!;
    if (savedUserSettings) {
        userDataset = JSON.parse(savedUserSettings);
        if (currentProperties.loggedIn && userData.length > 0) {
            const userIndex = getIndexOfUserId(userId);
            if (userIndex !== -1) {
                userDataset = userSettings;
            }
        }
    }
    return userDataset;
}