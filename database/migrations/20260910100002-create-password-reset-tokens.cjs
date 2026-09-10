const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('password_reset_tokens', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
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
            token: {
                type: DataTypes.TEXT,
                field: 'token',
                allowNull: false,
                unique: true
            },
            expires: {
                type: DataTypes.DATE,
                field: 'expires',
                allowNull: false
            },
            used: {
                type: DataTypes.BOOLEAN,
                field: 'used',
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        });

        // Add index on token for fast lookups
        await queryInterface.addIndex('password_reset_tokens', ['token'], {
            unique: true,
            name: 'password_reset_tokens_token_unique'
        });

        // Add index on user_id
        await queryInterface.addIndex('password_reset_tokens', ['user_id'], {
            name: 'password_reset_tokens_user_id_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('password_reset_tokens');
    },
};
