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

type PasswordResetTokenAssociations = 'user'

export class PasswordResetToken extends Model<
    InferAttributes<PasswordResetToken, { omit: PasswordResetTokenAssociations }>,
    InferCreationAttributes<PasswordResetToken, { omit: PasswordResetTokenAssociations }>
> {
    declare id: CreationOptional<string>
    declare userId: string
    declare token: string
    declare expires: Date
    declare used: CreationOptional<boolean>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // PasswordResetToken belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<PasswordResetToken, User>
    }

    /**
     * Check if this token is still valid (not expired and not used)
     */
    isValid(): boolean {
        return !this.used && new Date() < new Date(this.expires)
    }

    static initModel(sequelize: Sequelize): typeof PasswordResetToken {
        PasswordResetToken.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'user_id'
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true
            },
            expires: {
                type: DataTypes.DATE,
                allowNull: false
            },
            used: {
                type: DataTypes.BOOLEAN,
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
        }, {
            tableName: 'password_reset_tokens',
            sequelize
        })

        return PasswordResetToken
    }
}
