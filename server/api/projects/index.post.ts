import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        // Only peneliti can create projects
        const user = await requireRole(event, 'peneliti')

        const body = await readBody(event)

        // Validate required fields
        if (!body.title || body.title.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project title is required'
            })
        }

        if (body.title.length > 200) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project title must not exceed 200 characters'
            })
        }

        // Create project
        const project = await Project.create({
            id: uuidv4(),
            penelitiId: user.id,
            title: body.title,
            description: body.description || null,
            targetRespondents: body.targetRespondents || {},
            status: 'draft'
        })

        return {
            success: true,
            message: 'Project created successfully',
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

        console.error('Create project error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create project'
        })
    }
})
