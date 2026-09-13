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

type AITokenTransactionAssociations = 'user'

export type AITokenTransactionType = 'credit' | 'debit'
export type AITokenMidtransStatus = 'pending' | 'success' | 'failed'

export class AITokenTransaction extends Model<
    InferAttributes<AITokenTransaction, { omit: AITokenTransactionAssociations }>,
    InferCreationAttributes<AITokenTransaction, { omit: AITokenTransactionAssociations }>
> {
    declare id: CreationOptional<string>
    declare userId: string
    declare type: AITokenTransactionType
    declare amount: number
    declare balanceBefore: number
    declare balanceAfter: number
    declare description: string | null
    declare referenceType: string | null
    declare referenceId: string | null
    declare midtransOrderId: string | null
    declare midtransStatus: AITokenMidtransStatus | null
    declare createdAt: CreationOptional<Date>

    // AITokenTransaction belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<AITokenTransaction, User>
    }

    static initModel(sequelize: Sequelize): typeof AITokenTransaction {
        AITokenTransaction.init({
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
            type: {
                type: DataTypes.ENUM('credit', 'debit'),
                allowNull: false
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            balanceBefore: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'balance_before'
            },
            balanceAfter: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'balance_after'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            referenceType: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'reference_type'
            },
            referenceId: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'reference_id'
            },
            midtransOrderId: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'midtrans_order_id'
            },
            midtransStatus: {
                type: DataTypes.ENUM('pending', 'success', 'failed'),
                allowNull: true,
                field: 'midtrans_status'
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            }
        }, {
            tableName: 'ai_token_transactions',
            sequelize,
            timestamps: true,
            updatedAt: false
        })

        return AITokenTransaction
    }
}
