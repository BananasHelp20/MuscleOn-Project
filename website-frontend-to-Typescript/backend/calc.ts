import * as model from "./model";
//NOAH, dei part (berechnen, und einfügen ins userData array)
//ACHTUNG, in an UserObject kann a null drinsteh, falls da user noch nix gemacht hat, sprich, wenns a neicha user is.
//im Model wird a User beschrieben, de Daten addidtionalSessionTimes, userLongTermAverages, userHighscores, userShortTerm, userSessionData san wichtig für di
//deren id entspricht da generischen userId, frog ned, is einfoch so.
// du sollst alle daten vom esp32 bekommen, berechnen, und dann in de json datein einischreiben
// jede Session gibt einem Daten, die sollst du nach dem Beenden der session auswerten, und dann zu den longterm daten hinzurechnen
// heißt: wärend dem Trainieren werden die shortterm daten durchgehend aktuallisiert, und daraus werden die sessiondaten berechnet.
// die sessiondaten werden auch auf der website angezeigt, wenn die session daann aber beendet wird, werden sie in die longtermdaten eingerechnet.
// nach dem einrechnen werden die sessiondaten gelöscht.