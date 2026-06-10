const API_URL = 'https://jobtracker-three-delta.vercel.app'

let mode = 'auto'
let jobData = { company: '', position: '', url: '' }

async function getSession() {
    return new Promise(resolve => {
        chrome.storage.local.get(['access_token'], result => {
            resolve(result.access_token || null)
        })
    })
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
        await addApplication(jobData.company, jobData.position, 'applied', jobData.url)
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
})