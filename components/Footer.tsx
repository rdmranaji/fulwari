"use client";
import Link from "next/link";
import { SITE, waLink } from "@/lib/site";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="cols">
          <div>
            <h4>Fulwari</h4>
            <p style={{ maxWidth: "34ch" }}>Plant growers in Anand since 2014. Supplying industries, landscapers and nurseries across India, and homes across Gujarat.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link href="/shop">{t("nav.shop", "Shop")}</Link><Link href="/grow-lab">{t("nav.lab", "Grow Lab")}</Link><Link href="/bulk">{t("nav.bulk", "Bulk & industry")}</Link><Link href="/about">{t("nav.about", "About")}</Link>
          </div>
          <div>
            <h4>Visit</h4>
            <p>{SITE.main}</p>
            <p style={{ marginTop: 8 }}>Branch: {SITE.branch}</p>
            <a href={SITE.maps}>Get directions</a>
          </div>
          <div>
            <h4>Talk to us</h4>
            <a href={`tel:${SITE.phoneRaw}`} className="nb">{SITE.phone}</a>
            <a href={waLink("Hello Fulwari")}>WhatsApp</a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <p>{SITE.hours}</p>
          </div>
        </div>
        <div className="big" aria-hidden="true">fulwari</div>
        <div className="legal">
          <span>© {new Date().getFullYear()} Fulwari · GST {SITE.gst} · {SITE.udyam}</span>
          <span>Preview build: prices, stock and plant lists are samples until Fulwari confirms them.</span>
          <span><Link href="/credits">Photo credits</Link> · <a href="https://globalwebguru.com" target="_blank" rel="noopener">{t("foot.made", "Website by Global Web Guru")}</a></span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a className="wa-fab" href={waLink("Hello Fulwari, I found you on your website.")} aria-label="Chat with Fulwari on WhatsApp">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 0 1 12 4zm-3.2 4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.3 2.4 1 2.9.8 3.4.7.5 0 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4l-.5-.3-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.2 0-.4.1-.5l.4-.5.3-.5v-.5L10 8.5c-.2-.5-.4-.5-.6-.5z" /></svg>
      <span>WhatsApp</span>
    </a>
  );
}
