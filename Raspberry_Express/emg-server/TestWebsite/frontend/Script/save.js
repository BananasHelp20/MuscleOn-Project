function savePropertiesToLocalStorage() {
    localStorage.setItem("currentProperties", JSON.stringify(currentProperties));
}

function saveDataToLocalStorage() {
    localStorage.setItem("userData", JSON.stringify(userData));
}

function loadDataFromLocalStorage() {
    let savedData = localStorage.getItem("userData");
    if (savedData) {
        userData = JSON.parse(savedData);
    }
    return userData;
}

function loadPropertiesFromLocalStorage() {
    let savedProperties = localStorage.getItem("currentProperties");
    if (savedProperties) {
        currentProperties = JSON.parse(savedProperties);
    }
}

function saveUserSettingsToLocalStorage(userId) {
    localStorage.setItem("userSettings" + userId, JSON.stringify(userSettings));
}

function loadUserSettingsFromLocalStorage(userId) {
    let savedUserSettings = localStorage.getItem("userSettings" + userId);
    if (savedUserSettings) {
        userSettings = JSON.parse(savedUserSettings);
        if (currentProperties.loggedIn && userData.length > 0) {
            const userIndex = getIndexOfUserId(selectedUserId);
            if (userIndex !== -1) {
                userData[userIndex].userSettings = userSettings;
            }
        }
    }
}