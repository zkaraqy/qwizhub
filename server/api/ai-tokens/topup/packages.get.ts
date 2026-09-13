import { TOKEN_PACKAGES, AI_TOKEN_COST, INITIAL_FREE_TOKENS } from '~~/server/utils/aiTokens'

export default defineEventHandler(async () => {
    return {
        packages: TOKEN_PACKAGES,
        costs: AI_TOKEN_COST,
        initialFreeTokens: INITIAL_FREE_TOKENS
    }
})
