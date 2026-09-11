const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Add totalQuestionnairesAnswered field
            await queryInterface.addColumn('users', 'total_questionnaires_answered', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'total_questionnaires_answered'
            }, { transaction });

            // Add totalHonorEarned field
            await queryInterface.addColumn('users', 'total_honor_earned', {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'total_honor_earned'
            }, { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            await queryInterface.removeColumn('users', 'total_honor_earned', { transaction });
            await queryInterface.removeColumn('users', 'total_questionnaires_answered', { transaction });
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
