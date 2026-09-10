const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM types
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_questions_question_type" AS ENUM ('multiple_choice', 'text', 'rating_scale', 'checkbox', 'dropdown');`
        ).catch(() => {
            console.log('enum_questions_question_type type may already exist');
        });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_questions_scale_type" AS ENUM ('likert_5', 'likert_7', 'guttman', 'custom');`
        ).catch(() => {
            console.log('enum_questions_scale_type type may already exist');
        });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_questions_source" AS ENUM ('ai_generated', 'manual');`
        ).catch(() => {
            console.log('enum_questions_source type may already exist');
        });

        await queryInterface.createTable('questions', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            questionnaireId: {
                type: DataTypes.TEXT,
                field: 'questionnaire_id',
                allowNull: false,
                references: {
                    model: 'questionnaires',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            questionText: {
                type: DataTypes.TEXT,
                field: 'question_text',
                allowNull: false
            },
            questionType: {
                type: DataTypes.ENUM('multiple_choice', 'text', 'rating_scale', 'checkbox', 'dropdown'),
                field: 'question_type',
                allowNull: false
            },
            scaleType: {
                type: DataTypes.ENUM('likert_5', 'likert_7', 'guttman', 'custom'),
                field: 'scale_type',
                allowNull: true
            },
            options: {
                type: DataTypes.JSONB,
                field: 'options',
                allowNull: true,
                defaultValue: []
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                field: 'order_index',
                allowNull: false,
                defaultValue: 0
            },
            source: {
                type: DataTypes.ENUM('ai_generated', 'manual'),
                field: 'source',
                allowNull: false,
                defaultValue: 'manual'
            },
            biasDetected: {
                type: DataTypes.BOOLEAN,
                field: 'bias_detected',
                allowNull: false,
                defaultValue: false
            },
            biasNotes: {
                type: DataTypes.TEXT,
                field: 'bias_notes',
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

        // Add composite index on questionnaire_id and order_index for sorting
        await queryInterface.addIndex('questions', ['questionnaire_id', 'order_index'], {
            name: 'questions_questionnaire_id_order_idx'
        });

        // Add index on questionnaire_id for fast lookup
        await queryInterface.addIndex('questions', ['questionnaire_id'], {
            name: 'questions_questionnaire_id_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('questions');

        // Drop ENUM types
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_questions_question_type";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_questions_scale_type";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_questions_source";');
    },
};
