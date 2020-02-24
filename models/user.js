const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const User = sequelize.define('user_', {
    id: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
            notNull: { args: true, msg: "You must enter email" }
        },
        unique: {
            args: true,
            msg: 'Email address already in use'
        }   
    },
    profile_image: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    registration_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = User;


