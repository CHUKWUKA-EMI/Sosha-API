const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      sgMail.send({ to, subject, from, html }, (err, result) => {
        if (err) reject(err);

        resolve(result);
      });
    });
  },
};
