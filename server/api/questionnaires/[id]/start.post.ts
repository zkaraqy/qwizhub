import { defineEventHandler, createError } from 'h3'
import { getServerSession } from '#auth'
import { v4 as uuidv4 } from 'uuid'
import { Questionnaire, Question, Response, User, Transaction } from '~~/server/models'

/**
 * POST /api/questionnaires/:id/start
 * Start a new response for a questionnaire
 */
export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)
        if (!session || !session.user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        const userId = session.user.id
        const questionnaireId = event.context.params?.id

        if (!questionnaireId) {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire ID is required' })
        }

        // Check user verification status
        const user = await User.findByPk(userId)
        if (!user || user.verificationStatus !== 'verified') {
            throw createError({ 
                statusCode: 403, 
                statusMessage: 'Account must be verified before responding to questionnaires' 
            })
        }

        // Fetch questionnaire
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: Question,
                    as: 'questions',
                    order: [['orderIndex', 'ASC']]
                }
            ]
        })

        if (!questionnaire) {
            throw createError({ statusCode: 404, statusMessage: 'Questionnaire not found' })
        }

        if (questionnaire.status !== 'published') {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire is not published' })
        }

        if (!questionnaire.isAcceptingResponses()) {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire is not accepting responses' })
        }

        // Check if user already responded
        const existingResponse = await Response.findOne({
            where: {
                questionnaireId: questionnaire.id,
                respondentId: userId
            }
        })

        if (existingResponse) {
            // If in progress, return it
            if (existingResponse.status === 'in_progress') {
                return {
                    success: true,
                    response: {
                        id: existingResponse.id,
                        status: existingResponse.status,
                        answers: existingResponse.answers,
                        startedAt: existingResponse.startedAt
                    },
                    questionnaire: {
                        id: questionnaire.id,
                        topic: questionnaire.topic,
                        questions: questionnaire.questions?.map(q => ({
                            id: q.id,
                            questionText: q.questionText,
                            questionType: q.questionType,
                            scaleType: q.scaleType,
                            options: q.getFormattedOptions(),
                            orderIndex: q.orderIndex
                        }))
                    }
                }
            }
            
            // Already completed
            throw createError({ statusCode: 400, statusMessage: 'You have already responded to this questionnaire' })
        }

        // Get honorarium amount from transaction
        const transaction = await Transaction.findOne({
            where: {
                questionnaireId: questionnaire.id,
                status: 'success'
            }
        })

        const honorAmount = transaction?.honorariumPerRespondent || 0

        // Create new response
        const response = await Response.create({
            id: uuidv4(),
            questionnaireId: questionnaire.id,
            respondentId: userId,
            answers: [],
            status: 'in_progress',
            honorPaid: false,
            honorAmount,
            startedAt: new Date()
        })

        return {
            success: true,
            response: {
                id: response.id,
                status: response.status,
                answers: response.answers,
                startedAt: response.startedAt
            },
            questionnaire: {
                id: questionnaire.id,
                topic: questionnaire.topic,
                questions: questionnaire.questions?.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    scaleType: q.scaleType,
                    options: q.getFormattedOptions(),
                    orderIndex: q.orderIndex
                }))
            }
        }
    } catch (error: any) {
        console.error('Start response error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to start response'
        })
    }
})
