export interface User {
    userId: number, //user id brauch ma, falls a user glöscht wird, daher ned index sondern id
    username: string,
    passwd: string,
    userMail: string,
    weight: number,
    size: number,
    birthday: string,
    sessionTimes: string[][],
    additionalSessions?: string[][],
    userSessionData: userSessionData | null,
    userShortTerm: userShortTermData | null,
    userHighscores: userHighscoreData | null,
    userLongTermAverages: userLongTermAverageData | null,
    userSettings: UserSettings
}

export interface userProperties {
    userId: number,
    username: string,
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
        maxTimeTrained: string,
        maxDoneInOneForEachExercise: [string, number][],
        maxHeartRate: number,
}

export interface userLongTermAverageData {
        userId: number,
        averageTimeTrained: string,
        averageLongtermHeartFrequence: number,
        averageLongtermOxygen: number,
        averageLongtermMuscleUsageInPercent: number,
        weeklyBurnedCalories: number,
        monthlyStrengthIncrease: number,
        weeklyTrainingTime: string,
        mostTrainedMuscle: string,
        mostDoneExercise: string
}

export interface userProperties {
        userId: number,
        username: string,
        passwd: string,
        userMail: string
        weight: number,
        size: number,
        birthday: string,
        sessionTimes: string[][],
        additionalSessions?: string[][]
}

export interface UserSettings {
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