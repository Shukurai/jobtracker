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

async function addApplication(company, position, status, url, description) {
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
        body: JSON.stringify({ company, position, status, url, description })
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

    const supportedIcon = document.getElementById('supported-hint-icon')
    const supportedTooltip = document.getElementById('supported-hint-tooltip')
    if (supportedIcon) {
        supportedIcon.addEventListener('mouseenter', () => supportedTooltip.style.display = 'block')
        supportedIcon.addEventListener('mouseleave', () => supportedTooltip.style.display = 'none')
    }

    // Получаем данные со страницы
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]
        const url = tab.url || ''
        const isSupported =
            // Топ мировые
            url.includes('linkedin.com/jobs') ||
            url.includes('indeed.com') ||
            url.includes('glassdoor.com') ||
            url.includes('glassdoor.at') ||
            url.includes('ziprecruiter.com') ||
            url.includes('wellfound.com') ||
            url.includes('angel.co') ||
            url.includes('monster.com') ||
            url.includes('dice.com') ||
            url.includes('simplyhired.com') ||
            url.includes('flexjobs.com') ||
            url.includes('greenhouse.io') ||
            url.includes('lever.co') ||
            url.includes('myworkdayjobs.com') ||
            url.includes('jobs.smartrecruiters.com') ||
            url.includes('apply.workable.com') ||
            url.includes('boards.greenhouse.io') ||
            url.includes('jobs.lever.co') ||
            // Австрия / DACH
            url.includes('karriere.at') ||
            url.includes('stepstone.at') ||
            url.includes('stepstone.de') ||
            url.includes('jobs.at') ||
            url.includes('ams.at') ||
            url.includes('xing.com') ||
            url.includes('hokify.at') ||
            // СНГ
            url.includes('hh.ru') ||
            url.includes('hh.kz') ||
            url.includes('rabota.ru') ||
            url.includes('superjob.ru') ||
            url.includes('zarplata.ru') ||
            // UK
            url.includes('reed.co.uk') ||
            url.includes('totaljobs.com') ||
            url.includes('cv-library.co.uk') ||
            url.includes('cwjobs.co.uk') ||
            // Азия
            url.includes('seek.com.au') ||
            url.includes('jobstreet.com') ||
            url.includes('naukri.com') ||
            url.includes('shine.com') ||
            // Прочие
            url.includes('jobleads.com') ||
            url.includes('efinancialcareers.com') ||
            url.includes('theladders.com') ||
            url.includes('snagajob.com') ||
            url.includes('careerbuilder.com') ||
            url.includes('idealist.org') ||
            url.includes('workopolis.com') ||
            url.includes('jobillico.com')

        if (!isSupported) {
            document.getElementById('not-supported').style.display = 'block'
            document.getElementById('auto-view').style.display = 'none'
            return
        }

        chrome.tabs.sendMessage(tab.id, { action: 'getJobData' }, data => {
            if (chrome.runtime.lastError) return
            if (data) {
                jobData = data
                document.getElementById('preview-position').textContent = data.position || 'Unknown position'
                document.getElementById('preview-company').textContent = data.company || 'Unknown company'
                document.getElementById('company').value = data.company || ''
                document.getElementById('position').value = data.position || ''

                if (data.confidence === 'low' || data.confidence === 'medium') {
                    mode = 'controlled'
                    document.getElementById('btn-controlled').classList.add('active')
                    document.getElementById('btn-auto').classList.remove('active')
                    document.getElementById('auto-view').style.display = 'none'
                    document.getElementById('controlled-view').style.display = 'block'
                    showStatus('Please verify the details below', 'warning')
                }
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
        const description = document.getElementById('description').value.trim()
        await addApplication(jobData.company, jobData.position, 'wishlist', jobData.url, description)
        btn.disabled = false
        btn.textContent = 'Add to JobTracker'
    })

    // Controlled add
    document.getElementById('controlled-add-btn').addEventListener('click', async () => {
        const company = document.getElementById('company').value.trim()
        const position = document.getElementById('position').value.trim()
        const status = document.getElementById('status').value
        const description = document.getElementById('description-controlled').value.trim()

        if (!company || !position) {
            showStatus('Company and position are required', 'error')
            return
        }

        const btn = document.getElementById('controlled-add-btn')
        btn.disabled = true
        btn.textContent = 'Adding...'
        await addApplication(company, position, status, jobData.url, description)
        btn.disabled = false
        btn.textContent = 'Add to JobTracker'
    })

    const hintIcon = document.getElementById('hint-icon')
    const hintTooltip = document.getElementById('hint-tooltip')
    hintIcon.addEventListener('mouseenter', () => hintTooltip.style.display = 'block')
    hintIcon.addEventListener('mouseleave', () => hintTooltip.style.display = 'none')
})