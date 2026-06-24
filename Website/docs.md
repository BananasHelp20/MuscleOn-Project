# MuscleON!
## Json Structure (data Folder)
### device Json files
Device Json Files sind alle Files, die nicht direkt mit dem Nutzer zu tun haben bzw. die global für alle clients gelten (also alle daten, die konstant bleiben, oder den Raspi betreffen). Genau genommen könnte man validationCodes.json auch dazu zählen.

#### currentProperties.json
Die current Properties indizieren wer gerade auf dem Raspi eingeloggt ist, und ob gerade Daten empfangen werden.
Properties:
- running: Läuft der Raspi/ESP32 gerade? Wird die Website gehostet?
- loggedIn: ist ein Bezutzer eingeloggt?
- loggedInAsUser: wie Heißt der eingeloggte Nutzer?
- loggedINWithUserId: welche Id hat dieser Nutzer?
- editingPlanSection: im editing modus beim Trainingsplan?
- startetSession: läuft eine Session gerade?
- startetExercise: wird gerade eine Exercise gemacht?

#### trainingPlanPresets.json
Vordefinierte Pläne die in Zukunft ausgewählt werden können
Das File zeigt ein Array an Plänen.

#### supportedExercises.json
Vordefinierte Übungen, welche von der Hardware unterstützt werden.
Das File zeigt ein Array an Übungen.

#### unsupportedExercises.json
Von Nutzern definierte Übungen, welche von anderen Nutzern geteilt werden.
Das File zeigt ein Array an Übungen.

#### validationCodes.json
ein File, welches alle Aktiven Email-validationcodes als Array speichert.

#### presetPlans.json
DEPRECATED!

### devmode Json Files
Listfiles zum Entwickeln. Quasi Todo listen

#### noahTasks.json && tobiTasks.json && williTasks.json
Für jedes Projektmitglied ein File bzw eine Liste an dingen die gemacht werden müssen.

### userDynamic Json Files
Jsons an Daten, die sich stetig ändern.

#### session.json
Durchschnittsdaten der kompletten Session, alles das die komplette Session betrifft.
Properties:
- averageHeartFrequence: durchschnittliche Herzfrequenz (DEPRECATED)
- averageMuscleUsageInPercent: durchschnittliche Muskelnutzung in %.
- finishedExercises: Übungen die in der Session schon gemacht wurden.
- exercisesAhead: Übungen die noch anstehen (inklusive momentaner übung).
- trainedMuscles: Alle bisher trainierten Muskelgruppen.

#### shortTerm.json
Echtzeitdaten des Moments.
Properties:
- heartFrequence: momentane Herzfrequenz (DEPRECATED)
- muscleUsageInPercent: Momentane Muskelauslastung.
- currentExercise: Momentane Übung.
- trainingMuscle: Momentan hauptsächlich trainierte Muskelgruppe.
- currentReps: Repcount der Übung.
- currentSets: Setcount der Übung.

### userStatic
Statische Daten, die sich nicht oft ändern.

#### additionalSessions.json
Array an Sessions, die nicht während der normalen Trainingszeiten abgehalten wurden (mind 2 stunden vor oder nach normalen Zeiten)

#### average.json
Nutzerdurchschnittsdaten, durchschnitt aller abgehaltenen Sessions inklusive extrasessions.
Properties:
- averageSessionTime: Durchschnittsdauer aller Sessions.
- averageHeartRate: durchschnittsherzfrequenz aller Sessions (DEPRECATED).
- averageUsageInPercent: durchschnittliche Muskelausnutzung in %. (0% == 0, 100% == 4800 des rohwerts)
- monthlyStrenghIncrease: durchschnittliche Verbesserung/Verschlechterung der Durchschnittlichen Sessionmuskelauslastung.
- weeklyTrainingTime: normale (ohne extrasessions) Gesamttrainingszeit die der Trainingsplan vorsieht. (Wenn kein Trainingsplan vorhanden, dann durchschnitt aller Wochen die mindestens eine Session beinhalten)
{
- mostTrainedMusleGroup: hauptsächlich trainierte Muskelgruppe.
- mostDoneExercise: meist trainierte Exercise.
}

#### highscore.json
Alle Höchstwerte, also highscores. Alltime!
Properties:
- mostTrainedMusleGroup: hauptsächlich trainierte Muskelgruppe.
- mostDoneExercise: meist trainierte Exercise.
- maxSessionTime: Längste Session (auch unter Extrasessions).
- maxDoneInSetForEachExercise: Array an Exercises, welches keine Sets aber Reps beinhaltet. Hier geht es um die maximalen Reps (wiederholungen am Stück ohne mind. 20 sekunden Pause) überhaupt für jede absolvierte Exercise.
- maxSetReps: maximaler Repcount überhaupt (exercise irrelevant)
- maxHeartRate: DEPRECATED

#### settings.json
Settings des Nutzers
Properties:
- mode: Light oder Darkmode (also environment theme)
- viewing: zeigt, welche abteilungen der Nutzer sehen will.
- devMode: zeigt an, ob der Nutzer ein Admin/Developer ist -> hat auswirkung darauf, ob gewisse dinge geloggt oder angezeigt werden.
- viewingExercises: zeigt an, welche Art von Übungen der Nutzer sehen will, standardmäßig alle.

#### userdefinedExercises.json
Ähnlich wie unsupportetExercises.json, nur diesmal sind nur die Exercises darin, die der momenan eingeloggte Nutzer selbst erstellt/importiert hat.

#### userPorperties.json
Ähnlich wie Settings.json, hier sind die momentanen Eigenschaften des eingeloggten Nutzers gespeichert.
Properties:
- userId: von der Datenbank vergebene ID.
- userName: Nutzername.
- password: Passwort.
- email: Nutzermail.
- weight: Gewicht des Nutzers.
- size: Größe des Nutzers.
- birthday: Geburtstag des Nutzers.
- currentlyTraining: Flag das anzeigt, ob der Nutzer gerade eine laufende Session hat.
- currentlyInExercise: Flag das anzeigt, ob der Nutzer gerade eine Übung macht (true indiziert das currentlyTraining auch true sein muss).
- pausedSession: Flag das anzeigt, ob der Nutzer gerade Pause macht in einer laufenden Session.
- createdPlan: Flag das anzeigt, ob der Nutzer je einen Trainingsplan erstellt/importiert hat.
- verifiedEmail: Flag das anzeigt, ob die angegebene Email verifiziert wurde.
- usualSessionTimes: Erstellter/Importierter Trainingsplan.