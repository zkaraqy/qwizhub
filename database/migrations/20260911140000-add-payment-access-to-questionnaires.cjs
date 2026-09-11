const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Add paidForAccess field
            await queryInterface.addColumn('questionnaires', 'paid_for_access', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'paid_for_access'
            }, { transaction });

            // Add accessPaymentId field
            await queryInterface.addColumn('questionnaires', 'access_payment_id', {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'access_payment_id'
            }, { transaction });

            // Add accessPaymentDate field
            await queryInterface.addColumn('questionnaires', 'access_payment_date', {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'access_payment_date'
            }, { transaction });

            // Update existing questionnaires to have paidForAccess = true (grace period)
            await queryInterface.sequelize.query(
                `UPDATE questionnaires SET paid_for_access = true WHERE paid_for_access = false;`,
                { transaction }
            );

            // Add foreign key constraint for access_payment_id
            await queryInterface.addConstraint('questionnaires', {
                fields: ['access_payment_id'],
                type: 'foreign key',
                name: 'questionnaires_access_payment_id_fkey',
                references: {
                    table: 'transactions',
                    field: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
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
            await queryInterface.removeConstraint('questionnaires', 'questionnaires_access_payment_id_fkey', { transaction });
            await queryInterface.removeColumn('questionnaires', 'access_payment_date', { transaction });
            await queryInterface.removeColumn('questionnaires', 'access_payment_id', { transaction });
            await queryInterface.removeColumn('questionnaires', 'paid_for_access', { transaction });
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
