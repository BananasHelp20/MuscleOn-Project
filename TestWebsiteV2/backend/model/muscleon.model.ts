//Alle Zeitangaben: st:min:sec -> 00:00:00
export interface User {
    userProperties: UserProperties,                         //ois wos ma ned errechnen kann, bzw woraus ma sochn berechnet
    additionalSessions?: Time[],                            //anders wie usualSessionTimes, san des sessions de ned regelmäßig passieren. (außerhalb von dem Trainingsplan (wenns an gibt)) [[tag, startzeit, endzeit], [...]]
    userSessionData: UserSessionData | null,                //des san de sessiondaten (werden aus de Shorttermdaten ausgerechnet)
    userShortTerm: UserShortTermData | null,                //des de, de de gaunze Zeit aktuallisiert werden
    userHighscores: UserHighscoreData | null,               //teilweise longterm, teilweise shortterm, san statisch, oba werden laufend aktuallisert auf da Website, falls da User Sekunde für Sekunde sein Highscore bricht oda so.
    userLongTermAverages: UserLongTermAverageData | null,   //des is ois statische, wird nach ende von ana session aus de sessiondaten berechnet
    userSettings: UserSettings,                             //Settings für jeden User, das er Geräteübergreifend de selben Einstellungen hat.
    userDefinedExercises: Exercise[]
}

export interface UserProperties {
    userId: number;
    userName: string;
    password: string;
    email: string;
    weight: number;
    size: number;
    birthday: string;
    currentlyTraining: boolean;
    createdPlan: boolean;
    currentlyInExercise: boolean;
    usualSessionTimes?: ExerciseSelection[];                         //Eingestellter Trainingsplan, sofern eingestellt [[tag, startzeit, endzeit], [...]]
}

export interface UserSessionData {
    averageHeartFrequence: number,
    averageOxygen: number,
    averageMuscleUsageInPercent: number,
    alreadyTrained: ExerciseSelection[]                                //ois wos in da Session scho trainiert worden is
}

export interface UserShortTermData {
    heartFrequence: number,
    oxygen: number,
    muscleUsageInPercent: number,
}

export interface UserHighscoreData {
    maxTimeTrained: string,                                 //maximale sessiontime
    maxDoneInOneForEachExercise: Exercise[],                //do wird werden reps/sets als statische Anzahlen verwendet
    maxHeartRate: number,
}

export interface UserLongTermAverageData {
    averageTimeTrained: string,
    averageLongtermHeartFrequence: number,
    averageLongtermOxygen: number,
    averageLongtermMuscleUsageInPercent: number,
    monthlyStrengthIncrease: number,                        //wenn messbar (in % zum vorherigen Monat)
    weeklyTrainingTime: string,
    mostTrainedMuscleGroup: string,
    mostDoneExercise: Exercise                              //do braucht ma kane reps/sets ABER eventuell a weight, wenn ers imma mit weight macht
}

export interface UserSettings {
    mode: string,                                           //light-/darkmode
    viewing: {
        realTimeStats: boolean,
        sessionStats: boolean,
        longtermStats: boolean,
    },                                                      //viewing speichert de sochn, de auf da website angezeigt werden sollen (ob sessiondaten mit-angezeigt werden sollen oda ned z.B.)
    devMode: boolean                                        //platzhalter (was a nimma warum i den eingefügt hob)
}

export interface DeviceProperties {
    running: boolean,                                       //ob des messteil grod rent (website muss jo a do sei wenn ned trainiert wird)
    loggedIn: boolean,
    loggedInAsUser?: string,
    loggedInWithUserId?: number,
    loadedUserData?: boolean,
    editingPlanSection: boolean
}

export interface SupportedExercises {
    excercises: Exercise[]                                    //do gibts keine reps/sets, weil jo nur de sochn aufgelistet werden
}

export interface ExerciseSelection {
    sessionId: number,
    primaryMuscleGroup: string,                                         // da Muskel, den da User trainieren möchte
    exercises: Exercise[],
    times?: Time
}

export interface Time {
    date?: string,
    weekday: string,
    fromTime: string,
    toTime: string
}

/**
 * Ok, so des Interface Exercise kann folgendermaßen benutzt werden:
 * - Exercises aufzählen (name, description, equipment, (userNameCreated, userIdCreated))
 * - Exercises anlegen (name, description, equipment, public, targetedMuscleGroups, (unc und uic kommen automatisch))
 * - Exercises definieren (im trainingsplan) (name, targetedMuscleGroups, equipment, reps, sets, (weight))#
 * und i glaub nu anders iwie, musst da bissi durchlesen srry
 */
export interface Exercise {                                 //a interface, wos quasi überall eingesetzt werden kann, je noch dem wos eingesetzt wird, werden unterschiedliche properties benötigt
    name: string
    exerciseType: string,                                   //supported / unsupported / user-defined
    description?: string,
    targetedMuscleGroups?: string[],                        //gaunz simpel: rechter arm, linker arm, rücken, bauchmuskeln, beine...
    equipment?: string[],                                   //nur falls ma de Übung mit am Gerät oda sowos macht, sonst is des irrelevant
    reps?: number,
    sets?: number,
    weight?: number | boolean | null,                                        //nur falls ma de Übung mit Gewicht macht, sonst is des irrelevant // ACHTUNG: WEIGHT KANN BOOLEAN UND NUMBER SEI, depending on use hoid
    userNameCreated?: string,                               //wichtig für usercredit
    userIdCreated?: number,                                 //nur wenn de übung vom User defined wordn is (tendentiell wird userNameCreated a braucht wenn des braucht wird)
    public?: boolean,                                       //wenn da user will, das de custom übung von andere ersichtlich is
}

export interface DatabaseAnswer {
    found: boolean,
    userId: number,
    email: string,
    username: string,
    userProperties?: UserProperties, //is notwendig, oba nur bei gewisse anfragen
    userSettings?: UserSettings //wie bei userproperties
}