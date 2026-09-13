import { requireRole } from '~~/server/utils/auth'
import { AITokenTransaction } from '~~/server/models/AITokenTransaction'

export default defineEventHandler(async (event) => {
    const user = await requireRole(event, 'peneliti')

    const history = await AITokenTransaction.findAll({
        where: {
            userId: user.id,
            referenceType: 'topup'
        },
        order: [['created_at', 'DESC']],
        limit: 20
    })

    return {
        history: history.map(t => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            midtransOrderId: t.midtransOrderId,
            midtransStatus: t.midtransStatus,
            referenceId: t.referenceId,
            createdAt: t.createdAt
        }))
    }
})
