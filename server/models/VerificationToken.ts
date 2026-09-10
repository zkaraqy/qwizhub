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

type VerificationTokenAssociations = 'user'

export class VerificationToken extends Model<
    InferAttributes<VerificationToken, { omit: VerificationTokenAssociations }>,
    InferCreationAttributes<VerificationToken, { omit: VerificationTokenAssociations }>
> {
    declare identifier: CreationOptional<string>
    declare token: string | null
    declare expires: Date | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // VerificationToken belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<VerificationToken, User>
    }

    static initModel(sequelize: Sequelize): typeof VerificationToken {
        VerificationToken.init({
            identifier: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            token: {
                type: DataTypes.TEXT
            },
            expires: {
                type: DataTypes.DATE
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
            tableName: 'verification_tokens',
            sequelize
        })

        return VerificationToken
    }
}