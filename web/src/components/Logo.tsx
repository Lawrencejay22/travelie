interface LogoProps {
  light?: boolean;
  compact?: boolean;
  showAdminTag?: boolean;
}

export function Logo({
  light = false,
  compact = false,
  showAdminTag = true,
}: LogoProps) {
  return (
    <div className={`logo ${light ? 'logo--light' : ''} ${compact ? 'logo--compact' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <span className="logo__sun" />
        T
      </span>
      <span className="logo__word">Travelie</span>
      {!compact && showAdminTag ? <span className="logo__tag">Admin</span> : null}
    </div>
  );
}