const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('verification_tokens', {
            identifier: {
                type: DataTypes.TEXT,
                field: 'identifier',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            token: {
                type: DataTypes.TEXT,
                field: 'token',
                unique: true,
                allowNull: false
            },
            expires: {
                type: DataTypes.DATE,
                field: 'expires',
                allowNull: false
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
        await queryInterface.dropTable('verification_tokens');
    },
};