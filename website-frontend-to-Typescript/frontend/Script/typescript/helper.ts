import { login, logout, signup } from "./feature";
import { loadDataFromLocalStorage, loadPropertiesFromLocalStorage, loadUserSettingsFromLocalStorage, saveDataToLocalStorage, saveUserSettingsToLocalStorage } from "./localSave";
import { User } from "./model";
import * as vars from "./primary";

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
    let currentProperties = loadPropertiesFromLocalStorage();
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
    updateDisplay(currentProperties.loggedInWithUserId);
}

export function updateDisplay(selectedUserId: number) {
    let userData: User[] = loadDataFromLocalStorage();
    if (selectedUserId === undefined || userData.length === 0) {
        return;
    }
    let user = userData[getIndexOfUserId(selectedUserId)];
    if (vars.averageHeartFrequenceDisplay && user) {
        vars.avgHeartRateDisplay!.textContent = user.userSessionData!.averageHeartFrequence + "";
        vars.avgOxygenDisplay!.textContent = user.userSessionData!.averageOxygen + "";
        vars.avgMuscleUsageDisplay!.textContent = user.userSessionData!.averageMuscleUsageInPercent + "";
        vars.trainedMusclesInCurrentOrLatestSessionDisplay!.textContent = user.userSessionData!.trainedMusclesInCurrentOrLatestSession.join(", ");

        vars.heartRateDisplay!.textContent = user.userShortTerm!.heartFrequence + "";
        vars.oxygenDisplay!.textContent = user.userShortTerm!.oxygen + "";
        vars.currentMuscleBeingTrainedDisplay!.textContent = user.userShortTerm!.currentMuscleBeingTrained;
        vars.currentExerciseDisplay!.textContent = user.userShortTerm!.currentExercise;

        vars.maxTimeTrainedDisplay!.textContent = user.userHighscores!.maxTimeTrained;
        vars.maxDoneInOneForEachExerciseDisplay!.textContent = user.userHighscores!.maxDoneInOneForEachExercise.join(", ");
        vars.maxHeartRateDisplay!.textContent = user.userHighscores!.maxHeartRate + "";

        vars.averageTimeTrainedDisplay!.textContent = user.userLongTermAverages!.averageTimeTrained;
        vars.averageHeartFrequenceDisplay!.textContent = user.userLongTermAverages!.averageLongtermHeartFrequence + "";
        vars.averageOxygenDisplay!.textContent = user.userLongTermAverages!.averageLongtermOxygen + "";
        vars.averageMuscleUsageInPercentDisplay!.textContent = user.userLongTermAverages!.averageLongtermMuscleUsageInPercent + "";

        vars.weeklyBurnedCaloriesDisplay!.textContent = user.userLongTermAverages!.weeklyBurnedCalories + "";
        vars.monthlyStrengthIncreaseDisplay!.textContent = user.userLongTermAverages!.monthlyStrengthIncrease + "";
        vars.weeklyTrainingTimeDisplay!.textContent = user.userLongTermAverages!.weeklyTrainingTime;
        vars.mostTrainedMuscleDisplay!.textContent = user.userLongTermAverages!.mostTrainedMuscle;
        vars.mostDoneExerciseDisplay!.textContent = user.userLongTermAverages!.mostDoneExercise;
    }
}

//initialise zeigs
export function updateUI() {
    let currentProperties = loadPropertiesFromLocalStorage();
    let userSettings = loadUserSettingsFromLocalStorage(loadPropertiesFromLocalStorage().loggedInWithUserId);
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
        }
    });

    document.getElementById("dev")?.addEventListener("click", () => {
        let userData = loadDataFromLocalStorage();
        let currentProperties = loadPropertiesFromLocalStorage();
        let userSettings = loadUserSettingsFromLocalStorage(currentProperties.loggedInWithUserId);
        userSettings.devMode = !userSettings.devMode;
        if (userSettings.devMode && document.getElementById("dev")) {
            document.getElementById("dev")!.innerText = "devmode";
        } else if (document.getElementById("dev")) {
            document.getElementById("dev")!.innerText = "usermode";
        }
        if (currentProperties.loggedIn) {
            updateSettings(currentProperties.loggedInWithUserId);
            saveUserSettingsToLocalStorage(currentProperties.loggedInWithUserId);
        }
        if (currentProperties.loggedIn) {
            userData[getIndexOfUserId(currentProperties.loggedInWithUserId)].userSettings = userSettings;
        }
    });
    let currentProperties = loadPropertiesFromLocalStorage();
    if (currentProperties.loggedIn) {
        initialiseViewingModes();
        updateSettings(currentProperties.loggedInWithUserId);
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
    updateSettings(selectedUserId);
}

export async function http(method: 'GET' | 'POST' | 'PUT' | 'DELETE', route: string, data?: any): Promise<any> {
    let options: any = { method };
    if (data) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
    }
    const res = await fetch(route, options);
    if (!res.ok) {
        throw new Error(`${method} ${res.url} ${res.status} (${res.statusText})`);
    }
    if (res.status !== 204) {
        return await res.json();
    }
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