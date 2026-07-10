import { useEffect, useRef, useState } from "react";
import useLocale from "./useLocale";

/*
  Felipe Bell Marques — Portfolio (bilingual, data-driven)

  Renders entirely from ./content/en.json or ./content/pt-BR.json.
  Language is auto-detected from the visitor's browser (Portuguese locales get
  pt-BR, everyone else gets English) and can be switched with the EN / PT-BR
  toggle; the choice persists in localStorage. See ./useLocale.js.
*/

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;background:#000000;overflow-x:hidden;}
::selection{background:#A90072;color:#F5F0F7;}
.fbm-container{display:flex;gap:64px;max-width:1180px;margin:0 auto;padding:0 40px;}
.fbm-left{width:44%;position:sticky;top:0;height:100vh;max-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:40px 0 24px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;}
.fbm-left::-webkit-scrollbar{display:none;}
.fbm-right{width:56%;padding:96px 0 96px;}
.fbm-mobilehead{display:none;}
.fbm-nav{width:240px;flex-shrink:0;}
.fbm-navline{width:26px;height:2px;background:#560072;flex-shrink:0;transition:width .3s ease,background .3s ease,box-shadow .3s ease;}
.fbm-navtext{font-family:'Space Grotesk';font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:#B8A8C8;transition:color .3s ease,letter-spacing .3s ease,font-weight .3s ease;}
.fbm-navlink:hover .fbm-navtext{color:#F5F0F7;letter-spacing:.22em;font-weight:700;}
.fbm-navlink:hover .fbm-navline{width:48px;background:linear-gradient(90deg,#A90072,#D50048);box-shadow:0 0 10px rgba(213,0,72,.55);}
.fbm-navlink:focus-visible{outline:2px solid #D50048;outline-offset:4px;border-radius:4px;}
.fbm-navlink.active .fbm-navtext{color:#F5F0F7;}
.fbm-navlink.active .fbm-navline{width:52px;background:linear-gradient(90deg,#2A0048,#A90072,#D50048);}
.fbm-explist:hover .fbm-card{opacity:.5;}
.fbm-explist .fbm-card:hover{opacity:1;}
.fbm-card{transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease,background .15s ease,opacity .15s ease;}
.fbm-card:hover{transform:translateY(-4px);border-color:rgba(169,0,114,.55)!important;box-shadow:0 16px 48px rgba(169,0,114,.18);background:rgba(42,0,72,.32)!important;}
.fbm-pill{transition:background .25s ease,color .25s ease,border-color .25s ease;}
.fbm-pill:hover{background:#800080;color:#F5F0F7;border-color:#800080;}
.fbm-ext .fbm-arrow{transition:transform .25s ease;}
.fbm-ext:hover .fbm-arrow{transform:translate(4px,-4px);}
.fbm-ext:hover .fbm-extlabel{color:#F5F0F7;}
.fbm-social{transition:color .25s ease,transform .25s ease;}
.fbm-social:hover{color:#D50048;transform:translateY(-3px);}
.fbm-btn{transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease,filter .25s ease;}
.fbm-btn:hover{transform:translateY(-3px);filter:brightness(1.06);box-shadow:0 14px 40px rgba(213,0,72,.35);}
.fbm-langbtn{transition:color .2s ease,background .2s ease;}
a:focus-visible,button:focus-visible{outline:2px solid #D50048;outline-offset:3px;border-radius:6px;}
.fbm-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease;will-change:opacity,transform;}
.fbm-reveal.fbm-in{opacity:1;transform:none;}
.fbm-skip{position:absolute;left:16px;top:-48px;background:#D50048;color:#F5F0F7;padding:10px 18px;border-radius:8px;z-index:100;font-weight:600;transition:top .2s ease;text-decoration:none;}
.fbm-skip:focus{top:16px;}
@media (max-width:900px){
  .fbm-container{flex-direction:column;gap:0;padding:0 22px;}
  .fbm-left{position:static;width:100%;height:auto;max-height:none;padding:96px 0 24px;justify-content:flex-start;gap:40px;}
  .fbm-right{width:100%;padding:8px 0 64px;}
  .fbm-nav{display:none!important;}
  .fbm-mobilehead{display:flex;}
  .fbm-reveal{opacity:1;transform:none;}
}
@media (max-width:600px){
  .fbm-cardgrid{grid-template-columns:1fr!important;}
  .fbm-exprow{grid-template-columns:1fr!important;gap:6px!important;}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto;}
  .fbm-reveal{opacity:1!important;transform:none!important;transition:none!important;}
  #fbm-spotlight{display:none!important;}
}
`;

/* ---------- shared style fragments ---------- */
const pillStyle = { fontSize: 12, padding: "4px 11px", borderRadius: 999, border: "1px solid #560072", color: "#B8A8C8", fontWeight: 500 };
const pillStyleLg = { fontSize: 12, padding: "5px 12px", borderRadius: 999, border: "1px solid #560072", color: "#B8A8C8", fontWeight: 500 };
const badgeStyle = { fontSize: 12, padding: "5px 12px", borderRadius: 8, background: "rgba(128,0,128,.22)", border: "1px solid #800080", color: "#F5F0F7", fontWeight: 600 };
const rowWrap = { display: "flex", flexWrap: "wrap", gap: 8 };
const pillWrap = { display: "flex", flexWrap: "wrap", gap: 7 };
const sectionH2 = { fontFamily: "'Space Grotesk'", fontSize: 14, letterSpacing: ".2em", textTransform: "uppercase", color: "#F5F0F7", margin: "0 0 30px", fontWeight: 600 };
const extLabel = { color: "#D50048", transition: "color .25s ease" };

/* ---------- small components ---------- */
function Pill({ children, large }) {
  return <span className="fbm-pill" style={large ? pillStyleLg : pillStyle}>{children}</span>;
}

function Bullet({ children, color }) {
  return (
    <li style={{ fontSize: 14, color: "#B8A8C8", paddingLeft: 18, position: "relative" }}>
      <span style={{ position: "absolute", left: 0, top: 9, width: 6, height: 6, borderRadius: "50%", background: color }} />
      {children}
    </li>
  );
}

function ExtLink({ href, label, arrow = "→", style }) {
  return (
    <a href={href} target={href && href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="fbm-ext"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 14, ...style }}>
      <span className="fbm-extlabel" style={extLabel}>{label}</span>
      <span className="fbm-arrow" style={{ color: "#D50048", display: "inline-flex" }}>{arrow}</span>
    </a>
  );
}

function LangToggle({ locale, setLocale, ariaLabel, style }) {
  const opt = (code, label) => {
    const active = locale === code;
    return (
      <button type="button" className="fbm-langbtn" onClick={() => setLocale(code)} aria-pressed={active}
        style={{ border: "none", cursor: "pointer", padding: "5px 11px", borderRadius: 7, fontFamily: "'Space Grotesk'", fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
          background: active ? "#D50048" : "transparent", color: active ? "#F5F0F7" : "#B8A8C8" }}>
        {label}
      </button>
    );
  };
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: "inline-flex", gap: 2, padding: 3, borderRadius: 10, border: "1px solid #560072", background: "rgba(42,0,72,.3)", ...style }}>
      {opt("en", "EN")}
      {opt("pt-BR", "PT-BR")}
    </div>
  );
}

function RbacDiagram() {
  const box = { fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 9, letterSpacing: ".04em", padding: "5px 0", borderRadius: 6, textAlign: "center" };
  return (
    <div style={{ borderRadius: 12, border: "1px solid #560072", minHeight: 170, background: "repeating-linear-gradient(135deg,rgba(86,0,114,.18) 0 10px,rgba(42,0,72,.28) 10px 20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", padding: 16 }}>
      <div style={{ ...box, width: 110, background: "linear-gradient(120deg,#800080,#D50048)", color: "#F5F0F7" }}>Administrator</div>
      <div style={{ ...box, width: 78, background: "rgba(169,0,114,.4)", border: "1px solid #A90072", color: "#F5F0F7" }}>RH Admin ×3</div>
      <div style={{ ...box, width: 96, background: "rgba(86,0,114,.3)", border: "1px solid #560072", color: "#B8A8C8" }}>RH ×19 stores</div>
      <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 9, color: "#800080", lineHeight: 1.5 }}>three-tier RBAC</span>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div style={{ borderRadius: 12, border: "1px solid #560072", minHeight: 170, background: "repeating-linear-gradient(135deg,rgba(86,0,114,.18) 0 10px,rgba(42,0,72,.28) 10px 20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", padding: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(120deg,#A90072,#D50048)" }} />
      <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 10, letterSpacing: ".05em", color: "#B8A8C8", lineHeight: 1.5 }}>architecture<br />diagram</span>
    </div>
  );
}

function ImageSlider({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  const img = images[idx];
  const multi = images.length > 1;
  const navBtnStyle = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(245,240,247,.3)", background: "rgba(10,2,18,.55)", backdropFilter: "blur(4px)", color: "#F5F0F7", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
  return (
    <div style={{ position: "relative", background: "#0A0212", borderBottom: "1px solid #560072" }}>
      <img src={img.src} alt={img.alt} style={{ display: "block", width: "100%", maxHeight: 460, objectFit: "contain", background: "#0A0212" }} />
      {multi && (
        <>
          <button type="button" aria-label="Previous image" onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)} style={{ ...navBtnStyle, left: 12 }}>‹</button>
          <button type="button" aria-label="Next image" onClick={() => setIdx((i) => (i + 1) % images.length)} style={{ ...navBtnStyle, right: 12 }}>›</button>
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {images.map((_, i) => (
              <button key={i} type="button" aria-label={`Show image ${i + 1} of ${images.length}`} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 18 : 7, height: 7, padding: 0, borderRadius: 999, border: "none", cursor: "pointer", background: i === idx ? "#D50048" : "rgba(245,240,247,.4)", transition: "width .25s ease,background .25s ease" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- project cards ---------- */
function HeroCardBody({ card }) {
  return (
    <div>
      <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 20, color: "#F5F0F7", margin: "0 0 6px", fontWeight: 700, letterSpacing: "-.01em" }}>{card.title}</h3>
      <p style={{ margin: "0 0 16px", fontSize: 15, color: "#B8A8C8" }}>{card.description}</p>
      {card.bullets && (
        <ul style={{ listStyle: "none", margin: "0 0 18px", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {card.bullets.map((b, i) => <Bullet key={i} color="#D50048">{b}</Bullet>)}
        </ul>
      )}
      {card.badges && <div style={{ ...rowWrap, marginBottom: 16 }}>{card.badges.map((b, i) => <span key={i} style={badgeStyle}>{b}</span>)}</div>}
      {card.pills && <div style={{ ...pillWrap, marginBottom: 18 }}>{card.pills.map((p, i) => <Pill key={i}>{p}</Pill>)}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {card.link && <ExtLink href={card.link.href} label={card.link.label} arrow="↗" />}
        {card.note && <span style={{ fontSize: 12, color: "#800080", fontStyle: "italic" }}>{card.note}</span>}
      </div>
    </div>
  );
}

function HeroCard({ card }) {
  const hasImages = card.images && card.images.length > 0;
  return (
    <article className="fbm-card fbm-reveal" style={{ border: "1px solid rgba(86,0,114,.6)", borderRadius: 18, padding: 0, overflow: "hidden", background: "rgba(42,0,72,.22)", marginBottom: 14 }}>
      <div style={{ padding: "8px 20px", background: "linear-gradient(90deg,#2A0048,#A90072,#D50048)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Space Grotesk'", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700, color: "#F5F0F7" }}>{card.barLabel}</span>
      </div>
      {hasImages ? (
        <>
          <ImageSlider images={card.images} />
          <div style={{ padding: 26 }}><HeroCardBody card={card} /></div>
        </>
      ) : (
        <div className="fbm-cardgrid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 26, padding: 26 }}>
          {card.diagram === "rbac" ? <RbacDiagram /> : <ArchDiagram />}
          <HeroCardBody card={card} />
        </div>
      )}
    </article>
  );
}

function SimpleCard({ card }) {
  return (
    <article className="fbm-card fbm-reveal" style={{ border: "1px solid rgba(86,0,114,.5)", borderRadius: 16, padding: 0, overflow: "hidden", background: "rgba(42,0,72,.16)", marginBottom: 14 }}>
      {card.images && card.images.length > 0 && <ImageSlider images={card.images} />}
      <div style={{ padding: 26 }}>
        <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 19, color: "#F5F0F7", margin: "0 0 6px", fontWeight: 700, letterSpacing: "-.01em" }}>{card.title}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#B8A8C8" }}>{card.description}</p>
        {card.bullets && (
          <ul style={{ listStyle: "none", margin: "0 0 18px", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
            {card.bullets.map((b, i) => <Bullet key={i} color="#A90072">{b}</Bullet>)}
          </ul>
        )}
        {card.badges && <div style={{ ...rowWrap, marginBottom: 16 }}>{card.badges.map((b, i) => <span key={i} style={badgeStyle}>{b}</span>)}</div>}
        {card.pills && <div style={{ ...pillWrap, marginBottom: 18 }}>{card.pills.map((p, i) => <Pill key={i}>{p}</Pill>)}</div>}
        {card.link && <ExtLink href={card.link.href} label={card.link.label} arrow="↗" />}
      </div>
    </article>
  );
}

function CompactCard({ card }) {
  const title = card.link ? (
    <a href={card.link.href} target="_blank" rel="noopener noreferrer" className="fbm-ext" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
      <h3 className="fbm-extlabel" style={{ fontFamily: "'Space Grotesk'", fontSize: 17, color: "#F5F0F7", margin: 0, fontWeight: 600, transition: "color .25s ease" }}>{card.title}</h3>
      <span className="fbm-arrow" style={{ color: "#A90072", display: "inline-flex" }}>↗</span>
    </a>
  ) : (
    <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 17, color: "#F5F0F7", margin: 0, fontWeight: 600 }}>{card.title}</h3>
  );
  return (
    <article className="fbm-card fbm-reveal" style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 20, padding: 22, borderRadius: 14, border: "1px solid transparent" }}>
      <div className="fbm-cardgrid-hide" style={{ borderRadius: 10, border: "1px solid #560072", overflow: "hidden", background: card.images?.[0] ? undefined : "repeating-linear-gradient(135deg,rgba(86,0,114,.16) 0 8px,rgba(42,0,72,.26) 8px 16px)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 70 }}>
        {card.images?.[0] ? (
          <img src={card.images[0].src} alt={card.images[0].alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(120deg,#A90072,#D50048)" }} />
        )}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          {title}
          {card.inlineBadge && <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 7, background: "rgba(128,0,128,.2)", border: "1px solid #800080", color: "#F5F0F7", fontWeight: 600 }}>{card.inlineBadge}</span>}
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 15, color: "#B8A8C8" }}>{card.description}</p>
        {card.pills && <div style={pillWrap}>{card.pills.map((p, i) => <Pill key={i}>{p}</Pill>)}</div>}
      </div>
    </article>
  );
}

function ProjectCard({ card }) {
  if (card.variant === "featured" || card.variant === "internalFlagship") return <HeroCard card={card} />;
  if (card.variant === "compact") return <CompactCard card={card} />;
  return <SimpleCard card={card} />;
}

function GroupHeader({ label, dotColor, glow }) {
  return (
    <div className="fbm-reveal" style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 8px" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, boxShadow: glow ? "0 0 12px rgba(213,0,72,.7)" : "none", flexShrink: 0 }} />
      <span style={{ fontFamily: "'Space Grotesk'", fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#F5F0F7", fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#560072,transparent)" }} />
    </div>
  );
}

/* ---------- main ---------- */
export default function Portfolio() {
  const rootRef = useRef(null);
  const { locale, content: c, setLocale } = useLocale();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spot = root.querySelector("#fbm-spotlight");
    if (spot && !reduced && window.matchMedia("(min-width:901px)").matches) {
      let raf = null, tx = 0, ty = 0;
      const move = (e) => {
        tx = e.clientX; ty = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(() => { spot.style.opacity = "1"; spot.style.left = tx + "px"; spot.style.top = ty + "px"; raf = null; });
      };
      window.addEventListener("mousemove", move, { passive: true });
      cleanups.push(() => window.removeEventListener("mousemove", move));
    }

    const reveals = Array.from(root.querySelectorAll(".fbm-reveal"));
    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("fbm-in"));
    } else {
      const ro = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("fbm-in"); ro.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach((el, i) => { el.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms"; ro.observe(el); });
      cleanups.push(() => ro.disconnect());
    }

    const ids = ["about", "experience", "projects", "talks", "contact"];
    const sections = ids.map((id) => root.querySelector("#" + id)).filter(Boolean);
    const links = Array.from(root.querySelectorAll(".fbm-navlink"));
    const setActive = (id) => links.forEach((l) => l.classList.toggle("active", l.getAttribute("data-nav") === id));
    if ("IntersectionObserver" in window && sections.length) {
      const vis = {};
      const so = new IntersectionObserver((entries) => {
        entries.forEach((en) => { vis[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
        let best = null, br = 0;
        Object.keys(vis).forEach((id) => { if (vis[id] > br) { br = vis[id]; best = id; } });
        if (best) setActive(best);
      }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
      sections.forEach((s) => so.observe(s));
      cleanups.push(() => so.disconnect());
    }
    setActive("about");

    return () => cleanups.forEach((fn) => { try { fn(); } catch (e) {} });
    // re-run when locale changes so the newly rendered nodes get observed
  }, [locale]);

  const navItems = [
    ["about", c.nav.about], ["experience", c.nav.experience], ["projects", c.nav.projects], ["talks", c.nav.talks], ["contact", c.nav.contact],
  ];

  return (
    <>
      <style>{CSS}</style>
      <div ref={rootRef} style={{ position: "relative", background: "#000000", color: "#B8A8C8", fontFamily: "'Manrope',system-ui,sans-serif", lineHeight: 1.6, minHeight: "100vh" }}>

        <a href="#fbm-main" className="fbm-skip">{locale === "pt-BR" ? "Pular para o conteúdo" : "Skip to content"}</a>

        <div id="fbm-spotlight" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: 640, height: 640, pointerEvents: "none", zIndex: 0, borderRadius: "50%", background: "radial-gradient(circle at center, rgba(85,0,114,.35), rgba(42,0,72,.22) 35%, transparent 68%)", transform: "translate(-50%,-50%)", opacity: 0, transition: "opacity .4s ease" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(1200px 600px at 20% -5%, rgba(42,0,72,.35), transparent 55%)" }} />

        <div className="fbm-container" style={{ position: "relative", zIndex: 1 }}>

          {/* MOBILE HEADER */}
          <header className="fbm-mobilehead" style={{ position: "sticky", top: 0, zIndex: 20, width: "100%", padding: "14px 22px", margin: "0 -22px", background: "rgba(0,0,0,.72)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(86,0,114,.35)", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: "#F5F0F7", letterSpacing: "-.01em" }}>{c.hero.name}</span>
            <LangToggle locale={locale} setLocale={setLocale} ariaLabel={c.ui.langToggleAria} />
          </header>

          {/* LEFT COLUMN */}
          <header className="fbm-left">
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <LangToggle locale={locale} setLocale={setLocale} ariaLabel={c.ui.langToggleAria} />
              </div>
              <p style={{ fontFamily: "'Space Grotesk'", fontSize: 13, letterSpacing: ".28em", textTransform: "uppercase", color: "#A90072", margin: "0 0 14px", fontWeight: 600 }}>{c.hero.role}</p>
              <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: "clamp(34px,4.2vw,54px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: "0 0 16px", background: "linear-gradient(120deg,#2A0048 0%,#A90072 52%,#D50048 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "#D50048", maxWidth: 320 }}>{c.hero.name}</h1>
              <p style={{ fontSize: 16, color: "#B8A8C8", maxWidth: 360, margin: "0 0 22px", lineHeight: 1.65 }}>{c.hero.tagline}</p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
                <a href={c.hero.resumeHref} className="fbm-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 10, background: "linear-gradient(120deg,#2A0048,#A90072,#D50048)", color: "#F5F0F7", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 8px 28px rgba(213,0,72,.28)" }}>{c.hero.resumeCta}</a>
                <a href={"mailto:" + c.social.email} className="fbm-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 10, background: "transparent", border: "1px solid #560072", color: "#F5F0F7", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>{c.hero.contactCta}</a>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <nav className="fbm-nav" aria-label={c.nav.about} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {navItems.map(([id, label]) => (
                    <a key={id} href={"#" + id} data-nav={id} className="fbm-navlink" style={{ display: "flex", alignItems: "center", gap: 18, padding: "6px 0", textDecoration: "none" }}>
                      <span className="fbm-navline" />
                      <span className="fbm-navtext">{label}</span>
                    </a>
                  ))}
                </nav>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                  <a href={c.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="fbm-social" style={{ color: "#B8A8C8", display: "inline-flex" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>
                  </a>
                  <a href={c.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="fbm-social" style={{ color: "#B8A8C8", display: "inline-flex" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" /></svg>
                  </a>
                  <a href={"mailto:" + c.social.email} aria-label="Email" className="fbm-social" style={{ color: "#B8A8C8", display: "inline-flex" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 6 9 7 9-7" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* RIGHT COLUMN */}
          <main id="fbm-main" className="fbm-right">

            {/* ABOUT */}
            <section id="about" data-screen-label="About" style={{ marginBottom: 110, scrollMarginTop: 96 }}>
              <h2 className="fbm-reveal" style={{ ...sectionH2, margin: "0 0 26px" }}>{c.about.heading}</h2>
              <div className="fbm-reveal" style={{ display: "flex", flexDirection: "column", gap: 18, fontSize: 16, color: "#B8A8C8", maxWidth: 600 }}>
                {c.about.paragraphs.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
              </div>
            </section>

            {/* EXPERIENCE */}
            <section id="experience" data-screen-label="Experience" style={{ marginBottom: 110, scrollMarginTop: 96 }}>
              <h2 className="fbm-reveal" style={sectionH2}>{c.experience.heading}</h2>
              <div className="fbm-explist" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {c.experience.roles.map((r, i) => (
                  <article key={i} className="fbm-card fbm-reveal fbm-exprow" style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 18, padding: 22, borderRadius: 14, border: "1px solid transparent" }}>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#A90072", fontWeight: 600, paddingTop: 4 }}>{r.period}</div>
                    <div>
                      <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 17, color: "#F5F0F7", margin: "0 0 8px", fontWeight: 600, letterSpacing: "-.01em" }}>{r.title} · <span style={{ color: "#D50048" }}>{r.company}</span></h3>
                      {r.location && <p style={{ margin: "0 0 6px", fontSize: 12, color: "#800080", letterSpacing: ".04em" }}>{r.location}</p>}
                      <p style={{ margin: "0 0 14px", fontSize: 15, color: "#B8A8C8" }}>{r.description}</p>
                      <div style={rowWrap}>{r.pills.map((p, j) => <Pill key={j} large>{p}</Pill>)}</div>
                    </div>
                  </article>
                ))}
              </div>
              <ExtLink href={c.experience.resumeHref} label={c.experience.resumeLink} style={{ marginTop: 26 }} />
            </section>

            {/* PROJECTS */}
            <section id="projects" data-screen-label="Projects" style={{ marginBottom: 110, scrollMarginTop: 96 }}>
              <h2 className="fbm-reveal" style={{ ...sectionH2, margin: "0 0 10px" }}>{c.projects.heading}</h2>
              <p className="fbm-reveal" style={{ margin: "0 0 30px", fontSize: 15, color: "#B8A8C8", maxWidth: 560 }}>{c.projects.intro}</p>

              <GroupHeader label={c.projects.liveLabel} dotColor="#D50048" glow />
              <div style={{ height: 22 }} />
              {c.projects.live.map((card, i) => <ProjectCard key={i} card={card} />)}

              <div style={{ height: 12 }} />
              <GroupHeader label={c.projects.internalLabel} dotColor="#560072" />
              <p className="fbm-reveal" style={{ margin: "0 0 22px", fontSize: 13, color: "#800080", maxWidth: 560 }}>{c.projects.internalIntro}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {c.projects.internal.map((card, i) => <ProjectCard key={i} card={card} />)}
              </div>

              <ExtLink href={c.projects.archiveHref} label={c.projects.archiveLink} style={{ marginTop: 24 }} />
              <p className="fbm-reveal" style={{ margin: "12px 0 0", fontSize: 13, color: "#800080", maxWidth: 560 }}>{c.projects.archiveList}</p>
            </section>

            {/* TALKS */}
            <section id="talks" data-screen-label="Talks" style={{ marginBottom: 110, scrollMarginTop: 96 }}>
              <h2 className="fbm-reveal" style={sectionH2}>{c.talks.heading}</h2>
              <div className="fbm-explist" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {c.talks.items.map((t, i) => (
                  <article key={i} className="fbm-card fbm-reveal fbm-exprow" style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 18, padding: "20px 22px", borderRadius: 14, border: "1px solid transparent", alignItems: "baseline" }}>
                    <div style={{ fontFamily: "'Space Grotesk'", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "#A90072", fontWeight: 600 }}>{t.kind}</div>
                    <div>
                      <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 16, color: "#F5F0F7", margin: "0 0 5px", fontWeight: 600 }}>{t.title} <span style={{ color: "#800080", fontWeight: 500 }}>· {t.org}</span></h3>
                      <p style={{ margin: 0, fontSize: 14, color: "#B8A8C8" }}>{t.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* CONTACT */}
            <section id="contact" data-screen-label="Contact" style={{ marginBottom: 70, scrollMarginTop: 96, textAlign: "center", padding: "20px 0" }}>
              <p className="fbm-reveal" style={{ fontFamily: "'Space Grotesk'", fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", color: "#A90072", margin: "0 0 16px", fontWeight: 600 }}>{c.contact.eyebrow}</p>
              <h2 className="fbm-reveal" style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(30px,4vw,42px)", color: "#F5F0F7", margin: "0 0 16px", fontWeight: 700, letterSpacing: "-.02em" }}>{c.contact.heading}</h2>
              <p className="fbm-reveal" style={{ fontSize: 16, color: "#B8A8C8", margin: "0 auto 32px", maxWidth: 440 }}>{c.contact.line}</p>
              <a href={"mailto:" + c.contact.email} className="fbm-btn fbm-reveal" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 34px", borderRadius: 12, background: "linear-gradient(120deg,#2A0048,#A90072,#D50048)", color: "#F5F0F7", fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 12px 36px rgba(213,0,72,.32)" }}>{c.contact.cta}</a>
              <p className="fbm-reveal" style={{ margin: "28px 0 0", fontSize: 13, color: "#800080" }}>{c.contact.location}</p>
            </section>

            {/* FOOTER */}
            <footer style={{ borderTop: "1px solid rgba(86,0,114,.35)", paddingTop: 26, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#800080", fontFamily: "'Space Grotesk'", letterSpacing: ".02em" }}>{c.footer.credit}</p>
            </footer>

          </main>
        </div>
      </div>
    </>
  );
}
