import * as model from '../model/muscleon.model';
import { pool } from './database';

// User-related functions
export async function getUserById(userId: number): Promise<model.UserProperties | null> {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE userId = ?', [userId]);
        const user = (rows as any[])[0];
        
        if (!user) return null;

        // Fetch user session times
        const [sessionRows] = await pool.execute('SELECT weekday, fromTime, toTime FROM user_session_times WHERE userId = ?', [userId]);
        const sessionTimes = sessionRows as any[];

        return {
            userId: user.userId,
            userName: user.userName,
            password: user.password,
            email: user.email,
            weight: user.weight,
            size: user.size,
            birthday: user.birthday,
            currentlyTraining: Boolean(user.currentlyTraining),
            currentlyInExercise: Boolean(user.currentlyInExercise),
            createdPlan: Boolean(user.createdPlan),
            usualSessionTimes: sessionTimes.map((st: any) => ({
                weekday: st.weekday,
                fromTime: st.fromTime,
                toTime: st.toTime
            }))
        };
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}

export async function getUserByEmail(email: string): Promise<model.UserProperties | null> {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = (rows as any[])[0];
        
        if (!user) return null;

        // Fetch user session times
        const [sessionRows] = await pool.execute('SELECT weekday, fromTime, toTime FROM user_session_times WHERE userId = ?', [user.userId]);
        const sessionTimes = sessionRows as any[];

        return {
            userId: user.userId,
            userName: user.userName,
            password: user.password,
            email: user.email,
            weight: user.weight,
            size: user.size,
            birthday: user.birthday,
            currentlyTraining: Boolean(user.currentlyTraining),
            currentlyInExercise: Boolean(user.currentlyInExercise),
            createdPlan: Boolean(user.createdPlan),
            usualSessionTimes: sessionTimes.map((st: any) => ({
                weekday: st.weekday,
                fromTime: st.fromTime,
                toTime: st.toTime
            }))
        };
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
}
            usualSessionTimes: sessionTimes.map((st: any) => ({
                weekday: st.weekday,
                fromTime: st.fromTime,
                toTime: st.toTime
            }))
        };
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
}

export async function saveUser(user: model.UserProperties): Promise<boolean> {
    try {
        await pool.execute(`
            INSERT INTO users 
            (userId, userName, password, email, weight, size, birthday, currentlyTraining, currentlyInExercise, createdPlan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                userName = VALUES(userName),
                password = VALUES(password),
                email = VALUES(email),
                weight = VALUES(weight),
                size = VALUES(size),
                birthday = VALUES(birthday),
                currentlyTraining = VALUES(currentlyTraining),
                currentlyInExercise = VALUES(currentlyInExercise),
                createdPlan = VALUES(createdPlan)
        `, [
            user.userId,
            user.userName,
            user.password,
            user.email,
            user.weight,
            user.size,
            user.birthday,
            user.currentlyTraining ? 1 : 0,
            user.currentlyInExercise ? 1 : 0,
            user.createdPlan ? 1 : 0
        ]);

        // Also create default settings if not exists
        await pool.execute(`
            INSERT IGNORE INTO user_settings (userId, mode)
            VALUES (?, 'darkmode')
        `, [user.userId]);

        return true;
    } catch (error) {
        console.error('Error saving user:', error);
        return false;
    }
}

export async function deleteUser(userId: number): Promise<boolean> {
    try {
        await pool.execute('DELETE FROM users WHERE userId = ?', [userId]);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

// Exercise-related functions
export async function getExercises(type: 'supported' | 'unsupported' | 'user', userId?: number): Promise<model.Exercise[]> {
    try {
        let query = 'SELECT * FROM exercises WHERE exerciseType = ?';
        const params: any[] = [type];

        if (type === 'user' && userId) {
            query += ' AND userIdCreated = ?';
            params.push(userId);
        }

        const [rows] = await pool.execute(query, params);
        const exercises = rows as any[];

        // Fetch equipment and muscle groups for each exercise
        const result = await Promise.all(exercises.map(async (ex: any) => {
            const [equipmentRows] = await pool.execute('SELECT equipment FROM exercise_equipment WHERE exerciseId = ?', [ex.exerciseId]);
            const equipment = (equipmentRows as any[]).map((e: any) => e.equipment);

            const [musclesRows] = await pool.execute('SELECT muscleGroup FROM exercise_muscles WHERE exerciseId = ?', [ex.exerciseId]);
            const muscles = (musclesRows as any[]).map((m: any) => m.muscleGroup);

            return {
                name: ex.name,
                exerciseType: ex.exerciseType,
                description: ex.description,
                targetedMuscleGroups: muscles,
                equipment: equipment,
                userNameCreated: ex.userNameCreated,
                userIdCreated: ex.userIdCreated,
                public: Boolean(ex.public)
            };
        }));

        return result;
    } catch (error) {
        console.error('Error getting exercises:', error);
        return [];
    }
}

export async function saveExercise(exercise: model.Exercise, userId?: number): Promise<boolean> {
    try {
        const [result] = await pool.execute(`
            INSERT INTO exercises (name, description, exerciseType, userIdCreated, userNameCreated, public)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            exercise.name,
            exercise.description,
            exercise.exerciseType,
            userId,
            exercise.userNameCreated,
            exercise.public ? 1 : 0
        ]);

        const exerciseId = (result as any).insertId;

        // Save equipment
        if (exercise.equipment && exercise.equipment.length > 0) {
            for (const equip of exercise.equipment) {
                await pool.execute('INSERT INTO exercise_equipment (exerciseId, equipment) VALUES (?, ?)', [exerciseId, equip]);
            }
        }

        // Save muscle groups
        if (exercise.targetedMuscleGroups && exercise.targetedMuscleGroups.length > 0) {
            for (const muscle of exercise.targetedMuscleGroups) {
                await pool.execute('INSERT INTO exercise_muscles (exerciseId, muscleGroup) VALUES (?, ?)', [exerciseId, muscle]);
            }
        }

        return true;
    } catch (error) {
        console.error('Error saving exercise:', error);
        return false;
    }
}

// Settings-related functions
export async function getSettings(userId: number): Promise<model.UserSettings> {
    try {
        const [rows] = await pool.execute('SELECT * FROM user_settings WHERE userId = ?', [userId]);
        const settings = (rows as any[])[0];

        if (!settings) {
            // Return default settings if none exist
            return {
                mode: "darkmode",
                viewing: {
                    realTimeStats: true,
                    sessionStats: false,
                    longtermStats: false
                },
                devMode: false,
                viewingExercises: "all"
            };
        }

        return {
            mode: settings.mode,
            viewing: {
                realTimeStats: Boolean(settings.realTimeStats),
                sessionStats: Boolean(settings.sessionStats),
                longtermStats: Boolean(settings.longtermStats)
            },
            devMode: Boolean(settings.devMode),
            viewingExercises: settings.viewingExercises
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return {
            mode: "darkmode",
            viewing: { realTimeStats: true, sessionStats: false, longtermStats: false },
            devMode: false,
            viewingExercises: "all"
        };
    }
}

export async function saveSettings(userId: number, settings: model.UserSettings): Promise<boolean> {
    try {
        await pool.execute(`
            INSERT INTO user_settings 
            (userId, mode, realTimeStats, sessionStats, longtermStats, devMode, viewingExercises)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                mode = VALUES(mode),
                realTimeStats = VALUES(realTimeStats),
                sessionStats = VALUES(sessionStats),
                longtermStats = VALUES(longtermStats),
                devMode = VALUES(devMode),
                viewingExercises = VALUES(viewingExercises)
        `, [
            userId,
            settings.mode,
            settings.viewing.realTimeStats ? 1 : 0,
            settings.viewing.sessionStats ? 1 : 0,
            settings.viewing.longtermStats ? 1 : 0,
            settings.devMode ? 1 : 0,
            settings.viewingExercises
        ]);

        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Training unit functions (for sessions)
export async function saveTrainingUnit(userId: number, start: Date, end?: Date): Promise<number> {
    try {
        const [result] = await pool.execute(`
            INSERT INTO training_units (userId, startTime, endTime)
            VALUES (?, ?, ?)
        `, [
            userId,
            start.toISOString(),
            end ? end.toISOString() : null
        ]);

        return (result as any).insertId;
    } catch (error) {
        console.error('Error saving training unit:', error);
        throw error;
    }
}

// Session functions (only save, not retrieve as per requirements)
export async function saveSession(session: { start: Date; end?: Date; trainingUnitId?: number }): Promise<number> {
    try {
        const [result] = await pool.execute(`
            INSERT INTO sessions (trainingUnitId, startTime, endTime)
            VALUES (?, ?, ?)
        `, [
            session.trainingUnitId,
            session.start.toISOString(),
            session.end ? session.end.toISOString() : null
        ]);

        return (result as any).insertId;
    } catch (error) {
        console.error('Error saving session:', error);
        throw error;
    }
}

export async function saveSessionExercise(sessionId: number, exerciseId: number): Promise<boolean> {
    try {
        await pool.execute(`
            INSERT INTO session_exercises (sessionId, exerciseId, startTime)
            VALUES (?, ?, ?)
        `, [sessionId, exerciseId, new Date().toISOString()]);
        return true;
    } catch (error) {
        console.error('Error saving session exercise:', error);
        return false;
    }
}

// Training data functions (sensor data upload only)
export async function saveTrainingData(data: {
    time: Date;
    sensorId: number;
    userId: number;
    sessionId: number;
    stress: number;
}): Promise<boolean> {
    try {
        await pool.execute(`
            INSERT INTO training_data (sessionId, timestamp, heartRate)
            VALUES (?, ?, ?)
        `, [data.sessionId, data.time.toISOString(), data.stress]);

        stmt.run(data.sessionId, data.time.toISOString(), data.stress);
        return true;
    } catch (error) {
        console.error('Error saving training data:', error);
        return false;
    }
}

// Sensor functions
export async function getSensorByMac(macAddress: string): Promise<{ id: number; type: string } | null> {
    try {
        const [rows] = await pool.execute('SELECT sensorId as id, sensorType as type FROM sensors WHERE macAddress = ?', [macAddress]);
        const sensor = (rows as any[])[0];
        return sensor || null;
    } catch (error) {
        console.error('Error getting sensor by MAC:', error);
        return null;
    }
}

export async function saveSensor(sensor: { macAddress: string; type: string }, userId?: number): Promise<number> {
    try {
        const [result] = await pool.execute(`
            INSERT INTO sensors (userId, macAddress, sensorType)
            VALUES (?, ?, ?)
        `, [userId || 1, sensor.macAddress, sensor.type]);

        return (result as any).insertId;
    } catch (error) {
        console.error('Error saving sensor:', error);
        throw error;
    }
}

// Muscle functions
export async function getMuscles(): Promise<{ name: string; muscleGroup: string }[]> {
    try {
        // Return predefined muscle groups
        return [
            { name: "Chest", muscleGroup: "Upper Body" },
            { name: "Back", muscleGroup: "Upper Body" },
            { name: "Shoulders", muscleGroup: "Upper Body" },
            { name: "Biceps", muscleGroup: "Upper Body" },
            { name: "Triceps", muscleGroup: "Upper Body" },
            { name: "Forearms", muscleGroup: "Upper Body" },
            { name: "Abs", muscleGroup: "Core" },
            { name: "Obliques", muscleGroup: "Core" },
            { name: "Lower Back", muscleGroup: "Core" },
            { name: "Quadriceps", muscleGroup: "Lower Body" },
            { name: "Hamstrings", muscleGroup: "Lower Body" },
            { name: "Glutes", muscleGroup: "Lower Body" },
            { name: "Calves", muscleGroup: "Lower Body" }
        ];
    } catch (error) {
        console.error('Error getting muscles:', error);
        return [];
    }
}