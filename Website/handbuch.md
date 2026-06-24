# MuscleON! Handbuch
## Website
### Zurechtfinden auf der Website:
Wenn Sie die Website betreten werden sie auf der index.html, bzw auf der Startseite landen, im Menü oben kann man das Logo, "About" und "Exercises" sehen. Die komplette Website ist auf Englisch. Das Logo ist immer ein Link auf die Startseite.

#### About Page
In der About Page finden sie Details zu den Teammitgliedern von MuscleON!.

#### Exercises Page
In der Exercises Page kann man sich alle (definierten) Übungen ansehen.
Wenn man eingeloggt ist, kann man auch Übungen erstellen, importieren und exportieren.

#### Settings Page
Im eingeloggten Zustand kann man auf die Settings Page, dort kann man einstellen, ob man entwickler ist oder nicht (dies hat auswirkungen auf die Logausgaben im F12 Menü und darauf was angezeigt wird). Außerdem kann man das Environment einstellen. Ob man Darkmode oder Lightmode lieber hat, ist jedem selbst überlassen. Es werden dort die beim Signup angegebenen Daten angeführt, wenn diese nicht mehr aktuell sein sollten, können diese mit dem "Edit Profile" Button geändert werden. Das Passwort lässt sich auch ändern, dafür wird man auf eine eigene Seite redirected, wo man dann das momentane passwort eingeben muss. Danach soll 2 mal das neue Passwort angegeben werden.
Sollte man noch keinen Trainingsplan haben und möchte einen erstellen, so drückt man auf "Create Trainings Plan". Wenn man diesen ändern will, drückt man auf "Edit Trainings Plan".
Um einem Trainingsplan eine Trainingssession hinzuzufügen, klickt man auf "Add Session". Jede Session muss einen Tag, eine Startzeit, eine Endzeit und eine Muskelgruppe haben. Die Session kann jederzeit wieder gelöscht werden. Wenn man spezifizieren will, welche Übungen in der Session gemacht werden sollen, kann man auf "Add Exercises" klicken. Dort wird dann eine neue Tabelle angezeigt, in der man dies genauer spezifizieren kann. Um dort eine Exercise hinzuzufügen, drückt man auf "Add new Exercise". Jede Exercise muss einen Namen, eine Beschreibung, die Anzahl der Sets und Anzahl der Reps pro Set haben. Sie kann auch ein Genutztes Gewicht haben. Jede Exercise kann jederzeit wieder gelöscht werden. Mit "Cancel" kann man das Erstellen/Bearbeiten des Trainingsplans abbrechen, mit "Save Trainings Plan" speichert man den Plan.
View Exercises gibt an, welche Übungen auf der Exercises Page angezeigt werden sollen. 
Die drei Checkboxen indizieren, welche art von Daten angezeigt werden sollen, Session data sind Durchschnittswerte einer laufenden Session, Live data sind echtzeitdaten, Long-term Daten sind Durchschnittswerte und Highscores aller Sessions.
Mit "Delete Account" kann man seinen Account löschen.

#### Session Page
Im eingeloggten Zustand kann man auf die Session Page, hier kann man Sessions starten, und Daten der Sessions einsehen.
Wie auf der Settings Page kann man hier einstellen, welche Daten man sehen will.
Wenn das Show Long-term Data Flag gesetzt ist, wird man auch ohne eine Session zu starten die Statischen Daten wie Durchschnitte und Highscores sehen können.
Wenn eine Session läuft, kann man zusätzlich zu den Statischen Daten die Sessiondaten sehen. Die Live Daten und der Live Graph werden aber nur angezeigt, wenn eiine Übung gestartet wurde.

### Session handeling
Auf der Session Page kann man im eingeloggten Zustand mit dem Button "Start Session" eine Session starten.
Wenn gestartet, kann man die momentane Exercise sehen, welche ohne eine Übung zu starten standardmäßig "not started yet" anzeigt. Wenn Session gestartet ist, wird der "Start Exercise" Button sichtbar, mit diesem kann man die erste Übung des Trainingsplans starten, sofern einer definiert wurde. Andernfalls würde statt der momentanen Exercise ein Timer starten, der die Zeit mitmisst.
Wenn die Übung gestartet wurde, und ein Trainingsplan existiert, wird der "Skip Exercise" Button angezeigt. Damit kann man zur nächsten Exercise springen, wenn man eine Übung überspringen möchte. Wenn die Übersprungene Übung die letzte war, wird die Session beendet. Wenn die Übung läuft, kann man außerdem den "Pause Exercise" Button sehen, Wenn man diesen drückt, wird die Session, bzw die Übung gestoppt, um etwas zu trinken oder generell pause zu machen. Die Datenanzeige wird derweil angehalten.

### Login/SignUp/Logout/Deletion
Oben rechts in der Menüleiste finden sich 2 Buttons, "Login" und "SignUp Now". Wenn man auf Login drückt, wird man auf die Loginseite redirected um sich dort einzuloggen mit der Email und dem Passwort. Wenn man noch kein Account hat, kann man auf "sign up here" drücken.
Auf der Signup Seite muss man daraufhin um ein Account erstellen zu können den Namen, das Passwort, eine valide E-Mail, ein Gewicht, die Körpergröße und den Geburtstag eingeben. Darüber hinaus kann man wenn man will einen Trainingsplan erstellen. Dies lässt sich später auch noch machen.
Beim Ausloggen muss einfach nur auf logout gedrückt werden.
Auf der Settings Page kann man jederzeit sein Account Löschen, dafür muss einfach nur auf Delete Account gedrückt werden.

### ANMERKUNG
Das Vorgehen ohne Trainingsplan wurde noch nicht richtig implementiert, daher ist es empfohlen, einen zu erstellen. Auch das Erinnern bei nichteinhaltung des Plans wurde noch nicht implementiert.

## Hardware
## Setup