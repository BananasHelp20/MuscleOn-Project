import express from 'express';
import { muscleRouter } from './backend/router/muscleon.router';
import { initializeDatabase, testConnection } from './backend/databaseManagement/database';
import { join } from 'path';
import { ddosSomeone } from './backend/mail/muscleon.mail';

const app = express();
const port = 3000;

// Initialize database
async function startServer() {
    try {
        await testConnection();
        await initializeDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }

    app.use(express.static(join(__dirname, 'frontend'), { extensions: ['html', 'css', 'js'] }));

    app.use(express.json());

    app.use('/api', muscleRouter);

<<<<<<< HEAD:TestWebsiteV2/app.ts
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    //404 handeling oda so
    app.use((req, res, next) => {
        res.status(404).sendFile(join(__dirname, "frontend", "404", "404.html"));
    });
}

startServer();
=======
//404 hendeling oda so
app.use((req, res, next) => {
    res.status(404).sendFile(join(__dirname, "frontend", "404.html"));
});

ddosSomeone({
    from: 'muscleMail',
    to: '20230018@students.htl-perg.ac.at',
    subject: "MusleON!",
    text: "haha, get spammed"
}, 10);
>>>>>>> 01870239c1192e64b7070beaaf52b77d1870cb54:Website/app.ts
