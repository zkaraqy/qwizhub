import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { QuestionRewriter } from '~~/server/services/ai/QuestionRewriter'
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
                statusMessage: 'You do not have permission to rewrite this question'
            })
        }

        // Initialize AI service
        const aiService = createAIService() 
        const provider = await aiService.getProvider()
        const rewriter = new QuestionRewriter(provider)

        // Get detected issues from review if available
        let detectedIssues
        if (question.aiReview?.issues) {
            detectedIssues = {
                bias: question.aiReview.issues.bias?.detected,
                ambiguity: question.aiReview.issues.ambiguity?.detected,
                doubleBarreled: question.aiReview.issues.doubleBarreled?.detected
            }
        }

        // Generate rewrites
        const result = await rewriter.suggestRewrites({
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options,
            variableName: question.variable?.variableName,
            indicatorName: question.indicator?.indicatorText,
            detectedIssues
        })

        // Save suggestions to question
        question.aiSuggestions = {
            rewrites: result.rewrites,
            scaleRecommendation: result.scaleRecommendation
        }
        
        if (result.scaleRecommendation) {
            question.recommendedScaleType = result.scaleRecommendation.scaleType
        }
        
        await question.save()

        return {
            success: true,
            message: 'Rewrite suggestions generated successfully',
            suggestions: {
                rewrites: result.rewrites,
                scaleRecommendation: result.scaleRecommendation
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Rewrite question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to generate rewrite suggestions'
        })
    }
})


// {
//   "success": true,
//   "message": "Rewrite suggestions generated successfully",
//   "suggestions": {
//     "rewrites": [
//       {
//         "version": "Versi Netral",
//         "questionText": "Bagaimana Anda menilai pengaruh penggunaan metode Agile terhadap produktivitas tim?",
//         "rationale": "Pertanyaan ini diubah untuk menghindari bias dengan tidak menyiratkan bahwa Agile pasti meningkatkan produktivitas. Ini juga menghindari masalah double-barreled dengan fokus pada satu aspek (pengaruh terhadap produktivitas)."
//       },
//       {
//         "version": "Versi Fokus pada Metode",
//         "questionText": "Seberapa efektif menurut Anda metode Agile dalam meningkatkan produktivitas tim?",
//         "rationale": "Pertanyaan ini lebih fokus pada efektivitas metode Agile secara spesifik, menghilangkan bias yang mungkin timbul dari pertanyaan asli."
//       },
//       {
//         "version": "Versi Fokus pada Produktivitas",
//         "questionText": "Seberapa besar Anda percaya bahwa produktivitas tim dipengaruhi oleh metode Agile?",
//         "rationale": "Pertanyaan ini memungkinkan responden untuk mengekspresikan tingkat kepercayaan mereka terhadap pengaruh metode Agile terhadap produktivitas, tanpa mengasumsikan bahwa Agile selalu meningkatkan produktivitas."
//       }
//     ],
//     "scaleRecommendation": {
//       "scaleType": "likert_5",
//       "rationale": "Skala Likert 5 poin cukup untuk mengukur persepsi atau opini dengan baik tanpa membuat responden bingung dengan terlalu banyak pilihan, yang mungkin terjadi pada skala Likert 7 poin atau lebih."
//     }
//   }
// }