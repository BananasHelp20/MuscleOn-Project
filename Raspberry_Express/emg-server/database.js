const Database = require('better-sqlite3');
const db = new Database('/home/raspi/emg-server/emg.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR NOT NULL,
    weight REAL,
    height REAL,
    birthdate DATE
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY,
    dark_mode BOOLEAN DEFAULT 0,
    dev_mode BOOLEAN DEFAULT 0,
    realTime BOOLEAN DEFAULT 1,
    session BOOLEAN DEFAULT 1,
    longterm BOOLEAN DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS sensor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    macAddress VARCHAR NOT NULL UNIQUE,
    type VARCHAR NOT NULL
  );

  CREATE TABLE IF NOT EXISTS muscle (
    name VARCHAR PRIMARY KEY,
    muscleGroup VARCHAR NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by INTEGER,
    public BOOLEAN NOT NULL DEFAULT 1,
    name VARCHAR NOT NULL,
    description VARCHAR,
    equipment VARCHAR,
    weight_needed BOOLEAN NOT NULL DEFAULT 0,
    exercise_type VARCHAR NOT NULL,
    FOREIGN KEY (created_by) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS exercises_muscle (
    exerciseId INTEGER NOT NULL,
    muscle VARCHAR NOT NULL,
    PRIMARY KEY (exerciseId, muscle),
    FOREIGN KEY (exerciseId) REFERENCES exercises(id),
    FOREIGN KEY (muscle) REFERENCES muscle(name)
  );

  CREATE TABLE IF NOT EXISTS trainingUnit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    start DATETIME,
    end DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start DATETIME NOT NULL,
    end DATETIME,
    training_unit INTEGER,
    FOREIGN KEY (training_unit) REFERENCES trainingUnit(id)
  );

  CREATE TABLE IF NOT EXISTS session_exercise (
    sessionId INTEGER NOT NULL,
    exerciseId INTEGER NOT NULL,
    PRIMARY KEY (sessionId, exerciseId),
    FOREIGN KEY (sessionId) REFERENCES session(id),
    FOREIGN KEY (exerciseId) REFERENCES exercises(id)
  );

  CREATE TABLE IF NOT EXISTS trainingData (
    time DATETIME NOT NULL,
    sensor_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    stress REAL NOT NULL,
    PRIMARY KEY (time, sensor_id),
    FOREIGN KEY (sensor_id) REFERENCES sensor(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (session_id) REFERENCES session(id)
  );
`);

// Basis Muskeln einfügen
const muscles = [
  { name: 'Biceps',       group: 'Arms' },
  { name: 'Triceps',      group: 'Arms' },
  { name: 'Chest',        group: 'Upper Body' },
  { name: 'Back',         group: 'Upper Body' },
  { name: 'Shoulders',    group: 'Upper Body' },
  { name: 'Abdominals',   group: 'Core' },
  { name: 'Obliques',     group: 'Core' },
  { name: 'Lower Back',   group: 'Core' },
  { name: 'Quadriceps',   group: 'Legs' },
  { name: 'Hamstrings',   group: 'Legs' },
  { name: 'Glutes',       group: 'Legs' },
  { name: 'Calves',       group: 'Legs' },
];

const insertMuscle = db.prepare(`
  INSERT OR IGNORE INTO muscle (name, muscleGroup) VALUES (?, ?)
`);
for (const m of muscles) {
  insertMuscle.run(m.name, m.group);
}

module.exports = db;
