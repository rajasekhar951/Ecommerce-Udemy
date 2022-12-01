const Sequelize = require('sequelize');

const sequelize = new Sequelize("EcommerceApp", "rajasekharvemula", "Goldtre9", {dialect : "mysql"});

module.exports = {sequelize};