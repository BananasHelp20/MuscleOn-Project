import express from 'express';
import { muscleRouter } from './backend/router';
import { join } from 'path';

const app = express();
const port = 3000;

app.use(express.static(join(__dirname, 'frontend'), { extensions: ['html', 'css', 'js'] }));
app.use(express.json());
app.use('/', muscleRouter);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});