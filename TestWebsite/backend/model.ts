export interface User {
    userId: number,
    userName: string,
    passwd: string,
    userMail: string,
    weight: number,
    size: number,
    birthday: string,
    sessionTimes: string[][],
    additionalSessions?: string[][],
    userSessionData: userSessionData,
    userShortTerm: userShortTermData,
    userHighscores: userHighscoreData,
    userLongTermAverages: userLongTermAverageData,
    userSettings: userSettings
}

export interface userProperties {
    userId: number,
    userName: string,
    passwd: string,
    userMail: string,
    weight: number,
    size: number,
    birthday: string
    sessionTimes: string[][],
    additionalSessions?: string[][]
}

export interface userSessionData {
        userId: number,
        sessionId: number,
        averageHeartFrequence: number,
        averageOxygen: number,
        averageMuscleUsageInPercent: number,
        trainedMusclesInCurrentOrLatestSession: string[]
        burnedKalories: number,
        training: boolean
}

export interface userShortTermData {
        userId: number,
        heartFrequence: number,
        oxygen: number,
        currentMuscleUsageInPercent: number,
        currentMuscleBeingTrained: string,
        currentExercise: string
}

export interface userHighscoreData {
        userId: number,
        maxTimeTrained: number,
        maxDoneInOneForEachExercise: number[],
        maxHeartRate: number,
}

export interface userLongTermAverageData {
        averageTimeTrained: number,
        averageLongtermHeartFrequence: number,
        averageLongtermOxygen: number,
        averageLongtermMuscleUsageInPercent: number,
        weeklyBurnedCalories: number,
        monthlyStrengthIncrease: number,
        weeklyTrainingTime: number,
        mostTrainedMuscle: string,
        mostDoneExercise: string
}

export interface userProperties {
        userId: number,
        userName: string,
        passwd: string,
        userMail: string
        weight: number,
        size: number,
        birthday: string,
        sessionTimes: string[][],
        additionalSessions?: string[][]
}

export interface userSettings {
        userId: number,
        mode: string,
        viewing: string[],
        devMode: boolean
}

export interface supportedExercises { //jo i was bissi verwirrend, oba passt scho so
    excercises: muscle[]
}

interface muscle {
    muscle: string,
    excercisesForMuscle: string[]
}

export interface deviceProperties {
    running: boolean,
    loggedIn: boolean,
    loggedInAsUser: string,
    loggedInWithUserId: number,
}