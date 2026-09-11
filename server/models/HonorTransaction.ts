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
import type { Response } from './Response'
import type { User } from './User'

type HonorTransactionAssociations = 'response' | 'respondent'

export type HonorTransactionStatus = 'pending' | 'paid' | 'cancelled'

export class HonorTransaction extends Model<
    InferAttributes<HonorTransaction, { omit: HonorTransactionAssociations }>,
    InferCreationAttributes<HonorTransaction, { omit: HonorTransactionAssociations }>
> {
    declare id: CreationOptional<string>
    declare responseId: string
    declare respondentId: string
    declare amount: number
    declare status: CreationOptional<HonorTransactionStatus>
    declare paidAt: Date | null
    declare createdAt: CreationOptional<Date>

    // HonorTransaction belongsTo Response
    declare response?: NonAttribute<Response>
    declare getResponse: BelongsToGetAssociationMixin<Response>
    declare setResponse: BelongsToSetAssociationMixin<Response, string>
    declare createResponse: BelongsToCreateAssociationMixin<Response>

    // HonorTransaction belongsTo User (respondent)
    declare respondent?: NonAttribute<User>
    declare getRespondent: BelongsToGetAssociationMixin<User>
    declare setRespondent: BelongsToSetAssociationMixin<User, string>
    declare createRespondent: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        response: Association<HonorTransaction, Response>
        respondent: Association<HonorTransaction, User>
    }

    /**
     * Check if transaction is paid
     */
    isPaid(): boolean {
        return this.status === 'paid'
    }

    /**
     * Check if transaction is pending
     */
    isPending(): boolean {
        return this.status === 'pending'
    }

    /**
     * Check if transaction is cancelled
     */
    isCancelled(): boolean {
        return this.status === 'cancelled'
    }

    /**
     * Mark as paid
     */
    async markAsPaid(): Promise<void> {
        this.status = 'paid'
        this.paidAt = new Date()
        await this.save()
    }

    /**
     * Cancel transaction
     */
    async cancel(): Promise<void> {
        this.status = 'cancelled'
        await this.save()
    }

    static initModel(sequelize: Sequelize): typeof HonorTransaction {
        HonorTransaction.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            responseId: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true,
                field: 'response_id'
            },
            respondentId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'respondent_id'
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending'
            },
            paidAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'paid_at'
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            }
        }, {
            tableName: 'honor_transactions',
            sequelize,
            timestamps: false,
            createdAt: 'created_at',
            updatedAt: false
        })

        return HonorTransaction
    }
}
