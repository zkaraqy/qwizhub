import { defineEventHandler, readBody } from 'h3'
import { Transaction, Questionnaire } from '~~/server/models'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        
        // Midtrans webhook typically sends:
        // transaction_status, order_id, fraud_status, etc.
        const orderId = body.order_id
        const transactionStatus = body.transaction_status
        const fraudStatus = body.fraud_status

        if (!orderId) {
            return { status: 'ignored', message: 'No order_id' }
        }

        const transaction = await Transaction.findByPk(orderId)
        if (!transaction) {
            return { status: 'ignored', message: 'Transaction not found' }
        }

        let newStatus = transaction.status

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                // TODO set transaction status on your database to 'challenge'
                newStatus = 'pending'
            } else if (fraudStatus === 'accept') {
                // TODO set transaction status on your database to 'success'
                newStatus = 'success'
            }
        } else if (transactionStatus === 'settlement') {
            // TODO set transaction status on your database to 'success'
            newStatus = 'success'
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            // TODO set transaction status on your database to 'failure'
            newStatus = transactionStatus === 'expire' ? 'expired' : 'failed'
        } else if (transactionStatus === 'pending') {
            // TODO set transaction status on your database to 'pending' / waiting payment
            newStatus = 'pending'
        }

        if (newStatus !== transaction.status) {
            transaction.status = newStatus
            await transaction.save()

            // If success, update questionnaire status
            if (newStatus === 'success') {
                const questionnaire = await Questionnaire.findByPk(transaction.questionnaireId)
                if (questionnaire) {
                    questionnaire.status = 'published'
                    await questionnaire.save()
                }
            }
        }

        return { status: 'ok' }
    } catch (error) {
        console.error('Midtrans Webhook Error:', error)
        return { status: 'error', message: 'Internal Server Error' }
    }
})
