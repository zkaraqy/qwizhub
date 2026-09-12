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
import type { ResearchVariable } from './ResearchVariable'
import type { VariableIndicator } from './VariableIndicator'

type QuestionAssociations = 'questionnaire' | 'variable' | 'indicator'

export type QuestionType = 'multiple_choice' | 'text' | 'rating_scale' | 'checkbox' | 'dropdown' | 'closed' | 'mixed' | 'likert' | 'filter'
export type ScaleType = 'likert_5' | 'likert_7' | 'guttman' | 'custom'
export type QuestionSource = 'ai_generated' | 'manual'

export interface QuestionOption {
    value: string
    label: string
    order?: number
    score?: number  // For Likert scale scoring (1-5, 1-7, etc)
}

export interface AIReview {
    hasIssues: boolean
    issues: {
        bias?: { detected: boolean; note: string | null }
        ambiguity?: { detected: boolean; note: string | null }
        doubleBarreled?: { detected: boolean; note: string | null }
        redundancy?: { detected: boolean; note: string | null }
        optionIssues?: { detected: boolean; note: string | null }
    }
    score: number
    reviewedAt: string
}

export interface AIRewriteSuggestion {
    version: string
    questionText: string
    questionType: QuestionType
    scaleType?: ScaleType | null
    options?: QuestionOption[]
    rationale: string
}

export interface AISuggestions {
    rewrites?: AIRewriteSuggestion[]
    scaleRecommendation?: {
        scaleType: ScaleType
        rationale: string
    }
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
    declare variableId: string | null
    declare indicatorId: string | null
    declare aiReview: AIReview | null
    declare aiSuggestions: AISuggestions | null
    declare recommendedScaleType: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Question belongsTo Questionnaire
    declare questionnaire?: NonAttribute<Questionnaire>
    declare getQuestionnaire: BelongsToGetAssociationMixin<Questionnaire>
    declare setQuestionnaire: BelongsToSetAssociationMixin<Questionnaire, string>
    declare createQuestionnaire: BelongsToCreateAssociationMixin<Questionnaire>

    // Question belongsTo ResearchVariable
    declare variable?: NonAttribute<ResearchVariable>
    declare getVariable: BelongsToGetAssociationMixin<ResearchVariable>
    declare setVariable: BelongsToSetAssociationMixin<ResearchVariable, string>
    declare createVariable: BelongsToCreateAssociationMixin<ResearchVariable>

    // Question belongsTo VariableIndicator
    declare indicator?: NonAttribute<VariableIndicator>
    declare getIndicator: BelongsToGetAssociationMixin<VariableIndicator>
    declare setIndicator: BelongsToSetAssociationMixin<VariableIndicator, string>
    declare createIndicator: BelongsToCreateAssociationMixin<VariableIndicator>

    declare static associations: {
        questionnaire: Association<Question, Questionnaire>
        variable: Association<Question, ResearchVariable>
        indicator: Association<Question, VariableIndicator>
    }

    /**
     * Check if question has AI review
     */
    hasAIReview(): boolean {
        return this.aiReview !== null && this.aiReview !== undefined
    }

    /**
     * Check if question has issues from AI review
     */
    hasIssues(): boolean {
        return this.hasAIReview() && this.aiReview!.hasIssues
    }

    /**
     * Get AI review score
     */
    getReviewScore(): number | null {
        return this.hasAIReview() ? this.aiReview!.score : null
    }

    /**
     * Check if question has AI suggestions
     */
    hasAISuggestions(): boolean {
        return this.aiSuggestions !== null && this.aiSuggestions !== undefined
    }

    /**
     * Check if question is mapped to variable and indicator
     */
    isMappedToIndicator(): boolean {
        return this.variableId !== null && this.indicatorId !== null
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
     * Get formatted options based on scale type
     * If custom options exist, use them; otherwise return defaults with scores
     */
    getFormattedOptions(): QuestionOption[] {
        if (this.questionType === 'text') {
            return []
        }

        // Return custom options if available
        if (this.options && this.options.length > 0) {
            return this.options
        }

        // Generate default options based on scale type with scores
        if (this.scaleType === 'likert_5') {
            return [
                { value: '1', label: 'Sangat Tidak Setuju', score: 1 },
                { value: '2', label: 'Tidak Setuju', score: 2 },
                { value: '3', label: 'Netral', score: 3 },
                { value: '4', label: 'Setuju', score: 4 },
                { value: '5', label: 'Sangat Setuju', score: 5 }
            ]
        }

        if (this.scaleType === 'likert_7') {
            return [
                { value: '1', label: 'Sangat Tidak Setuju', score: 1 },
                { value: '2', label: 'Tidak Setuju', score: 2 },
                { value: '3', label: 'Agak Tidak Setuju', score: 3 },
                { value: '4', label: 'Netral', score: 4 },
                { value: '5', label: 'Agak Setuju', score: 5 },
                { value: '6', label: 'Setuju', score: 6 },
                { value: '7', label: 'Sangat Setuju', score: 7 }
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

    /**
     * Check if question type can have options
     */
    canHaveOptions(): boolean {
        return ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'mixed', 'filter'].includes(this.questionType)
    }

    /**
     * Check if question type requires scale type
     */
    requiresScaleType(): boolean {
        return this.questionType === 'rating_scale' || this.questionType === 'likert'
    }

    /**
     * Validate if type change is allowed and get warnings
     */
    canChangeTypeTo(newType: QuestionType): { allowed: boolean; warning?: string } {
        // Can't change if question type is the same
        if (this.questionType === newType) {
            return { allowed: false, warning: 'Tipe pertanyaan sudah ' + newType }
        }

        const fromHasOptions = this.canHaveOptions()
        const toHasOptions = ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'mixed', 'filter'].includes(newType)
        
        // Warn if changing from type with options to text (options will be lost)
        if (fromHasOptions && newType === 'text') {
            return { 
                allowed: true, 
                warning: 'Opsi jawaban akan dihapus saat mengubah ke Pertanyaan Terbuka'
            }
        }

        // Warn if changing from scale types to text
        if ((this.questionType === 'likert' || this.questionType === 'rating_scale') && newType === 'text') {
            return {
                allowed: true,
                warning: 'Skala pengukuran dan opsi akan dihapus saat mengubah ke Pertanyaan Terbuka'
            }
        }

        // Warn if changing from text to type with options (need to add options)
        if (this.questionType === 'text' && toHasOptions) {
            return {
                allowed: true,
                warning: 'Anda perlu menambahkan opsi jawaban setelah mengubah tipe'
            }
        }

        return { allowed: true }
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
            variableId: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'variable_id'
            },
            indicatorId: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'indicator_id'
            },
            aiReview: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'ai_review'
            },
            aiSuggestions: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'ai_suggestions'
            },
            recommendedScaleType: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'recommended_scale_type'
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
