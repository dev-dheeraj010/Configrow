import ServiceCards from './ServiceCards';

const CARDS = [
  ['01', 'HTML Web Development', 'Fast, SEO-ready pages made to turn visitors into leads.'],
  ['02', 'Next.js / Node.js', 'Modern full-stack builds, optimized for peak performance.'],
  ['03', 'PHP Web Development', 'Reliable, cross-platform sites for local businesses.'],
];

/** Pinned for 250vh on desktop (see SERVICES_EXTRA in ScrollDirector): the cards appear one by one as you scroll. */
export default function Services() {
  return (
    <section className="s" id="services" style={{ display: 'block', padding: 0, minHeight: '250vh' }}>
      <div className="stick sv">
        <div className="c">
          <div className="k rv">02 — SERVICES</div>
          <h2 className="rv">Built for real results<b>.</b></h2>
          <p className="rv">We craft clean, premium, high-converting websites for local businesses.</p>
        </div>
        <ServiceCards cards={CARDS} />
        <span className="pill">APP DEVELOPMENT — COMING SOON</span>
      </div>
    </section>
  );
}
