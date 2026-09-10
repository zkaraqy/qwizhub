import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Question } from '~~/server/models/Question'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const projectId = getRouterParam(event, 'id')
        const questionnaireId = getRouterParam(event, 'questionnaireId')

        if (!projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID is required'
            })
        }

        if (!questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        // Fetch questionnaire with questions and project
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'title', 'description', 'peneliti_id']
                },
                {
                    model: Question,
                    as: 'questions',
                    attributes: [
                        'id',
                        'questionText',
                        'questionType',
                        'scaleType',
                        'options',
                        'orderIndex',
                        'source',
                        'biasDetected',
                        'biasNotes',
                        'createdAt',
                        'updatedAt'
                    ]
                }
            ]
        })

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        // Verify questionnaire belongs to the correct project
        if (questionnaire.projectId !== projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire does not belong to this project'
            })
        }

        // Check ownership
        if (!questionnaire.project?.isOwnedBy(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to view this questionnaire'
            })
        }

        // Sort questions by orderIndex
        const sortedQuestions = questionnaire.questions?.sort((a, b) => a.orderIndex - b.orderIndex) || []

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
                updatedAt: questionnaire.updatedAt
            },
            project: {
                id: questionnaire.project?.id,
                title: questionnaire.project?.title,
                description: questionnaire.project?.description
            },
            questions: sortedQuestions.map(q => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType,
                scaleType: q.scaleType,
                options: q.options,
                orderIndex: q.orderIndex,
                source: q.source,
                biasDetected: q.biasDetected,
                biasNotes: q.biasNotes,
                createdAt: q.createdAt,
                updatedAt: q.updatedAt
            }))
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
