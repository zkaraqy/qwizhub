const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.TEXT,
                field: 'name'
            },
            email: {
                type: DataTypes.TEXT,
                field: 'email',
                unique: true
            },
            emailVerified: {
                type: DataTypes.DATE,
                field: 'email_verified',
                allowNull: true
            },
            image: {
                type: DataTypes.TEXT,
                field: 'image'
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
        await queryInterface.dropTable('users');
    },
};