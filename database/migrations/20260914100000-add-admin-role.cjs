const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add 'admin' value to existing enum
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'admin';
        `);
    },

    down: async (queryInterface, Sequelize) => {
        // Note: PostgreSQL doesn't support removing enum values directly
        // This would require recreating the enum type
        console.log('Removing enum values is not supported in PostgreSQL');
    }
};
