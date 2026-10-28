import { useEffect, useRef, useState } from "react";
import useLocale from "./useLocale";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";
import "./tokens.css";

/*
  Felipe Bell Marques — Portfolio (bilingual, data-driven)

  Renders entirely from ./content/en.json or ./content/pt-BR.json.
  Language is auto-detected from the visitor's browser (Portuguese locales get
  pt-BR, everyone else gets English) and can be switched with the EN / PT-BR
  toggle; the choice persists in localStorage. See ./useLocale.js.

  Visual tokens (colors, type scale `.t-*`, spacing, radii) come from /DESIGN.md,
  compiled into ./tokens.css by `npm run tokens`. Don't hard-code hex values or font
  sizes here — reference the token instead.
*/

/* ---------- token helpers ---------- */
const v = (token) => `var(--color-${token})`;
const mix = (token, pct) => `color-mix(in srgb,var(--color-${token}) ${pct}%,transparent)`;
const sp = (token) => `var(--spacing-${token})`;
const r = (token) => `var(--rounded-${token})`;
const GRADIENT = `linear-gradient(120deg,${v("surface-deep")},${v("secondary")},${v("primary")})`;
const GRADIENT_H = `linear-gradient(90deg,${v("surface-deep")},${v("secondary")},${v("primary")})`;
const ACCENT = `linear-gradient(120deg,${v("secondary")},${v("primary")})`;
const TOWER_SEG = 80;    // vh of scroll per project in the tower
const TOWER_HOLD = 0.2;  // fraction of each segment, at both ends, where the tower holds still on a card
const stripes = (a, b) => `repeating-linear-gradient(135deg,${mix("outline", 18)} 0 ${a}px,${mix("surface-deep", 28)} ${a}px ${b}px)`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;}
body{margin:0;background:${v("background")};overflow-x:hidden;}
::selection{background:${v("secondary")};color:${v("on-surface")};}
.fbm-container{max-width:${sp("container")};margin:0 auto;padding:0 ${sp("2xl")};}
.fbm-narrow{max-width:820px;margin:0 auto;}
.fbm-hero{position:relative;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:${sp("4xl")} 0 ${sp("3xl")};}
.fbm-heronav{display:flex;flex-wrap:wrap;gap:10px 40px;}
.fbm-navlink{display:flex;align-items:center;gap:${sp("lg")};padding:6px 0;text-decoration:none;}
.fbm-cue{position:absolute;left:50%;bottom:${sp("xl")};width:2px;height:44px;margin-left:-1px;background:linear-gradient(180deg,${v("outline")},transparent);overflow:hidden;}
.fbm-cue::after{content:"";position:absolute;left:0;top:-40%;width:100%;height:40%;background:${v("primary")};animation:fbm-cue 1.8s ease-in-out infinite;}
@keyframes fbm-cue{to{top:110%;}}
/* floating section nav: fades in once past the hero, collapsed to lines, expands horizontally */
.fbm-side{position:fixed;top:24px;left:24px;z-index:50;display:flex;flex-direction:column;gap:2px;padding:10px 14px;border-radius:${r("lg")};
  background:${mix("background", 72)};backdrop-filter:blur(12px);border:1px solid ${mix("outline", 45)};
  opacity:0;transform:translateX(-14px);pointer-events:none;transition:opacity .5s ease,transform .5s ease;}
.fbm-side[data-show]{opacity:1;transform:none;pointer-events:auto;}
.fbm-side .fbm-navlink{gap:0;transition:gap .4s ease;}
.fbm-side .fbm-navtext{max-width:0;opacity:0;overflow:hidden;white-space:nowrap;transition:max-width .45s ease,opacity .3s ease,color .3s ease,letter-spacing .3s ease;}
.fbm-side:hover .fbm-navlink,.fbm-side:focus-within .fbm-navlink,.fbm-side[data-open] .fbm-navlink{gap:${sp("md")};}
.fbm-side:hover .fbm-navtext,.fbm-side:focus-within .fbm-navtext,.fbm-side[data-open] .fbm-navtext{max-width:220px;opacity:1;}
.fbm-sidetoggle{align-self:flex-start;border:none;background:transparent;color:${v("on-surface-variant")};cursor:pointer;padding:2px 0 6px;font-size:16px;line-height:1;}
.fbm-navline{width:26px;height:2px;background:${v("outline")};flex-shrink:0;transition:width .3s ease,background .3s ease,box-shadow .3s ease;}
.fbm-navtext{text-transform:uppercase;color:${v("on-surface-variant")};transition:color .3s ease,letter-spacing .3s ease,font-weight .3s ease;}
.fbm-navlink:hover .fbm-navtext{color:${v("on-surface")};letter-spacing:.22em;font-weight:700;}
.fbm-navlink:hover .fbm-navline{width:48px;background:${ACCENT};box-shadow:0 0 10px ${mix("primary", 55)};}
.fbm-navlink:focus-visible{outline:2px solid ${v("primary")};outline-offset:4px;border-radius:${r("xs")};}
.fbm-navlink.active .fbm-navtext{color:${v("on-surface")};}
.fbm-navlink.active .fbm-navline{width:52px;background:${GRADIENT_H};}
.fbm-explist:hover .fbm-card{opacity:.5;}
.fbm-explist .fbm-card:hover{opacity:1;}
.fbm-card{transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease,background .15s ease,opacity .15s ease;}
.fbm-card:hover{transform:translateY(-4px);border-color:${mix("secondary", 55)}!important;box-shadow:0 16px 48px ${mix("secondary", 18)};background:${mix("surface-deep", 32)}!important;}
.fbm-pill{transition:background .25s ease,color .25s ease,border-color .25s ease;}
.fbm-pill:hover{background:${v("tertiary")};color:${v("on-surface")};border-color:${v("tertiary")};}
.fbm-ext .fbm-arrow{transition:transform .25s ease;}
.fbm-ext:hover .fbm-arrow{transform:translate(4px,-4px);}
.fbm-ext:hover .fbm-extlabel{color:${v("on-surface")};}
.fbm-social{transition:color .25s ease,transform .25s ease;}
.fbm-social:hover{color:${v("primary")};transform:translateY(-3px);}
.fbm-btn{transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease,filter .25s ease;}
.fbm-btn:hover{transform:translateY(-3px);filter:brightness(1.06);box-shadow:0 14px 40px ${mix("primary", 35)};}
.fbm-langbtn{transition:color .2s ease,background .2s ease;}
a:focus-visible,button:focus-visible{outline:2px solid ${v("primary")};outline-offset:3px;border-radius:${r("sm")};}
.fbm-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease;will-change:opacity,transform;}
.fbm-reveal.fbm-in{opacity:1;transform:none;}
.fbm-skip{position:absolute;left:16px;top:-48px;background:${v("primary")};color:${v("on-primary")};padding:10px 18px;border-radius:${r("md")};z-index:100;font-weight:600;transition:top .2s ease;text-decoration:none;}
.fbm-skip:focus{top:16px;}
/* project tower — see ProjectTower. --k = eased card index (0…n-1) driving the spin */
@property --tp{syntax:'<number>';inherits:true;initial-value:0;}
@keyframes fbm-spin{from{--tp:0;}to{--tp:1;}}
.fbm-tower{position:relative;height:calc(100vh + (var(--n) - 1) * ${TOWER_SEG}vh);}
.fbm-tower-snap{position:absolute;left:0;width:1px;height:1px;pointer-events:none;}
.fbm-stage{position:sticky;top:0;height:100vh;overflow-y:clip;perspective:1700px;--k:0;--tp:0;
  --cw:560px;--ch:min(560px,70vh);--R:600px;--dy:calc(var(--ch) * .55);}
@supports (animation-timeline: view()) and (width: round(down, 1px, 1px)){
  .fbm-tower{view-timeline-name:--fbm-tower;}
  .fbm-stage{animation:fbm-spin linear both;animation-timeline:--fbm-tower;animation-range:contain 0% contain 100%;
    --kr:calc(var(--tp) * (var(--n) - 1));
    --kf:round(down, var(--kr), 1);
    --kx:clamp(0, (var(--kr) - var(--kf) - ${TOWER_HOLD}) / ${1 - 2 * TOWER_HOLD}, 1);
    --k:calc(var(--kf) + var(--kx) * var(--kx) * (3 - 2 * var(--kx)));}
}
/* the axis: a shaded cylinder whose helical "ramp" threads scroll with --k, so it reads as spinning */
.fbm-axis{position:absolute;left:50%;top:0;bottom:0;width:22px;margin-left:-11px;border-radius:11px;
  background:linear-gradient(90deg,${mix("surface-deep", 40)} 0%,${mix("outline", 85)} 30%,${mix("secondary", 45)} 50%,${mix("outline", 85)} 70%,${mix("surface-deep", 40)} 100%);}
.fbm-axis::before{content:"";position:absolute;inset:0;border-radius:inherit;
  background:repeating-linear-gradient(-32deg,transparent 0 16px,${mix("primary", 70)} 16px 21px,transparent 21px 40px);
  background-position:0 calc(var(--k) * -320px);
  -webkit-mask:linear-gradient(90deg,transparent,black 30%,black 70%,transparent);mask:linear-gradient(90deg,transparent,black 30%,black 70%,transparent);}
.fbm-axis::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;border-radius:2px;background:${GRADIENT.replace("120deg", "180deg")};transform-origin:top;transform:scaleY(var(--tp));box-shadow:0 0 16px ${mix("primary", 60)};}
.fbm-ring{position:absolute;z-index:1;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d;
  transform:translateZ(calc(var(--R) * -1)) translateY(calc(var(--k) * var(--dy) * -1)) rotateY(calc(var(--k) * var(--step) * -1));}
.fbm-tcard{position:absolute;left:calc(var(--cw) / -2);top:calc(var(--ch) / -2);width:var(--cw);height:var(--ch);
  --d:calc(var(--k) - var(--i));--ad:max(var(--d), var(--d) * -1);
  transform:rotateY(calc(var(--i) * var(--step))) translateZ(var(--R)) translateY(calc(var(--i) * var(--dy)));
  opacity:clamp(0, 1 - var(--ad) * .45, 1);backface-visibility:hidden;pointer-events:none;
  display:flex;flex-direction:column;overflow:hidden;border-radius:${r("4xl")};border:1px solid ${mix("outline", 60)};background:${v("surface-media")};}
.fbm-tcard[data-front]{pointer-events:auto;border-color:${mix("secondary", 70)};box-shadow:0 18px 60px ${mix("primary", 22)};}
.fbm-tdesc{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.fbm-dialog{width:min(720px,92vw);max-height:88vh;padding:0;border:none;border-radius:${r("4xl")};background:${v("surface-media")};color:${v("on-surface")};overflow:auto;}
.fbm-dialog::backdrop{background:${mix("background", 78)};backdrop-filter:blur(6px);}
.fbm-dialog .fbm-reveal{opacity:1;transform:none;}
.fbm-dialog .fbm-card,.fbm-dialog .fbm-card:hover{transform:none;margin:0!important;box-shadow:none;}
html:has(.fbm-dialog[open]){overflow:hidden;}
@media (max-width:1100px){ .fbm-stage{--cw:480px;--R:520px;} }
@media (max-width:900px){
  .fbm-container{padding:0 22px;}
  .fbm-heronav{gap:6px 28px;}
  .fbm-side{top:14px;left:14px;}
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
const pillStyle = { padding: "4px 11px", borderRadius: r("full"), border: `1px solid ${v("outline")}`, color: v("on-surface-variant") };
const pillStyleLg = { ...pillStyle, padding: "5px 12px" };
const badgeStyle = { padding: "5px 12px", borderRadius: r("md"), background: mix("tertiary", 22), border: `1px solid ${v("tertiary")}`, color: v("on-surface"), fontWeight: 600 };
const rowWrap = { display: "flex", flexWrap: "wrap", gap: sp("sm") };
const pillWrap = { display: "flex", flexWrap: "wrap", gap: 7 };
const sectionH2 = { textTransform: "uppercase", color: v("on-surface"), margin: "0 0 30px" };
const extLabel = { color: v("primary"), transition: "color .25s ease" };
const sectionStyle = { marginBottom: sp("section"), scrollMarginTop: sp("4xl") };

/* ---------- small components ---------- */
function Pill({ children, large }) {
  return <span className="fbm-pill t-label" style={large ? pillStyleLg : pillStyle}>{children}</span>;
}

function Bullet({ children, color }) {
  return (
    <li className="t-body-sm" style={{ color: v("on-surface-variant"), paddingLeft: sp("lg"), position: "relative" }}>
      <span style={{ position: "absolute", left: 0, top: 9, width: 6, height: 6, borderRadius: r("full"), background: v(color) }} />
      {children}
    </li>
  );
}

function ExtLink({ href, label, arrow = "→", style }) {
  return (
    <a href={href} target={href && href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="fbm-ext t-link"
      style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", ...style }}>
      <span className="fbm-extlabel" style={extLabel}>{label}</span>
      <span className="fbm-arrow" style={{ color: v("primary"), display: "inline-flex" }}>{arrow}</span>
    </a>
  );
}

function LangToggle({ locale, setLocale, ariaLabel, style }) {
  const opt = (code, label) => {
    const active = locale === code;
    return (
      <button type="button" className="fbm-langbtn t-label-xs" onClick={() => setLocale(code)} aria-pressed={active}
        style={{ border: "none", cursor: "pointer", padding: "5px 11px", borderRadius: r("md"),
          background: active ? v("primary") : "transparent", color: active ? v("on-primary") : v("on-surface-variant") }}>
        {label}
      </button>
    );
  };
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: "inline-flex", gap: 2, padding: 3, borderRadius: r("lg"), border: `1px solid ${v("outline")}`, background: mix("surface-deep", 30), ...style }}>
      {opt("en", "EN")}
      {opt("pt-BR", "PT-BR")}
    </div>
  );
}

function RbacDiagram() {
  const box = { padding: "5px 0", borderRadius: r("sm"), textAlign: "center" };
  return (
    <div style={{ borderRadius: r("xl"), border: `1px solid ${v("outline")}`, minHeight: 170, background: stripes(10, 20), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", padding: 16 }}>
      <div className="t-mono" style={{ ...box, width: 110, background: `linear-gradient(120deg,${v("tertiary")},${v("primary")})`, color: v("on-surface") }}>Administrator</div>
      <div className="t-mono" style={{ ...box, width: 86, background: mix("secondary", 40), border: `1px solid ${v("secondary")}`, color: v("on-surface") }}>RH Admin ×3</div>
      <div className="t-mono" style={{ ...box, width: 104, background: mix("outline", 30), border: `1px solid ${v("outline")}`, color: v("on-surface-variant") }}>RH ×19 stores</div>
      <span className="t-mono" style={{ color: v("tertiary"), lineHeight: 1.5 }}>three-tier RBAC</span>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div style={{ borderRadius: r("xl"), border: `1px solid ${v("outline")}`, minHeight: 170, background: stripes(10, 20), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: sp("sm"), textAlign: "center", padding: sp("md") }}>
      <div style={{ width: 34, height: 34, borderRadius: r("md"), background: ACCENT }} />
      <span className="t-mono" style={{ color: v("on-surface-variant"), lineHeight: 1.5 }}>architecture<br />diagram</span>
    </div>
  );
}

function ImageSlider({ images, height }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;
  const img = images[idx];
  const multi = images.length > 1;
  const navBtnStyle = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: r("full"), border: `1px solid ${mix("on-surface", 30)}`, background: mix("surface-media", 55), backdropFilter: "blur(4px)", color: v("on-surface"), fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
  return (
    <div style={{ position: "relative", background: v("surface-media"), borderBottom: `1px solid ${v("outline")}` }}>
      <img src={img.src} alt={img.alt} style={{ display: "block", width: "100%", ...(height ? { height, objectFit: "cover", objectPosition: "top" } : { maxHeight: 460, objectFit: "contain" }), background: v("surface-media") }} />
      {multi && (
        <>
          <button type="button" aria-label="Previous image" onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)} style={{ ...navBtnStyle, left: 12 }}>‹</button>
          <button type="button" aria-label="Next image" onClick={() => setIdx((i) => (i + 1) % images.length)} style={{ ...navBtnStyle, right: 12 }}>›</button>
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {images.map((_, i) => (
              <button key={i} type="button" aria-label={`Show image ${i + 1} of ${images.length}`} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 18 : 7, height: 7, padding: 0, borderRadius: r("full"), border: "none", cursor: "pointer", background: i === idx ? v("primary") : mix("on-surface", 40), transition: "width .25s ease,background .25s ease" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- project cards ---------- */
function CardBody({ card, bulletColor }) {
  return (
    <>
      <h3 className="t-title-lg" style={{ color: v("on-surface"), margin: "0 0 6px" }}>{card.title}</h3>
      <p className="t-body-md" style={{ margin: "0 0 16px", color: v("on-surface-variant") }}>{card.description}</p>
      {card.bullets && (
        <ul style={{ listStyle: "none", margin: "0 0 18px", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {card.bullets.map((b, i) => <Bullet key={i} color={bulletColor}>{b}</Bullet>)}
        </ul>
      )}
      {card.badges && <div style={{ ...rowWrap, marginBottom: 16 }}>{card.badges.map((b, i) => <span key={i} className="t-label" style={badgeStyle}>{b}</span>)}</div>}
      {card.pills && <div style={{ ...pillWrap, marginBottom: 18 }}>{card.pills.map((p, i) => <Pill key={i}>{p}</Pill>)}</div>}
    </>
  );
}

function HeroCardBody({ card }) {
  return (
    <div>
      <CardBody card={card} bulletColor="primary" />
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {card.link && <ExtLink href={card.link.href} label={card.link.label} arrow="↗" />}
        {card.note && <span className="t-label" style={{ color: v("tertiary"), fontStyle: "italic", fontWeight: 400 }}>{card.note}</span>}
      </div>
    </div>
  );
}

function HeroCard({ card }) {
  const hasImages = card.images && card.images.length > 0;
  return (
    <article className="fbm-card fbm-reveal" style={{ border: `1px solid ${mix("outline", 60)}`, borderRadius: r("4xl"), padding: 0, overflow: "hidden", background: mix("surface-deep", 22), marginBottom: sp("md") }}>
      <div style={{ padding: "8px 20px", background: GRADIENT_H, display: "flex", alignItems: "center", gap: sp("sm") }}>
        <span className="t-label-bar" style={{ textTransform: "uppercase", color: v("on-primary") }}>{card.barLabel}</span>
      </div>
      {hasImages ? (
        <>
          <ImageSlider images={card.images} />
          <div style={{ padding: sp("xl") }}><HeroCardBody card={card} /></div>
        </>
      ) : (
        <div className="fbm-cardgrid" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: sp("xl"), padding: sp("xl") }}>
          {card.diagram === "rbac" ? <RbacDiagram /> : <ArchDiagram />}
          <HeroCardBody card={card} />
        </div>
      )}
    </article>
  );
}

function SimpleCard({ card }) {
  return (
    <article className="fbm-card fbm-reveal" style={{ border: `1px solid ${mix("outline", 50)}`, borderRadius: r("3xl"), padding: 0, overflow: "hidden", background: mix("surface-deep", 16), marginBottom: sp("md") }}>
      {card.images && card.images.length > 0 && <ImageSlider images={card.images} />}
      <div style={{ padding: sp("xl") }}>
        <CardBody card={card} bulletColor="secondary" />
        {card.link && <ExtLink href={card.link.href} label={card.link.label} arrow="↗" />}
      </div>
    </article>
  );
}

function CompactCard({ card }) {
  const title = card.link ? (
    <a href={card.link.href} target="_blank" rel="noopener noreferrer" className="fbm-ext" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
      <h3 className="fbm-extlabel t-title-md" style={{ color: v("on-surface"), margin: 0, transition: "color .25s ease" }}>{card.title}</h3>
      <span className="fbm-arrow" style={{ color: v("secondary"), display: "inline-flex" }}>↗</span>
    </a>
  ) : (
    <h3 className="t-title-md" style={{ color: v("on-surface"), margin: 0 }}>{card.title}</h3>
  );
  return (
    <article className="fbm-card fbm-reveal" style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 20, padding: 22, borderRadius: r("2xl"), border: "1px solid transparent" }}>
      <div className="fbm-cardgrid-hide" style={{ borderRadius: r("lg"), border: `1px solid ${v("outline")}`, overflow: "hidden", background: card.images?.[0] ? undefined : stripes(8, 16), display: "flex", alignItems: "center", justifyContent: "center", minHeight: 70 }}>
        {card.images?.[0] ? (
          <img src={card.images[0].src} alt={card.images[0].alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 26, height: 26, borderRadius: r("sm"), background: ACCENT }} />
        )}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: sp("sm") }}>
          {title}
          {card.inlineBadge && <span className="t-label" style={{ ...badgeStyle, padding: "3px 9px", background: mix("tertiary", 20) }}>{card.inlineBadge}</span>}
        </div>
        <p className="t-body-md" style={{ margin: "0 0 12px", color: v("on-surface-variant") }}>{card.description}</p>
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
    <div className="fbm-reveal" style={{ display: "flex", alignItems: "center", gap: sp("md"), margin: "0 0 8px" }}>
      <span style={{ width: 8, height: 8, borderRadius: r("full"), background: v(dotColor), boxShadow: glow ? `0 0 12px ${mix("primary", 70)}` : "none", flexShrink: 0 }} />
      <span className="t-label-caps" style={{ textTransform: "uppercase", color: v("on-surface"), whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${v("outline")},transparent)` }} />
    </div>
  );
}

/* ---------- project tower ---------- */
// Desktop + motion allowed → spinning helix; otherwise the stacked list.
const TOWER_QUERY = "(min-width:901px) and (prefers-reduced-motion: no-preference)";
function useTowerMode() {
  const [on, setOn] = useState(() => window.matchMedia(TOWER_QUERY).matches);
  useEffect(() => {
    const m = window.matchMedia(TOWER_QUERY);
    const onChange = () => setOn(m.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  return on;
}

// Native scroll-driven animation drives --tp/--k in CSS; older engines get the JS fallback below.
// (window.CSS — the module-level `CSS` is this file's stylesheet string)
const nativeSpin = () => window.CSS.supports("animation-timeline: view()") && window.CSS.supports("width: round(down, 1px, 1px)");

// Same easing as the CSS: hold flat near each card, smoothstep between cards.
function easeIndex(p, n) {
  const k = p * (n - 1), base = Math.floor(k);
  const x = Math.min(1, Math.max(0, (k - base - TOWER_HOLD) / (1 - 2 * TOWER_HOLD)));
  return base + x * x * (3 - 2 * x);
}

function TowerCard({ card, index, front, ui, onDetails, onFocusCard }) {
  const hasImages = card.images && card.images.length > 0;
  return (
    <article className="fbm-tcard" style={{ "--i": index }} data-front={front || undefined} onFocus={() => onFocusCard(index)}>
      <div style={{ flexShrink: 0 }}>
        {hasImages ? <ImageSlider images={card.images} height={230} /> : (
          <div style={{ height: 230, background: stripes(10, 20), borderBottom: `1px solid ${v("outline")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: r("lg"), background: ACCENT }} />
          </div>
        )}
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
        {(card.barLabel || card.inlineBadge) && <span className="t-label-bar" style={{ textTransform: "uppercase", color: v("secondary") }}>{card.barLabel || card.inlineBadge}</span>}
        <h3 className="t-title-lg" style={{ color: v("on-surface"), margin: 0 }}>{card.title}</h3>
        <p className="t-body-sm fbm-tdesc" style={{ margin: 0, color: v("on-surface-variant") }}>{card.description}</p>
        {card.badges ? <div style={{ ...rowWrap, gap: 6 }}>{card.badges.slice(0, 3).map((b, i) => <span key={i} className="t-label" style={{ ...badgeStyle, padding: "3px 9px" }}>{b}</span>)}</div>
          : card.pills && <div style={pillWrap}>{card.pills.slice(0, 7).map((p, i) => <Pill key={i}>{p}</Pill>)}</div>}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {card.link ? <ExtLink href={card.link.href} label={card.link.label || new URL(card.link.href).hostname.replace(/^www\./, "")} arrow="↗" /> : <span />}
          <button type="button" className="fbm-pill t-label" onClick={() => onDetails(card)} style={{ ...pillStyleLg, background: "transparent", cursor: "pointer" }}>{ui.projectDetails} +</button>
        </div>
      </div>
    </article>
  );
}

function ProjectTower({ projects, ui, lenis }) {
  const cards = [
    ...projects.live.map((card) => ({ card, group: "live" })),
    ...projects.internal.map((card) => ({ card, group: "internal" })),
  ];
  const n = cards.length;
  const towerRef = useRef(null);
  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const tower = towerRef.current, stage = stageRef.current;
    const native = nativeSpin();
    let raf = null;
    const update = () => {
      raf = null;
      const rect = tower.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height - window.innerHeight)));
      if (!native) {
        stage.style.setProperty("--tp", p);
        stage.style.setProperty("--k", easeIndex(p, n));
      }
      setActive(Math.round(p * (n - 1)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [n]);

  // Smooth-scroll snapping: settle on the nearest card once the visitor stops scrolling nearby.
  useEffect(() => {
    if (!lenis) return;
    const snap = new Snap(lenis, { type: "proximity", distanceThreshold: "30%", debounce: 160, duration: 0.9 });
    towerRef.current.querySelectorAll(".fbm-tower-snap").forEach((el) => snap.addElement(el, { align: ["start"] }));
    return () => snap.destroy();
  }, [lenis, n]);

  useEffect(() => {
    const d = dialogRef.current;
    if (detail && !d.open) { d.showModal(); lenis?.stop(); }
    if (!detail) lenis?.start();
  }, [detail, lenis]);

  // Keyboard users tabbing into a card that isn't in front: spin it to the front.
  const focusCard = (i) => {
    if (i === active) return;
    const top = towerRef.current.getBoundingClientRect().top + window.scrollY + (i * TOWER_SEG * window.innerHeight) / 100;
    if (lenis) lenis.scrollTo(top, { duration: 0.9 });
    else window.scrollTo({ top });
  };

  const group = cards[active].group;
  return (
    <div ref={towerRef} className="fbm-tower" style={{ "--n": n }}>
      {cards.map((_, i) => <div key={i} className="fbm-tower-snap" aria-hidden="true" style={{ top: `${i * TOWER_SEG}vh` }} />)}
      <div ref={stageRef} className="fbm-stage" style={{ "--step": `${360 / Math.max(n, 6)}deg` }}>
        <div className="fbm-axis" aria-hidden="true" />
        <div className="fbm-ring">
          {cards.map(({ card }, i) => (
            <TowerCard key={i} card={card} index={i} front={i === active} ui={ui} onDetails={setDetail} onFocusCard={focusCard} />
          ))}
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: `${sp("2xl")} 0 ${sp("2xl")}`, background: `linear-gradient(180deg,${v("background")} 72%,transparent)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: sp("md") }}>
            <span style={{ width: 8, height: 8, borderRadius: r("full"), background: v(group === "live" ? "primary" : "outline"), boxShadow: group === "live" ? `0 0 12px ${mix("primary", 70)}` : "none" }} />
            <span className="t-label-caps" style={{ textTransform: "uppercase", color: v("on-surface") }} aria-live="polite">{group === "live" ? projects.liveLabel : projects.internalLabel}</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${v("outline")},transparent)` }} />
            <span className="t-label-meta" style={{ color: v("secondary") }}>{String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          </div>
          <p className="t-caption" style={{ margin: "8px 0 0 22px", color: v("on-surface-variant"), maxWidth: 560, opacity: group === "internal" ? 1 : 0, transition: "opacity .4s ease" }}>{projects.internalIntro}</p>
        </div>
        <span className="t-label-meta" style={{ position: "absolute", zIndex: 3, bottom: sp("xl"), left: 0, right: 0, textAlign: "center", textTransform: "uppercase", color: v("on-surface-variant"), opacity: active === 0 ? 1 : 0, transition: "opacity .4s ease" }} aria-hidden="true">{ui.towerHint} ↓</span>
      </div>
      <dialog ref={dialogRef} className="fbm-dialog" data-lenis-prevent onClose={() => setDetail(null)} onClick={(e) => { if (e.target === dialogRef.current) dialogRef.current.close(); }}>
        {detail && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px 0" }}>
              <button type="button" className="fbm-pill t-label" onClick={() => dialogRef.current.close()} style={{ ...pillStyleLg, background: "transparent", cursor: "pointer" }}>{ui.close} ✕</button>
            </div>
            <div style={{ padding: "8px 12px 12px" }}><ProjectCard card={detail} /></div>
          </>
        )}
      </dialog>
    </div>
  );
}

/* ---------- navigation ---------- */
function NavLinks({ items, onGo }) {
  return items.map(([id, label]) => (
    <a key={id} href={"#" + id} data-nav={id} className="fbm-navlink" onClick={(e) => { e.preventDefault(); onGo(id); }}>
      <span className="fbm-navline" />
      <span className="fbm-navtext t-label-caps">{label}</span>
    </a>
  ));
}

// Floating section nav: fades in once the hero is behind us; collapsed to lines, expands sideways.
function SideNav({ show, items, onGo, label }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fbm-side" aria-label={label} data-show={show || undefined} data-open={open || undefined} aria-hidden={!show} inert={!show ? "" : undefined}>
      <button type="button" className="fbm-sidetoggle" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>{open ? "‹" : "≡"}</button>
      <NavLinks items={items} onGo={(id) => { setOpen(false); onGo(id); }} />
    </nav>
  );
}

const Socials = ({ c }) => (
  <div style={{ display: "flex", alignItems: "center", gap: sp("lg") }}>
    <a href={c.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="fbm-social" style={{ color: v("on-surface-variant"), display: "inline-flex" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>
    </a>
    <a href={c.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="fbm-social" style={{ color: v("on-surface-variant"), display: "inline-flex" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" /></svg>
    </a>
    <a href={"mailto:" + c.social.email} aria-label="Email" className="fbm-social" style={{ color: v("on-surface-variant"), display: "inline-flex" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 6 9 7 9-7" /></svg>
    </a>
  </div>
);

/* ---------- main ---------- */
export default function Portfolio() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const { locale, content: c, setLocale } = useLocale();
  const towerMode = useTowerMode();
  const [lenis, setLenis] = useState(null);
  const [pastHero, setPastHero] = useState(false);

  // Smooth scrolling (wheel); skipped entirely when the visitor prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9 });
    setLenis(l);
    return () => { l.destroy(); setLenis(null); };
  }, []);

  // The floating nav appears once the hero is mostly scrolled away (i.e. entering Projects).
  useEffect(() => {
    const io = new IntersectionObserver(([en]) => setPastHero(en.intersectionRatio < 0.2 && en.boundingClientRect.top < 0), { threshold: [0, 0.2, 0.5] });
    io.observe(heroRef.current);
    return () => io.disconnect();
  }, []);

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

    const ids = ["projects", "about", "experience", "talks", "contact"];
    const sections = ids.map((id) => root.querySelector("#" + id)).filter(Boolean);
    const links = Array.from(root.querySelectorAll(".fbm-navlink"));
    const setActive = (id) => links.forEach((l) => l.classList.toggle("active", l.getAttribute("data-nav") === id));
    if ("IntersectionObserver" in window && sections.length) {
      const vis = {};
      const so = new IntersectionObserver((entries) => {
        entries.forEach((en) => { vis[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
        let best = null, br = 0;
        Object.keys(vis).forEach((id) => { if (vis[id] > br) { br = vis[id]; best = id; } });
        setActive(best);
      }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
      sections.forEach((s) => so.observe(s));
      cleanups.push(() => so.disconnect());
    }

    return () => cleanups.forEach((fn) => { try { fn(); } catch (e) {} });
    // re-run when locale or project layout changes so the newly rendered nodes get observed
  }, [locale, towerMode]);

  const navItems = [
    ["projects", c.nav.projects], ["about", c.nav.about], ["experience", c.nav.experience], ["talks", c.nav.talks], ["contact", c.nav.contact],
  ];

  // Nav click: glide to the section, then move keyboard focus to its heading.
  const goTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const focus = () => el.querySelector("h2")?.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(el, { offset: -48, duration: 1.4, onComplete: focus });
    else { el.scrollIntoView({ behavior: "auto" }); focus(); }
    history.replaceState(null, "", "#" + id);
  };
  const sectionTitle = (text, style) => <h2 tabIndex={-1} className="fbm-reveal t-section-label" style={{ ...sectionH2, outline: "none", ...style }}>{text}</h2>;

  return (
    <>
      <style>{CSS}</style>
      <div ref={rootRef} className="t-body-lg" style={{ position: "relative", background: v("background"), color: v("on-surface-variant"), lineHeight: 1.6, minHeight: "100vh" }}>

        <a href="#fbm-main" className="fbm-skip">{locale === "pt-BR" ? "Pular para o conteúdo" : "Skip to content"}</a>

        <div id="fbm-spotlight" aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, width: 640, height: 640, pointerEvents: "none", zIndex: 0, borderRadius: r("full"), background: `radial-gradient(circle at center, ${mix("outline", 35)}, ${mix("surface-deep", 22)} 35%, transparent 68%)`, transform: "translate(-50%,-50%)", opacity: 0, transition: "opacity .4s ease" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(1200px 700px at 30% 0%, ${mix("surface-deep", 45)}, transparent 60%)` }} />

        <SideNav show={pastHero} items={navItems} onGo={goTo} label={c.ui.sectionsNav} />

        <div className="fbm-container" style={{ position: "relative", zIndex: 1 }}>

          {/* HERO — the introduction */}
          <header ref={heroRef} className="fbm-hero">
            <div style={{ position: "absolute", top: sp("xl"), right: 0 }}>
              <LangToggle locale={locale} setLocale={setLocale} ariaLabel={c.ui.langToggleAria} />
            </div>
            <p className="t-eyebrow" style={{ textTransform: "uppercase", color: v("secondary"), margin: "0 0 18px" }}>{c.hero.role}</p>
            <h1 className="t-display" style={{ fontSize: "clamp(48px,9vw,112px)", margin: "0 0 24px", background: `linear-gradient(120deg,${v("surface-deep")} 0%,${v("secondary")} 45%,${v("primary")} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: v("primary") }}>{c.hero.name}</h1>
            <p className="t-body-lg" style={{ color: v("on-surface-variant"), maxWidth: 620, margin: "0 0 34px", fontSize: "clamp(16px,1.6vw,19px)" }}>{c.hero.tagline}</p>

            <div style={{ display: "flex", alignItems: "center", gap: sp("xl"), flexWrap: "wrap", marginBottom: sp("3xl") }}>
              <div style={{ display: "flex", gap: sp("md"), flexWrap: "wrap" }}>
                <a href={c.hero.resumeHref} className="fbm-btn t-button" style={{ display: "inline-flex", alignItems: "center", gap: sp("sm"), padding: "13px 24px", borderRadius: r("lg"), background: GRADIENT, color: v("on-primary"), textDecoration: "none", boxShadow: `0 8px 28px ${mix("primary", 28)}` }}>{c.hero.resumeCta}</a>
                <a href={"mailto:" + c.social.email} className="fbm-btn t-button" style={{ display: "inline-flex", alignItems: "center", gap: sp("sm"), padding: "13px 24px", borderRadius: r("lg"), background: "transparent", border: `1px solid ${v("outline")}`, color: v("on-surface"), fontWeight: 600, textDecoration: "none" }}>{c.hero.contactCta}</a>
              </div>
              <Socials c={c} />
            </div>

            <nav className="fbm-heronav" aria-label={c.ui.sectionsNav}>
              <NavLinks items={navItems} onGo={goTo} />
            </nav>
            <span className="fbm-cue" aria-hidden="true" />
          </header>

          <main id="fbm-main">

            {/* PROJECTS — the tower */}
            <section id="projects" data-screen-label="Projects" style={sectionStyle}>
              <div className="fbm-narrow">
                {sectionTitle(c.projects.heading, { margin: "0 0 10px" })}
                <p className="fbm-reveal t-body-md" style={{ margin: "0 0 30px", color: v("on-surface-variant"), maxWidth: 560 }}>{c.projects.intro}</p>
              </div>

              {towerMode ? <ProjectTower projects={c.projects} ui={c.ui} lenis={lenis} /> : (
                <div className="fbm-narrow">
                  <GroupHeader label={c.projects.liveLabel} dotColor="primary" glow />
                  <div style={{ height: 22 }} />
                  {c.projects.live.map((card, i) => <ProjectCard key={i} card={card} />)}

                  <div style={{ height: 12 }} />
                  <GroupHeader label={c.projects.internalLabel} dotColor="outline" />
                  <p className="fbm-reveal t-caption" style={{ margin: "0 0 22px", color: v("tertiary"), maxWidth: 560 }}>{c.projects.internalIntro}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: sp("md") }}>
                    {c.projects.internal.map((card, i) => <ProjectCard key={i} card={card} />)}
                  </div>
                </div>
              )}

              <div className="fbm-narrow">
                <ExtLink href={c.projects.archiveHref} label={c.projects.archiveLink} style={{ marginTop: 24 }} />
                <p className="fbm-reveal t-caption" style={{ margin: "12px 0 0", color: v("tertiary"), maxWidth: 560 }}>{c.projects.archiveList}</p>
              </div>
            </section>

            <div className="fbm-narrow">
              {/* ABOUT */}
              <section id="about" data-screen-label="About" style={sectionStyle}>
                {sectionTitle(c.about.heading, { margin: "0 0 26px" })}
                <div className="fbm-reveal t-body-lg" style={{ display: "flex", flexDirection: "column", gap: sp("lg"), lineHeight: 1.6, color: v("on-surface-variant"), maxWidth: 680 }}>
                  {c.about.paragraphs.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
                </div>
              </section>

              {/* EXPERIENCE */}
              <section id="experience" data-screen-label="Experience" style={sectionStyle}>
                {sectionTitle(c.experience.heading)}
                <div className="fbm-explist" style={{ display: "flex", flexDirection: "column", gap: sp("md") }}>
                  {c.experience.roles.map((role, i) => (
                    <article key={i} className="fbm-card fbm-reveal fbm-exprow" style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: sp("lg"), padding: 22, borderRadius: r("2xl"), border: "1px solid transparent" }}>
                      <div className="t-label-meta" style={{ textTransform: "uppercase", color: v("secondary"), paddingTop: sp("xs") }}>{role.period}</div>
                      <div>
                        <h3 className="t-title-md" style={{ color: v("on-surface"), margin: "0 0 8px" }}>{role.title} · <span style={{ color: v("primary") }}>{role.company}</span></h3>
                        {role.location && <p className="t-label" style={{ margin: "0 0 6px", color: v("tertiary"), fontWeight: 400, letterSpacing: ".04em" }}>{role.location}</p>}
                        <p className="t-body-md" style={{ margin: "0 0 14px", color: v("on-surface-variant") }}>{role.description}</p>
                        <div style={rowWrap}>{role.pills.map((p, j) => <Pill key={j} large>{p}</Pill>)}</div>
                      </div>
                    </article>
                  ))}
                </div>
                <ExtLink href={c.experience.resumeHref} label={c.experience.resumeLink} style={{ marginTop: sp("xl") }} />
              </section>

              {/* TALKS */}
              <section id="talks" data-screen-label="Talks" style={sectionStyle}>
                {sectionTitle(c.talks.heading)}
                <div className="fbm-explist" style={{ display: "flex", flexDirection: "column", gap: sp("md") }}>
                  {c.talks.items.map((t, i) => (
                    <article key={i} className="fbm-card fbm-reveal fbm-exprow" style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: sp("lg"), padding: "20px 22px", borderRadius: r("2xl"), border: "1px solid transparent", alignItems: "baseline" }}>
                      <div className="t-label-meta" style={{ textTransform: "uppercase", color: v("secondary") }}>{t.kind}</div>
                      <div>
                        <h3 className="t-title-sm" style={{ color: v("on-surface"), margin: "0 0 5px" }}>{t.title} <span style={{ color: v("tertiary"), fontWeight: 500 }}>· {t.org}</span></h3>
                        <p className="t-body-sm" style={{ margin: 0, color: v("on-surface-variant") }}>{t.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* CONTACT */}
              <section id="contact" data-screen-label="Contact" style={{ marginBottom: 70, scrollMarginTop: sp("4xl"), textAlign: "center", padding: "20px 0" }}>
                <p className="fbm-reveal t-eyebrow" style={{ textTransform: "uppercase", color: v("secondary"), margin: "0 0 16px" }}>{c.contact.eyebrow}</p>
                <h2 tabIndex={-1} className="fbm-reveal t-headline" style={{ fontSize: "clamp(30px,4vw,42px)", color: v("on-surface"), margin: "0 0 16px", outline: "none" }}>{c.contact.heading}</h2>
                <p className="fbm-reveal t-body-lg" style={{ color: v("on-surface-variant"), margin: "0 auto 32px", maxWidth: 440, lineHeight: 1.6 }}>{c.contact.line}</p>
                <a href={"mailto:" + c.contact.email} className="fbm-btn fbm-reveal t-button-lg" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 34px", borderRadius: r("xl"), background: GRADIENT, color: v("on-primary"), textDecoration: "none", boxShadow: `0 12px 36px ${mix("primary", 32)}` }}>{c.contact.cta}</a>
                <p className="fbm-reveal t-caption" style={{ margin: "28px 0 0", color: v("tertiary") }}>{c.contact.location}</p>
              </section>

              {/* FOOTER */}
              <footer style={{ borderTop: `1px solid ${mix("outline", 35)}`, padding: `${sp("xl")} 0 ${sp("2xl")}`, textAlign: "center" }}>
                <p className="t-footer" style={{ margin: 0, color: v("tertiary") }}>{c.footer.credit}</p>
              </footer>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
