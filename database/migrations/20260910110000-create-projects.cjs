const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM type for project status
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_projects_status" AS ENUM ('draft', 'published', 'closed');`
        ).catch(() => {
            console.log('enum_projects_status type may already exist');
        });

        await queryInterface.createTable('projects', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            penelitiId: {
                type: DataTypes.TEXT,
                field: 'peneliti_id',
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            title: {
                type: DataTypes.TEXT,
                field: 'title',
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                field: 'description',
                allowNull: true
            },
            targetRespondents: {
                type: DataTypes.JSONB,
                field: 'target_respondents',
                allowNull: true,
                defaultValue: {}
            },
            status: {
                type: DataTypes.ENUM('draft', 'published', 'closed'),
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

        // Add index on peneliti_id for fast lookup
        await queryInterface.addIndex('projects', ['peneliti_id'], {
            name: 'projects_peneliti_id_idx'
        });

        // Add index on status for filtering
        await queryInterface.addIndex('projects', ['status'], {
            name: 'projects_status_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('projects');

        // Drop ENUM type
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_status";');
    },
};
