export async function GET() {
    return new Response(
        `User-agent: *
Allow: /
Allow: /privacy
Allow: /terms
Disallow: /board
Disallow: /stats
Disallow: /settings

Sitemap: https://jobtracker-three-delta.vercel.app/sitemap`,
        { headers: { 'Content-Type': 'text/plain' } }
    )
}