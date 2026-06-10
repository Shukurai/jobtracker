async function refreshAccessToken(refreshToken) {
    const res = await fetch('https://wtctnsxlyaxpcanujqjt.supabase.co/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'ТВОЙ_ANON_KEY'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
    })
    if (res.ok) {
        const data = await res.json()
        return { access_token: data.access_token, refresh_token: data.refresh_token }
    }
    return null
}

function extractAndSaveToken() {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(c => c.trim().startsWith('sb-') && c.includes('auth-token'))

    if (authCookie) {
        try {
            const value = authCookie.split('=').slice(1).join('=').trim()
            const decoded = atob(value.replace('base64-', ''))
            const data = JSON.parse(decoded)

            if (data?.access_token) {
                chrome.storage.local.set({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_at: data.expires_at
                })
            }
        } catch (e) {
            console.log('Error:', e)
        }
    }
}

extractAndSaveToken()
window.addEventListener('focus', extractAndSaveToken)