function extractAndSaveToken() {
    const cookies = document.cookie.split(';')

    const authCookie = cookies.find(c => c.trim().startsWith('sb-') && c.includes('auth-token'))

    if (authCookie) {
        try {
            const value = authCookie.split('=').slice(1).join('=').trim()
            const decoded = atob(value.replace('base64-', ''))
            const data = JSON.parse(decoded)
            const token = data?.access_token

            if (token) {
                chrome.storage.local.set({ access_token: token }, () => {
                    console.log('Token saved!')
                })
            }
        } catch (e) {
            console.log('Error:', e)
        }
    }
}

extractAndSaveToken()
window.addEventListener('focus', extractAndSaveToken)