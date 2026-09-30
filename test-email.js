import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST.replace(/"/g, ''),
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER.replace(/"/g, ''),
    pass: process.env.SMTP_PASS.replace(/"/g, '')
  }
});

async function main() {
  try {
    console.log("Verifying connection to SMTP server...");
    await transporter.verify();
    console.log("Connection successful! Sending test email...");
    
    let fromEmail = process.env.EMAIL_FROM.replace(/"/g, '');
    if (!fromEmail.includes('@')) {
      fromEmail = `"${fromEmail}" <${process.env.SMTP_USER.replace(/"/g, '')}>`;
    }

    const info = await transporter.sendMail({
      from: fromEmail,
      to: process.env.SMTP_USER.replace(/"/g, ''),
      subject: "LUMORA - SMTP Test Email",
      text: "If you are receiving this, your SMTP configuration is working perfectly!",
      html: "<h3>Success!</h3><p>If you are receiving this, your SMTP configuration is working perfectly!</p>"
    });

    console.log("Test email sent successfully!");
    console.log("Message ID: " + info.messageId);
  } catch (error) {
    console.error("Error occurred:");
    console.error(error.message);
    process.exit(1);
  }
}

main();
