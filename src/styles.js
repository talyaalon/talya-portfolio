// ============================================================
//  Design tokens + global CSS — "editorial CV" style.
//  Warm cream palette, Heebo type, timeline projects.
//  Logical properties (inline-start/end) keep it correct in
//  both LTR (English) and RTL (Hebrew).
// ============================================================

export const COLORS = {
  cream: "#f7f3ec",
  paper: "#fffdfa",
  beige: "#dfd7d3",
  beigeSoft: "#ece6df",
  ink: "#262a2a",
  inkSoft: "#4a4644",
  // `tan` is the brand accent. It is used for large text, borders and icons —
  // NOT for body-size text, where it measured 3.31:1 on cream.
  tan: "#b07a4e",
  // Accessible variant for text and for solid buttons: 5.29:1 on cream, and
  // 5.86:1 for white on it. Both clear WCAG AA (4.5:1) with room to spare.
  tanText: "#8a5a30",
  tanDeep: "#7d4f28",
  line: "#e3dcd3",
};

export const styles = `
:root{
  --cream:${COLORS.cream}; --paper:${COLORS.paper}; --beige:${COLORS.beige}; --beige-soft:${COLORS.beigeSoft};
  --ink:${COLORS.ink}; --ink-soft:${COLORS.inkSoft}; --tan:${COLORS.tan}; --tan-text:${COLORS.tanText};
  --tan-deep:${COLORS.tanDeep};
  --line:${COLORS.line}; --shadow:0 1px 2px rgba(38,42,42,.04),0 10px 30px -12px rgba(38,42,42,.12);
  --nav-h:64px;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Heebo',system-ui,-apple-system,'Segoe UI',sans-serif;background:var(--cream);color:var(--ink-soft);
  line-height:1.7;font-size:16px;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.wrap{max-width:1100px;margin:0 auto;padding-inline:28px}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{color:var(--ink);font-weight:800;line-height:1.15;letter-spacing:-.01em}
button{font-family:inherit}
img{max-width:100%}

/* Long unbroken strings (URLs, long Hebrew compounds) must not push the
   layout sideways on a narrow phone. */
p,h1,h2,h3,h4,.chip,.plink,.proj-meta{overflow-wrap:anywhere}

/* Utility for the display face used on stat numbers and dialog titles.
   A ".display" class was referenced in six places and never existed. */
.h-display{font-weight:800;letter-spacing:-.01em;color:var(--ink)}

/* ---------- focus ---------- */
/* The old rule removed the outline from every input and replaced it with a
   1px border tint at 2.69:1 — invisible to most people. */
:focus-visible{outline:3px solid var(--tan-text);outline-offset:2px;border-radius:4px}
.skip-link{position:absolute;inset-inline-start:-9999px;top:0;z-index:200;
  background:var(--ink);color:#fff;padding:12px 18px;border-radius:0 0 10px 0;font-weight:600}
.skip-link:focus{inset-inline-start:0}

/* ---------- NAV ---------- */
.nav{position:sticky;top:0;z-index:50;background:rgba(247,243,236,.92);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:var(--nav-h);gap:14px}
.brand{font-weight:800;color:var(--ink);font-size:18px;letter-spacing:-.01em}
.brand b{color:var(--tan-text)}
.navlinks{display:flex;align-items:center;gap:22px}
.navlinks .nl{font-weight:500;font-size:15px;color:var(--ink-soft);transition:color .2s;
  padding:10px 2px;text-decoration:underline;text-decoration-color:transparent;text-underline-offset:5px}
/* hover used to LOWER contrast from 8.44:1 to 3.31:1 */
.navlinks .nl:hover{color:var(--ink);text-decoration-color:var(--tan)}
.pill{border:1px solid var(--beige);background:transparent;color:var(--ink);
  font-weight:600;font-size:13px;padding:10px 16px;border-radius:999px;min-height:44px;
  cursor:pointer;transition:.2s;letter-spacing:.02em;display:inline-flex;align-items:center;gap:6px}
.pill:hover{background:var(--beige);border-color:var(--beige)}
.pill.solid{background:var(--tan-text);border-color:var(--tan-text);color:#fff}
.pill.solid:hover{background:var(--tan-deep)}
.menu-btn{display:none;font-size:16px;padding-inline:14px}
.menu-panel{display:none;flex-direction:column;border-top:1px solid var(--line);
  background:var(--paper);padding:8px 28px 16px}
.menu-panel a{padding:14px 0;font-weight:600;color:var(--ink);border-bottom:1px solid var(--line)}
.menu-panel a:last-child{border-bottom:none}
/* Below 720px the four links used to be display:none with NOTHING replacing
   them, so a phone visitor could not reach Projects or Contact at all. */
@media(max-width:720px){
  .navlinks .nl{display:none}
  .menu-btn{display:inline-flex}
  .menu-panel.open{display:flex}
}

/* ---------- HERO ---------- */
.hero{position:relative;padding:74px 0 60px}
.hero .wrap{display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center}
.eyebrow{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:13px;
  letter-spacing:.14em;text-transform:uppercase;color:var(--tan-deep);margin-bottom:18px}
.eyebrow::before{content:"";width:26px;height:2px;background:var(--tan)}
.hero h1{font-size:clamp(32px,7vw,68px);margin-bottom:14px}
.hero .role{font-size:clamp(17px,2.4vw,21px);font-weight:600;color:var(--ink);margin-bottom:18px}
.hero .lede{font-size:18px;max-width:30em;margin-bottom:30px}
.actions{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;
  padding:12px 20px;min-height:44px;border-radius:999px;transition:.22s;border:1px solid transparent;cursor:pointer}
.btn svg{width:17px;height:17px;flex:0 0 auto}
.btn-primary{background:var(--ink);color:#fff}
.btn-primary:hover{background:var(--tan-deep);transform:translateY(-2px)}
.btn-ghost{background:var(--paper);color:var(--ink);border-color:var(--line)}
.btn-ghost:hover{border-color:var(--tan-text);color:var(--tan-deep);transform:translateY(-2px)}
.portrait{width:200px;height:242px;border-radius:18px;overflow:hidden;flex:0 0 auto;
  box-shadow:var(--shadow);border:5px solid var(--paper);position:relative}
.portrait::after{content:"";position:absolute;inset-inline-end:-14px;inset-block-end:-14px;
  width:100%;height:100%;border:2px solid var(--tan);border-radius:18px;z-index:-1}
.portrait img{width:100%;height:100%;object-fit:cover;object-position:center top}
.portrait .mono{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(150deg,var(--tan),var(--tan-deep));color:#fffdf8;
  font-size:96px;font-weight:800}
@media(max-width:780px){.hero .wrap{grid-template-columns:1fr;gap:28px}.portrait{order:-1;width:150px;height:182px}}

/* ---------- SECTION ---------- */
/* Sticky nav + smooth scroll used to drop every anchor ~34px under the bar. */
.section{padding:30px 0 60px;scroll-margin-top:calc(var(--nav-h) + 16px)}
.sec-label{display:flex;align-items:center;gap:14px;margin-bottom:32px;flex-wrap:wrap}
.sec-label .num{font-size:13px;font-weight:700;color:var(--tan-text);letter-spacing:.1em}
.sec-label h2{font-size:clamp(24px,4vw,34px)}
.sec-label .rule{flex:1;min-width:20px;height:1px;background:var(--line)}
.about-text{font-size:18px;max-width:46em}

/* ---------- PROJECTS / spine ---------- */
.projects{position:relative}
.spine{position:absolute;inset-block:6px 40px;inset-inline-end:11px;width:2px;
  background:linear-gradient(var(--tan),transparent);opacity:.5}
@media(max-width:780px){.spine{display:none}}
.proj{position:relative;padding-inline-end:46px;margin-bottom:28px;display:block}
@media(max-width:780px){.proj{padding-inline-end:0}}
.proj .dot{position:absolute;inset-inline-end:4px;top:30px;width:16px;height:16px;border-radius:50%;
  background:var(--cream);border:3px solid var(--tan);z-index:2}
@media(max-width:780px){.proj .dot{display:none}}
.card{background:var(--paper);border:1px solid var(--line);border-radius:18px;overflow:hidden;
  box-shadow:var(--shadow);transition:transform .25s,box-shadow .25s;display:grid;
  grid-template-columns:1fr 1.05fr}
.card:hover{transform:translateY(-3px);box-shadow:0 18px 40px -14px rgba(38,42,42,.22)}
/* keyboard users get the same affordance mouse users get */
.card:focus-within{transform:translateY(-3px);box-shadow:0 18px 40px -14px rgba(38,42,42,.22)}
@media(max-width:660px){.card{grid-template-columns:1fr}}
.card-body{padding:26px 28px;text-align:start}
.proj-meta{font-size:13px;font-weight:600;color:var(--tan-deep);letter-spacing:.04em;margin-bottom:7px}
.card h3{font-size:21px;margin-bottom:6px}
/* The title used to be a bare <h3 onClick>: not focusable, no keyboard path. */
.card-title{background:none;border:none;padding:0;margin:0;font:inherit;color:inherit;
  cursor:pointer;text-align:start}
.card-title:hover{color:var(--tan-deep)}
.proj-role{font-size:14px;color:var(--ink-soft);margin-bottom:10px}
.proj-role .role-key{font-weight:700;color:var(--ink);letter-spacing:.02em}
.proj-impact{font-size:14.5px;color:var(--ink);font-weight:600;margin:0 0 16px;
  padding-inline-start:12px;border-inline-start:3px solid var(--tan)}
.card p{font-size:15px;margin-bottom:16px}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px}
.chip{font-size:12.5px;font-weight:500;background:var(--beige-soft);color:var(--ink);
  padding:6px 12px;border-radius:999px;direction:ltr;display:inline-block}
button.chip-removable{border:1px solid transparent;cursor:pointer;font-family:inherit;min-height:32px}
button.chip-removable:hover{border-color:var(--tan-text)}
.result{display:flex;align-items:center;gap:9px;font-weight:600;color:var(--ink);font-size:14.5px;margin-bottom:14px}
.result svg{width:18px;height:18px;color:var(--tan-text);flex:0 0 auto}
.plinks{display:flex;flex-wrap:wrap;gap:10px}
.plink{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;
  color:var(--ink);border:1px solid var(--line);padding:10px 15px;min-height:44px;
  border-radius:999px;transition:.2s;cursor:pointer;background:none}
.plink svg{width:15px;height:15px;flex:0 0 auto}
.plink:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.plink.soft{color:var(--ink-soft);border-style:dashed}
/* a private company repo: stated, not offered. It is a <span>, so it must not
   look or behave like the buttons around it -- no pointer, no hover invert */
.plink.locked{color:var(--ink-soft);border-style:dashed;cursor:default}
.plink.locked:hover{background:none;color:var(--ink-soft);border-color:var(--line)}
.plink.locked svg{color:var(--tan-text)}
/* the whole screenshot is shown (object-fit:contain) inside a roomy rectangular
   frame with a soft cream mat, so nothing gets cropped on any side */
.shot{background:linear-gradient(135deg,#efe9e1,#e4ddd3);display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:10px;min-height:250px;color:#5d5449;padding:14px;
  border-inline-start:1px solid var(--line);cursor:pointer;overflow:hidden;border:none;width:100%}
.shot-empty{cursor:default}
@media(max-width:660px){.shot{min-height:200px;border-inline-start:none;border-top:1px solid var(--line)}}
.shot svg{width:34px;height:34px;opacity:.6}
.shot span{font-size:12.5px;font-weight:600;letter-spacing:.02em}
.shot img{width:100%;height:100%;object-fit:contain;display:block;border-radius:8px;
  box-shadow:0 4px 14px -8px rgba(38,42,42,.4)}
/* device mockup: browser-framed desktop capture beside a phone-framed mobile
   capture — both are real captures of the live product. Hovering a device
   slowly scrolls its screen; clicking opens the capture in a lightbox. */
.devices{display:flex;align-items:flex-end;gap:14px;width:100%;padding:6px 4px 12px}
.dev-laptop{flex:1;min-width:0;display:block;background:#fff;border-radius:10px;overflow:hidden;
  border:1px solid rgba(38,42,42,.12);box-shadow:0 14px 30px -16px rgba(38,42,42,.5);
  padding:0;cursor:zoom-in;text-align:inherit}
.dev-bar{display:flex;gap:5px;padding:8px 11px;background:#f1ece4;border-bottom:1px solid rgba(38,42,42,.07)}
.dev-bar i{width:8px;height:8px;border-radius:50%;background:#d8cfc2;display:block}
.dev-phone{flex:0 0 25%;min-width:86px;max-width:130px;display:block;position:relative;
  background:#1f2323;border-radius:18px;padding:5px;cursor:zoom-in;
  border:1px solid rgba(38,42,42,.25);box-shadow:0 16px 32px -14px rgba(38,42,42,.6)}
.dev-phone .dev-notch{display:block;position:absolute;top:10px;left:50%;transform:translateX(-50%);
  width:36%;height:5px;border-radius:99px;background:rgba(255,255,255,.28);z-index:3}
.dev-screen{display:block;overflow:hidden}
.dev-laptop .dev-screen{aspect-ratio:16/10}
.dev-phone .dev-screen{aspect-ratio:9/17;border-radius:13px}
/* a live embed sits where a capture would. It is inert on purpose: the click
   belongs to the frame's button, which opens the full-size view */
.shot .dev-screen iframe{width:100%;height:100%;border:0;display:block;background:#fff;pointer-events:none}
.dev-laptop .dev-screen.is-embed{aspect-ratio:16/9}
.shot .dev-screen img{width:100%;height:100%;object-fit:cover;object-position:top center;
  border-radius:0;box-shadow:none;transition:object-position 3.2s ease}
.dev-laptop:hover .dev-screen img,.dev-laptop:focus-visible .dev-screen img,
.dev-phone:hover .dev-screen img,.dev-phone:focus-visible .dev-screen img{object-position:bottom center}
@media(max-width:660px){.dev-phone{flex-basis:30%}}
/* floating lightbox for a clicked device capture */
.shot-lightbox{position:fixed;inset:0;z-index:120;background:rgba(20,22,22,.78);
  display:flex;align-items:center;justify-content:center;padding:28px;cursor:zoom-out}
.shot-lightbox img{max-width:min(1200px,94vw);max-height:88vh;width:auto;height:auto;
  border-radius:12px;background:#fff;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);cursor:default}
.shot-lightbox img.lb-mobile{max-width:min(400px,88vw)}
.shot-lightbox .lb-embed{width:min(1200px,94vw);aspect-ratio:16/9;max-height:88vh;border:0;
  border-radius:12px;background:#000;box-shadow:0 24px 60px rgba(0,0,0,.45)}
.lightbox-open{position:fixed;top:18px;inset-inline-start:22px;z-index:121;
  background:#fff;color:#262a2a;text-decoration:none;font-size:13.5px;font-weight:600;
  border-radius:999px;padding:11px 18px;box-shadow:0 6px 18px rgba(0,0,0,.3)}
.lightbox-close{position:fixed;top:18px;inset-inline-end:22px;z-index:121;width:42px;height:42px;
  background:#fff;color:#262a2a;border:none;border-radius:999px;font-size:18px;cursor:pointer;
  box-shadow:0 6px 18px rgba(0,0,0,.3)}
.modal-shot{display:block;margin:18px 0 0;border-radius:12px;overflow:hidden;
  background:var(--beige-soft);border:1px solid var(--line)}
.modal-shot img{width:100%;height:auto;display:block}
.mini-actions{display:flex;gap:8px;margin-top:16px}
.mini{font-size:12.5px;font-weight:600;background:none;border:1px solid var(--line);
  border-radius:8px;padding:8px 13px;min-height:36px;cursor:pointer;color:var(--ink)}
.mini.danger{color:var(--tan-deep)}
.mini:hover{border-color:var(--ink)}

/* ---------- SKILLS ---------- */
.skills{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
@media(max-width:660px){.skills{grid-template-columns:1fr}}
.skillcard{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:20px 22px}
.skillcard h3{font-size:13px;font-weight:700;color:var(--tan-deep);letter-spacing:.08em;
  text-transform:uppercase;margin-bottom:13px}
.skillcard .chips{margin:0}

/* ---------- CONTACT ---------- */
.contact{background:var(--ink);color:#e9e4dd;border-radius:24px;padding:54px 40px;text-align:center;margin-bottom:28px}
@media(max-width:600px){.contact{padding:36px 20px;border-radius:18px}}
.contact h2{color:#fff;font-size:clamp(24px,4vw,36px);margin-bottom:12px}
.contact p{color:#cfc8bd;max-width:34em;margin:0 auto 28px;font-size:16px}
.contact .actions{justify-content:center}
.contact .btn-primary{background:var(--tan-text);color:#fff}
.contact .btn-primary:hover{background:#a06a3c}
.contact .btn-ghost{background:transparent;border-color:#6a635c;color:#e9e4dd}
.contact .btn-ghost:hover{border-color:var(--tan);color:#fff}
.contact :focus-visible{outline-color:#f0c9a4}
/* was #9a9189 on cream = 2.80:1, and it carried the phone number */
.site-footer{padding:8px 0 40px;text-align:center;color:var(--ink-soft);font-size:13.5px;line-height:2}
.site-footer a{text-decoration:underline;text-underline-offset:3px}
.site-footer a:hover{color:var(--tan-deep)}
.ltr{direction:ltr;display:inline-block}

.to-top{position:fixed;inset-block-end:22px;inset-inline-end:22px;z-index:60;
  width:48px;height:48px;border-radius:50%;border:1px solid var(--line);
  background:var(--paper);color:var(--ink);font-size:20px;cursor:pointer;
  box-shadow:var(--shadow);opacity:0;visibility:hidden;
  transition:opacity .25s,visibility 0s linear .25s}
.to-top.show{opacity:1;visibility:visible;transition:opacity .25s,visibility 0s}

/* ---------- admin tabs ---------- */
.tabs{display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--line);flex-wrap:wrap;margin-bottom:8px}
.tab{font-weight:600;font-size:15px;background:none;border:none;color:var(--ink-soft);
  padding:14px 4px;margin-inline-end:18px;cursor:pointer;border-bottom:2px solid transparent}
.tab-active{color:var(--ink);border-bottom-color:var(--tan)}

/* ---------- modal / forms ---------- */
.overlay{position:fixed;inset:0;background:rgba(38,42,42,.5);backdrop-filter:blur(3px);
  display:flex;align-items:flex-start;justify-content:center;padding:40px 18px;overflow:auto;z-index:80;animation:fade .2s ease}
@keyframes fade{from{opacity:0}}
.sheet{background:var(--paper);border-radius:22px;padding:34px;width:100%;position:relative;
  box-shadow:0 40px 90px -30px rgba(38,42,42,.55);animation:pop .28s cubic-bezier(.2,.8,.2,1);text-align:start}
@media(max-width:600px){.sheet{padding:24px 18px;border-radius:16px}}
@keyframes pop{from{opacity:0;transform:translateY(20px) scale(.98)}}
/* was an 18px hit area, under the WCAG 2.5.8 minimum */
.close{position:absolute;top:10px;inset-inline-end:10px;background:none;border:none;
  width:44px;height:44px;font-size:18px;color:var(--ink-soft);cursor:pointer;border-radius:50%}
.close:hover{background:var(--beige-soft);color:var(--ink)}
.lbl{display:block;font-weight:600;font-size:13px;color:var(--ink-soft);margin:16px 0 6px}
.inp{width:100%;font-family:inherit;font-size:15px;color:var(--ink);background:#fff;
  border:1px solid var(--line);border-radius:12px;padding:12px 14px;transition:.15s}
.inp:focus{border-color:var(--tan-text)}
select.inp{cursor:pointer}
input[type=file].inp{padding:10px 12px;background:var(--paper);cursor:pointer}
/* Password field with a reveal toggle. The input is dir=ltr, so the button
   belongs at its physical right edge even when the page runs right-to-left. */
.pw-wrap{position:relative}
.pw-wrap .inp{padding-right:46px}
.eye-btn{position:absolute;top:0;bottom:0;right:6px;width:36px;display:flex;align-items:center;
  justify-content:center;background:none;border:none;padding:0;border-radius:10px;
  color:var(--ink-soft);cursor:pointer;transition:.15s}
.eye-btn:hover{color:var(--ink)}
.eye-btn:focus-visible{outline:2px solid var(--tan-text);outline-offset:-2px}
.field-hint{font-size:12.5px;color:var(--ink-soft);margin:6px 0 0}
.primary-btn{font-weight:700;font-size:14px;background:var(--ink);color:#fff;border:none;
  padding:12px 22px;min-height:44px;border-radius:999px;cursor:pointer;transition:.18s}
.primary-btn:hover{background:var(--tan-deep)}
.primary-btn:disabled{cursor:not-allowed;opacity:.55}
.ghost-btn{font-weight:600;font-size:14px;background:var(--paper);color:var(--ink);
  border:1px solid var(--line);padding:11px 18px;min-height:44px;border-radius:999px;cursor:pointer;transition:.18s}
.ghost-btn:hover{border-color:var(--tan-text)}
.ghost-btn:disabled{opacity:.5;cursor:not-allowed}
.modal-sub{color:var(--tan-deep);margin:22px 0 10px;font-size:13px;letter-spacing:.06em;text-transform:uppercase}

/* ---------- analytics ---------- */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px}
.stat{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px}
.stat-num{font-size:46px;line-height:1;color:var(--tan-deep);font-weight:800;font-variant-numeric:tabular-nums}
.stat-lbl{font-size:14px;color:var(--ink-soft);margin-top:8px}
.table-scroll{overflow-x:auto}
.table{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--paper);min-width:320px}
.trow{display:grid;grid-template-columns:2fr 1fr 1fr;padding:14px 18px;font-size:14px;
  border-bottom:1px solid var(--line);gap:10px;align-items:center}
.trow:last-child{border-bottom:none}
.thead{font-weight:700;color:var(--ink-soft);background:rgba(223,215,211,.35)}
.note{margin-top:22px;background:rgba(176,122,78,.08);border:1px solid rgba(176,122,78,.25);
  border-radius:14px;padding:18px 20px;font-size:14.5px;line-height:1.65;color:var(--ink)}
.banner{font-size:14px;padding:12px 18px;border-radius:12px;margin-bottom:18px;line-height:1.5}
.banner.error{background:rgba(138,90,48,.10);border:1px solid rgba(138,90,48,.35);color:var(--tan-deep)}
.banner.info{background:rgba(47,88,83,.08);border:1px solid rgba(47,88,83,.25);color:#245049}
.spinner{width:34px;height:34px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--tan);animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* reveal */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}

/* The old rule covered .reveal only, while fade, pop and spin kept running. */
@media(prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .reveal{opacity:1;transform:none;transition:none}
  *,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;
    transition-duration:.001ms !important;scroll-behavior:auto !important}
  .btn:hover,.card:hover,.card:focus-within{transform:none}
}

/* ---------- print ---------- */
/* Ctrl+P used to produce the hero and then blank paper, because every other
   section was still at .reveal{opacity:0} until scrolled into view. */
@media print{
  .reveal{opacity:1 !important;transform:none !important}
  .nav,.to-top,.skip-link,.menu-panel,.mini-actions,.overlay{display:none !important}
  body{background:#fff;color:#000;font-size:11pt}
  .card,.skillcard,.stat{box-shadow:none;border:1px solid #bbb;break-inside:avoid}
  .card{grid-template-columns:1fr}
  .shot{display:none}
  .contact{background:#fff;color:#000;border:1px solid #bbb;padding:20px}
  .contact h2,.contact p{color:#000}
  .site-footer{color:#000}
  /* Buttons are painted with a background the printer drops, or with light
     text meant for the dark contact panel. Both render as white-on-white on
     paper, which silently deleted the entire call-to-action row — the one
     thing a printed CV needs. Force ink. */
  .btn,.btn-primary,.btn-ghost,
  .contact .btn,.contact .btn-primary,.contact .btn-ghost{
    background:transparent !important;color:#000 !important}
  a[href^="http"]::after{color:#444 !important}
  .hero{padding-top:0}
  a[href^="http"]::after{content:" (" attr(href) ")";font-size:9pt;color:#444}
  .plink,.btn{border:none;padding:0;min-height:0}
}
`;
