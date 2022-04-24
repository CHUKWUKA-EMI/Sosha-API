const { Router, json, urlencoded } = require("express");
const jwt = require("jsonwebtoken");
const models = require("../DB/database");
require("dotenv").config();

const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

router.get("/:token", async (req, res, next) => {
  const { token } = req.params;
  console.log("token", token);
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    if (id) {
      const user = await models.User.findOne({ where: { id } });
      if (user) {
        await user.update({ activated: true });
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }
      return res.send(`User with ID ${id} not found`);
    }
    return res.send("Invalid token");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
