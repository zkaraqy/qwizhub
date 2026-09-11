const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Create ENUM type for transaction_type
            await queryInterface.sequelize.query(
                `CREATE TYPE "enum_transactions_transaction_type" AS ENUM ('questionnaire_access', 'questionnaire_publish');`,
                { transaction }
            ).catch(() => {
                console.log('enum_transactions_transaction_type type may already exist');
            });

            // Add transactionType field
            await queryInterface.addColumn('transactions', 'transaction_type', {
                type: DataTypes.ENUM('questionnaire_access', 'questionnaire_publish'),
                allowNull: false,
                defaultValue: 'questionnaire_publish',
                field: 'transaction_type'
            }, { transaction });

            // Add metadata field
            await queryInterface.addColumn('transactions', 'metadata', {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                field: 'metadata'
            }, { transaction });

            // Update existing transactions to have transaction_type = 'questionnaire_publish'
            await queryInterface.sequelize.query(
                `UPDATE transactions SET transaction_type = 'questionnaire_publish' WHERE transaction_type IS NULL;`,
                { transaction }
            );

            // Add index on transaction_type for filtering
            await queryInterface.addIndex('transactions', ['transaction_type'], {
                name: 'transactions_transaction_type_idx',
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
            await queryInterface.removeIndex('transactions', 'transactions_transaction_type_idx', { transaction });
            await queryInterface.removeColumn('transactions', 'metadata', { transaction });
            await queryInterface.removeColumn('transactions', 'transaction_type', { transaction });
            
            // Drop ENUM type
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_transactions_transaction_type";',
                { transaction }
            );
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
