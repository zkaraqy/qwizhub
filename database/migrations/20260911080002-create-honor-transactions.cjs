const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Create ENUM type for honor transaction status
            await queryInterface.sequelize.query(
                `CREATE TYPE "enum_honor_transactions_status" AS ENUM ('pending', 'paid', 'cancelled');`,
                { transaction }
            ).catch(() => {
                console.log('enum_honor_transactions_status type may already exist');
            });

            // Create honor_transactions table
            await queryInterface.createTable('honor_transactions', {
                id: {
                    type: DataTypes.TEXT,
                    field: 'id',
                    primaryKey: true,
                    allowNull: false,
                    unique: true
                },
                responseId: {
                    type: DataTypes.TEXT,
                    field: 'response_id',
                    allowNull: false,
                    unique: true,
                    references: {
                        model: 'responses',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                respondentId: {
                    type: DataTypes.TEXT,
                    field: 'respondent_id',
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                amount: {
                    type: DataTypes.INTEGER,
                    field: 'amount',
                    allowNull: false
                },
                status: {
                    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
                    field: 'status',
                    allowNull: false,
                    defaultValue: 'pending'
                },
                paidAt: {
                    type: DataTypes.DATE,
                    field: 'paid_at',
                    allowNull: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'created_at'
                }
            }, { transaction });

            // Add index on respondent_id for user's honor history
            await queryInterface.addIndex('honor_transactions', ['respondent_id'], {
                name: 'honor_transactions_respondent_id_idx',
                transaction
            });

            // Add index on status for processing
            await queryInterface.addIndex('honor_transactions', ['status'], {
                name: 'honor_transactions_status_idx',
                transaction
            });

            // Add composite index for respondent's paid honors
            await queryInterface.addIndex('honor_transactions', ['respondent_id', 'status', 'paid_at'], {
                name: 'honor_transactions_respondent_status_paid_idx',
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
            await queryInterface.dropTable('honor_transactions', { transaction });
            
            // Drop ENUM type
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_honor_transactions_status";',
                { transaction }
            );
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
