import Link from 'next/link';
import SocialIcons from './SocialIcons';

export default function Footer() {
  return (
    <footer>
      <div className="fg">
        <div><p>Premium websites that turn visitors into leads.</p></div>
        <div>
          <h3>MENU</h3>
          <ul>
            <li><Link href="/#services">Services</Link></li>
            <li><Link href="/#promise">Promise</Link></li>
            <li><Link href="/#about">About</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/#enquiry">Enquiry</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3>CONNECT</h3>
          <SocialIcons />
        </div>
        <div>
          <h3>CONTACT</h3>
          <ul>
            <li><a href="mailto:info@configrow.in">info@configrow.in</a></li>
            <li><a href="tel:+919480933776">+91 94809 33776</a></li>
            <li><a href="tel:+917892317834">+91 78923 17834</a></li>
            <li>www.configrow.in</li>
          </ul>
        </div>
      </div>
      <div className="fb">
        <span className="wm">CONFIGROW</span>
        <span>© 2026 CONFIGROW — ALL RIGHTS RESERVED</span>
        <span><Link href="/faq">FAQ</Link> · <Link href="/privacy">PRIVACY POLICY</Link> · <Link href="/terms">TERMS AND CONDITIONS</Link></span>
      </div>
    </footer>
  );
}
