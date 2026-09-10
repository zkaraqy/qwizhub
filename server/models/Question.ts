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

type QuestionAssociations = 'questionnaire'

export type QuestionType = 'multiple_choice' | 'text' | 'rating_scale' | 'checkbox' | 'dropdown' | 'closed' | 'mixed' | 'likert' | 'filter'
export type ScaleType = 'likert_5' | 'likert_7' | 'guttman' | 'custom'
export type QuestionSource = 'ai_generated' | 'manual'

export interface QuestionOption {
    value: string
    label: string
    order?: number
}

export class Question extends Model<
    InferAttributes<Question, { omit: QuestionAssociations }>,
    InferCreationAttributes<Question, { omit: QuestionAssociations }>
> {
    declare id: CreationOptional<string>
    declare questionnaireId: string
    declare questionText: string
    declare questionType: QuestionType
    declare scaleType: ScaleType | null
    declare options: CreationOptional<QuestionOption[]>
    declare orderIndex: CreationOptional<number>
    declare source: CreationOptional<QuestionSource>
    declare biasDetected: CreationOptional<boolean>
    declare biasNotes: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Question belongsTo Questionnaire
    declare questionnaire?: NonAttribute<Questionnaire>
    declare getQuestionnaire: BelongsToGetAssociationMixin<Questionnaire>
    declare setQuestionnaire: BelongsToSetAssociationMixin<Questionnaire, string>
    declare createQuestionnaire: BelongsToCreateAssociationMixin<Questionnaire>

    declare static associations: {
        questionnaire: Association<Question, Questionnaire>
    }

    /**
     * Validate that options are properly formatted
     */
    validateOptions(): boolean {
        // Text questions don't need options
        if (this.questionType === 'text') {
            return true
        }

        // Other types need options
        if (!this.options || !Array.isArray(this.options) || this.options.length === 0) {
            return false
        }

        // Validate each option has required fields
        return this.options.every(opt => 
            opt && typeof opt === 'object' && 
            'value' in opt && 'label' in opt &&
            typeof opt.value === 'string' && opt.value.trim() !== '' &&
            typeof opt.label === 'string' && opt.label.trim() !== ''
        )
    }

    /**
     * Check if this question has detected bias
     */
    hasBias(): boolean {
        return this.biasDetected === true
    }

    /**
     * Check if this question requires scale type
     */
    requiresScaleType(): boolean {
        return this.questionType === 'rating_scale'
    }

    /**
     * Get formatted options based on scale type
     */
    getFormattedOptions(): QuestionOption[] {
        if (this.questionType === 'text') {
            return []
        }

        // Return custom options if available
        if (this.options && this.options.length > 0) {
            return this.options
        }

        // Generate default options based on scale type
        if (this.scaleType === 'likert_5') {
            return [
                { value: '1', label: 'Sangat Tidak Setuju' },
                { value: '2', label: 'Tidak Setuju' },
                { value: '3', label: 'Netral' },
                { value: '4', label: 'Setuju' },
                { value: '5', label: 'Sangat Setuju' }
            ]
        }

        if (this.scaleType === 'likert_7') {
            return [
                { value: '1', label: 'Sangat Tidak Setuju' },
                { value: '2', label: 'Tidak Setuju' },
                { value: '3', label: 'Agak Tidak Setuju' },
                { value: '4', label: 'Netral' },
                { value: '5', label: 'Agak Setuju' },
                { value: '6', label: 'Setuju' },
                { value: '7', label: 'Sangat Setuju' }
            ]
        }

        if (this.scaleType === 'guttman') {
            return [
                { value: 'ya', label: 'Ya' },
                { value: 'tidak', label: 'Tidak' }
            ]
        }

        return this.options || []
    }

    static initModel(sequelize: Sequelize): typeof Question {
        Question.init({
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
            questionText: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'question_text'
            },
            questionType: {
                type: DataTypes.ENUM('multiple_choice', 'text', 'rating_scale', 'checkbox', 'dropdown', 'closed', 'mixed', 'likert', 'filter'),
                allowNull: false,
                field: 'question_type'
            },
            scaleType: {
                type: DataTypes.ENUM('likert_5', 'likert_7', 'guttman', 'custom'),
                allowNull: true,
                field: 'scale_type'
            },
            options: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: []
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'order_index'
            },
            source: {
                type: DataTypes.ENUM('ai_generated', 'manual'),
                allowNull: false,
                defaultValue: 'manual'
            },
            biasDetected: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'bias_detected'
            },
            biasNotes: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'bias_notes'
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
            tableName: 'questions',
            sequelize
        })

        return Question
    }
}
