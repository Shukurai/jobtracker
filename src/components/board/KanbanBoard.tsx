'use client'

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
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
}: {
    application: Application
    onClick: () => void
    index: number
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id,
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
      onPointerUp={() => { if (!hasMoved.current) onClick() }}
            className={`bg-surface border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-muted transition-all group touch-none select-none
        ${isDragging ? 'opacity-20' : 'opacity-100'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 ">
          <CompanyLogo url={application.url} company={application.company} />
          <span className="text-sm font-semibold text-text leading-tight">
            {application.company}
          </span>
        </div>
        {application.url && (
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

      <p className="text-xs text-muted mb-3 leading-tight">{application.position}</p>

      <div className="flex items-center justify-between">
        {/*<span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: column?.color + '22', color: column?.color }}
        >
          {column?.label}
        </span>*/}
            <span
                className="text-xs"
                style={{ color: getDateColor(application.applied_at ?? application.created_at) }}
            >
                {days === 0 ? 'Today' : `${days}d ago`}
            </span>
      </div>
    </div >
  )
}

function CardOverlay({ application }: { application: Application }) {
    const column = COLUMNS.find(c => c.id === application.status)
    const days = daysSince(application.applied_at ?? application.created_at)

    return (
        <div className="bg-surface border border-muted rounded-xl p-4 w-64 shadow-2xl rotate-2 cursor-grabbing select-none">
            <p className="text-sm font-semibold text-text leading-tight mb-1">{application.company}</p>
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
}: {
    col: typeof COLUMNS[0]
    cards: Application[]
    isOver: boolean
    onClick: (app: Application) => void
    onAdd: (status: ApplicationStatus) => void
}) {
    const { setNodeRef } = useDroppable({ id: col.id })

    return (
        <div className={`md:flex-shrink-0 md:w-64 ${cards.length === 0 ? 'hidden md:block' : ''}`}>
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {col.label}
                </span>
                <span className="text-xs text-muted ml-auto">{cards.length}</span>
            </div>
            <button
                onClick={() => onAdd(col.id)}
                className="w-full mb-2 py-1.5 text-xs text-muted hover:text-text border border-dashed border-border hover:border-muted rounded-lg bg-transparent cursor-pointer transition-colors"
            >
                + Add
            </button>
            <div
                ref={setNodeRef}
                className={`flex flex-col gap-2 min-h-24 rounded-xl transition-all p-1 -m-1
          ${isOver ? 'bg-surface-hover ring-1 ring-border' : ''}`}
            >
                {cards.map((app, index) => (
                    <DraggableCard
                        key={app.id}
                        application={app}
                        onClick={() => onClick(app)}
                        index={index}
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
}: {
    applications: Application[]
    onSelect: (app: Application) => void
    onUpdate: () => void
    onOptimisticUpdate: (apps: Application[]) => void
    onAdd: (status: ApplicationStatus) => void
}) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)
    const supabase = createClient()

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
        ...(isMobile ? [] : [useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 8 },
        })])
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

        // Optimistic update — сразу меняем локально
        onOptimisticUpdate(
            applications.map(a => a.id === app.id ? { ...a, status: newStatus } : a)
        )

        // Потом пишем в БД
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', app.id)

        // Если ошибка — откатываем
        if (error) onUpdate()
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={(e: DragStartEvent) => {
                console.log('drag start', e.active.id)
                setActiveId(e.active.id as string)
            }}
            onDragOver={(e: DragOverEvent) => setOverId(e.over?.id as string ?? null)}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-6 md:flex-row md:gap-4 md:overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <DroppableColumn
                        key={col.id}
                        col={col}
                        cards={byStatus(col.id)}
                        isOver={overId === col.id}
                        onClick={onSelect}
                        onAdd={onAdd}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeApp && <CardOverlay application={activeApp} />}
            </DragOverlay>
        </DndContext>
    )
}