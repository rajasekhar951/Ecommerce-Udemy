const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { router } = require("./routes/routes");
const { sequelize } = require("./DB/db");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(router);

sequelize
  .authenticate()
  .then(() => {
    console.log("connect to DB successfully");
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`App is listening to port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("cannot connect to DB : " + err);
  });
