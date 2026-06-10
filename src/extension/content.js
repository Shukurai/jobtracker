function parseJobData() {
    const url = window.location.href
    let company = ''
    let position = ''

    if (url.includes('linkedin.com')) {
        position =
            document.querySelector('a[href*="/jobs/view/"]')?.innerText?.trim() ||
            document.querySelector('h1')?.innerText?.trim() ||
            ''
        company =
            document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.innerText?.trim() ||
            document.querySelector('.jobs-unified-top-card__company-name a')?.innerText?.trim() ||
            [...document.querySelectorAll('a[href*="/company/"]')]
                .find(el => el.innerText?.trim())?.innerText?.trim() ||
            ''
    }

    // Indeed
    if (url.includes('indeed.com')) {
        company = document.querySelector('[data-testid="inlineHeader-companyName"] span')?.innerText?.trim() || ''
        position = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText?.trim() || ''
    }

    return { company, position, url }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJobData') {
        sendResponse(parseJobData())
    }
})