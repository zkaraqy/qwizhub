import { defineEventHandler, readBody, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from '#auth'
import { getMidtransSnap } from '~~/server/utils/midtrans'
import { Questionnaire, Transaction } from '~~/server/models'

export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)
        if (!session || !session.user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        const userId = session.user.id
        const questionnaireId = event.context.params?.questionnaireId

        console.log('Publishing questionnaire:', questionnaireId, 'by user:', session.user)
        if (!questionnaireId) {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire ID is required' })
        }

        const body = await readBody(event)
        const { targetRespondents, honorariumPerRespondent } = body

        if (!targetRespondents || !honorariumPerRespondent) {
            throw createError({ statusCode: 400, statusMessage: 'Target respondents and honorarium are required' })
        }

        // Fetch questionnaire to ensure it belongs to the user via project
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: ['project']
        })

        if (!questionnaire) {
            throw createError({ statusCode: 404, statusMessage: 'Questionnaire not found' })
        }

        if (questionnaire.project?.peneliti_id !== userId) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
        }

        // Calculate amounts
        const serviceFee = 5000
        const totalAmount = (targetRespondents * honorariumPerRespondent) + serviceFee

        // Create transaction record
        const transactionId = uuidv4()
        
        // Setup midtrans parameter
        const snap = getMidtransSnap()
        const parameter = {
            transaction_details: {
                order_id: transactionId,
                gross_amount: totalAmount
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: session.user.name || 'Peneliti',
                email: session.user.email || ''
            }
        }

        // Get snap token
        const midtransResponse = await snap.createTransaction(parameter)

        // Create transaction
        const transaction = await Transaction.create({
            id: transactionId,
            questionnaireId,
            userId,
            amount: totalAmount,
            targetRespondents,
            honorariumPerRespondent,
            serviceFee,
            status: 'pending',
            snapToken: midtransResponse.token,
            paymentUrl: midtransResponse.redirect_url,
            transactionType: 'questionnaire_publish'
        })

        // Update questionnaire with target respondents (will be published after payment success)
        questionnaire.targetRespondents = targetRespondents
        questionnaire.currentResponses = 0
        await questionnaire.save()

        return {
            success: true,
            transaction: transaction,
            snapToken: midtransResponse.token,
            redirectUrl: midtransResponse.redirect_url
        }
    } catch (error: any) {
        console.error('Publish Questionnaire Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error'
        })
    }
})
