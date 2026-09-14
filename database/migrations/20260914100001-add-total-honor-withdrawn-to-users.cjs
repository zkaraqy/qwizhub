const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add total_honor_withdrawn column to users table
        await queryInterface.addColumn('users', 'total_honor_withdrawn', {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the column
        await queryInterface.removeColumn('users', 'total_honor_withdrawn');
    }
};
