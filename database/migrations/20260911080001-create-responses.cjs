const DataTypes = require('sequelize').DataTypes;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        
        try {
            // Create ENUM type for response status
            await queryInterface.sequelize.query(
                `CREATE TYPE "enum_responses_status" AS ENUM ('in_progress', 'completed');`,
                { transaction }
            ).catch(() => {
                console.log('enum_responses_status type may already exist');
            });

            // Create responses table
            await queryInterface.createTable('responses', {
                id: {
                    type: DataTypes.TEXT,
                    field: 'id',
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
                answers: {
                    type: DataTypes.JSONB,
                    field: 'answers',
                    allowNull: false,
                    defaultValue: []
                },
                status: {
                    type: DataTypes.ENUM('in_progress', 'completed'),
                    field: 'status',
                    allowNull: false,
                    defaultValue: 'in_progress'
                },
                honorPaid: {
                    type: DataTypes.BOOLEAN,
                    field: 'honor_paid',
                    allowNull: false,
                    defaultValue: false
                },
                honorAmount: {
                    type: DataTypes.INTEGER,
                    field: 'honor_amount',
                    allowNull: false,
                    defaultValue: 0
                },
                startedAt: {
                    type: DataTypes.DATE,
                    field: 'started_at',
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                completedAt: {
                    type: DataTypes.DATE,
                    field: 'completed_at',
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

            // Add unique constraint: one respondent can only respond once per questionnaire
            await queryInterface.addConstraint('responses', {
                fields: ['questionnaire_id', 'respondent_id'],
                type: 'unique',
                name: 'responses_questionnaire_respondent_unique',
                transaction
            });

            // Add index on questionnaire_id for analytics
            await queryInterface.addIndex('responses', ['questionnaire_id'], {
                name: 'responses_questionnaire_id_idx',
                transaction
            });

            // Add index on respondent_id for user history
            await queryInterface.addIndex('responses', ['respondent_id'], {
                name: 'responses_respondent_id_idx',
                transaction
            });

            // Add index on status for filtering
            await queryInterface.addIndex('responses', ['status'], {
                name: 'responses_status_idx',
                transaction
            });

            // Add composite index for respondent's completed responses
            await queryInterface.addIndex('responses', ['respondent_id', 'status', 'completed_at'], {
                name: 'responses_respondent_status_completed_idx',
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
            await queryInterface.dropTable('responses', { transaction });
            
            // Drop ENUM type
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_responses_status";',
                { transaction }
            );
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
