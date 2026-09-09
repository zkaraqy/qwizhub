import {
    Association,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
    CreationOptional,
    DataTypes,
    InferCreationAttributes,
    InferAttributes,
    Model,
    NonAttribute,
    Sequelize
} from 'sequelize'
import type { User } from './User'

type SessionAssociations = 'user'

export class Session extends Model<
    InferAttributes<Session, { omit: SessionAssociations }>,
    InferCreationAttributes<Session, { omit: SessionAssociations }>
> {
    declare id: CreationOptional<string>
    declare expires: Date
    declare sessionToken: string | null
    declare userId: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Session belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<Session, User>
    }

    static initModel(sequelize: Sequelize): typeof Session {
        Session.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            expires: {
                type: DataTypes.DATE,
                allowNull: false
            },
            sessionToken: {
                type: DataTypes.TEXT,
                field: 'session_token'
            },
            userId: {
                type: DataTypes.TEXT,
                field: 'user_id'
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
            tableName: 'sessions',
            sequelize
        })

        return Session
    }
}