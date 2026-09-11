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
import type { Questionnaire } from './Questionnaire'
import type { User } from './User'

type TransactionAssociations = 'questionnaire' | 'user'

export class Transaction extends Model<
    InferAttributes<Transaction, { omit: TransactionAssociations }>,
    InferCreationAttributes<Transaction, { omit: TransactionAssociations }>
> {
    declare id: CreationOptional<string>
    declare questionnaireId: string
    declare userId: string
    declare amount: number
    declare targetRespondents: number
    declare honorariumPerRespondent: number
    declare serviceFee: number
    declare status: CreationOptional<'pending' | 'success' | 'failed' | 'expired'>
    declare transactionType: 'questionnaire_access' | 'questionnaire_publish'
    declare metadata: CreationOptional<any>
    declare snapToken: CreationOptional<string | null>
    declare paymentUrl: CreationOptional<string | null>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Belongs to Questionnaire
    declare questionnaire?: NonAttribute<Questionnaire>
    declare getQuestionnaire: BelongsToGetAssociationMixin<Questionnaire>
    declare setQuestionnaire: BelongsToSetAssociationMixin<Questionnaire, string>
    declare createQuestionnaire: BelongsToCreateAssociationMixin<Questionnaire>

    // Belongs to User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        questionnaire: Association<Transaction, Questionnaire>
        user: Association<Transaction, User>
    }

    static initModel(sequelize: Sequelize): typeof Transaction {
        Transaction.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            questionnaireId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'questionnaire_id'
            },
            userId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'user_id'
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            targetRespondents: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'target_respondents'
            },
            honorariumPerRespondent: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'honorarium_per_respondent'
            },
            serviceFee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'service_fee'
            },
            status: {
                type: DataTypes.ENUM('pending', 'success', 'failed', 'expired'),
                allowNull: false,
                defaultValue: 'pending'
            },
            transactionType: {
                type: DataTypes.ENUM('questionnaire_access', 'questionnaire_publish'),
                allowNull: false,
                field: 'transaction_type'
            },
            metadata: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null
            },
            snapToken: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'snap_token'
            },
            paymentUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'payment_url'
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
            tableName: 'transactions',
            sequelize
        })

        return Transaction
    }
}
