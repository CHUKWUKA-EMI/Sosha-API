require("dotenv").config();

const credentials = {
  apiKey: process.env.AFRICAS_TALKING_API_KEY,
  username: process.env.AFRICAS_TALKING_USERNAME,
};

const Africastalking = require("africastalking")(credentials);

const sendSMS = async ({ to, message }) => {
  const sms = Africastalking.SMS;
  const options = {
    to,
    message,
  };
  try {
    const response = await sms.send(options);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

// sendSMS({ to: ["+2347034969842"], message: "Hello World" });

module.exports = { sendSMS };
