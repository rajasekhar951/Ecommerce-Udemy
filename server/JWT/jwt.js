const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();

const createToken = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.user_id,
      role: user.user_role,
      name: user.user_name,
      email: user.email,
    },
    process.env.SECRET_ACCESS_TOKEN
  );
  return accessToken;
};

const validateToken = (req, res, next) => {
  console.log(req.body);
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  console.log(accessToken);

  if (accessToken === null) {
    return res
      .status(401)
      .json({ status: "unauthorized", error: "User not authenticated" });
  }
  try {
    const validation = jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN);
    if (validation) {
      req.user = validation;
      console.log(req.user);
      return next();
    }
  } catch (err) {
    return res.status(401).json({ status: "unauthorized", error: err.message });
  }
};

module.exports = { createToken, validateToken };
