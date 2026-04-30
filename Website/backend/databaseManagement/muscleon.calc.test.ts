// import { startOrResumeSession, resumeExercise, stopExercise } from './muscleon.calc';
// import * as db from './muscleon.db';
// import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// jest.mock('./muscleon.db');

// describe('Session Management', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should start a new session', async () => {
//     (db.saveTrainingUnit as jest.Mock).mockResolvedValue(1);
//     (db.saveSession as jest.Mock).mockResolvedValue(1);

//     await startOrResumeSession();
//     expect(db.saveTrainingUnit).toHaveBeenCalled();
//     expect(db.saveSession).toHaveBeenCalled();
//   });
// });