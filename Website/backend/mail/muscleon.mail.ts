import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for port 587
    auth: {
        user: 'muscleonofficial@gmail.com',
        pass: 'wxju rlbd msdm vxqm'
    }
});

const muscleMail = 'muscleonofficial@gmail.com';

// const testMail = {
//     from: 'muscleonofficial@gmail.com',
//     to: '20230018@students.htl-perg.ac.at',
//     subject: "MusleON!",
//     text: "test"
// }

export function sendMail(mail: {from:string, to:string, subject:string, text:string}):boolean {
    transporter.sendMail(mail, (error, info) => {
        if (error) {
            console.log('Error:', error);
            return false;
        } else {
            console.log('Email sent:', info.response);
        }
    });
    return true;
}

export function validateMail(email:string):boolean | string {
    let regex:RegExp = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
        console.log("doesn't match regex!");
        return false;
    }

    let random:string = randomInt(10000) + "";
    while (random.length != 4) {
        random = 0 + random;
    }

    if (!sendMail({
        from: muscleMail,
        to: email,
        subject: "MuscleON - Verify your Email!",
        text: "This is your verification Code: " + random
    })) {
        return false;
    }

    return random;
}