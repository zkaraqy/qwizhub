const DataTypes = require('sequelize').DataTypes

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Fix users.email_verified from TIME to TIMESTAMPTZ
        await queryInterface.changeColumn('users', 'email_verified', {
            type: DataTypes.DATE,
            allowNull: true
        });

        // Fix sessions.expires from TIME to TIMESTAMPTZ
        await queryInterface.changeColumn('sessions', 'expires', {
            type: DataTypes.DATE,
            allowNull: false
        });

        // Fix verification_tokens.expires from TIME to TIMESTAMPTZ
        await queryInterface.changeColumn('verification_tokens', 'expires', {
            type: DataTypes.DATE,
            allowNull: false
        });

        // Add unique constraint to email if not exists
        try {
            await queryInterface.addIndex('users', ['email'], {
                unique: true,
                name: 'users_email_unique'
            });
        } catch (error) {
            // Index might already exist, ignore error
            console.log('Email unique constraint may already exist');
        }

        // Add unique constraint to session_token if not exists
        try {
            await queryInterface.addIndex('sessions', ['session_token'], {
                unique: true,
                name: 'sessions_session_token_unique'
            });
        } catch (error) {
            // Index might already exist, ignore error
            console.log('Session token unique constraint may already exist');
        }

        // Add unique constraint to token if not exists
        try {
            await queryInterface.addIndex('verification_tokens', ['token'], {
                unique: true,
                name: 'verification_tokens_token_unique'
            });
        } catch (error) {
            // Index might already exist, ignore error
            console.log('Token unique constraint may already exist');
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Revert back to TIME (not recommended)
        await queryInterface.changeColumn('users', 'email_verified', {
            type: DataTypes.TIME,
            allowNull: true
        });

        await queryInterface.changeColumn('sessions', 'expires', {
            type: DataTypes.TIME,
            allowNull: true
        });

        await queryInterface.changeColumn('verification_tokens', 'expires', {
            type: DataTypes.TIME,
            allowNull: true
        });

        // Remove indexes
        await queryInterface.removeIndex('users', 'users_email_unique');
        await queryInterface.removeIndex('sessions', 'sessions_session_token_unique');
        await queryInterface.removeIndex('verification_tokens', 'verification_tokens_token_unique');
    },
};
