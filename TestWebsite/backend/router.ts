import e from "express";
import { getUserData } from "./read";

export const muscleRouter = e.Router();

muscleRouter.get('/getData', async (req, res) => {
    res.json(await getUserData());
});

muscleRouter.post('/saveSettings', async (req, res) => {
    const settings = req.body;  // JSON-Daten aus der Anfrage holen

    // Beispiel: Verwende die Daten (z. B. logge sie oder verarbeite sie)
    console.log('Empfangene Settings:', settings);
    console.log('User ID:', settings.userId);
    console.log('Mode:', settings.mode);

    // Optional: Führe eine Verarbeitung durch (z. B. validiere oder berechne etwas)
    if (settings.devMode) {
        console.log('DevMode ist aktiviert für User', settings.userId);
    }

    // Sende eine Bestätigung zurück
    res.status(200).json({ message: 'Settings empfangen und verarbeitet', receivedData: settings });
});