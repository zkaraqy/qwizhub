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

type RespondentProfileAssociations = 'user'

export class RespondentProfile extends Model<
    InferAttributes<RespondentProfile, { omit: RespondentProfileAssociations }>,
    InferCreationAttributes<RespondentProfile, { omit: RespondentProfileAssociations }>
> {
    declare id: CreationOptional<string>
    declare userId: string
    declare dateOfBirth: Date | null
    declare gender: 'male' | 'female' | 'other' | null
    declare profession: string | null
    declare city: string | null
    declare province: string | null
    declare educationLevel: 'sd' | 'smp' | 'sma' | 'd3' | 's1' | 's2' | 's3' | null
    declare phoneNumber: string | null
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    // RespondentProfile belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    declare static associations: {
        user: Association<RespondentProfile, User>
    }

    /**
     * Check if all required demographic fields are filled
     */
    isComplete(): boolean {
        return !!(
            this.dateOfBirth &&
            this.gender &&
            this.profession &&
            this.city &&
            this.province &&
            this.educationLevel
        )
    }

    static initModel(sequelize: Sequelize): typeof RespondentProfile {
        RespondentProfile.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true,
                field: 'user_id'
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'date_of_birth'
            },
            gender: {
                type: DataTypes.ENUM('male', 'female', 'other'),
                allowNull: true
            },
            profession: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            city: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            province: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            educationLevel: {
                type: DataTypes.ENUM('sd', 'smp', 'sma', 'd3', 's1', 's2', 's3'),
                allowNull: true,
                field: 'education_level'
            },
            phoneNumber: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'phone_number'
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
            tableName: 'respondent_profiles',
            sequelize
        })

        return RespondentProfile
    }
}
