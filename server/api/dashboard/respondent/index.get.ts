import { requireRole } from '~~/server/utils/auth'
import { Response } from '~~/server/models/Response'
import type { H3Event } from 'h3'

/**
 * GET /api/dashboard/respondent
 * Returns statistics for a logged‑in respondent.
 *   - totalQuestionnairesAnswered: number of distinct questionnaires the respondent has completed.
 *   - totalHonorEarned: total honorarium earned from those completed responses.
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    // Ensure the caller is a respondent
    const user = await requireRole(event, 'responden')

    // Fetch all completed responses belonging to this respondent
    const responses = await Response.findAll({
      where: {
        respondentId: user.id,
        status: 'completed'
      },
      attributes: ['questionnaireId', 'honorAmount']
    })

    // Count distinct questionnaire IDs
    const distinctIds = new Set(responses.map((r) => r.questionnaireId))
    const totalQuestionnairesAnswered = distinctIds.size

    // Sum the honor amounts
    const totalHonorEarned = responses.reduce((sum, response) => {
      return sum + (response.honorAmount ?? 0)
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
