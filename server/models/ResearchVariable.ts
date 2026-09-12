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
import type { Questionnaire } from './Questionnaire'
import type { VariableIndicator } from './VariableIndicator'
import type { Question } from './Question'

type ResearchVariableAssociations = 'questionnaire' | 'indicators' | 'questions'

export type VariableType = 'independent' | 'dependent' | 'moderating' | 'intervening' | 'control'

export class ResearchVariable extends Model<
    InferAttributes<ResearchVariable, { omit: ResearchVariableAssociations }>,
    InferCreationAttributes<ResearchVariable, { omit: ResearchVariableAssociations }>
> {
    declare id: CreationOptional<string>
    declare questionnaireId: string
    declare variableName: string
    declare variableType: VariableType
    declare description: string | null
    declare orderIndex: CreationOptional<number>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // ResearchVariable belongsTo Questionnaire
    declare questionnaire?: NonAttribute<Questionnaire>
    declare getQuestionnaire: BelongsToGetAssociationMixin<Questionnaire>
    declare setQuestionnaire: BelongsToSetAssociationMixin<Questionnaire, string>
    declare createQuestionnaire: BelongsToCreateAssociationMixin<Questionnaire>

    // ResearchVariable hasMany VariableIndicator
    declare indicators?: NonAttribute<VariableIndicator[]>
    declare getIndicators: HasManyGetAssociationsMixin<VariableIndicator>
    declare setIndicators: HasManySetAssociationsMixin<VariableIndicator, string>
    declare addIndicator: HasManyAddAssociationMixin<VariableIndicator, string>
    declare addIndicators: HasManyAddAssociationsMixin<VariableIndicator, string>
    declare createIndicator: HasManyCreateAssociationMixin<VariableIndicator, 'variableId'>
    declare removeIndicator: HasManyRemoveAssociationMixin<VariableIndicator, string>
    declare removeIndicators: HasManyRemoveAssociationsMixin<VariableIndicator, string>
    declare hasIndicator: HasManyHasAssociationMixin<VariableIndicator, string>
    declare hasIndicators: HasManyHasAssociationsMixin<VariableIndicator, string>
    declare countIndicators: HasManyCountAssociationsMixin

    // ResearchVariable hasMany Question
    declare questions?: NonAttribute<Question[]>
    declare getQuestions: HasManyGetAssociationsMixin<Question>
    declare setQuestions: HasManySetAssociationsMixin<Question, string>
    declare addQuestion: HasManyAddAssociationMixin<Question, string>
    declare addQuestions: HasManyAddAssociationsMixin<Question, string>
    declare createQuestion: HasManyCreateAssociationMixin<Question, 'variableId'>
    declare removeQuestion: HasManyRemoveAssociationMixin<Question, string>
    declare removeQuestions: HasManyRemoveAssociationsMixin<Question, string>
    declare hasQuestion: HasManyHasAssociationMixin<Question, string>
    declare hasQuestions: HasManyHasAssociationsMixin<Question, string>
    declare countQuestions: HasManyCountAssociationsMixin

    declare static associations: {
        questionnaire: Association<ResearchVariable, Questionnaire>
        indicators: Association<ResearchVariable, VariableIndicator>
        questions: Association<ResearchVariable, Question>
    }

    /**
     * Get variable type label in Indonesian
     */
    getVariableTypeLabel(): string {
        const labels: Record<VariableType, string> = {
            independent: 'Variabel Independen (X)',
            dependent: 'Variabel Dependen (Y)',
            moderating: 'Variabel Moderating',
            intervening: 'Variabel Intervening',
            control: 'Variabel Kontrol'
        }
        return labels[this.variableType] || this.variableType
    }

    /**
     * Get accepted indicators count
     */
    async getAcceptedIndicatorsCount(): Promise<number> {
        if (!this.indicators) {
            await this.reload({ include: ['indicators'] })
        }
        return this.indicators?.filter(ind => ind.status === 'accepted').length || 0
    }

    /**
     * Get questions count for this variable
     */
    async getQuestionsCount(): Promise<number> {
        return await this.countQuestions()
    }

    static initModel(sequelize: Sequelize): typeof ResearchVariable {
        ResearchVariable.init({
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
            variableName: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'variable_name'
            },
            variableType: {
                type: DataTypes.ENUM('independent', 'dependent', 'moderating', 'intervening', 'control'),
                allowNull: false,
                field: 'variable_type'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
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
            tableName: 'research_variables',
            sequelize
        })

        return ResearchVariable
    }
}
