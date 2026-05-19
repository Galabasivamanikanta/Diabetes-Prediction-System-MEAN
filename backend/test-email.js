require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
    console.log("Testing email sending from meanstack backend...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"HealthPortal Clinical" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // sending to yourself for testing
            subject: 'Test Subject',
            text: 'Test body OTP 123456'
        });
        console.log("Success! Email sent:", info.response);
    } catch (err) {
        console.error("Error sending email:", err);
    }
}

test();
