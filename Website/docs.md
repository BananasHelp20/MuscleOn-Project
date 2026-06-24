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

## Frontend
### JS

#### primary.js

##### `init(): void`
- Haupt-Einstiegspunkt für das Frontend.
- Ruft `initalizeDefault()` auf, startet die Update-Loops und initialisiert den Live-Graph.
- Lädt Benutzerdaten, wenn `deviceData.loggedIn` true ist.

##### `requestData(deviceData): void`
- Lädt ggf. spezifische Benutzer-Daten nach, falls `loadedUserData` noch nicht gesetzt ist.
- Zeigt eine Fehlermeldung, wenn die angeforderte User-ID nicht gefunden wird.

##### `initalizeDefault(deviceData: DeviceProperties): void`
- Initialisiert Funktionen, die unabhängig vom Login sind.
- Ruft auf:
  - `initializeLightSwitch()`
  - `initializeExercises()`
  - `initializeDevMode()`
  - `initializeViewingPage()`
  - `startGame()`
- Setzt `deviceData.editingPlanSection = false` und speichert `deviceData` lokal.

##### `saveDataToLocalStorage(data: User): void`
- Speichert:
  - `userProperties`
  - `userSettings`
  - `userData`
- in `localStorage`.

##### `render(deviceData: DeviceProperties, data: User): void`
- Rendert die gesamte Oberfläche entsprechend dem Login-Zustand.
- Ruft auf:
  - `showLoggedIn(deviceData)`
  - `showButtons(deviceData.loggedIn)`
  - `showProfileSettings(data.userProperties)`
  - `renderExercises(data.userSettings)`
  - `renderSessionAndExercise(data)`
  - `setModes(data.userSettings)`
- Lädt bei DevMode zusätzlich Tasks und zeigt sie an.

##### `initializeDataUpdateLoop(): void`
- Aktualisiert wiederholt Benutzer-Daten im Intervall.
- Speichert aktualisierte Daten lokal.
- Ruft auf:
  - `showRealTimeData(userdata)`
  - `showSessionData(userdata)`
  - `showLongtermData(userdata)`
  - `render(getDeviceData(), userdata)`

##### `initializeExerciseUpdateLoop(): void`
- Aktualisiert lokal gespeicherte Übungsliste wiederholt:
  - `getSupportedExercises()`
  - `getUnsupportedExercises()`
  - `getUserDefinedExercises()`

##### `initializeLoggedOut(): void`
- Initialisiert Login- und Signup-Logik:
  - `initializeLogin()`
  - `initializeSignUp()`

##### `initializeGraphStyle(): void`
- Setzt Farben für Live-Graph-Darstellung.

##### `initLiveGraph(): void`
- Initialisiert Live-Graph nach DOM-Load.
- Stellt Cleanup bei `beforeunload` und Tab-Wechsel sicher.

##### `initializeLoggedIn(deviceData, data): void`
- Initialisiert UI-Elemente und Event-Listener für eingeloggte Nutzer.
- Ruft auf:
  - `initializeSession()`
  - `initializeLogoutAndDelete()`
  - `loadAndInitializeChecked(data.userSettings)`
- Bindet Buttons:
  - `cancelEditProfileButton`
  - `editProfileButton`
  - `changePasswordLink`
  - `changePasswordButton`

#### render.js

##### `syncModes(): void`
- Setzt Buttontexte für Light/Darkmode und DevMode.
- Schaltet DevMode-spezifische Elemente sichtbar/invisible.

##### `sessionButtonCheck(): void`
- Aktualisiert Texte und Sichtbarkeit der Session-Controls.
- Nutzt:
  - `getDeviceData()`
  - `getUserPropertiesFromLocalStorage()`

##### `showLoggedIn(deviceData): void`
- Zeigt Logout und aktuellen Nutzernamen bei Login.
- Zeigt Login/Signup-Buttons sonst.

##### `setModes(data: UserSettings): void`
- Setzt Theme-Stylesheet auf `light.css` oder `dark.css`.
- Speichert Theme- und DevMode-Status lokal.

##### `showRealTimeData(userdata: User): void`
- Zeigt Echtzeitdaten zur aktuellen Übung.
- Steuert Sichtbarkeit von `realTimeDiv` und `realTimeDataDiv`.

##### `showSessionData(userdata: User): void`
- Zeigt laufende Session-Daten oder Session-Durchschnittswerte.
- Steuert Sichtbarkeit von `dynamicDiv`.

##### `showLongtermData(userdata: User): void`
- Zeigt Langzeitstatistiken aus `userLongTermAverages` und `userHighscores`.
- Steuert Sichtbarkeit von `staticDiv`.

##### `showProfileSettings(userdata: User): void`
- Generiert Profil-Liste:
  - Username
  - Email
  - Gewicht
  - Größe
  - Geburtstag

##### `showButtons(loggedIn: boolean): void`
- Blendet gesperrte Menüobjekte abhängig vom Login aus oder ein.

##### `renderExercises(settings: UserSettings): void`
- Rendert Übungen basierend auf `settings.viewingExercises`.
- Verwendet:
  - `getSupportedExercisesFromLS()`
  - `getUnsupportedExercisesFromLS()`
  - `getUserdefinedExercisesFromLS()`
  - `getDeviceData()`
- Fügt jeder Exercise Edit- und Delete-Buttons hinzu.

##### `renderSessionAndExercise(data: User): void`
- Stellt sicher, dass Session- und Exercise-Controls korrekt als Buttons gestylt sind.

#### initalize.js

##### `initializeLightSwitch(): void`
- Setzt initiale Theme-Anzeige.
- Wechselt Light/Darkmode und speichert User-Einstellungen.

##### `initializeLogoutAndDelete(): void`
- Bindet Aktionen für Logout und Nutzer-Löschen.

##### `initializeSession(): void`
- Setzt Session-Logik:
  - Start/Stop Session
  - Start/Skip Exercise
  - Resume/Pause Session
  - Trainingsplan speichern/abbrechen
- Nutzt:
  - `startSession()`
  - `stopSession()`
  - `startExercise()`
  - `skipExercise()`
  - `pauseSession()`
  - `resumeSession()`

##### `initializeLogout(): void`
- Bindet Logout-Button auf der Seite.

##### `initializeLogin(): void`
- Bindet Inline-Login-Button und Login-Formular.

##### `initializeSignUp(): void`
- Bindet Signup-Logik und Trainingsplan-Initialisierung.

##### `loadExerciseSelection(data): void`
- Erzeugt Tabellen für Trainingsplan-Übungen.
- Fügt Selects, Reps/Sets/Weight-Felder und Remove-Buttons hinzu.

##### `initializeViewingPage(): void`
- Markiert aktives Menü-Item basierend auf URL.

##### `initializeExercises(): void`
- Steuert Wechsel durch Exercise-Filter:
  - All Exercises
  - User-defined Exercises
  - Community-made Exercises
  - Supported Exercises
  - None
- Steuert Add/Save-Exercise-Form.

##### `initializePlanTable(): void`
- Bindet Plan-Checkbox und „add weekday“-Button.
- Erzeugt neue Tageszeilen über `addWeekday()`.

##### `loadAndInitializeChecked(settings): void`
- Konfiguriert Anzeige-Checkboxen für:
  - realTimeStats
  - sessionStats
  - longtermStats
- Speichert Einstellungen und bindet Listener.

#### helper.js

##### `getRealChildren(children): Node[]`
- Filtert Textknoten aus einer NodeList.

##### `getRealChildrenWithId(children): Node[]`
- Filtert Textknoten und Elemente ohne ID aus.

##### `getMuscleGroups(): string[]`
- Liefert Liste aller Muskelgruppen.

##### `setMuscleGroupOptions(elem): void`
- Füllt ein Select mit Muskelgruppen.

##### `setExerciseOptions(elem): void`
- Füllt ein Select mit Übungen aus:
  - Supported Exercises
  - Unsupported Exercises
  - Own Exercises

##### `getFreeSessionId(): number|null`
- Ermittelt freie Session-ID basierend auf DOM.

##### `findExerciseTableById(sessionId): number`
- Findet Exercise-Tabelle zur gegebenen Session-ID.

##### `findTimeTableById(sessionId): number`
- Findet Zeit-Row im Trainingsplan.

##### `initSelectExercise(elem, id, data): void`
- Konfiguriert Equipment- und Weight-Feld anhand der Auswahl.

##### `setSelectedExercise(elem): void`
- Lädt Übungsdaten passend zur Auswahl.

##### `getIndexOfName(array, name): number`
- Sucht Übung anhand Name.

##### `getEmptyExerciseTable(time): HTMLTableElement`
- Erstellt leere Tabellenstruktur für einen Trainingsplan-Tag.

##### `getSessionTimes(): object[]|null`
- Liest kompletten Trainingsplan aus DOM aus.
- Gibt Plan-Objekt oder `null` bei Fehlern zurück.

##### `getIndexOfSessionId(id): number`
- Ordnet Session-ID der Exercise-Tabelle zu.

##### `getExerciseWithId(id): object|null`
- Liefert Übung aus gespeicherten Listen.

##### `validateSessionTimes(data): boolean`
- Validiert Wochen-Tag, Zeiten und Übungsdaten.

##### `log(string): void`
- Debug-Log nur im DevMode.

#### localStorage.js

##### `getUserDataFromLocalStorage(): object|null`
- Liest `userData` aus dem `localStorage`.

##### `getUserPropertiesFromLocalStorage(): object`
- Liest `userProperties`.
- Gibt Default-Objekt zurück, falls nicht vorhanden.

##### `getSettingsFromLocalStorage(): object`
- Liest `userSettings`.
- Gibt Default-Settings zurück, falls fehlend.

##### `getSupportedExercisesFromLS(): object[]`
- Liest lokale unterstützte Übungen.

##### `getUnsupportedExercisesFromLS(): object[]`
- Liest lokale Community-Übungen.

##### `getUserdefinedExercisesFromLS(): object[]`
- Liest lokale User-Übungen.

##### `getDeviceData(): object`
- Liest `deviceData`.
- Gibt Default-Werte zurück, wenn leer.

#### io.js

##### `downloadExercises(): Promise<void>`
- Lädt `userdefinedExercises` als JSON-Datei vom Backend.

##### `uploadExercises(): void`
- Importiert JSON-Datei.
- Validiert Format und sendet `/api/uploadExercises`.

- Event-Listener:
  - `#downloadEx`
  - `#uploadEx`

#### router.js

##### `setUserSettings(settings): Promise<Response>`
- Speichert Settings lokal und sendet `/api/setUserSettings`.

##### `setUserProperties(properties): Promise<Response>`
- Speichert User-Properties lokal und sendet `/api/setUserProperties`.

##### `deleteExercise(name): Promise<Response>`
- Löscht vorhandene Übung über Backend.

##### `loadDataFromSpecificUser(email, password): Promise<object>`
- Lädt User-Daten per Login und markiert `deviceData.loadedUserData`.

##### `loadDataFromSpecificUserById(userId): Promise<object>`
- Lädt User-Daten über User-ID.

##### `validateExerciseName(name): Promise<object>`
- Prüft Übungsname auf Backend-Eindeutigkeit.

##### `saveTasks(tasks): Promise<Response>`
- Speichert Dev-Tasklisten.

##### `appendExercise(exercise): Promise<object>`
- Legt neue Übung an.

##### `clearUserData(): Promise<Response>`
- Meldet Logout an Backend.

##### `deleteUser(): Promise<Response>`
- Löscht aktuellen User im Backend.

##### `createNewUser(userData): Promise<Response>`
- Erstellt neuen User.

##### `saveTimes(times): Promise<Response>`
- Speichert Trainingsplan-Zeiten.

##### `stopSession(): Promise<Response>`
- Sendet `/api/session/stop`.

##### `pauseSession(): Promise<Response>`
- Sendet `/api/session/pause`.

##### `resumeSession(): Promise<Response>`
- Sendet `/api/session/resume`.

##### `startSession(): Promise<object>`
- Startet Session.

##### `startExercise(): Promise<object>`
- Startet Übung.

##### `skipExercise(): Promise<object>`
- Überspringt Übung.

##### `getAllExercises(): Promise<object[]>`
- Holt alle Übungen.

##### `getTasks(): Promise<object[]>`
- Holt Dev-Tasks.

##### `getSupportedExercises(): Promise<object[]>`
- Holt unterstützte Übungen und speichert sie lokal.

##### `getUserById(id): Promise<object>`
- Holt User-Info.

##### `getUnsupportedExercises(): Promise<object[]>`
- Holt Community-Übungen und speichert sie lokal.

##### `getUserDefinedExercises(): Promise<object[]>`
- Holt User-übungen und speichert sie lokal.

##### `getUserData(): Promise<object>`
- Holt aktuelle User-Daten.

##### `sendValidationMail(): Promise<object>`
- Sendet Validierungsmail.

##### `deleteValidationCodes(userId): Promise<Response>`
- Löscht Validierungscodes.

##### `validateMail(code): Promise<object>`
- Validiert Code beim Backend.

##### `saveExerciseToJSON(newExercise, oldExercise): Promise<object>`
- Speichert neue oder bearbeitete Übung.

#### graph.js

##### `getOrCreateClientId(): string`
- Erzeugt/liest eindeutige WebSocket-Client-ID.

##### `initializeLiveGraph(): void`
- Baut Chart.js-Graph auf und startet Datenabruf.

##### `addDataPoint(muscleUsage, timestamp): void`
- Fügt neuen Datenpunkt hinzu.
- Hält Maximalpunktzahl ein.

##### `updateYAxisMax(): void`
- Passt Y-Achse an aktuellen Maximumswert an.

##### `startFetchingData(): void`
- Startet WebSocket oder Polling.

##### `startWebSocketConnection(): void`
- Verbindet mit `/ws/liveData`.
- Implementiert Reconnect-Logik.

##### `startPollingData(): void`
- Hol Daten regelmäßig per HTTP.

##### `fetchLiveData(): Promise<void>`
- Holt Live-Werte von `/api/liveData`.

##### `stopFetchingData(): void`
- Stoppt Polling/WebSocket.

##### `resetLiveGraph(): void`
- Setzt Graph zurück.

##### `addTestData(): void`
- Fügt zufällige Testdaten hinzu.

#### dev.js

##### `addAllTasks(allTasks): void`
- Rendert Dev-Tasklisten.

##### `getHeader(j): string`
- Liefert Überschriften für Taskgruppen.

##### `deleteTask(task): void`
- Entfernt Task und speichert Liste.

##### `initializeDevMode(): void`
- Setzt DevMode-Switch und speichert Zustand.

#### game.js

##### `startGame(): void`
- Initialisiert Canvas-Spiel.
- Zeichnet Character (`duck` oder `fox`).
- Handhabt Sprung, Score, Game Over und Hindernisse.

## Backend
### TS

## Hardware