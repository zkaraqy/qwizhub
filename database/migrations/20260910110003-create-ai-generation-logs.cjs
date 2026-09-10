const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM types
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_ai_generation_logs_provider" AS ENUM ('gemini', 'openai');`
        ).catch(() => {
            console.log('enum_ai_generation_logs_provider type may already exist');
        });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_ai_generation_logs_status" AS ENUM ('success', 'failed', 'timeout');`
        ).catch(() => {
            console.log('enum_ai_generation_logs_status type may already exist');
        });

        await queryInterface.createTable('ai_generation_logs', {
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
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            questionnaireId: {
                type: DataTypes.TEXT,
                field: 'questionnaire_id',
                allowNull: true,
                references: {
                    model: 'questionnaires',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            provider: {
                type: DataTypes.ENUM('gemini', 'openai'),
                field: 'provider',
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('success', 'failed', 'timeout'),
                field: 'status',
                allowNull: false
            },
            requestPayload: {
                type: DataTypes.JSONB,
                field: 'request_payload',
                allowNull: true
            },
            responseData: {
                type: DataTypes.JSONB,
                field: 'response_data',
                allowNull: true
            },
            errorMessage: {
                type: DataTypes.TEXT,
                field: 'error_message',
                allowNull: true
            },
            executionTimeMs: {
                type: DataTypes.INTEGER,
                field: 'execution_time_ms',
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            }
        });

        // Add index on user_id and created_at for rate limiting check
        await queryInterface.addIndex('ai_generation_logs', ['user_id', 'created_at'], {
            name: 'ai_generation_logs_user_created_idx'
        });

        // Add index on created_at for audit trail queries
        await queryInterface.addIndex('ai_generation_logs', ['created_at'], {
            name: 'ai_generation_logs_created_idx'
        });

        // Add index on questionnaire_id for tracking
        await queryInterface.addIndex('ai_generation_logs', ['questionnaire_id'], {
            name: 'ai_generation_logs_questionnaire_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ai_generation_logs');

        // Drop ENUM types
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ai_generation_logs_provider";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ai_generation_logs_status";');
    },
};
