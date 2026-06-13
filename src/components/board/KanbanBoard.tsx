'use client'

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
} from '@dnd-kit/core'
import { Application, ApplicationStatus, COLUMNS } from '@/types'
import { ExternalLink } from 'lucide-react'
import { daysSince } from '@/lib/utils'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'



function getDateColor(dateStr: string): string {
    const days = daysSince(dateStr)
    if (days <= 7) return '#22C55E'
    if (days <= 30) return '#F59E0B'
    return '#EF4444'
}

function CompanyLogo({ url, company }: { url?: string | null; company: string }) {
    const [error, setError] = useState(false)

    let domain = null
    try {
        if (url) domain = new URL(url).hostname
    } catch { }

    if (!domain || error) {
        return (
            <div className="w-7 h-7 rounded-md bg-border flex items-center justify-center text-xs font-bold text-muted flex-shrink-0">
                {company[0].toUpperCase()}
            </div>
        )
    }

    return (
        <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt={company}
            width={28}
            height={28}
            onError={() => setError(true)}
            className="w-7 h-7 rounded-md object-contain bg-border flex-shrink-0"
        />
    )
}

function DraggableCard({
    application,
    onClick,
    index,
    selectionMode,
    isSelected,
    onToggleSelect,
}: {
    application: Application
    onClick: () => void
    index: number
    selectionMode: boolean
    isSelected: boolean
    onToggleSelect: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id,
        disabled: selectionMode,
    })
    const column = COLUMNS.find(c => c.id === application.status)
    const days = daysSince(application.applied_at ?? application.created_at)
    const hasMoved = useRef(false)

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 999 : undefined,
        position: isDragging ? 'relative' as const : undefined,
        animation: `fadeInUp 0.25s ease forwards`,
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
    }

    return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={() => { hasMoved.current = false }}
      onPointerMove={() => { hasMoved.current = true }}
      onPointerUp={() => {
          if (hasMoved.current) return
          if (selectionMode) onToggleSelect(application.id)
          else onClick()
      }}
            className={`relative w-full bg-surface border rounded-xl p-4 ${selectionMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} hover:border-muted transition-all group select-none
    ${isDragging ? 'opacity-20' : 'opacity-100'}
    ${isSelected ? 'border-text ring-1 ring-text' : application.follow_up_date ? 'border-warning/40' : 'border-border'}`}
    >
      {selectionMode && (
          <div className="absolute top-3 right-3 z-10">
              <div className={`w-4 h-4 rounded border flex items-center justify-center
                  ${isSelected ? 'bg-text border-text' : 'border-border'}`}>
                  {isSelected && <span className="text-bg text-xs leading-none">✓</span>}
              </div>
          </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 ">
          <CompanyLogo url={application.url} company={application.company} />
          <span className="text-sm font-semibold text-text leading-tight">
            {application.company}
          </span>
        </div>
        {application.url && !selectionMode && (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={e => e.stopPropagation()}
            className="text-muted hover:text-text transition-colors opacity-0 group-hover:opacity-100"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

        <div className="flex justify-between items-center">
                <p className="text-xs text-muted mt-2 mb-2 leading-tight">{application.position}</p>

                {application.work_type && (
                    <span className={`text-xs items-center px-2 py-0.5 rounded-full font-medium inline-block
        ${application.work_type === 'remote' ? 'bg-success/15 text-success' :
                            application.work_type === 'hybrid' ? 'bg-info/15 text-info' :
                                'bg-muted/15 text-muted'}`}
                    >
                        {application.work_type}
                    </span>
                )}
        </div>
        
            <div className="flex items-center justify-between">
                <span
                    className="text-xs"
                    style={{ color: getDateColor(application.applied_at ?? application.created_at) }}
                >
                    {days === 0 ? 'Today' : `${days}d ago`}
                </span>
                <div className="flex items-center gap-2">
                    {application.status === 'wishlist' && daysSince(application.applied_at ?? application.created_at) > 2 && (
                        <span className="text-xs text-warning">⚠ Apply soon</span>
                    )}
                    {application.ai_match_score && (
                        <span className="text-xs font-semibold" style={{
                            color: application.ai_match_score.score >= 70 ? '#22C55E'
                                : application.ai_match_score.score >= 40 ? '#F59E0B'
                                    : '#EF4444'
                        }}>
                            {application.ai_match_score.score}%
                        </span>
                    )}
                </div>
            </div>
    </div >
  )
}

function CardOverlay({ application }: { application: Application }) {
    const column = COLUMNS.find(c => c.id === application.status)
    const days = daysSince(application.applied_at ?? application.created_at)

    return (
        <div className="bg-surface border border-muted rounded-xl p-4 w-64 shadow-2xl rotate-2 cursor-grabbing select-none">
            <div className="flex gap-1">
                <CompanyLogo url={application.url} company={application.company} />
                <p className="text-sm font-semibold text-text leading-tight mb-1">{application.company}</p>
            </div>
            <p className="text-xs text-muted mb-3 leading-tight">{application.position}</p>
            <div className="flex items-center justify-between">
                <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: column?.color + '22', color: column?.color }}
                >
                    {column?.label}
                </span>
                <span
                    className="text-xs"
                    style={{ color: getDateColor(application.applied_at ?? application.created_at) }}
                >
                    {days === 0 ? 'Today' : `${days}d ago`}
                </span>
            </div>
        </div>
    )
}

function DroppableColumn({
    col,
    cards,
    isOver,
    onClick,
    onAdd,
    selectionMode,
    selectedIds,
    onToggleSelect,
}: {
    col: typeof COLUMNS[0]
    cards: Application[]
    isOver: boolean
    onClick: (app: Application) => void
    onAdd: (status: ApplicationStatus) => void
    selectionMode: boolean
    selectedIds: Set<string>
    onToggleSelect: (id: string) => void
}) {
    const { setNodeRef } = useDroppable({ id: col.id })

    return (
        <div
            ref={setNodeRef}
            className={`w-full border p-1.5 rounded-xl border-border bg-column-bg md:flex-shrink-0 md:w-64 transition-all
                ${cards.length === 0 ? 'hidden md:block' : ''}
                ${isOver ? 'ring-1 ring-border bg-surface-hover' : ''}`}
        >
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {col.label}
                </span>
                <span className="text-xs text-muted ml-auto">{cards.length}</span>
            </div>
            {!selectionMode && (
                <button
                    onClick={() => onAdd(col.id)}
                    className="w-full mb-2 py-1.5 text-xs text-muted hover:text-text border border-dashed border-border hover:border-muted rounded-lg bg-transparent cursor-pointer transition-colors"
                >
                    + Add
                </button>
            )}
            <div className="flex flex-col gap-2 min-h-24">
                {cards.map((app, index) => (
                    <DraggableCard
                        key={app.id}
                        application={app}
                        onClick={() => onClick(app)}
                        index={index}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(app.id)}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
                {cards.length === 0 && (
                    <div className={`border border-dashed rounded-xl p-4 text-center transition-all
            ${isOver ? 'border-muted' : 'border-border'}`}>
                        <p className="text-xs text-muted">{isOver ? 'Drop here' : 'Empty'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function KanbanBoard({
    applications,
    onSelect,
    onUpdate,
    onOptimisticUpdate,
    onAdd,
    selectionMode = false,
    selectedIds = new Set(),
    onToggleSelect = () => { },
}: {
    applications: Application[]
    onSelect: (app: Application) => void
    onUpdate: () => void
    onOptimisticUpdate: (apps: Application[]) => void
    onAdd: (status: ApplicationStatus) => void
    selectionMode?: boolean
    selectedIds?: Set<string>
    onToggleSelect?: (id: string) => void
}) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)
    const supabase = createClient()

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        })
    )

    const activeApp = applications.find(a => a.id === activeId) ?? null
    const byStatus = (status: string) =>
        applications
            .filter(a => a.status === status)
            .sort((a, b) => {
                const dateA = new Date(a.applied_at ?? a.created_at).getTime()
                const dateB = new Date(b.applied_at ?? b.created_at).getTime()
                return dateA - dateB
            })

    
    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)
        setOverId(null)
        if (!over) return

        const newStatus = over.id as ApplicationStatus
        const app = applications.find(a => a.id === active.id)
        if (!app || app.status === newStatus) return

        onOptimisticUpdate(
            applications.map(a => a.id === app.id ? { ...a, status: newStatus } : a)
        )

        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', app.id)

        if (error) onUpdate()
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={(e: DragStartEvent) => {
                setActiveId(e.active.id as string)
            }}
            onDragOver={(e: DragOverEvent) => setOverId(e.over?.id as string ?? null)}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-6 md:flex-row md:gap-4 md:overflow-x-auto pb-4 w-full">
                {COLUMNS.map(col => (
                    <DroppableColumn
                        key={col.id}
                        col={col}
                        cards={byStatus(col.id)}
                        isOver={overId === col.id}
                        onClick={onSelect}
                        onAdd={onAdd}
                        selectionMode={selectionMode}
                        selectedIds={selectedIds}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeApp && <CardOverlay application={activeApp} />}
            </DragOverlay>
        </DndContext>
    )
}