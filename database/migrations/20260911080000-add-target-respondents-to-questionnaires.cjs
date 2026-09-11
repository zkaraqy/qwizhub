const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Add targetRespondents field
            await queryInterface.addColumn('questionnaires', 'target_respondents', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'target_respondents'
            }, { transaction });

            // Add currentResponses field
            await queryInterface.addColumn('questionnaires', 'current_responses', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'current_responses'
            }, { transaction });

            // Add index for efficient querying of available questionnaires
            await queryInterface.addIndex('questionnaires', 
                ['status', 'current_responses', 'target_respondents'], 
                {
                    name: 'questionnaires_availability_idx',
                    transaction
                }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            await queryInterface.removeIndex('questionnaires', 'questionnaires_availability_idx', { transaction });
            await queryInterface.removeColumn('questionnaires', 'current_responses', { transaction });
            await queryInterface.removeColumn('questionnaires', 'target_respondents', { transaction });
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
