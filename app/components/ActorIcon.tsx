interface ActorIconProps {
  name: string;
}

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function BrowserIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <circle cx="6" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="16" height="4.5" rx="1" />
      <rect x="4" y="10" width="16" height="4.5" rx="1" />
      <rect x="4" y="16" width="16" height="4.5" rx="1" />
      <circle cx="7" cy="6.25" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12.25" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="18.25" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg {...ICON_PROPS}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
      <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="3.6" ry="8.5" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-4 3.2-6.5 7-6.5s7 2.5 7 6.5" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5M18.4 18.4l-1.5-1.5M7.1 7.1L5.6 5.6" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 3h6M10 3v5.5L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 8.5V3" />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7z" />
    </svg>
  );
}

function NodeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="7" y="7" width="10" height="10" rx="2" transform="rotate(45 12 12)" />
    </svg>
  );
}

// Matches an actor's name against common real-world roles so the diagram reads as
// actual system components (a browser, a database, a server rack) rather than plain
// text boxes. Falls back to a neutral node icon for anything unrecognized.
export default function ActorIcon({ name }: ActorIconProps) {
  const n = name.toLowerCase();
  if (n.includes('browser')) return <BrowserIcon />;
  if (n.includes('database') || n === 'db' || n.includes(' db')) return <DatabaseIcon />;
  if (n.includes('dns') || n.includes('network')) return <GlobeIcon />;
  if (n.includes('developer') || n.includes('user') || n.includes('client') || n.includes('reviewer') || n === 'you') return <PersonIcon />;
  if (n.includes('pipeline') || n.includes('ci') || n.includes('build')) return <GearIcon />;
  if (n.includes('staging') || n.includes('test')) return <FlaskIcon />;
  if (n.includes('cache') || n.includes('cdn') || n.includes('edge')) return <LightningIcon />;
  if (n.includes('server') || n.includes('production') || n.includes('backend') || n.includes('api')) return <ServerIcon />;
  return <NodeIcon />;
}
