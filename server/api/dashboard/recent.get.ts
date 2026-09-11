import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Transaction } from '~~/server/models/Transaction'
import type { H3Event } from 'h3'
import { Op } from 'sequelize'

/**
 * GET /api/dashboard/recent
 * Returns a merged list of the latest activity for the current researcher.
 * Activities include project creation/edit, questionnaire creation/edit, and payment transactions.
 */
export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await requireRole(event, 'peneliti')

    // Helper to format date strings consistently
    const formatDate = (d: Date) => d.toISOString()

    // 1. Recent projects (limit 5)
    const recentProjects = await Project.findAll({
      where: { penelitiId: user.id },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'updatedAt']
    })

    const projectActivities = recentProjects.map(p => ({
      id: `project-${p.id}`,
      entityId: p.id,
      type: 'project',
      title: p.title,
      description: 'Project',
      date: formatDate(p.updatedAt as Date)
    }))
    const recentQuestionnaires = await Questionnaire.findAll({
      include: [{ model: Project, where: { penelitiId: user.id }, attributes: ['id'], as: 'project' }],
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'topic', 'updatedAt']
    })

    const questionnaireActivities = recentQuestionnaires.map(q => ({
      id: `questionnaire-${q.id}`,
      entityId: q.id,
      type: 'questionnaire',
      title: q.topic,
      description: 'Questionnaire',
      date: formatDate(q.updatedAt as Date),
      projectId: (q as any).project.id
    }))
    const recentTransactions = await Transaction.findAll({
      where: { status: { [Op.ne]: 'pending' } }, // we want any completed transaction
      include: [{
        model: Questionnaire,
        include: [{ model: Project, where: { penelitiId: user.id }, attributes: [], as: 'project' }],
        attributes: [],
        as: 'questionnaire'
      }],
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'status', 'createdAt']
    })

    const transactionActivities = recentTransactions.map(t => ({
      id: `transaction-${t.id}`,
      entityId: t.id,
      type: 'transaction',
      title: `Payment ${t.status}`,
      description: 'Payment',
      date: formatDate(t.createdAt as Date)
    }))

    // Merge, sort by date descending and limit overall to 10 items
    const merged = [...projectActivities, ...questionnaireActivities, ...transactionActivities]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 10)

    return {
      success: true,
      recentActivities: merged
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Recent activity error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch recent activity'
    })
  }
})
