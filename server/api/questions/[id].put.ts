import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionId = getRouterParam(event, 'id')

        if (!questionId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question ID is required'
            })
        }

        const body = await readBody(event)

        // Find question with questionnaire and project
        const question = await Question.findByPk(questionId, {
            include: [
                {
                    association: 'questionnaire',
                    include: ['project']
                }
            ]
        })

        if (!question) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Question not found'
            })
        }

        // Verify ownership through questionnaire -> project -> peneliti
        const questionnaire = question.questionnaire as any
        if (!questionnaire || !questionnaire.project) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire or project not found'
            })
        }

        if (questionnaire.project.peneliti_id !== user.id) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to update this question'
            })
        }

        // Check if questionnaire is still in draft
        if (questionnaire.status !== 'draft') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot update questions in published questionnaire'
            })
        }

        // Update question text if provided
        if (body.questionText !== undefined && body.questionText.trim().length > 0) {
            question.questionText = body.questionText.trim()
        }

        // Update question type if provided
        if (body.questionType !== undefined && body.questionType !== question.questionType) {
            const validation = question.canChangeTypeTo(body.questionType)
            
            if (!validation.allowed) {
                throw createError({
                    statusCode: 400,
                    statusMessage: validation.warning || 'Cannot change question type'
                })
            }

            const oldType = question.questionType
            question.questionType = body.questionType

            // Handle options when changing types
            const newTypeNeedsOptions = ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'mixed', 'filter'].includes(body.questionType)
            const oldTypeHadOptions = ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'mixed', 'filter'].includes(oldType)

            // Clear options if changing to text type
            if (body.questionType === 'text') {
                question.options = []
                question.scaleType = null
            }
            // Preserve options if both types support options
            else if (oldTypeHadOptions && newTypeNeedsOptions) {
                // Keep existing options
            }
            // Clear options if old type didn't have options but new one does
            else if (!oldTypeHadOptions && newTypeNeedsOptions) {
                question.options = []
            }

            // Handle scale type for likert/rating_scale
            if (body.questionType === 'likert' || body.questionType === 'rating_scale') {
                // Set default scale type if not provided
                if (!body.scaleType && !question.scaleType) {
                    question.scaleType = 'likert_5'
                }
            } else if (oldType === 'likert' || oldType === 'rating_scale') {
                // Clear scale type if moving away from scale types
                if (body.questionType !== 'likert' && body.questionType !== 'rating_scale') {
                    question.scaleType = null
                }
            }
        }

        // Update scale type if provided
        if (body.scaleType !== undefined) {
            question.scaleType = body.scaleType
        }

        // Update options if provided
        if (body.options !== undefined && Array.isArray(body.options)) {
            // Validate options structure
            const validOptions = body.options.every((opt: any) => 
                opt && typeof opt === 'object' && 
                'label' in opt && 'value' in opt
            )

            if (!validOptions) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid options format'
                })
            }

            question.options = body.options
        }

        await question.save()

        return {
            success: true,
            message: 'Question updated successfully',
            question: {
                id: question.id,
                questionText: question.questionText,
                questionType: question.questionType,
                scaleType: question.scaleType,
                options: question.options,
                orderIndex: question.orderIndex,
                source: question.source
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Update question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update question'
        })
    }
})

