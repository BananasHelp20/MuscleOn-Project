//.db.ts
import * as sql from 'mysql2';
import * as model from '../model/muscleon.model';
import { pool } from './database';

// User-related functions
export async function getUserById(userId: number): Promise<model.UserProperties | null> {
    try {
        const [rows] = await pool.execute('SELECT * FROM user WHERE id = ?', [userId]);
        const user = (rows as any[])[0];
        
        if (!user) return null;

        // Check if user has created plan (any training units)
        const [planRows] = await pool.execute('SELECT COUNT(*) > 0 as createdPlan FROM trainingUnit WHERE user_id = ?', [userId]);
        const createdPlan = (planRows as any[])[0]?.createdPlan || false;

        return {
            userId: user.id,
            userName: user.username,
            password: user.password_hash,
            email: user.email,
            weight: user.weight,
            size: user.height,
            birthday: user.birthdate,
            currentlyTraining: false, // ignore for now
            verifiedEmail: false, // ignore for now
            createdPlan: createdPlan,
            currentlyInExercise: false // ignore for now
        };
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}

export async function getUserByEmail(email: string): Promise<model.UserProperties | null> {
    try {
        const [rows] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
        const user = (rows as any[])[0];
        
        if (!user) return null;

        // Check if user has created plan (any training units)
        const [planRows] = await pool.execute('SELECT COUNT(*) > 0 as createdPlan FROM trainingUnit WHERE user_id = ?', [user.id]);
        const createdPlan = (planRows as any[])[0]?.createdPlan || false;

        return {
            userId: user.id,
            userName: user.username,
            password: user.password_hash,
            email: user.email,
            weight: user.weight,
            size: user.height,
            birthday: user.birthdate,
            currentlyTraining: false, // ignore for now
            verifiedEmail: false, // ignore for now
            createdPlan: createdPlan,
            currentlyInExercise: false // ignore for now
        };
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
}

export async function saveUser(user: model.UserProperties): Promise<boolean> {
    try {
        await pool.execute(`
            INSERT INTO user 
            (id, username, password_hash, email, weight, height, birthdate)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                password_hash = VALUES(password_hash),
                email = VALUES(email),
                weight = VALUES(weight),
                height = VALUES(height),
                birthdate = VALUES(birthdate)
        `, [
            user.userId,
            user.userName,
            user.password,
            user.email,
            user.weight,
            user.size,
            user.birthday
        ]);

        // Also create default settings if not exists
        await pool.execute(`
            INSERT IGNORE INTO settings (user_id, dark_mode, dev_mode, realTime, session, longterm)
            VALUES (?, 1, 0, 1, 0, 0)
        `, [user.userId]);

        return true;
    } catch (error) {
        console.error('Error saving user:', error);
        return false;
    }
}

export async function deleteUser(userId: number): Promise<boolean> {
    try {
        await pool.execute('DELETE FROM user WHERE id = ?', [userId]);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

// Exercise-related functions
export async function getExercises(type: 'supported' | 'unsupported' | 'user', userId?: number): Promise<model.Exercise[]> {
    try {
        let query = 'SELECT * FROM exercises WHERE exercise_type = ?';
        const params: any[] = [type];

        if (type === 'user' && userId) {
            query += ' AND created_by = ?';
            params.push(userId);
        }

        const [rows] = await pool.execute(query, params);
        const exercises = rows as any[];

        // Fetch muscle groups for each exercise
        const result = await Promise.all(exercises.map(async (ex: any) => {
            const [musclesRows] = await pool.execute('SELECT muscle FROM exercises_muscle WHERE exerciseId = ?', [ex.id]);
            const muscles = (musclesRows as any[]).map((m: any) => m.muscle);

            return {
                name: ex.name,
                exerciseType: ex.exercise_type,
                description: ex.description,
                targetedMuscleGroups: muscles,
                equipment: ex.equipment ? ex.equipment.split(';') : [],
                userIdCreated: ex.created_by,
                public: Boolean(ex.public),
                weight: Boolean(ex.weight_needed) // use boolean for weight_needed
            };
        }));

        return result;
    } catch (error) {
        console.error('Error getting exercises:', error);
        return [];
    }
}

export async function saveExercise(exercise: model.Exercise, userId: number): Promise<boolean> {
    try {
        const equipmentStr = Array.isArray(exercise.equipment) ? exercise.equipment.join(';') : (exercise.equipment || '');
        const weightNeeded = exercise.weight === true ? 1 : 0;

        if (!exercise.description) exercise.description = '';

        const [result] = await pool.execute(`
            INSERT INTO exercises (name, description, exercise_type, created_by, public, equipment, weight_needed)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            exercise.name,
            exercise.description,
            exercise.exerciseType,
            userId,
            exercise.public ? true : false,
            equipmentStr,
            weightNeeded
        ]);

        const exerciseId = (result as any).insertId;

        // Save muscle groups
        if (exercise.targetedMuscleGroups && exercise.targetedMuscleGroups.length > 0) {
            for (const muscle of exercise.targetedMuscleGroups) {
                await pool.execute('INSERT INTO exercises_muscle (exerciseId, muscle) VALUES (?, ?)', [exerciseId, muscle]);
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
        const [rows] = await pool.execute('SELECT * FROM settings WHERE user_id = ?', [userId]);
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
            mode: settings.dark_mode ? "darkmode" : "lightmode",
            viewing: {
                realTimeStats: Boolean(settings.realTime),
                sessionStats: Boolean(settings.session),
                longtermStats: Boolean(settings.longterm)
            },
            devMode: Boolean(settings.dev_mode),
            viewingExercises: "all" // default
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
            INSERT INTO settings 
            (user_id, dark_mode, dev_mode, realTime, session, longterm)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                dark_mode = VALUES(dark_mode),
                dev_mode = VALUES(dev_mode),
                realTime = VALUES(realTime),
                session = VALUES(session),
                longterm = VALUES(longterm)
        `, [
            userId,
            settings.mode === "darkmode" ? 1 : 0,
            settings.devMode ? 1 : 0,
            settings.viewing.realTimeStats ? 1 : 0,
            settings.viewing.sessionStats ? 1 : 0,
            settings.viewing.longtermStats ? 1 : 0
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
            INSERT INTO trainingUnit (user_id, start, end)
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
        if (!session.trainingUnitId) session.trainingUnitId = -1;

        const [result] = await pool.execute(`
            INSERT INTO session (start, end, training_unit)
            VALUES (?, ?, ?)
        `, [
            session.start.toISOString(),
            session.end ? session.end.toISOString() : null,
            session.trainingUnitId
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
            INSERT INTO session_exercise (sessionId, exerciseId)
            VALUES (?, ?)
        `, [sessionId, exerciseId]);
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
    sessionId: number;
    stress: number;
}): Promise<boolean> {
    try {
        await pool.execute(`
            INSERT INTO trainingData (time, sensor_id, session_id, stress)
            VALUES (?, ?, ?, ?)
        `, [data.time.toISOString(), data.sensorId, data.sessionId, data.stress]);

        return true;
    } catch (error) {
        console.error('Error saving training data:', error);
        return false;
    }
}

// Sensor functions
export async function getSensorByMac(macAddress: string): Promise<{ id: number; type: string } | null> {
    try {
        const [rows] = await pool.execute('SELECT id, type FROM sensor WHERE macAddress = ?', [macAddress]);
        const sensor = (rows as any[])[0];
        return sensor || null;
    } catch (error) {
        console.error('Error getting sensor by MAC:', error);
        return null;
    }
}

export async function saveSensor(sensor: { macAddress: string; type: string }): Promise<number> {
    try {
        const [result] = await pool.execute(`
            INSERT INTO sensor (macAddress, type)
            VALUES (?, ?)
        `, [sensor.macAddress, sensor.type]);

        return (result as any).insertId;
    } catch (error) {
        console.error('Error saving sensor:', error);
        throw error;
    }
}

// Muscle functions
export async function getMuscles(): Promise<{ name: string; muscleGroup: string }[]> {
    try {
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

export async function getRawData(sessionId: number): Promise<{ stress: number, time: Date }[]>;
export async function getRawData(sessionId: number, userId: number): Promise<{ stress: number, time: Date }[]>;
export async function getRawData(userId: number): Promise<{ stress: number, time: Date }[]>;

export async function getRawData(sessionId?: number, userId?: number): Promise<{ stress: number, time: Date }[]> {
    if (!sessionId) {
        const [results] = await pool.execute(`
            SELECT td.stress, td.time FROM trainingData td
            JOIN session s ON td.session_id = s.id
            WHERE s.user_id = ?
            ORDER BY td.time ASC
        `, [userId!]);
        return (results as any[]).map(row => ({ stress: row.stress, time: new Date(row.time) }));
    }
    if (userId) {
        const [results] = await pool.execute(`
                SELECT stress, time FROM trainingData td
                JOIN session s ON td.session_id = s.id
                WHERE s.user_id = ? AND td.session_id = ?
                ORDER BY td.time ASC
            `, [userId, sessionId]);
        return (results as any[]).map(row => ({ stress: row.stress, time: new Date(row.time) }));
    } else {
        try {
            const [results] = await pool.execute(`
                SELECT stress, time FROM trainingData
                WHERE session_id = ?
                ORDER BY time ASC
            `, [sessionId]);
            return (results as any[]).map(row => ({ stress: row.stress, time: new Date(row.time) }));
        } catch (error) {
            console.error('Error getting raw data:', error);
            return [];
        }
    }
}
