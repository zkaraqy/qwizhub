import { requireRole } from '~~/server/utils/auth'
import { AITokenTransaction } from '~~/server/models/AITokenTransaction'
import { ensureInitialFreeTokens, syncMidtransTokenTransaction } from '~~/server/utils/aiTokens'

export default defineEventHandler(async (event) => {
    const user = await requireRole(event, 'peneliti')

    // 1. Ensure initial free tokens if never granted
    await ensureInitialFreeTokens(user.id)

    // 2. Auto-sync any pending top up transactions with Midtrans
    const pendingTxs = await AITokenTransaction.findAll({
        where: {
            userId: user.id,
            midtransStatus: 'pending',
            type: 'credit'
        },
        limit: 5
    })

    for (const tx of pendingTxs) {
        if (tx.midtransOrderId) {
            try {
                await syncMidtransTokenTransaction(tx.midtransOrderId)
            } catch (err: any) {
                console.warn(`Failed to sync pending token tx ${tx.midtransOrderId}:`, err.message || err)
            }
        }
    }

    // 3. Reload fresh balance
    await user.reload()

    // 4. Fetch recent transactions
    const recentTransactions = await AITokenTransaction.findAll({
        where: { userId: user.id },
        order: [['created_at', 'DESC']],
        limit: 15
    })

    return {
        balance: user.aiTokenBalance ?? 0,
        transactions: recentTransactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            balanceBefore: t.balanceBefore,
            balanceAfter: t.balanceAfter,
            description: t.description,
            referenceType: t.referenceType,
            midtransOrderId: t.midtransOrderId,
            midtransStatus: t.midtransStatus,
            createdAt: t.createdAt
        }))
    }
})

