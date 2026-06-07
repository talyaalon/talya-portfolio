// ============================================================
//  Design tokens + global CSS — extracted verbatim from the
//  original prototype so the editorial look is preserved 1:1.
// ============================================================

export const COLORS = {
  bg: "#f4efe6",
  surface: "#fffdf8",
  ink: "#2a2622",
  muted: "#8a8178",
  accent: "#b5563a",
  accentDeep: "#8f3f29",
  line: "#e3d9c8",
};

export const styles = `
@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Assistant:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
body { margin: 0; }
.display { font-family: 'Frank Ruhl Libre', Georgia, serif; font-weight: 800; color: ${COLORS.ink}; }
/* Per request: Hebrew headings use the Assistant sans-serif (like the rest of
   the UI). :dir(rtl) targets text that resolves right-to-left, so English
   headings keep the Frank Ruhl Libre serif and only Hebrew switches. */
.display:dir(rtl) { font-family: 'Assistant', sans-serif; font-weight: 700; letter-spacing: 0; }

.grain {
  position:absolute; inset:0; pointer-events:none; opacity:.5;
  background-image: radial-gradient(${COLORS.line} 1px, transparent 1px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%);
          mask-image: linear-gradient(180deg, #000, transparent 70%);
}
.rule { height:1px; background:${COLORS.line}; margin-top:26px; }

.reveal { opacity:0; transform: translateY(14px); animation: rise .6s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes rise { to { opacity:1; transform:none; } }
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; opacity:1; transform:none; }
}

.ghost-btn {
  font-family:'Assistant',sans-serif; font-weight:600; font-size:15px;
  background:transparent; color:${COLORS.ink}; border:1px solid ${COLORS.line};
  padding:9px 18px; border-radius:999px; cursor:pointer; transition:.18s;
}
.ghost-btn:hover { border-color:${COLORS.ink}; }
.ghost-btn:disabled { opacity:.5; cursor:not-allowed; }
.primary-btn {
  font-family:'Assistant',sans-serif; font-weight:700; font-size:15px;
  background:${COLORS.accent}; color:#fffdf8; border:none;
  padding:12px 24px; border-radius:999px; cursor:pointer; transition:.18s;
}
.primary-btn:hover { background:${COLORS.accentDeep}; }
.primary-btn:disabled { cursor:not-allowed; }
/* matches .ghost-btn box metrics so all three header pills are the same size */
.admin-pill { display:inline-flex; align-items:center; font-family:'Assistant',sans-serif; font-size:15px;
  font-weight:700; color:#fffdf8; background:${COLORS.accent}; padding:9px 18px; border-radius:999px;
  border:1px solid transparent; line-height:1; }

button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid ${COLORS.accent}; outline-offset: 2px;
}

.tabs { display:flex; gap:8px; align-items:center; border-bottom:1px solid ${COLORS.line}; padding-bottom:0; flex-wrap:wrap; }
.tab { font-family:'Assistant',sans-serif; font-weight:600; font-size:17px; background:none; border:none;
  color:${COLORS.muted}; padding:14px 4px; margin-inline-end:18px; cursor:pointer; border-bottom:2px solid transparent; }
.tab-active { color:${COLORS.ink}; border-bottom-color:${COLORS.accent}; }

/* grid-auto-rows:1fr makes every row the same height, so all cards match the
   tallest one regardless of how much content each project has.
   minmax(min(100%,320px),1fr) keeps a roomy card on desktop but never overflows
   a narrow phone (the min collapses to 100% when the screen is < 320px). */
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr)); gap:26px; grid-auto-rows:1fr; }
.card {
  background:${COLORS.surface}; border:1px solid ${COLORS.line}; border-radius:20px;
  padding:28px; cursor:pointer; transition:transform .22s, box-shadow .22s, border-color .22s;
  display:flex; flex-direction:column; text-align:right; width:100%; height:100%;
}
/* Description clamped to a fixed 2 lines so one long line can't stretch a card. */
.card-desc {
  font-family:'Assistant',sans-serif; color:${COLORS.muted}; font-size:16px; line-height:1.55;
  min-height:50px; margin:0;
  display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.card:hover { transform:translateY(-4px); box-shadow:0 18px 40px -22px rgba(42,38,34,.35); border-color:${COLORS.accent}; }
.card-logo { width:60px; height:60px; border-radius:16px; overflow:hidden; margin-bottom:2px;
  box-shadow:0 6px 16px -8px rgba(42,38,34,.4); }
.card-logo img { width:100%; height:100%; object-fit:cover; display:block; }
.chips { display:flex; flex-wrap:wrap; gap:7px; margin-top:16px; }
.chip { font-family:'Assistant',sans-serif; font-size:13px; font-weight:600; color:${COLORS.accentDeep};
  background:rgba(181,86,58,.1); padding:5px 11px; border-radius:999px; }
.card-link { display:inline-flex; align-items:center; gap:4px; align-self:flex-start; max-width:100%;
  margin-top:16px; padding:6px 13px; border-radius:999px; border:1px solid rgba(181,86,58,.22);
  background:rgba(181,86,58,.09);
  font-family:'Assistant',sans-serif; font-size:14px; font-weight:600; color:${COLORS.accentDeep};
  text-decoration:none; transition:.15s; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.card-link:hover { border-color:${COLORS.accent}; background:rgba(181,86,58,.16); }
.card-foot { margin-top:auto; padding-top:16px; display:flex; justify-content:space-between; align-items:center; }
.mini { font-family:'Assistant',sans-serif; font-size:13px; font-weight:600; background:none;
  border:1px solid ${COLORS.line}; border-radius:8px; padding:5px 11px; cursor:pointer; color:${COLORS.ink}; }
.mini.danger { color:${COLORS.accentDeep}; }
.mini:hover { border-color:${COLORS.ink}; }

.overlay { position:fixed; inset:0; background:rgba(42,38,34,.5); backdrop-filter:blur(3px);
  display:flex; align-items:flex-start; justify-content:center; padding:40px 18px; overflow:auto; z-index:50;
  animation: fade .2s ease; }
@keyframes fade { from { opacity:0; } }
.sheet { background:${COLORS.surface}; border-radius:22px; padding:34px; width:100%; position:relative;
  box-shadow:0 40px 90px -30px rgba(42,38,34,.55); animation: pop .28s cubic-bezier(.2,.8,.2,1); }
@keyframes pop { from { opacity:0; transform: translateY(20px) scale(.98); } }
.close { position:absolute; top:18px; inset-inline-end:18px; background:none; border:none; font-size:18px;
  color:${COLORS.muted}; cursor:pointer; }

.lbl { display:block; font-family:'Assistant',sans-serif; font-weight:600; font-size:14px;
  color:${COLORS.muted}; margin:16px 0 6px; }
.inp { width:100%; font-family:'Assistant',sans-serif; font-size:16px; color:${COLORS.ink};
  background:#fff; border:1px solid ${COLORS.line}; border-radius:12px; padding:12px 15px; outline:none; transition:.15s; }
.inp:focus { border-color:${COLORS.accent}; }

.stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:18px; }
.stat { background:${COLORS.surface}; border:1px solid ${COLORS.line}; border-radius:18px; padding:26px; }
.stat-num { font-size:48px; line-height:1; color:${COLORS.accentDeep}; }
.stat-lbl { font-family:'Assistant',sans-serif; font-size:15px; color:${COLORS.muted}; margin-top:8px; }

.table { border:1px solid ${COLORS.line}; border-radius:14px; overflow:hidden; background:${COLORS.surface}; }
.trow { display:grid; grid-template-columns:2fr 1fr 1fr; padding:15px 20px;
  font-family:'Assistant',sans-serif; font-size:15px; border-bottom:1px solid ${COLORS.line}; }
.trow:last-child { border-bottom:none; }
.thead { font-weight:700; color:${COLORS.muted}; background:rgba(227,217,200,.3); }

.note { margin-top:22px; background:rgba(181,86,58,.07); border:1px solid rgba(181,86,58,.2);
  border-radius:14px; padding:18px 20px; font-family:'Assistant',sans-serif; font-size:15px;
  line-height:1.65; color:${COLORS.ink}; }

.banner { font-family:'Assistant',sans-serif; font-size:14px; padding:12px 18px; border-radius:12px;
  margin-bottom:18px; line-height:1.5; }
.banner.error { background:rgba(181,86,58,.1); border:1px solid rgba(181,86,58,.3); color:${COLORS.accentDeep}; }
.banner.info { background:rgba(63,111,106,.08); border:1px solid rgba(63,111,106,.25); color:#2f5853; }

.spinner { width:34px; height:34px; border-radius:50%; border:3px solid ${COLORS.line};
  border-top-color:${COLORS.accent}; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 560px) {
  .sheet { padding:26px 20px; }
  .trow { grid-template-columns:1.6fr 1fr 1fr; padding:12px 12px; font-size:13px; }
}
`;
