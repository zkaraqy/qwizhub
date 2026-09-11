import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Transaction } from '~~/server/models/Transaction'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { getMidtransSnap } from '~~/server/utils/midtrans'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        // Only peneliti can create questionnaires
        const user = await requireRole(event, 'peneliti')

        const body = await readBody(event)
        const { projectId } = body

        // Validate projectId
        if (!projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID is required'
            })
        }

        // Verify project exists and user owns it
        const project = await Project.findByPk(projectId)

        if (!project) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Project not found'
            })
        }

        if (!project.isOwnedBy(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to create questionnaire for this project'
            })
        }

        // Step 1: Create questionnaire FIRST (unpaid)
        const questionnaireId = uuidv4()
        const newQuestionnaire = await Questionnaire.create({
            id: questionnaireId,
            projectId: projectId,
            topic: '',
            researchObjective: '',
            variables: [],
            status: 'draft',
            paidForAccess: false, // Not paid yet
            accessPaymentId: null,
            accessPaymentDate: null
        })

        // Step 2: Create transaction record for questionnaire access payment
        const transactionId = uuidv4()
        const accessFee = 5000

        // Setup midtrans parameter
        const snap = getMidtransSnap()
        const parameter = {
            transaction_details: {
                order_id: transactionId,
                gross_amount: accessFee
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                first_name: user.name || 'Peneliti',
                email: user.email || ''
            },
            item_details: [
                {
                    id: 'questionnaire_access',
                    price: accessFee,
                    quantity: 1,
                    name: 'Akses Form Kuesioner AI'
                }
            ]
        }

        // Get snap token from Midtrans
        const midtransResponse = await snap.createTransaction(parameter)

        // Create transaction record with valid questionnaireId
        const transaction = await Transaction.create({
            id: transactionId,
            questionnaireId: questionnaireId, // Valid questionnaire ID
            userId: user.id,
            amount: accessFee,
            targetRespondents: 0,
            honorariumPerRespondent: 0,
            serviceFee: accessFee,
            status: 'pending',
            transactionType: 'questionnaire_access',
            metadata: {
                projectId: projectId,
                userId: user.id,
                questionnaireId: questionnaireId
            },
            snapToken: midtransResponse.token,
            paymentUrl: midtransResponse.redirect_url
        })

        return {
            success: true,
            transactionId: transaction.id,
            questionnaireId: questionnaireId,
            snapToken: midtransResponse.token,
            redirectUrl: midtransResponse.redirect_url
        }
    } catch (error: any) {
        console.error('Create questionnaire access payment error:', error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to process payment'
        })
    }
})
