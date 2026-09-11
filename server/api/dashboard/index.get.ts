import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Transaction } from '~~/server/models/Transaction'
import type { H3Event } from 'h3'
import { Op } from 'sequelize'

/**
 * GET /api/dashboard
 * Returns aggregated statistics for the logged‑in researcher (peneliti).
 *   - total projects owned by the researcher
 *   - total questionnaires belonging to those projects
 *   - total published projects
 *   - total successful responses (proxied by successful transactions)
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    // Ensure the caller is a researcher
    const user = await requireRole(event, 'peneliti')

    // 1. Total projects
    const projectsCount = await Project.count({ where: { penelitiId: user.id } })

    // 2. Total published projects
    const publishedCount = await Project.count({
      where: { penelitiId: user.id, status: 'published' }
    })

    // 3. Total questionnaires belonging to the researcher's projects
    const questionnairesCount = await Questionnaire.count({
      include: [
        {
          model: Project,
          where: { penelitiId: user.id },
          attributes: [], // we only need the join, no columns
          as: 'project'
        }
      ]
    })

    // 4. Total responses – we treat each successful transaction as a response
    const responsesCount = await Transaction.count({
      where: { status: 'success' },
      include: [
        {
          model: Questionnaire,
          include: [
            {
              model: Project,
              where: { penelitiId: user.id },
              attributes: [],
              as: 'project'
            }
          ],
          attributes: [],
          as: 'questionnaire'
        }
      ]
    })

    return {
      success: true,
      stats: {
        projects: projectsCount,
        questionnaires: questionnairesCount,
        published: publishedCount,
        responses: responsesCount
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Dashboard stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dashboard statistics'
    })
  }
})
