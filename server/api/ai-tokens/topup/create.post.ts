import { requireRole } from '~~/server/utils/auth'
import { AITokenTransaction } from '~~/server/models/AITokenTransaction'
import { getMidtransSnap } from '~~/server/utils/midtrans'
import { getTokenPackage } from '~~/server/utils/aiTokens'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

        const { packageId } = body

        if (!packageId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Package ID is required'
            })
        }

        // Validate package
        const tokenPackage = getTokenPackage(packageId)
        if (!tokenPackage) {
            throw createError({
                statusCode: 400,
                statusMessage: `Invalid package ID: "${packageId}". Valid options: bronze, silver, gold`
            })
        }

        // Generate unique order ID
        const orderId = `AITOKEN-${packageId.toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`

        // Create pending transaction record
        await AITokenTransaction.create({
            id: uuidv4(),
            userId: user.id,
            type: 'credit',
            amount: tokenPackage.tokens,
            balanceBefore: user.aiTokenBalance ?? 0,
            balanceAfter: (user.aiTokenBalance ?? 0) + tokenPackage.tokens, // tentative, updated on webhook
            description: `Top Up Token AI — Paket ${tokenPackage.name} (${tokenPackage.tokens} token)`,
            referenceType: 'topup',
            referenceId: packageId,
            midtransOrderId: orderId,
            midtransStatus: 'pending'
        })

        // Create Midtrans transaction
        const snap = getMidtransSnap()

        const transactionDetails = {
            transaction_details: {
                order_id: orderId,
                gross_amount: tokenPackage.price
            },
            item_details: [
                {
                    id: `ai-token-${packageId}`,
                    price: tokenPackage.price,
                    quantity: 1,
                    name: `Token AI — Paket ${tokenPackage.name} (${tokenPackage.tokens} token)`
                }
            ],
            customer_details: {
                first_name: user.name || 'Peneliti',
                email: user.email || ''
            },
            callbacks: {
                finish: `${process.env.APP_URL || 'http://localhost:3000'}/payments?status=success`,
                error: `${process.env.APP_URL || 'http://localhost:3000'}/payments?status=error`,
                pending: `${process.env.APP_URL || 'http://localhost:3000'}/payments?status=pending`
            }
        }

        const midtransResponse = await snap.createTransaction(transactionDetails)

        return {
            success: true,
            orderId,
            snapToken: midtransResponse.token,
            paymentUrl: midtransResponse.redirect_url,
            package: {
                id: tokenPackage.id,
                name: tokenPackage.name,
                tokens: tokenPackage.tokens,
                price: tokenPackage.price
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Token top up error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Gagal membuat transaksi top up token AI'
        })
    }
})
