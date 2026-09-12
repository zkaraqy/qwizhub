import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { QuestionReviewer } from '~~/server/services/ai/QuestionReviewer'
import { AIService, createAIService } from '~~/server/services/ai/AIService'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const questionId = getRouterParam(event, 'questionId')

        if (!questionnaireId || !questionId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID and Question ID are required'
            })
        }

        // Find question
        const question = await Question.findByPk(questionId, {
            include: [
                { association: 'variable' },
                { association: 'indicator' }
            ]
        })

        if (!question || question.questionnaireId !== questionnaireId) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Question not found'
            })
        }

        // Verify questionnaire and permissions
        const questionnaire = await Questionnaire.findByPk(questionnaireId)

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to review this question'
            })
        }

        // Initialize AI service
        const aiService = createAIService()
        const provider = await aiService.getProvider()
        const reviewer = new QuestionReviewer(provider)

        // Review question
        const review = await reviewer.reviewQuestion({
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options,
            variableName: question.variable?.variableName,
            indicatorName: question.indicator?.indicatorText
        })

        // Save review to question
        question.aiReview = review
        await question.save()

        return {
            success: true,
            message: 'Question reviewed successfully',
            review
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Review question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to review question'
        })
    }
})


// {
//   "success": true,
//   "message": "Question reviewed successfully",
//   "review": {
//     "hasIssues": true,
//     "issues": {
//       "bias": {
//         "detected": true,
//         "note": "Pertanyaan mengarahkan responden untuk memikirkan kontribusi positif dari pengalaman kerja terhadap produktivitas, tanpa mempertimbangkan kemungkinan dampak negatif atau netral."
//       },
//       "ambiguity": {
//         "detected": true,
//         "note": "Istilah 'produktivitas pengembangan perangkat lunak' tidak didefinisikan dengan jelas, yang dapat menyebabkan interpretasi yang berbeda oleh responden."
//       },
//       "doubleBarreled": {
//         "detected": false,
//         "note": null
//       },
//       "redundancy": {
//         "detected": false,
//         "note": null
//       }
//     },
//     "score": 5.5,
//     "reviewedAt": "2026-09-12T08:11:09.656Z"
//   }
// }