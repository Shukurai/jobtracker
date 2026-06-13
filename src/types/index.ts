export type ApplicationStatus =
    | 'wishlist'
    | 'applied'
    | 'phone_screen'
    | 'interview'
    | 'offer'
    | 'rejected'

export interface Application {
    id: string
    user_id: string
    company: string
    position: string
    url?: string
    status: ApplicationStatus
    notes?: string
    applied_at?: string
    follow_up_date?: string | null
    created_at: string
    updated_at: string
    work_type?: 'remote' | 'hybrid' | 'onsite' | null
    source?: string | null
    job_description?: string | null
    ai_match_score?: {
        score: number
        points: { text: string; positive: boolean } []
        } | null
}

export interface Column {
    id: ApplicationStatus
    label: string
    color: string
}

export const COLUMNS: Column[] = [
    { id: 'wishlist', label: 'Wishlist', color: '#6B7280' },
    { id: 'applied', label: 'Applied', color: '#6C63FF' },
    { id: 'phone_screen', label: 'Phone Screen', color: '#F59E0B' },
    { id: 'interview', label: 'Interview', color: '#3B82F6' },
    { id: 'offer', label: 'Offer', color: '#22C55E' },
    { id: 'rejected', label: 'Rejected', color: '#EF4444' },
]