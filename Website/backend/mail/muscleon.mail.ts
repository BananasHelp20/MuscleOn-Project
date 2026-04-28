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

export async function sendMail(mail: {from:string, to:string, subject:string, text:string}): Promise<boolean> {
    return new Promise((resolve) => {
        transporter.sendMail(mail, (error, info) => {
            if (error) {
                console.log('Error:', error);
                resolve(false);
            } else {
                console.log('Email sent:', info.response);
                resolve(true);
            }
        });
    });
}

export async function ddosSomeone(mail: {from:string, to:string, subject:string, text:string}, amount:number): Promise<void> {
    for (let i = 0; i < amount; i++) {
        await sendMail(mail);
    }
}

export async function validateMail(email:string):Promise<boolean | string> {
    let regex:RegExp = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
        console.log("doesn't match regex!");
        return false;
    }

    let random:string = randomInt(10000) + "";
    while (random.length != 4) {
        random = 0 + random;
    }

    if (!(await sendMail({
        from: muscleMail,
        to: email,
        subject: "MuscleON - Verify your Email!",
        text: "This is your verification Code: " + random
    }))) {
        return false;
    }

    return random;
}