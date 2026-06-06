import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://jobtracker-three-delta.vercel.app',
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://jobtracker-three-delta.vercel.app/privacy',
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: 'https://jobtracker-three-delta.vercel.app/terms',
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ]
}