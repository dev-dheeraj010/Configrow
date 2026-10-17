'use client';
import { openConsent } from '@/lib/consent';

export default function CookieSettingsButton() {
  return <button type="button" className="fl" onClick={openConsent}>COOKIE SETTINGS</button>;
}
