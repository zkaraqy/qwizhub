import { requireRole } from '~~/server/utils/auth'
import { Transaction } from '~~/server/models/Transaction'
import type { H3Event } from 'h3'

/**
 * GET /api/dashboard/respondent
 * Returns statistics for a logged‑in respondent.
 *   - totalQuestionnairesAnswered: number of distinct questionnaires the respondent has completed (i.e., has a successful transaction).
 *   - totalHonorEarned: total honorarium earned from those successful transactions.
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    // Ensure the caller is a respondent
    const user = await requireRole(event, 'responden')

    // Fetch all successful transactions belonging to this respondent
    const transactions = await Transaction.findAll({
      where: {
        userId: user.id,
        status: 'success'
      },
      attributes: ['questionnaireId', 'honorariumPerRespondent']
    })

    // Count distinct questionnaire IDs
    const distinctIds = new Set(transactions.map((t) => t.questionnaireId))
    const totalQuestionnairesAnswered = distinctIds.size

    // Sum the honorarium per respondent
    const totalHonorEarned = transactions.reduce((sum, tx) => {
      return sum + (tx.honorariumPerRespondent ?? 0)
    }, 0)

    return {
      success: true,
      stats: {
        totalQuestionnairesAnswered,
        totalHonorEarned
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Respondent dashboard stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch respondent dashboard statistics'
    })
  }
})
