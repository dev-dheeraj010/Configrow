import type { ReactNode } from 'react';

/** Footer social buttons: our own simple line glyphs in the brand blue (colour comes from --ico in globals.css). */
const LINKS: { name: string; href: string; glyph: ReactNode }[] = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@Configrow.01',
    glyph: (<><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M10.5 9.6v4.8l4-2.4z" fill="currentColor" stroke="none" /></>),
  },
  {
    name: 'X',
    href: 'https://x.com/Configrow_01',
    glyph: (<><path d="M5 4.5h3.4l10.6 15H15.6z" /><path d="M18.6 4.5l-5.7 6.4M5.4 19.5l5.7-6.4" /></>),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/configrow.in',
    glyph: (<><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.7" /><circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" stroke="none" /></>),
  },
];

export default function SocialIcons() {
  return (
    <ul className="soc">
      {LINKS.map((l) => (
        <li key={l.name}>
          <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Configrow on ${l.name}`} title={l.name}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{l.glyph}</svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
