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
import type { User } from './User'
import type { Questionnaire } from './Questionnaire'

type ProjectAssociations = 'peneliti' | 'questionnaires'

export class Project extends Model<
    InferAttributes<Project, { omit: ProjectAssociations }>,
    InferCreationAttributes<Project, { omit: ProjectAssociations }>
> {
    declare id: CreationOptional<string>
    declare penelitiId: string
    declare title: string
    declare description: string | null
    declare targetRespondents: CreationOptional<Record<string, any>>
    declare status: CreationOptional<'draft' | 'published' | 'closed'>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // Project belongsTo User (peneliti)
    declare peneliti?: NonAttribute<User>
    declare getPeneliti: BelongsToGetAssociationMixin<User>
    declare setPeneliti: BelongsToSetAssociationMixin<User, string>
    declare createPeneliti: BelongsToCreateAssociationMixin<User>

    // Project hasMany Questionnaire
    declare questionnaires?: NonAttribute<Questionnaire[]>
    declare getQuestionnaires: HasManyGetAssociationsMixin<Questionnaire>
    declare setQuestionnaires: HasManySetAssociationsMixin<Questionnaire, string>
    declare addQuestionnaire: HasManyAddAssociationMixin<Questionnaire, string>
    declare addQuestionnaires: HasManyAddAssociationsMixin<Questionnaire, string>
    declare createQuestionnaire: HasManyCreateAssociationMixin<Questionnaire, 'projectId'>
    declare removeQuestionnaire: HasManyRemoveAssociationMixin<Questionnaire, string>
    declare removeQuestionnaires: HasManyRemoveAssociationsMixin<Questionnaire, string>
    declare hasQuestionnaire: HasManyHasAssociationMixin<Questionnaire, string>
    declare hasQuestionnaires: HasManyHasAssociationsMixin<Questionnaire, string>
    declare countQuestionnaires: HasManyCountAssociationsMixin

    declare static associations: {
        peneliti: Association<Project, User>,
        questionnaires: Association<Project, Questionnaire>
    }

    /**
     * Check if this project is owned by the given user
     */
    isOwnedBy(userId: string): boolean {
        return this.penelitiId === userId
    }

    /**
     * Check if this project can be edited (only drafts can be edited)
     */
    canEdit(): boolean {
        return this.status === 'draft'
    }

    static initModel(sequelize: Sequelize): typeof Project {
        Project.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            penelitiId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'peneliti_id'
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            targetRespondents: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'target_respondents'
            },
            status: {
                type: DataTypes.ENUM('draft', 'published', 'closed'),
                allowNull: false,
                defaultValue: 'draft'
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
            tableName: 'projects',
            sequelize
        })

        return Project
    }
}
