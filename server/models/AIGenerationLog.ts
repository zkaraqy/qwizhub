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
    Sequelize,
    Op
} from 'sequelize'
import type { User } from './User'
import type { Questionnaire } from './Questionnaire'

type AIGenerationLogAssociations = 'user' | 'questionnaire'

export type AIProvider = 'gemini' | 'openai' | 'openrouter'
export type AIGenerationStatus = 'success' | 'failed' | 'timeout'

export class AIGenerationLog extends Model<
    InferAttributes<AIGenerationLog, { omit: AIGenerationLogAssociations }>,
    InferCreationAttributes<AIGenerationLog, { omit: AIGenerationLogAssociations }>
> {
    declare id: CreationOptional<string>
    declare userId: string
    declare questionnaireId: string | null
    declare provider: AIProvider
    declare status: AIGenerationStatus
    declare requestPayload: Record<string, any> | null
    declare responseData: Record<string, any> | null
    declare errorMessage: string | null
    declare executionTimeMs: number | null
    declare createdAt: CreationOptional<Date>

    // AIGenerationLog belongsTo User
    declare user?: NonAttribute<User>
    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User, string>
    declare createUser: BelongsToCreateAssociationMixin<User>

    // AIGenerationLog belongsTo Questionnaire (optional)
    declare questionnaire?: NonAttribute<Questionnaire>
    declare getQuestionnaire: BelongsToGetAssociationMixin<Questionnaire>
    declare setQuestionnaire: BelongsToSetAssociationMixin<Questionnaire, string>
    declare createQuestionnaire: BelongsToCreateAssociationMixin<Questionnaire>

    declare static associations: {
        user: Association<AIGenerationLog, User>,
        questionnaire: Association<AIGenerationLog, Questionnaire>
    }

    /**
     * Check rate limit for a user
     * Returns the count of requests made in the specified time window
     */
    static async checkRateLimit(
        userId: string, 
        windowMinutes: number = 60
    ): Promise<number> {
        const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000)
        
        const count = await AIGenerationLog.count({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: cutoffTime
                }
            }
        })

        return count
    }

    /**
     * Check if user has exceeded rate limit
     */
    static async hasExceededRateLimit(
        userId: string,
        maxRequests: number = 5,
        windowMinutes: number = 60
    ): Promise<boolean> {
        const count = await this.checkRateLimit(userId, windowMinutes)
        return count >= maxRequests
    }

    /**
     * Get success rate for a user
     */
    static async getSuccessRate(userId: string, days: number = 7): Promise<number> {
        const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        
        const total = await AIGenerationLog.count({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: cutoffTime
                }
            }
        })

        if (total === 0) return 0

        const successful = await AIGenerationLog.count({
            where: {
                userId,
                status: 'success',
                createdAt: {
                    [Op.gte]: cutoffTime
                }
            }
        })

        return (successful / total) * 100
    }

    static initModel(sequelize: Sequelize): typeof AIGenerationLog {
        AIGenerationLog.init({
            id: {
                type: DataTypes.TEXT,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.TEXT,
                allowNull: false,
                field: 'user_id'
            },
            questionnaireId: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'questionnaire_id'
            },
            provider: {
                type: DataTypes.ENUM('gemini', 'openai', 'openrouter'),
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('success', 'failed', 'timeout'),
                allowNull: false
            },
            requestPayload: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'request_payload'
            },
            responseData: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'response_data'
            },
            errorMessage: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'error_message'
            },
            executionTimeMs: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'execution_time_ms'
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            }
        }, {
            tableName: 'ai_generation_logs',
            sequelize,
            timestamps: true,
            updatedAt: false
        })

        return AIGenerationLog
    }
}
