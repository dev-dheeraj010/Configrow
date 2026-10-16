// Renders static copy from lib/legalHtml.ts. Text written as [[like this]] is a gap to fill; it is highlighted in yellow.
export const gaps = (html: string) => html.replace(/\[\[(.*?)\]\]/g, '<mark>[$1]</mark>');

export default function LegalPage({ label, title, updated, html, draft = true }: { label: string; title: string; updated?: string; html: string; draft?: boolean }) {
  return (
    <main className="page lw">
      <div className="k">{label}</div>
      <h1>{title}<b>.</b></h1>
      {updated && <p className="lead">Last updated: {updated}</p>}
      {draft && <div className="dr">DRAFT TEMPLATE — HAVE A LEGAL ADVISOR REVIEW AND FILL THE HIGHLIGHTED GAPS BEFORE LAUNCH (delete this notice afterwards)</div>}
      <article dangerouslySetInnerHTML={{ __html: gaps(html) }} />
    </main>
  );
}
