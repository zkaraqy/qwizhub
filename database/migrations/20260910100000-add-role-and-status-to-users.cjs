const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM types first
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_users_role" AS ENUM ('peneliti', 'responden');`
        ).catch(() => {
            console.log('enum_users_role type may already exist');
        });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_users_verification_status" AS ENUM ('unverified', 'pending', 'verified');`
        ).catch(() => {
            console.log('enum_users_verification_status type may already exist');
        });

        // Add role column to users table
        await queryInterface.addColumn('users', 'role', {
            type: DataTypes.ENUM('peneliti', 'responden'),
            allowNull: false,
            defaultValue: 'responden'
        });

        // Add verification_status column to users table
        await queryInterface.addColumn('users', 'verification_status', {
            type: DataTypes.ENUM('unverified', 'pending', 'verified'),
            allowNull: false,
            defaultValue: 'unverified'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'role');
        await queryInterface.removeColumn('users', 'verification_status');

        // Drop ENUM types
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_verification_status";');
    },
};
