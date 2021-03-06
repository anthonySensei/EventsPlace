const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Hashtag = sequelize.define('hashtag_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
});

module.exports = Hashtag;