import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

        // Validate required fields
        if (!body.questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        if (!body.questionText || body.questionText.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question text is required'
            })
        }

        if (!body.questionType) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question type is required'
            })
        }

        // Verify questionnaire exists and user can edit
        const questionnaire = await Questionnaire.findByPk(body.questionnaireId)

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to add questions to this questionnaire'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot add questions to published questionnaire'
            })
        }

        // Get next order index
        const maxOrder = await Question.max('orderIndex', {
            where: { questionnaireId: body.questionnaireId }
        })
        const nextOrder = (maxOrder || 0) + 1

        // Create question
        const question = await Question.create({
            id: uuidv4(),
            questionnaireId: body.questionnaireId,
            questionText: body.questionText,
            questionType: body.questionType,
            scaleType: body.scaleType || null,
            options: body.options || [],
            orderIndex: nextOrder,
            source: 'manual',
            biasDetected: false,
            biasNotes: null
        })

        return {
            success: true,
            message: 'Question added successfully',
            question: {
                id: question.id,
                questionText: question.questionText,
                questionType: question.questionType,
                scaleType: question.scaleType,
                options: question.getFormattedOptions(),
                orderIndex: question.orderIndex,
                source: question.source,
                biasDetected: question.biasDetected,
                biasNotes: question.biasNotes,
                createdAt: question.createdAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Create question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create question'
        })
    }
})
