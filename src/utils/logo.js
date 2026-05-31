// Placeholder logo: initials on a colored tile, as an inline SVG data URL.
// Used when a project has no uploaded logo yet.
export function letterLogo(letter, color = "#b5563a") {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='${color}'/><text x='50' y='54' font-size='44' fill='#fffdf8' text-anchor='middle' dominant-baseline='middle' font-family='Georgia, serif'>${letter}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
