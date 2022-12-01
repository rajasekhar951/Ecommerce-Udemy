const Sequelize = require("sequelize");
const { sequelize } = require("../DB/db");

// courses table schema
const Courses = sequelize.define(
  "Courses",
  {
    course_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdby: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    course_category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    course_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    course_image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    course_description: {
      type: Sequelize.STRING,
    },
    course_runtime: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    course_price: {
      type: Sequelize.INTEGER,
    },
    course_rating: {
      type: Sequelize.INTEGER,
    },
  },
  {
    tableName: "Courses",
  }
);

Courses.sync();

module.exports = { Courses };
