const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (from, to, subject, html) => {
  try {
    return new Promise((resolve, reject) => {
      sgMail.send({ to, subject, from, html }, (err, result) => {
        if (err) {
          console.log("email error", ...err.response.body.errors);
          reject(err);
        } else {
          resolve(result);
          console.log("email sent");
        }
      });
    });
  } catch (error) {
    console.log("email error", error);
  }
};

module.exports = {
  sendEmail,
};
