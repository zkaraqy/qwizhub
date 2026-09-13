import { requireRole } from '~~/server/utils/auth'
import { syncMidtransTokenTransaction } from '~~/server/utils/aiTokens'
import { AITokenTransaction } from '~~/server/models/AITokenTransaction'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

        const { orderId } = body

        if (!orderId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Order ID is required'
            })
        }

        // Verify order belongs to this user
        const tokenTx = await AITokenTransaction.findOne({
            where: { midtransOrderId: orderId, userId: user.id }
        })

        if (!tokenTx) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Transaksi token tidak ditemukan'
            })
        }

        // Query Midtrans status and process settlement if paid
        const result = await syncMidtransTokenTransaction(orderId)

        // Reload user to get fresh balance
        await user.reload()

        return {
            success: result.status === 'success',
            status: result.status,
            tokensCredited: result.tokensCredited,
            balance: user.aiTokenBalance,
            message: result.status === 'success'
                ? `Pembayaran berhasil! ${result.tokensCredited ? `${result.tokensCredited} token telah ditambahkan. ` : ''}Saldo Anda: ${user.aiTokenBalance} token.`
                : result.status === 'pending'
                ? 'Pembayaran belum diselesaikan atau sedang diproses.'
                : `Status pembayaran: ${result.status}`
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Error verifying token topup:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Gagal memverifikasi status pembayaran'
        })
    }
})
