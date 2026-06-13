# MuscleON Docs
## Frontend
### JS
#### primary.js
##### `init(): void`

Die Init Func beinhaltet das komplette Frontend, ohne init aufruf, würde nichts gehen.

##### `initalizeDefault(deviceData: DeviceProperties): void`

in der initalizeDefault wird alles initialisiert, was nichts damit zu tun hat, ob jemand eingeloggt ist oder nicht. 
Methodenaufrufe:
- initializeLightSwitch();
- initializeExercises();
- initializeDevMode();
- startGame();

darüber hinaus wird, falls gerade ein Trainingsplan verändert wurde, die Property deviceData.editingPlanSection zurückgesetzt und gespeichert.

##### `saveDataToLocalStorage(data: User): void`

name selbsterklärend; Daten werden in den Localen Clientspeicher gespeichert. (ned zu verwechseln mitn Permanenten JSON Speicher)

##### `render(deviceData: DeviceProperties, data:  User): void`

rendert (fast) alles auf da Website. Generiert Tabellen, ändert Styles, und rendert alles, so wie es zur Zeit passt.
direkte Methodenaufrufe:
- showLoggedIn(deviceData);
- showButtons(deviceData.loggedIn);
- showProfileSettings(data.userProperties);
- renderExercises(data.userSettings);
- renderSessionAndExercise(data);
- setModes(data.userSettings);
- ASYNC getTasks() THEN 
-- ddAllTasks();

##### `initializeDataUpdateLoop(): void`

hier werden die Daten (sekündlich) aktualisiert. Dadurch bleiben sie aktuell.
direkte Methodenaufrufe:
- ASYNC getSupportedExercise();
- ASYNC getUnsupportedExercises();
- ASYNC getDefinedExercises();

##### `initializeLoggedOut(): void`

ähnlich wie initializeDefault(), jedoch wird diese Func nur aufgerufen, wenn nicht eingeloggt ist. Hier werden alle sachen initialisiert, die notwendig sind, um die Website funktionsfähig zu machen, wenn man nicht eingeloggt ist.
direkte Methodenaufrufe:
- initializeLogin();
- initializeSignUp();

##### `initializeLoggedIn(deviceData: DeviceProperties, data:  User): void`

selbes wie zuvor, nur fürs eingeloggt sein.
direkte Methodenaufrufe:
- initializeSession();
- initializeLogoutAndDelete();
- loadAndInitializeChecked(data.userSettings);

EventListener:
- -#cancelEditProfileButton
- -#editProfileButton
- -#changePasswordLink
- -#changePasswordButton

#### render.js
##### `syncModes(): void`

syncModes setzt den Text des lightmode/darkmode buttons, und zeigt alles bezüglich Devmode an bzw. blendet es aus

direkte Methodenaufrufe:
- getSettingsFromLocalStorage()

##### `sessionButtonCheck(): void`

setzt alle Button texte bezüglich dem Session Feature. Und blendet alles dazu ein/aus, wenn es gebraucht wird oder nicht.

direkte Methodenaufrufe:
- getDeviceData();
- getUserPropertiesFromLocalStorage();

##### `showLoggedIn(deviceData: DeviceProperties): void`

zeigt einen Logout Button und den Nutzer oben rechts im Menü an, wenn dieser Eingeloggt ist. Andernfalls werden Login und Signup buttons angezeigt.
keine Methodenaufrufe.

##### `setModes(data: UserSettings): void`

hier wird das Theme gesetzt. (Light/Darkmode). Außerdem wird hier zum Devmode noch der Buttontext gesetzt. Zusätzlich werden die Properties ins Localstorage gespeichert.
keine Methodenaufrufe.

##### `showRealTimeData(userdata: User): void`

zeigt die momentanen Daten an, die die sich sehr schnell ändern.
keine Methodenaufrufe.

##### `showSessionData(userdata: User): void`

zeigt die Daten and, die bei einer laufenden Session gesammelt werden, oder zumindest den Durchschnitt
keine Methodenaufrufe.

##### `showLongtermData(userdata: User): void`

zeigt die Durchschnittsdaten an, aller Sessions.
keine Methodenaufrufe.

##### `showProfileSettings(userdata: User): void`

zeigt die Profildaten als Liste auf der Website an. (Liste wird generiert)
keine Methodenaufrufe.

##### `showButtons(loggedIn: boolean): void`

zeigt die Menüoptionen an, die man hat basierend darauf, ob man eingeloggt ist oder nicht
keine Methodenaufrufe.

##### `renderExercises(settings: UserSettings): void`

zeigt die Exercises innerhalb dem -#exercises Element an, basierend auf dem settings.viewingExercises Property.
direkte methodenAufrufe:
- getSupportedExercisesFromLS();
- getUnsupportedExercisesFromLS();
- getUserdefinedExercisesFromLS();
- getDeviceData();

EventListener: (per exercise object)
- delete Button
- edit Button

##### `renderSessionAndExercise(data: User): void`


## "Daten"
### JSON
## Backend
### TS
## Hardware