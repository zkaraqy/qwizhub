const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Create ENUM type for honor withdrawal status
            await queryInterface.sequelize.query(
                `CREATE TYPE "enum_honor_withdrawals_status" AS ENUM ('sent', 'paid');`,
                { transaction }
            ).catch(() => {
                console.log('enum_honor_withdrawals_status type may already exist');
            });

            // Create honor_withdrawals table
            await queryInterface.createTable('honor_withdrawals', {
                id: {
                    type: DataTypes.TEXT,
                    primaryKey: true,
                    allowNull: false,
                    unique: true
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
                    allowNull: false
                },
                status: {
                    type: DataTypes.ENUM('sent', 'paid'),
                    allowNull: false,
                    defaultValue: 'sent'
                },
                phoneNumber: {
                    type: DataTypes.TEXT,
                    field: 'phone_number',
                    allowNull: false
                },
                notes: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'created_at',
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    field: 'updated_at',
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                processedAt: {
                    type: DataTypes.DATE,
                    field: 'processed_at',
                    allowNull: true
                },
                processedBy: {
                    type: DataTypes.TEXT,
                    field: 'processed_by',
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                }
            }, { transaction });

            // Add constraint for minimum amount
            await queryInterface.sequelize.query(
                `ALTER TABLE honor_withdrawals ADD CONSTRAINT check_min_amount CHECK (amount >= 50000);`,
                { transaction }
            );

            // Add index on respondent_id for user's withdrawal history
            await queryInterface.addIndex('honor_withdrawals', ['respondent_id'], {
                name: 'honor_withdrawals_respondent_id_idx',
                transaction
            });

            // Add index on status for filtering
            await queryInterface.addIndex('honor_withdrawals', ['status'], {
                name: 'honor_withdrawals_status_idx',
                transaction
            });

            // Add index on created_at for sorting
            await queryInterface.addIndex('honor_withdrawals', ['created_at'], {
                name: 'honor_withdrawals_created_at_idx',
                transaction
            });

            // Add composite index for admin queries
            await queryInterface.addIndex('honor_withdrawals', ['status', 'created_at'], {
                name: 'honor_withdrawals_status_created_idx',
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
            await queryInterface.dropTable('honor_withdrawals', { transaction });
            
            // Drop ENUM type
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_honor_withdrawals_status";',
                { transaction }
            );
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
