function updateSettings() {
    if (document.getElementById("viewingSession") && document.getElementById("viewingRealTime") && document.getElementById("viewingLongterm") && document.getElementById("dev")) {
        document.getElementById("viewingSession").checked = userSettings.viewing.includes("session");
        document.getElementById("viewingLongterm").checked = userSettings.viewing.includes("longterm");
        document.getElementById("viewingRealTime").checked = userSettings.viewing.includes("real-time");
        document.getElementById("dev").innerText = userSettings.devMode ? "devmode" : "usermode";
    }
    renderViewing(userSettings.viewing);
}

function renderViewing(viewing) {
    if (document.getElementById("dynamicDiv") && document.getElementById("realTimeDiv") && document.getElementById("staticDiv") && document.getElementById("dynamicHeadline")) {
        document.getElementById("dynamicDiv").hidden = !viewing.includes("session");
        document.getElementById("realTimeDiv").hidden = !viewing.includes("real-time");
        document.getElementById("staticDiv").hidden = !viewing.includes("longterm");
        if (viewing.includes("session") || viewing.includes("real-time")) {
            document.getElementById("dynamicHeadline").hidden = false;
        } else {
            document.getElementById("dynamicHeadline").hidden = true;
        }
    }
    updateDisplay(selectedUserId);
}

function updateDisplay(selectedUserId) {
    if (selectedUserId === undefined) {
        selectedUserId = userData[0].userId;
    }
    let user = userData[getIndexOfUserId(selectedUserId)];
    if (averageHeartFrequenceDisplay && user) {
        avgHeartRateDisplay.textContent = user.userSessionData.averageHeartFrequence;
        avgOxygenDisplay.textContent = user.userSessionData.averageOxygen;
        avgMuscleUsageDisplay.textContent = user.userSessionData.averageMuscleUsageInPercent;
        trainedMusclesInCurrentOrLatestSessionDisplay.textContent = user.userSessionData.trainedMusclesInCurrentOrLatestSession.join(", ");

        heartRateDisplay.textContent = user.userShortTerm.heartFrequence;
        oxygenDisplay.textContent = user.userShortTerm.oxygen;
        currentMuscleBeingTrainedDisplay.textContent = user.userShortTerm.currentMuscleBeingTrained;
        currentExerciseDisplay.textContent = user.userShortTerm.currentExercise;

        maxTimeTrainedDisplay.textContent = user.userHighscores.maxTimeTrained;
        maxDoneInOneForEachExerciseDisplay.textContent = user.userHighscores.maxDoneInOneForEachExercise.join(", ");
        maxHeartRateDisplay.textContent = user.userHighscores.maxHeartRate;

        averageTimeTrainedDisplay.textContent = user.userLongTermAverages.averageTimeTrained;
        averageHeartFrequenceDisplay.textContent = user.userLongTermAverages.averageLongtermHeartFrequence;
        averageOxygenDisplay.textContent = user.userLongTermAverages.averageLongtermOxygen;
        averageMuscleUsageInPercentDisplay.textContent = user.userLongTermAverages.averageLongtermMuscleUsageInPercent;

        weeklyBurnedCaloriesDisplay.textContent = user.userOtherStats.weeklyBurnedCalories;
        monthlyStrengthIncreaseDisplay.textContent = user.userOtherStats.monthlyStrengthIncrease;
        weeklyTrainingTimeDisplay.textContent = user.userOtherStats.weeklyTrainingTime;
        mostTrainedMuscleDisplay.textContent = user.userOtherStats.mostTrainedMuscle;
        mostDoneExerciseDisplay.textContent = user.userOtherStats.mostDoneExercise;
    }
}

init();