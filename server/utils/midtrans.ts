import midtransClient from 'midtrans-client'

export const getMidtransSnap = () => {
    // Determine if we are in production based on env, default to false (sandbox)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'

    return new midtransClient.Snap({
        isProduction: isProduction,
        serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY',
        clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY'
    })
}

export const getMidtransCoreApi = () => {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'

    return new midtransClient.CoreApi({
        isProduction: isProduction,
        serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY',
        clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY'
    })
}
