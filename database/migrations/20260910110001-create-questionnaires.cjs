const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM type for questionnaire status
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_questionnaires_status" AS ENUM ('draft', 'published');`
        ).catch(() => {
            console.log('enum_questionnaires_status type may already exist');
        });

        await queryInterface.createTable('questionnaires', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            projectId: {
                type: DataTypes.TEXT,
                field: 'project_id',
                allowNull: false,
                references: {
                    model: 'projects',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            topic: {
                type: DataTypes.TEXT,
                field: 'topic',
                allowNull: false
            },
            researchObjective: {
                type: DataTypes.TEXT,
                field: 'research_objective',
                allowNull: false
            },
            variables: {
                type: DataTypes.JSONB,
                field: 'variables',
                allowNull: false,
                defaultValue: []
            },
            status: {
                type: DataTypes.ENUM('draft', 'published'),
                field: 'status',
                allowNull: false,
                defaultValue: 'draft'
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

        // Add index on project_id for fast lookup
        await queryInterface.addIndex('questionnaires', ['project_id'], {
            name: 'questionnaires_project_id_idx'
        });

        // Add index on status
        await queryInterface.addIndex('questionnaires', ['status'], {
            name: 'questionnaires_status_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('questionnaires');

        // Drop ENUM type
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_questionnaires_status";');
    },
};
