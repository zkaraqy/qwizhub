const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Alter enum_questions_question_type
        // In PostgreSQL, to add values to an existing enum, we use ALTER TYPE ... ADD VALUE
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Check if enum exists and run ALTER TYPE
            // Catch error if values already exist
            const newValues = ['closed', 'mixed', 'likert', 'filter'];
            for (const value of newValues) {
                try {
                    await queryInterface.sequelize.query(
                        `ALTER TYPE "enum_questions_question_type" ADD VALUE '${value}';`,
                        { transaction }
                    );
                } catch (error) {
                    console.log(`Value ${value} might already exist in enum_questions_question_type`);
                }
            }

            // Create transactions table
            await queryInterface.createTable('transactions', {
                id: {
                    type: DataTypes.TEXT,
                    primaryKey: true,
                    allowNull: false,
                    unique: true
                },
                questionnaireId: {
                    type: DataTypes.TEXT,
                    field: 'questionnaire_id',
                    allowNull: false,
                    references: {
                        model: 'questionnaires',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                userId: {
                    type: DataTypes.TEXT,
                    field: 'user_id',
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
                targetRespondents: {
                    type: DataTypes.INTEGER,
                    field: 'target_respondents',
                    allowNull: false
                },
                honorariumPerRespondent: {
                    type: DataTypes.INTEGER,
                    field: 'honorarium_per_respondent',
                    allowNull: false
                },
                serviceFee: {
                    type: DataTypes.INTEGER,
                    field: 'service_fee',
                    allowNull: false
                },
                status: {
                    type: DataTypes.ENUM('pending', 'success', 'failed', 'expired'),
                    allowNull: false,
                    defaultValue: 'pending'
                },
                snapToken: {
                    type: DataTypes.TEXT,
                    field: 'snap_token',
                    allowNull: true
                },
                paymentUrl: {
                    type: DataTypes.TEXT,
                    field: 'payment_url',
                    allowNull: true
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'created_at'
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    field: 'updated_at'
                }
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
            await queryInterface.dropTable('transactions', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
