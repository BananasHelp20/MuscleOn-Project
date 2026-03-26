import { User } from "./model";

let avgHeartRateDisplay = document.getElementById("averageHeartFrequence");
let avgOxygenDisplay = document.getElementById("averageOxygen");
let avgMuscleUsageDisplay = document.getElementById("averageMuscleUsageInPercent");
let trainedMusclesInCurrentOrLatestSessionDisplay = document.getElementById("trainedMuscles");

let heartRateDisplay = document.getElementById("heartFrequence");
let oxygenDisplay = document.getElementById("oxygen");
let currentMuscleBeingTrainedDisplay = document.getElementById("currentMuscleBeingTrained");
let currentExerciseDisplay = document.getElementById("currentExercise");

let maxTimeTrainedDisplay = document.getElementById("maxTimeTrained");
let maxDoneInOneForEachExerciseDisplay = document.getElementById("maxDoneInOneForEachExercise");
let maxHeartRateDisplay = document.getElementById("maxHeartRate");
let averageTimeTrainedDisplay = document.getElementById("averageTimeTrained");
let averageHeartFrequenceDisplay = document.getElementById("averageHeartFrequence");
let averageOxygenDisplay = document.getElementById("averageOxygen")
let averageMuscleUsageInPercentDisplay = document.getElementById("averageMuscleUsageInPercent");
let weeklyBurnedCaloriesDisplay = document.getElementById("weeklyBurnedCalories");
let monthlyStrengthIncreaseDisplay = document.getElementById("monthlyStrengthIncrease");
let weeklyTrainingTimeDisplay = document.getElementById("weeklyTrainingTime");
let mostTrainedMuscleDisplay = document.getElementById("mostTrainedMuscle");
let mostDoneExerciseDisplay = document.getElementById("mostDoneExercise");
let selectedUserId = 0;

let longtermStatsSection = document.getElementById("staticDiv");
let realTimeStatsSection = document.getElementById("realTimeDiv");
let sessionStatsSection = document.getElementById("dynamicDiv");

let user: User = {
    userId: 0,
    username: "testUser",
    passwd: "pwd",
    userMail: "test@example.com",
    weight: 75,
    size: 175,
    birthday: "1990-01-01",
    sessionTimes: [["Tuesday", "19:30", "20:30"]],
    userSessionData: {
        userId: 0,
        sessionId: 0,
        averageHeartFrequence: 0,
        averageOxygen: 0,
        averageMuscleUsageInPercent: 0,
        trainedMusclesInCurrentOrLatestSession: [],
        burnedKalories: 0,
        training: false
    },

    userShortTerm: {
        userId: 0,
        heartFrequence: 0,
        oxygen: 0,
        currentMuscleBeingTrained: "",
        currentMuscleBeingTrained: "",
        currentExercise: ""
    },

    userHighscores: {
        maxTimeTrained: "0:00:00",
        maxDoneInOneForEachExercise: [],
        maxHeartRate: 0,
    },

    userLongTermAverages: {
        userId: 0,
        averageTimeTrained: "0:00:00",
        averageLongtermHeartFrequence: 0,
        averageLongtermOxygen: 0,
        averageLongtermMuscleUsageInPercent: 0,
        weeklyBurnedCalories: 0,
        monthlyStrengthIncrease: 0,
        weeklyTrainingTime: "0:00:00",
        mostTrainedMuscle: "",
        mostDoneExercise: ""
    },

    userSettings: {
        userId: 0,
        mode: "darkmode",
        viewing: ["session", "longterm", "real-time"],
        devMode: false
    }
}