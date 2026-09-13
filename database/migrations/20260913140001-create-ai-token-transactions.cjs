'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_token_transactions', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('credit', 'debit'),
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      balance_before: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      balance_after: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reference_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reference_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      midtrans_order_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      midtrans_status: {
        type: Sequelize.ENUM('pending', 'success', 'failed'),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index for faster user-based queries
    await queryInterface.addIndex('ai_token_transactions', ['user_id']);
    await queryInterface.addIndex('ai_token_transactions', ['midtrans_order_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ai_token_transactions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ai_token_transactions_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ai_token_transactions_midtrans_status"');
  }
};
