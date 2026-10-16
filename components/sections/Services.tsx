import ServicesMotion from './ServicesMotion';

const CARDS = [
  ['01', 'HTML Web Development', 'Fast, SEO-ready pages made to turn visitors into leads.'],
  ['02', 'Next.js / Node.js', 'Modern full-stack builds, optimized for peak performance.'],
  ['03', 'PHP Web Development', 'Reliable, cross-platform sites for local businesses.'],
];

/** 250vh section with a sticky 100vh stage (desktop). Its entrance is one scrubbed timeline: see ServicesMotion. */
export default function Services() {
  return (
    <section className="s" id="services" style={{ display: 'block', padding: 0, minHeight: '250vh' }}>
      <div className="stick sv">
        <div className="c sv-intro">
          <div className="k">02 — SERVICES</div>
          <h2>Built for real results<b>.</b></h2>
          <p>We craft clean, premium, high-converting websites for local businesses.</p>
        </div>
        <div className="sw">
          <div className="sk">
            {CARDS.map(([n, t, d]) => (
              <div className={`sc sc${n[1]}`} key={n}><span>SERVICE {n}</span><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
        </div>
        <span className="pill">APP DEVELOPMENT — COMING SOON</span>
      </div>
      <ServicesMotion />
    </section>
  );
}
