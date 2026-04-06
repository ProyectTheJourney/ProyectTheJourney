import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "thejourney_v2";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ARCHETYPES = [
  { id: "warrior", name: "El Guerrero", sub: "Disciplina · Fuerza · Acción", lore: "Tu poder nace de la constancia. No esperas la motivación — la creas.", icon: "⚔", aura: "#ff4d00", aura2: "#ff7700", stat: { FUE: 8, INT: 5, SAB: 6, VIT: 9 }, bg: "radial-gradient(ellipse at 50% -10%, #ff4d0022 0%, transparent 65%)" },
  { id: "sage", name: "El Sabio", sub: "Conocimiento · Claridad · Propósito", lore: "Tu fuerza es invisible pero ilimitada. La mente es tu arma más poderosa.", icon: "✦", aura: "#00e5ff", aura2: "#0080ff", stat: { FUE: 5, INT: 9, SAB: 8, VIT: 6 }, bg: "radial-gradient(ellipse at 50% -10%, #00e5ff22 0%, transparent 65%)" },
  { id: "explorer", name: "El Explorador", sub: "Equilibrio · Aventura · Evolución", lore: "Tu camino no tiene un solo destino — tiene infinitos horizontes.", icon: "◎", aura: "#00ff9d", aura2: "#00cc7a", stat: { FUE: 7, INT: 7, SAB: 9, VIT: 7 }, bg: "radial-gradient(ellipse at 50% -10%, #00ff9d22 0%, transparent 65%)" },
];
const STAGE_NAMES = ["El Desconocido", "El Aprendiz", "El Buscador", "El Forjado", "El Maestro"];
const STAGE_LEVELS = [1, 11, 26, 51, 81];
const MISSIONS_DATA = [
  { id: 1, title: "Forja tu cuerpo", sub: "20 min de movimiento consciente", xp: 35, icon: "⚡", area: "cuerpo", lore: "El guerrero forja su cuerpo en el fuego de la disciplina.", why: "20 min de ejercicio elevan dopamina, serotonina y BDNF — la proteína que hace crecer tu cerebro. No necesitas más para empezar a cambiar." },
  { id: 2, title: "Silencia la tormenta", sub: "10 min de meditación o respiración", xp: 30, icon: "◎", area: "mente", lore: "La mente en calma ve lo que el caos oculta.", why: "10 min diarios reducen el volumen de la amígdala en 8 semanas. Harvard lo comprobó en 2011 y los resultados siguen replicándose." },
  { id: 3, title: "El río de la vida", sub: "8 vasos de agua durante el día", xp: 15, icon: "💧", area: "cuerpo", lore: "Tu cuerpo es 70% agua. Trátalo como lo que es.", why: "Deshidratación del 2% reduce capacidad cognitiva hasta 20%. Tu cerebro funciona mejor hidratado." },
  { id: 4, title: "Alimenta tu mente", sub: "Lee 15 páginas de cualquier libro", xp: 25, icon: "📖", area: "mente", lore: "Cada página leída es un nivel ganado en sabiduría.", why: "15 páginas diarias = 18 libros al año. Ficción aumenta empatía; no ficción acelera aprendizaje." },
  { id: 5, title: "El gran silencio", sub: "1 hora sin redes sociales", xp: 20, icon: "🌑", area: "mente", lore: "Tu atención es tu recurso más escaso. Protégela.", why: "Cada notificación interrumpe el foco y tarda ~23 min en recuperarse. 1 hora de silencio digital impacta mediblemente ansiedad y productividad." },
  { id: 6, title: "El descanso del héroe", sub: "Duerme entre 7 y 9 horas", xp: 40, icon: "🌙", area: "cuerpo", lore: "Los héroes se restauran en la oscuridad. El sueño es poder.", why: "Dormir menos de 6h durante 2 semanas deteriora el rendimiento igual que 48h sin dormir — y no lo percibes." },
  { id: 7, title: "Crónicas del viaje", sub: "Escribe 3 cosas buenas de hoy", xp: 20, icon: "✍", area: "mente", lore: "El que no recuerda su progreso, cree que no avanza.", why: "El cerebro recuerda 5x mejor lo malo. El journaling de gratitud reentrena ese sesgo. 3 semanas cambian la percepción de tu vida." },
  { id: 8, title: "La caminata del sabio", sub: "Camina 5-10 min después de comer", xp: 15, icon: "🚶", area: "cuerpo", lore: "Los grandes pensadores caminaban. El movimiento activa la mente.", why: "10 min post-comida reduce el pico de glucosa hasta 30%. Menos caída de energía, menos antojos." },
];
const CONDITIONS = ["Diabetes", "Hipertensión", "Ansiedad", "Depresión", "Colesterol alto", "Hipotiroidismo", "Insomnio", "Sedentarismo"];
const GOALS = ["Perder peso", "Ganar músculo", "Reducir estrés", "Mejorar sueño", "Más energía", "Salud mental", "Más disciplina", "Comer mejor"];
const MOODS = [{ e: "😔", l: "Bajo", v: 1 }, { e: "😐", l: "Regular", v: 2 }, { e: "🙂", l: "Bien", v: 3 }, { e: "😄", l: "Excelente", v: 4 }];
const NAV = [{ id: "home", icon: "⌂", l: "Inicio" }, { id: "misiones", icon: "◈", l: "Misiones" }, { id: "metas", icon: "🎯", l: "Metas" }, { id: "salud", icon: "✦", l: "Salud" }, { id: "mente", icon: "◎", l: "Mente" }];

// Shooting Star missions pool — random events
const STAR_MISSIONS = [
  { title: "¡Estrella Fugaz! Sal a caminar 10 min ahora", xp: 80, icon: "🌟" },
  { title: "¡Estrella Fugaz! Bebe 2 vasos de agua YA", xp: 50, icon: "🌟" },
  { title: "¡Estrella Fugaz! Haz 20 sentadillas ahora mismo", xp: 70, icon: "🌟" },
  { title: "¡Estrella Fugaz! Respira profundo 5 veces", xp: 45, icon: "🌟" },
  { title: "¡Estrella Fugaz! Escribe algo que te haga feliz", xp: 55, icon: "🌟" },
  { title: "¡Estrella Fugaz! Estírate por 3 minutos ahora", xp: 60, icon: "🌟" },
];
const INTRO_SLIDES = [
  { icon: "⚡", title: "Sube de nivel en la vida real", desc: "Cada hábito que construyes suma XP. Tu personaje evoluciona cuando tú evolucionas. Tu vida, gamificada.", color: "#f97316" },
  { icon: "🎭", title: "Tu avatar crece contigo", desc: "Empieza como El Desconocido. Con constancia alcanza El Maestro. Cinco etapas de evolución visual.", color: "#818cf8" },
  { icon: "🎯", title: "Misiones diarias + Metas épicas", desc: "Hábitos diarios para XP rápido. Metas grandes como correr un maratón convertidas en misiones semanales.", color: "#34d399" },
  { icon: "🌑", title: "El Modo Día Oscuro", desc: "Cuando los días difíciles lleguen, la app los detecta y activa un modo especial de recuperación. No te abandona.", color: "#a78bfa" },
];
const TUTORIAL_STEPS = [
  { icon: "⌂", title: "Tu base de operaciones", desc: "Aquí vives tu día: avatar, XP, agua, estado de ánimo y misiones. La pantalla que abrirás cada mañana." },
  { icon: "◈", title: "Misiones diarias", desc: "8 misiones con ciencia detrás. Toca para completar y lee '¿Por qué funciona?' para entender el impacto real." },
  { icon: "🎯", title: "Metas épicas", desc: "Crea conquistas grandes y la app las convierte en misiones semanales con XP. Bajar 5kg, correr un maratón, lo que sea." },
  { icon: "🌑", title: "El Modo Día Oscuro", desc: "Si reportas ánimo bajo varios días seguidos, se activa un modo especial de recuperación. La app está contigo siempre." },
];

// ─── localStorage ─────────────────────────────────────────────────────────────
function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function load() {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function HeroAvatar({ archetype, level = 1, size = 200, animate = true, mood = 3, darkDay = false, showFuture = false }) {
  const a = ARCHETYPES.find(x => x.id === archetype) || ARCHETYPES[0];
  const stage = STAGE_LEVELS.findLastIndex(l => level >= l);
  const marks = { warrior: "⚔", sage: "✦", explorer: "◎" };
  const li = darkDay ? 0.08 : Math.min(0.25 + stage * 0.12 + level * 0.006, 0.85);
  const bl = darkDay ? 0.05 : Math.min(0.18 + stage * 0.08, 0.55);
  const ac = darkDay ? "#4b5563" : a.aura;
  const eyeH = mood <= 1 ? 2.5 : mood >= 4 ? 4.5 : 3.8;
  const eyeW = mood <= 1 ? 4 : mood >= 4 ? 3.2 : 3.5;
  const mouthPath = mood <= 1 ? "M 100 88 Q 110 84 120 88" : mood >= 4 ? "M 100 86 Q 110 92 120 86" : "M 102 88 Q 110 90 118 88";

  return (
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`BL-${archetype}-${level}-${darkDay}`} cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor={ac} stopOpacity={li} />
          <stop offset="50%" stopColor={ac} stopOpacity={li * 0.3} />
          <stop offset="100%" stopColor={ac} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`GL-${archetype}-${level}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={li * 0.9} />
          <stop offset="100%" stopColor={ac} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`BD-${archetype}`} cx="50%" cy="20%" r="75%">
          <stop offset="0%" stopColor={darkDay ? "#1a1a2a" : "#2e3050"} />
          <stop offset="55%" stopColor={darkDay ? "#0e0e18" : "#16182e"} />
          <stop offset="100%" stopColor="#09090f" />
        </radialGradient>
        <radialGradient id={`EL-${archetype}-${darkDay}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={bl} />
          <stop offset="100%" stopColor={ac} stopOpacity="0" />
        </radialGradient>
        <filter id={`G1-${archetype}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`G2-${archetype}`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="11" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`G3-${archetype}`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      <ellipse cx="110" cy="115" rx="95" ry="110" fill={ac} fillOpacity={li * 0.1} filter={`url(#G3-${archetype})`} />
      <ellipse cx="110" cy="115" rx="74" ry="90" fill={`url(#BL-${archetype}-${level}-${darkDay})`} style={animate ? { animation: darkDay ? "dark-breathe 6s ease-in-out infinite" : "aura-breathe 4s ease-in-out infinite" } : {}} />
      <ellipse cx="110" cy="202" rx={46 + stage * 10} ry={11 + stage * 3} fill={`url(#GL-${archetype}-${level})`} style={animate ? { animation: "ground-pulse 3s ease-in-out infinite" } : {}} />

      {/* ── FUTURE SELF SILHOUETTE ── translucent ghost of max level */}
      {showFuture && !darkDay && (
        <g opacity="0.13" style={{ animation: "future-pulse 4s ease-in-out infinite" }}>
          {/* Future silhouette — larger, more imposing */}
          <ellipse cx="110" cy="118" rx="88" ry="106" fill={ac} fillOpacity="0.06" />
          <rect x="76" y="150" width="20" height="50" rx="10" fill={ac} />
          <rect x="124" y="150" width="20" height="50" rx="10" fill={ac} />
          <rect x="70" y="98" width="80" height="60" rx="16" fill={ac} />
          <ellipse cx="70" cy="112" rx="16" ry="13" fill={ac} />
          <ellipse cx="150" cy="112" rx="16" ry="13" fill={ac} />
          <rect x="52" y="108" width="18" height="52" rx="9" fill={ac} />
          <rect x="150" y="108" width="18" height="52" rx="9" fill={ac} />
          <rect x="98" y="86" width="24" height="18" rx="9" fill={ac} />
          <ellipse cx="110" cy="70" rx="32" ry="34" fill={ac} />
          {/* Crown */}
          <ellipse cx="110" cy="36" rx="34" ry="12" fill={ac} />
          {/* Orbit rings */}
          <ellipse cx="110" cy="110" rx="112" ry="112" stroke={ac} strokeWidth="1" fill="none" />
          <ellipse cx="110" cy="110" rx="98" ry="98" stroke={ac} strokeWidth="0.5" fill="none" />
        </g>
      )}

      {darkDay && animate && [30, 70, 110, 150, 190, 50, 90, 130, 170].map((x, i) => (
        <rect key={i} x={x} y={-10} width="1.2" height="8" rx="1" fill="#4b5563" opacity="0.35"
          style={{ animation: `rain-fall ${1.2 + (i % 4) * 0.3}s ${i * 0.18}s linear infinite` }} />
      ))}

      {stage >= 3 && !darkDay && <ellipse cx="110" cy="110" rx="108" ry="108" stroke={ac} strokeWidth="0.7" fill="none" opacity="0.25" style={{ animation: "ring-spin 14s linear infinite" }} />}
      {stage >= 4 && !darkDay && <ellipse cx="110" cy="110" rx="96" ry="96" stroke={ac} strokeWidth="0.4" fill="none" opacity="0.15" style={{ animation: "ring-spin 9s linear infinite reverse" }} />}

      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="#131325" />
      <rect x="119" y="157" width="17" height="42" rx="8.5" fill="#131325" />
      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl * 0.9} />
      <rect x="119" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl * 0.9} />
      {stage >= 2 && !darkDay && <>
        <rect x="82" y="185" width="21" height="14" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5" />
        <rect x="117" y="185" width="21" height="14" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5" />
      </>}

      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#BD-${archetype})`} />
      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#EL-${archetype}-${darkDay})`} />
      <rect x="79" y="107" width="62" height="57" rx="13" fill="none" stroke={ac} strokeWidth={stage >= 1 ? 0.8 : 0.3} strokeOpacity={stage >= 1 ? 0.35 : 0.1} />
      {stage >= 3 && !darkDay && <rect x="89" y="114" width="42" height="30" rx="7" fill={ac} fillOpacity="0.09" stroke={ac} strokeWidth="0.7" strokeOpacity="0.45" />}

      <ellipse cx="79" cy="117" rx="12" ry="10" fill="#131325" />
      <ellipse cx="141" cy="117" rx="12" ry="10" fill="#131325" />
      <ellipse cx="79" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage >= 2 ? 0.45 : 0.14} />
      <ellipse cx="141" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage >= 2 ? 0.45 : 0.14} />

      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="#131325" />
      <rect x="142" y="114" width="15" height="44" rx="7.5" fill="#131325" />
      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl * 0.8} />
      <rect x="142" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl * 0.8} />
      {stage >= 3 && !darkDay && <>
        <rect x="61" y="146" width="19" height="13" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6" />
        <rect x="140" y="146" width="19" height="13" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6" />
      </>}

      <rect x="103" y="94" width="14" height="17" rx="7" fill="#131325" />
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="#131325" />
      <ellipse cx="110" cy="78" rx="25" ry="27" fill={ac} fillOpacity={bl * 0.35} filter={`url(#G2-${archetype})`} />
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="none" stroke={ac} strokeWidth={stage >= 2 ? 0.8 : 0.3} strokeOpacity={stage >= 2 && !darkDay ? 0.32 : 0.1} />

      <path d={`M ${103 - eyeW} ${74 - eyeH - 5} Q 103 ${74 - eyeH - 7} ${103 + eyeW} ${74 - eyeH - 5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay ? 0.2 : 0.5} strokeLinecap="round" />
      <path d={`M ${117 - eyeW} ${74 - eyeH - 5} Q 117 ${74 - eyeH - 7} ${117 + eyeW} ${74 - eyeH - 5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay ? 0.2 : 0.5} strokeLinecap="round" />
      <ellipse cx="103" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay ? 0.4 : 1} filter={`url(#G1-${archetype})`} />
      <ellipse cx="117" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay ? 0.4 : 1} filter={`url(#G1-${archetype})`} />
      <ellipse cx="103" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay ? 0.06 : stage >= 1 ? 0.22 : 0.1} filter={`url(#G2-${archetype})`} />
      <ellipse cx="117" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay ? 0.06 : stage >= 1 ? 0.22 : 0.1} filter={`url(#G2-${archetype})`} />
      {!darkDay && <>
        <ellipse cx="104.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.6" />
        <ellipse cx="118.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.6" />
      </>}
      <ellipse cx="110" cy="82" rx="1.2" ry="1" fill={ac} opacity={darkDay ? 0.15 : 0.3} />
      <path d={mouthPath} stroke={ac} strokeWidth="1.4" fill="none" strokeOpacity={darkDay ? 0.2 : mood >= 4 ? 0.9 : 0.55} strokeLinecap="round" />
      <text x="110" y="138" textAnchor="middle" fontSize={stage >= 3 ? 17 : 13} fill={ac} opacity={darkDay ? 0.2 : stage >= 2 ? 1 : 0.65} filter={`url(#G1-${archetype})`}>{marks[archetype]}</text>
      {stage >= 4 && !darkDay && <ellipse cx="110" cy="48" rx="28" ry="10" fill={ac} fillOpacity="0.16" filter={`url(#G2-${archetype})`} />}
      {!darkDay && Array.from({ length: stage >= 2 ? 8 : stage >= 1 ? 4 : 0 }, (_, i) => {
        const angle = (i / (stage >= 2 ? 8 : 4)) * Math.PI * 2;
        const r = 62 + (i % 3) * 14;
        return <circle key={i} cx={110 + Math.cos(angle) * r} cy={118 + Math.sin(angle) * r * 0.5} r={1.7 + (i % 2) * 1.1} fill={ac} opacity={0.32 + (i % 3) * 0.12} style={{ animation: `float-p ${2.4 + i * 0.38}s ${i * 0.28}s ease-in-out infinite alternate` }} />;
      })}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStage = l => STAGE_LEVELS.findLastIndex(x => l >= x);
const getStageName = l => STAGE_NAMES[getStage(l)];

function XPBar({ xp, xpNext, color, label = true }) {
  return (
    <div>
      {label && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: "#6b7a96", letterSpacing: 2 }}>EXPERIENCIA</span>
        <span style={{ fontSize: 10, color, fontWeight: 700 }}>{xp} / {xpNext} XP</span>
      </div>}
      <div style={{ height: 4, background: "#0a0d1a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min((xp / xpNext) * 100, 100)}%`, background: `linear-gradient(90deg,${color}55,${color})`, borderRadius: 2, transition: "width 1s ease", boxShadow: `0 0 10px ${color}` }} />
      </div>
    </div>
  );
}

function Card({ children, style = {}, glow }) {
  return <div style={{ background: "#0d1428", border: `1px solid ${glow ? glow + "50" : "#1a2540"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: glow ? `0 0 28px ${glow}22, 0 0 1px ${glow}` : "none", ...style }}>{children}</div>;
}

function Pill({ label, active, color, onClick }) {
  return <button onClick={onClick} style={{ border: `1px solid ${active ? color + "70" : "#1a2035"}`, borderRadius: 20, padding: "7px 14px", background: active ? color + "18" : "transparent", color: active ? color : "#6b7a96", cursor: "pointer", fontSize: 12, fontFamily: "inherit", transition: "all 0.2s" }}>{label}</button>;
}

function WhyBox({ text, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", color: color || "#6b7a96", fontSize: 11, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
        <span style={{ fontSize: 9 }}>{open ? "▲" : "▼"}</span> ¿Por qué funciona?
      </button>
      {open && <p style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.8, marginTop: 8, paddingTop: 8, borderTop: "1px solid #141828" }}>{text}</p>}
    </div>
  );
}

function XPBurst({ xp, color, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", top: "45%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 990, pointerEvents: "none", textAlign: "center", animation: "xp-burst 1.2s ease forwards" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 32, color, fontWeight: 900, textShadow: `0 0 30px ${color}` }}>+{xp} XP</div>
    </div>
  );
}

function LevelUpToast({ level, arc, archetype, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)" }}>
      <div style={{ textAlign: "center", animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ fontSize: 48, marginBottom: 8, filter: `drop-shadow(0 0 28px ${arc.aura})` }}>⚡</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: arc.aura, letterSpacing: 6, marginBottom: 4 }}>NIVEL ALCANZADO</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 82, color: "#f8fafc", lineHeight: 1, textShadow: `0 0 60px ${arc.aura}, 0 0 120px ${arc.aura}55` }}>{level}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8, letterSpacing: 2 }}>{getStageName(level)}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <HeroAvatar archetype={archetype} level={level} size={96} animate={false} />
        </div>
      </div>
    </div>
  );
}

function DarkDayScreen({ arc, archetype, playerName, onMission, onDismiss }) {
  const [phase, setPhase] = useState(0);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 980, background: "linear-gradient(180deg, #03030a 0%, #080810 60%, #0a0a14 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: `${(i * 5.5) % 100}%`, top: -20, width: 1, height: "100vh", background: "linear-gradient(to bottom, transparent, #4b556322, transparent)", animation: `rain-streak ${2 + (i % 5) * 0.4}s ${i * 0.22}s linear infinite` }} />
        ))}
      </div>
      <button onClick={onDismiss} style={{ position: "absolute", top: 18, right: 20, background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 20 }}>✕</button>
      {phase === 0 && (
        <div style={{ textAlign: "center", maxWidth: 340, animation: "fade-up 0.6s ease" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <HeroAvatar archetype={archetype} level={1} size={140} animate darkDay mood={1} />
          </div>
          <div style={{ fontSize: 9, color: "#374151", letterSpacing: 5, marginBottom: 10 }}>MODO DÍA OSCURO</div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, color: "#94a3b8", letterSpacing: 2, marginBottom: 16, lineHeight: 1.4 }}>Los días oscuros también forman parte del camino</h2>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.9, marginBottom: 8 }}>Hola <strong style={{ color: "#6b7a96" }}>{playerName}</strong>. Llevás varios días con el ánimo bajo y lo hemos notado.</p>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.9, marginBottom: 28 }}>No vas a perder tu racha. Solo necesitas hacer <strong style={{ color: "#818cf8" }}>una cosa pequeña</strong>.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setPhase(1)} style={{ background: "#818cf820", border: "1px solid #818cf844", borderRadius: 12, padding: "13px", color: "#818cf8", fontFamily: "'Cinzel',serif", fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>Activar misión de recuperación</button>
            <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#374151", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Estoy bien, continuar</button>
          </div>
        </div>
      )}
      {phase === 1 && (
        <div style={{ textAlign: "center", maxWidth: 360, animation: "fade-up 0.4s ease" }}>
          <div style={{ fontSize: 28, marginBottom: 14, filter: "drop-shadow(0 0 16px #818cf8)" }}>🌑</div>
          <div style={{ fontSize: 9, color: "#374151", letterSpacing: 5, marginBottom: 10 }}>MISIÓN DE RECUPERACIÓN · +100 XP</div>
          <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 19, color: "#94a3b8", letterSpacing: 2, marginBottom: 20 }}>El primer paso</h3>
          {["Toma un vaso de agua ahora mismo", "Sal al exterior aunque sea 5 minutos", "Escribe una sola cosa por la que estés vivo hoy"].map((s, i) => (
            <div key={i} style={{ background: "#0d1020", border: "1px solid #1a2035", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#818cf820", border: "1px solid #818cf844", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8", fontSize: 13, flexShrink: 0, fontFamily: "'Cinzel',serif" }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.8, marginTop: 16, marginBottom: 24, fontStyle: "italic" }}>"El guerrero no es quien nunca cae.<br />Es quien se levanta cada vez."</p>
          <button onClick={() => { onMission(100); onDismiss(); }} style={{ width: "100%", background: "#818cf8", border: "none", borderRadius: 12, padding: "14px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>
            ✓ Completar misión (+100 XP)
          </button>
        </div>
      )}
    </div>
  );
}

function WeeklySummary({ player, arc, doneMissions, totalMissions, moodLog, onClose }) {
  const avgMood = moodLog.length ? (moodLog.reduce((s, m) => s + m.v, 0) / moodLog.length).toFixed(1) : "—";
  const moodEmoji = avgMood >= 3.5 ? "😄" : avgMood >= 2.5 ? "🙂" : avgMood >= 1.5 ? "😐" : "😔";
  const pct = Math.round((doneMissions / totalMissions) * 100);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 975, backdropFilter: "blur(8px)", padding: 20 }}>
      <div style={{ background: "#0d1020", border: `1px solid ${arc.aura}33`, borderRadius: 24, padding: "28px 24px", maxWidth: 380, width: "100%", animation: "pop-in 0.45s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 9, color: arc.aura, letterSpacing: 5, marginBottom: 8 }}>RESUMEN SEMANAL</div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, color: "#f8fafc", letterSpacing: 2, marginBottom: 4 }}>{player.name}</h2>
          <div style={{ fontSize: 12, color: "#6b7a96" }}>{arc.name} · Nivel {player.level}</div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <HeroAvatar archetype={player.archetype} level={player.level} size={90} animate={false} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "⚡", val: `${player.xp} XP`, label: "Experiencia", c: arc.aura },
            { icon: "🔥", val: `${player.streak}`, label: "Días de racha", c: "#f97316" },
            { icon: "◈", val: `${pct}%`, label: "Misiones hoy", c: "#34d399" },
            { icon: moodEmoji, val: avgMood, label: "Ánimo promedio", c: "#818cf8" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#080810", border: "1px solid #1a2035", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: s.c, marginBottom: 2 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#4b5563" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: arc.aura + "10", border: `1px solid ${arc.aura}22`, borderRadius: 12, padding: "14px 16px", marginBottom: 18, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, fontStyle: "italic" }}>
            {pct >= 80 ? `"Semana extraordinaria. El ${arc.name} en ti está despertando."` : pct >= 50 ? `"Más de la mitad del camino. El progreso es progreso."` : `"Cada semana es una nueva oportunidad. El viaje continúa."`}
          </p>
        </div>
        <button onClick={onClose} style={{ width: "100%", background: arc.aura, border: "none", borderRadius: 12, padding: "13px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>Continuar el viaje →</button>
      </div>
    </div>
  );
}

function IntroSlider({ onDone }) {
  const [idx, setIdx] = useState(0);
  const s = INTRO_SLIDES[idx];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#07080f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 990, padding: 28 }}>
      <button onClick={onDone} style={{ position: "absolute", top: 18, right: 20, background: "none", border: "none", color: "#374151", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Saltar</button>
      {idx === 0 ? (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginBottom: 16 }}>
          {[{ a: "warrior", lv: 1 }, { a: "explorer", lv: 10 }, { a: "sage", lv: 26 }].map((p, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <HeroAvatar archetype={p.a} level={p.lv} size={i === 1 ? 110 : 76} animate={i === 1} />
              <div style={{ fontSize: 9, color: ARCHETYPES.find(a => a.id === p.a)?.aura, letterSpacing: 2, marginTop: 4 }}>Nv. {p.lv}</div>
              <div style={{ fontSize: 8, color: "#374151", marginTop: 1 }}>{getStageName(p.lv)}</div>
            </div>
          ))}
        </div>
      ) : <div style={{ fontSize: 50, marginBottom: 20, filter: `drop-shadow(0 0 20px ${s.color})` }}>{s.icon}</div>}
      <div style={{ textAlign: "center", maxWidth: 320, animation: "fade-up 0.4s ease" }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 21, color: "#f8fafc", letterSpacing: 2, marginBottom: 12, lineHeight: 1.35 }}>{s.title}</h2>
        <p style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.85 }}>{s.desc}</p>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "28px 0 22px" }}>
        {INTRO_SLIDES.map((_, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 22 : 7, height: 7, borderRadius: 4, background: i === idx ? s.color : "#1a2035", cursor: "pointer", transition: "all 0.3s" }} />)}
      </div>
      <button onClick={idx === INTRO_SLIDES.length - 1 ? onDone : () => setIdx(i => i + 1)} style={{ background: s.color, border: "none", borderRadius: 12, padding: "13px 36px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1, minWidth: 200 }}>
        {idx === INTRO_SLIDES.length - 1 ? "¡Comenzar! →" : "Siguiente →"}
      </button>
    </div>
  );
}

function Tutorial({ onDone }) {
  const [idx, setIdx] = useState(0);
  const s = TUTORIAL_STEPS[idx];
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 980, backdropFilter: "blur(3px)", padding: 24 }}>
      <div style={{ background: "#0d1020", border: "1px solid #1a2035", borderRadius: 20, padding: "28px 24px", maxWidth: 340, width: "100%", animation: "pop-in 0.35s ease" }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>{s.icon}</div>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: "#f8fafc", textAlign: "center", marginBottom: 12, letterSpacing: 1 }}>{s.title}</h3>
        <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.85, textAlign: "center", marginBottom: 22 }}>{s.desc}</p>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {TUTORIAL_STEPS.map((_, i) => <div key={i} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, background: i === idx ? "#34d399" : "#1a2035", transition: "all 0.3s" }} />)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {idx > 0 && <button onClick={() => setIdx(i => i - 1)} style={{ flex: 1, background: "#141828", border: "1px solid #1a2035", borderRadius: 10, padding: "11px", color: "#6b7a96", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>← Atrás</button>}
          <button onClick={idx === TUTORIAL_STEPS.length - 1 ? onDone : () => setIdx(i => i + 1)} style={{ flex: 2, background: "#34d399", border: "none", borderRadius: 10, padding: "11px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            {idx === TUTORIAL_STEPS.length - 1 ? "¡Entendido!" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MedDisclaimer({ onAccept }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998, padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#0d1020", border: "1px solid #f97316aa", borderRadius: 20, padding: "32px 26px", maxWidth: 420, width: "100%" }}>
        <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>⚕️</div>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#f8fafc", textAlign: "center", marginBottom: 16, letterSpacing: 2 }}>Aviso Importante</h3>
        <p style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.9, marginBottom: 14 }}><strong style={{ color: "#cbd5e1" }}>The Journey</strong> es una herramienta de apoyo al bienestar basada en evidencia general. <strong style={{ color: "#cbd5e1" }}>No reemplaza la atención médica profesional.</strong></p>
        <p style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.9, marginBottom: 24 }}>Ante síntomas o dudas médicas, <strong style={{ color: "#f97316" }}>consulta siempre a un profesional antes de cambiar tu rutina.</strong></p>
        <button onClick={onAccept} style={{ width: "100%", background: "#f97316", border: "none", borderRadius: 12, padding: "13px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>Entendido, continuar →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: "", age: "", weight: "", height: "", sleep: "7", stress: "5", conditions: [], goals: [], archetype: null });
  const [player, setPlayer] = useState(null);
  const [tab, setTab] = useState("home");
  const [missions, setMissions] = useState(MISSIONS_DATA.map(m => ({ ...m, done: false })));
  const [customGoals, setCustomGoals] = useState([]);
  const [mood, setMood] = useState(null);
  const [moodLog, setMoodLog] = useState([]);
  const [water, setWater] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDarkDay, setShowDarkDay] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [xpBurst, setXpBurst] = useState(null);
  const [completedAnim, setCompletedAnim] = useState(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalForm, setNewGoalForm] = useState({ title: "", desc: "", emoji: "🎯", type: "custom", weeks: "8" });
  const breathRef = useRef(null);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhala");
  const [starMission, setStarMission] = useState(null);
  const [starTimer, setStarTimer] = useState(0);
  const starIntervalRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = load();
    if (saved) {
      if (saved.profile) setProfile(saved.profile);
      if (saved.player) { setPlayer(saved.player); setStep(5); }
      if (saved.missions) setMissions(saved.missions);
      if (saved.customGoals) setCustomGoals(saved.customGoals);
      if (saved.water !== undefined) setWater(saved.water);
      if (saved.moodLog) setMoodLog(saved.moodLog);
    }
  }, []);

  // Auto-save whenever state changes
  useEffect(() => {
    if (step < 5 && !player) return;
    save({ profile, player, missions, customGoals, water, moodLog });
  }, [profile, player, missions, customGoals, water, moodLog]);

  // Shooting Star — spawn randomly every 8-15 min, lasts 90 seconds
  useEffect(() => {
    if (!player) return;
    const spawnDelay = (8 + Math.random() * 7) * 60 * 1000;
    const spawnTimeout = setTimeout(() => {
      const mission = STAR_MISSIONS[Math.floor(Math.random() * STAR_MISSIONS.length)];
      setStarMission(mission);
      setStarTimer(90);
      starIntervalRef.current = setInterval(() => {
        setStarTimer(t => {
          if (t <= 1) { clearInterval(starIntervalRef.current); setStarMission(null); return 0; }
          return t - 1;
        });
      }, 1000);
    }, spawnDelay);
    return () => { clearTimeout(spawnTimeout); clearInterval(starIntervalRef.current); };
  }, [player?.level]);

  const arc = ARCHETYPES.find(a => a.id === (profile.archetype || player?.archetype || "explorer"));
  const lowMoodStreak = moodLog.length >= 3 && moodLog.slice(-3).every(m => m.v <= 1);
  const doneMissions = missions.filter(m => m.done).length;
  const currentMood = mood || (moodLog.length ? moodLog[moodLog.length - 1].v : 3);
  const bmi = profile.weight && profile.height ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1) : null;
  const bmiLabel = !bmi ? "" : bmi < 18.5 ? "Bajo peso" : bmi < 25 ? "Normal" : bmi < 30 ? "Sobrepeso" : "Obesidad";
  const bmiColor = !bmi ? "#6b7a96" : bmi < 18.5 ? "#60a5fa" : bmi < 25 ? "#34d399" : bmi < 30 ? "#f59e0b" : "#f87171";
  const waterGoal = Math.round((parseFloat(profile.weight) || 70) * 0.033 * 10) / 10;

  function toggleArr(k, v) { setProfile(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] })); }

  function finishSetup() {
    const a = ARCHETYPES.find(x => x.id === profile.archetype);
    setPlayer({ name: profile.name, archetype: profile.archetype, level: 1, xp: 0, xpNext: 100, streak: 1, stats: { ...a.stat }, joinedAt: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) });
    setShowDisclaimer(true);
  }

  function addXP(gain, showBurst = true) {
    if (showBurst) setXpBurst({ xp: gain, key: Date.now() });
    setPlayer(p => {
      if (!p) return p;
      const nx = p.xp + gain;
      const up = nx >= p.xpNext;
      const nl = up ? p.level + 1 : p.level;
      if (up) { setNewLevel(nl); setShowLevelUp(true); }
      return { ...p, xp: up ? nx - p.xpNext : nx, xpNext: up ? Math.round(p.xpNext * 1.5) : p.xpNext, level: nl };
    });
  }

  function completeMission(idx) {
    if (missions[idx].done) return;
    setMissions(m => m.map((x, i) => i === idx ? { ...x, done: true } : x));
    setCompletedAnim(idx);
    setTimeout(() => setCompletedAnim(null), 700);
    addXP(missions[idx].xp);
  }

  function logMood(v) {
    setMood(v);
    const newLog = [...moodLog.slice(-11), { v, t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
    setMoodLog(newLog);
    if (newLog.length >= 3 && newLog.slice(-3).every(m => m.v <= 1)) {
      setTimeout(() => setShowDarkDay(true), 800);
    }
  }

  function resetDay() {
    setMissions(MISSIONS_DATA.map(m => ({ ...m, done: false })));
    setWater(0); setMood(null);
    setPlayer(p => p ? { ...p, streak: p.streak + 1 } : p);
  }

  function startBreath() {
    setBreathActive(true);
    const phases = [{ n: "inhala", d: 4000 }, { n: "sostén", d: 7000 }, { n: "exhala", d: 8000 }];
    let i = 0; setBreathPhase(phases[0].n);
    function cycle() { i = (i + 1) % 3; setBreathPhase(phases[i].n); breathRef.current = setTimeout(cycle, phases[i].d); }
    breathRef.current = setTimeout(cycle, phases[0].d);
  }
  function stopBreath() { setBreathActive(false); clearTimeout(breathRef.current); }

  function genWeeklyMissions(type) {
    const plans = {
      weight: [{ text: "Registra tu peso hoy", xp: 10 }, { text: "Elimina refrescos esta semana", xp: 30 }, { text: "Camina 30 min (3 veces)", xp: 40 }, { text: "Verduras en cada comida", xp: 20 }],
      marathon: [{ text: "Corre 2km sin parar", xp: 30 }, { text: "Ejercicios de pierna (2 días)", xp: 25 }, { text: "Duerme 8h para recuperación", xp: 20 }, { text: "Elige ruta de entrenamiento", xp: 25 }],
      sleep: [{ text: "Duerme a la misma hora 5 días", xp: 40 }, { text: "Sin pantallas 1h antes de dormir", xp: 30 }, { text: "Oscuridad total en tu cuarto", xp: 15 }, { text: "Anota calidad de sueño", xp: 15 }],
      muscle: [{ text: "Entrena 3 días (fuerza)", xp: 50 }, { text: "Proteína en cada comida", xp: 25 }, { text: "Duerme 8h para síntesis muscular", xp: 25 }],
      custom: [{ text: "Define 3 acciones concretas", xp: 20 }, { text: "Toma la primera acción hoy", xp: 40 }, { text: "Registra tu avance", xp: 20 }, { text: "Comparte tu meta con alguien", xp: 20 }],
    };
    return (plans[type] || plans.custom).map(m => ({ ...m, done: false }));
  }

  function createGoal() {
    const goal = { id: Date.now(), title: newGoalForm.title, desc: newGoalForm.desc, emoji: newGoalForm.emoji, type: newGoalForm.type, xpTotal: parseInt(newGoalForm.weeks) * 100, xpEarned: 0, weeklyMissions: genWeeklyMissions(newGoalForm.type), createdAt: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long" }) };
    setCustomGoals(g => [...g, goal]);
    setShowNewGoal(false);
    setNewGoalForm({ title: "", desc: "", emoji: "🎯", type: "custom", weeks: "8" });
    addXP(25);
  }

  function completeGoalMission(goalId, mIdx) {
    const goal = customGoals.find(g => g.id === goalId);
    if (!goal || goal.weeklyMissions[mIdx].done) return;
    const xp = goal.weeklyMissions[mIdx].xp;
    setCustomGoals(gs => gs.map(g => g.id !== goalId ? g : { ...g, weeklyMissions: g.weeklyMissions.map((m, i) => i === mIdx ? { ...m, done: true } : m), xpEarned: (g.xpEarned || 0) + xp }));
    addXP(xp);
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (step < 5) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "flex-start", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0", padding: "32px 16px 60px", overflowY: "auto" }}>
      <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${arc.aura}07, transparent 70%)`, pointerEvents: "none" }} />
      {showIntro && <IntroSlider onDone={() => setShowIntro(false)} />}
      {showDisclaimer && <MedDisclaimer onAccept={() => { setShowDisclaimer(false); setStep(5); setShowTutorial(true); }} />}

      <div style={{ width: "100%", maxWidth: step === 4 ? 880 : 460 }}>
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <HeroAvatar archetype="explorer" level={10} size={160} mood={4} />
            </div>
            <div style={{ fontSize: 9, color: "#2d3a52", letterSpacing: 6, marginBottom: 10 }}>COMIENZA TU HISTORIA</div>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 50, fontWeight: 900, color: "#f8fafc", letterSpacing: 8, lineHeight: 0.95, marginBottom: 14 }}>THE<br />JOURNEY</h1>
            <p style={{ fontSize: 14, color: "#8892a4", lineHeight: 1.9, marginBottom: 28 }}>Tu vida como un RPG.<br />Cada hábito te hace subir de nivel en la vida real.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
              {[["⚡", "Misiones diarias"], ["🎯", "Metas épicas"], ["✦", "Salud integrada"], ["🌑", "Modo Día Oscuro"], ["🎭", "Avatar que evoluciona"]].map(([ic, lb]) => (
                <div key={lb} style={{ background: "#0d1020", border: "1px solid #1a2035", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#8892a4" }}>{ic} {lb}</div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={S.btn} onClick={() => setStep(1)}>Comenzar el viaje →</button>
              <button onClick={() => setShowIntro(true)} style={{ background: "none", border: "1px solid #1a2035", borderRadius: 12, padding: "12px", color: "#6b7a96", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>¿Cómo funciona? Ver intro</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={S.setupCard}>
            <div style={S.badge}>1 de 4</div>
            <h2 style={S.stitle}>Tu identidad</h2>
            <p style={S.ssub}>Estos datos personalizan tu plan de desarrollo y salud</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
              {[["Nombre o alias", "name", "text", "¿Cómo te llamamos?"], ["Edad", "age", "number", "años"], ["Peso (kg)", "weight", "number", "kg"], ["Talla (cm)", "height", "number", "cm"]].map(([lbl, key, type, ph]) => (
                <div key={key}><label style={S.label}>{lbl}</label><input style={S.input} type={type} placeholder={ph} value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} /></div>
              ))}
            </div>
            <label style={S.label}>Horas de sueño: <span style={{ color: arc.aura }}>{profile.sleep}h</span></label>
            <input type="range" min="4" max="12" value={profile.sleep} onChange={e => setProfile(p => ({ ...p, sleep: e.target.value }))} style={{ width: "100%", accentColor: arc.aura, marginBottom: 18 }} />
            <label style={S.label}>Nivel de estrés: <span style={{ color: arc.aura }}>{profile.stress}/10</span></label>
            <input type="range" min="1" max="10" value={profile.stress} onChange={e => setProfile(p => ({ ...p, stress: e.target.value }))} style={{ width: "100%", accentColor: arc.aura, marginBottom: 26 }} />
            <button style={{ ...S.btn, opacity: profile.name && profile.age ? 1 : 0.35 }} onClick={() => profile.name && profile.age && setStep(2)}>Siguiente →</button>
          </div>
        )}

        {step === 2 && (
          <div style={S.setupCard}>
            <div style={S.badge}>2 de 4</div>
            <h2 style={S.stitle}>Tu salud</h2>
            <p style={S.ssub}>Selecciona condiciones que apliquen (opcional)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>{CONDITIONS.map(c => <Pill key={c} label={c} active={profile.conditions.includes(c)} color={arc.aura} onClick={() => toggleArr("conditions", c)} />)}</div>
            <button style={S.btn} onClick={() => setStep(3)}>Siguiente →</button>
          </div>
        )}

        {step === 3 && (
          <div style={S.setupCard}>
            <div style={S.badge}>3 de 4</div>
            <h2 style={S.stitle}>Tus objetivos</h2>
            <p style={S.ssub}>¿Qué quieres conquistar en este viaje?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>{GOALS.map(g => <Pill key={g} label={g} active={profile.goals.includes(g)} color={arc.aura} onClick={() => toggleArr("goals", g)} />)}</div>
            <button style={{ ...S.btn, opacity: profile.goals.length ? 1 : 0.35 }} onClick={() => profile.goals.length && setStep(4)}>Siguiente →</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={S.badge}>4 de 4</div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, color: "#f8fafc", letterSpacing: 3, marginBottom: 8 }}>Elige tu arquetipo</h2>
              <p style={{ fontSize: 13, color: "#8892a4" }}>Tu origen define cómo evolucionas</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 28 }}>
              {ARCHETYPES.map(a => {
                const sel = profile.archetype === a.id;
                return (
                  <div key={a.id} onClick={() => setProfile(p => ({ ...p, archetype: a.id }))} style={{ background: "#0d1020", border: `1px solid ${sel ? a.aura + "55" : "#1a2035"}`, borderRadius: 18, padding: "24px 16px 20px", cursor: "pointer", transition: "all 0.35s", boxShadow: sel ? `0 0 40px ${a.aura}18` : "none", transform: sel ? "translateY(-6px)" : "none", textAlign: "center", position: "relative" }}>
                    {sel && <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: `radial-gradient(ellipse at 50% 0%, ${a.aura}10, transparent 70%)`, pointerEvents: "none" }} />}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><HeroAvatar archetype={a.id} level={sel ? 32 : 1} size={100} animate={sel} mood={sel ? 4 : 3} /></div>
                    <div style={{ fontSize: 11, color: a.aura, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>{a.icon} {a.name}</div>
                    <div style={{ fontSize: 10, color: "#6b7a96", marginBottom: 10 }}>{a.sub}</div>
                    <p style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.7 }}>{a.lore}</p>
                    {sel && <div style={{ marginTop: 14, fontSize: 10, background: a.aura, color: "#000", borderRadius: 20, padding: "5px 0", fontWeight: 800, letterSpacing: 2 }}>✓ SELECCIONADO</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center" }}>
              <button style={{ ...S.btn, maxWidth: 360, background: profile.archetype ? arc.aura : "#1a2035", color: profile.archetype ? "#000" : "#4b5563", opacity: profile.archetype ? 1 : 0.5 }} onClick={() => profile.archetype && finishSetup()}>
                ⚡ Iniciar como {profile.archetype ? arc.name : "..."}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0", overflow: "hidden" }}>
      {showLevelUp && <LevelUpToast level={newLevel} arc={arc} archetype={player.archetype} onDone={() => setShowLevelUp(false)} />}
      {showTutorial && <Tutorial onDone={() => setShowTutorial(false)} />}
      {showDarkDay && <DarkDayScreen arc={arc} archetype={player.archetype} playerName={player.name} onMission={(xp) => addXP(xp)} onDismiss={() => setShowDarkDay(false)} />}
      {showWeekly && <WeeklySummary player={player} arc={arc} doneMissions={doneMissions} totalMissions={missions.length} moodLog={moodLog} onClose={() => setShowWeekly(false)} />}
      {xpBurst && <XPBurst xp={xpBurst.xp} color={arc.aura} onDone={() => setXpBurst(null)} />}

      {/* Sidebar */}
      <nav style={{ width: 60, background: "#070c18", borderRight: "1px solid #1a2540", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 2, flexShrink: 0 }}>
        <div style={{ fontSize: 15, color: arc.aura, fontFamily: "'Cinzel',serif", marginBottom: 12 }}>◈</div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ width: 46, height: 50, border: "none", borderRadius: 11, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: tab === n.id ? arc.aura + "18" : "transparent", color: tab === n.id ? arc.aura : "#2d3a52", transition: "all 0.2s", fontFamily: "inherit" }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span><span style={{ fontSize: 7.5 }}>{n.l}</span>
          </button>
        ))}
        {lowMoodStreak && (
          <button onClick={() => setShowDarkDay(true)} title="Modo Día Oscuro" style={{ width: 42, height: 42, border: "1px solid #818cf833", borderRadius: 10, background: "#818cf810", color: "#818cf8", cursor: "pointer", fontSize: 14, marginTop: 4, animation: "pulse-soft 2s ease-in-out infinite" }}>🌑</button>
        )}
        <div style={{ marginTop: "auto", paddingBottom: 8, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <button onClick={() => setShowWeekly(true)} title="Resumen semanal" style={{ width: 38, height: 38, border: "1px solid #1a2035", borderRadius: 9, background: "transparent", color: "#2d3a52", cursor: "pointer", fontSize: 13 }}>📊</button>
          <button onClick={resetDay} title="Nuevo día" style={{ width: 38, height: 38, border: "1px solid #1a2035", borderRadius: 9, background: "transparent", color: "#2d3a52", cursor: "pointer", fontSize: 14 }}>↺</button>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: "auto" }}>

        {/* HOME */}
        {tab === "home" && (
          <div>
            <div style={{ position: "relative", background: arc.bg, borderBottom: `1px solid ${arc.aura}18`, padding: "22px 18px 0", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle,${arc.aura}0a,transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, maxWidth: 660, margin: "0 auto" }}>
                <div style={{ flexShrink: 0, marginBottom: -10 }}><HeroAvatar archetype={player.archetype} level={player.level} size={162} animate mood={currentMood} showFuture={true} /></div>
                <div style={{ flex: 1, paddingBottom: 22, paddingLeft: 6 }}>
                  <div style={{ fontSize: 9, color: arc.aura, letterSpacing: 4, textTransform: "uppercase", marginBottom: 3 }}>{getStageName(player.level)}</div>
                  <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, color: "#f8fafc", letterSpacing: 1, marginBottom: 2 }}>{player.name}</h1>
                  <div style={{ fontSize: 12, color: "#8892a4", marginBottom: 12 }}>{arc.name} · Nivel <span style={{ color: arc.aura, fontWeight: 700, fontSize: 15 }}>{player.level}</span></div>
                  <XPBar xp={player.xp} xpNext={player.xpNext} color={arc.aura} />
                  <div style={{ display: "flex", gap: 8, marginTop: 11, flexWrap: "wrap" }}>
                    <div style={{ border: `1px solid ${arc.aura}33`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#cbd5e1" }}>🔥 <span style={{ color: arc.aura, fontWeight: 700 }}>{player.streak}</span> días</div>
                    <div style={{ border: "1px solid #1a2035", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#8892a4" }}>◈ <span style={{ color: "#e2e8f0" }}>{doneMissions}/{missions.length}</span></div>
                    {lowMoodStreak && <div onClick={() => setShowDarkDay(true)} style={{ border: "1px solid #818cf833", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#818cf8", cursor: "pointer" }}>🌑 Día Oscuro</div>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ maxWidth: 660, margin: "0 auto", padding: "14px 15px 32px" }}>

              {/* ── SHOOTING STAR MISSION ── */}
              {starMission && (
                <div style={{ background: "linear-gradient(135deg, #1a1400, #0a0f00)", border: "1.5px solid #ffd700", borderRadius: 16, padding: "14px 18px", marginBottom: 14, boxShadow: "0 0 24px #ffd70044, 0 0 48px #ffd70018", animation: "star-pulse 2s ease-in-out infinite", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, #ffd70008, transparent)", animation: "star-sweep 2s linear infinite", pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 28, filter: "drop-shadow(0 0 8px #ffd700)" }}>🌟</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: "#ffd700", letterSpacing: 3, marginBottom: 3 }}>MISIÓN ESTRELLA FUGAZ · {starTimer}s</div>
                      <div style={{ fontSize: 13, color: "#fff9c4", fontWeight: 600, lineHeight: 1.4 }}>{starMission.title}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, color: "#ffd700", fontWeight: 800, fontFamily: "'Cinzel',serif" }}>+{starMission.xp}</div>
                      <div style={{ fontSize: 9, color: "#ffd70088" }}>XP</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, height: 3, background: "#1a1400", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(starTimer / 90) * 100}%`, background: "linear-gradient(90deg, #ffd70088, #ffd700)", borderRadius: 2, transition: "width 1s linear", boxShadow: "0 0 8px #ffd700" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => { addXP(starMission.xp); setStarMission(null); clearInterval(starIntervalRef.current); }} style={{ flex: 2, background: "#ffd700", border: "none", borderRadius: 9, padding: "9px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>¡Completar! +{starMission.xp} XP</button>
                    <button onClick={() => { setStarMission(null); clearInterval(starIntervalRef.current); }} style={{ flex: 1, background: "transparent", border: "1px solid #ffd70033", borderRadius: 9, padding: "9px", color: "#ffd70066", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Omitir</button>
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
                {[
                  { icon: "⚖️", val: bmi || "—", label: "IMC", badge: bmiLabel || "—", c: bmiColor },
                  { icon: "😴", val: `${profile.sleep}h`, label: "Sueño", badge: parseFloat(profile.sleep) >= 7 ? "Óptimo" : "Mejorar", c: parseFloat(profile.sleep) >= 7 ? "#34d399" : "#f59e0b" },
                  { icon: "⚡", val: `${profile.stress}/10`, label: "Estrés", badge: profile.stress <= 4 ? "Bajo" : profile.stress <= 6 ? "Medio" : "Alto", c: profile.stress <= 4 ? "#34d399" : profile.stress <= 6 ? "#f59e0b" : "#f87171" },
                  { icon: "💧", val: `${water}/8`, label: "Agua", badge: water >= 8 ? "¡Meta!" : `${waterGoal}L/día`, c: water >= 8 ? "#34d399" : "#60a5fa" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#0d1020", border: "1px solid #1a2035", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 17, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: "#f8fafc" }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: "#4b5563", margin: "3px 0 5px" }}>{s.label}</div>
                    <div style={{ fontSize: 9, borderRadius: 5, padding: "2px 4px", background: s.c + "20", color: s.c, fontWeight: 700 }}>{s.badge}</div>
                  </div>
                ))}
              </div>

              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>💧 Hidratación</span>
                  <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700 }}>{water}/8 vasos</span>
                </div>
                <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} onClick={() => setWater(w => i < w ? i : i + 1)} style={{ flex: 1, height: 26, borderRadius: 6, background: i < water ? "#60a5fa" : "#111828", cursor: "pointer", transition: "all 0.25s", border: `1px solid ${i < water ? "#60a5fa44" : "#1a2035"}`, boxShadow: i < water ? "0 0 6px #60a5fa55" : "none" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setWater(w => Math.max(0, w - 1))} style={S.waterBtn}>− Quitar</button>
                  <button onClick={() => setWater(w => Math.min(8, w + 1))} style={{ ...S.waterBtn, background: "#60a5fa15", borderColor: "#60a5fa33", color: "#60a5fa" }}>+ Agregar vaso</button>
                </div>
              </Card>

              <Card>
                <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 3, marginBottom: 12 }}>ESTADO DE ÁNIMO — tu avatar lo refleja</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: moodLog.length ? 10 : 0 }}>
                  {MOODS.map(m => (
                    <button key={m.v} onClick={() => logMood(m.v)} style={{ border: `1.5px solid ${mood === m.v ? arc.aura : "#1a2035"}`, borderRadius: 12, padding: "10px 12px", background: mood === m.v ? arc.aura + "18" : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ fontSize: 20 }}>{m.e}</div>
                      <div style={{ fontSize: 9, color: "#6b7a96", marginTop: 3 }}>{m.l}</div>
                    </button>
                  ))}
                </div>
                {moodLog.length > 0 && <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{moodLog.slice(-5).map((m, i) => <span key={i} style={{ background: "#111828", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#4b5563" }}>{MOODS[m.v - 1]?.e} {m.t}</span>)}</div>}
              </Card>

              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 10, color: "#4b5563", letterSpacing: 3 }}>MISIONES DE HOY</span>
                  <button onClick={() => setTab("misiones")} style={{ background: "none", border: "none", color: arc.aura, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ver todas →</button>
                </div>
                <div style={{ height: 3, background: "#0a0d1a", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: `${(doneMissions / missions.length) * 100}%`, background: `linear-gradient(90deg,${arc.aura}55,${arc.aura})`, borderRadius: 2, transition: "width 0.6s", boxShadow: `0 0 8px ${arc.aura}` }} />
                </div>
                {missions.slice(0, 4).map((m, i) => (
                  <div key={m.id} onClick={() => completeMission(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #0d1020" : "none", cursor: "pointer", opacity: m.done ? 0.4 : 1, transition: "all 0.4s ease", transform: completedAnim === i ? "scale(1.02)" : "scale(1)" }}>
                    <div style={{ width: 22, height: 22, border: `1.5px solid ${m.done ? arc.aura : "#1a2035"}`, borderRadius: 6, background: m.done ? arc.aura : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#000", fontWeight: 800, flexShrink: 0, transition: "all 0.4s", boxShadow: m.done ? `0 0 10px ${arc.aura}` : "none" }}>{m.done ? "✓" : ""}</div>
                    <span style={{ fontSize: 13, flex: 1, color: "#94a3b8" }}>{m.icon} {m.title}</span>
                    <span style={{ fontSize: 10, color: arc.aura, border: `1px solid ${arc.aura}30`, borderRadius: 5, padding: "2px 8px", fontWeight: 700 }}>+{m.xp}</span>
                  </div>
                ))}
              </Card>

              {customGoals.length > 0 && (
                <Card>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, color: "#4b5563", letterSpacing: 3 }}>METAS ÉPICAS</span>
                    <button onClick={() => setTab("metas")} style={{ background: "none", border: "none", color: arc.aura, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ver todas →</button>
                  </div>
                  {customGoals.slice(0, 2).map(g => (
                    <div key={g.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{g.emoji} {g.title}</span>
                        <span style={{ fontSize: 11, color: arc.aura, fontWeight: 700 }}>{Math.round((g.xpEarned / g.xpTotal) * 100)}%</span>
                      </div>
                      <div style={{ height: 3, background: "#0a0d1a", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min((g.xpEarned / g.xpTotal) * 100, 100)}%`, background: arc.aura, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* MISIONES */}
        {tab === "misiones" && (
          <div style={S.page}>
            <h2 style={S.ptitle}>◈ Misiones Diarias</h2>
            <p style={S.psub}>Cada acción suma XP y hace evolucionar tu personaje</p>
            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#8892a4" }}>Progreso de hoy</span>
                <span style={{ fontSize: 12, color: arc.aura, fontWeight: 700 }}>{doneMissions} / {missions.length}</span>
              </div>
              <XPBar xp={doneMissions} xpNext={missions.length} color={arc.aura} label={false} />
            </Card>
            {missions.map((m, i) => (
              <div key={m.id} style={{ background: "#0d1020", border: `1px solid ${m.done ? "#1a2035" : arc.aura + "28"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 10, transition: "all 0.4s ease", transform: completedAnim === i ? "scale(1.015)" : "scale(1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => completeMission(i)}>
                  <div style={{ width: 34, height: 34, border: `1.5px solid ${m.done ? arc.aura : "#1a2035"}`, borderRadius: 10, background: m.done ? arc.aura : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, color: m.done ? "#000" : "#8892a4", fontWeight: 800, transition: "all 0.4s", boxShadow: m.done ? `0 0 14px ${arc.aura}` : "none", opacity: m.done ? 0.7 : 1 }}>{m.done ? "✓" : m.icon}</div>
                  <div style={{ flex: 1, opacity: m.done ? 0.45 : 1 }}>
                    <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7a96", marginBottom: 4 }}>{m.sub}</div>
                    <div style={{ fontSize: 11, color: arc.aura, fontStyle: "italic", opacity: 0.8 }}>"{m.lore}"</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, opacity: m.done ? 0.4 : 1 }}>
                    <div style={{ fontSize: 13, color: arc.aura, fontWeight: 700 }}>+{m.xp} XP</div>
                    <div style={{ fontSize: 9, color: "#374151", textTransform: "capitalize", marginTop: 2 }}>{m.area}</div>
                  </div>
                </div>
                {!m.done && <WhyBox text={m.why} color={arc.aura} />}
              </div>
            ))}
          </div>
        )}

        {/* METAS */}
        {tab === "metas" && (
          <div style={S.page}>
            <h2 style={S.ptitle}>🎯 Metas Épicas</h2>
            <p style={S.psub}>Conquistas grandes convertidas en misiones semanales con XP.</p>
            <button onClick={() => setShowNewGoal(true)} style={{ width: "100%", background: arc.aura + "14", border: `1.5px dashed ${arc.aura}50`, borderRadius: 14, padding: "16px", color: arc.aura, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>＋ Crear nueva meta épica</button>

            {customGoals.length === 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#374151", letterSpacing: 3, marginBottom: 14 }}>IDEAS POPULARES</div>
                {[{ emoji: "⚖️", title: "Bajar 5 kg", desc: "Pérdida de peso saludable", type: "weight", weeks: "12" }, { emoji: "🏃", title: "Correr un medio maratón", desc: "21km de preparación", type: "marathon", weeks: "16" }, { emoji: "😴", title: "Dormir mejor", desc: "Rutina de sueño consistente", type: "sleep", weeks: "6" }, { emoji: "💪", title: "Ganar músculo", desc: "Fuerza y masa muscular", type: "muscle", weeks: "12" }].map((p, i) => (
                  <div key={i} onClick={() => { setNewGoalForm({ title: p.title, desc: p.desc, emoji: p.emoji, type: p.type, weeks: p.weeks }); setShowNewGoal(true); }} style={{ background: "#0d1020", border: "1px solid #1a2035", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 28 }}>{p.emoji}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 2 }}>{p.title}</div><div style={{ fontSize: 12, color: "#6b7a96" }}>{p.desc} · {p.weeks} semanas</div></div>
                    <div style={{ fontSize: 18, color: "#2d3a52" }}>→</div>
                  </div>
                ))}
              </div>
            )}

            {customGoals.map(g => {
              const pct = Math.min(Math.round((g.xpEarned / g.xpTotal) * 100), 100);
              return (
                <div key={g.id} style={{ background: "#0d1020", border: `1px solid ${pct >= 100 ? arc.aura + "55" : "#1a2035"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div><div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 2 }}>{g.emoji} {g.title}</div><div style={{ fontSize: 11, color: "#6b7a96" }}>{g.desc}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: arc.aura, fontWeight: 700 }}>{pct}%</div><div style={{ fontSize: 9, color: "#374151" }}>{g.xpEarned}/{g.xpTotal} XP</div></div>
                  </div>
                  <div style={{ height: 4, background: "#0a0d1a", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${arc.aura}55,${arc.aura})`, borderRadius: 2, boxShadow: `0 0 8px ${arc.aura}` }} />
                  </div>
                  {pct < 100 && g.weeklyMissions?.map((wm, i) => (
                    <div key={i} onClick={() => completeGoalMission(g.id, i)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < g.weeklyMissions.length - 1 ? "1px solid #0d1020" : "none", cursor: wm.done ? "default" : "pointer", opacity: wm.done ? 0.4 : 1 }}>
                      <div style={{ width: 20, height: 20, border: `1.5px solid ${wm.done ? arc.aura : "#1a2035"}`, borderRadius: 5, background: wm.done ? arc.aura : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#000", fontWeight: 800, flexShrink: 0, transition: "all 0.3s" }}>{wm.done ? "✓" : ""}</div>
                      <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{wm.text}</span>
                      <span style={{ fontSize: 10, color: arc.aura, fontWeight: 700 }}>+{wm.xp} XP</span>
                    </div>
                  ))}
                  {pct >= 100 && <div style={{ fontSize: 12, color: arc.aura, textAlign: "center", fontFamily: "'Cinzel',serif", letterSpacing: 2 }}>⚡ META CONQUISTADA ⚡</div>}
                </div>
              );
            })}

            {showNewGoal && (
              <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 970, backdropFilter: "blur(4px)" }}>
                <div style={{ background: "#0d1020", border: "1px solid #1a2035", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 500, animation: "slide-up 0.35s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: "#f8fafc", letterSpacing: 1 }}>Nueva Meta Épica</h3>
                    <button onClick={() => setShowNewGoal(false)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 20 }}>✕</button>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>Emoji</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["🎯", "⚖️", "🏃", "💪", "😴", "📚", "🧘", "🏊", "🚴", "✈️", "💰", "🎸"].map(e => (
                        <button key={e} onClick={() => setNewGoalForm(f => ({ ...f, emoji: e }))} style={{ width: 36, height: 36, fontSize: 17, border: `1.5px solid ${newGoalForm.emoji === e ? arc.aura : "#1a2035"}`, borderRadius: 8, background: newGoalForm.emoji === e ? arc.aura + "18" : "transparent", cursor: "pointer" }}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}><label style={S.label}>¿Cuál es tu meta?</label><input style={S.input} placeholder="ej. Correr un maratón" value={newGoalForm.title} onChange={e => setNewGoalForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div style={{ marginBottom: 14 }}><label style={S.label}>Descripción breve</label><input style={S.input} placeholder="ej. Prepararme en 16 semanas" value={newGoalForm.desc} onChange={e => setNewGoalForm(f => ({ ...f, desc: e.target.value }))} /></div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>Tipo</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[["weight", "⚖️ Peso"], ["marathon", "🏃 Resistencia"], ["sleep", "😴 Sueño"], ["muscle", "💪 Músculo"], ["custom", "🎯 Otra"]].map(([val, lbl]) => (
                        <button key={val} onClick={() => setNewGoalForm(f => ({ ...f, type: val }))} style={{ border: `1px solid ${newGoalForm.type === val ? arc.aura : "#1a2035"}`, borderRadius: 20, padding: "6px 13px", background: newGoalForm.type === val ? arc.aura + "18" : "transparent", color: newGoalForm.type === val ? arc.aura : "#6b7a96", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 22 }}><label style={S.label}>Duración: <span style={{ color: arc.aura }}>{newGoalForm.weeks} semanas</span></label><input type="range" min="2" max="24" value={newGoalForm.weeks} onChange={e => setNewGoalForm(f => ({ ...f, weeks: e.target.value }))} style={{ width: "100%", accentColor: arc.aura }} /></div>
                  <button onClick={createGoal} style={{ ...S.btn, opacity: newGoalForm.title ? 1 : 0.4, background: newGoalForm.title ? arc.aura : "#1a2035", color: newGoalForm.title ? "#000" : "#4b5563" }}>⚡ Crear meta (+25 XP)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SALUD */}
        {tab === "salud" && (
          <div style={S.page}>
            <h2 style={S.ptitle}>✦ Salud</h2>
            <p style={S.psub}>Tu cuerpo es el primer campo de batalla</p>
            <div style={{ background: "#f9731608", border: "1px solid #f9731630", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#94a3b8", lineHeight: 1.75 }}>⚕️ <strong style={{ color: "#f97316" }}>Aviso:</strong> Contenido informativo. No reemplaza consulta médica profesional.</div>
            {bmi && <Card glow={bmiColor}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#6b7a96", letterSpacing: 2, marginBottom: 4 }}>ÍNDICE DE MASA CORPORAL</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 36, color: bmiColor }}>{bmi}</div>
                  <div style={{ fontSize: 12, color: bmiColor, marginTop: 4 }}>{bmiLabel}</div>
                  <p style={{ fontSize: 11, color: "#6b7a96", marginTop: 8, lineHeight: 1.7 }}>Referencia orientativa. No considera masa muscular ni distribución de grasa.</p>
                </div>
                <div style={{ fontSize: 12, color: "#6b7a96", lineHeight: 2.4, textAlign: "right" }}>
                  <div>Peso <span style={{ color: "#94a3b8" }}>{profile.weight}kg</span></div>
                  <div>Talla <span style={{ color: "#94a3b8" }}>{profile.height}cm</span></div>
                  <div>Agua <span style={{ color: "#60a5fa" }}>{waterGoal}L/día</span></div>
                </div>
              </div>
            </Card>}
            <div style={S.section}>Plan Físico</div>
            {[
              profile.goals.includes("Perder peso") && { icon: "🚶", t: "Cardio moderado", d: "30 min de caminata rápida o bicicleta. Zona 60-70% FC máx — donde el cuerpo usa más grasa como combustible.", f: "5x/sem", c: "#34d399" },
              profile.goals.includes("Ganar músculo") && { icon: "💪", t: "Entrenamiento de fuerza", d: "Sentadillas, press, jalones. 3-4 series de 8-12 reps. El músculo se construye en el descanso — el sueño importa tanto como el entreno.", f: "3x/sem", c: "#818cf8" },
              profile.goals.includes("Más energía") && { icon: "⚡", t: "HIIT suave", d: "20 min: 30s esfuerzo alto, 90s suave. Aumenta mitocondrias y resistencia en menos tiempo.", f: "3x/sem", c: "#f59e0b" },
              { icon: "🧘", t: "Movilidad y flexibilidad", d: "15 min de estiramientos. Reduce lesiones, mejora postura y activa el sistema nervioso parasimpático.", f: "Diario", c: "#a78bfa" },
              { icon: "💧", t: `Meta: ${waterGoal}L de agua`, d: "Calculado según tu peso (33ml/kg). Distribuye a lo largo del día.", f: "Diario", c: "#60a5fa" },
            ].filter(Boolean).map((p, i) => (
              <Card key={i} style={{ borderLeft: `3px solid ${p.c}`, borderColor: p.c + "30" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                      <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{p.t}</div>
                      <span style={{ fontSize: 10, background: p.c + "22", color: p.c, borderRadius: 20, padding: "3px 10px", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{p.f}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.75 }}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={S.section}>Chequeos Recomendados</div>
            {[
              parseFloat(profile.age) >= 35 && { icon: "🩸", t: "Perfil lipídico", d: "Colesterol total, HDL, LDL y triglicéridos. Clave para prevención cardiovascular.", f: "Anual", c: "#f87171" },
              parseFloat(profile.age) >= 30 && { icon: "🔬", t: "Glucosa en ayuno", d: "Detecta prediabetes antes de que se desarrolle.", f: "Anual", c: "#f59e0b" },
              profile.conditions.includes("Diabetes") && { icon: "📊", t: "HbA1c", d: "Promedio de glucosa de los últimos 3 meses. Más útil que una glucosa aislada.", f: "Trimestral", c: "#f59e0b" },
              profile.conditions.includes("Hipertensión") && { icon: "❤️", t: "Presión en casa", d: "Mañana y noche durante 7 días. Muchos tienen presión normal en consultorio — efecto de bata blanca.", f: "Mensual", c: "#f43f5e" },
              { icon: "☀️", t: "Vitamina D y B12", d: "Deficiencias muy comunes en adultos jóvenes urbanos. Afectan ánimo, energía y sistema nervioso.", f: "Anual", c: "#facc15" },
              (profile.conditions.includes("Ansiedad") || profile.conditions.includes("Depresión")) && { icon: "💬", t: "Psicólogo o psiquiatra", d: "La terapia cognitivo-conductual tiene evidencia sólida. La herramienta más efectiva disponible.", f: "Prioritario", c: "#a78bfa" },
              { icon: "🦷", t: "Examen dental", d: "Relacionado con inflamación sistémica y salud cardiovascular.", f: "6 meses", c: "#60a5fa" },
            ].filter(Boolean).map((r, i) => (
              <Card key={i} style={{ borderLeft: `3px solid ${r.c}`, borderColor: r.c + "22" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                      <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{r.t}</div>
                      <span style={{ fontSize: 10, background: r.c + "20", color: r.c, borderRadius: 20, padding: "3px 10px", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{r.f}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.75 }}>{r.d}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MENTE */}
        {tab === "mente" && (
          <div style={S.page}>
            <h2 style={S.ptitle}>◎ Mente</h2>
            <p style={S.psub}>La batalla más importante ocurre aquí dentro</p>
            <Card glow={arc.aura}>
              <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 3, marginBottom: 8 }}>RESPIRACIÓN 4-7-8</div>
              <p style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.85, marginBottom: 4 }}>Activa el nervio vago y cambia el sistema nervioso de simpático (alerta) a parasimpático (calma) en minutos.</p>
              <p style={{ fontSize: 12, color: "#4b5563", marginBottom: 16, fontStyle: "italic" }}>Inhala 4s · Sostén 7s · Exhala 8s</p>
              {breathActive ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ width: 90, height: 90, borderRadius: "50%", border: `2px solid ${arc.aura}`, background: arc.aura + "10", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 30px ${arc.aura}55`, animation: breathPhase === "inhala" ? "expand 4s ease forwards" : breathPhase === "exhala" ? "contract 8s ease forwards" : "none" }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: arc.aura, textTransform: "uppercase", letterSpacing: 2 }}>{breathPhase}</span>
                  </div>
                  <button onClick={stopBreath} style={{ background: "transparent", border: "1px solid #1a2035", borderRadius: 8, padding: "8px 20px", color: "#6b7a96", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Detener</button>
                </div>
              ) : <button onClick={startBreath} style={{ ...S.btn, background: arc.aura, color: "#000" }}>Iniciar respiración</button>}
            </Card>
            <div style={S.section}>Prácticas con Evidencia</div>
            {[
              { icon: "🧠", t: "Meditación matutina", d: "10 min al despertar. Reduce volumen de la amígdala y fortalece la corteza prefrontal. Meta-análisis de 209 estudios (JAMA 2014) confirma reducción de ansiedad y depresión.", f: "Mañana", c: "#818cf8" },
              { icon: "✍️", t: "Journaling de gratitud", d: "3 cosas específicas buenas de hoy. Emmons & McCullough (2003): 25% más bienestar subjetivo en quienes practican gratitud semanal.", f: "Noche", c: "#f472b6" },
              { icon: "🌑", t: "Desconexión digital", d: "1h sin redes. Universidad de Pennsylvania (2018): limitar redes a 30 min/día reduce significativamente soledad y depresión.", f: "Diario", c: "#34d399" },
              { icon: "🌅", t: "Luz solar matutina", d: "10-15 min antes de las 10AM. Activa el reloj circadiano, regula cortisol y prepara melatonina nocturna. Protocolo Huberman (Stanford).", f: "Mañana", c: "#facc15" },
              parseInt(profile.stress) >= 6 && { icon: "🌬️", t: "Pausas ultradianas", d: "Cada 90 min: 3 respiraciones profundas. El cerebro opera en ciclos de ~90 min y necesita reset activo.", f: "C/90 min", c: "#60a5fa" },
            ].filter(Boolean).map((p, i) => (
              <Card key={i} style={{ borderLeft: `3px solid ${p.c}`, borderColor: p.c + "25" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                      <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{p.t}</div>
                      <span style={{ fontSize: 10, background: p.c + "22", color: p.c, borderRadius: 20, padding: "3px 10px", fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{p.f}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.8 }}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={S.section}>Lecturas Esenciales</div>
            {[
              { t: "Atomic Habits", a: "James Clear", tag: "Hábitos", c: "#34d399", d: "El sistema más práctico para construir hábitos. Diseñar el entorno correcto importa más que la fuerza de voluntad." },
              { t: "Por qué dormimos", a: "Matthew Walker", tag: "Sueño", c: "#818cf8", d: "La ciencia más actualizada del sueño. Cambia para siempre cómo ves esas 7-9 horas." },
              { t: "El poder del ahora", a: "Eckhart Tolle", tag: "Mindfulness", c: "#a78bfa", d: "La ansiedad vive en el futuro; el dolor en el pasado. La paz solo existe en el presente." },
              { t: "Los 7 hábitos", a: "Stephen Covey", tag: "Efectividad", c: "#f59e0b", d: "Desarrollo personal basado en carácter y principios universales." },
              { t: "Feeling Good", a: "David Burns", tag: "Ansiedad/TCC", c: "#60a5fa", d: "Manual de TCC accesible. Clínicamente validado para ansiedad y depresión." },
            ].map((b, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 2 }}>📖 {b.t}</div>
                    <div style={{ fontSize: 11, color: "#6b7a96", marginBottom: 6 }}>— {b.a}</div>
                    <div style={{ fontSize: 12, color: "#8892a4", lineHeight: 1.7 }}>{b.d}</div>
                  </div>
                  <span style={{ fontSize: 10, background: b.c + "20", color: b.c, borderRadius: 20, padding: "3px 10px", fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>{b.tag}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <style>{CSS}</style>
    </div>
  );
}

const S = {
  btn: { width: "100%", background: "#00ff9d", border: "none", borderRadius: 12, padding: "14px", color: "#000", fontFamily: "'Cinzel',serif", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1, transition: "all 0.3s", boxShadow: "0 0 20px #00ff9d44" },
  setupCard: { background: "#0d1428", border: "1px solid #1a2f50", borderRadius: 20, padding: "36px 28px" },
  badge: { fontSize: 9, color: "#1a3050", letterSpacing: 5, textTransform: "uppercase", marginBottom: 12 },
  stitle: { fontFamily: "'Cinzel',serif", fontSize: 22, color: "#ffffff", letterSpacing: 2, marginBottom: 8 },
  ssub: { fontSize: 13, color: "#8892a4", marginBottom: 22, lineHeight: 1.7 },
  label: { display: "block", fontSize: 10, color: "#4b5a72", letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 },
  input: { width: "100%", background: "#070c18", border: "1px solid #1a2540", borderRadius: 10, padding: "11px 13px", fontSize: 13, color: "#ffffff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  waterBtn: { flex: 1, background: "#0d1428", border: "1px solid #1a2540", borderRadius: 8, padding: "8px", color: "#6b7a96", cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  page: { maxWidth: 660, margin: "0 auto", padding: "24px 16px 40px" },
  ptitle: { fontFamily: "'Cinzel',serif", fontSize: 22, color: "#ffffff", letterSpacing: 2, marginBottom: 6 },
  psub: { fontSize: 13, color: "#8892a4", marginBottom: 20 },
  section: { fontSize: 9, color: "#1a3050", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, marginTop: 22, paddingBottom: 8, borderBottom: "1px solid #0d1428" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0a0f1e;margin:0;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:#1a2540;border-radius:3px;}
  input::placeholder{color:#1a2540;}
  button:hover{filter:brightness(1.15);}
  @keyframes aura-breathe{0%,100%{opacity:0.85;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
  @keyframes dark-breathe{0%,100%{opacity:0.4;transform:scale(0.97);}50%{opacity:0.6;transform:scale(1);}}
  @keyframes ground-pulse{0%,100%{opacity:0.7;}50%{opacity:1;transform:scaleX(1.1);}}
  @keyframes ring-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes float-p{0%{transform:translateY(0);opacity:0.3;}100%{transform:translateY(-12px);opacity:0.55;}}
  @keyframes rain-fall{0%{transform:translateY(-20px);opacity:0;}10%{opacity:0.4;}90%{opacity:0.4;}100%{transform:translateY(110vh);opacity:0;}}
  @keyframes rain-streak{0%{transform:translateY(-100%);opacity:0;}5%{opacity:1;}95%{opacity:0.6;}100%{transform:translateY(200%);opacity:0;}}
  @keyframes expand{0%{transform:scale(1);}100%{transform:scale(1.3);}}
  @keyframes contract{0%{transform:scale(1.3);}100%{transform:scale(1);}}
  @keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-5px);}}
  @keyframes pop-in{from{opacity:0;transform:scale(0.6);}to{opacity:1;transform:scale(1);}}
  @keyframes fade-up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slide-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
  @keyframes xp-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5);}30%{opacity:1;transform:translate(-50%,-80%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-120%) scale(1);}100%{opacity:0;transform:translate(-50%,-160%) scale(0.8);}}
  @keyframes pulse-soft{0%,100%{opacity:0.6;}50%{opacity:1;}}
  @keyframes future-pulse{0%,100%{opacity:0.13;}50%{opacity:0.22;}}
  @keyframes star-pulse{0%,100%{box-shadow:0 0 24px #ffd70044,0 0 48px #ffd70018;}50%{box-shadow:0 0 36px #ffd70066,0 0 72px #ffd70030;}}
  @keyframes star-sweep{0%{transform:translateX(-100%);}100%{transform:translateX(400%);}}
  @keyframes neon-flicker{0%,95%,100%{opacity:1;}96%{opacity:0.8;}97%{opacity:1;}98%{opacity:0.9;}}
  @media(max-width:600px){
    div[style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    div[style*="auto-fit, minmax(240"]{grid-template-columns:1fr!important;}
    div[style*="auto-fit, minmax(180"]{grid-template-columns:1fr!important;}
  }
`;
