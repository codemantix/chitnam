/**
 * Line icons for the site and admin (24×24, 1.75 stroke, rounded joins).
 * Drawn for this project; no icon library needed.
 *
 * @param {object} props
 * @param {keyof typeof ICONS} props.name
 * @param {number} [props.size=20]
 */
const ICONS = {
  // ----- Services -----
  visa: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 10h6M12 7c-1 1-1 5 0 6M12 7c1 1 1 5 0 6M9 16.5h6" />
    </>
  ),
  counselling: (
    <>
      <circle cx="8" cy="7.5" r="2.5" />
      <circle cx="16" cy="7.5" r="2.5" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0M12 3.5v2" />
    </>
  ),
  admissions: <path d="M2.5 9L12 4.5 21.5 9 12 13.5zM6.5 11v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3V11M21.5 9v5" />,
  plane: <path d="M10.5 13.5L4 11l1.5-1.5 7 1 4-4c1-1 2.5-1.3 3.2-.7.6.7.3 2.2-.7 3.2l-4 4 1 7L14.5 21l-2.5-6.5-3 3 .5 2.5-1 1-1.5-3-3-1.5 1-1 2.5.5z" />,
  // ----- General -----
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  facebook: <path d="M14 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.6 1.6-1.6H17V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4v2.3H8v3h2.6V21" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.2 6.8v.01" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16.5M8 7.6v.01M11.5 16.5v-6M11.5 13.3c0-1.7 1-2.8 2.4-2.8s2.1 1 2.1 2.8v3.2" />
    </>
  ),
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
    </>
  ),
  shield: <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" />,
  building: <path d="M4 21V5l8-2v18M12 7l8 2.5V21M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01M2.5 21h19" />,
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5" />
    </>
  ),
  layers: <path d="M12 3.5l9 4.5-9 4.5-9-4.5zM3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />,
  handshake: <path d="M3 12l4-4h3l2 2M21 12l-4-4h-3l-4 4 2 2 2-2M7 8l-1 9M17 8l1 9M8 15l3 3 3-3" />,

  dashboard: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
  posts: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4" />,
  inbox: <path d="M4 13l2.5-7h11L20 13v6H4zM4 13h5l1 2.5h4l1-2.5h5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  external: <path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5" />,
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  trash: <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10.5 11v5M13.5 11v5" />,
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 16l5-5 4 4 2.5-2.5 5.5 5.5" />
      <circle cx="15.5" cy="9" r="1.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M10 5h8M6 19h8M14 5l-4 14" />,
  underline: <path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />,
  strike: <path d="M5 12h14M16.5 7.5C16 5.8 14.3 5 12 5c-2.8 0-4.5 1.3-4.5 3.2 0 1 .4 1.8 1.3 2.3M8 16.5c.6 1.6 2.3 2.5 4.3 2.5 2.8 0 4.7-1.3 4.7-3.3 0-.8-.3-1.5-.9-2" />,
  listBullet: (
    <>
      <path d="M9.5 6H20M9.5 12H20M9.5 18H20" />
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
    </>
  ),
  listOrdered: <path d="M10 6h10M10 12h10M10 18h10M4 4.5l1.5-1V8M3.8 14.2a1.4 1.4 0 0 1 2.5.6c0 1-2.6 2.2-2.6 3.2h2.8" />,
  quote: <path d="M10 7H5.5v5H10v1a3 3 0 0 1-3 3M19 7h-4.5v5H19v1a3 3 0 0 1-3 3" />,
  alignLeft: <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />,
  alignCenter: <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />,
  alignRight: <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />,
  alignJustify: <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  unlink: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1M4 4l16 16" />,
  hr: <path d="M4 12h16M8 7h8M8 17h8" />,
  undo: <path d="M9 7L5 11l4 4M5 11h9.5a4.5 4.5 0 0 1 0 9H12" />,
  redo: <path d="M15 7l4 4-4 4M19 11H9.5a4.5 4.5 0 0 0 0 9H12" />,
  clearFormat: <path d="M6 5h12M12 5v14M4 4l16 16" />,
  indent: <path d="M4 6h16M11 10h9M11 14h9M4 18h16M4 9.5L7 12l-3 2.5" />,
  outdent: <path d="M4 6h16M11 10h9M11 14h9M4 18h16M7 9.5L4 12l3 2.5" />,
  code: <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />,
  fullscreen: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  fullscreenExit: <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />,
  toolbar: (
    <>
      <rect x="3.5" y="5" width="17" height="5.5" rx="1.5" />
      <rect x="3.5" y="13.5" width="17" height="5.5" rx="1.5" />
    </>
  ),
  upload: <path d="M12 16V5M7 10l5-5 5 5M5 19h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
    </>
  ),
  phone: <path d="M6 4h3l1.8 4.5-2.3 1.4a11 11 0 0 0 5.6 5.6l1.4-2.3L20 15v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z" />
    </>
  ),
  arrowLeft: <path d="M15 6l-6 6 6 6" />,
  arrowRight: <path d="M9 6l6 6-6 6" />,
  sparkle: <path d="M12 3.5l1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8zM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />,
  tag: <path d="M4 4h7l9 9-7 7-9-9zM8 8h.01" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
};

export default function Icon({ name, size = 20, className, strokeWidth = 1.75 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}
