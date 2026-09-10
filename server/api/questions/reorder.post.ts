import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

        // Validate input
        if (!body.questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        if (!Array.isArray(body.questionOrders) || body.questionOrders.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question orders array is required'
            })
        }

        // Verify questionnaire and ownership
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
                statusMessage: 'You do not have permission to reorder questions in this questionnaire'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot reorder questions in published questionnaire'
            })
        }

        // Update order indexes
        const updates = body.questionOrders.map((item: { id: string; orderIndex: number }) =>
            Question.update(
                { orderIndex: item.orderIndex },
                { where: { id: item.id, questionnaireId: body.questionnaireId } }
            )
        )

        await Promise.all(updates)

        return {
            success: true,
            message: 'Questions reordered successfully'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Reorder questions error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to reorder questions'
        })
    }
})
