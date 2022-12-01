const Sequelize = require("sequelize");
const { sequelize } = require("../DB/db");

const Enrollments = sequelize.define(
  "Enrollments",
  {
    enrollment_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    enrolledby: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    enrolled_course: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isCompleted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    rated: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "Enrollments",
    timestamps: false,
  }
);

Enrollments.sync();

module.exports = { Enrollments };
