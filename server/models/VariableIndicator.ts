import {
    Association,
    type BelongsToGetAssociationMixin,
    type BelongsToSetAssociationMixin,
    type BelongsToCreateAssociationMixin,
    type HasManyGetAssociationsMixin,
    type HasManySetAssociationsMixin,
    type HasManyAddAssociationMixin,
    type HasManyAddAssociationsMixin,
    type HasManyCreateAssociationMixin,
    type HasManyRemoveAssociationMixin,
    type HasManyRemoveAssociationsMixin,
    type HasManyHasAssociationMixin,
    type HasManyHasAssociationsMixin,
    type HasManyCountAssociationsMixin,
    type CreationOptional,
    DataTypes,
    type InferCreationAttributes,
    type InferAttributes,
    Model,
    type NonAttribute,
    Sequelize
} from 'sequelize'
import type { ResearchVariable } from './ResearchVariable'
import type { Question } from './Question'

type VariableIndicatorAssociations = 'variable' | 'questions'

export type IndicatorSource = 'ai_generated' | 'manual'
export type IndicatorStatus = 'accepted' | 'pending' | 'rejected'

export class VariableIndicator extends Model<
    InferAttributes<VariableIndicator, { omit: VariableIndicatorAssociations }>,
    InferCreationAttributes<VariableIndicator, { omit: VariableIndicatorAssociations }>
> {
    declare id: CreationOptional<string>
    declare variableId: string
    declare indicatorText: string
    declare indicatorSource: CreationOptional<IndicatorSource>
    declare status: CreationOptional<IndicatorStatus>
    declare orderIndex: CreationOptional<number>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // VariableIndicator belongsTo ResearchVariable
    declare variable?: NonAttribute<ResearchVariable>
    declare getVariable: BelongsToGetAssociationMixin<ResearchVariable>
    declare setVariable: BelongsToSetAssociationMixin<ResearchVariable, string>
    declare createVariable: BelongsToCreateAssociationMixin<ResearchVariable>

    // VariableIndicator hasMany Question
    declare questions?: NonAttribute<Question[]>
    declare getQuestions: HasManyGetAssociationsMixin<Question>
    declare setQuestions: HasManySetAssociationsMixin<Question, string>
    declare addQuestion: HasManyAddAssociationMixin<Question, string>
    declare addQuestions: HasManyAddAssociationsMixin<Question, string>
    declare createQuestion: HasManyCreateAssociationMixin<Question, 'indicatorId'>
    declare removeQuestion: HasManyRemoveAssociationMixin<Question, string>
    declare removeQuestions: HasManyRemoveAssociationsMixin<Question, string>
    declare hasQuestion: HasManyHasAssociationMixin<Question, string>
    declare hasQuestions: HasManyHasAssociationsMixin<Question, string>
    declare countQuestions: HasManyCountAssociationsMixin

    declare static associations: {
        variable: Association<VariableIndicator, ResearchVariable>
        questions: Association<VariableIndicator, Question>
    }

    /**
     * Check if indicator is accepted
     */
    isAccepted(): boolean {
        return this.status === 'accepted'
    }

    /**
     * Check if indicator is pending
     */
    isPending(): boolean {
        return this.status === 'pending'
    }

    /**
     * Check if indicator is AI generated
     */
    isAIGenerated(): boolean {
        return this.indicatorSource === 'ai_generated'
    }

    /**
     * Accept this indicator
     */
    async accept(): Promise<void> {
        this.status = 'accepted'
        await this.save()
    }

    /**
     * Reject this indicator
     */
    async reject(): Promise<void> {
        this.status = 'rejected'
        await this.save()
    }

    /**
     * Get questions count for this indicator
     */
    async getQuestionsCount(): Promise<number> {
        return await this.countQuestions()
    }

    static initModel(sequelize: Sequelize): typeof VariableIndicator {
        VariableIndicator.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            variableId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'variable_id'
            },
            indicatorText: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'indicator_text'
            },
            indicatorSource: {
                type: DataTypes.ENUM('ai_generated', 'manual'),
                allowNull: false,
                defaultValue: 'manual',
                field: 'indicator_source'
            },
            status: {
                type: DataTypes.ENUM('accepted', 'pending', 'rejected'),
                allowNull: false,
                defaultValue: 'accepted',
                field: 'status'
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'order_index'
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
            tableName: 'variable_indicators',
            sequelize
        })

        return VariableIndicator
    }
}
