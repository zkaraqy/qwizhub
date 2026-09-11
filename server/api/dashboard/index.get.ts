import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Response } from '~~/server/models/Response'
import type { H3Event } from 'h3'
import { Op } from 'sequelize'

/**
 * GET /api/dashboard
 * Returns aggregated statistics for the logged‑in researcher (peneliti).
 *   - total projects owned by the researcher
 *   - total questionnaires belonging to those projects
 *   - total published questionnaires
 *   - total completed responses from respondents
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    // Ensure the caller is a researcher
    const user = await requireRole(event, 'peneliti')

    // 1. Total projects
    const projectsCount = await Project.count({ where: { penelitiId: user.id } })


    const userQuestionnaires = await Questionnaire.findAll({
      include: [
        {
          model: Project,
          where: { penelitiId: user.id },
          attributes: [], // we only need the join, no columns
          as: 'project'
        }
      ],
      attributes: ['id', 'status']
    })

    // 2. Total published questionnaires
    const publishedQuestionnairesCount = userQuestionnaires.filter(q => q.status === 'published').length

    // 3. Total questionnaires belonging to the researcher's projects
    const questionnairesCount = userQuestionnaires.length

    // 4. Total responses – count completed responses for published questionnaires
    const publishedQuestionnaireIds = userQuestionnaires
      .filter(q => q.status === 'published')
      .map(q => q.id)

    const responsesCount = publishedQuestionnaireIds.length > 0
      ? await Response.count({
          where: {
            questionnaireId: {
              [Op.in]: publishedQuestionnaireIds
            },
            status: 'completed'
          }
        })
      : 0

    return {
      success: true,
      stats: {
        projects: projectsCount,
        questionnaires: questionnairesCount,
        published: publishedQuestionnairesCount,
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
