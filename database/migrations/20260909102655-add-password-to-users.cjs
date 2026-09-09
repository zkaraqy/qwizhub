const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add password column to users table
        await queryInterface.addColumn('users', 'password', {
            type: DataTypes.TEXT,
            allowNull: true,
            after: 'image'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove password column from users table
        await queryInterface.removeColumn('users', 'password');
    },
};
