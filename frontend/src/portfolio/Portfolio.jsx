import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  m, LazyMotion, MotionConfig, AnimatePresence,
  useScroll, useSpring, useTransform, useMotionValue, useMotionValueEvent, useReducedMotion,
} from "motion/react";
import useLocale from "./useLocale";
import useTheme from "./useTheme";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./tokens.css";

/*
  Felipe Bell Marques — Portfolio (bilingual, data-driven)

  Renders entirely from ./content/en.json or ./content/pt-BR.json.
  Language is auto-detected from the visitor's browser (Portuguese locales get
  pt-BR, everyone else gets English) and can be switched with the EN / PT-BR
  toggle; the choice persists in localStorage. See ./useLocale.js.

  The look is Punk Grunge (see /DESIGN.md): a wall with paper pasted on it. Visual tokens
  (colors, type scale `.t-*`, spacing, radii) come from /DESIGN.md, compiled into ./tokens.css
  by `npm run tokens`. Don't hard-code hex values or font sizes here — reference the token.

  Surfaces set four local variables that every component reads: --bg, --fg, --fg-strong and
  --mut (plus --ln for rules and --focus for focus rings). The wall is the default; `.fbm-paper`
  (sheets) and `.fbm-band` (the torn About band) re-point them, so a pill, a link or a button
  looks right on any surface without knowing which one it is on.

  Motion (motion.dev, `m.*` components under LazyMotion) owns the stamps, the hero parallax
  layers, the drifting ghost words, nav indicators, slider and dialog. Don't add CSS transitions
  on `transform`/`opacity` for elements Motion animates. Buttons drop into their shadow with the
  CSS `translate` property, which Motion never touches.
*/

/* ---------- token helpers ---------- */
const v = (token) => `var(--color-${token})`;
const mix = (token, pct) => `color-mix(in srgb,var(--color-${token}) ${pct}%,transparent)`;
const sp = (token) => `var(--spacing-${token})`;
const r = (token) => `var(--rounded-${token})`;
const f = (role) => `var(--font-${role})`;
const TOWER_SEG = 50;    // vh of scroll per project in the tower
const TOWER_HOLD = 0.15; // fraction of each segment, at both ends, where the tower holds still on a card
// halftone dot screen: `size` px grid of `dot` px dots
const dots = (token, dot, size) => `radial-gradient(circle,${v(token)} ${dot}px,transparent ${dot + 0.6}px) 0 0/${size}px ${size}px`;

/* ---------- torn edges ---------- */
// Deterministic jagged clip-path: every torn edge gets its own seed, so no two tears match
// and none of them changes between renders.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function torn(seed, { top = 0, bottom = 0, steps = 30 } = {}) {
  const rand = rng(seed), pts = [];
  const xAt = (i) => (i === 0 || i === steps ? (i / steps) * 100 : ((i + (rand() - 0.5) * 0.7) / steps) * 100).toFixed(2);
  for (let i = 0; i <= steps; i++) pts.push(`${xAt(i)}% ${top ? (rand() * top).toFixed(1) : 0}px`);
  for (let i = steps; i >= 0; i--) pts.push(`${xAt(i)}% calc(100% - ${bottom ? (rand() * bottom).toFixed(1) : 0}px)`);
  return `polygon(${pts.join(",")})`;
}
const TORN = {
  portrait: torn(7, { bottom: 18, steps: 20 }),
  band: torn(23, { top: 20, bottom: 20, steps: 64 }),
  flyer: torn(41, { bottom: 16, steps: 46 }),
};

/* ---------- motion presets ---------- */
const EASE = [0.2, 0.9, 0.3, 1];
const SPRING = { type: "spring", stiffness: 380, damping: 30 };
const VIEW = { once: true, amount: 0.15, margin: "0px 0px -6% 0px" };
// stamp: a sheet lands over-scaled and a few degrees off, then settles at its resting angle `to`
const stamp = (delay = 0, to = 0, from = to - 3) => ({
  initial: { opacity: 0, scale: 1.07, rotate: from },
  whileInView: { opacity: 1, scale: 1, rotate: to },
  viewport: VIEW,
  transition: { duration: 0.26, ease: EASE, delay },
});
// reveal: the quieter version for running text
const reveal = (delay = 0) => ({
  initial: { opacity: 0, scale: 1.025 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: VIEW,
  transition: { duration: 0.22, ease: EASE, delay },
});
const press = { whileTap: { scale: 0.94, transition: SPRING } };
// hero entrance: everything slams in, in order
const heroChild = (delay = 0, to = 0, from = to - 4) => ({
  hidden: { opacity: 0, scale: 1.18, rotate: from },
  show: { opacity: 1, scale: 1, rotate: to, transition: { duration: 0.22, ease: EASE, delay } },
});
const TILE_ROT = [-5, 4, -2.5, 6];
const TICKET_ROT = [-1.2, 0.8, 0.6, -0.9];

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.5 1.05'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const CSS = `
*{box-sizing:border-box;}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-text-size-adjust:100%;text-size-adjust:100%;-webkit-tap-highlight-color:${mix("accent", 30)};}
body{margin:0;background:${v("base")};overflow-x:hidden;}
:root{--bg:${v("base")};--fg:${v("structure")};--fg-strong:${v("structure-strong")};--mut:${v("muted")};--ln:${v("line")};--focus:${v("accent")};}
::view-transition-old(root),::view-transition-new(root){animation-duration:.35s;animation-timing-function:ease;}
::selection{background:${v("accent")};color:${v("on-accent")};}
.fbm-root{position:relative;min-height:100vh;background:var(--bg);color:var(--fg);overflow-x:clip;}
.fbm-paper{--bg:${v("paper")};--fg:${v("ink")};--fg-strong:${v("ink")};--mut:${v("paper-muted")};--ln:${v("mid")};--focus:${v("ink")};background:var(--bg);color:var(--fg);}
.fbm-band{--bg:${v("band")};--fg:${v("on-band")};--fg-strong:${v("on-band")};--mut:${v("band-muted")};--ln:${v("mid")};--focus:${v("on-band")};background:var(--bg);color:var(--fg);}
.fbm-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}
.fbm-container{position:relative;z-index:1;max-width:${sp("container")};margin:0 auto;padding:0 ${sp("gutter")};}
.fbm-prose{max-width:min(${sp("measure")},62ch);text-wrap:pretty;}
h1,h2,h3{text-wrap:balance;overflow-wrap:break-word;}
a,button{touch-action:manipulation;}
a:focus-visible,button:focus-visible{outline:3px solid var(--focus);outline-offset:3px;}
h2:focus-visible{outline:3px solid var(--focus);outline-offset:8px;}
/* photocopy grain: one fixed, masked layer over everything — not a live filter */
.fbm-grain{position:fixed;inset:0;z-index:80;pointer-events:none;background:${v("mid")};opacity:.17;-webkit-mask-image:${NOISE};mask-image:${NOISE};-webkit-mask-size:240px 240px;mask-size:240px 240px;}
.fbm-skip{position:absolute;left:16px;top:-64px;z-index:100;background:${v("accent")};color:${v("on-accent")};padding:12px 18px;border:2px solid ${v("structure")};text-decoration:none;text-transform:uppercase;transition:top .15s ease;}
.fbm-skip:focus{top:16px;}

/* --- small parts ------------------------------------------------------------------ */
.fbm-strip{display:inline-block;padding:4px 9px;background:var(--fg);color:var(--bg);text-transform:uppercase;}
.fbm-pills{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none;}
.fbm-pill{display:inline-block;padding:3px 9px;border:1px solid var(--mut);color:var(--fg);white-space:nowrap;}
.fbm-strips{display:flex;flex-wrap:wrap;gap:6px;}
.fbm-btn{display:inline-flex;align-items:center;justify-content:center;gap:${sp("sm")};padding:14px 22px;border:2px solid var(--fg);background:var(--bg);color:var(--fg);
  text-decoration:none;text-transform:uppercase;white-space:nowrap;cursor:pointer;touch-action:manipulation;box-shadow:5px 5px 0 var(--fg);transition:translate .12s ease-out,box-shadow .12s ease-out;}
.fbm-btn:hover{translate:2px 2px;box-shadow:3px 3px 0 var(--fg);}
.fbm-btn:active{translate:5px 5px;box-shadow:0 0 0 var(--fg);}
.fbm-btn[data-primary]{background:${v("accent")};color:${v("on-accent")};}
.fbm-btn[data-lg]{padding:18px 34px;box-shadow:7px 7px 0 var(--fg);}
.fbm-btn[data-lg]:hover{translate:3px 3px;box-shadow:4px 4px 0 var(--fg);}
.fbm-btn[data-lg]:active{translate:7px 7px;box-shadow:0 0 0 var(--fg);}
.fbm-btn[data-sm]{padding:9px 12px;box-shadow:3px 3px 0 var(--fg);}
.fbm-btn[data-sm]:hover{translate:1px 1px;box-shadow:2px 2px 0 var(--fg);}
.fbm-btn[data-sm]:active{translate:3px 3px;box-shadow:0 0 0 var(--fg);}
.fbm-ext{display:inline-flex;align-items:baseline;gap:6px;margin:-3px -5px;padding:3px 5px;color:var(--fg);text-transform:uppercase;
  text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px;}
.fbm-ext:hover{background:${v("accent")};color:${v("on-accent")};text-decoration-color:transparent;}
.fbm-ext .fbm-arrow{display:inline-block;transition:translate .15s ease;}
.fbm-ext:hover .fbm-arrow{translate:3px -3px;}
.fbm-tape{position:absolute;z-index:3;width:96px;height:26px;background:${mix("mid", 66)};rotate:var(--r,0deg);pointer-events:none;
  clip-path:polygon(0 0,4% 17%,0 34%,4% 52%,0 70%,4% 87%,0 100%,100% 100%,96% 84%,100% 66%,96% 49%,100% 31%,96% 14%,100% 0);}
.fbm-social{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;color:var(--fg);border:2px solid transparent;}
.fbm-social:hover{background:${v("accent")};color:${v("on-accent")};border-color:var(--fg);}
.fbm-scrawl{display:block;overflow:visible;color:${v("accent")};}
.fbm-paper .fbm-scrawl,.fbm-band .fbm-scrawl{color:var(--fg);}

/* --- hero --------------------------------------------------------------------------- */
.fbm-hero{position:relative;z-index:1;min-height:100vh;min-height:100svh;display:flex;flex-direction:column;gap:${sp("lg")};padding:${sp("lg")} 0 ${sp("xl")};}
/* when the role and the toggles don't fit on one line, the toggles wrap to a line above the role */
.fbm-herotop{position:relative;z-index:4;display:flex;flex-wrap:wrap-reverse;align-items:flex-start;justify-content:space-between;gap:${sp("md")};}
.fbm-herotop .fbm-strip{white-space:nowrap;}
.fbm-herotools{display:flex;align-items:center;gap:${sp("md")};margin-left:auto;}
.fbm-herogrid{position:relative;flex:1;display:grid;grid-template-columns:minmax(0,1fr) clamp(230px,26vw,370px);align-items:center;gap:clamp(24px,5vw,80px);}
.fbm-name{position:relative;z-index:2;margin:0 0 ${sp("lg")};font-size:clamp(4rem,min(24vw,19svh),13rem);text-transform:uppercase;color:var(--fg-strong);}
.fbm-nameline{display:block;white-space:nowrap;}
.fbm-ransom{display:flex;align-items:center;gap:.07em;margin:.07em 0 .1em;font-size:.72em;line-height:1;}
.fbm-tile{display:inline-flex;align-items:center;justify-content:center;min-width:.84em;height:1.1em;padding:0 .13em;}
.fbm-tile[data-t="0"]{background:${v("paper")};color:${v("ink")};clip-path:polygon(3% 5%,98% 0,100% 95%,0 100%);}
.fbm-tile[data-t="1"]{background:${v("accent")};color:${v("on-accent")};font-family:${f("mono")};font-weight:700;font-size:1.04em;clip-path:polygon(0 0,100% 6%,96% 100%,2% 94%);}
.fbm-tile[data-t="2"]{background:${v("mid")};color:${v("base")};font-family:${f("body")};font-weight:800;font-size:.9em;clip-path:polygon(0 4%,97% 0,100% 100%,4% 96%);}
.fbm-tile[data-t="3"]{border:.05em solid var(--fg);color:var(--fg);}
.fbm-tagline{margin:0 0 ${sp("lg")};max-width:34rem;text-wrap:pretty;}
.fbm-actions{display:flex;align-items:center;flex-wrap:wrap;gap:${sp("md")} ${sp("lg")};}
.fbm-socials{display:flex;align-items:center;gap:2px;}
.fbm-portrait{position:relative;justify-self:end;width:100%;aspect-ratio:4/5;}
.fbm-portrait>*{position:absolute;}
.fbm-sun{left:-46%;top:-20%;width:152%;aspect-ratio:1;background:${dots("mid", 2.2, 13)};
  -webkit-mask-image:radial-gradient(closest-side,black 30%,transparent 100%);mask-image:radial-gradient(closest-side,black 30%,transparent 100%);}
.fbm-slab{inset:6% -7% -3% 9%;background:${v("accent")};}
.fbm-photo{inset:0;filter:drop-shadow(9px 9px 0 ${v("shadow")});}
.fbm-photo-sheet{position:absolute;inset:0;padding:10px 10px 34px;background:${v("paper")};}
/* halftone: soft dots are screened over the blurred greyscale photo, then extreme contrast turns
   them into hard dots whose size follows the photo's tone */
.fbm-halftone{position:relative;width:100%;height:100%;overflow:hidden;background:${v("paper")};filter:contrast(6);}
.fbm-halftone img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 26%;filter:grayscale(1) brightness(.72) contrast(1.15) blur(.5px);}
.fbm-halftone::after{content:"";position:absolute;inset:-50%;rotate:24deg;mix-blend-mode:screen;background:radial-gradient(circle at center,${v("ink")},${v("mid")}) 0 0/4px 4px;}
.fbm-initials{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:${v("ink")};color:${v("paper")};}
.fbm-hs{color:var(--fg);}
.fbm-hs[data-s="star"]{left:-24%;top:-9%;width:26%;color:${v("accent")};}
.fbm-hs[data-s="arrow"]{left:-50%;bottom:4%;width:44%;}
.fbm-hs[data-s="cross"]{right:-10%;bottom:-9%;width:17%;}
.fbm-heronav{position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:4px ${sp("xl")};padding-top:${sp("md")};border-top:2px solid var(--fg);}

/* --- navigation ---------------------------------------------------------------------- */
.fbm-navlink{display:flex;align-items:center;gap:${sp("sm")};min-height:36px;padding:6px 0;text-decoration:none;}
/* the marker is always 36px wide and scaled to half at rest, so growing it never moves the label */
.fbm-navline{position:relative;width:36px;height:4px;flex-shrink:0;}
.fbm-navline::before{content:"";position:absolute;inset:0;background:var(--ln);transform:scaleX(.5);transform-origin:0 50%;transition:transform .2s ease,background-color .2s ease;}
.fbm-navglow{position:absolute;inset:0;background:${v("accent")};}
.fbm-navtext{text-transform:uppercase;color:var(--mut);white-space:nowrap;transition:color .2s ease;}
.fbm-navlink:hover .fbm-navtext,.fbm-navlink.active .fbm-navtext{color:var(--fg);}
.fbm-navlink:hover .fbm-navline::before{transform:scaleX(1);background:var(--fg);}
.fbm-navlink.active .fbm-navline::before{transform:scaleX(1);}
/* floating section nav (shown/hidden by Motion): collapsed to lines, expands horizontally */
.fbm-side{position:fixed;top:20px;left:20px;z-index:50;display:flex;flex-direction:column;padding:8px 12px 10px;background:${v("surface")};border:2px solid var(--fg);box-shadow:5px 5px 0 ${v("shadow")};}
.fbm-side .fbm-navlink{gap:0;min-height:30px;padding:3px 0;transition:gap .3s ease;}
.fbm-side .fbm-navtext{max-width:0;opacity:0;overflow:hidden;transition:max-width .35s ease,opacity .25s ease,color .2s ease;}
.fbm-side:hover .fbm-navlink,.fbm-side:focus-within .fbm-navlink,.fbm-side[data-open] .fbm-navlink{gap:${sp("sm")};}
.fbm-side:hover .fbm-navtext,.fbm-side:focus-within .fbm-navtext,.fbm-side[data-open] .fbm-navtext{max-width:240px;opacity:1;}
.fbm-sidetools{display:flex;flex-direction:column;align-items:flex-start;gap:${sp("sm")};margin-top:${sp("sm")};padding-top:10px;border-top:2px solid var(--ln);}
.fbm-sidetoggle{align-self:flex-start;width:32px;height:32px;margin:0 0 2px -7px;padding:0;border:none;background:transparent;color:var(--fg);cursor:pointer;font:inherit;font-size:1.125rem;line-height:1;}
.fbm-iconbtn{position:relative;width:32px;height:32px;padding:0;border:2px solid var(--fg);background:var(--bg);color:var(--fg);display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;}
.fbm-iconbtn::before,.fbm-themeswitch::before,.fbm-langbtn::before{content:"";position:absolute;inset:-7px;}
.fbm-iconbtn:hover{background:var(--fg);color:var(--bg);}
.fbm-lang{display:inline-flex;border:2px solid var(--fg);background:var(--bg);}
.fbm-langbtn{position:relative;padding:7px 10px;border:none;background:transparent;color:var(--fg);white-space:nowrap;cursor:pointer;touch-action:manipulation;}
.fbm-langbtn[aria-pressed="true"]{color:var(--bg);}
.fbm-themeswitch{position:relative;width:64px;height:32px;padding:0 7px;border:2px solid var(--fg);background:var(--bg);color:var(--fg);display:flex;align-items:center;justify-content:space-between;cursor:pointer;touch-action:manipulation;}
.fbm-themeknob{position:absolute;top:2px;left:2px;width:24px;height:24px;background:var(--fg);color:var(--bg);display:flex;align-items:center;justify-content:center;}

/* --- sections -------------------------------------------------------------------------- */
.fbm-sec{position:relative;padding-top:clamp(52px,10.5vw,176px);margin-bottom:${sp("section")};scroll-margin-top:${sp("lg")};}
/* the section name, oversized and outlined, drifting sideways behind its own heading */
.fbm-ghost{position:absolute;top:0;left:0;right:0;z-index:0;overflow:clip;pointer-events:none;-webkit-user-select:none;user-select:none;}
.fbm-ghost>span{display:block;width:max-content;white-space:nowrap;font-size:clamp(6.5rem,23vw,25rem);line-height:.84;text-transform:uppercase;color:transparent;-webkit-text-stroke:2px var(--ln);}
.fbm-h2{position:relative;display:inline-block;margin:0;font-size:clamp(3rem,8.4vw,6.5rem);text-transform:uppercase;color:var(--fg-strong);}
.fbm-h2 .fbm-scrawl{width:min(100%,340px);margin-top:6px;}
.fbm-lede{margin:${sp("lg")} 0 0;max-width:36rem;color:var(--mut);text-wrap:pretty;}
.fbm-bandwrap{position:relative;overflow-x:clip;margin-bottom:${sp("section")};}
.fbm-bandwrap .fbm-sec{z-index:1;margin-bottom:0;padding-bottom:clamp(72px,9vw,136px);}
.fbm-tornstrip{position:absolute;z-index:0;left:-6%;width:112%;height:60px;background:${v("mid")};}
.fbm-tornstrip[data-at="top"]{top:-22px;}
.fbm-tornstrip[data-at="bottom"]{bottom:-22px;}
.fbm-split{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:${sp("2xl")};align-items:start;}
/* the right column starts below the ghost word, so no outline runs through the paragraphs */
.fbm-split>:last-child{padding-top:clamp(0px,10vw,168px);}
.fbm-stack{display:flex;flex-direction:column;gap:${sp("lg")};}
.fbm-tour{list-style:none;margin:${sp("2xl")} 0 ${sp("xl")};padding:0;border-bottom:2px solid var(--fg);}
.fbm-date{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:${sp("xl")};padding:${sp("xl")} 0;border-top:2px solid var(--fg);}
.fbm-period{margin:0;text-transform:uppercase;font-variant-numeric:tabular-nums;color:var(--fg-strong);}
.fbm-tickets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${sp("xl")};margin-top:${sp("2xl")};}
.fbm-ticketwrap{filter:drop-shadow(6px 6px 0 ${v("shadow")});}
.fbm-ticket{--stub:68px;display:grid;grid-template-columns:var(--stub) minmax(0,1fr);height:100%;min-height:158px;
  -webkit-mask:radial-gradient(circle 9px at var(--stub) 0,transparent 96%,black) top/100% 51% no-repeat,radial-gradient(circle 9px at var(--stub) 100%,transparent 96%,black) bottom/100% 51% no-repeat;
  mask:radial-gradient(circle 9px at var(--stub) 0,transparent 96%,black) top/100% 51% no-repeat,radial-gradient(circle 9px at var(--stub) 100%,transparent 96%,black) bottom/100% 51% no-repeat;}
.fbm-stub{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:${sp("sm")};padding:18px 0 14px;border-right:2px dashed var(--fg);}
.fbm-stubkind{writing-mode:vertical-rl;rotate:180deg;text-transform:uppercase;white-space:nowrap;}
.fbm-flyerwrap{position:relative;margin-top:${sp("lg")};filter:drop-shadow(10px 10px 0 ${v("shadow")});}
.fbm-flyer{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:${sp("xl")} ${sp("2xl")};padding:clamp(28px,5vw,72px) clamp(22px,5vw,72px) clamp(44px,6vw,88px);}
.fbm-footer{position:relative;z-index:1;padding:${sp("lg")} 0 ${sp("2xl")};border-top:2px solid var(--fg);}

/* --- project cards ------------------------------------------------------------------------ */
.fbm-sheet{position:relative;border:2px solid var(--fg);box-shadow:8px 8px 0 ${v("shadow")};}
.fbm-sheet[data-flat]{border:none;box-shadow:none;}
.fbm-bar{padding:7px ${sp("lg")};background:var(--fg);color:var(--bg);text-transform:uppercase;}
.fbm-slider{position:relative;display:grid;overflow:hidden;background:${v("ink")};border-bottom:2px solid var(--fg);}
.fbm-slidebtn{position:absolute;top:50%;z-index:2;width:44px;height:44px;margin-top:-22px;padding:0;border:2px solid ${v("ink")};background:${v("paper")};color:${v("ink")};display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;}
.fbm-slidebtn:hover{background:${v("ink")};color:${v("paper")};}
.fbm-slidedot{position:relative;height:8px;padding:0;border:1px solid ${v("ink")};cursor:pointer;}
.fbm-slidedot::before{content:"";position:absolute;inset:-10px -3px;}
/* xeroxed screenshots: greyscale + dot screen at rest, the real colours on hover / focus (and always on touch) */
.fbm-xerox img{filter:grayscale(1) contrast(1.45) brightness(1.04);transition:filter .25s ease;}
.fbm-xerox::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:${dots("ink", 0.7, 3)};opacity:.34;transition:opacity .25s ease;}
.fbm-tcard[data-front]:hover .fbm-xerox img,.fbm-tcard[data-front]:focus-within .fbm-xerox img{filter:none;}
.fbm-tcard[data-front]:hover .fbm-xerox::after,.fbm-tcard[data-front]:focus-within .fbm-xerox::after{opacity:0;}
@media (hover:none){ .fbm-xerox img{filter:none;} .fbm-xerox::after{opacity:0;} }
.fbm-thumb{display:flex;align-items:center;justify-content:center;min-height:72px;border:2px solid var(--fg);background:${dots("mid", 1.4, 8)};overflow:hidden;}
.fbm-cardgrid{display:grid;gap:${sp("lg")};}

/* project tower — see ProjectTower. Flyers stand on an arc of a cylinder (seen from slightly above) over a
   vinyl record. --k = eased card index (0…n-1) spins it; --e / --o (set from JS) spin it in and out and fade
   it as the section arrives and leaves. --d = this card's distance from the front, in cards. */
@property --tp{syntax:'<number>';inherits:true;initial-value:0;}
@keyframes fbm-spin{from{--tp:0;}to{--tp:1;}}
.fbm-tower{position:relative;height:calc(100vh + (var(--n) - 1) * ${TOWER_SEG}vh);}
.fbm-stage{position:sticky;top:0;height:100vh;overflow-y:clip;perspective:2000px;perspective-origin:50% 30%;--k:0;--tp:0;--e:0;--o:1;
  --step:45deg;--cw:540px;--ch:min(560px,66vh);--cy:calc(50% + 28px);--R:calc((var(--cw) + 70px) / (2 * sin(var(--step) / 2)));--fy:calc(var(--ch) / 2 + 34px);}
@supports (animation-timeline: view()) and (width: round(down, 1px, 1px)){
  .fbm-tower{view-timeline-name:--fbm-tower;}
  .fbm-stage{animation:fbm-spin linear both;animation-timeline:--fbm-tower;animation-range:contain 0% contain 100%;
    --kr:calc(var(--tp) * (var(--n) - 1));
    --kf:round(down, var(--kr), 1);
    --kx:clamp(0, (var(--kr) - var(--kf) - ${TOWER_HOLD}) / ${1 - 2 * TOWER_HOLD}, 1);
    --k:calc(var(--kf) + var(--kx) * var(--kx) * (3 - 2 * var(--kx)));}
}
/* the ring spins; the record lies on the floor and turns with it */
.fbm-ring{position:absolute;z-index:1;left:50%;top:var(--cy);width:0;height:0;transform-style:preserve-3d;
  transform:translateZ(calc(var(--R) * -1)) rotateY(calc((var(--k) + var(--e)) * var(--step) * -1));}
/* seen almost edge-on, so the grooves are drawn far wider than they read. The rim carries one accent mark
   per card; the grooves, the sheen and the label sit on a disc inside it. */
.fbm-dial{position:absolute;width:calc(var(--R) * 2 + 150px);aspect-ratio:1;margin:calc(var(--R) * -1 - 75px);border-radius:${r("full")};opacity:var(--o);pointer-events:none;
  transform:translateY(var(--fy)) rotateX(90deg);border:6px solid ${v("line")};
  background:repeating-conic-gradient(from -.7deg,${v("accent")} 0 1.4deg,transparent 1.4deg 45deg),${v("surface")};}
.fbm-dial::after{content:"";position:absolute;inset:5.5%;border-radius:inherit;
  background:
    radial-gradient(closest-side,${v("base")} 0 3%,${v("accent")} 3.2% 17%,transparent 17.3%),
    conic-gradient(from 10deg,transparent 0 6%,${mix("structure", 16)} 10%,transparent 14% 50%,${mix("structure", 16)} 57%,transparent 62%),
    repeating-radial-gradient(circle closest-side,${v("surface")} 0 15px,${v("mid")} 15px 23px);}
.fbm-tcard{position:absolute;left:calc(var(--cw) / -2);top:calc(var(--ch) / -2);width:var(--cw);height:var(--ch);
  --d:calc(var(--i) - var(--k) - var(--e));--ad:max(var(--d), var(--d) * -1);
  transform:rotateY(calc(var(--i) * var(--step))) translateZ(var(--R));
  opacity:calc(clamp(0, (1.7 - var(--ad)) * 2, 1) * var(--o));backface-visibility:hidden;pointer-events:none;
  display:flex;flex-direction:column;border:2px solid ${v("ink")};transition:box-shadow .2s ease;}
.fbm-tcard::before{content:"";position:absolute;z-index:3;left:calc(50% - 52px);top:-15px;width:104px;height:28px;background:${mix("mid", 66)};rotate:var(--tr,-2deg);
  clip-path:polygon(0 0,4% 17%,0 34%,4% 52%,0 70%,4% 87%,0 100%,100% 100%,96% 84%,100% 66%,96% 49%,100% 31%,96% 14%,100% 0);}
/* cards turned away from the front sink into the wall */
.fbm-tcard::after{content:"";position:absolute;inset:-30px -2px -2px;z-index:4;background:${v("base")};pointer-events:none;
  opacity:calc((1 - cos(var(--d) * var(--step))) * 1.6);}
.fbm-tcard[data-front]{pointer-events:auto;box-shadow:12px 12px 0 ${v("accent")};}
.fbm-tcard[data-near]{pointer-events:auto;cursor:pointer;}
.fbm-tcard[data-near] *{pointer-events:none;}
.fbm-tdesc{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
/* arrows beside the front card + the card rail along the bottom */
.fbm-tnav{position:absolute;z-index:3;top:var(--cy);width:48px;height:48px;margin-top:-24px;padding:0;border:2px solid var(--fg);background:var(--bg);color:var(--fg);
  display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;box-shadow:4px 4px 0 ${v("shadow")};}
.fbm-tnav:hover:not(:disabled){background:${v("accent")};color:${v("on-accent")};}
.fbm-tnav:disabled{cursor:default;}
.fbm-tnav[data-dir="prev"]{left:calc(50% - var(--cw) / 2 - 92px);}
.fbm-tnav[data-dir="next"]{right:calc(50% - var(--cw) / 2 - 92px);}
.fbm-thead{position:absolute;top:0;left:0;right:0;z-index:3;padding:${sp("xl")} 0 0;}
.fbm-tbar{position:absolute;z-index:3;left:0;right:0;bottom:${sp("md")};display:flex;flex-direction:column;align-items:center;gap:2px;}
.fbm-trail{display:flex;gap:10px;}
.fbm-tdot{border:none;background:transparent;min-height:32px;padding:10px 0;cursor:pointer;}
.fbm-dialog{width:min(780px,94vw);max-height:90vh;padding:0 14px 14px 0;border:none;background:transparent;color:${v("ink")};overflow:auto;overscroll-behavior:contain;}
.fbm-dialog::backdrop{background:${mix("base", 82)};animation:fbm-fade .25s ease;}
@keyframes fbm-fade{from{opacity:0;}}
.fbm-dialogsheet{border:2px solid ${v("ink")};box-shadow:12px 12px 0 ${v("accent")};}
html:has(.fbm-dialog[open]){overflow:hidden;}

/* where the centred column would slide under the floating nav, widen the gutters so text clears it */
@media (min-width:901px) and (max-width:1379px){ .fbm-container{padding:0 104px;} }
@media (max-width:1100px){ .fbm-stage{--cw:470px;} }
@media (max-width:900px){
  .fbm-container{padding:0 20px;}
  /* on small screens the floating nav is one button in the top-right corner until it is opened,
     so it never sits on top of the text column */
  .fbm-side{top:14px;left:auto;right:12px;padding:6px 10px;}
  .fbm-side:not([data-open]) .fbm-navlink,.fbm-side:not([data-open]) .fbm-sidetools{display:none;}
  .fbm-side[data-open]{padding-bottom:10px;}
  .fbm-side[data-open] .fbm-navlink{min-height:40px;}
  .fbm-sidetoggle{width:36px;height:36px;margin:0 -4px;}
  .fbm-herogrid{grid-template-columns:minmax(0,1fr);gap:${sp("lg")};}
  .fbm-portrait{order:-1;width:min(56vw,250px);margin:${sp("md")} 6% 0 0;}
  .fbm-hs[data-s="arrow"]{left:-72%;width:58%;}
  .fbm-split{grid-template-columns:minmax(0,1fr);gap:${sp("lg")};}
  .fbm-split>:last-child{padding-top:0;}
  .fbm-date{grid-template-columns:minmax(0,1fr);gap:${sp("sm")};}
  .fbm-tickets{grid-template-columns:minmax(0,1fr);}
  .fbm-flyer{grid-template-columns:minmax(0,1fr);}
  .fbm-sec{margin-bottom:${sp("4xl")};}
  .fbm-bandwrap{margin-bottom:${sp("4xl")};}
}
@media (max-width:600px){
  .fbm-cardgrid{grid-template-columns:minmax(0,1fr)!important;}
  .fbm-actions .fbm-btn{flex:1 1 auto;}
  .fbm-heronav{gap:0 ${sp("lg")};}
}
@media (prefers-reduced-motion:reduce){
  .fbm-btn,.fbm-ext .fbm-arrow,.fbm-navline::before,.fbm-navtext,.fbm-side .fbm-navlink,.fbm-xerox img,.fbm-xerox::after{transition:none;}
}
`;

/* ---------- shared style fragments ---------- */
const pad2 = (x) => String(x).padStart(2, "0");
const upper = { textTransform: "uppercase" };

/* ---------- hooks ---------- */
function useMedia(query) {
  const [on, setOn] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setOn(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return on;
}

/* ---------- parallax ---------- */
// The hero is a stack of layers. Each one moves by `speed` px vertically (and `drift` px sideways) over
// the hero's scroll, turns from rot[0] to rot[1], and shifts by `depth` px with the pointer.
// mode: "full" (desktop) · "lite" (mobile: shorter travel, no pointer) · "off" (reduced motion).
const HeroFx = createContext(null);
const LITE = 0.4;
function Layer({ as = "div", speed = 0, drift = 0, depth = 0, rot, style, children, ...rest }) {
  const { p, mx, my, mode } = useContext(HeroFx);
  const k = mode === "lite" ? LITE : 1;
  const y = useTransform(() => p.get() * speed * k + my.get() * depth);
  const x = useTransform(() => p.get() * drift * k + mx.get() * depth);
  const rotate = useTransform(p, [0, 1], rot || [0, 0]);
  if (mode === "off") {
    const Tag = as;
    return <Tag style={rot ? { rotate: `${rot[0]}deg`, ...style } : style} {...rest}>{children}</Tag>;
  }
  const Tag = m[as];
  return <Tag style={{ ...style, x, y, ...(rot ? { rotate } : null) }} {...rest}>{children}</Tag>;
}

// The section name, oversized and outlined, sliding sideways as its section passes through the viewport.
function Ghost({ text, dir = 1 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], dir > 0 ? ["3%", "-24%"] : ["-24%", "3%"]);
  return (
    <div ref={ref} className="fbm-ghost" aria-hidden="true">
      <m.span className="t-display" style={reduced ? undefined : { x }}>{`${text} · ${text} · ${text}`}</m.span>
    </div>
  );
}

// A second layer of torn paper peeking out behind the band's own torn edge, sliding the other way.
function TornStrip({ seed, at, dir = 1 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], dir > 0 ? ["-4%", "4%"] : ["4%", "-4%"]);
  const clipPath = useMemo(() => torn(seed, { top: 18, bottom: 18, steps: 58 }), [seed]);
  return <m.div ref={ref} aria-hidden="true" className="fbm-tornstrip" data-at={at} style={{ clipPath, ...(reduced ? null : { x }) }} />;
}

/* ---------- scrawls ---------- */
// Hand-placed marker strokes. Each one is drawn once (pathLength) when it scrolls into view.
const SCRAWLS = [
  { box: "0 0 320 26", w: 5, d: ["M4 15 C38 7 74 21 118 12 S196 6 238 14 S292 9 316 13", "M22 22 C88 17 168 24 270 18"] },
  { box: "0 0 320 26", w: 5, d: ["M4 13 L31 6 L55 19 L84 5 L109 20 L138 7 L167 18 L196 6 L222 19 L251 8 L279 17 L316 9"] },
  { box: "0 0 320 26", w: 5, d: ["M6 9 C70 4 150 13 314 6", "M10 20 C96 14 210 23 300 16"] },
  { box: "0 0 320 26", w: 5, d: ["M5 14 C20 4 34 24 50 13 S80 4 96 14 S126 24 142 13 S172 4 190 14 S220 24 238 13 S268 4 284 14 S306 20 315 12"] },
  { box: "0 0 320 26", w: 6, d: ["M3 17 C60 9 130 8 315 12", "M298 3 L316 12 L296 23"] },
];
const HERO_SCRAWLS = {
  star: { box: "0 0 80 80", w: 6, d: ["M40 6 L41 74", "M10 22 L70 58", "M70 20 L11 60", "M7 41 L73 39"] },
  arrow: { box: "0 0 180 110", w: 6, d: ["M8 98 C30 42 86 14 160 30", "M134 9 L162 30 L131 51"] },
  cross: { box: "0 0 60 60", w: 7, d: ["M8 10 L52 50", "M50 8 L10 52"] },
};
function Scrawl({ shape, delay = 0.15, onMount }) {
  const reduced = useReducedMotion();
  const draw = (j) => {
    if (reduced) return {};
    const to = { pathLength: 1 }, transition = { duration: 0.45, delay: delay + j * 0.22, ease: "easeOut" };
    return onMount ? { initial: { pathLength: 0 }, animate: to, transition } : { initial: { pathLength: 0 }, whileInView: to, viewport: { once: true, amount: 0.6 }, transition };
  };
  return (
    <svg className="fbm-scrawl" viewBox={shape.box} fill="none" stroke="currentColor" strokeWidth={shape.w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shape.d.map((d, j) => <m.path key={j} d={d} {...draw(j)} />)}
    </svg>
  );
}

/* ---------- small components ---------- */
function Pills({ items, max }) {
  return (
    <ul className="fbm-pills">
      {(max ? items.slice(0, max) : items).map((p, i) => <li key={i} className="fbm-pill t-pill">{p}</li>)}
    </ul>
  );
}

function Strips({ items, max }) {
  return (
    <div className="fbm-strips">
      {(max ? items.slice(0, max) : items).map((b, i) => <span key={i} className="fbm-strip t-label-sm">{b}</span>)}
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="t-body-sm" style={{ position: "relative", paddingLeft: sp("lg") }}>
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: "0.62em", width: 10, height: 3, background: "var(--fg)" }} />
      {children}
    </li>
  );
}

function ExtLink({ href, label, arrow = "→", style }) {
  return (
    <a href={href} target={href && href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="fbm-ext t-label" style={style}>
      <span>{label}</span>
      <span className="fbm-arrow" aria-hidden="true">{arrow}</span>
    </a>
  );
}

// The active-language highlight is one shared element that slides between the two buttons.
function LangToggle({ locale, setLocale, ariaLabel }) {
  const opt = (code, label) => {
    const active = locale === code;
    return (
      <button type="button" className="fbm-langbtn t-label-sm" onClick={() => setLocale(code)} aria-pressed={active}>
        {active && <m.span layoutId="lang-pill" transition={SPRING} style={{ position: "absolute", inset: 0, background: "var(--fg)" }} />}
        <span style={{ position: "relative" }}>{label}</span>
      </button>
    );
  };
  return (
    <div role="group" aria-label={ariaLabel} className="fbm-lang">
      {opt("en", "EN")}
      {opt("pt-BR", "PT-BR")}
    </div>
  );
}

const diagramFrame = { minHeight: 170, border: "2px solid var(--fg)", background: dots("mid", 1.4, 8), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: sp("sm"), textAlign: "center", padding: sp("md") };
function RbacDiagram() {
  const box = { padding: "5px 8px", minWidth: 110, textAlign: "center" };
  return (
    <div style={diagramFrame}>
      <div className="t-label-sm" style={{ ...box, background: v("accent"), color: v("on-accent"), border: "2px solid var(--fg)" }}>Administrator</div>
      <div className="t-label-sm" style={{ ...box, background: "var(--fg)", color: "var(--bg)" }}>RH Admin ×3</div>
      <div className="t-label-sm" style={{ ...box, background: "var(--bg)", border: "2px solid var(--fg)" }}>RH ×19 stores</div>
      <span className="t-pill" style={{ background: "var(--bg)", padding: "0 6px" }}>three-tier RBAC</span>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div style={diagramFrame}>
      <div aria-hidden="true" style={{ width: 36, height: 36, background: "var(--fg)", rotate: "-6deg" }} />
      <span className="t-pill" style={{ background: "var(--bg)", padding: "0 6px" }}>architecture diagram</span>
    </div>
  );
}

// Direction-aware slide between images; swipe/drag horizontally to change image.
const slideVariants = {
  enter: (dir) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -60, opacity: 0 }),
};
function ImageSlider({ images, height, xerox }) {
  const [[idx, dir], setPos] = useState([0, 0]);
  if (!images || images.length === 0) return null;
  const n = images.length;
  const multi = n > 1;
  const go = (d) => setPos(([i]) => [(i + d + n) % n, d]);
  const jump = (i) => setPos(([cur]) => [i, i > cur ? 1 : -1]);
  const img = images[idx];
  return (
    <div className={"fbm-slider" + (xerox ? " fbm-xerox" : "")}>
      <AnimatePresence initial={false} custom={dir}>
        <m.img key={idx} src={img.src} alt={img.alt} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.3, ease: EASE }} draggable={false} loading="lazy" decoding="async"
          drag={multi ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18}
          onDragEnd={(_, { offset, velocity }) => { if (offset.x < -60 || velocity.x < -400) go(1); else if (offset.x > 60 || velocity.x > 400) go(-1); }}
          style={{ gridArea: "1 / 1", display: "block", width: "100%", cursor: multi ? "grab" : undefined, ...(height ? { height, objectFit: "cover", objectPosition: "top" } : { aspectRatio: "16 / 10", maxHeight: 460, objectFit: "contain" }) }} />
      </AnimatePresence>
      {multi && (
        <>
          <m.button type="button" className="fbm-slidebtn" aria-label="Previous image" onClick={() => go(-1)} style={{ left: 10 }} {...press}><Chevron flip /></m.button>
          <m.button type="button" className="fbm-slidebtn" aria-label="Next image" onClick={() => go(1)} style={{ right: 10 }} {...press}><Chevron /></m.button>
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, zIndex: 2 }}>
            {images.map((_, i) => (
              <m.button key={i} type="button" className="fbm-slidedot" aria-label={`Show image ${i + 1} of ${n}`} aria-current={i === idx || undefined} onClick={() => jump(i)}
                animate={{ width: i === idx ? 22 : 8 }} transition={SPRING}
                style={{ background: i === idx ? v("accent") : v("paper") }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- project cards ---------- */
function CardBody({ card }) {
  return (
    <>
      <h3 className="t-title-lg" style={{ ...upper, margin: "0 0 10px" }}>{card.title}</h3>
      <p className="t-body-md fbm-prose" style={{ margin: `0 0 ${sp("md")}` }}>{card.description}</p>
      {card.bullets && (
        <ul className="fbm-prose" style={{ listStyle: "none", margin: `0 0 ${sp("lg")}`, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {card.bullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
        </ul>
      )}
      {card.badges && <div style={{ marginBottom: sp("md") }}><Strips items={card.badges} /></div>}
      {card.pills && <div style={{ marginBottom: sp("lg") }}><Pills items={card.pills} /></div>}
    </>
  );
}

function HeroCardBody({ card }) {
  return (
    <div>
      <CardBody card={card} />
      <div style={{ display: "flex", alignItems: "center", gap: `${sp("sm")} ${sp("lg")}`, flexWrap: "wrap" }}>
        {card.link && <ExtLink href={card.link.href} label={card.link.label} arrow="↗" />}
        {card.note && <span className="t-meta" style={{ color: "var(--mut)", fontStyle: "italic" }}>{card.note}</span>}
      </div>
    </div>
  );
}

function HeroCard({ card, motionProps, flat }) {
  const hasImages = card.images && card.images.length > 0;
  return (
    <m.article className="fbm-paper fbm-sheet" data-flat={flat || undefined} {...motionProps} style={{ marginBottom: flat ? 0 : sp("xl") }}>
      <div className="fbm-bar t-label-sm">{card.barLabel}</div>
      {hasImages ? (
        <>
          <ImageSlider images={card.images} />
          <div style={{ padding: sp("lg") }}><HeroCardBody card={card} /></div>
        </>
      ) : (
        <div className="fbm-cardgrid" style={{ gridTemplateColumns: "200px minmax(0,1fr)", padding: sp("lg") }}>
          {card.diagram === "rbac" ? <RbacDiagram /> : <ArchDiagram />}
          <HeroCardBody card={card} />
        </div>
      )}
    </m.article>
  );
}

function SimpleCard({ card, motionProps, flat }) {
  return (
    <m.article className="fbm-paper fbm-sheet" data-flat={flat || undefined} {...motionProps} style={{ marginBottom: flat ? 0 : sp("xl") }}>
      {card.images && card.images.length > 0 && <ImageSlider images={card.images} />}
      <div style={{ padding: sp("lg") }}>
        <CardBody card={card} />
        {card.link && <ExtLink href={card.link.href} label={card.link.label} arrow="↗" />}
      </div>
    </m.article>
  );
}

function CompactCard({ card, motionProps, flat }) {
  return (
    <m.article className="fbm-paper fbm-sheet fbm-cardgrid" data-flat={flat || undefined} {...motionProps} style={{ gridTemplateColumns: "96px minmax(0,1fr)", padding: sp("lg"), marginBottom: flat ? 0 : sp("xl") }}>
      <div className="fbm-thumb">
        {card.images?.[0]
          ? <img src={card.images[0].src} alt={card.images[0].alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div aria-hidden="true" style={{ width: 28, height: 28, background: "var(--fg)", rotate: "-6deg" }} />}
      </div>
      <div>
        <h3 className="t-title-md" style={{ ...upper, margin: "0 0 8px" }}>{card.title}</h3>
        {card.inlineBadge && <p style={{ margin: "0 0 10px" }}><span className="fbm-strip t-label-sm">{card.inlineBadge}</span></p>}
        <p className="t-body-md fbm-prose" style={{ margin: `0 0 ${sp("md")}` }}>{card.description}</p>
        {card.pills && <Pills items={card.pills} />}
        {card.link && <ExtLink href={card.link.href} label={card.link.label || new URL(card.link.href).hostname.replace(/^www\./, "")} arrow="↗" style={{ marginTop: sp("md") }} />}
      </div>
    </m.article>
  );
}

// In the page a card is stamped on when it scrolls in; inside the details dialog it is flat and still.
function ProjectCard({ card, still }) {
  const props = { card, flat: still, motionProps: still ? {} : stamp() };
  if (card.variant === "featured" || card.variant === "internalFlagship") return <HeroCard {...props} />;
  if (card.variant === "compact") return <CompactCard {...props} />;
  return <SimpleCard {...props} />;
}

function GroupHeader({ label }) {
  return (
    <m.div {...reveal()} style={{ display: "flex", alignItems: "center", gap: sp("md"), margin: `0 0 ${sp("lg")}` }}>
      <span className="fbm-strip t-label">{label}</span>
      <span aria-hidden="true" style={{ flex: 1, height: 2, background: "var(--ln)" }} />
    </m.div>
  );
}

/* ---------- project tower ---------- */
// Desktop + motion allowed → spinning ring; otherwise the stacked list.
const TOWER_QUERY = "(min-width:901px) and (prefers-reduced-motion: no-preference)";
const TAPE_ROT = [-3, 2.2, -1.4, 3.4, -2.6, 1.6, -3.8, 2.8];

// Native scroll-driven animation drives --tp/--k in CSS; older engines get the JS fallback below.
// (window.CSS — the module-level `CSS` is this file's stylesheet string)
const nativeSpin = () => window.CSS.supports("animation-timeline: view()") && window.CSS.supports("width: round(down, 1px, 1px)");

// Same easing as the CSS: hold flat near each card, smoothstep between cards.
function easeIndex(p, n) {
  const k = p * (n - 1), base = Math.floor(k);
  const x = Math.min(1, Math.max(0, (k - base - TOWER_HOLD) / (1 - 2 * TOWER_HOLD)));
  return base + x * x * (3 - 2 * x);
}

// Front card is live; its immediate neighbours are click targets that turn the ring to them.
// Tabbing into any other card turns it to the front.
function TowerCard({ card, index, front, near, ui, onDetails, onSelect }) {
  const hasImages = card.images && card.images.length > 0;
  return (
    <article className="fbm-tcard fbm-paper" style={{ "--i": index, "--tr": `${TAPE_ROT[index % TAPE_ROT.length]}deg` }} data-front={front || undefined} data-near={near || undefined}
      onFocus={front ? undefined : () => onSelect(index)} onClick={near ? () => onSelect(index) : undefined}>
      <div style={{ flexShrink: 0 }}>
        {hasImages ? <ImageSlider images={card.images} height={206} xerox /> : (
          <div aria-hidden="true" style={{ height: 206, background: dots("mid", 1.6, 9), borderBottom: "2px solid var(--fg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 44, height: 44, background: "var(--fg)", rotate: "-6deg" }} />
          </div>
        )}
      </div>
      {/* the card "focuses" when it reaches the front: content settles up and darkens */}
      <m.div animate={front ? { opacity: 1, y: 0 } : { opacity: 0.55, y: 8 }} transition={{ duration: 0.3, ease: EASE }}
        style={{ padding: "18px 22px 20px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, flex: 1, minHeight: 0 }}>
        {(card.barLabel || card.inlineBadge) && <span className="fbm-strip t-label-sm">{card.barLabel || card.inlineBadge}</span>}
        <h3 className="t-title-md" style={{ ...upper, margin: 0 }}>{card.title}</h3>
        <p className="t-body-sm fbm-tdesc" style={{ margin: 0 }}>{card.description}</p>
        {card.badges ? <Strips items={card.badges} max={3} /> : card.pills && <Pills items={card.pills} max={7} />}
        <div style={{ marginTop: "auto", alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {card.link ? <ExtLink href={card.link.href} label={card.link.label || new URL(card.link.href).hostname.replace(/^www\./, "")} arrow="↗" /> : <span />}
          <button type="button" className="fbm-btn t-label" data-sm onClick={() => onDetails(card)}>{ui.projectDetails} +</button>
        </div>
      </m.div>
    </article>
  );
}

// Animated "01 / 07" counter: the number rolls up (or down when scrolling back).
function Counter({ value, total }) {
  const prev = useRef(value);
  const dir = value >= prev.current ? 1 : -1;
  useEffect(() => { prev.current = value; }, [value]);
  return (
    <span className="t-title-md" style={{ color: "var(--fg-strong)", display: "inline-flex", alignItems: "center", gap: 6, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ display: "inline-grid", overflow: "hidden" }}>
        <AnimatePresence initial={false} custom={dir}>
          <m.span key={value} custom={dir} style={{ gridArea: "1 / 1" }}
            variants={{ enter: (d) => ({ y: `${d * 100}%`, opacity: 0 }), center: { y: "0%", opacity: 1 }, exit: (d) => ({ y: `${d * -100}%`, opacity: 0 }) }}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: EASE }}>{pad2(value)}</m.span>
        </AnimatePresence>
      </span>
      <span style={{ color: "var(--mut)" }}>/ {pad2(total)}</span>
    </span>
  );
}

const Chevron = ({ flip }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden="true"
    style={flip ? { transform: "scaleX(-1)" } : undefined}><path d="m9 5 7 7-7 7" /></svg>
);

const clamp01 = (x) => Math.min(1, Math.max(0, x));

function ProjectTower({ projects, ui, lenis }) {
  const cards = [
    ...projects.live.map((card) => ({ card, group: "live" })),
    ...projects.internal.map((card) => ({ card, group: "internal" })),
  ];
  const n = cards.length;
  const towerRef = useRef(null);
  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const activeRef = useRef(0);
  const pendingRef = useRef(null); // card an arrow/rail click is gliding to, so rapid clicks keep advancing
  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState(null);
  const [closing, setClosing] = useState(false);
  const native = useMemo(nativeSpin, []);

  // Progress through the pinned tower (0 → 1). Natively the CSS scroll timeline spins the ring;
  // otherwise Motion's scroll progress drives the same custom properties.
  const { scrollYProgress } = useScroll({ target: towerRef, offset: ["start start", "end end"] });
  const apply = (p) => {
    if (!native) {
      stageRef.current.style.setProperty("--tp", p);
      stageRef.current.style.setProperty("--k", easeIndex(p, n));
    }
    activeRef.current = Math.round(p * (n - 1));
    setActive(activeRef.current);
  };
  useMotionValueEvent(scrollYProgress, "change", apply);

  // Arriving and leaving are mirror images: over one viewport of travel before the pin the ring spins
  // into place and fades up; over the one after, it keeps turning the same way and fades out.
  const { scrollYProgress: travel } = useScroll({ target: towerRef, offset: ["start end", "end start"] });
  const applyTravel = (t) => {
    const vh = window.innerHeight, total = towerRef.current.offsetHeight + vh, d = t * total;
    const enter = 1 - clamp01(d / vh), leave = 1 - clamp01((total - d) / vh);
    stageRef.current.style.setProperty("--e", (leave * leave - enter * enter) * 0.8);
    stageRef.current.style.setProperty("--o", 1 - Math.max(enter, leave) ** 2 * 0.85);
  };
  useMotionValueEvent(travel, "change", applyTravel);
  useEffect(() => { apply(scrollYProgress.get()); applyTravel(travel.get()); }, [n]);

  // Scroll position at which card i is in front.
  const cardTop = (i) => towerRef.current.getBoundingClientRect().top + window.scrollY + (i * TOWER_SEG * window.innerHeight) / 100;
  const goTo = (i) => {
    const to = Math.max(0, Math.min(n - 1, i));
    const done = () => { pendingRef.current = null; };
    pendingRef.current = to;
    if (lenis) lenis.scrollTo(cardTop(to), { duration: Math.min(1.6, 0.8 + 0.12 * Math.abs(to - activeRef.current)), onComplete: done });
    else { window.scrollTo({ top: cardTop(to) }); done(); }
  };
  const step = (dir) => goTo((pendingRef.current ?? activeRef.current) + dir);

  // Settle on a card once the visitor stops scrolling — only inside the pinned range, so nothing pulls you
  // into the section or holds you back from leaving it. A quarter card of travel moves on to the next one.
  useEffect(() => {
    if (!lenis) return;
    let timer, dir = 1;
    const settle = () => {
      if (lenis.isStopped) return;
      const rel = (lenis.targetScroll - cardTop(0)) / ((TOWER_SEG * window.innerHeight) / 100);
      if (rel <= 0 || rel >= n - 1) return;
      lenis.scrollTo(cardTop(dir > 0 ? Math.ceil(rel - 0.25) : Math.floor(rel + 0.25)), { duration: 0.8 });
    };
    const onInput = ({ deltaY }) => {
      if (deltaY) dir = Math.sign(deltaY);
      pendingRef.current = null;
      clearTimeout(timer);
      timer = setTimeout(settle, 180);
    };
    lenis.on("virtual-scroll", onInput);
    return () => { clearTimeout(timer); lenis.off("virtual-scroll", onInput); };
  }, [lenis, n]);

  // ← / → turn the ring while it's pinned on screen.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (dialogRef.current.open || e.target.closest?.("input,textarea,select,[contenteditable]")) return;
      const rect = towerRef.current.getBoundingClientRect();
      if (rect.top > 2 || rect.bottom < window.innerHeight - 2) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lenis, n]);

  useEffect(() => {
    const d = dialogRef.current;
    if (detail && !d.open) { d.showModal(); lenis?.stop(); }
    if (!detail) lenis?.start();
  }, [detail, lenis]);

  // Close animates out first, then really closes the <dialog>.
  const requestClose = () => setClosing(true);

  const group = cards[active].group;
  const arrow = (dir) => {
    const off = dir < 0 ? active === 0 : active === n - 1;
    return (
      <m.button type="button" className="fbm-tnav" data-dir={dir < 0 ? "prev" : "next"} aria-label={dir < 0 ? ui.prevProject : ui.nextProject}
        disabled={off} onClick={() => step(dir)} animate={{ opacity: off ? 0.3 : 1 }} transition={{ duration: 0.2 }} {...(off ? {} : press)}>
        <Chevron flip={dir < 0} />
      </m.button>
    );
  };
  return (
    <div ref={towerRef} className="fbm-tower" style={{ "--n": n }}>
      <div ref={stageRef} className="fbm-stage">
        <div className="fbm-ring">
          <div className="fbm-dial" aria-hidden="true" />
          {cards.map(({ card }, i) => (
            <TowerCard key={i} card={card} index={i} front={i === active} near={Math.abs(i - active) === 1} ui={ui} onDetails={setDetail} onSelect={goTo} />
          ))}
        </div>
        {arrow(-1)}
        {arrow(1)}
        <div className="fbm-thead">
          <div style={{ display: "flex", alignItems: "center", gap: sp("md") }}>
            <span style={{ display: "inline-grid", overflow: "hidden" }} aria-live="polite">
              <AnimatePresence initial={false} mode="popLayout">
                <m.span key={group} className="fbm-strip t-label" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }} style={{ gridArea: "1 / 1", whiteSpace: "nowrap" }}>
                  {group === "live" ? projects.liveLabel : projects.internalLabel}
                </m.span>
              </AnimatePresence>
            </span>
            <span aria-hidden="true" style={{ flex: 1, height: 2, background: "var(--ln)" }} />
            <Counter value={active + 1} total={n} />
          </div>
          <AnimatePresence>
            {group === "internal" && (
              <m.p key="intro" className="t-caption" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }}
                style={{ margin: "10px 0 0", color: "var(--mut)", maxWidth: "36rem" }}>{projects.internalIntro}</m.p>
            )}
          </AnimatePresence>
        </div>
        <div className="fbm-tbar">
          <m.span className="t-label-sm" animate={{ opacity: active === 0 ? 1 : 0, y: active === 0 ? [0, 4, 0] : 0 }}
            transition={{ opacity: { duration: 0.3 }, y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }}
            style={{ ...upper, color: "var(--mut)" }} aria-hidden="true">{ui.towerHint}</m.span>
          <div className="fbm-trail" role="group" aria-label={projects.heading}>
            {cards.map(({ card }, i) => (
              <button key={i} type="button" className={"fbm-navlink fbm-tdot" + (i === active ? " active" : "")} aria-label={`${pad2(i + 1)} · ${card.title}`}
                aria-current={i === active || undefined} onClick={() => goTo(i)}>
                <span className="fbm-navline">{i === active && <m.span layoutId="tower-dot" className="fbm-navglow" transition={SPRING} />}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <dialog ref={dialogRef} className="fbm-dialog" data-lenis-prevent aria-label={detail?.title}
        onCancel={(e) => { e.preventDefault(); requestClose(); }}
        onClose={() => { setDetail(null); setClosing(false); }}
        onClick={(e) => { if (e.target === dialogRef.current) requestClose(); }}>
        {detail && (
          <m.div key={detail.title} className="fbm-paper fbm-dialogsheet" initial={{ opacity: 0, scale: 1.05, rotate: -1.5 }}
            animate={closing ? { opacity: 0, scale: 0.98, rotate: 0 } : { opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: closing ? 0.16 : 0.26, ease: EASE }}
            onAnimationComplete={() => { if (closing) dialogRef.current.close(); }}>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 16px 12px" }}>
              <button type="button" className="fbm-btn t-label" data-sm onClick={requestClose}>{ui.close} ✕</button>
            </div>
            <ProjectCard card={detail} still />
          </m.div>
        )}
      </dialog>
    </div>
  );
}

/* ---------- ambient ---------- */
// Solid accent bar showing how far down the page you are.
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <m.div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, zIndex: 60, transformOrigin: "0 50%", scaleX, background: v("accent") }} />;
}

/* ---------- navigation ---------- */
// The active marker is one shared element (layoutId) that glides between links.
function NavLinks({ items, active, onGo, group }) {
  return items.map(([id, label]) => (
    <a key={id} href={"#" + id} data-nav={id} className={"fbm-navlink" + (active === id ? " active" : "")} aria-current={active === id ? "true" : undefined}
      onClick={(e) => { e.preventDefault(); onGo(id); }}>
      <span className="fbm-navline">{active === id && <m.span layoutId={group} className="fbm-navglow" transition={SPRING} />}</span>
      <span className="fbm-navtext t-label">{label}</span>
    </a>
  ));
}

/* ---------- theme ---------- */
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8Z" /></svg>
);

// Full switch (hero): the knob snaps between moon (dark) and sun (light).
// Compact (sidebar): a square icon button whose icon flips over to the other one.
function ThemeToggle({ theme, onToggle, ui, compact }) {
  const light = theme === "light";
  const label = light ? ui.toDarkTheme : ui.toLightTheme;
  if (compact) {
    return (
      <m.button type="button" className="fbm-iconbtn" aria-label={label} title={label} onClick={onToggle} {...press}>
        <AnimatePresence mode="wait" initial={false}>
          <m.span key={theme} initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.16 }} style={{ display: "inline-flex" }}>{light ? <SunIcon /> : <MoonIcon />}</m.span>
        </AnimatePresence>
      </m.button>
    );
  }
  return (
    <button type="button" role="switch" aria-checked={light} aria-label={label} title={label} className="fbm-themeswitch" onClick={onToggle}>
      <MoonIcon /><SunIcon />
      <m.span className="fbm-themeknob" animate={{ x: light ? 32 : 0 }} transition={SPRING}>{light ? <SunIcon /> : <MoonIcon />}</m.span>
    </button>
  );
}

// Compact language switch for the sidebar: shows the current language, tap to flip.
function LangButton({ locale, setLocale, label }) {
  return (
    <m.button type="button" className="fbm-iconbtn t-label-sm" aria-label={label} title={label} onClick={() => setLocale(locale === "en" ? "pt-BR" : "en")} {...press}>
      {locale === "en" ? "EN" : "PT"}
    </m.button>
  );
}

// Floating section nav: slides in once the hero is behind us; collapsed to lines, expands sideways.
// The language + theme buttons sit at the bottom and are always visible, even collapsed.
function SideNav({ show, items, active, onGo, label, tools }) {
  const [open, setOpen] = useState(false);
  return (
    <AnimatePresence>
      {show && (
        <m.nav key="side" className="fbm-side" aria-label={label} data-open={open || undefined}
          initial={{ opacity: 0, x: -18, rotate: -3 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -18, rotate: -3 }}
          transition={{ duration: 0.22, ease: EASE }}>
          <button type="button" className="fbm-sidetoggle" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>{open ? "‹" : "≡"}</button>
          <NavLinks items={items} active={active} group="nav-side" onGo={(id) => { setOpen(false); onGo(id); }} />
          <div className="fbm-sidetools">{tools}</div>
        </m.nav>
      )}
    </AnimatePresence>
  );
}

/* ---------- hero pieces ---------- */
// The name: first and last words in solid display type, the middle name as cut-out ransom letters
// (each tile its own face, fill and angle). Assistive tech gets the plain name instead.
function HeroName({ name }) {
  const words = name.split(" ").filter(Boolean);
  const first = words[0], last = words.length > 1 ? words[words.length - 1] : "", middle = words.slice(1, -1).join(" ");
  let tile = -1;
  return (
    <h1 className="fbm-name t-display" translate="no">
      <span className="fbm-sr">{name}</span>
      <span aria-hidden="true">
        <Layer as="span" drift={-90} depth={-5} className="fbm-nameline">
          <m.span variants={heroChild(0.05)} style={{ display: "inline-block", transformOrigin: "0 60%" }}>{first}</m.span>
        </Layer>
        {middle && (
          <Layer as="span" speed={-46} depth={9} className="fbm-ransom">
            {[...middle].map((ch, i) => {
              if (ch === " ") return <span key={i} style={{ width: ".3em" }} />;
              tile += 1;
              return <m.span key={i} className="fbm-tile" data-t={tile % 4} variants={heroChild(0.3 + tile * 0.07, TILE_ROT[tile % 4], TILE_ROT[tile % 4] * 3)}>{ch}</m.span>;
            })}
          </Layer>
        )}
        {last && (
          <Layer as="span" drift={120} depth={5} className="fbm-nameline">
            <m.span variants={heroChild(0.17)} style={{ display: "inline-block", transformOrigin: "0 60%" }}>{last}</m.span>
          </Layer>
        )}
      </span>
    </h1>
  );
}

// The portrait as a photocopied print pasted on the wall: halftoned, torn along the bottom, taped at
// the top, over an accent slab and a halftone sun. Every piece is its own parallax layer.
// Falls back to initials until the photo file exists.
function Portrait({ photo, name }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="fbm-portrait">
      <Layer speed={120} depth={-7} className="fbm-sun" aria-hidden="true" />
      <Layer speed={-34} depth={11} rot={[-5, -10]} className="fbm-slab" aria-hidden="true" />
      <Layer speed={-150} depth={19} rot={[3, 7]} className="fbm-photo">
        <m.div variants={heroChild(0.5, 0, -9)} style={{ position: "absolute", inset: 0 }}>
          <div className="fbm-photo-sheet" style={{ clipPath: TORN.portrait }}>
            {photo && !failed
              ? <div className="fbm-halftone"><img src={photo.src} alt={photo.alt} width="703" height="765" fetchpriority="high" onError={() => setFailed(true)} /></div>
              : <div className="fbm-initials t-headline" role="img" aria-label={photo?.alt || name}>{initials}</div>}
          </div>
          <span className="fbm-tape" aria-hidden="true" style={{ "--r": "-31deg", left: -34, top: 10 }} />
          <span className="fbm-tape" aria-hidden="true" style={{ "--r": "27deg", right: -36, top: 22 }} />
        </m.div>
      </Layer>
      <Layer speed={-250} depth={30} rot={[-8, 14]} className="fbm-hs" data-s="star" aria-hidden="true"><Scrawl shape={HERO_SCRAWLS.star} delay={0.8} onMount /></Layer>
      <Layer speed={-90} depth={24} className="fbm-hs" data-s="arrow" aria-hidden="true"><Scrawl shape={HERO_SCRAWLS.arrow} delay={1.1} onMount /></Layer>
      <Layer speed={-210} depth={34} rot={[6, -10]} className="fbm-hs" data-s="cross" aria-hidden="true"><Scrawl shape={HERO_SCRAWLS.cross} delay={1.4} onMount /></Layer>
    </div>
  );
}

const Socials = ({ c }) => (
  <div className="fbm-socials">
    <a href={c.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="fbm-social">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" /></svg>
    </a>
    <a href={c.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="fbm-social">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" /></svg>
    </a>
    <a href={"mailto:" + c.social.email} aria-label="Email" className="fbm-social">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" /><path d="m3 6 9 7 9-7" /></svg>
    </a>
  </div>
);

/* ---------- main ---------- */
const loadMotionFeatures = () => import("./motionFeatures").then((mod) => mod.default);

export default function Portfolio() {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {/* reducedMotion="user": with OS reduced-motion on, transforms are skipped and only fades remain */}
      <MotionConfig reducedMotion="user">
        <Page />
      </MotionConfig>
    </LazyMotion>
  );
}

function Page() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const { locale, content: c, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const towerMode = useMedia(TOWER_QUERY);
  const desktop = useMedia("(min-width:901px)");
  const finePointer = useMedia("(hover:hover) and (pointer:fine)");
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState(null);
  const [pastHero, setPastHero] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // Smooth scrolling (wheel); skipped entirely when the visitor prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.9 });
    setLenis(l);
    return () => { l.destroy(); setLenis(null); };
  }, []);

  // Hero parallax: scroll progress through the hero, plus the pointer (desktop only), feed every <Layer>.
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const mx = useSpring(pointerX, { stiffness: 70, damping: 18, mass: 0.6 });
  const my = useSpring(pointerY, { stiffness: 70, damping: 18, mass: 0.6 });
  const mode = reduced ? "off" : desktop ? "full" : "lite";
  useEffect(() => {
    if (mode !== "full" || !finePointer) return;
    const move = (e) => { pointerX.set((e.clientX / window.innerWidth - 0.5) * 2); pointerY.set((e.clientY / window.innerHeight - 0.5) * 2); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); pointerX.set(0); pointerY.set(0); };
  }, [mode, finePointer]);
  const fx = useMemo(() => ({ p: heroProgress, mx, my, mode }), [mode]);
  // The floating nav appears once the hero is mostly scrolled away (i.e. entering Projects).
  useMotionValueEvent(heroProgress, "change", (p) => setPastHero(p > 0.8));

  // Which section is in the middle of the viewport → drives the nav indicators.
  useEffect(() => {
    const root = rootRef.current;
    const ids = ["projects", "about", "experience", "talks", "contact"];
    const sections = ids.map((id) => root.querySelector("#" + id)).filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;
    const vis = {};
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => { vis[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      let best = null, br = 0;
      Object.keys(vis).forEach((id) => { if (vis[id] > br) { br = vis[id]; best = id; } });
      setActiveId(best);
    }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach((s) => so.observe(s));
    return () => so.disconnect();
  }, [locale, towerMode]);

  const navItems = [
    ["projects", c.nav.projects], ["about", c.nav.about], ["experience", c.nav.experience], ["talks", c.nav.talks], ["contact", c.nav.contact],
  ];

  // Nav click: glide to the section, then move keyboard focus to its heading.
  const goTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const focus = () => el.querySelector("h2")?.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo(el, { offset: -24, duration: 1.4, onComplete: focus });
    else { el.scrollIntoView({ behavior: "auto" }); focus(); }
    history.replaceState(null, "", "#" + id);
  };
  // A section heading: stamped on, with its own hand-drawn mark underneath.
  const sectionTitle = (text, i) => (
    <m.h2 tabIndex={-1} className="fbm-h2 t-headline" {...stamp(0, 0, -2)}>
      {text}
      <Scrawl shape={SCRAWLS[i % SCRAWLS.length]} />
    </m.h2>
  );

  return (
    <>
      <style>{CSS}</style>
      <div ref={rootRef} className="fbm-root t-body-md">

        <a href="#fbm-main" className="fbm-skip t-label">{locale === "pt-BR" ? "Pular para o conteúdo" : "Skip to content"}</a>

        <ScrollProgress />
        <div className="fbm-grain" aria-hidden="true" />

        <SideNav show={pastHero} items={navItems} active={activeId} onGo={goTo} label={c.ui.sectionsNav}
          tools={<>
            <LangButton locale={locale} setLocale={setLocale} label={c.ui.langToggleShort} />
            <ThemeToggle compact theme={theme} onToggle={toggleTheme} ui={c.ui} />
          </>} />

        {/* HERO — the one loud flyer */}
        <HeroFx.Provider value={fx}>
          <div className="fbm-container">
            <m.header ref={heroRef} className="fbm-hero" initial="hidden" animate="show">
              <div className="fbm-herotop">
                <m.p variants={heroChild(0, -2, -8)} className="fbm-strip t-label" style={{ margin: 0, transformOrigin: "0 50%" }}>{c.hero.role}</m.p>
                <m.div variants={heroChild(0.6)} className="fbm-herotools">
                  <LangToggle locale={locale} setLocale={setLocale} ariaLabel={c.ui.langToggleAria} />
                  <ThemeToggle theme={theme} onToggle={toggleTheme} ui={c.ui} />
                </m.div>
              </div>

              <div className="fbm-herogrid">
                <div>
                  <HeroName name={c.hero.name} />
                  <Layer speed={-22} style={{ position: "relative", zIndex: 2 }}>
                    <m.p variants={heroChild(0.65, 0, 0)} className="fbm-tagline t-body-lg">{c.hero.tagline}</m.p>
                    <m.div variants={heroChild(0.75, 0, 0)} className="fbm-actions">
                      <a href={c.hero.resumeHref} className="fbm-btn t-button" data-primary>{c.hero.resumeCta}</a>
                      <a href={"mailto:" + c.social.email} className="fbm-btn t-button">{c.hero.contactCta}</a>
                      <Socials c={c} />
                    </m.div>
                  </Layer>
                </div>
                <Portrait photo={c.hero.photo} name={c.hero.name} />
              </div>

              <m.nav variants={heroChild(0.85, 0, 0)} className="fbm-heronav" aria-label={c.ui.sectionsNav}>
                <NavLinks items={navItems} active={activeId} group="nav-hero" onGo={goTo} />
              </m.nav>
            </m.header>
          </div>
        </HeroFx.Provider>

        <main id="fbm-main">

          {/* PROJECTS — the tower */}
          <section id="projects" data-screen-label="Projects" className="fbm-sec">
            <Ghost text={c.nav.projects} />
            <div className="fbm-container">
              {sectionTitle(c.projects.heading, 0)}
              <m.p {...reveal(0.08)} className="fbm-lede t-body-md">{c.projects.intro}</m.p>

              {towerMode ? <ProjectTower projects={c.projects} ui={c.ui} lenis={lenis} /> : (
                <div style={{ marginTop: sp("2xl"), maxWidth: 860 }}>
                  <GroupHeader label={c.projects.liveLabel} />
                  {c.projects.live.map((card, i) => <ProjectCard key={i} card={card} />)}

                  <div style={{ height: sp("lg") }} />
                  <GroupHeader label={c.projects.internalLabel} />
                  <m.p {...reveal()} className="t-caption fbm-prose" style={{ margin: `0 0 ${sp("lg")}`, color: "var(--mut)" }}>{c.projects.internalIntro}</m.p>
                  {c.projects.internal.map((card, i) => <ProjectCard key={i} card={card} />)}
                </div>
              )}

              <div style={{ marginTop: sp("lg") }}>
                <ExtLink href={c.projects.archiveHref} label={c.projects.archiveLink} />
                <m.p {...reveal()} className="t-meta fbm-prose" style={{ margin: `${sp("md")} 0 0`, color: "var(--mut)" }}>{c.projects.archiveList}</m.p>
              </div>
            </div>
          </section>

          {/* ABOUT — a torn band */}
          <div className="fbm-bandwrap">
            <TornStrip seed={5} at="top" dir={1} />
            <TornStrip seed={13} at="bottom" dir={-1} />
            <section id="about" data-screen-label="About" className="fbm-sec fbm-band" style={{ clipPath: TORN.band }}>
              <Ghost text={c.nav.about} dir={-1} />
              <div className="fbm-container fbm-split">
                <div>{sectionTitle(c.about.heading, 1)}</div>
                <div className="fbm-stack fbm-prose t-body-lg">
                  {c.about.paragraphs.map((p, i) => <m.p key={i} {...reveal(i * 0.06)} style={{ margin: 0 }}>{p}</m.p>)}
                </div>
              </div>
            </section>
          </div>

          {/* EXPERIENCE — tour dates */}
          <section id="experience" data-screen-label="Experience" className="fbm-sec">
            <Ghost text={c.nav.experience} />
            <div className="fbm-container">
              {sectionTitle(c.experience.heading, 2)}
              <ol className="fbm-tour">
                {c.experience.roles.map((role, i) => (
                  <m.li key={i} className="fbm-date" {...reveal(Math.min(i, 3) * 0.05)}>
                    <p className="fbm-period t-numeral">{role.period}</p>
                    <div>
                      <h3 className="t-title-md" style={{ ...upper, margin: "0 0 12px", color: "var(--fg-strong)" }}>{role.title}</h3>
                      <p style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: `${sp("sm")} ${sp("md")}`, margin: `0 0 ${sp("md")}` }}>
                        <span className="fbm-strip t-label-sm">{role.company}</span>
                        {role.location && <span className="t-meta" style={{ color: "var(--mut)" }}>{role.location}</span>}
                      </p>
                      <p className="t-body-md fbm-prose" style={{ margin: `0 0 ${sp("md")}` }}>{role.description}</p>
                      <Pills items={role.pills} />
                    </div>
                  </m.li>
                ))}
              </ol>
              <ExtLink href={c.experience.resumeHref} label={c.experience.resumeLink} />
            </div>
          </section>

          {/* TALKS — ticket stubs */}
          <section id="talks" data-screen-label="Talks" className="fbm-sec">
            <Ghost text={c.nav.talks} dir={-1} />
            <div className="fbm-container">
              {sectionTitle(c.talks.heading, 3)}
              <div className="fbm-tickets">
                {c.talks.items.map((t, i) => (
                  <m.article key={i} className="fbm-ticketwrap" {...stamp(Math.min(i, 3) * 0.06, TICKET_ROT[i % TICKET_ROT.length])}>
                    <div className="fbm-paper fbm-ticket">
                      <div className="fbm-stub">
                        <span className="fbm-stubkind t-label-sm">{t.kind}</span>
                        <span className="t-label-sm" aria-hidden="true" style={{ fontVariantNumeric: "tabular-nums" }}>{pad2(i + 1)}</span>
                      </div>
                      <div style={{ padding: "20px 24px 22px" }}>
                        <h3 className="t-title-md" style={{ ...upper, margin: "0 0 6px" }}>{t.title}</h3>
                        <p className="t-meta" style={{ margin: "0 0 10px", color: "var(--mut)" }}>{t.org}</p>
                        <p className="t-body-sm" style={{ margin: 0, textWrap: "pretty" }}>{t.description}</p>
                      </div>
                    </div>
                  </m.article>
                ))}
              </div>
            </div>
          </section>

          {/* CONTACT — one flyer */}
          <section id="contact" data-screen-label="Contact" className="fbm-sec" style={{ marginBottom: sp("4xl") }}>
            <Ghost text={c.nav.contact} />
            <div className="fbm-container">
              <m.div className="fbm-flyerwrap" {...stamp(0, -1.1, -5)}>
                <span className="fbm-tape" aria-hidden="true" style={{ "--r": "-7deg", left: "8%", top: -13 }} />
                <span className="fbm-tape" aria-hidden="true" style={{ "--r": "5deg", right: "11%", top: -12 }} />
                <div className="fbm-paper fbm-flyer" style={{ clipPath: TORN.flyer }}>
                  <div>
                    <p style={{ margin: `0 0 ${sp("lg")}` }}><span className="fbm-strip t-label">{c.contact.eyebrow}</span></p>
                    <h2 tabIndex={-1} className="t-headline" style={{ ...upper, margin: `0 0 ${sp("lg")}`, fontSize: "clamp(2.75rem,7.4vw,6.5rem)" }}>{c.contact.heading}</h2>
                    <p className="t-body-lg" style={{ margin: 0, maxWidth: "30rem", textWrap: "pretty" }}>{c.contact.line}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: sp("lg") }}>
                    <a href={"mailto:" + c.contact.email} className="fbm-btn t-button-lg" data-primary data-lg>{c.contact.cta}</a>
                    <p className="t-meta" style={{ margin: 0, maxWidth: "19rem", color: "var(--mut)" }}>{c.contact.location}</p>
                  </div>
                </div>
              </m.div>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <div className="fbm-container">
          <footer className="fbm-footer">
            <p className="t-meta" style={{ margin: 0, color: "var(--mut)" }}>{c.footer.credit}</p>
          </footer>
        </div>
      </div>
    </>
  );
}
