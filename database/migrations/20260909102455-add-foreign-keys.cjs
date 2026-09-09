const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {

        await queryInterface.addConstraint('accounts', {
            fields: ['user_id'],
            type: 'foreign key',
            name: 'accounts_user_id_fkey',
            references: {
                table: 'users',
                field: 'id'
            }
        })

        await queryInterface.addConstraint('sessions', {
            fields: ['user_id'],
            type: 'foreign key',
            name: 'sessions_user_id_fkey',
            references: {
                table: 'users',
                field: 'id'
            }
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('accounts', 'accounts_user_id_fkey')
        await queryInterface.removeConstraint('sessions', 'sessions_user_id_fkey')
    }
};