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
    userSessionData: UserSessionData | null,
    userShortTerm: UserShortTermData | null,
    userHighscores: UserHighscoreData | null,
    userLongTermAverages: UserLongTermAverageData | null,
    userSettings: UserSettings
}

export interface UserProperties {
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

export interface UserSessionData {
        userId: number,
        sessionId: number,
        averageHeartFrequence: number,
        averageOxygen: number,
        averageMuscleUsageInPercent: number,
        trainedMusclesInCurrentOrLatestSession: string[]
        burnedKalories: number,
        training: boolean
}

export interface UserShortTermData {
        userId: number,
        heartFrequence: number,
        oxygen: number,
        currentMuscleUsageInPercent: number,
        currentMuscleBeingTrained: string,
        currentExercise: string
}

export interface UserHighscoreData {
        userId: number,
        maxTimeTrained: string,
        maxDoneInOneForEachExercise: [string, number][],
        maxHeartRate: number,
}

export interface UserLongTermAverageData {
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

export interface UserProperties {
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

export interface SupportedExercises { //jo i was bissi verwirrend, oba passt scho so
    excercises: Muscle[]
}

interface Muscle {
    muscle: string,
    excercisesForMuscle: string[]
}

export interface DeviceProperties {
    running: boolean,
    loggedIn: boolean,
    loggedInAsUser: string,
    loggedInWithUserId: number,
}