import express from 'express';
import { muscleRouter } from './backend/router/muscleon.router';
// import { initializeDatabase, testConnection } from './backend/databaseManagement/database';
import { join } from 'path';
import { ddosSomeone } from './backend/mail/muscleon.mail';

const app = express();
const port = 3000;

// Initialize database
async function startServer() {
    try {
        // await testConnection();
        // await initializeDatabase();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }

    app.use(express.static(join(__dirname, 'frontend'), { extensions: ['html', 'css', 'js'] }));

    app.use(express.json());

    app.use('/api', muscleRouter);

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    //404 handeling oda so
    app.use((req, res, next) => {
        res.status(404).sendFile(join(__dirname, "frontend", "404.html"));
    });
}

startServer();
