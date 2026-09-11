import {
    Association,
    type BelongsToGetAssociationMixin,
    type BelongsToSetAssociationMixin,
    type BelongsToCreateAssociationMixin,
    type HasOneGetAssociationMixin,
    type HasOneSetAssociationMixin,
    type HasOneCreateAssociationMixin,
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
import type { HonorTransaction } from './HonorTransaction'

type ResponseAssociations = 'questionnaire' | 'respondent' | 'honorTransaction'

export type ResponseStatus = 'in_progress' | 'completed'

export interface Answer {
    questionId: string
    answer: string | string[] | number
    answeredAt?: Date
}

export class Response extends Model<
    InferAttributes<Response, { omit: ResponseAssociations }>,
    InferCreationAttributes<Response, { omit: ResponseAssociations }>
> {
    declare id: CreationOptional<string>
    declare questionnaireId: string
    declare respondentId: string
    declare answers: CreationOptional<Answer[]>
    declare status: CreationOptional<ResponseStatus>
    declare honorPaid: CreationOptional<boolean>
    declare honorAmount: CreationOptional<number>
    declare startedAt: CreationOptional<Date>
    declare completedAt: Date | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Response belongsTo Questionnaire
    declare questionnaire?: NonAttribute<Questionnaire>
    declare getQuestionnaire: BelongsToGetAssociationMixin<Questionnaire>
    declare setQuestionnaire: BelongsToSetAssociationMixin<Questionnaire, string>
    declare createQuestionnaire: BelongsToCreateAssociationMixin<Questionnaire>

    // Response belongsTo User (respondent)
    declare respondent?: NonAttribute<User>
    declare getRespondent: BelongsToGetAssociationMixin<User>
    declare setRespondent: BelongsToSetAssociationMixin<User, string>
    declare createRespondent: BelongsToCreateAssociationMixin<User>

    // Response hasOne HonorTransaction
    declare honorTransaction?: NonAttribute<HonorTransaction>
    declare getHonorTransaction: HasOneGetAssociationMixin<HonorTransaction>
    declare setHonorTransaction: HasOneSetAssociationMixin<HonorTransaction, string>
    declare createHonorTransaction: HasOneCreateAssociationMixin<HonorTransaction>

    declare static associations: {
        questionnaire: Association<Response, Questionnaire>
        respondent: Association<Response, User>
        honorTransaction: Association<Response, HonorTransaction>
    }

    /**
     * Check if response is completed
     */
    isCompleted(): boolean {
        return this.status === 'completed'
    }

    /**
     * Check if response is in progress
     */
    isInProgress(): boolean {
        return this.status === 'in_progress'
    }

    /**
     * Get completion percentage
     */
    getCompletionPercentage(totalQuestions: number): number {
        if (!this.answers || this.answers.length === 0) return 0
        return Math.round((this.answers.length / totalQuestions) * 100)
    }

    /**
     * Calculate time spent (in seconds)
     */
    getTimeSpent(): number | null {
        if (!this.completedAt) return null
        const start = new Date(this.startedAt).getTime()
        const end = new Date(this.completedAt).getTime()
        return Math.round((end - start) / 1000)
    }

    /**
     * Get answer for specific question
     */
    getAnswerForQuestion(questionId: string): Answer | undefined {
        return this.answers?.find(a => a.questionId === questionId)
    }

    static initModel(sequelize: Sequelize): typeof Response {
        Response.init({
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
            respondentId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'respondent_id'
            },
            answers: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: [],
                field: 'answers'
            },
            status: {
                type: DataTypes.ENUM('in_progress', 'completed'),
                allowNull: false,
                defaultValue: 'in_progress'
            },
            honorPaid: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'honor_paid'
            },
            honorAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'honor_amount'
            },
            startedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'started_at'
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'completed_at'
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
            tableName: 'responses',
            sequelize
        })

        return Response
    }
}
