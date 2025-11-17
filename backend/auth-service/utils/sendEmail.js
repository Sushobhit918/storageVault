import nodemailer from "nodemailer";

const sendEmail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: message,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent:", error.message);
  }
};

export default sendEmail;
