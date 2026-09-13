import { User } from '~~/server/models/User'
import { AITokenTransaction } from '~~/server/models/AITokenTransaction'
import { v4 as uuidv4 } from 'uuid'
import { getMidtransSnap } from '~~/server/utils/midtrans'

// ─── Token Cost Constants ────────────────────────────────────────────────────

export const AI_TOKEN_COST = {
    /** Generate kuisioner penuh dari project (10 token) */
    GENERATE_QUESTIONNAIRE: 10,
    /** Generate / tambah pertanyaan satu-satu (5 token) */
    GENERATE_QUESTIONS: 5,
    /** Review AI kualitas pertanyaan kuisioner (5 token) */
    REVIEW_QUESTION: 5,
    /** Rewrite / Saran perbaikan AI untuk pertanyaan kuisioner (5 token) */
    REWRITE_QUESTION: 5,
    /** Edit / Saran AI saat mengedit kuisioner (5 token) */
    AI_EDIT_SUGGESTION: 5
} as const

// ─── Top Up Package Constants ─────────────────────────────────────────────────

export const TOKEN_PACKAGES = [
    {
        id: 'bronze',
        name: 'Bronze',
        tokens: 30,
        price: 10000,
        description: 'Paket Pemula',
        popular: false,
        icon: '🥉',
        color: '#CD7F32'
    },
    {
        id: 'silver',
        name: 'Silver',
        tokens: 100,
        price: 25000,
        description: 'Paket Standar',
        popular: true,
        icon: '🥈',
        color: '#C0C0C0'
    },
    {
        id: 'gold',
        name: 'Gold',
        tokens: 250,
        price: 55000,
        description: 'Paket Profesional',
        popular: false,
        icon: '🥇',
        color: '#FFD700'
    }
] as const

export type TokenPackageId = typeof TOKEN_PACKAGES[number]['id']

/** Token gratis awal — cukup untuk 1x generate (10) + 1x edit/saran AI (5) = 15 token */
export const INITIAL_FREE_TOKENS = 15

// ─── Core Token Operations ────────────────────────────────────────────────────

/**
 * Get current AI token balance for a user
 */
export async function getTokenBalance(userId: string): Promise<number> {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'ai_token_balance']
    })
    return user?.aiTokenBalance ?? 0
}

/**
 * Check if user has sufficient token balance for an operation
 */
export async function hasSufficientTokens(userId: string, cost: number): Promise<boolean> {
    const balance = await getTokenBalance(userId)
    return balance >= cost
}

/**
 * Deduct tokens from a user's balance.
 * Records a 'debit' transaction for audit trail.
 * Throws an error if balance is insufficient.
 */
export async function deductAITokens(
    userId: string,
    cost: number,
    description: string,
    referenceType?: string,
    referenceId?: string
): Promise<{ balanceBefore: number; balanceAfter: number }> {
    const user = await User.findByPk(userId)

    if (!user) {
        throw new Error(`User ${userId} not found`)
    }

    const balanceBefore = user.aiTokenBalance ?? 0

    if (balanceBefore < cost) {
        throw createError({
            statusCode: 402,
            statusMessage: `Saldo token AI tidak mencukupi. Dibutuhkan ${cost} token, saldo Anda: ${balanceBefore} token.`,
            data: {
                code: 'INSUFFICIENT_AI_TOKENS',
                required: cost,
                available: balanceBefore
            }
        })
    }

    const balanceAfter = balanceBefore - cost

    // Update user balance
    await user.update({ aiTokenBalance: balanceAfter })

    // Record transaction
    await AITokenTransaction.create({
        id: uuidv4(),
        userId,
        type: 'debit',
        amount: cost,
        balanceBefore,
        balanceAfter,
        description: description || 'Penggunaan AI',
        referenceType: referenceType ?? null,
        referenceId: referenceId ?? null,
        midtransOrderId: null,
        midtransStatus: null
    })

    return { balanceBefore, balanceAfter }
}

/**
 * Credit tokens to a user's balance.
 * Records a 'credit' transaction for audit trail.
 */
export async function creditAITokens(
    userId: string,
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string,
    midtransOrderId?: string,
    midtransStatus?: 'pending' | 'success' | 'failed'
): Promise<{ balanceBefore: number; balanceAfter: number }> {
    const user = await User.findByPk(userId)

    if (!user) {
        throw new Error(`User ${userId} not found`)
    }

    const balanceBefore = user.aiTokenBalance ?? 0
    const balanceAfter = balanceBefore + amount

    // Update user balance
    await user.update({ aiTokenBalance: balanceAfter })

    // Record transaction
    await AITokenTransaction.create({
        id: uuidv4(),
        userId,
        type: 'credit',
        amount,
        balanceBefore,
        balanceAfter,
        description: description || 'Top Up Token AI',
        referenceType: referenceType ?? null,
        referenceId: referenceId ?? null,
        midtransOrderId: midtransOrderId ?? null,
        midtransStatus: midtransStatus ?? null
    })

    return { balanceBefore, balanceAfter }
}

/**
 * Get token package by ID
 */
export function getTokenPackage(packageId: string) {
    return TOKEN_PACKAGES.find(p => p.id === packageId) ?? null
}

/**
 * Format token balance for display
 */
export function formatTokenBalance(balance: number): string {
    return `${balance} token`
}

/**
 * Process AI token transaction status update from Midtrans
 * Updates transaction in-place and credits user balance on settlement
 */
export async function processAITokenTransactionStatus(
    orderId: string,
    transactionStatus: string,
    fraudStatus?: string
): Promise<{
    status: 'success' | 'pending' | 'failed' | 'unknown'
    tokensCredited: number
    newBalance?: number
    alreadyProcessed?: boolean
}> {
    const tokenTx = await AITokenTransaction.findOne({
        where: { midtransOrderId: orderId }
    })

    if (!tokenTx) {
        return { status: 'unknown', tokensCredited: 0 }
    }

    // Determine target status
    let midtransStatus: 'pending' | 'success' | 'failed' = 'pending'
    if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
        midtransStatus = 'success'
    } else if (['cancel', 'deny', 'expire', 'failure'].includes(transactionStatus)) {
        midtransStatus = 'failed'
    }

    // Already settled as success? Avoid double-crediting
    if (tokenTx.midtransStatus === 'success') {
        const user = await User.findByPk(tokenTx.userId)
        return {
            status: 'success',
            tokensCredited: 0,
            newBalance: user?.aiTokenBalance ?? 0,
            alreadyProcessed: true
        }
    }

    if (midtransStatus === 'success') {
        const user = await User.findByPk(tokenTx.userId)
        if (!user) {
            throw new Error(`User ${tokenTx.userId} not found for token transaction`)
        }

        const packageId = tokenTx.referenceId ?? ''
        const tokenPackage = getTokenPackage(packageId)
        const tokens = tokenPackage?.tokens ?? tokenTx.amount

        const currentBalance = user.aiTokenBalance ?? 0
        const newBalance = currentBalance + tokens

        // Update user balance atomically
        await user.update({ aiTokenBalance: newBalance })

        // Update the transaction record in-place to success
        await tokenTx.update({
            midtransStatus: 'success',
            amount: tokens,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            description: `Top Up Token AI — Paket ${tokenPackage?.name || packageId} (${tokens} token)`
        })

        console.log(`✅ AI token top up credited: ${tokens} tokens to user ${user.id} (${user.email}). New balance: ${newBalance}`)

        return {
            status: 'success',
            tokensCredited: tokens,
            newBalance
        }
    } else {
        // Update to failed or pending
        await tokenTx.update({ midtransStatus })
        return { status: midtransStatus, tokensCredited: 0 }
    }
}

/**
 * Sync status of a token transaction directly with Midtrans API
 */
export async function syncMidtransTokenTransaction(orderId: string) {
    const snap = getMidtransSnap()
    try {
        const statusResponse = await snap.transaction.status(orderId)
        return await processAITokenTransactionStatus(
            orderId,
            statusResponse.transaction_status,
            statusResponse.fraud_status
        )
    } catch (error: any) {
        // If transaction not found on midtrans yet, leave as pending
        if (error.statusCode === 404 || error.message?.includes('404')) {
            return { status: 'pending' as const, tokensCredited: 0 }
        }
        console.error(`Error querying Midtrans status for order ${orderId}:`, error.message || error)
        throw error
    }
}

/**
 * Ensure peneliti receives initial free tokens (if never granted before)
 */
export async function ensureInitialFreeTokens(userId: string): Promise<number> {
    const user = await User.findByPk(userId)
    if (!user || user.role !== 'peneliti') return 0

    // Check if initial grant has ever been given
    const initialGrant = await AITokenTransaction.findOne({
        where: {
            userId,
            referenceType: 'initial_grant'
        }
    })

    if (!initialGrant) {
        await creditAITokens(
            userId,
            INITIAL_FREE_TOKENS,
            'Token Gratis Awal Peneliti (Selamat datang di QwizHub!)',
            'initial_grant',
            'initial'
        )
        await user.reload()
        console.log(`🎁 Granted initial ${INITIAL_FREE_TOKENS} free tokens to peneliti ${userId}`)
    }

    return user.aiTokenBalance ?? 0
}

