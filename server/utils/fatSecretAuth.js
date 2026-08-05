import dotenv from 'dotenv'
dotenv.config()

const client_id = process.env.FATSECRET_CLIENT_ID
const client_secret = process.env.FATSECRET_CLIENT_SECRET

// let — so they can be reassigned (fix 1)
let cachedToken = null
let tokenExpiry = null

async function getAccessToken() {
    // fix 2 — removed the reset lines, cache is preserved between calls

    // if valid token exists, return it — no API call needed
    if (cachedToken != null && Date.now() < tokenExpiry) {
        return cachedToken
    }

    const credentials = `${client_id}:${client_secret}`
    const encoded = Buffer.from(credentials).toString('base64')

    // fix 3 — await fetch directly, no arrow function wrapper
    const response = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            'Authorization': `Basic ${encoded}`,
            'Content-Type': 'application/x-www-form-urlencoded'  // fix 4 — inside headers
        },
        body: 'grant_type=client_credentials&scope=basic'
    })

    // fix 5 — consistent variable name: response
    const data = await response.json()

    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000)

    return cachedToken
}

export default getAccessToken