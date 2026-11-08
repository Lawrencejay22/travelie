interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const CompassIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2.1 5-5 2.1 2.1-5z" />
  </svg>
);

export const MapIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5z" />
    <path d="M9 4v14M15 6.5v14" />
  </svg>
);

export const CalendarIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export const UsersIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const GridIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

export const PinIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const HeartIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

export const LogOutIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
);

export const SearchIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ArrowIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const SparkIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);