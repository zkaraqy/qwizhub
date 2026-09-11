import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'crypto'
import { Transaction, Questionnaire } from '~~/server/models'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        
        console.log('=== Midtrans Webhook Received ===')
        console.log('Timestamp:', new Date().toISOString())
        console.log('Payload:', JSON.stringify(body, null, 2))
        
        // Extract webhook data
        const orderId = body.order_id
        const transactionStatus = body.transaction_status
        const fraudStatus = body.fraud_status
        const signatureKey = body.signature_key
        const grossAmount = body.gross_amount
        const statusCode = body.status_code

        if (!orderId) {
            console.warn('Webhook ignored: No order_id')
            return { status: 'ignored', message: 'No order_id' }
        }

        // Verify signature for security
        const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
        const expectedSignature = crypto
            .createHash('sha512')
            .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
            .digest('hex')

        if (signatureKey !== expectedSignature) {
            console.error('⚠️ Invalid signature detected!')
            console.error('Received:', signatureKey)
            console.error('Expected:', expectedSignature)
            return { status: 'error', message: 'Invalid signature' }
        }

        console.log('✓ Signature verified')

        // Find transaction
        const transaction = await Transaction.findByPk(orderId)
        if (!transaction) {
            console.warn('Webhook ignored: Transaction not found', orderId)
            return { status: 'ignored', message: 'Transaction not found' }
        }

        console.log('Current transaction status:', transaction.status)
        console.log('Transaction type:', transaction.transactionType)
        console.log('Midtrans transaction status:', transactionStatus)

        // Determine new status based on Midtrans response
        let newStatus = transaction.status

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                newStatus = 'pending'
                console.log('→ Status: Payment captured but challenged (fraud detection)')
            } else if (fraudStatus === 'accept') {
                newStatus = 'success'
                console.log('→ Status: Payment captured and accepted')
            }
        } else if (transactionStatus === 'settlement') {
            newStatus = 'success'
            console.log('→ Status: Payment settled')
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            newStatus = transactionStatus === 'expire' ? 'expired' : 'failed'
            console.log(`→ Status: Payment ${transactionStatus}`)
        } else if (transactionStatus === 'pending') {
            newStatus = 'pending'
            console.log('→ Status: Payment pending')
        }

        // Update transaction if status changed
        if (newStatus !== transaction.status) {
            transaction.status = newStatus
            await transaction.save()
            console.log('✓ Transaction updated to:', newStatus)

            // Process based on transaction type
            if (newStatus === 'success') {
                if (transaction.transactionType === 'questionnaire_access') {
                    // PAYMENT FOR QUESTIONNAIRE ACCESS - Update existing questionnaire
                    console.log('→ Processing questionnaire access payment...')
                    
                    const questionnaire = await Questionnaire.findByPk(transaction.questionnaireId)
                    
                    if (!questionnaire) {
                        console.error('❌ Questionnaire not found:', transaction.questionnaireId)
                        return { status: 'error', message: 'Questionnaire not found' }
                    }

                    // Update questionnaire to mark as paid
                    questionnaire.paidForAccess = true
                    questionnaire.accessPaymentId = transaction.id
                    questionnaire.accessPaymentDate = new Date()
                    await questionnaire.save()

                    console.log('✅ Questionnaire access payment completed:', questionnaire.id)

                } else if (transaction.transactionType === 'questionnaire_publish') {
                    // PAYMENT FOR QUESTIONNAIRE PUBLISH
                    console.log('→ Processing questionnaire publish payment...')
                    const questionnaire = await Questionnaire.findByPk(transaction.questionnaireId)
                    
                    if (questionnaire) {
                        if (questionnaire.status !== 'published') {
                            questionnaire.status = 'published'
                            await questionnaire.save()
                            console.log('✅ Questionnaire published:', questionnaire.id)
                        } else {
                            console.log('ℹ️ Questionnaire already published')
                        }
                    } else {
                        console.error('❌ Questionnaire not found:', transaction.questionnaireId)
                    }
                }
            }
        } else {
            console.log('ℹ️ No status change needed')
        }

        console.log('=== Webhook Processing Complete ===')
        return { 
            status: 'ok',
            message: 'Webhook processed successfully',
            transactionId: orderId,
            transactionType: transaction.transactionType,
            oldStatus: transaction.status,
            newStatus: newStatus
        }
    } catch (error) {
        console.error('❌ Midtrans Webhook Error:', error)
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
        return { 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Internal Server Error'
        }
    }
})
