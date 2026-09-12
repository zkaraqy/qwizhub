const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Add variable_id column
            await queryInterface.addColumn('questions', 'variable_id', {
                type: DataTypes.TEXT,
                allowNull: true,
                references: {
                    model: 'research_variables',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });

            // Add indicator_id column
            await queryInterface.addColumn('questions', 'indicator_id', {
                type: DataTypes.TEXT,
                allowNull: true,
                references: {
                    model: 'variable_indicators',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });

            // Add ai_review column (JSONB to store review results)
            await queryInterface.addColumn('questions', 'ai_review', {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                field: 'ai_review'
            }, { transaction });

            // Add ai_suggestions column (JSONB to store rewrite suggestions)
            await queryInterface.addColumn('questions', 'ai_suggestions', {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                field: 'ai_suggestions'
            }, { transaction });

            // Add recommended_scale_type column
            await queryInterface.addColumn('questions', 'recommended_scale_type', {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'recommended_scale_type'
            }, { transaction });

            // Add indexes for better query performance
            await queryInterface.addIndex('questions', ['variable_id'], {
                name: 'questions_variable_id_idx',
                transaction
            });

            await queryInterface.addIndex('questions', ['indicator_id'], {
                name: 'questions_indicator_id_idx',
                transaction
            });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            await queryInterface.removeIndex('questions', 'questions_indicator_id_idx', { transaction });
            await queryInterface.removeIndex('questions', 'questions_variable_id_idx', { transaction });
            await queryInterface.removeColumn('questions', 'recommended_scale_type', { transaction });
            await queryInterface.removeColumn('questions', 'ai_suggestions', { transaction });
            await queryInterface.removeColumn('questions', 'ai_review', { transaction });
            await queryInterface.removeColumn('questions', 'indicator_id', { transaction });
            await queryInterface.removeColumn('questions', 'variable_id', { transaction });
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
