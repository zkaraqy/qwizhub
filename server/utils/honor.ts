import { User } from '~~/server/models/User'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'

export const MIN_WITHDRAWAL_AMOUNT = 50000

/**
 * Get available balance for withdrawal
 * Available = totalEarned - totalWithdrawn - pendingWithdrawals
 */
export async function getAvailableBalance(userId: string): Promise<number> {
    const user = await User.findByPk(userId)
    if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Calculate pending withdrawals amount
    const pendingAmount = await HonorWithdrawal.sum('amount', {
        where: { 
            respondentId: userId, 
            status: 'sent' 
        }
    }) || 0

    return user.totalHonorEarned - user.totalHonorWithdrawn - pendingAmount
}

/**
 * Check if user has pending withdrawal (status 'sent')
 */
export async function hasPendingWithdrawal(userId: string): Promise<boolean> {
    const count = await HonorWithdrawal.count({
        where: { 
            respondentId: userId, 
            status: 'sent' 
        }
    })
    return count > 0
}

/**
 * Get pending withdrawal for user (if exists)
 */
export async function getPendingWithdrawal(userId: string): Promise<HonorWithdrawal | null> {
    return await HonorWithdrawal.findOne({
        where: { 
            respondentId: userId, 
            status: 'sent' 
        }
    })
}

/**
 * Validate withdrawal amount
 */
export function validateWithdrawalAmount(amount: number, availableBalance: number): { valid: boolean; message?: string } {
    if (!amount || amount < MIN_WITHDRAWAL_AMOUNT) {
        return {
            valid: false,
            message: `Minimal pencairan adalah Rp ${MIN_WITHDRAWAL_AMOUNT.toLocaleString('id-ID')}`
        }
    }

    if (amount > availableBalance) {
        return {
            valid: false,
            message: `Saldo tidak mencukupi. Saldo tersedia: Rp ${availableBalance.toLocaleString('id-ID')}`
        }
    }

    return { valid: true }
}

/**
 * Process withdrawal payment (mark as paid and update user balance)
 */
export async function processWithdrawalPayment(withdrawalId: string, adminId: string): Promise<void> {
    const withdrawal = await HonorWithdrawal.findByPk(withdrawalId, {
        include: [{
            model: User,
            as: 'respondent'
        }]
    })

    if (!withdrawal) {
        throw createError({ statusCode: 404, statusMessage: 'Withdrawal not found' })
    }

    if (withdrawal.status === 'paid') {
        throw createError({ statusCode: 400, statusMessage: 'Withdrawal already paid' })
    }

    // Mark withdrawal as paid
    await withdrawal.markAsPaid(adminId)

    // Update user's totalHonorWithdrawn
    const user = withdrawal.respondent
    if (user) {
        user.totalHonorWithdrawn = (user.totalHonorWithdrawn || 0) + withdrawal.amount
        await user.save()
    }
}
