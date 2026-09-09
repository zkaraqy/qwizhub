const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('sessions', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            expires: {
                type: DataTypes.DATE,
                field: 'expires',
                allowNull: false
            },
            sessionToken: {
                type: DataTypes.TEXT,
                field: 'session_token',
                unique: true,
                allowNull: false
            },
            userId: {
                type: DataTypes.TEXT,
                field: 'user_id'
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('sessions');
    },
};