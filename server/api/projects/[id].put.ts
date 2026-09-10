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
                statusMessage: 'You do not have permission to update this project'
            })
        }

        const body = await readBody(event)

        // Update allowed fields
        if (body.title !== undefined) {
            if (!body.title || body.title.trim().length === 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Project title cannot be empty'
                })
            }
            project.title = body.title
        }

        if (body.description !== undefined) {
            project.description = body.description
        }

        if (body.targetRespondents !== undefined) {
            project.targetRespondents = body.targetRespondents
        }

        await project.save()

        return {
            success: true,
            message: 'Project updated successfully',
            project: {
                id: project.id,
                title: project.title,
                description: project.description,
                targetRespondents: project.targetRespondents,
                status: project.status,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Update project error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update project'
        })
    }
})
