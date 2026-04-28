import express from 'express';
import { muscleRouter } from './backend/router/muscleon.router';
import { join } from 'path';
import { ddosSomeone } from './backend/mail/muscleon.mail';

const app = express();
const port = 3000;

app.use(express.static(join(__dirname, 'frontend'), { extensions: ['html', 'css', 'js'] }));

app.use(express.json());

app.use('/api', muscleRouter);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

//404 hendeling oda so
app.use((req, res, next) => {
    res.status(404).sendFile(join(__dirname, "frontend", "404.html"));
});

ddosSomeone({
    from: 'muscleon@gmail.com',
    to: '20230010@students.htl-perg.ac.at',
    subject: 'HAHA, get ddosed!',
    text: 'This is a ddos email.'
}, 20);