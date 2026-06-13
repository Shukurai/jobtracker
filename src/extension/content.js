function parseJobData() {
    const url = window.location.href
    let company = ''
    let position = ''
    let confidence = 'high'

    // LinkedIn
    if (url.includes('linkedin.com')) {
        position =
            document.querySelector('[class*="job-details"] h1')?.innerText?.trim() ||
            document.querySelector('a[href*="/jobs/view/"]')?.innerText?.trim() ||
            document.querySelector('h1')?.innerText?.trim() ||
            ''
        company =
            document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.innerText?.trim() ||
            document.querySelector('.jobs-unified-top-card__company-name a')?.innerText?.trim() ||
            [...document.querySelectorAll('a[href*="/company/"]')]
                .find(el => el.innerText?.trim())?.innerText?.trim() ||
            ''
        return { company, position, url, confidence }
    }

    // Indeed
    if (url.includes('indeed.com')) {
        company = document.querySelector('[data-testid="inlineHeader-companyName"] span')?.innerText?.trim() || ''
        position = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText?.trim() || ''
        return { company, position, url, confidence }
    }

    // Неизвестный сайт — эвристика
    confidence = 'low'

    // Позиция — h1
    position = document.querySelector('h1')?.innerText?.trim() || ''

    // Компания — пробуем несколько источников
    // 1. JSON-LD структурированные данные
    try {
        const jsonld = document.querySelector('script[type="application/ld+json"]')?.textContent
        if (jsonld) {
            const data = JSON.parse(jsonld)
            const job = Array.isArray(data) ? data.find(d => d['@type'] === 'JobPosting') : data
            if (job?.['@type'] === 'JobPosting') {
                position = position || job.title || ''
                company = job.hiringOrganization?.name || ''
                confidence = 'medium'
            }
        }
    } catch { }

    // 2. Мета теги
    if (!company) {
        company =
            document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
            document.querySelector('meta[name="author"]')?.getAttribute('content') ||
            ''
    }

    // 3. Title страницы — часто формат "Position | Company" или "Company - Position"
    if (!company && document.title) {
        const title = document.title
        const separators = [' | ', ' - ', ' – ', ' — ', ' at ']
        for (const sep of separators) {
            if (title.includes(sep)) {
                const parts = title.split(sep)
                if (parts.length >= 2) {
                    if (!position) position = parts[0].trim()
                    company = parts[parts.length - 1].trim()
                    break
                }
            }
        }
    }

    // 4. Домен как fallback
    if (!company) {
        try {
            const hostname = new URL(url).hostname
            company = hostname.replace('www.', '').split('.')[0]
            company = company.charAt(0).toUpperCase() + company.slice(1)
        } catch { }
    }

    return { company, position, url, confidence }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJobData') {
        sendResponse(parseJobData())
    }
})