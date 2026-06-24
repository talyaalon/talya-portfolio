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
  tan: "#b07a4e",
  tanDeep: "#8f5f38",
  line: "#e3dcd3",
};

export const styles = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap');

:root{
  --cream:${COLORS.cream}; --paper:${COLORS.paper}; --beige:${COLORS.beige}; --beige-soft:${COLORS.beigeSoft};
  --ink:${COLORS.ink}; --ink-soft:${COLORS.inkSoft}; --tan:${COLORS.tan}; --tan-deep:${COLORS.tanDeep};
  --line:${COLORS.line}; --shadow:0 1px 2px rgba(38,42,42,.04),0 10px 30px -12px rgba(38,42,42,.12);
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Heebo',system-ui,sans-serif;background:var(--cream);color:var(--ink-soft);
  line-height:1.7;font-size:16px;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.wrap{max-width:1100px;margin:0 auto;padding-inline:28px}
a{color:inherit;text-decoration:none}
h1,h2,h3,h4{color:var(--ink);font-weight:800;line-height:1.15;letter-spacing:-.01em}
button{font-family:inherit}

/* ---------- NAV ---------- */
.nav{position:sticky;top:0;z-index:50;background:rgba(247,243,236,.82);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:14px}
.brand{font-weight:800;color:var(--ink);font-size:18px;letter-spacing:-.01em}
.brand b{color:var(--tan)}
.navlinks{display:flex;align-items:center;gap:22px}
.navlinks a{font-weight:500;font-size:15px;color:var(--ink-soft);transition:color .2s}
.navlinks a:hover{color:var(--tan)}
.pill{border:1px solid var(--beige);background:transparent;color:var(--ink);
  font-weight:600;font-size:13px;padding:7px 14px;border-radius:999px;
  cursor:pointer;transition:.2s;letter-spacing:.02em;display:inline-flex;align-items:center;gap:6px}
.pill:hover{background:var(--beige);border-color:var(--beige)}
.pill.solid{background:var(--tan);border-color:var(--tan);color:#fff}
.pill.solid:hover{background:var(--tan-deep)}
@media(max-width:720px){.navlinks .nl{display:none}}

/* ---------- HERO ---------- */
.hero{position:relative;padding:74px 0 60px}
.hero .wrap{display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center}
.eyebrow{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:13px;
  letter-spacing:.14em;text-transform:uppercase;color:var(--tan-deep);margin-bottom:18px}
.eyebrow::before{content:"";width:26px;height:2px;background:var(--tan)}
.hero h1{font-size:clamp(42px,7vw,68px);margin-bottom:14px}
.hero .role{font-size:clamp(17px,2.4vw,21px);font-weight:600;color:var(--ink);margin-bottom:18px}
.hero .lede{font-size:18px;max-width:30em;margin-bottom:30px}
.actions{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;
  padding:11px 20px;border-radius:999px;transition:.22s;border:1px solid transparent;cursor:pointer}
.btn svg{width:17px;height:17px}
.btn-primary{background:var(--ink);color:#fff}
.btn-primary:hover{background:var(--tan-deep);transform:translateY(-2px)}
.btn-ghost{background:var(--paper);color:var(--ink);border-color:var(--line)}
.btn-ghost:hover{border-color:var(--tan);color:var(--tan-deep);transform:translateY(-2px)}
.portrait{width:200px;height:242px;border-radius:18px;overflow:hidden;flex:0 0 auto;
  box-shadow:var(--shadow);border:5px solid var(--paper);position:relative}
.portrait::after{content:"";position:absolute;inset-inline-end:-14px;inset-block-end:-14px;
  width:100%;height:100%;border:2px solid var(--tan);border-radius:18px;z-index:-1}
.portrait img{width:100%;height:100%;object-fit:cover;object-position:center top}
.portrait .mono{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(150deg,var(--tan),var(--tan-deep));color:#fffdf8;
  font-size:96px;font-weight:800}
@media(max-width:780px){.hero .wrap{grid-template-columns:1fr}.portrait{order:-1;width:150px;height:182px}}

/* ---------- SECTION ---------- */
.section{padding:30px 0 60px}
.sec-label{display:flex;align-items:center;gap:14px;margin-bottom:32px}
.sec-label .num{font-size:13px;font-weight:700;color:var(--tan);letter-spacing:.1em}
.sec-label h2{font-size:clamp(26px,4vw,34px)}
.sec-label .rule{flex:1;height:1px;background:var(--line)}
.about-text{font-size:18px;max-width:46em}

/* ---------- PROJECTS / spine ---------- */
.projects{position:relative}
.spine{position:absolute;inset-block:6px 40px;inset-inline-end:11px;width:2px;
  background:linear-gradient(var(--tan),transparent);opacity:.5}
@media(max-width:780px){.spine{display:none}}
.proj{position:relative;padding-inline-end:46px;margin-bottom:28px}
@media(max-width:780px){.proj{padding-inline-end:0}}
.proj .dot{position:absolute;inset-inline-end:4px;top:30px;width:16px;height:16px;border-radius:50%;
  background:var(--cream);border:3px solid var(--tan);z-index:2}
@media(max-width:780px){.proj .dot{display:none}}
.card{background:var(--paper);border:1px solid var(--line);border-radius:18px;overflow:hidden;
  box-shadow:var(--shadow);transition:transform .25s,box-shadow .25s;display:grid;
  grid-template-columns:1.15fr 1fr}
.card:hover{transform:translateY(-3px);box-shadow:0 18px 40px -14px rgba(38,42,42,.22)}
@media(max-width:660px){.card{grid-template-columns:1fr}}
.card-body{padding:26px 28px;text-align:start}
.proj-meta{font-size:13px;font-weight:600;color:var(--tan-deep);letter-spacing:.04em;margin-bottom:7px}
.card h3{font-size:21px;margin-bottom:12px}
.card p{font-size:15px;margin-bottom:16px}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px}
.chip{font-size:12.5px;font-weight:500;background:var(--beige-soft);color:var(--ink);
  padding:4px 11px;border-radius:999px;direction:ltr}
.result{display:flex;align-items:center;gap:9px;font-weight:600;color:var(--ink);font-size:14.5px;margin-bottom:18px}
.result svg{width:18px;height:18px;color:var(--tan);flex:0 0 auto}
.plinks{display:flex;flex-wrap:wrap;gap:10px}
.plink{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;
  color:var(--ink);border:1px solid var(--line);padding:7px 14px;border-radius:999px;transition:.2s;cursor:pointer;background:none}
.plink svg{width:15px;height:15px}
.plink:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
.plink.soft{color:var(--ink-soft);border-style:dashed}
.shot{background:linear-gradient(135deg,#efe9e1,#e4ddd3);display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:10px;min-height:210px;color:#9a8f81;
  border-inline-start:1px solid var(--line);cursor:pointer;overflow:hidden}
@media(max-width:660px){.shot{min-height:150px;border-inline-start:none;border-top:1px solid var(--line)}}
.shot svg{width:34px;height:34px;opacity:.6}
.shot span{font-size:12.5px;font-weight:600;letter-spacing:.02em}
.shot img{width:100%;height:100%;object-fit:cover;display:block}
.mini-actions{display:flex;gap:8px;margin-top:16px}
.mini{font-size:12.5px;font-weight:600;background:none;border:1px solid var(--line);
  border-radius:8px;padding:5px 11px;cursor:pointer;color:var(--ink)}
.mini.danger{color:var(--tan-deep)}
.mini:hover{border-color:var(--ink)}

/* ---------- SKILLS ---------- */
.skills{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
@media(max-width:660px){.skills{grid-template-columns:1fr}}
.skillcard{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:20px 22px}
.skillcard h4{font-size:13px;font-weight:700;color:var(--tan-deep);letter-spacing:.08em;
  text-transform:uppercase;margin-bottom:13px}
.skillcard .chips{margin:0}

/* ---------- CONTACT ---------- */
.contact{background:var(--ink);color:#e9e4dd;border-radius:24px;padding:54px 40px;text-align:center;margin-bottom:40px}
.contact h2{color:#fff;font-size:clamp(26px,4vw,36px);margin-bottom:12px}
.contact p{color:#bdb6ab;max-width:34em;margin:0 auto 28px;font-size:16px}
.contact .actions{justify-content:center}
.contact .btn-primary{background:var(--tan);color:#fff}
.contact .btn-primary:hover{background:#c98c5d}
.contact .btn-ghost{background:transparent;border-color:#4a4644;color:#e9e4dd}
.contact .btn-ghost:hover{border-color:var(--tan);color:#fff}
footer{padding:0 0 40px;text-align:center;color:#9a9189;font-size:13px}
footer .ltr{direction:ltr;display:inline-block}

/* ---------- admin tabs ---------- */
.tabs{display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--line);flex-wrap:wrap;margin-bottom:8px}
.tab{font-weight:600;font-size:15px;background:none;border:none;color:var(--ink-soft);
  padding:12px 4px;margin-inline-end:18px;cursor:pointer;border-bottom:2px solid transparent}
.tab-active{color:var(--ink);border-bottom-color:var(--tan)}

/* ---------- modal / forms ---------- */
.overlay{position:fixed;inset:0;background:rgba(38,42,42,.5);backdrop-filter:blur(3px);
  display:flex;align-items:flex-start;justify-content:center;padding:40px 18px;overflow:auto;z-index:80;animation:fade .2s ease}
@keyframes fade{from{opacity:0}}
.sheet{background:var(--paper);border-radius:22px;padding:34px;width:100%;position:relative;
  box-shadow:0 40px 90px -30px rgba(38,42,42,.55);animation:pop .28s cubic-bezier(.2,.8,.2,1);text-align:start}
@keyframes pop{from{opacity:0;transform:translateY(20px) scale(.98)}}
.close{position:absolute;top:18px;inset-inline-end:18px;background:none;border:none;font-size:18px;color:var(--ink-soft);cursor:pointer}
.lbl{display:block;font-weight:600;font-size:13px;color:var(--ink-soft);margin:16px 0 6px}
.inp{width:100%;font-family:inherit;font-size:15px;color:var(--ink);background:#fff;
  border:1px solid var(--line);border-radius:12px;padding:11px 14px;outline:none;transition:.15s}
.inp:focus{border-color:var(--tan)}
.primary-btn{font-weight:700;font-size:14px;background:var(--ink);color:#fff;border:none;
  padding:11px 22px;border-radius:999px;cursor:pointer;transition:.18s}
.primary-btn:hover{background:var(--tan-deep)}
.primary-btn:disabled{cursor:not-allowed;opacity:.55}
.ghost-btn{font-weight:600;font-size:14px;background:var(--paper);color:var(--ink);
  border:1px solid var(--line);padding:10px 18px;border-radius:999px;cursor:pointer;transition:.18s}
.ghost-btn:hover{border-color:var(--tan)}
.ghost-btn:disabled{opacity:.5;cursor:not-allowed}

/* ---------- analytics ---------- */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px}
.stat{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px}
.stat-num{font-size:46px;line-height:1;color:var(--tan-deep);font-weight:800}
.stat-lbl{font-size:14px;color:var(--ink-soft);margin-top:8px}
.table{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--paper)}
.trow{display:grid;grid-template-columns:2fr 1fr 1fr;padding:14px 18px;font-size:14px;border-bottom:1px solid var(--line)}
.trow:last-child{border-bottom:none}
.thead{font-weight:700;color:var(--ink-soft);background:rgba(223,215,211,.35)}
.note{margin-top:22px;background:rgba(176,122,78,.08);border:1px solid rgba(176,122,78,.25);
  border-radius:14px;padding:18px 20px;font-size:14.5px;line-height:1.65;color:var(--ink)}
.banner{font-size:14px;padding:12px 18px;border-radius:12px;margin-bottom:18px;line-height:1.5}
.banner.error{background:rgba(176,122,78,.12);border:1px solid rgba(176,122,78,.35);color:var(--tan-deep)}
.banner.info{background:rgba(63,111,106,.08);border:1px solid rgba(63,111,106,.25);color:#2f5853}
.spinner{width:34px;height:34px;border-radius:50%;border:3px solid var(--line);border-top-color:var(--tan);animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* reveal */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
`;
