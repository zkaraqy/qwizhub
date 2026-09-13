import { requireRole } from '~~/server/utils/auth'
import { Questionnaire, Question, Response, Project, User } from '~~/server/models'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')

        if (!questionnaireId) {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire ID is required' })
        }

        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'title', 'penelitiId']
                },
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id', 'questionText', 'questionType', 'scaleType', 'options', 'orderIndex']
                }
            ],
            order: [[{ model: Question, as: 'questions' }, 'orderIndex', 'ASC']]
        })

        if (!questionnaire) {
            throw createError({ statusCode: 404, statusMessage: 'Kuesioner tidak ditemukan' })
        }

        // Verify researcher owns the questionnaire's project
        if (questionnaire.project?.penelitiId !== user.id) {
            throw createError({ statusCode: 403, statusMessage: 'Anda tidak memiliki akses ke kuesioner ini' })
        }

        // Fetch all responses
        const responses = await Response.findAll({
            where: { questionnaireId },
            include: [
                {
                    model: User,
                    as: 'respondent',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        const totalResponses = responses.length
        const completedResponses = responses.filter(r => r.status === 'completed')
        const inProgressResponses = responses.filter(r => r.status === 'in_progress')
        const completionRate = totalResponses > 0
            ? Math.round((completedResponses.length / totalResponses) * 100)
            : 0

        // Calculate average time spent for completed responses
        let totalDurationSeconds = 0
        let countWithDuration = 0
        completedResponses.forEach(r => {
            if (r.startedAt && r.completedAt) {
                const duration = (new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000
                if (duration > 0 && duration < 7200) { // filter outliers > 2 hours
                    totalDurationSeconds += duration
                    countWithDuration++
                }
            }
        })
        const avgTimeSpentSeconds = countWithDuration > 0
            ? Math.round(totalDurationSeconds / countWithDuration)
            : 0

        // Per-question analysis
        const questionsAnalysis = (questionnaire.questions || []).map((q, qIndex) => {
            const rawOptions = Array.isArray(q.options) ? q.options : []
            const optionsMap: Record<string, { label: string; count: number; percentage: number; score?: number }> = {}

            rawOptions.forEach(opt => {
                const val = typeof opt === 'object' && opt !== null ? (opt.value || opt.label) : String(opt)
                const lbl = typeof opt === 'object' && opt !== null ? (opt.label || opt.value) : String(opt)
                const score = typeof opt === 'object' && opt !== null && typeof opt.score === 'number' ? opt.score : undefined
                optionsMap[val] = { label: lbl, count: 0, percentage: 0, score }
            })

            const textAnswers: string[] = []
            let totalAnswered = 0
            let scoreSum = 0
            let scoreCount = 0

            responses.forEach(r => {
                if (!Array.isArray(r.answers)) return
                const userAnsObj = r.answers.find((a: any) => a.questionId === q.id)
                if (!userAnsObj || userAnsObj.answer === undefined || userAnsObj.answer === null || userAnsObj.answer === '') {
                    return
                }

                totalAnswered++
                const ans = userAnsObj.answer

                if (Array.isArray(ans)) {
                    // Checkbox or multiple options
                    ans.forEach(item => {
                        const itemStr = String(item)
                        if (optionsMap[itemStr]) {
                            optionsMap[itemStr].count++
                            if (optionsMap[itemStr].score !== undefined) {
                                scoreSum += optionsMap[itemStr].score!
                                scoreCount++
                            }
                        } else {
                            optionsMap[itemStr] = { label: itemStr, count: 1, percentage: 0 }
                        }
                    })
                } else if (typeof ans === 'string' && q.questionType === 'text') {
                    textAnswers.push(ans)
                } else {
                    const ansStr = String(ans)
                    if (optionsMap[ansStr]) {
                        optionsMap[ansStr].count++
                        if (optionsMap[ansStr].score !== undefined) {
                            scoreSum += optionsMap[ansStr].score!
                            scoreCount++
                        }
                    } else {
                        optionsMap[ansStr] = { label: ansStr, count: 1, percentage: 0 }
                    }
                }
            })

            // Compute percentages
            const breakdown = Object.values(optionsMap).map(item => ({
                label: item.label,
                count: item.count,
                percentage: totalAnswered > 0 ? Math.round((item.count / totalAnswered) * 100) : 0,
                score: item.score
            }))

            const avgScore = scoreCount > 0 ? Number((scoreSum / scoreCount).toFixed(2)) : null

            return {
                id: q.id,
                orderIndex: q.orderIndex ?? qIndex + 1,
                questionText: q.questionText,
                questionType: q.questionType,
                scaleType: q.scaleType,
                totalAnswered,
                responseRate: totalResponses > 0 ? Math.round((totalAnswered / totalResponses) * 100) : 0,
                breakdown,
                averageScore: avgScore,
                sampleTextAnswers: textAnswers.slice(0, 10),
                totalTextAnswersCount: textAnswers.length
            }
        })

        return {
            success: true,
            questionnaire: {
                id: questionnaire.id,
                projectId: questionnaire.projectId,
                projectTitle: questionnaire.project?.title || '',
                topic: questionnaire.topic,
                researchObjective: questionnaire.researchObjective,
                status: questionnaire.status,
                targetRespondents: questionnaire.targetRespondents || 0,
                currentResponses: totalResponses,
                createdAt: questionnaire.createdAt
            },
            summary: {
                totalResponses,
                completedResponses: completedResponses.length,
                inProgressResponses: inProgressResponses.length,
                completionRate,
                avgTimeSpentSeconds
            },
            questionsAnalysis
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Error fetching questionnaire analysis:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Gagal memuat analisis kuesioner'
        })
    }
})
