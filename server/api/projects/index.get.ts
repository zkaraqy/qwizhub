import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'

export default defineEventHandler(async (event) => {
    try {
        // Only peneliti can view their projects
        const user = await requireRole(event, 'peneliti')

        const query = getQuery(event)
        const status = query.status as string | undefined

        // Build where clause
        const where: any = {
            penelitiId: user.id
        }

        if (status && ['draft', 'published', 'closed'].includes(status)) {
            where.status = status
        }

        // Fetch projects
        const projects = await Project.findAll({
            where,
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'title',
                'description',
                'targetRespondents',
                'status',
                'createdAt',
                'updatedAt'
            ]
        })

        return {
            success: true,
            projects: projects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                targetRespondents: p.targetRespondents,
                status: p.status,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }))
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('List projects error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch projects'
        })
    }
})
