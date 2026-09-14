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

type HonorWithdrawalAssociations = 'respondent' | 'processor'

export type HonorWithdrawalStatus = 'sent' | 'paid'

export class HonorWithdrawal extends Model<
    InferAttributes<HonorWithdrawal, { omit: HonorWithdrawalAssociations }>,
    InferCreationAttributes<HonorWithdrawal, { omit: HonorWithdrawalAssociations }>
> {
    declare id: CreationOptional<string>
    declare respondentId: string
    declare amount: number
    declare status: CreationOptional<HonorWithdrawalStatus>
    declare phoneNumber: string
    declare notes: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
    declare processedAt: Date | null
    declare processedBy: string | null

    // HonorWithdrawal belongsTo User (respondent)
    declare respondent?: NonAttribute<User>
    declare getRespondent: BelongsToGetAssociationMixin<User>
    declare setRespondent: BelongsToSetAssociationMixin<User, string>
    declare createRespondent: BelongsToCreateAssociationMixin<User>

    // HonorWithdrawal belongsTo User (processor/admin)
    declare processor?: NonAttribute<User>
    declare getProcessor: BelongsToGetAssociationMixin<User>
    declare setProcessor: BelongsToSetAssociationMixin<User, string>
    declare createProcessor: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        respondent: Association<HonorWithdrawal, User>
        processor: Association<HonorWithdrawal, User>
    }

    /**
     * Check if withdrawal can be cancelled (only 'sent' status)
     */
    canCancel(): boolean {
        return this.status === 'sent'
    }

    /**
     * Check if withdrawal is sent
     */
    isSent(): boolean {
        return this.status === 'sent'
    }

    /**
     * Check if withdrawal is paid
     */
    isPaid(): boolean {
        return this.status === 'paid'
    }

    /**
     * Mark withdrawal as paid
     */
    async markAsPaid(adminId: string): Promise<void> {
        if (this.status === 'paid') {
            throw new Error('Withdrawal is already paid')
        }
        
        this.status = 'paid'
        this.processedAt = new Date()
        this.processedBy = adminId
        await this.save()
    }

    static initModel(sequelize: Sequelize): typeof HonorWithdrawal {
        HonorWithdrawal.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            respondentId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'respondent_id'
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 50000
                }
            },
            status: {
                type: DataTypes.ENUM('sent', 'paid'),
                allowNull: false,
                defaultValue: 'sent'
            },
            phoneNumber: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'phone_number'
            },
            notes: {
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
            },
            processedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'processed_at'
            },
            processedBy: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'processed_by'
            }
        }, {
            tableName: 'honor_withdrawals',
            sequelize
        })

        return HonorWithdrawal
    }
}
