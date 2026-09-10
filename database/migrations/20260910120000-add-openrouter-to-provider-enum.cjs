const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add 'openrouter' to provider enum
        await queryInterface.sequelize.query(
            `ALTER TYPE "enum_ai_generation_logs_provider" ADD VALUE IF NOT EXISTS 'openrouter';`
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Note: PostgreSQL doesn't support removing enum values directly
        // You would need to recreate the enum type if you want to remove a value
        console.log('Cannot remove enum value in PostgreSQL. Manual intervention required if rollback needed.');
    },
};
