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
import type { Project } from './Project'
import type { Question } from './Question'
import type { ResearchVariable } from './ResearchVariable'

type QuestionnaireAssociations = 'project' | 'questions' | 'researchVariables'

export class Questionnaire extends Model<
    InferAttributes<Questionnaire, { omit: QuestionnaireAssociations }>,
    InferCreationAttributes<Questionnaire, { omit: QuestionnaireAssociations }>
> {
    declare id: CreationOptional<string>
    declare projectId: string
    declare topic: string
    declare researchObjective: string
    declare variables: CreationOptional<string[]>
    declare status: CreationOptional<'draft' | 'published'>
    declare targetRespondents: CreationOptional<number>
    declare currentResponses: CreationOptional<number>
    declare paidForAccess: CreationOptional<boolean>
    declare accessPaymentId: string | null
    declare accessPaymentDate: CreationOptional<Date | null>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Questionnaire belongsTo Project
    declare project?: NonAttribute<Project>
    declare getProject: BelongsToGetAssociationMixin<Project>
    declare setProject: BelongsToSetAssociationMixin<Project, string>
    declare createProject: BelongsToCreateAssociationMixin<Project>

    // Questionnaire hasMany Question
    declare questions?: NonAttribute<Question[]>
    declare getQuestions: HasManyGetAssociationsMixin<Question>
    declare setQuestions: HasManySetAssociationsMixin<Question, string>
    declare addQuestion: HasManyAddAssociationMixin<Question, string>
    declare addQuestions: HasManyAddAssociationsMixin<Question, string>
    declare createQuestion: HasManyCreateAssociationMixin<Question, 'questionnaireId'>
    declare removeQuestion: HasManyRemoveAssociationMixin<Question, string>
    declare removeQuestions: HasManyRemoveAssociationsMixin<Question, string>
    declare hasQuestion: HasManyHasAssociationMixin<Question, string>
    declare hasQuestions: HasManyHasAssociationsMixin<Question, string>
    declare countQuestions: HasManyCountAssociationsMixin

    // Questionnaire hasMany ResearchVariable
    declare researchVariables?: NonAttribute<ResearchVariable[]>
    declare getResearchVariables: HasManyGetAssociationsMixin<ResearchVariable>
    declare setResearchVariables: HasManySetAssociationsMixin<ResearchVariable, string>
    declare addResearchVariable: HasManyAddAssociationMixin<ResearchVariable, string>
    declare addResearchVariables: HasManyAddAssociationsMixin<ResearchVariable, string>
    declare createResearchVariable: HasManyCreateAssociationMixin<ResearchVariable, 'questionnaireId'>
    declare removeResearchVariable: HasManyRemoveAssociationMixin<ResearchVariable, string>
    declare removeResearchVariables: HasManyRemoveAssociationsMixin<ResearchVariable, string>
    declare hasResearchVariable: HasManyHasAssociationMixin<ResearchVariable, string>
    declare hasResearchVariables: HasManyHasAssociationsMixin<ResearchVariable, string>
    declare countResearchVariables: HasManyCountAssociationsMixin

    declare static associations: {
        project: Association<Questionnaire, Project>,
        questions: Association<Questionnaire, Question>,
        researchVariables: Association<Questionnaire, ResearchVariable>
    }

    /**
     * Check if user can edit this questionnaire (must own the project)
     */
    async canEdit(userId: string): Promise<boolean> {
        if (!this.project) {
            await this.reload({ include: ['project'] })
        }
        return this.project?.isOwnedBy(userId) ?? false
    }

    /**
     * Check if this questionnaire is in draft status
     */
    isDraft(): boolean {
        return this.status === 'draft'
    }

    /**
     * Check if this questionnaire can be published (has at least one question)
     */
    async canPublish(): Promise<boolean> {
        const questionCount = await this.countQuestions()
        return questionCount > 0 && this.isDraft()
    }

    /**
     * Check if questionnaire is accepting responses
     */
    isAcceptingResponses(): boolean {
        return this.status === 'published' && this.currentResponses < this.targetRespondents
    }

    /**
     * Check if questionnaire has reached target
     */
    hasReachedTarget(): boolean {
        return this.currentResponses >= this.targetRespondents
    }

    /**
     * Get remaining slots
     */
    getRemainingSlots(): number {
        return Math.max(0, this.targetRespondents - this.currentResponses)
    }

    /**
     * Increment current responses count
     */
    async incrementResponses(): Promise<void> {
        this.currentResponses = (this.currentResponses || 0) + 1
        await this.save()
    }

    static initModel(sequelize: Sequelize): typeof Questionnaire {
        Questionnaire.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            projectId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'project_id'
            },
            topic: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            researchObjective: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'research_objective'
            },
            variables: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: []
            },
            status: {
                type: DataTypes.ENUM('draft', 'published'),
                allowNull: false,
                defaultValue: 'draft'
            },
            targetRespondents: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'target_respondents'
            },
            currentResponses: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'current_responses'
            },
            paidForAccess: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'paid_for_access'
            },
            accessPaymentId: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'access_payment_id'
            },
            accessPaymentDate: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'access_payment_date'
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
            tableName: 'questionnaires',
            sequelize
        })

        return Questionnaire
    }
}
