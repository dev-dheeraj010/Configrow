import Link from 'next/link';

export default function Hero() {
  return (
    <section className="s" id="hero">
      <div className="c">
        <div className="k rv">WEB STUDIO · FOR LOCAL BUSINESSES</div>
        <h1 className="rv">Great websites build trust<b>.</b></h1>
        <p className="rv">Premium, SEO-ready websites made to generate leads.</p>
        <Link className="btn rv" href="/#enquiry">Start a project <span>→</span></Link>
      </div>
    </section>
  );
}
