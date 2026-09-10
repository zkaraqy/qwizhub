import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const projectId = getRouterParam(event, 'id')

        if (!projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID is required'
            })
        }

        const project = await Project.findByPk(projectId)

        if (!project) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Project not found'
            })
        }

        // Check ownership
        if (!project.isOwnedBy(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to delete this project'
            })
        }

        // Delete project (will cascade delete questionnaires and questions)
        await project.destroy()

        return {
            success: true,
            message: 'Project deleted successfully'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Delete project error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete project'
        })
    }
})
