//Alle Zeitangaben: st:min:sec -> 00:00:00
export interface User {
    userProperties: userProperties | null,                  //ois wos ma ned errechnen kann, bzw woraus ma sochn berechnet
    additionalSessions: string[][];                         //anders wie usualSessionTimes, san des sessions de ned regelmäßig passieren. (außerhalb von dem Trainingsplan (wenns an gibt)) [[tag, startzeit, endzeit], [...]]
    userSessionData?: userSessionData | null,               //des san de sessiondaten (werden aus de Shorttermdaten ausgerechnet)
    userShortTerm: userShortTermData | null,                //des de, de de gaunze Zeit aktuallisiert werden
    userHighscores: userHighscoreData | null,               //teilweise longterm, teilweise shortterm, san statisch, oba werden laufend aktuallisert auf da Website, falls da User Sekunde für Sekunde sein Highscore bricht oda so.
    userLongTermAverages: userLongTermAverageData | null,   //des is ois statische, wird nach ende von ana session aus de sessiondaten berechnet
    userSettings: userSettings | null,                      //Settings für jeden User, das er Geräteübergreifend de selben Einstellungen hat.
}

export interface userProperties {
    userId: number;
    userName: string;
    password: string;
    email: string;
    weight: number;
    size: number;
    birthday: string;
    currentlyTraining: boolean
    usualSessionTimes?: string[][];                         //Eingestellter Trainingsplan, sofern eingestellt [[tag, startzeit, endzeit], [...]]
}

export interface userSessionData {
    averageHeartFrequence: number,
    averageOxygen: number,
    averageMuscleUsageInPercent: number,
    alreadyTrained: muscle[]                                //ois wos in da Session scho trainiert worden is
}

export interface userShortTermData {
    heartFrequence: number,
    oxygen: number,
    muscleUsageInPercent: number,
}

export interface userHighscoreData {
    maxTimeTrained: string,                                 //maximale sessiontime
    maxDoneInOneForEachExercise: exercise[],                //do wird werden reps/sets als statische Anzahlen verwendet
    maxHeartRate: number,
}

export interface userLongTermAverageData {
    averageTimeTrained: string,
    averageLongtermHeartFrequence: number,
    averageLongtermOxygen: number,
    averageLongtermMuscleUsageInPercent: number,
    monthlyStrengthIncrease: number,                        //wenn messbar (in % zum vorherigen Monat)
    weeklyTrainingTime: string,
    mostTrainedMuscle: string,
    mostDoneExercise: exercise                              //do braucht ma kane reps/sets ABER eventuell a weight, wenn ers imma mit weight macht
}

export interface userSettings {
    mode: string,                                           //light-/darkmode
    viewing: string[],                                      //viewing speichert de sochn, de auf da website angezeigt werden sollen (ob sessiondaten mit-angezeigt werden sollen oda ned z.B.)
    devMode: boolean                                        //platzhalter (was a nimma warum i den eingefügt hob)
}

export interface deviceProperties {
    running: boolean,                                       //ob des messteil grod rent (website muss jo a do sei wenn ned trainiert wird)
    loggedIn: boolean,
    loggedInAsUser?: string,
    loggedInWithUserId?: number,
}

export interface supportedExercises {
    excercises: muscle[]                                    //do gibts keine reps/sets, weil jo nur de sochn aufgelistet werden
}

interface muscle {
    muscle: string,                                         // da Muskel, den da User trainieren möchte
    excercisesForMuscle: exercise[]
}

export interface exercise {
    name: string
    description?: string,
    targetetMuscleGroups?: string[],
    equipment?: string[],                                   //nur falls ma de Übung mit am Gerät oda sowos macht, sonst is des irrelevant
    reps?: number,
    sets?: number,
    weight?: number,                                        //nur falls ma de Übung mit Gewicht macht, sonst is des irrelevant
}