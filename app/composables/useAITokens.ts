export interface AITokenTransaction {
    id: string
    type: 'credit' | 'debit'
    amount: number
    balanceBefore: number
    balanceAfter: number
    description: string | null
    referenceType: string | null
    midtransOrderId?: string | null
    midtransStatus: 'pending' | 'success' | 'failed' | null
    createdAt: string
}

export interface TokenPackage {
    id: string
    name: string
    tokens: number
    price: number
    description: string
    popular: boolean
    icon: string
    color: string
}

export const useAITokens = () => {
    const balance = useState<number>('aiTokenBalance', () => 0)
    const loading = ref(false)
    const transactions = ref<AITokenTransaction[]>([])

    /**
     * Fetch current balance and recent transactions
     */
    const fetchBalance = async () => {
        try {
            loading.value = true
            const data = await $fetch<{ balance: number; transactions: AITokenTransaction[] }>('/api/ai-tokens/balance')
            balance.value = data.balance
            transactions.value = data.transactions
        } catch (error) {
            console.error('Failed to fetch token balance:', error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a top up transaction and open Midtrans Snap
     */
    const createTopup = async (packageId: string): Promise<{
        snapToken: string
        paymentUrl: string
        orderId: string
    } | null> => {
        try {
            loading.value = true
            const data = await $fetch<{
                snapToken: string
                paymentUrl: string
                orderId: string
            }>('/api/ai-tokens/topup/create', {
                method: 'POST',
                body: { packageId }
            })
            return data
        } catch (error: any) {
            console.error('Failed to create topup:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    /**
     * Verify payment status directly with Midtrans
     */
    const verifyTopup = async (orderId: string) => {
        try {
            const data = await $fetch<{
                success: boolean
                status: string
                tokensCredited: number
                balance: number
                message: string
            }>('/api/ai-tokens/topup/verify', {
                method: 'POST',
                body: { orderId }
            })
            if (typeof data.balance === 'number') {
                balance.value = data.balance
            }
            return data
        } catch (error) {
            console.error('Failed to verify topup:', error)
            return null
        }
    }

    /**
     * Check if user has enough tokens for an operation
     */
    const hasEnoughTokens = (cost: number): boolean => {
        return balance.value >= cost
    }

    /**
     * Format balance for display
     */
    const formattedBalance = computed(() => `${balance.value} token`)

    /**
     * Is balance critically low (< 5 = cannot do any AI operation)
     */
    const isLowBalance = computed(() => balance.value < 5)

    /**
     * Is balance zero
     */
    const isEmptyBalance = computed(() => balance.value === 0)

    return {
        balance,
        loading,
        transactions,
        fetchBalance,
        createTopup,
        verifyTopup,
        hasEnoughTokens,
        formattedBalance,
        isLowBalance,
        isEmptyBalance
    }
}
