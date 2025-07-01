const nodemailer = require("nodemailer");

const sendConfirmationEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Lynq Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Lynq!",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for applying to join the Lynq Creator Program! We're reviewing your application and will reach out soon.</p>
      <p>Meanwhile, stay awesome 🌟</p>
      <br/>
      <strong>– The Lynq Team</strong>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendConfirmationEmail;
