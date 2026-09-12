import { requireRole } from '~~/server/utils/auth'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Question } from '~~/server/models/Question'
import { Project } from '~~/server/models/Project'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')

        if (!questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        // Fetch questionnaire with project and questions
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'penelitiId', 'title']
                },
                {
                    model: Question,
                    as: 'questions'
                }
            ],
            order: [[{ model: Question, as: 'questions' }, 'orderIndex', 'ASC']]
        })

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        // Check ownership via project
        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to view this questionnaire'
            })
        }

        return {
            success: true,
            questionnaire: {
                id: questionnaire.id,
                projectId: questionnaire.projectId,
                topic: questionnaire.topic,
                researchObjective: questionnaire.researchObjective,
                variables: questionnaire.variables,
                status: questionnaire.status,
                createdAt: questionnaire.createdAt,
                updatedAt: questionnaire.updatedAt,
                project: questionnaire.project ? {
                    id: questionnaire.project.id,
                    title: questionnaire.project.title
                } : null,
                questions: questionnaire.questions?.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    scaleType: q.scaleType,
                    options: q.getFormattedOptions(),
                    orderIndex: q.orderIndex,
                    source: q.source,
                    biasDetected: q.biasDetected,
                    biasNotes: q.biasNotes,
                    variableId: q.variableId,
                    indicatorId: q.indicatorId,
                    aiReview: q.aiReview,
                    aiSuggestions: q.aiSuggestions,
                    createdAt: q.createdAt,
                    updatedAt: q.updatedAt
                })) || []
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Get questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch questionnaire'
        })
    }
})
