import { login, signup } from "./feature";
import { loadDataFromLocalStorage, loadPropertiesFromLocalStorage, loadUserSettingsFromLocalStorage, saveDataToLocalStorage, saveUserSettingsToLocalStorage } from "./localSave";
import { User } from "./model";

export function getIndexOfUserId(userId: number): number {
    let userData: User[] = loadDataFromLocalStorage(); //ausn localStorage, weil i des so zwischenspeichere.
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userId === userId) {
            return i;
        }
    }
    return -1;
}

export function getUserIdOfUserMail(userMail: string): number {
    if (userMail === "") {
        console.log("UserMail leer!");
        return -1;
    }

    let userData: User[] = loadDataFromLocalStorage();
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userMail === userMail) {
            return userData[i].userId;
        }
    }
    return -1;
}

export function getUserIdFromPasswordAndMail(password: string, mail: string): number {
    if (password === "" || mail === "") {
        return -1;
    }
    let userData: User[] = loadDataFromLocalStorage();
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].passwd === password && userData[i].userMail === mail) {
            return userData[i].userId;
        }
    }
    return -1;
}

export function getUserIdFromUsernameAndPassword(username: string, password: string): number {
    console.log("getUserIdFromUsernameAndPassword aufgerufen mit:", username, password);
    if (username === "" || password === "") {
        console.log("Username oder Password leer!");
        return -1;
    }
    let userData: User[] = loadDataFromLocalStorage();
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].passwd === password && userData[i].username === username) {
            return userData[i].userId;
        }
    }
    console.log("Kein Match gefunden!");
    return -1;
}

//renderfuncs
export function updateSettings(selectedUserId: number) {
    let userSettings = loadUserSettingsFromLocalStorage(selectedUserId);
    if (document.getElementById("viewingSession") === null || document.getElementById("viewingLongterm") === null || document.getElementById("viewingRealTime") === null || document.getElementById("dev") === null) {
        return;
    }
    (<HTMLInputElement> document.getElementById("viewingSession")).checked = userSettings.viewing.includes("session");
    (<HTMLInputElement> document.getElementById("viewingLongterm")).checked = userSettings.viewing.includes("longterm");
    (<HTMLInputElement> document.getElementById("viewingRealTime")).checked = userSettings.viewing.includes("real-time");
    document.getElementById("dev")!.innerText = userSettings.devMode ? "devmode" : "usermode";
    renderViewing(userSettings.viewing);
}

export function renderViewing(viewing: string[]) {
    if (document.getElementById("dynamicDiv") === null || document.getElementById("realTimeDiv") === null || document.getElementById("staticDiv") === null || document.getElementById("dynamicHeadline") === null) {
        return;
    }
    document.getElementById("dynamicDiv")!.hidden = !viewing.includes("session");
    document.getElementById("realTimeDiv")!.hidden = !viewing.includes("real-time");
    document.getElementById("staticDiv")!.hidden = !viewing.includes("longterm");
    if (viewing.includes("session") || viewing.includes("real-time")) {
        document.getElementById("dynamicHeadline")!.hidden = false;
    } else {
        document.getElementById("dynamicHeadline")!.hidden = true;
    }
    updateDisplay(selectedUserId);
}

export function updateDisplay(selectedUserId: number) {
    let userData: User[] = loadDataFromLocalStorage();
    if (selectedUserId === undefined || userData.length === 0) {
        return;
    }
    let user = userData[getIndexOfUserId(selectedUserId)];
    if (averageHeartFrequenceDisplay && user) {
        avgHeartRateDisplay!.textContent = user.userSessionData!.averageHeartFrequence + "";
        avgOxygenDisplay!.textContent = user.userSessionData!.averageOxygen + "";
        avgMuscleUsageDisplay!.textContent = user.userSessionData!.averageMuscleUsageInPercent + "";
        trainedMusclesInCurrentOrLatestSessionDisplay!.textContent = user.userSessionData!.trainedMusclesInCurrentOrLatestSession.join(", ");

        heartRateDisplay!.textContent = user.userShortTerm!.heartFrequence + "";
        oxygenDisplay!.textContent = user.userShortTerm!.oxygen + "";
        currentMuscleBeingTrainedDisplay!.textContent = user.userShortTerm!.currentMuscleBeingTrained;
        currentExerciseDisplay!.textContent = user.userShortTerm!.currentExercise;

        maxTimeTrainedDisplay!.textContent = user.userHighscores!.maxTimeTrained;
        maxDoneInOneForEachExerciseDisplay!.textContent = user.userHighscores!.maxDoneInOneForEachExercise.join(", ");
        maxHeartRateDisplay!.textContent = user.userHighscores!.maxHeartRate + "";

        averageTimeTrainedDisplay!.textContent = user.userLongTermAverages!.averageTimeTrained;
        averageHeartFrequenceDisplay!.textContent = user.userLongTermAverages!.averageLongtermHeartFrequence + "";
        averageOxygenDisplay!.textContent = user.userLongTermAverages!.averageLongtermOxygen + "";
        averageMuscleUsageInPercentDisplay!.textContent = user.userLongTermAverages!.averageLongtermMuscleUsageInPercent + "";

        weeklyBurnedCaloriesDisplay!.textContent = user.userLongTermAverages!.weeklyBurnedCalories + "";
        monthlyStrengthIncreaseDisplay!.textContent = user.userLongTermAverages!.monthlyStrengthIncrease + "";
        weeklyTrainingTimeDisplay!.textContent = user.userLongTermAverages!.weeklyTrainingTime;
        mostTrainedMuscleDisplay!.textContent = user.userLongTermAverages!.mostTrainedMuscle;
        mostDoneExerciseDisplay!.textContent = user.userLongTermAverages!.mostDoneExercise;
    }
}

//initialise zeigs
export function updateUI() {
    if (document.getElementById("currentUser") && currentProperties.loggedIn) {
        document.getElementById("currentUser")!.innerHTML = `Momentan eingeloggt: ${currentProperties.loggedInAsUser} <button id="logoutButton">Logout</button>`;
    } else if (document.getElementById("currentUser")) {
        document.getElementById("currentUser")!.innerHTML = "Du bist nicht eingeloggt. <a href=\"./login.html\" id=\"loginLink\">Login</a> oder: <a href=\"./signup.html\" id=\"signupLink\">Signup</a>";
    }

    if (userSettings.mode === "lightmode") {
        document.getElementById("modeStylesheet")!.setAttribute("href", "./Css/light.css");
        document.getElementById("lightSwitch")!.innerText = "darkmode";
    } else {
        document.getElementById("modeStylesheet")!.setAttribute("href", "./Css/dark.css");
        document.getElementById("lightSwitch")!.innerText = "lightmode";
    }

    if (userSettings.devMode && document.getElementById("dev")) {
        document.getElementById("dev")!.innerText = "devmode";
    } else if (document.getElementById("dev")) {
        document.getElementById("dev")!.innerText = "usermode";
    }
}

export function initialiseModes() {
    document.getElementById("lightSwitch")?.addEventListener("click", () => {
        let userData = loadDataFromLocalStorage();
        let currentProperties = loadPropertiesFromLocalStorage();
        let userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
        let selectedUserId = currentProperties.loggedInWithUserId;
        userSettings.mode = userSettings.mode == "lightmode" ? "darkmode" : "lightmode";
        if (currentProperties.loggedIn) {
            updateSettings(selectedUserId);
            saveUserSettingsToLocalStorage(selectedUserId);
        }

        if (userSettings.mode === "lightmode") {
            document.getElementById("modeStylesheet")!.setAttribute("href", "./Css/light.css");
            document.getElementById("lightSwitch")!.innerText = "darkmode";
        } else {
            document.getElementById("modeStylesheet")!.setAttribute("href", "./Css/dark.css");
            document.getElementById("lightSwitch")!.innerText = "lightmode";
        }

        if (currentProperties.loggedIn) {
            userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
            saveDataToLocalStorage(userData);
            saveDataToESP(userData);
        }
    });

    document.getElementById("dev")?.addEventListener("click", () => {
        let userData = loadDataFromLocalStorage();
        let currentProperties = loadPropertiesFromLocalStorage();
        let userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
        let selectedUserId = currentProperties.loggedInWithUserId;
        devMode = !devMode;
        if (devMode && document.getElementById("dev")) {
            document.getElementById("dev")!.innerText = "devmode";
        } else if (document.getElementById("dev")) {
            document.getElementById("dev")!.innerText = "usermode";
        }
        userSettings.devMode = devMode;
        if (currentProperties.loggedIn) {
            updateSettings(selectedUserId);
            saveUserSettingsToLocalStorage(selectedUserId);
        }
        if (currentProperties.loggedIn) {
            userData[getIndexOfUserId(selectedUserId)].userSettings = userSettings;
            saveDataToESP(userData);
        }
    });
    if (currentProperties.loggedIn) {
        initialiseViewingModes();
        updateSettings(selectedUserId);
    }
}

function toggleViewingMode(modeKey: string) {
    let currentProperties = loadPropertiesFromLocalStorage();
    let userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
    let selectedUserId = currentProperties.loggedInWithUserId;
    let userData = loadDataFromLocalStorage();
    if (!currentProperties.loggedIn) return;

    const idx = userSettings.viewing.indexOf(modeKey);
    if (idx === -1) {
        userSettings.viewing.push(modeKey);
    } else {
        userSettings.viewing.splice(idx, 1);
    }
    saveUserSettingsToLocalStorage(currentProperties.loggedInWithUserId);
    userData[selectedUserId].userSettings = userSettings;
    saveDataToESP(userData);
    updateSettings(selectedUserId);
}

function initialiseViewingModes() {
    if (document.getElementById("viewingSession") && document.getElementById("viewingRealTime") && document.getElementById("viewingLongterm")) {
        document.getElementById("viewingSession")!.addEventListener("click", () => {
            toggleViewingMode("session");
        });
        document.getElementById("viewingLongterm")!.addEventListener("click", () => {
            toggleViewingMode("longterm");
        });
        document.getElementById("viewingRealTime")!.addEventListener("click", () => {
            toggleViewingMode("real-time");
        });
    }
}

export function initializeLoginAndSignup() {
    if (document.getElementById("logoutButton")) {
        document.getElementById("logoutButton")?.addEventListener("click", () => {
            logout();
        });
    }
    if (document.getElementById("loginButton")) {
        loadDataFromLocalStorage();
        document.getElementById("loginButton")?.addEventListener("click", async () => {
            try {
                const username = (<HTMLInputElement>document.getElementById("username")!).value;
                const password = (<HTMLInputElement>document.getElementById("password")!).value;

                if (!username) {
                    alert("Benutzername erforderlich!");
                    return;
                }

                const data = loadDataFromLocalStorage();

                if (!data || data.length === 0) {
                    alert("Keine Benutzer im localStorage gefunden!");
                    return;
                }

                let foundUserId = -1;
                for (let user of data) {
                    if (user.username === username && user.passwd === password) {
                        foundUserId = user.userId;
                        break;
                    }
                }

                if (foundUserId !== -1) {
                    login(foundUserId);
                    window.location.href = "./index.html";
                } else {
                    alert("Keine Daten vom Server erhalten!");
                }
            } catch (error: any) {
                console.error("Error beim Login:", error);
                alert("Fehler beim Laden der Benutzerdaten: " + error.message);
            }
        });
    }
    if (document.getElementById("signupButton")) {
        document.getElementById("signupButton")!.addEventListener("click", () => {
            let username: string = (<HTMLInputElement>document.getElementById("username")!).value + "";
            let password: string = (<HTMLInputElement>document.getElementById("password")!).value + "";
            let email: string = (<HTMLInputElement>document.getElementById("email")!).value + "";
            let weight: number = Number((<HTMLInputElement>document.getElementById("weight")!).value);
            let height: number = Number((<HTMLInputElement>document.getElementById("height")!).value);
            let birthday: string = (<HTMLInputElement>document.getElementById("birthday")!).value + "";
            if (username != "" && email.includes("@") && email.includes(".") && weight > 0 && !isNaN(weight) && height > 0 && !isNaN(height) && birthday != "") {
                signup(username, password, email, weight, height, birthday);
                window.location.href = "./index.html";
            } else {
                alert("Invalid Data!");
            }
        });
    }
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}