const Sequelize = require('sequelize');

const sequelize = require('../config/database');

const Post = sequelize.define('post_', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    post_image: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    event_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    event_location: {
        type: Sequelize.STRING,
        allowNull: false
    },
    event_time: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Post;