import { User } from "./model";
import { averageHeartFrequenceDisplay, averageMuscleUsageInPercentDisplay, averageOxygenDisplay, averageTimeTrainedDisplay, avgHeartRateDisplay, avgMuscleUsageDisplay, avgOxygenDisplay, currentExerciseDisplay, currentMuscleBeingTrainedDisplay, heartRateDisplay, maxDoneInOneForEachExerciseDisplay, maxHeartRateDisplay, maxTimeTrainedDisplay, monthlyStrengthIncreaseDisplay, mostDoneExerciseDisplay, mostTrainedMuscleDisplay, oxygenDisplay, trainedMusclesInCurrentOrLatestSessionDisplay, userData, userSettings, weeklyBurnedCaloriesDisplay, weeklyTrainingTimeDisplay } from "./primary";

export function getIndexOfUserId(userId: number) {
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userId === userId) {
            return i;
        }
    }
    return -1;
}

export function getUserIdOfUserMail(userMail: string) {
    if (userMail === "") {
        return -1;
    }

    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userMail === userMail) {
            return userData[i].userId;
        }
    }
    return -1;
}

export function getUserIdFromPasswordAndMail(password: string, mail: string) {
    if (password === "" || mail === "") {
        return -1;
    }
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].passwd === password && userData[i].userMail === mail) {
            return userData[i].userId;
        }
    }
    return -1;
}

export function getUserIdFromUsernameAndPassword(username: string, password: string) {
    console.log("getUserIdFromUsernameAndPassword aufgerufen mit:", username, password);
    console.log("userData:", userData);
    if (username === "") {
        console.log("Username oder Password leer!");
        return -1;
    }
    for (let i = 0; i < userData.length; i++) {
        console.log(`Vergleiche: ${userData[i].username} === ${username} && ${userData[i].passwd} === ${password}`);
        if (userData[i].passwd === password && userData[i].username === username) {
            console.log("Match gefunden! User ID:", userData[i].userId);
            return userData[i].userId;
        }
    }
    console.log("Kein Match gefunden!");
    return -1;
}

export function updateSettings(userId: number) {
    if (document.getElementById("viewingSession") && document.getElementById("viewingRealTime") && document.getElementById("viewingLongterm") && document.getElementById("dev")) {
        document.getElementById("viewingSession")!.setAttribute("checked", userSettings.viewing.includes("session").toString());
        document.getElementById("viewingLongterm")!.setAttribute("checked", userSettings.viewing.includes("longterm").toString());
        document.getElementById("viewingRealTime")!.setAttribute("checked", userSettings.viewing.includes("real-time").toString());
        document.getElementById("dev")!.innerText = userSettings.devMode ? "devmode" : "usermode";
    }
    renderViewing(userSettings.viewing);
}

export function renderViewing(viewing: string[]) {
    if (document.getElementById("dynamicDiv") && document.getElementById("realTimeDiv") && document.getElementById("staticDiv") && document.getElementById("dynamicHeadline")) {
        document.getElementById("dynamicDiv")!.hidden = !viewing.includes("session");
        document.getElementById("realTimeDiv")!.hidden = !viewing.includes("real-time");
        document.getElementById("staticDiv")!.hidden = !viewing.includes("longterm");
        if (viewing.includes("session") || viewing.includes("real-time")) {
            document.getElementById("dynamicHeadline")!.hidden = false;
        } else {
            document.getElementById("dynamicHeadline")!.hidden = true;
        }
    }
    updateDisplay(userSettings.userId);
}

export function updateDisplay(selectedUserId: number) {
    if (selectedUserId === undefined || userData.length === 0) {
        return;
    }
    let user = userData[getIndexOfUserId(selectedUserId)];
    if (averageHeartFrequenceDisplay && user) {
        avgHeartRateDisplay!.textContent = "" + user.userSessionData!.averageHeartFrequence;
        avgOxygenDisplay!.textContent = "" + user.userSessionData!.averageOxygen;
        avgMuscleUsageDisplay!.textContent = "" + user.userSessionData!.averageMuscleUsageInPercent;
        trainedMusclesInCurrentOrLatestSessionDisplay!.textContent = user.userSessionData!.trainedMusclesInCurrentOrLatestSession.join(", ");

        heartRateDisplay!.textContent = "" + user.userShortTerm!.heartFrequence;
        oxygenDisplay!.textContent = "" + user.userShortTerm!.oxygen;
        currentMuscleBeingTrainedDisplay!.textContent = user.userShortTerm!.currentMuscleBeingTrained;
        currentExerciseDisplay!.textContent = user.userShortTerm!.currentExercise;

        maxTimeTrainedDisplay!.textContent = "" + user.userHighscores!.maxTimeTrained;
        maxDoneInOneForEachExerciseDisplay!.textContent = user.userHighscores!.maxDoneInOneForEachExercise.join(", ");
        maxHeartRateDisplay!.textContent = "" + user.userHighscores!.maxHeartRate;
        
        averageTimeTrainedDisplay!.textContent = "" + user.userLongTermAverages!.averageTimeTrained;
        averageHeartFrequenceDisplay!.textContent = "" + user.userLongTermAverages!.averageLongtermHeartFrequence;
        averageOxygenDisplay!.textContent =  "" + user.userLongTermAverages!.averageLongtermOxygen;
        averageMuscleUsageInPercentDisplay!.textContent = "" + user.userLongTermAverages!.averageLongtermMuscleUsageInPercent;

        weeklyBurnedCaloriesDisplay!.textContent = "" + user.userLongTermAverages!.weeklyBurnedCalories;
        monthlyStrengthIncreaseDisplay!.textContent = "" + user.userLongTermAverages!.monthlyStrengthIncrease;
        weeklyTrainingTimeDisplay!.textContent = "" + user.userLongTermAverages!.weeklyTrainingTime;
        mostTrainedMuscleDisplay!.textContent = "" + user.userLongTermAverages!.mostTrainedMuscle;
        mostDoneExerciseDisplay!.textContent = "" + user.userLongTermAverages!.mostDoneExercise;
    }
}