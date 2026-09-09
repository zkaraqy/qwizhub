import {
    Association,
    CreationOptional,
    DataTypes,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyCountAssociationsMixin,
    InferCreationAttributes,
    InferAttributes,
    Model,
    NonAttribute,
    Sequelize
} from 'sequelize'
import type { Account } from './Account'
import type { Session } from './Session'
import type { VerificationToken } from './VerificationToken'

type UserAssociations = 'accounts' | 'sessions' | 'verificationTokens'

export class User extends Model<
    InferAttributes<User, { omit: UserAssociations }>,
    InferCreationAttributes<User, { omit: UserAssociations }>
> {
    declare id: CreationOptional<string>
    declare name: string | null
    declare email: string | null
    declare emailVerified: Date | null
    declare image: string | null
    declare password: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // User hasMany Account
    declare accounts?: NonAttribute<Account[]>
    declare getAccounts: HasManyGetAssociationsMixin<Account>
    declare setAccounts: HasManySetAssociationsMixin<Account, string>
    declare addAccount: HasManyAddAssociationMixin<Account, string>
    declare addAccounts: HasManyAddAssociationsMixin<Account, string>
    declare createAccount: HasManyCreateAssociationMixin<Account, 'userId'>
    declare removeAccount: HasManyRemoveAssociationMixin<Account, string>
    declare removeAccounts: HasManyRemoveAssociationsMixin<Account, string>
    declare hasAccount: HasManyHasAssociationMixin<Account, string>
    declare hasAccounts: HasManyHasAssociationsMixin<Account, string>
    declare countAccounts: HasManyCountAssociationsMixin

    // User hasMany Session
    declare sessions?: NonAttribute<Session[]>
    declare getSessions: HasManyGetAssociationsMixin<Session>
    declare setSessions: HasManySetAssociationsMixin<Session, string>
    declare addSession: HasManyAddAssociationMixin<Session, string>
    declare addSessions: HasManyAddAssociationsMixin<Session, string>
    declare createSession: HasManyCreateAssociationMixin<Session, 'userId'>
    declare removeSession: HasManyRemoveAssociationMixin<Session, string>
    declare removeSessions: HasManyRemoveAssociationsMixin<Session, string>
    declare hasSession: HasManyHasAssociationMixin<Session, string>
    declare hasSessions: HasManyHasAssociationsMixin<Session, string>
    declare countSessions: HasManyCountAssociationsMixin

    // User hasMany VerificationToken
    declare verificationTokens?: NonAttribute<VerificationToken[]>
    declare getVerificationTokens: HasManyGetAssociationsMixin<VerificationToken>
    declare setVerificationTokens: HasManySetAssociationsMixin<VerificationToken, string>
    declare addVerificationToken: HasManyAddAssociationMixin<VerificationToken, string>
    declare addVerificationTokens: HasManyAddAssociationsMixin<VerificationToken, string>
    declare createVerificationToken: HasManyCreateAssociationMixin<VerificationToken>
    declare removeVerificationToken: HasManyRemoveAssociationMixin<VerificationToken, string>
    declare removeVerificationTokens: HasManyRemoveAssociationsMixin<VerificationToken, string>
    declare hasVerificationToken: HasManyHasAssociationMixin<VerificationToken, string>
    declare hasVerificationTokens: HasManyHasAssociationsMixin<VerificationToken, string>
    declare countVerificationTokens: HasManyCountAssociationsMixin

    declare static associations: {
        accounts: Association<User, Account>,
        sessions: Association<User, Session>,
        verificationTokens: Association<User, VerificationToken>
    }

    static initModel(sequelize: Sequelize): typeof User {
        User.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.TEXT,
            },
            email: {
                type: DataTypes.TEXT
            },
            emailVerified: {
                type: DataTypes.DATE,
                field: 'email_verified'
            },
            image: {
                type: DataTypes.TEXT
            },
            password: {
                type: DataTypes.TEXT,
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
        }, {
            tableName: 'users',
            sequelize
        })

        return User
    }
}