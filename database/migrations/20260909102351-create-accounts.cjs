const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('accounts', {
            id: {
                type: DataTypes.TEXT,
                field: 'id',
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.TEXT,
                field: 'user_id'
            },
            type: {
                type: DataTypes.TEXT,
                field: 'type'
            },
            provider: {
                type: DataTypes.TEXT,
                field: 'provider'
            },
            providerAccountId: {
                type: DataTypes.TEXT,
                field: 'provider_account_id'
            },
            refreshToken: {
                type: DataTypes.TEXT,
                field: 'refresh_token'
            },
            accessToken: {
                type: DataTypes.TEXT,
                field: 'access_token'
            },
            expiresAt: {
                type: DataTypes.INTEGER,
                field: 'expires_at'
            },
            tokenType: {
                type: DataTypes.TEXT,
                field: 'token_type'
            },
            scope: {
                type: DataTypes.TEXT,
                field: 'scope'
            },
            idToken: {
                type: DataTypes.TEXT,
                field: 'id_token'
            },
            sessionState: {
                type: DataTypes.TEXT,
                field: 'session_state'
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('accounts');
    },
};