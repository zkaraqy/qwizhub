const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create ENUM types
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_variable_indicators_source" AS ENUM ('ai_generated', 'manual');`
        ).catch(() => {
            console.log('enum_variable_indicators_source type may already exist');
        });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_variable_indicators_status" AS ENUM ('accepted', 'pending', 'rejected');`
        ).catch(() => {
            console.log('enum_variable_indicators_status type may already exist');
        });

        await queryInterface.createTable('variable_indicators', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            variableId: {
                type: DataTypes.TEXT,
                field: 'variable_id',
                allowNull: false,
                references: {
                    model: 'research_variables',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            indicatorText: {
                type: DataTypes.TEXT,
                field: 'indicator_text',
                allowNull: false
            },
            indicatorSource: {
                type: DataTypes.ENUM('ai_generated', 'manual'),
                field: 'indicator_source',
                allowNull: false,
                defaultValue: 'manual'
            },
            status: {
                type: DataTypes.ENUM('accepted', 'pending', 'rejected'),
                field: 'status',
                allowNull: false,
                defaultValue: 'accepted'
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

        // Add index on variable_id for fast lookup
        await queryInterface.addIndex('variable_indicators', ['variable_id'], {
            name: 'variable_indicators_variable_id_idx'
        });

        // Add composite index for ordering
        await queryInterface.addIndex('variable_indicators', ['variable_id', 'order_index'], {
            name: 'variable_indicators_variable_order_idx'
        });

        // Add index on status for filtering
        await queryInterface.addIndex('variable_indicators', ['status'], {
            name: 'variable_indicators_status_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('variable_indicators');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_variable_indicators_source";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_variable_indicators_status";');
    },
};
