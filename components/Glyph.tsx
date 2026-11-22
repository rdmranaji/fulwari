// Small flat illustrations used where a live 3D view would be overkill (cart lines, fallbacks).
export function Glyph({ species, size = 48 }: { species: string; size?: number }) {
  const bag = <path d="M40 74h40l-4 22H44z" fill="#1d2a1d" />;
  const kind =
    ["areca", "foxtail"].includes(species) ? "palm" :
    ["bougainvillea", "hibiscus", "ixora"].includes(species) ? "shrub" :
    ["mango", "chikoo"].includes(species) ? "fruit" :
    species === "duranta" ? "hedge" : species === "snake" ? "pot" : "tree";
  const flower = species === "bougainvillea" ? "#e0358a" : species === "ixora" ? "#ff7a1a" : "#e8331f";
  return (
    <svg width={size} height={size} viewBox="0 0 120 100" aria-hidden="true">
      {kind === "tree" && (<><rect x="56" y="46" width="8" height="32" fill="#6b4a2b" /><circle cx="60" cy="32" r="24" fill="#3f8f3a" /><circle cx="43" cy="42" r="15" fill="#2c6a2a" /><circle cx="77" cy="42" r="15" fill="#5aa845" />{species === "gulmohar" && [[48, 24], [70, 22], [80, 40], [42, 44]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#e8331f" />)}{bag}</>)}
      {kind === "palm" && (<><path d="M58 78q-2-30 4-50" stroke="#a49a5a" strokeWidth="6" fill="none" />{[-60, -25, 10, 45, 80, 115, 150].map((a, i) => <path key={i} d="M62 28q24-6 40 8q-22-2-40-8z" fill={i % 2 ? "#5aa845" : "#3f8f3a"} transform={`rotate(${a} 62 28)`} />)}{bag}</>)}
      {kind === "shrub" && (<><circle cx="46" cy="56" r="18" fill="#2c6a2a" /><circle cx="74" cy="56" r="18" fill="#3f8f3a" /><circle cx="60" cy="42" r="20" fill="#5aa845" />{[[44, 40], [64, 32], [78, 48], [52, 58], [70, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={flower} />)}{bag}</>)}
      {kind === "fruit" && (<><rect x="56" y="48" width="8" height="30" fill="#6b4a2b" /><ellipse cx="60" cy="36" rx="34" ry="26" fill="#2c6a2a" />{[[44, 40], [60, 48], [76, 38], [70, 26]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4.5" ry="6" fill={species === "chikoo" ? "#8a6a3e" : "#f2b120"} />)}{bag}</>)}
      {kind === "hedge" && (<><rect x="14" y="40" width="92" height="40" rx="12" fill="#b8d040" /><rect x="14" y="40" width="92" height="12" rx="6" fill="#d4e04a" /><rect x="10" y="80" width="100" height="10" rx="3" fill="#1d2a1d" /></>)}
      {kind === "pot" && (<><path d="M42 70h36l-5 26H47z" fill="#b8653a" />{[-24, -10, 4, 16, 28].map((a, i) => <path key={i} d="M60 70q-8-34 0-58q8 24 0 58z" fill={i % 2 ? "#3f7a43" : "#1f4d2a"} transform={`rotate(${a} 60 70)`} />)}</>)}
    </svg>
  );
}

export function Leaf({ size = 36, bg = "#0f4d2c" }: { size?: number; bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill={bg} />
      <path d="M20 31V17" stroke="#a8e063" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 20c-7 0-10-5-10-10 6 0 10 3 10 10z" fill="#a8e063" />
      <path d="M20 17c0-6 4-9 10-9 0 6-4 9-10 9z" fill="#d4f0a8" />
    </svg>
  );
}
