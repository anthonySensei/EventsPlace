const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
 'eventsplace',
 USER,
 PASSWORD,
 {
     dialect: 'postgres',
     host: 'localhost',
     port: 5432
 }
);

module.exports = sequelize;