const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM types first
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_respondent_profiles_gender" AS ENUM ('male', 'female', 'other');`
        ).catch(() => {
            console.log('enum_respondent_profiles_gender type may already exist');
        });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_respondent_profiles_education_level" AS ENUM ('sd', 'smp', 'sma', 'd3', 's1', 's2', 's3');`
        ).catch(() => {
            console.log('enum_respondent_profiles_education_level type may already exist');
        });

        await queryInterface.createTable('respondent_profiles', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.TEXT,
                field: 'user_id',
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                field: 'date_of_birth',
                allowNull: true
            },
            gender: {
                type: DataTypes.ENUM('male', 'female', 'other'),
                field: 'gender',
                allowNull: true
            },
            profession: {
                type: DataTypes.TEXT,
                field: 'profession',
                allowNull: true
            },
            city: {
                type: DataTypes.TEXT,
                field: 'city',
                allowNull: true
            },
            province: {
                type: DataTypes.TEXT,
                field: 'province',
                allowNull: true
            },
            educationLevel: {
                type: DataTypes.ENUM('sd', 'smp', 'sma', 'd3', 's1', 's2', 's3'),
                field: 'education_level',
                allowNull: true
            },
            phoneNumber: {
                type: DataTypes.TEXT,
                field: 'phone_number',
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        });

        // Add index on user_id for fast lookups
        await queryInterface.addIndex('respondent_profiles', ['user_id'], {
            unique: true,
            name: 'respondent_profiles_user_id_unique'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('respondent_profiles');

        // Drop ENUM types
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_respondent_profiles_gender";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_respondent_profiles_education_level";');
    },
};
