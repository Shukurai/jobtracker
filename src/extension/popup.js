const API_URL = 'https://jobtracker-three-delta.vercel.app'

let mode = 'auto'
let jobData = { company: '', position: '', url: '' }

async function getSession() {
    return new Promise(resolve => {
        chrome.storage.local.get(['access_token', 'refresh_token', 'expires_at'], async result => {
            const { access_token, refresh_token, expires_at } = result

            if (!access_token) return resolve(null)

            // Проверяем не истёк ли токен (с запасом 60 сек)
            const now = Math.floor(Date.now() / 1000)
            if (expires_at && now < expires_at - 60) {
                return resolve(access_token)
            }

            // Токен истёк — рефрешим
            if (!refresh_token) return resolve(null)

            const refreshed = await refreshAccessToken(refresh_token)
            if (refreshed) {
                const newExpiresAt = Math.floor(Date.now() / 1000) + 3600
                chrome.storage.local.set({
                    access_token: refreshed.access_token,
                    refresh_token: refreshed.refresh_token,
                    expires_at: newExpiresAt
                })
                resolve(refreshed.access_token)
            } else {
                resolve(null) // покажет login prompt
            }
        })
    })
}

async function refreshAccessToken(refreshToken) {
    const res = await fetch('https://wtctnsxlyaxpcanujqjt.supabase.co/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'sb_publishable_mulwuE4jcqJ3da-F89NSXw_7Q41F2Rs'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
    })
    if (res.ok) {
        const data = await res.json()
        return { access_token: data.access_token, refresh_token: data.refresh_token }
    }
    return null
}

function showStatus(msg, type) {
    const el = document.getElementById('status-msg')
    el.textContent = msg
    el.className = `status ${type}`
    el.style.display = 'block'
    if (type === 'success') setTimeout(() => { el.style.display = 'none' }, 3000)
}

async function addApplication(company, position, status, url) {
    const token = await getSession()
    if (!token) {
        document.getElementById('login-prompt').style.display = 'block'
        document.getElementById('main').style.display = 'none'
        return
    }

    const res = await fetch(`${API_URL}/api/extension/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company, position, status, url })
    })

    if (res.ok) {
        showStatus('✓ Added to JobTracker!', 'success')
    } else if (res.status === 401) {
        showStatus('Session expired — log in again', 'error')
        setTimeout(() => {
            document.getElementById('login-prompt').style.display = 'block'
            document.getElementById('main').style.display = 'none'
        }, 1500)
    } else if (res.status === 403) {
        showStatus('Free limit reached — upgrade to Pro ↗', 'error')
        const el = document.getElementById('status-msg')
        el.style.cursor = 'pointer'
        el.onclick = () => chrome.tabs.create({ url: `${API_URL}/board` })
    } else {
        showStatus('Error — try again', 'error')
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = await getSession()

    if (!token) {
        document.getElementById('login-prompt').style.display = 'block'
        return
    }

    document.getElementById('main').style.display = 'block'

    document.getElementById('header-link').addEventListener('click', () => {
        chrome.tabs.query({ url: `${API_URL}/*` }, tabs => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true })
                chrome.windows.update(tabs[0].windowId, { focused: true })
            } else {
                chrome.tabs.create({ url: API_URL })
            }
        })
    })

    // Получаем данные со страницы
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]
        const url = tab.url || ''
        const isSupported = url.includes('linkedin.com/jobs') || url.includes('indeed.com')

        if (!isSupported) {
            document.getElementById('not-supported').style.display = 'block'
            document.getElementById('auto-view').style.display = 'none'
            return
        }

        chrome.tabs.sendMessage(tab.id, { action: 'getJobData' }, data => {
            if (chrome.runtime.lastError) {
                // content script ещё не загружен — игнорируем
                console.log('Content script not ready:', chrome.runtime.lastError.message)
                return
            }
            if (data) {
                jobData = data
                document.getElementById('preview-position').textContent = data.position || 'Unknown position'
                document.getElementById('preview-company').textContent = data.company || 'Unknown company'
                document.getElementById('company').value = data.company || ''
                document.getElementById('position').value = data.position || ''
            }
        })
    })

    // Toggle mode
    document.getElementById('btn-auto').addEventListener('click', () => {
        mode = 'auto'
        document.getElementById('btn-auto').classList.add('active')
        document.getElementById('btn-controlled').classList.remove('active')
        document.getElementById('auto-view').style.display = 'block'
        document.getElementById('controlled-view').style.display = 'none'
    })

    document.getElementById('btn-controlled').addEventListener('click', () => {
        mode = 'controlled'
        document.getElementById('btn-controlled').classList.add('active')
        document.getElementById('btn-auto').classList.remove('active')
        document.getElementById('auto-view').style.display = 'none'
        document.getElementById('controlled-view').style.display = 'block'
    })

    // Auto add
    document.getElementById('auto-add-btn').addEventListener('click', async () => {
        const btn = document.getElementById('auto-add-btn')
        btn.disabled = true
        btn.textContent = 'Adding...'
        await addApplication(jobData.company, jobData.position, 'wishlist', jobData.url)
        btn.disabled = false
        btn.textContent = 'Add to JobTracker'
    })

    // Controlled add
    document.getElementById('controlled-add-btn').addEventListener('click', async () => {
        const company = document.getElementById('company').value.trim()
        const position = document.getElementById('position').value.trim()
        const status = document.getElementById('status').value

        if (!company || !position) {
            showStatus('Company and position are required', 'error')
            return
        }

        const btn = document.getElementById('controlled-add-btn')
        btn.disabled = true
        btn.textContent = 'Adding...'
        await addApplication(company, position, status, jobData.url)
        btn.disabled = false
        btn.textContent = 'Add to JobTracker'
    })

    const hintIcon = document.getElementById('hint-icon')
    const hintTooltip = document.getElementById('hint-tooltip')
    hintIcon.addEventListener('mouseenter', () => hintTooltip.style.display = 'block')
    hintIcon.addEventListener('mouseleave', () => hintTooltip.style.display = 'none')
})