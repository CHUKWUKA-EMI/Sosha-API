const { Router } = require("express");
const models = require("../DB/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../services/email");
require("dotenv").config();

const router = Router();

router.post("/password_reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await models.User.findOne({ where: { email } });
    if (user) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const url = `${process.env.BACKEND_URL}/user/password_reset/${token}`;
      const message = `<h1>Reset Password</h1>
        <p>Click this <a href="${url}" target="_blank">link</a> to reset your password</p>
        `;
      sendEmail(
        `Admin<${process.env.SUPPORT_EMAIL}>`,
        email,
        "Reset Password",
        message
      );
      return res.status(200).json({
        message: "Password reset link has been sent to your email address",
      });
    }
    return res
      .status(404)
      .json({ message: `User with email: ${email} not found` });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/password_reset/:token", async (req, res, next) => {
  const { token } = req.params;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (id) {
      const user = await models.User.findOne({ where: { id } });
      if (user) {
        await user.update({ activated: true });
        return res.redirect(`${process.env.FRONTEND_URL}/change_password`);
      }
      return res.send(`User with ID ${id} not found`);
    }
    return res.send("Invalid token");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.patch("change_password", async (req, res) => {
  const { newPassword, email } = req.body;
  try {
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with email: ${email} not found` });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });
    return res.status(200).json({ message: "Password has been changed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
