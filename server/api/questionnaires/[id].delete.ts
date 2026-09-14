import { requireRole } from '~~/server/utils/auth'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
  try {
    // Ensure the caller is authenticated as peneliti
    const user = await requireRole(event, 'peneliti')
    
    const questionnaireId = getRouterParam(event, 'id')

    if (!questionnaireId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Questionnaire ID is required'
      })
    }

    // Find the questionnaire by id
    const questionnaire = await Questionnaire.findByPk(questionnaireId)

    // If questionnaire not found, return 404
    if (!questionnaire) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Questionnaire not found'
      })
    }

    // Check ownership - only the owner can delete
    if (!await questionnaire.canEdit(user.id)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to delete this questionnaire'
      })
    }

    // Delete the questionnaire
    await questionnaire.destroy()

    // Return success response
    return {
      success: true,
      message: 'Questionnaire deleted successfully'
    }
  } catch (error: any) {
    // Propagate known errors
    if (error.statusCode) {
      throw error
    }

    // Log and handle unexpected errors
    console.error('Delete questionnaire error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete questionnaire'
    })
  }
})
