interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
}

export default function ToggleCheckbox({ checked, onChange, label }: Props) {
    const id = `checkbox-${label.replace(/\s/g, '-')}`

    return (
        <div className="flex items-center">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="custom-checkbox-input"
            />
            <div className="custom-checkbox-wrapper">
                <label
                    htmlFor={id}
                    className="custom-checkbox"
                    style={{
                        width: 'fit-content',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        userSelect: 'none',
                        padding: '2px 10px',
                        backgroundColor: checked ? '#1a1a1a' : 'rgba(0,0,0,0.16)',
                        borderRadius: '6px',
                        color: checked ? 'white' : 'rgba(255,255,255,0.7)',
                        transition: 'color 300ms, background-color 300ms, box-shadow 300ms',
                        display: 'flex',
                        height: '28px',
                        alignItems: 'center',
                        boxShadow: checked
                            ? 'rgba(0,0,0,0.23) 0px -4px 1px 0px inset, rgba(255,255,255,0.1) 0px -1px 1px 0px, rgba(0,0,0,0.17) 0px 2px 4px 1px'
                            : 'rgba(0,0,0,0.15) 0px 2px 1px 0px inset, rgba(255,255,255,0.1) 0px 1px 1px 0px',
                        fontSize: '12px',
                        gap: '6px',
                    }}
                >
                    <span
                        className="inner"
                        style={{
                            pointerEvents: 'none',
                            transition: 'transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                            transform: checked ? 'translateY(-2px)' : 'translateY(0px)',
                            fontSize: '14px',
                        }}
                    >
                        {checked ? '✓' : '○'}
                    </span>
                    <span style={{ pointerEvents: 'none' }}>{label}</span>
                </label>
            </div>
        </div>
    )
}