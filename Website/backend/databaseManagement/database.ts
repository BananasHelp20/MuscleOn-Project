// import mysql from 'mysql2/promise';
// import path from 'path';

// // MySQL connection configuration
// const dbConfig = {
//     host: '192.168.1.100', // Replace with your Raspberry Pi's IP address
//     user: 'muscleon_user', // Replace with your MySQL username
//     password: 'your_password', // Replace with your MySQL password
//     database: 'muscleon_db', // Replace with your database name
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// };

// export const pool = mysql.createPool(dbConfig);

// // Test connection
// export async function testConnection(): Promise<void> {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Connected to MySQL database on Raspberry Pi');
//         connection.release();
//     } catch (error) {
//         console.error('Error connecting to MySQL:', error);
//         throw error;
//     }
// }

// export async function initializeDatabase(): Promise<void> {
//     try {
//         // Users table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS users (
//                 userId INT PRIMARY KEY AUTO_INCREMENT,
//                 userName VARCHAR(255) NOT NULL UNIQUE,
//                 password VARCHAR(255) NOT NULL,
//                 email VARCHAR(255) NOT NULL UNIQUE,
//                 weight FLOAT NOT NULL,
//                 size INT NOT NULL,
//                 birthday DATE NOT NULL,
//                 currentlyTraining TINYINT(1) DEFAULT 0,
//                 currentlyInExercise TINYINT(1) DEFAULT 0,
//                 createdPlan TINYINT(1) DEFAULT 0,
//                 createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//             )
//         `);

//         // Exercises table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS exercises (
//                 exerciseId INT PRIMARY KEY AUTO_INCREMENT,
//                 name VARCHAR(255) NOT NULL,
//                 description TEXT,
//                 exerciseType VARCHAR(255) NOT NULL,
//                 userIdCreated INT,
//                 userNameCreated VARCHAR(255),
//                 public TINYINT(1) DEFAULT 0,
//                 createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (userIdCreated) REFERENCES users(userId)
//             )
//         `);

//         // Exercise equipment junction table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS exercise_equipment (
//                 exerciseId INT NOT NULL,
//                 equipment VARCHAR(255) NOT NULL,
//                 PRIMARY KEY (exerciseId, equipment),
//                 FOREIGN KEY (exerciseId) REFERENCES exercises(exerciseId) ON DELETE CASCADE
//             )
//         `);

//         // Exercise muscle groups junction table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS exercise_muscles (
//                 exerciseId INT NOT NULL,
//                 muscleGroup VARCHAR(255) NOT NULL,
//                 PRIMARY KEY (exerciseId, muscleGroup),
//                 FOREIGN KEY (exerciseId) REFERENCES exercises(exerciseId) ON DELETE CASCADE
//             )
//         `);

//         // Training units table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS training_units (
//                 trainingUnitId INT PRIMARY KEY AUTO_INCREMENT,
//                 userId INT NOT NULL,
//                 startTime DATETIME NOT NULL,
//                 endTime DATETIME,
//                 FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
//             )
//         `);

//         // Sessions table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS sessions (
//                 sessionId INT PRIMARY KEY AUTO_INCREMENT,
//                 trainingUnitId INT NOT NULL,
//                 startTime DATETIME NOT NULL,
//                 endTime DATETIME,
//                 FOREIGN KEY (trainingUnitId) REFERENCES training_units(trainingUnitId) ON DELETE CASCADE
//             )
//         `);

//         // Session exercises table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS session_exercises (
//                 sessionExerciseId INT PRIMARY KEY AUTO_INCREMENT,
//                 sessionId INT NOT NULL,
//                 exerciseId INT NOT NULL,
//                 reps INT,
//                 sets INT,
//                 weight FLOAT,
//                 startTime DATETIME,
//                 endTime DATETIME,
//                 FOREIGN KEY (sessionId) REFERENCES sessions(sessionId) ON DELETE CASCADE,
//                 FOREIGN KEY (exerciseId) REFERENCES exercises(exerciseId)
//             )
//         `);

//         // Training data (sensor data) table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS training_data (
//                 dataId INT PRIMARY KEY AUTO_INCREMENT,
//                 sessionId INT NOT NULL,
//                 timestamp DATETIME NOT NULL,
//                 heartRate INT,
//                 oxygen FLOAT,
//                 muscleUsagePercent FLOAT,
//                 FOREIGN KEY (sessionId) REFERENCES sessions(sessionId) ON DELETE CASCADE
//             )
//         `);

//         // User settings table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS user_settings (
//                 settingId INT PRIMARY KEY AUTO_INCREMENT,
//                 userId INT NOT NULL UNIQUE,
//                 mode VARCHAR(255) DEFAULT 'darkmode',
//                 realTimeStats TINYINT(1) DEFAULT 1,
//                 sessionStats TINYINT(1) DEFAULT 0,
//                 longtermStats TINYINT(1) DEFAULT 0,
//                 devMode TINYINT(1) DEFAULT 0,
//                 viewingExercises VARCHAR(255) DEFAULT 'all',
//                 FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
//             )
//         `);

//         // User session times (training plan) table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS user_session_times (
//                 sessionTimeId INT PRIMARY KEY AUTO_INCREMENT,
//                 userId INT NOT NULL,
//                 weekday VARCHAR(255) NOT NULL,
//                 fromTime VARCHAR(255) NOT NULL,
//                 toTime VARCHAR(255) NOT NULL,
//                 primaryMuscleGroup VARCHAR(255),
//                 FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
//             )
//         `);

//         // Sensors table
//         await pool.execute(`
//             CREATE TABLE IF NOT EXISTS sensors (
//                 sensorId INT PRIMARY KEY AUTO_INCREMENT,
//                 userId INT NOT NULL,
//                 macAddress VARCHAR(255) NOT NULL UNIQUE,
//                 sensorType VARCHAR(255),
//                 createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
//             )
//         `);

//         console.log('Database initialized successfully');
//     } catch (error) {
//         console.error('Error initializing database:', error);
//         throw error;
//     }
// }
