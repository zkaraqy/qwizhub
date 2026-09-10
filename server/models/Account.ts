import {
    Association,
    type BelongsToGetAssociationMixin,
    type BelongsToSetAssociationMixin,
    type BelongsToCreateAssociationMixin,
    type CreationOptional,
    DataTypes,
    type InferCreationAttributes,
    type InferAttributes,
    Model,
    type NonAttribute,
    Sequelize
} from 'sequelize'
import type { User } from './User'

type AccountAssociations = 'user'

export class Account extends Model<
    InferAttributes<Account, { omit: AccountAssociations }>,
    InferCreationAttributes<Account, { omit: AccountAssociations }>
> {
    declare id: CreationOptional<string>
    declare userId: string | null
    declare type: string | null
    declare provider: string | null
    declare providerAccountId: string | null
    declare refreshToken: string | null
    declare accessToken: string | null
    declare expiresAt: number | null
    declare tokenType: string | null
    declare scope: string | null
    declare idToken: string | null
    declare sessionState: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Account belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<Account, User>
    }

    static initModel(sequelize: Sequelize): typeof Account {
        Account.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.TEXT,
                field: 'user_id'
            },
            type: {
                type: DataTypes.TEXT
            },
            provider: {
                type: DataTypes.TEXT
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
                type: DataTypes.TEXT
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
        }, {
            tableName: 'accounts',
            sequelize
        })

        return Account
    }
}