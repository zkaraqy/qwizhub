const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM type for variable type
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_research_variables_variable_type" AS ENUM ('independent', 'dependent', 'moderating', 'intervening', 'control');`
        ).catch(() => {
            console.log('enum_research_variables_variable_type type may already exist');
        });

        await queryInterface.createTable('research_variables', {
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
            variableName: {
                type: DataTypes.TEXT,
                field: 'variable_name',
                allowNull: false
            },
            variableType: {
                type: DataTypes.ENUM('independent', 'dependent', 'moderating', 'intervening', 'control'),
                field: 'variable_type',
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                field: 'description',
                allowNull: true
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                field: 'order_index',
                allowNull: false,
                defaultValue: 0
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

        // Add index on questionnaire_id for fast lookup
        await queryInterface.addIndex('research_variables', ['questionnaire_id'], {
            name: 'research_variables_questionnaire_id_idx'
        });

        // Add composite index for ordering
        await queryInterface.addIndex('research_variables', ['questionnaire_id', 'order_index'], {
            name: 'research_variables_questionnaire_order_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('research_variables');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_research_variables_variable_type";');
    },
};
