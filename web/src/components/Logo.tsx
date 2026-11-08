interface LogoProps {
  light?: boolean;
  compact?: boolean;
}

export function Logo({ light = false, compact = false }: LogoProps) {
  return (
    <div className={`logo ${light ? 'logo--light' : ''} ${compact ? 'logo--compact' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <span className="logo__sun" />
        T
      </span>
      <span className="logo__word">Travelie</span>
      {!compact ? <span className="logo__tag">Admin</span> : null}
    </div>
  );
}