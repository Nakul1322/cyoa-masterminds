const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");
const { renderFile } = require("ejs");

const sendEmail = async (file, email, subject, link) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    renderFile(`${appRoot}/views/${file}`, { link }, (err, dataTemplate) => {
      if (err) {
        console.log(err);
      } else {
        transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to: email,
          subject: subject,
          html: dataTemplate,
        });
      }
    });
    console.log("Email sent")
  } catch (error) {
    console.log("email not sent", error);
  }
};

module.exports = sendEmail;
