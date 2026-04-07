import { useState, useEffect, useRef, useMemo } from "react";

const STORAGE_KEY = "thejourney_v3";

// ═══════════════════════════════════════════════════════════════════
// ─── RPG SYSTEM — easily extensible ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const MISSION_ATTRS = {
  1: { FUE: 3, SAB: 0, VOL: 2 },
  2: { FUE: 0, SAB: 2, VOL: 3 },
  3: { FUE: 1, SAB: 0, VOL: 1 },
  4: { FUE: 0, SAB: 4, VOL: 1 },
  5: { FUE: 0, SAB: 2, VOL: 4 },
  6: { FUE: 2, SAB: 1, VOL: 2 },
  7: { FUE: 0, SAB: 3, VOL: 2 },
  8: { FUE: 2, SAB: 1, VOL: 1 },
};

const LEVEL_TITLES = [
  { min: 1,  title: "El Desconocido",      rank: "Rango F" },
  { min: 3,  title: "Viajero Estelar",     rank: "Rango E" },
  { min: 6,  title: "Guardián del Alba",   rank: "Rango D" },
  { min: 10, title: "Forjador de Hábitos", rank: "Rango C" },
  { min: 15, title: "Caballero del Camino",rank: "Rango B" },
  { min: 20, title: "Leyenda Viviente",    rank: "Rango A" },
  { min: 30, title: "Transcendente",       rank: "Rango S" },
  { min: 50, title: "El Maestro",          rank: "Rango SS" },
];

const AVATAR_ACCESSORIES = [
  { minLevel: 1,  id: "base",         label: "Forma base",        epic: false },
  { minLevel: 3,  id: "eye_glow",     label: "Ojos brillantes",   epic: false },
  { minLevel: 5,  id: "neon_aura",    label: "Aura neón",         epic: false },
  { minLevel: 8,  id: "shoulder_pads",label: "Hombreras de luz",  epic: false },
  { minLevel: 10, id: "light_wings",  label: "Alas de luz",       epic: true  },
  { minLevel: 15, id: "crown",        label: "Corona estelar",    epic: true  },
  { minLevel: 20, id: "full_armor",   label: "Armadura completa", epic: true  },
];

const PATH_MILESTONES = [
  { xp: 0,    label: "Origen",    icon: "◈" },
  { xp: 100,  label: "Despertar", icon: "⚡" },
  { xp: 300,  label: "Forja",     icon: "🔥" },
  { xp: 600,  label: "Ascenso",   icon: "✦" },
  { xp: 1000, label: "Maestría",  icon: "👑" },
];

const ARCHETYPES = [
  { id: "warrior", name: "El Guerrero", sub: "Disciplina · Fuerza · Acción", lore: "Tu poder nace de la constancia. No esperas la motivación — la creas.", icon: "⚔", aura: "#ff4d00", aura2: "#ff7700", mainAttr: "FUE", bg: "radial-gradient(ellipse at 50% -10%, #ff4d0022 0%, transparent 65%)" },
  { id: "sage",    name: "El Sabio",    sub: "Conocimiento · Claridad · Propósito", lore: "Tu fuerza es invisible pero ilimitada. La mente es tu arma más poderosa.", icon: "✦", aura: "#00e5ff", aura2: "#0080ff", mainAttr: "SAB", bg: "radial-gradient(ellipse at 50% -10%, #00e5ff22 0%, transparent 65%)" },
  { id: "explorer",name: "El Explorador",sub: "Equilibrio · Aventura · Evolución",  lore: "Tu camino no tiene un solo destino — tiene infinitos horizontes.",        icon: "◎", aura: "#00ff9d", aura2: "#00cc7a", mainAttr: "VOL", bg: "radial-gradient(ellipse at 50% -10%, #00ff9d22 0%, transparent 65%)" },
];

const STAGE_LEVELS = [1, 11, 26, 51, 81];

const MISSIONS_DATA = [
  { id: 1, title: "Forja tu cuerpo",       sub: "20 min de movimiento consciente",    xp: 35, icon: "⚡", area: "cuerpo", difficulty: "normal", lore: "El guerrero forja su cuerpo en el fuego de la disciplina.",   why: "20 min de ejercicio elevan dopamina, serotonina y BDNF — la proteína que hace crecer tu cerebro." },
  { id: 2, title: "Silencia la tormenta",  sub: "10 min de meditación o respiración", xp: 30, icon: "◎", area: "mente",  difficulty: "normal", lore: "La mente en calma ve lo que el caos oculta.",                  why: "10 min diarios reducen el volumen de la amígdala en 8 semanas." },
  { id: 3, title: "El río de la vida",     sub: "8 vasos de agua durante el día",     xp: 15, icon: "💧", area: "cuerpo", difficulty: "easy",   lore: "Tu cuerpo es 70% agua. Trátalo como lo que es.",             why: "Deshidratación del 2% reduce capacidad cognitiva hasta 20%." },
  { id: 4, title: "Alimenta tu mente",     sub: "Lee 15 páginas de cualquier libro",  xp: 25, icon: "📖", area: "mente",  difficulty: "normal", lore: "Cada página leída es un nivel ganado en sabiduría.",          why: "15 páginas diarias = 18 libros al año." },
  { id: 5, title: "El gran silencio",      sub: "1 hora sin redes sociales",          xp: 20, icon: "🌑", area: "mente",  difficulty: "normal", lore: "Tu atención es tu recurso más escaso. Protégela.",            why: "Cada notificación interrumpe el foco ~23 min." },
  { id: 6, title: "El descanso del héroe", sub: "Duerme entre 7 y 9 horas",           xp: 40, icon: "🌙", area: "cuerpo", difficulty: "normal", lore: "Los héroes se restauran en la oscuridad.",                   why: "Dormir menos de 6h deteriora el rendimiento igual que 48h sin dormir." },
  { id: 7, title: "Crónicas del viaje",    sub: "Escribe 3 cosas buenas de hoy",      xp: 20, icon: "✍", area: "mente",  difficulty: "normal", lore: "El que no recuerda su progreso, cree que no avanza.",         why: "El cerebro recuerda 5x mejor lo malo. El journaling reentrena ese sesgo." },
  { id: 8, title: "La caminata del sabio", sub: "Camina 5-10 min después de comer",   xp: 15, icon: "🚶", area: "cuerpo", difficulty: "easy",   lore: "Los grandes pensadores caminaban.",                          why: "10 min post-comida reduce el pico de glucosa hasta 30%." },
  { id: 9,  title: "ÉPICA: Entrena 45 min",sub: "Sesión completa de fuerza o cardio", xp: 80, icon: "🔥", area: "cuerpo", difficulty: "epic",   lore: "Solo los forjados conocen este fuego.",                      why: "45 min de entrenamiento intenso activan adaptaciones que sesiones cortas no logran." },
  { id: 10, title: "ÉPICA: Ayuno digital", sub: "4 horas completamente sin pantallas",xp: 90, icon: "⚫", area: "mente",  difficulty: "epic",   lore: "El silencio absoluto revela verdades.",                      why: "El cerebro necesita períodos prolongados sin estímulos para consolidar aprendizajes profundos." },
];

const CONDITIONS = ["Diabetes","Hipertensión","Ansiedad","Depresión","Colesterol alto","Hipotiroidismo","Insomnio","Sedentarismo"];
const GOALS = ["Perder peso","Ganar músculo","Reducir estrés","Mejorar sueño","Más energía","Salud mental","Más disciplina","Comer mejor"];
const MOODS = [{ e:"😔",l:"Bajo",v:1 },{ e:"😐",l:"Regular",v:2 },{ e:"🙂",l:"Bien",v:3 },{ e:"😄",l:"Excelente",v:4 }];
const NAV = [{ id:"home",icon:"⌂",l:"Inicio" },{ id:"misiones",icon:"◈",l:"Misiones" },{ id:"metas",icon:"🎯",l:"Metas" },{ id:"salud",icon:"✦",l:"Salud" },{ id:"mente",icon:"◎",l:"Mente" }];

const STAR_MISSIONS = [
  { title:"¡Estrella Fugaz! Sal a caminar 10 min ahora",       xp:80 },
  { title:"¡Estrella Fugaz! Bebe 2 vasos de agua YA",          xp:50 },
  { title:"¡Estrella Fugaz! Haz 20 sentadillas ahora mismo",   xp:70 },
  { title:"¡Estrella Fugaz! Respira profundo 5 veces",         xp:45 },
  { title:"¡Estrella Fugaz! Escribe algo que te haga feliz",   xp:55 },
  { title:"¡Estrella Fugaz! Estírate por 3 minutos ahora",     xp:60 },
];

const INTRO_SLIDES = [
  { icon:"⚡", title:"Sube de nivel en la vida real",   desc:"Cada hábito suma XP y atributos reales. Tu robot evoluciona cuando tú evolucionas.",                                color:"#ff4d00" },
  { icon:"🎭", title:"Tu robot crece contigo",          desc:"Desbloquea auras, alas y armadura. Las misiones épicas son las únicas que activan los efectos más brillantes.",   color:"#00e5ff" },
  { icon:"🌟", title:"Misiones Estrella Fugaz",         desc:"Eventos temporales de 90 segundos con XP extra. Si los pierdes, se van para siempre.",                           color:"#ffd700" },
  { icon:"🌑", title:"El Modo Día Oscuro",              desc:"Cuando los días difíciles lleguen, la app lo detecta y activa un modo de recuperación épico.",                    color:"#a78bfa" },
];

const TUTORIAL_STEPS = [
  { icon:"⌂", title:"Tu base de operaciones",  desc:"Robot, XP, atributos y misiones. El Diario del Robot te habla según tu estado real." },
  { icon:"◈", title:"Misiones + Épicas",        desc:"Las misiones ÉPICAS son las únicas que desbloquean los efectos más brillantes. No se puede hacer trampa." },
  { icon:"🎯", title:"Atributos dinámicos",     desc:"Fuerza, Sabiduría y Voluntad crecen según qué misiones completas." },
  { icon:"🌑", title:"El Modo Día Oscuro",      desc:"Si reportas ánimo bajo varios días, se activa recuperación especial." },
];

// ─── Storage ───────────────────────────────────────────────────────
function save(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }
function load() { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } }

// ─── RPG Helpers ───────────────────────────────────────────────────
function getLevelTitle(level) {
  let t = LEVEL_TITLES[0];
  for (const lt of LEVEL_TITLES) { if (level >= lt.min) t = lt; }
  return t;
}
function getUnlockedAccessories(level, epicDone) {
  return AVATAR_ACCESSORIES.filter(a => level >= a.minLevel && (!a.epic || epicDone));
}
function getHybridClass(archetype, attrs) {
  const arc = ARCHETYPES.find(a => a.id === archetype);
  if (!arc) return null;
  const mainVal = attrs[arc.mainAttr] || 0;
  const others = Object.entries(attrs).filter(([k]) => k !== arc.mainAttr);
  const dominant = others.find(([, v]) => v > mainVal);
  if (!dominant) return null;
  const map = { FUE:{ label:"Guerrero Híbrido", color:"#ff4d00" }, SAB:{ label:"Sabio Híbrido", color:"#00e5ff" }, VOL:{ label:"Explorador Híbrido", color:"#00ff9d" } };
  return map[dominant[0]] || null;
}

// ─── Star Field ────────────────────────────────────────────────────
function StarField() {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 0.5, dur: Math.random() * 20 + 15,
    delay: Math.random() * 15, opacity: Math.random() * 0.6 + 0.1,
  })), []);
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {stars.map(s => (
        <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#ffffff", opacity:s.opacity, animation:`star-drift ${s.dur}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
      <div style={{ position:"absolute", top:"10%", left:"15%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, #00e5ff08, transparent 70%)", animation:"nebula-drift 25s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"60%", right:"10%", width:150, height:150, borderRadius:"50%", background:"radial-gradient(circle, #ff4d0006, transparent 70%)", animation:"nebula-drift 30s 5s ease-in-out infinite reverse" }} />
    </div>
  );
}

// ─── Path Bar ──────────────────────────────────────────────────────
function PathBar({ totalXP, color }) {
  const maxXP = PATH_MILESTONES[PATH_MILESTONES.length - 1].xp;
  const pct = Math.min((totalXP / maxXP) * 100, 100);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:9, color:"#1a3050", letterSpacing:3, marginBottom:8 }}>SENDERO DEL VIAJE</div>
      <div style={{ position:"relative", height:8, background:"#070c18", borderRadius:4, overflow:"visible" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${color}44, ${color})`, borderRadius:4, transition:"width 1s ease", boxShadow:`0 0 12px ${color}, 0 0 24px ${color}55`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg, transparent, #ffffff22, transparent)", animation:"path-shimmer 2s linear infinite", borderRadius:4 }} />
        </div>
        {PATH_MILESTONES.map((m, i) => {
          const pos = (m.xp / maxXP) * 100;
          const reached = totalXP >= m.xp;
          return (
            <div key={i} style={{ position:"absolute", left:`${pos}%`, top:"50%", transform:"translate(-50%, -50%)", zIndex:2 }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:reached ? color : "#0d1428", border:`2px solid ${reached ? color : "#1a2540"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, boxShadow:reached ? `0 0 10px ${color}` : "none", transition:"all 0.5s ease" }}>
                {reached ? m.icon : "·"}
              </div>
              <div style={{ position:"absolute", top:18, left:"50%", transform:"translateX(-50%)", fontSize:7, color:reached ? color : "#1a3050", whiteSpace:"nowrap" }}>{m.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ height:28 }} />
    </div>
  );
}

// ─── Robot Diary ───────────────────────────────────────────────────
function RobotDiary({ playerName, water, mood, doneMissions, totalMissions, attrs, arc, level }) {
  const [open, setOpen] = useState(false);
  const title = getLevelTitle(level);
  const message = useMemo(() => {
    if (mood <= 1) return `Navegante ${playerName}... detecto energía baja en tu sistema. Esto también es parte del viaje. Una sola acción pequeña puede cambiar el rumbo.`;
    if (water < 3) return `Navegante ${playerName}, mis sensores detectan deshidratación. Tu cerebro necesita agua para funcionar al máximo. ¿Bebes un vaso ahora?`;
    if (doneMissions === 0) return `Navegante ${playerName}, el camino espera. Cada misión completada fortalece no solo tu cuerpo — también tu identidad como ${arc?.name || "viajero"}.`;
    if (doneMissions === totalMissions) return `¡Extraordinario, Navegante ${playerName}! Has completado todas las misiones de hoy. Siento cómo tu aura se intensifica. Eres digno del título "${title.title}".`;
    if (attrs.SAB > attrs.FUE && attrs.SAB > attrs.VOL) return `Navegante ${playerName}, tu Sabiduría domina. Veo en ti al Sabio que se forma. Sigue nutriendo tu mente — ese es tu camino real.`;
    if (attrs.FUE > attrs.SAB && attrs.FUE > attrs.VOL) return `Navegante ${playerName}, tu Fuerza es innegable. El cuerpo que forjas hoy es el escudo de tu futuro.`;
    return `Navegante ${playerName}, vas bien. ${doneMissions} de ${totalMissions} misiones completadas. El viaje continúa — cada paso cuenta.`;
  }, [mood, water, doneMissions, totalMissions, attrs, playerName, arc, title, level]);
  return (
    <div style={{ background:"#0d1428", border:`1px solid ${arc?.aura||"#1a2540"}33`, borderRadius:16, padding:"14px 16px", marginBottom:12, cursor:"pointer" }} onClick={() => setOpen(o => !o)}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ fontSize:20, filter:`drop-shadow(0 0 6px ${arc?.aura||"#00ff9d"})` }}>🤖</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:arc?.aura||"#00ff9d", letterSpacing:2, marginBottom:2 }}>DIARIO DEL ROBOT</div>
          <div style={{ fontSize:12, color:"#8892a4" }}>{open ? "Toca para cerrar" : "El robot tiene algo que decirte..."}</div>
        </div>
        <div style={{ fontSize:14, color:"#1a3050" }}>{open ? "▲" : "▼"}</div>
      </div>
      {open && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${arc?.aura||"#1a2540"}22` }}>
          <p style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.85, fontStyle:"italic" }}>"{message}"</p>
          <div style={{ marginTop:8, fontSize:10, color:"#1a3050" }}>— Robot de The Journey · {title.title} · {title.rank}</div>
        </div>
      )}
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────
function HeroAvatar({ archetype, level=1, size=200, animate=true, mood=3, darkDay=false, showFuture=false, epicDone=false, attrs={} }) {
  const a = ARCHETYPES.find(x => x.id === archetype) || ARCHETYPES[0];
  const stage = STAGE_LEVELS.findLastIndex(l => level >= l);
  const marks = { warrior:"⚔", sage:"✦", explorer:"◎" };
  const li = darkDay ? 0.08 : Math.min(0.25 + stage * 0.12 + level * 0.006, 0.9);
  const bl = darkDay ? 0.05 : Math.min(0.18 + stage * 0.08, 0.6);
  const ac = darkDay ? "#4b5563" : a.aura;
  const eyeH = mood <= 1 ? 2.5 : mood >= 4 ? 4.5 : 3.8;
  const eyeW = mood <= 1 ? 4 : mood >= 4 ? 3.2 : 3.5;
  const mouthPath = mood <= 1 ? "M 100 88 Q 110 84 120 88" : mood >= 4 ? "M 100 86 Q 110 92 120 86" : "M 102 88 Q 110 90 118 88";
  const acc = getUnlockedAccessories(level, epicDone);
  const hasWings = acc.some(a => a.id === "light_wings");
  const hasCrown = acc.some(a => a.id === "crown");
  const hasFullArmor = acc.some(a => a.id === "full_armor");
  const hasNeonAura = acc.some(a => a.id === "neon_aura");
  const hasShoulderPads = acc.some(a => a.id === "shoulder_pads");
  const hybrid = getHybridClass(archetype, attrs);

  return (
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none" style={{ overflow:"visible" }}>
      <defs>
        <radialGradient id={`BL-${archetype}-${level}`} cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor={ac} stopOpacity={li}/>
          <stop offset="50%" stopColor={ac} stopOpacity={li*0.3}/>
          <stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`GL-${archetype}-${level}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={li*0.9}/>
          <stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`BD-${archetype}`} cx="50%" cy="20%" r="75%">
          <stop offset="0%" stopColor={darkDay?"#1a1a2a":hasFullArmor?"#1a2840":"#2e3050"}/>
          <stop offset="55%" stopColor={darkDay?"#0e0e18":"#16182e"}/>
          <stop offset="100%" stopColor="#09090f"/>
        </radialGradient>
        <radialGradient id={`EL-${archetype}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={bl}/>
          <stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <filter id={`G1-${archetype}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`G2-${archetype}`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="11" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`G3-${archetype}`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="20"/>
        </filter>
      </defs>

      <ellipse cx="110" cy="115" rx="95" ry="110" fill={ac} fillOpacity={li*0.1} filter={`url(#G3-${archetype})`}/>
      <ellipse cx="110" cy="115" rx="74" ry="90" fill={`url(#BL-${archetype}-${level})`} style={animate?{animation:darkDay?"dark-breathe 6s ease-in-out infinite":"aura-breathe 4s ease-in-out infinite"}:{}}/>
      <ellipse cx="110" cy="202" rx={46+stage*10} ry={11+stage*3} fill={`url(#GL-${archetype}-${level})`} style={animate?{animation:"ground-pulse 3s ease-in-out infinite"}:{}}/>

      {hasNeonAura&&!darkDay&&<ellipse cx="110" cy="115" rx="92" ry="108" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1" strokeOpacity="0.3" style={{animation:"neon-aura-spin 8s linear infinite"}}/>}

      {showFuture&&!darkDay&&(
        <g opacity="0.12" style={{animation:"future-pulse 4s ease-in-out infinite"}}>
          <ellipse cx="110" cy="118" rx="88" ry="106" fill={ac} fillOpacity="0.06"/>
          <rect x="76" y="150" width="20" height="50" rx="10" fill={ac}/>
          <rect x="124" y="150" width="20" height="50" rx="10" fill={ac}/>
          <rect x="70" y="98" width="80" height="60" rx="16" fill={ac}/>
          <ellipse cx="70" cy="112" rx="16" ry="13" fill={ac}/>
          <ellipse cx="150" cy="112" rx="16" ry="13" fill={ac}/>
          <rect x="52" y="108" width="18" height="52" rx="9" fill={ac}/>
          <rect x="150" y="108" width="18" height="52" rx="9" fill={ac}/>
          <ellipse cx="110" cy="70" rx="32" ry="34" fill={ac}/>
          <ellipse cx="110" cy="36" rx="34" ry="12" fill={ac}/>
          <ellipse cx="110" cy="110" rx="112" ry="112" stroke={ac} strokeWidth="1" fill="none"/>
        </g>
      )}

      {hasWings&&!darkDay&&(
        <g style={{animation:"wings-flap 3s ease-in-out infinite"}}>
          <path d="M 62 115 C 20 80, 5 50, 30 30 C 45 20, 60 40, 62 115" fill={ac} fillOpacity="0.15" stroke={ac} strokeWidth="0.8" strokeOpacity="0.5"/>
          <path d="M 158 115 C 200 80, 215 50, 190 30 C 175 20, 160 40, 158 115" fill={ac} fillOpacity="0.15" stroke={ac} strokeWidth="0.8" strokeOpacity="0.5"/>
          <ellipse cx="40" cy="70" rx="12" ry="18" fill={ac} fillOpacity="0.2" filter={`url(#G2-${archetype})`} transform="rotate(-20,40,70)"/>
          <ellipse cx="180" cy="70" rx="12" ry="18" fill={ac} fillOpacity="0.2" filter={`url(#G2-${archetype})`} transform="rotate(20,180,70)"/>
        </g>
      )}

      {darkDay&&animate&&[30,70,110,150,190,50,90,130,170].map((x,i)=>(
        <rect key={i} x={x} y={-10} width="1.2" height="8" rx="1" fill="#4b5563" opacity="0.35" style={{animation:`rain-fall ${1.2+(i%4)*0.3}s ${i*0.18}s linear infinite`}}/>
      ))}

      {stage>=3&&!darkDay&&<ellipse cx="110" cy="110" rx="108" ry="108" stroke={ac} strokeWidth="0.7" fill="none" opacity="0.25" style={{animation:"ring-spin 14s linear infinite"}}/>}
      {stage>=4&&!darkDay&&<ellipse cx="110" cy="110" rx="96" ry="96" stroke={ac} strokeWidth="0.4" fill="none" opacity="0.15" style={{animation:"ring-spin 9s linear infinite reverse"}}/>}

      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="#131325"/>
      <rect x="119" y="157" width="17" height="42" rx="8.5" fill="#131325"/>
      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl*0.9}/>
      <rect x="119" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl*0.9}/>
      {stage>=2&&!darkDay&&<>
        <rect x="82" y="185" width="21" height="14" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5"/>
        <rect x="117" y="185" width="21" height="14" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5"/>
      </>}

      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#BD-${archetype})`}/>
      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#EL-${archetype})`}/>
      <rect x="79" y="107" width="62" height="57" rx="13" fill="none" stroke={ac} strokeWidth={stage>=1?0.8:0.3} strokeOpacity={stage>=1?0.35:0.1}/>
      {hasFullArmor&&!darkDay&&<rect x="79" y="107" width="62" height="57" rx="13" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1.2" strokeOpacity="0.5"/>}
      {stage>=3&&!hasFullArmor&&!darkDay&&<rect x="89" y="114" width="42" height="30" rx="7" fill={ac} fillOpacity="0.09" stroke={ac} strokeWidth="0.7" strokeOpacity="0.45"/>}

      <ellipse cx="79" cy="117" rx="12" ry="10" fill="#131325"/>
      <ellipse cx="141" cy="117" rx="12" ry="10" fill="#131325"/>
      <ellipse cx="79" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage>=2?0.45:0.14}/>
      <ellipse cx="141" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage>=2?0.45:0.14}/>
      {hasShoulderPads&&!darkDay&&<>
        <ellipse cx="79" cy="117" rx="15" ry="13" fill="none" stroke={ac} strokeWidth="1.5" strokeOpacity="0.6"/>
        <ellipse cx="141" cy="117" rx="15" ry="13" fill="none" stroke={ac} strokeWidth="1.5" strokeOpacity="0.6"/>
        <ellipse cx="79" cy="117" rx="5" ry="4" fill={ac} fillOpacity="0.3"/>
        <ellipse cx="141" cy="117" rx="5" ry="4" fill={ac} fillOpacity="0.3"/>
      </>}

      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="#131325"/>
      <rect x="142" y="114" width="15" height="44" rx="7.5" fill="#131325"/>
      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl*0.8}/>
      <rect x="142" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl*0.8}/>
      {stage>=3&&!darkDay&&<>
        <rect x="61" y="146" width="19" height="13" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6"/>
        <rect x="140" y="146" width="19" height="13" rx="5" fill="#161628" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6"/>
      </>}

      <rect x="103" y="94" width="14" height="17" rx="7" fill="#131325"/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="#131325"/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill={ac} fillOpacity={bl*0.35} filter={`url(#G2-${archetype})`}/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="none" stroke={ac} strokeWidth={stage>=2?0.8:0.3} strokeOpacity={stage>=2&&!darkDay?0.32:0.1}/>

      {hasCrown&&!darkDay&&(
        <g>
          <path d="M 90 54 L 95 42 L 110 50 L 125 42 L 130 54 Z" fill={ac} fillOpacity="0.6" stroke={ac} strokeWidth="0.8"/>
          <ellipse cx="110" cy="42" rx="30" ry="10" fill={ac} fillOpacity="0.12" filter={`url(#G2-${archetype})`}/>
          {[95,110,125].map((x,i)=><circle key={i} cx={x} cy={i===1?41:43} r="2.5" fill={ac} opacity="0.9" filter={`url(#G1-${archetype})`}/>)}
        </g>
      )}

      {hybrid&&!darkDay&&<>
        <circle cx="79" cy="105" r="4" fill={hybrid.color} opacity="0.8" filter={`url(#G1-${archetype})`} style={{animation:"hybrid-pulse 2s ease-in-out infinite"}}/>
        <circle cx="141" cy="105" r="4" fill={hybrid.color} opacity="0.8" filter={`url(#G1-${archetype})`} style={{animation:"hybrid-pulse 2s 0.5s ease-in-out infinite"}}/>
      </>}

      <path d={`M ${103-eyeW} ${74-eyeH-5} Q 103 ${74-eyeH-7} ${103+eyeW} ${74-eyeH-5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay?0.2:0.5} strokeLinecap="round"/>
      <path d={`M ${117-eyeW} ${74-eyeH-5} Q 117 ${74-eyeH-7} ${117+eyeW} ${74-eyeH-5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay?0.2:0.5} strokeLinecap="round"/>
      <ellipse cx="103" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay?0.4:1} filter={`url(#G1-${archetype})`}/>
      <ellipse cx="117" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay?0.4:1} filter={`url(#G1-${archetype})`}/>
      <ellipse cx="103" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay?0.06:stage>=1?0.22:0.1} filter={`url(#G2-${archetype})`}/>
      <ellipse cx="117" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay?0.06:stage>=1?0.22:0.1} filter={`url(#G2-${archetype})`}/>
      {!darkDay&&<>
        <ellipse cx="104.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.7"/>
        <ellipse cx="118.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.7"/>
      </>}
      <ellipse cx="110" cy="82" rx="1.2" ry="1" fill={ac} opacity={darkDay?0.15:0.3}/>
      <path d={mouthPath} stroke={ac} strokeWidth="1.4" fill="none" strokeOpacity={darkDay?0.2:mood>=4?0.9:0.55} strokeLinecap="round"/>
      <text x="110" y="138" textAnchor="middle" fontSize={stage>=3?17:13} fill={ac} opacity={darkDay?0.2:stage>=2?1:0.65} filter={`url(#G1-${archetype})`}>{marks[archetype]}</text>
      {!darkDay&&Array.from({length:stage>=2?8:stage>=1?4:0},(_,i)=>{
        const angle=(i/(stage>=2?8:4))*Math.PI*2;
        const r=62+(i%3)*14;
        return <circle key={i} cx={110+Math.cos(angle)*r} cy={118+Math.sin(angle)*r*0.5} r={1.7+(i%2)*1.1} fill={ac} opacity={0.35+(i%3)*0.12} style={{animation:`float-p ${2.4+i*0.38}s ${i*0.28}s ease-in-out infinite alternate`}}/>;
      })}
    </svg>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────
function XPBar({ xp, xpNext, color, label=true }) {
  return (
    <div>
      {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:10,color:"#4b5a72",letterSpacing:2}}>EXPERIENCIA</span>
        <span style={{fontSize:10,color,fontWeight:700}}>{xp} / {xpNext} XP</span>
      </div>}
      <div style={{height:4,background:"#070c18",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.min((xp/xpNext)*100,100)}%`,background:`linear-gradient(90deg,${color}55,${color})`,borderRadius:2,transition:"width 1s ease",boxShadow:`0 0 12px ${color}`}}/>
      </div>
    </div>
  );
}

function Card({ children, style={}, glow }) {
  return <div style={{background:"#0d1428",border:`1px solid ${glow?glow+"50":"#1a2540"}`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:glow?`0 0 28px ${glow}22`:  "none",position:"relative",zIndex:1,...style}}>{children}</div>;
}

function Pill({ label, active, color, onClick }) {
  return <button onClick={onClick} style={{border:`1px solid ${active?color+"70":"#1a2540"}`,borderRadius:20,padding:"7px 14px",background:active?color+"18":"transparent",color:active?color:"#6b7a96",cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>{label}</button>;
}

function WhyBox({ text, color }) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{marginTop:10}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",color:color||"#6b7a96",fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,padding:0}}>
        <span style={{fontSize:9}}>{open?"▲":"▼"}</span> ¿Por qué funciona?
      </button>
      {open&&<p style={{fontSize:12,color:"#8892a4",lineHeight:1.8,marginTop:8,paddingTop:8,borderTop:"1px solid #141828"}}>{text}</p>}
    </div>
  );
}

function XPBurst({ xp, color, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,1200);return()=>clearTimeout(t);},[onDone]);
  return <div style={{position:"fixed",top:"45%",left:"50%",zIndex:990,pointerEvents:"none",animation:"xp-burst 1.2s ease forwards"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:32,color,fontWeight:900,textShadow:`0 0 30px ${color}`,whiteSpace:"nowrap"}}>+{xp} XP</div></div>;
}

function AttrGain({ attrs, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,1600);return()=>clearTimeout(t);},[onDone]);
  return (
    <div style={{position:"fixed",top:"55%",left:"50%",transform:"translateX(-50%)",zIndex:989,pointerEvents:"none",display:"flex",gap:8,animation:"fade-up 1.6s ease forwards"}}>
      {Object.entries(attrs).filter(([k,v])=>v>0&&k!=="key").map(([k,v])=>(
        <div key={k} style={{background:"#0d1428ee",border:"1px solid #1a2540",borderRadius:8,padding:"4px 10px",fontSize:11,color:k==="FUE"?"#ff4d00":k==="SAB"?"#00e5ff":"#00ff9d",fontWeight:700}}>+{v} {k}</div>
      ))}
    </div>
  );
}

function LevelUpToast({ level, arc, archetype, titleInfo, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,3600);return()=>clearTimeout(t);},[onDone]);
  return (
    <div style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)"}}>
      <div style={{textAlign:"center",animation:"pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{fontSize:48,marginBottom:8,filter:`drop-shadow(0 0 28px ${arc.aura})`}}>⚡</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:arc.aura,letterSpacing:6,marginBottom:4}}>NIVEL ALCANZADO</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:82,color:"#fff",lineHeight:1,textShadow:`0 0 60px ${arc.aura}, 0 0 120px ${arc.aura}55`}}>{level}</div>
        <div style={{fontSize:16,color:arc.aura,marginTop:6,fontFamily:"'Cinzel',serif",letterSpacing:2}}>{titleInfo.title}</div>
        <div style={{fontSize:12,color:"#4b5a72",marginTop:4,letterSpacing:3}}>{titleInfo.rank}</div>
        <div style={{display:"flex",justifyContent:"center",marginTop:20}}>
          <HeroAvatar archetype={archetype} level={level} size={100} animate={false}/>
        </div>
      </div>
    </div>
  );
}

function DarkDayScreen({ arc, archetype, playerName, onMission, onDismiss }) {
  const [phase,setPhase]=useState(0);
  return (
    <div style={{position:"fixed",inset:0,zIndex:980,background:"linear-gradient(180deg,#03030a 0%,#080810 60%,#0a0a14 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {Array.from({length:18},(_,i)=><div key={i} style={{position:"absolute",left:`${(i*5.5)%100}%`,top:-20,width:1,height:"100vh",background:"linear-gradient(to bottom, transparent, #4b556322, transparent)",animation:`rain-streak ${2+(i%5)*0.4}s ${i*0.22}s linear infinite`}}/>)}
      </div>
      <button onClick={onDismiss} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:"#374151",cursor:"pointer",fontSize:20}}>✕</button>
      {phase===0&&(
        <div style={{textAlign:"center",maxWidth:340,animation:"fade-up 0.6s ease"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><HeroAvatar archetype={archetype} level={1} size={140} animate darkDay mood={1}/></div>
          <div style={{fontSize:9,color:"#374151",letterSpacing:5,marginBottom:10}}>MODO DÍA OSCURO</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:"#94a3b8",letterSpacing:2,marginBottom:16,lineHeight:1.4}}>Los días oscuros también forman parte del camino</h2>
          <p style={{fontSize:13,color:"#4b5563",lineHeight:1.9,marginBottom:28}}>Hola <strong style={{color:"#6b7a96"}}>{playerName}</strong>. No vas a perder tu racha. Solo necesitas hacer <strong style={{color:"#818cf8"}}>una cosa pequeña</strong>.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>setPhase(1)} style={{background:"#818cf820",border:"1px solid #818cf844",borderRadius:12,padding:"13px",color:"#818cf8",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer",letterSpacing:1}}>Activar misión de recuperación</button>
            <button onClick={onDismiss} style={{background:"none",border:"none",color:"#374151",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Estoy bien, continuar</button>
          </div>
        </div>
      )}
      {phase===1&&(
        <div style={{textAlign:"center",maxWidth:360,animation:"fade-up 0.4s ease"}}>
          <div style={{fontSize:28,marginBottom:14,filter:"drop-shadow(0 0 16px #818cf8)"}}>🌑</div>
          <div style={{fontSize:9,color:"#374151",letterSpacing:5,marginBottom:10}}>MISIÓN DE RECUPERACIÓN · +100 XP</div>
          <h3 style={{fontFamily:"'Cinzel',serif",fontSize:19,color:"#94a3b8",letterSpacing:2,marginBottom:20}}>El primer paso</h3>
          {["Toma un vaso de agua ahora mismo","Sal al exterior aunque sea 5 minutos","Escribe una sola cosa por la que estés vivo hoy"].map((s,i)=>(
            <div key={i} style={{background:"#0d1428",border:"1px solid #1a2540",borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
              <div style={{width:28,height:28,borderRadius:8,background:"#818cf820",border:"1px solid #818cf844",display:"flex",alignItems:"center",justifyContent:"center",color:"#818cf8",fontSize:13,flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:13,color:"#8892a4",lineHeight:1.5}}>{s}</span>
            </div>
          ))}
          <p style={{fontSize:12,color:"#374151",lineHeight:1.8,marginTop:16,marginBottom:24,fontStyle:"italic"}}>"El guerrero no es quien nunca cae.<br/>Es quien se levanta cada vez."</p>
          <button onClick={()=>{onMission(100);onDismiss();}} style={{width:"100%",background:"#818cf8",border:"none",borderRadius:12,padding:"14px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1}}>✓ Completar misión (+100 XP)</button>
        </div>
      )}
    </div>
  );
}

function WeeklySummary({ player, arc, doneMissions, totalMissions, moodLog, attrs, onClose }) {
  const avgMood=moodLog.length?(moodLog.reduce((s,m)=>s+m.v,0)/moodLog.length).toFixed(1):"—";
  const moodEmoji=avgMood>=3.5?"😄":avgMood>=2.5?"🙂":avgMood>=1.5?"😐":"😔";
  const pct=Math.round((doneMissions/totalMissions)*100);
  const titleInfo=getLevelTitle(player.level);
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:975,backdropFilter:"blur(8px)",padding:20}}>
      <div style={{background:"#0d1428",border:`1px solid ${arc.aura}33`,borderRadius:24,padding:"28px 24px",maxWidth:380,width:"100%",animation:"pop-in 0.45s ease"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:9,color:arc.aura,letterSpacing:5,marginBottom:8}}>RESUMEN SEMANAL</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:20,color:"#fff",marginBottom:2}}>{player.name}</h2>
          <div style={{fontSize:12,color:arc.aura}}>{titleInfo.title} · {titleInfo.rank}</div>
          <div style={{display:"flex",justifyContent:"center",marginTop:12}}><HeroAvatar archetype={player.archetype} level={player.level} size={90} animate={false} attrs={attrs}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[{icon:"⚡",val:`${player.xp} XP`,label:"Experiencia",c:arc.aura},{icon:"🔥",val:`${player.streak}`,label:"Días racha",c:"#ff4d00"},{icon:"◈",val:`${pct}%`,label:"Misiones",c:"#00ff9d"},{icon:moodEmoji,val:avgMood,label:"Ánimo medio",c:"#00e5ff"}].map((s,i)=>(
            <div key={i} style={{background:"#070c18",border:"1px solid #1a2540",borderRadius:12,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:s.c,marginBottom:2}}>{s.val}</div>
              <div style={{fontSize:10,color:"#4b5a72"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#070c18",border:"1px solid #1a2540",borderRadius:12,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontSize:9,color:"#1a3050",letterSpacing:3,marginBottom:10}}>ATRIBUTOS TOTALES</div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[["FUE","#ff4d00","💪"],["SAB","#00e5ff","📖"],["VOL","#00ff9d","⚡"]].map(([k,c,ic])=>(
              <div key={k} style={{textAlign:"center"}}>
                <div style={{fontSize:16}}>{ic}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:c}}>{attrs[k]||0}</div>
                <div style={{fontSize:9,color:"#1a3050",letterSpacing:1}}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:arc.aura+"10",border:`1px solid ${arc.aura}22`,borderRadius:12,padding:"12px 16px",marginBottom:16,textAlign:"center"}}>
          <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.8,fontStyle:"italic"}}>
            {pct>=80?`"Semana extraordinaria, Navegante. El ${arc.name} en ti está despertando."`:pct>=50?`"Más de la mitad del camino. El progreso es progreso."`:'"Cada semana es una nueva oportunidad. El viaje continúa."'}
          </p>
        </div>
        <button onClick={onClose} style={{width:"100%",background:arc.aura,border:"none",borderRadius:12,padding:"13px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1}}>Continuar el viaje →</button>
      </div>
    </div>
  );
}

function IntroSlider({ onDone }) {
  const [idx,setIdx]=useState(0);
  const s=INTRO_SLIDES[idx];
  return (
    <div style={{position:"fixed",inset:0,background:"#0a0f1e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:990,padding:28}}>
      <StarField/>
      <button onClick={onDone} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:"#374151",fontSize:12,cursor:"pointer",fontFamily:"inherit",zIndex:2}}>Saltar</button>
      {idx===0?(
        <div style={{display:"flex",gap:24,alignItems:"flex-end",marginBottom:16}}>
          {[{a:"warrior",lv:1},{a:"explorer",lv:10},{a:"sage",lv:26}].map((p,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <HeroAvatar archetype={p.a} level={p.lv} size={i===1?110:76} animate={i===1} showFuture={i===2}/>
              <div style={{fontSize:9,color:ARCHETYPES.find(a=>a.id===p.a)?.aura,letterSpacing:2,marginTop:4}}>Nv. {p.lv}</div>
              <div style={{fontSize:8,color:"#374151",marginTop:1}}>{getLevelTitle(p.lv).title}</div>
            </div>
          ))}
        </div>
      ):<div style={{fontSize:50,marginBottom:20,filter:`drop-shadow(0 0 20px ${s.color})`,zIndex:2}}>{s.icon}</div>}
      <div style={{textAlign:"center",maxWidth:320,animation:"fade-up 0.4s ease",zIndex:2}}>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:21,color:"#fff",letterSpacing:2,marginBottom:12,lineHeight:1.35}}>{s.title}</h2>
        <p style={{fontSize:13,color:"#8892a4",lineHeight:1.85}}>{s.desc}</p>
      </div>
      <div style={{display:"flex",gap:8,margin:"28px 0 22px",zIndex:2}}>
        {INTRO_SLIDES.map((_,i)=><div key={i} onClick={()=>setIdx(i)} style={{width:i===idx?22:7,height:7,borderRadius:4,background:i===idx?s.color:"#1a2540",cursor:"pointer",transition:"all 0.3s"}}/>)}
      </div>
      <button onClick={idx===INTRO_SLIDES.length-1?onDone:()=>setIdx(i=>i+1)} style={{background:s.color,border:"none",borderRadius:12,padding:"13px 36px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1,minWidth:200,zIndex:2}}>
        {idx===INTRO_SLIDES.length-1?"¡Comenzar! →":"Siguiente →"}
      </button>
    </div>
  );
}

function Tutorial({ onDone }) {
  const [idx,setIdx]=useState(0);
  const s=TUTORIAL_STEPS[idx];
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:980,backdropFilter:"blur(3px)",padding:24}}>
      <div style={{background:"#0d1428",border:"1px solid #1a2540",borderRadius:20,padding:"28px 24px",maxWidth:340,width:"100%",animation:"pop-in 0.35s ease"}}>
        <div style={{fontSize:32,textAlign:"center",marginBottom:12}}>{s.icon}</div>
        <h3 style={{fontFamily:"'Cinzel',serif",fontSize:17,color:"#fff",textAlign:"center",marginBottom:12,letterSpacing:1}}>{s.title}</h3>
        <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.85,textAlign:"center",marginBottom:22}}>{s.desc}</p>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
          {TUTORIAL_STEPS.map((_,i)=><div key={i} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?"#00ff9d":"#1a2540",transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {idx>0&&<button onClick={()=>setIdx(i=>i-1)} style={{flex:1,background:"#141828",border:"1px solid #1a2540",borderRadius:10,padding:"11px",color:"#6b7a96",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>← Atrás</button>}
          <button onClick={idx===TUTORIAL_STEPS.length-1?onDone:()=>setIdx(i=>i+1)} style={{flex:2,background:"#00ff9d",border:"none",borderRadius:10,padding:"11px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer"}}>
            {idx===TUTORIAL_STEPS.length-1?"¡Entendido!":"Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MedDisclaimer({ onAccept }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,padding:20,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#0d1428",border:"1px solid #ff4d00aa",borderRadius:20,padding:"32px 26px",maxWidth:420,width:"100%"}}>
        <div style={{fontSize:28,textAlign:"center",marginBottom:12}}>⚕️</div>
        <h3 style={{fontFamily:"'Cinzel',serif",fontSize:16,color:"#fff",textAlign:"center",marginBottom:16,letterSpacing:2}}>Aviso Importante</h3>
        <p style={{fontSize:13,color:"#8892a4",lineHeight:1.9,marginBottom:14}}><strong style={{color:"#cbd5e1"}}>The Journey</strong> es una herramienta de apoyo al bienestar basada en evidencia general. <strong style={{color:"#cbd5e1"}}>No reemplaza la atención médica profesional.</strong></p>
        <p style={{fontSize:13,color:"#8892a4",lineHeight:1.9,marginBottom:24}}>Ante síntomas o dudas médicas, <strong style={{color:"#ff4d00"}}>consulta siempre a un profesional antes de cambiar tu rutina.</strong></p>
        <button onClick={onAccept} style={{width:"100%",background:"#ff4d00",border:"none",borderRadius:12,padding:"13px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1}}>Entendido, continuar →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [step,setStep]=useState(0);
  const [profile,setProfile]=useState({name:"",age:"",weight:"",height:"",sleep:"7",stress:"5",conditions:[],goals:[],archetype:null});
  const [player,setPlayer]=useState(null);
  const [tab,setTab]=useState("home");
  const [missions,setMissions]=useState(MISSIONS_DATA.map(m=>({...m,done:false})));
  const [customGoals,setCustomGoals]=useState([]);
  const [mood,setMood]=useState(null);
  const [moodLog,setMoodLog]=useState([]);
  const [water,setWater]=useState(0);
  const [attrs,setAttrs]=useState({FUE:0,SAB:0,VOL:0});
  const [totalXP,setTotalXP]=useState(0);
  const [epicDone,setEpicDone]=useState(false);
  const [showLevelUp,setShowLevelUp]=useState(false);
  const [newLevel,setNewLevel]=useState(null);
  const [showDisclaimer,setShowDisclaimer]=useState(false);
  const [showIntro,setShowIntro]=useState(false);
  const [showTutorial,setShowTutorial]=useState(false);
  const [showDarkDay,setShowDarkDay]=useState(false);
  const [showWeekly,setShowWeekly]=useState(false);
  const [xpBurst,setXpBurst]=useState(null);
  const [attrGain,setAttrGain]=useState(null);
  const [completedAnim,setCompletedAnim]=useState(null);
  const [showNewGoal,setShowNewGoal]=useState(false);
  const [newGoalForm,setNewGoalForm]=useState({title:"",desc:"",emoji:"🎯",type:"custom",weeks:"8"});
  const [starMission,setStarMission]=useState(null);
  const [starTimer,setStarTimer]=useState(0);
  const [breathActive,setBreathActive]=useState(false);
  const [breathPhase,setBreathPhase]=useState("inhala");
  const breathRef=useRef(null);
  const starIntervalRef=useRef(null);

  useEffect(()=>{
    const saved=load();
    if(saved){
      if(saved.profile)setProfile(saved.profile);
      if(saved.player){setPlayer(saved.player);setStep(5);}
      if(saved.missions)setMissions(saved.missions);
      if(saved.customGoals)setCustomGoals(saved.customGoals);
      if(saved.water!==undefined)setWater(saved.water);
      if(saved.moodLog)setMoodLog(saved.moodLog);
      if(saved.attrs)setAttrs(saved.attrs);
      if(saved.totalXP!==undefined)setTotalXP(saved.totalXP);
      if(saved.epicDone)setEpicDone(saved.epicDone);
    }
  },[]);

  useEffect(()=>{
    if(step<5&&!player)return;
    save({profile,player,missions,customGoals,water,moodLog,attrs,totalXP,epicDone});
  },[profile,player,missions,customGoals,water,moodLog,attrs,totalXP,epicDone]);

  useEffect(()=>{
    if(!player)return;
    const delay=(8+Math.random()*7)*60*1000;
    const t=setTimeout(()=>{
      const m=STAR_MISSIONS[Math.floor(Math.random()*STAR_MISSIONS.length)];
      setStarMission(m);setStarTimer(90);
      starIntervalRef.current=setInterval(()=>{
        setStarTimer(t=>{if(t<=1){clearInterval(starIntervalRef.current);setStarMission(null);return 0;}return t-1;});
      },1000);
    },delay);
    return()=>{clearTimeout(t);clearInterval(starIntervalRef.current);};
  },[player?.level]);

  const arc=ARCHETYPES.find(a=>a.id===(profile.archetype||player?.archetype||"explorer"));
  const lowMoodStreak=moodLog.length>=3&&moodLog.slice(-3).every(m=>m.v<=1);
  const doneMissions=missions.filter(m=>m.done).length;
  const currentMood=mood||(moodLog.length?moodLog[moodLog.length-1].v:3);
  const titleInfo=getLevelTitle(player?.level||1);
  const hybrid=getHybridClass(player?.archetype,attrs);
  const bmi=profile.weight&&profile.height?(parseFloat(profile.weight)/Math.pow(parseFloat(profile.height)/100,2)).toFixed(1):null;
  const bmiLabel=!bmi?"":bmi<18.5?"Bajo peso":bmi<25?"Normal":bmi<30?"Sobrepeso":"Obesidad";
  const bmiColor=!bmi?"#6b7a96":bmi<18.5?"#60a5fa":bmi<25?"#00ff9d":bmi<30?"#f59e0b":"#f87171";
  const waterGoal=Math.round((parseFloat(profile.weight)||70)*0.033*10)/10;

  function toggleArr(k,v){setProfile(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));}

  function finishSetup(){
    const a=ARCHETYPES.find(x=>x.id===profile.archetype);
    setPlayer({name:profile.name,archetype:profile.archetype,level:1,xp:0,xpNext:100,streak:1,stats:{...a.stat},joinedAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})});
    setShowDisclaimer(true);
  }

  function addXP(gain,missionId=null){
    setXpBurst({xp:gain,key:Date.now()});
    setTotalXP(t=>t+gain);
    if(missionId&&MISSION_ATTRS[missionId]){
      const gained=MISSION_ATTRS[missionId];
      setAttrs(a=>({FUE:a.FUE+gained.FUE,SAB:a.SAB+gained.SAB,VOL:a.VOL+gained.VOL}));
      if(Object.values(gained).some(v=>v>0))setAttrGain({...gained,key:Date.now()});
    }
    setPlayer(p=>{
      if(!p)return p;
      const nx=p.xp+gain;
      const up=nx>=p.xpNext;
      const nl=up?p.level+1:p.level;
      if(up){setNewLevel(nl);setShowLevelUp(true);}
      return{...p,xp:up?nx-p.xpNext:nx,xpNext:up?Math.round(p.xpNext*1.5):p.xpNext,level:nl};
    });
  }

  function completeMission(idx){
    if(missions[idx].done)return;
    const m=missions[idx];
    setMissions(ms=>ms.map((x,i)=>i===idx?{...x,done:true}:x));
    setCompletedAnim(idx);
    setTimeout(()=>setCompletedAnim(null),700);
    if(m.difficulty==="epic")setEpicDone(true);
    addXP(m.xp,m.id);
  }

  function logMood(v){
    setMood(v);
    const nl=[...moodLog.slice(-11),{v,t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}];
    setMoodLog(nl);
    if(nl.length>=3&&nl.slice(-3).every(m=>m.v<=1))setTimeout(()=>setShowDarkDay(true),800);
  }

  function resetDay(){
    setMissions(MISSIONS_DATA.map(m=>({...m,done:false})));
    setWater(0);setMood(null);
    setPlayer(p=>p?{...p,streak:p.streak+1}:p);
  }

  function startBreath(){
    setBreathActive(true);
    const phases=[{n:"inhala",d:4000},{n:"sostén",d:7000},{n:"exhala",d:8000}];
    let i=0;setBreathPhase(phases[0].n);
    function cycle(){i=(i+1)%3;setBreathPhase(phases[i].n);breathRef.current=setTimeout(cycle,phases[i].d);}
    breathRef.current=setTimeout(cycle,phases[0].d);
  }
  function stopBreath(){setBreathActive(false);clearTimeout(breathRef.current);}

  function genWeeklyMissions(type){
    const plans={
      weight:[{text:"Registra tu peso hoy",xp:10},{text:"Elimina refrescos esta semana",xp:30},{text:"Camina 30 min (3 veces)",xp:40},{text:"Verduras en cada comida",xp:20}],
      marathon:[{text:"Corre 2km sin parar",xp:30},{text:"Ejercicios de pierna (2 días)",xp:25},{text:"Duerme 8h para recuperación",xp:20},{text:"Elige ruta de entrenamiento",xp:25}],
      sleep:[{text:"Duerme a la misma hora 5 días",xp:40},{text:"Sin pantallas 1h antes de dormir",xp:30},{text:"Oscuridad total en tu cuarto",xp:15},{text:"Anota calidad de sueño",xp:15}],
      muscle:[{text:"Entrena 3 días (fuerza)",xp:50},{text:"Proteína en cada comida",xp:25},{text:"Duerme 8h para síntesis muscular",xp:25}],
      custom:[{text:"Define 3 acciones concretas",xp:20},{text:"Toma la primera acción hoy",xp:40},{text:"Registra tu avance",xp:20},{text:"Comparte tu meta",xp:20}],
    };
    return(plans[type]||plans.custom).map(m=>({...m,done:false}));
  }

  function createGoal(){
    const goal={id:Date.now(),title:newGoalForm.title,desc:newGoalForm.desc,emoji:newGoalForm.emoji,type:newGoalForm.type,xpTotal:parseInt(newGoalForm.weeks)*100,xpEarned:0,weeklyMissions:genWeeklyMissions(newGoalForm.type),createdAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long"})};
    setCustomGoals(g=>[...g,goal]);
    setShowNewGoal(false);
    setNewGoalForm({title:"",desc:"",emoji:"🎯",type:"custom",weeks:"8"});
    addXP(25);
  }

  function completeGoalMission(goalId,mIdx){
    const goal=customGoals.find(g=>g.id===goalId);
    if(!goal||goal.weeklyMissions[mIdx].done)return;
    const xp=goal.weeklyMissions[mIdx].xp;
    setCustomGoals(gs=>gs.map(g=>g.id!==goalId?g:{...g,weeklyMissions:g.weeklyMissions.map((m,i)=>i===mIdx?{...m,done:true}:m),xpEarned:(g.xpEarned||0)+xp}));
    addXP(xp);
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if(step<5) return (
    <div style={{minHeight:"100vh",background:"#0a0f1e",display:"flex",alignItems:"flex-start",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:"#e2e8f0",padding:"32px 16px 60px",overflowY:"auto",position:"relative"}}>
      <StarField/>
      {showIntro&&<IntroSlider onDone={()=>setShowIntro(false)}/>}
      {showDisclaimer&&<MedDisclaimer onAccept={()=>{setShowDisclaimer(false);setStep(5);setShowTutorial(true);}}/>}
      <div style={{width:"100%",maxWidth:step===4?880:460,position:"relative",zIndex:1}}>

        {step===0&&(
          <div style={{textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:20}}><HeroAvatar archetype="explorer" level={10} size={160} mood={4} showFuture/></div>
            <div style={{fontSize:9,color:"#1a3050",letterSpacing:6,marginBottom:10}}>COMIENZA TU HISTORIA</div>
            <h1 style={{fontFamily:"'Cinzel',serif",fontSize:50,fontWeight:900,color:"#ffffff",letterSpacing:8,lineHeight:0.95,marginBottom:14,textShadow:"0 0 40px #00e5ff33"}}>THE<br/>JOURNEY</h1>
            <p style={{fontSize:14,color:"#8892a4",lineHeight:1.9,marginBottom:28}}>Tu vida como un RPG.<br/>Cada hábito te hace subir de nivel en la vida real.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:28}}>
              {[["⚡","Misiones diarias"],["🎯","Metas épicas"],["✦","Salud integrada"],["🌟","Estrella Fugaz"],["🤖","Diario del Robot"]].map(([ic,lb])=>(
                <div key={lb} style={{background:"#0d1428",border:"1px solid #1a2540",borderRadius:20,padding:"6px 14px",fontSize:12,color:"#8892a4"}}>{ic} {lb}</div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button style={S.btn} onClick={()=>setStep(1)}>Comenzar el viaje →</button>
              <button onClick={()=>setShowIntro(true)} style={{background:"none",border:"1px solid #1a2540",borderRadius:12,padding:"12px",color:"#6b7a96",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>¿Cómo funciona? Ver intro</button>
            </div>
          </div>
        )}

        {step===1&&(
          <div style={S.setupCard}>
            <div style={S.badge}>1 de 4</div>
            <h2 style={S.stitle}>Tu identidad</h2>
            <p style={S.ssub}>Estos datos personalizan tu plan y salud</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:18}}>
              {[["Nombre o alias","name","text","¿Cómo te llamamos?"],["Edad","age","number","años"],["Peso (kg)","weight","number","kg"],["Talla (cm)","height","number","cm"]].map(([lbl,key,type,ph])=>(
                <div key={key}><label style={S.label}>{lbl}</label><input style={S.input} type={type} placeholder={ph} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/></div>
              ))}
            </div>
            <label style={S.label}>Horas de sueño: <span style={{color:arc.aura}}>{profile.sleep}h</span></label>
            <input type="range" min="4" max="12" value={profile.sleep} onChange={e=>setProfile(p=>({...p,sleep:e.target.value}))} style={{width:"100%",accentColor:arc.aura,marginBottom:18}}/>
            <label style={S.label}>Nivel de estrés: <span style={{color:arc.aura}}>{profile.stress}/10</span></label>
            <input type="range" min="1" max="10" value={profile.stress} onChange={e=>setProfile(p=>({...p,stress:e.target.value}))} style={{width:"100%",accentColor:arc.aura,marginBottom:26}}/>
            <button style={{...S.btn,opacity:profile.name&&profile.age?1:0.35}} onClick={()=>profile.name&&profile.age&&setStep(2)}>Siguiente →</button>
          </div>
        )}

        {step===2&&(
          <div style={S.setupCard}>
            <div style={S.badge}>2 de 4</div>
            <h2 style={S.stitle}>Tu salud</h2>
            <p style={S.ssub}>Selecciona condiciones que apliquen (opcional)</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{CONDITIONS.map(c=><Pill key={c} label={c} active={profile.conditions.includes(c)} color={arc.aura} onClick={()=>toggleArr("conditions",c)}/>)}</div>
            <button style={S.btn} onClick={()=>setStep(3)}>Siguiente →</button>
          </div>
        )}

        {step===3&&(
          <div style={S.setupCard}>
            <div style={S.badge}>3 de 4</div>
            <h2 style={S.stitle}>Tus objetivos</h2>
            <p style={S.ssub}>¿Qué quieres conquistar en este viaje?</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{GOALS.map(g=><Pill key={g} label={g} active={profile.goals.includes(g)} color={arc.aura} onClick={()=>toggleArr("goals",g)}/>)}</div>
            <button style={{...S.btn,opacity:profile.goals.length?1:0.35}} onClick={()=>profile.goals.length&&setStep(4)}>Siguiente →</button>
          </div>
        )}

        {step===4&&(
          <div>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={S.badge}>4 de 4</div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:28,color:"#fff",letterSpacing:3,marginBottom:8}}>Elige tu arquetipo</h2>
              <p style={{fontSize:13,color:"#8892a4"}}>Tu origen define tus atributos dominantes</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginBottom:28}}>
              {ARCHETYPES.map(a=>{
                const sel=profile.archetype===a.id;
                return(
                  <div key={a.id} onClick={()=>setProfile(p=>({...p,archetype:a.id}))} style={{background:"#0d1428",border:`1px solid ${sel?a.aura+"55":"#1a2540"}`,borderRadius:18,padding:"24px 16px 20px",cursor:"pointer",transition:"all 0.35s",boxShadow:sel?`0 0 40px ${a.aura}25`:"none",transform:sel?"translateY(-6px)":"none",textAlign:"center",position:"relative"}}>
                    {sel&&<div style={{position:"absolute",inset:0,borderRadius:18,background:`radial-gradient(ellipse at 50% 0%, ${a.aura}10, transparent 70%)`,pointerEvents:"none"}}/>}
                    <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><HeroAvatar archetype={a.id} level={sel?32:1} size={100} animate={sel} mood={sel?4:3}/></div>
                    <div style={{fontSize:11,color:a.aura,letterSpacing:3,textTransform:"uppercase",marginBottom:5}}>{a.icon} {a.name}</div>
                    <div style={{fontSize:10,color:"#6b7a96",marginBottom:6}}>{a.sub}</div>
                    <div style={{fontSize:10,color:a.aura+"88",marginBottom:10}}>Atributo dominante: {a.mainAttr}</div>
                    <p style={{fontSize:11,color:"#4b5a72",lineHeight:1.7}}>{a.lore}</p>
                    {sel&&<div style={{marginTop:14,fontSize:10,background:a.aura,color:"#000",borderRadius:20,padding:"5px 0",fontWeight:800,letterSpacing:2}}>✓ SELECCIONADO</div>}
                  </div>
                );
              })}
            </div>
            <div style={{textAlign:"center"}}>
              <button style={{...S.btn,maxWidth:360,background:profile.archetype?arc.aura:"#1a2540",color:profile.archetype?"#000":"#4b5a72",opacity:profile.archetype?1:0.5,boxShadow:profile.archetype?`0 0 20px ${arc.aura}44`:"none"}} onClick={()=>profile.archetype&&finishSetup()}>
                ⚡ Iniciar como {profile.archetype?arc.name:"..."}
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
    <div style={{display:"flex",height:"100vh",background:"#0a0f1e",fontFamily:"'DM Sans',sans-serif",color:"#e2e8f0",overflow:"hidden",position:"relative"}}>
      <StarField/>
      {showLevelUp&&<LevelUpToast level={newLevel} arc={arc} archetype={player.archetype} titleInfo={getLevelTitle(newLevel)} onDone={()=>setShowLevelUp(false)}/>}
      {showTutorial&&<Tutorial onDone={()=>setShowTutorial(false)}/>}
      {showDarkDay&&<DarkDayScreen arc={arc} archetype={player.archetype} playerName={player.name} onMission={(xp)=>addXP(xp)} onDismiss={()=>setShowDarkDay(false)}/>}
      {showWeekly&&<WeeklySummary player={player} arc={arc} doneMissions={doneMissions} totalMissions={missions.length} moodLog={moodLog} attrs={attrs} onClose={()=>setShowWeekly(false)}/>}
      {xpBurst&&<XPBurst xp={xpBurst.xp} color={arc.aura} onDone={()=>setXpBurst(null)}/>}
      {attrGain&&<AttrGain attrs={attrGain} onDone={()=>setAttrGain(null)}/>}

      {/* Sidebar */}
      <nav style={{width:60,background:"#070c18cc",backdropFilter:"blur(8px)",borderRight:"1px solid #1a2540",display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 0",gap:2,flexShrink:0,position:"relative",zIndex:10}}>
        <div style={{fontSize:15,color:arc.aura,fontFamily:"'Cinzel',serif",marginBottom:12,textShadow:`0 0 10px ${arc.aura}`}}>◈</div>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{width:46,height:50,border:"none",borderRadius:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:tab===n.id?arc.aura+"22":"transparent",color:tab===n.id?arc.aura:"#2d3a52",transition:"all 0.2s",fontFamily:"inherit",boxShadow:tab===n.id?`0 0 12px ${arc.aura}33`:"none"}}>
            <span style={{fontSize:15}}>{n.icon}</span><span style={{fontSize:7.5}}>{n.l}</span>
          </button>
        ))}
        {lowMoodStreak&&<button onClick={()=>setShowDarkDay(true)} style={{width:42,height:42,border:"1px solid #818cf833",borderRadius:10,background:"#818cf810",color:"#818cf8",cursor:"pointer",fontSize:14,marginTop:4,animation:"pulse-soft 2s ease-in-out infinite"}}>🌑</button>}
        <div style={{marginTop:"auto",paddingBottom:8,display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
          <button onClick={()=>setShowWeekly(true)} title="Resumen" style={{width:38,height:38,border:"1px solid #1a2540",borderRadius:9,background:"transparent",color:"#2d3a52",cursor:"pointer",fontSize:13}}>📊</button>
          <button onClick={resetDay} title="Nuevo día" style={{width:38,height:38,border:"1px solid #1a2540",borderRadius:9,background:"transparent",color:"#2d3a52",cursor:"pointer",fontSize:14}}>↺</button>
        </div>
      </nav>

      <main style={{flex:1,overflow:"auto",position:"relative",zIndex:1}}>

        {/* HOME */}
        {tab==="home"&&(
          <div>
            <div style={{position:"relative",background:arc.bg,borderBottom:`1px solid ${arc.aura}20`,padding:"22px 18px 0",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-60,right:-60,width:240,height:240,borderRadius:"50%",background:`radial-gradient(circle,${arc.aura}0c,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,maxWidth:660,margin:"0 auto"}}>
                <div style={{flexShrink:0,marginBottom:-10}}>
                  <HeroAvatar archetype={player.archetype} level={player.level} size={162} animate mood={currentMood} showFuture epicDone={epicDone} attrs={attrs}/>
                </div>
                <div style={{flex:1,paddingBottom:22,paddingLeft:6}}>
                  <div style={{fontSize:9,color:arc.aura,letterSpacing:3,textTransform:"uppercase",marginBottom:2,textShadow:`0 0 8px ${arc.aura}`}}>{titleInfo.title}</div>
                  <div style={{fontSize:9,color:"#1a3050",letterSpacing:2,marginBottom:3}}>{titleInfo.rank}</div>
                  <h1 style={{fontFamily:"'Cinzel',serif",fontSize:20,color:"#ffffff",letterSpacing:1,marginBottom:2}}>{player.name}</h1>
                  <div style={{fontSize:12,color:"#8892a4",marginBottom:12}}>
                    {arc.name} · Nivel <span style={{color:arc.aura,fontWeight:700,fontSize:15,textShadow:`0 0 8px ${arc.aura}`}}>{player.level}</span>
                    {hybrid&&<span style={{fontSize:10,color:hybrid.color,marginLeft:8,background:hybrid.color+"15",borderRadius:6,padding:"2px 7px",border:`1px solid ${hybrid.color}33`}}>{hybrid.label}</span>}
                  </div>
                  <XPBar xp={player.xp} xpNext={player.xpNext} color={arc.aura}/>
                  <div style={{display:"flex",gap:8,marginTop:11,flexWrap:"wrap"}}>
                    <div style={{border:`1px solid ${arc.aura}33`,borderRadius:8,padding:"5px 10px",fontSize:12,color:"#cbd5e1"}}>🔥 <span style={{color:arc.aura,fontWeight:700}}>{player.streak}</span> días</div>
                    <div style={{border:"1px solid #1a2540",borderRadius:8,padding:"5px 10px",fontSize:12,color:"#8892a4"}}>◈ <span style={{color:"#e2e8f0"}}>{doneMissions}/{missions.length}</span></div>
                    {lowMoodStreak&&<div onClick={()=>setShowDarkDay(true)} style={{border:"1px solid #818cf833",borderRadius:8,padding:"5px 10px",fontSize:12,color:"#818cf8",cursor:"pointer"}}>🌑 Día Oscuro</div>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{maxWidth:660,margin:"0 auto",padding:"14px 15px 32px"}}>

              {/* Star mission */}
              {starMission&&(
                <div style={{background:"linear-gradient(135deg,#1a1400,#0a0f00)",border:"1.5px solid #ffd700",borderRadius:16,padding:"14px 18px",marginBottom:14,boxShadow:"0 0 24px #ffd70044",animation:"star-pulse 2s ease-in-out infinite",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,#ffd70008,transparent)",animation:"star-sweep 2s linear infinite",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:28,filter:"drop-shadow(0 0 8px #ffd700)"}}>🌟</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:"#ffd700",letterSpacing:3,marginBottom:3}}>ESTRELLA FUGAZ · {starTimer}s</div>
                      <div style={{fontSize:13,color:"#fff9c4",fontWeight:600,lineHeight:1.4}}>{starMission.title}</div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:14,color:"#ffd700",fontWeight:800,fontFamily:"'Cinzel',serif"}}>+{starMission.xp}</div><div style={{fontSize:9,color:"#ffd70088"}}>XP</div></div>
                  </div>
                  <div style={{marginTop:10,height:3,background:"#1a1400",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(starTimer/90)*100}%`,background:"linear-gradient(90deg,#ffd70088,#ffd700)",borderRadius:2,transition:"width 1s linear",boxShadow:"0 0 8px #ffd700"}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={()=>{addXP(starMission.xp);setStarMission(null);clearInterval(starIntervalRef.current);}} style={{flex:2,background:"#ffd700",border:"none",borderRadius:9,padding:"9px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:12,cursor:"pointer"}}>¡Completar! +{starMission.xp} XP</button>
                    <button onClick={()=>{setStarMission(null);clearInterval(starIntervalRef.current);}} style={{flex:1,background:"transparent",border:"1px solid #ffd70033",borderRadius:9,padding:"9px",color:"#ffd70066",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Omitir</button>
                  </div>
                </div>
              )}

              {/* Path bar */}
              <Card><PathBar totalXP={totalXP} color={arc.aura}/></Card>

              {/* Robot diary */}
              <RobotDiary playerName={player.name} water={water} mood={currentMood} doneMissions={doneMissions} totalMissions={missions.length} attrs={attrs} arc={arc} level={player.level}/>

              {/* Attributes */}
              <Card>
                <div style={{fontSize:10,color:"#1a3050",letterSpacing:3,marginBottom:12}}>ATRIBUTOS RPG</div>
                <div style={{display:"flex",gap:10}}>
                  {[["FUE","#ff4d00","💪","Fuerza"],["SAB","#00e5ff","📖","Sabiduría"],["VOL","#00ff9d","⚡","Voluntad"]].map(([k,c,ic,lbl])=>(
                    <div key={k} style={{flex:1,background:"#070c18",border:`1px solid ${c}22`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                      <div style={{fontSize:16,marginBottom:4}}>{ic}</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:c,textShadow:`0 0 8px ${c}`}}>{attrs[k]}</div>
                      <div style={{fontSize:9,color:"#1a3050",marginTop:3,letterSpacing:1}}>{lbl}</div>
                    </div>
                  ))}
                </div>
                {hybrid&&<div style={{marginTop:12,padding:"8px 12px",background:hybrid.color+"10",border:`1px solid ${hybrid.color}30`,borderRadius:10,fontSize:12,color:hybrid.color,textAlign:"center"}}>✦ {hybrid.label} detectado — tu robot tiene un accesorio especial</div>}
              </Card>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                {[
                  {icon:"⚖️",val:bmi||"—",label:"IMC",badge:bmiLabel||"—",c:bmiColor},
                  {icon:"😴",val:`${profile.sleep}h`,label:"Sueño",badge:parseFloat(profile.sleep)>=7?"Óptimo":"Mejorar",c:parseFloat(profile.sleep)>=7?"#00ff9d":"#f59e0b"},
                  {icon:"⚡",val:`${profile.stress}/10`,label:"Estrés",badge:profile.stress<=4?"Bajo":profile.stress<=6?"Medio":"Alto",c:profile.stress<=4?"#00ff9d":profile.stress<=6?"#f59e0b":"#f87171"},
                  {icon:"💧",val:`${water}/8`,label:"Agua",badge:water>=8?"¡Meta!":`${waterGoal}L`,c:water>=8?"#00ff9d":"#00e5ff"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#0d1428",border:"1px solid #1a2540",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                    <div style={{fontSize:17,marginBottom:4}}>{s.icon}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#ffffff"}}>{s.val}</div>
                    <div style={{fontSize:9,color:"#4b5a72",margin:"3px 0 5px"}}>{s.label}</div>
                    <div style={{fontSize:9,borderRadius:5,padding:"2px 4px",background:s.c+"20",color:s.c,fontWeight:700,boxShadow:`0 0 6px ${s.c}33`}}>{s.badge}</div>
                  </div>
                ))}
              </div>

              {/* Water */}
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:13,color:"#94a3b8"}}>💧 Hidratación</span>
                  <span style={{fontSize:12,color:"#00e5ff",fontWeight:700,textShadow:"0 0 8px #00e5ff"}}>{water}/8 vasos</span>
                </div>
                <div style={{display:"flex",gap:5,marginBottom:10}}>
                  {Array.from({length:8},(_,i)=>(
                    <div key={i} onClick={()=>setWater(w=>i<w?i:i+1)} style={{flex:1,height:26,borderRadius:6,background:i<water?"#00e5ff":"#111828",cursor:"pointer",transition:"all 0.25s",border:`1px solid ${i<water?"#00e5ff44":"#1a2540"}`,boxShadow:i<water?"0 0 8px #00e5ff55":"none"}}/>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setWater(w=>Math.max(0,w-1))} style={S.waterBtn}>− Quitar</button>
                  <button onClick={()=>setWater(w=>Math.min(8,w+1))} style={{...S.waterBtn,background:"#00e5ff15",borderColor:"#00e5ff33",color:"#00e5ff"}}>+ Agregar vaso</button>
                </div>
              </Card>

              {/* Mood */}
              <Card>
                <div style={{fontSize:10,color:"#1a3050",letterSpacing:3,marginBottom:12}}>ESTADO DE ÁNIMO — tu robot lo refleja</div>
                <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:moodLog.length?10:0}}>
                  {MOODS.map(m=>(
                    <button key={m.v} onClick={()=>logMood(m.v)} style={{border:`1.5px solid ${mood===m.v?arc.aura:"#1a2540"}`,borderRadius:12,padding:"10px 12px",background:mood===m.v?arc.aura+"18":"transparent",cursor:"pointer",transition:"all 0.2s",boxShadow:mood===m.v?`0 0 12px ${arc.aura}44`:"none"}}>
                      <div style={{fontSize:20}}>{m.e}</div>
                      <div style={{fontSize:9,color:"#6b7a96",marginTop:3}}>{m.l}</div>
                    </button>
                  ))}
                </div>
                {moodLog.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{moodLog.slice(-5).map((m,i)=><span key={i} style={{background:"#0d1428",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#4b5a72",border:"1px solid #1a2540"}}>{MOODS[m.v-1]?.e} {m.t}</span>)}</div>}
              </Card>

              {/* Missions preview */}
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontSize:10,color:"#1a3050",letterSpacing:3}}>MISIONES DE HOY</span>
                  <button onClick={()=>setTab("misiones")} style={{background:"none",border:"none",color:arc.aura,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Ver todas →</button>
                </div>
                <div style={{height:3,background:"#070c18",borderRadius:2,overflow:"hidden",marginBottom:12}}>
                  <div style={{height:"100%",width:`${(doneMissions/missions.length)*100}%`,background:`linear-gradient(90deg,${arc.aura}55,${arc.aura})`,borderRadius:2,transition:"width 0.6s",boxShadow:`0 0 10px ${arc.aura}`}}/>
                </div>
                {missions.slice(0,4).map((m,i)=>(
                  <div key={m.id} onClick={()=>completeMission(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<3?"1px solid #0d1428":"none",cursor:"pointer",opacity:m.done?0.4:1,transition:"all 0.4s ease",transform:completedAnim===i?"scale(1.02)":"scale(1)"}}>
                    <div style={{width:22,height:22,border:`1.5px solid ${m.done?arc.aura:"#1a2540"}`,borderRadius:6,background:m.done?arc.aura:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.4s",boxShadow:m.done?`0 0 10px ${arc.aura}`:"none"}}>{m.done?"✓":""}</div>
                    <span style={{fontSize:13,flex:1,color:"#94a3b8"}}>{m.icon} {m.title}</span>
                    {m.difficulty==="epic"&&<span style={{fontSize:9,color:"#ffd700",background:"#ffd70015",border:"1px solid #ffd70033",borderRadius:5,padding:"2px 7px",marginRight:4}}>ÉPICA</span>}
                    <span style={{fontSize:10,color:arc.aura,border:`1px solid ${arc.aura}30`,borderRadius:5,padding:"2px 8px",fontWeight:700}}>+{m.xp}</span>
                  </div>
                ))}
              </Card>

              {/* Goals preview */}
              {customGoals.length>0&&(
                <Card>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <span style={{fontSize:10,color:"#1a3050",letterSpacing:3}}>METAS ÉPICAS</span>
                    <button onClick={()=>setTab("metas")} style={{background:"none",border:"none",color:arc.aura,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Ver todas →</button>
                  </div>
                  {customGoals.slice(0,2).map(g=>(
                    <div key={g.id} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:13,color:"#94a3b8"}}>{g.emoji} {g.title}</span>
                        <span style={{fontSize:11,color:arc.aura,fontWeight:700}}>{Math.round((g.xpEarned/g.xpTotal)*100)}%</span>
                      </div>
                      <div style={{height:3,background:"#070c18",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min((g.xpEarned/g.xpTotal)*100,100)}%`,background:arc.aura,borderRadius:2}}/>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* MISIONES */}
        {tab==="misiones"&&(
          <div style={S.page}>
            <h2 style={S.ptitle}>◈ Misiones Diarias</h2>
            <p style={S.psub}>Las misiones ÉPICAS son las únicas que desbloquean los efectos más brillantes del robot</p>
            <Card style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,color:"#8892a4"}}>Progreso de hoy</span>
                <span style={{fontSize:12,color:arc.aura,fontWeight:700}}>{doneMissions} / {missions.length}</span>
              </div>
              <XPBar xp={doneMissions} xpNext={missions.length} color={arc.aura} label={false}/>
              <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
                {[["FUE","#ff4d00","💪"],["SAB","#00e5ff","📖"],["VOL","#00ff9d","⚡"]].map(([k,c,ic])=>(
                  <div key={k} style={{fontSize:11,color:c}}>{ic} {k}: {attrs[k]}</div>
                ))}
              </div>
            </Card>
            {missions.map((m,i)=>(
              <div key={m.id} style={{background:m.difficulty==="epic"?"linear-gradient(135deg,#0d1428,#0a1020)":"#0d1428",border:`1px solid ${m.done?"#1a2540":m.difficulty==="epic"?"#ffd70033":arc.aura+"28"}`,borderRadius:16,padding:"16px 18px",marginBottom:10,boxShadow:m.difficulty==="epic"&&!m.done?"0 0 20px #ffd70015":"none",transition:"all 0.4s ease",transform:completedAnim===i?"scale(1.015)":"scale(1)"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>completeMission(i)}>
                  <div style={{width:34,height:34,border:`1.5px solid ${m.done?arc.aura:m.difficulty==="epic"?"#ffd700":"#1a2540"}`,borderRadius:10,background:m.done?arc.aura:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:m.done?"#000":"#8892a4",fontWeight:800,transition:"all 0.4s",boxShadow:m.done?`0 0 14px ${arc.aura}`:m.difficulty==="epic"?"0 0 10px #ffd70033":"none",opacity:m.done?0.7:1}}>{m.done?"✓":m.icon}</div>
                  <div style={{flex:1,opacity:m.done?0.45:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <div style={{fontSize:14,color:m.difficulty==="epic"?"#ffd700":"#e2e8f0",fontWeight:600}}>{m.title}</div>
                      {m.difficulty==="epic"&&!m.done&&<span style={{fontSize:9,color:"#ffd700",background:"#ffd70015",border:"1px solid #ffd70033",borderRadius:5,padding:"2px 7px"}}>ÉPICA 🔓</span>}
                    </div>
                    <div style={{fontSize:12,color:"#6b7a96",marginBottom:4}}>{m.sub}</div>
                    <div style={{fontSize:11,color:m.difficulty==="epic"?"#ffd700":arc.aura,fontStyle:"italic",opacity:0.8}}>"{m.lore}"</div>
                    {!m.done&&MISSION_ATTRS[m.id]&&(
                      <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                        {Object.entries(MISSION_ATTRS[m.id]).filter(([,v])=>v>0).map(([k,v])=>(
                          <span key={k} style={{fontSize:9,color:k==="FUE"?"#ff4d00":k==="SAB"?"#00e5ff":"#00ff9d",background:(k==="FUE"?"#ff4d00":k==="SAB"?"#00e5ff":"#00ff9d")+"15",borderRadius:5,padding:"2px 7px"}}>+{v} {k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,opacity:m.done?0.4:1}}>
                    <div style={{fontSize:13,color:m.difficulty==="epic"?"#ffd700":arc.aura,fontWeight:700}}>+{m.xp} XP</div>
                    <div style={{fontSize:9,color:"#374151",textTransform:"capitalize",marginTop:2}}>{m.area}</div>
                  </div>
                </div>
                {!m.done&&<WhyBox text={m.why} color={m.difficulty==="epic"?"#ffd700":arc.aura}/>}
              </div>
            ))}
          </div>
        )}

        {/* METAS */}
        {tab==="metas"&&(
          <div style={S.page}>
            <h2 style={S.ptitle}>🎯 Metas Épicas</h2>
            <p style={S.psub}>Conquistas grandes convertidas en misiones semanales con XP y atributos.</p>
            <button onClick={()=>setShowNewGoal(true)} style={{width:"100%",background:arc.aura+"14",border:`1.5px dashed ${arc.aura}50`,borderRadius:14,padding:"16px",color:arc.aura,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,marginBottom:20}}>＋ Crear nueva meta épica</button>
            {customGoals.length===0&&(
              <div>
                <div style={{fontSize:10,color:"#374151",letterSpacing:3,marginBottom:14}}>IDEAS POPULARES</div>
                {[{emoji:"⚖️",title:"Bajar 5 kg",desc:"Pérdida de peso saludable",type:"weight",weeks:"12"},{emoji:"🏃",title:"Correr un medio maratón",desc:"21km de preparación",type:"marathon",weeks:"16"},{emoji:"😴",title:"Dormir mejor",desc:"Rutina de sueño consistente",type:"sleep",weeks:"6"},{emoji:"💪",title:"Ganar músculo",desc:"Fuerza y masa muscular",type:"muscle",weeks:"12"}].map((p,i)=>(
                  <div key={i} onClick={()=>{setNewGoalForm({title:p.title,desc:p.desc,emoji:p.emoji,type:p.type,weeks:p.weeks});setShowNewGoal(true);}} style={{background:"#0d1428",border:"1px solid #1a2540",borderRadius:14,padding:"14px 16px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                    <div style={{fontSize:28}}>{p.emoji}</div>
                    <div style={{flex:1}}><div style={{fontSize:14,color:"#ffffff",fontWeight:600,marginBottom:2}}>{p.title}</div><div style={{fontSize:12,color:"#6b7a96"}}>{p.desc} · {p.weeks} semanas</div></div>
                    <div style={{fontSize:18,color:"#2d3a52"}}>→</div>
                  </div>
                ))}
              </div>
            )}
            {customGoals.map(g=>{
              const pct=Math.min(Math.round((g.xpEarned/g.xpTotal)*100),100);
              return(
                <div key={g.id} style={{background:"#0d1428",border:`1px solid ${pct>=100?arc.aura+"55":"#1a2540"}`,borderRadius:16,padding:"16px 18px",marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div><div style={{fontSize:14,color:"#fff",fontWeight:600,marginBottom:2}}>{g.emoji} {g.title}</div><div style={{fontSize:11,color:"#6b7a96"}}>{g.desc}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:11,color:arc.aura,fontWeight:700}}>{pct}%</div><div style={{fontSize:9,color:"#374151"}}>{g.xpEarned}/{g.xpTotal} XP</div></div>
                  </div>
                  <div style={{height:4,background:"#070c18",borderRadius:2,overflow:"hidden",marginBottom:12}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${arc.aura}55,${arc.aura})`,borderRadius:2,boxShadow:`0 0 8px ${arc.aura}`}}/>
                  </div>
                  {pct<100&&g.weeklyMissions?.map((wm,i)=>(
                    <div key={i} onClick={()=>completeGoalMission(g.id,i)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<g.weeklyMissions.length-1?"1px solid #0d1428":"none",cursor:wm.done?"default":"pointer",opacity:wm.done?0.4:1}}>
                      <div style={{width:20,height:20,border:`1.5px solid ${wm.done?arc.aura:"#1a2540"}`,borderRadius:5,background:wm.done?arc.aura:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.3s"}}>{wm.done?"✓":""}</div>
                      <span style={{fontSize:12,color:"#94a3b8",flex:1}}>{wm.text}</span>
                      <span style={{fontSize:10,color:arc.aura,fontWeight:700}}>+{wm.xp} XP</span>
                    </div>
                  ))}
                  {pct>=100&&<div style={{fontSize:12,color:arc.aura,textAlign:"center",fontFamily:"'Cinzel',serif",letterSpacing:2,textShadow:`0 0 10px ${arc.aura}`}}>⚡ META CONQUISTADA ⚡</div>}
                </div>
              );
            })}
            {showNewGoal&&(
              <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:970,backdropFilter:"blur(4px)"}}>
                <div style={{background:"#0d1428",border:"1px solid #1a2540",borderRadius:"20px 20px 0 0",padding:"28px 24px 40px",width:"100%",maxWidth:500,animation:"slide-up 0.35s ease"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                    <h3 style={{fontFamily:"'Cinzel',serif",fontSize:17,color:"#fff",letterSpacing:1}}>Nueva Meta Épica</h3>
                    <button onClick={()=>setShowNewGoal(false)} style={{background:"none",border:"none",color:"#4b5a72",cursor:"pointer",fontSize:20}}>✕</button>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={S.label}>Emoji</label>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {["🎯","⚖️","🏃","💪","😴","📚","🧘","🏊","🚴","✈️","💰","🎸"].map(e=>(
                        <button key={e} onClick={()=>setNewGoalForm(f=>({...f,emoji:e}))} style={{width:36,height:36,fontSize:17,border:`1.5px solid ${newGoalForm.emoji===e?arc.aura:"#1a2540"}`,borderRadius:8,background:newGoalForm.emoji===e?arc.aura+"18":"transparent",cursor:"pointer"}}>{e}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:14}}><label style={S.label}>¿Cuál es tu meta?</label><input style={S.input} placeholder="ej. Correr un maratón" value={newGoalForm.title} onChange={e=>setNewGoalForm(f=>({...f,title:e.target.value}))}/></div>
                  <div style={{marginBottom:14}}><label style={S.label}>Descripción</label><input style={S.input} placeholder="ej. Prepararme en 16 semanas" value={newGoalForm.desc} onChange={e=>setNewGoalForm(f=>({...f,desc:e.target.value}))}/></div>
                  <div style={{marginBottom:14}}>
                    <label style={S.label}>Tipo</label>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {[["weight","⚖️ Peso"],["marathon","🏃 Resistencia"],["sleep","😴 Sueño"],["muscle","💪 Músculo"],["custom","🎯 Otra"]].map(([val,lbl])=>(
                        <button key={val} onClick={()=>setNewGoalForm(f=>({...f,type:val}))} style={{border:`1px solid ${newGoalForm.type===val?arc.aura:"#1a2540"}`,borderRadius:20,padding:"6px 13px",background:newGoalForm.type===val?arc.aura+"18":"transparent",color:newGoalForm.type===val?arc.aura:"#6b7a96",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:22}}><label style={S.label}>Duración: <span style={{color:arc.aura}}>{newGoalForm.weeks} semanas</span></label><input type="range" min="2" max="24" value={newGoalForm.weeks} onChange={e=>setNewGoalForm(f=>({...f,weeks:e.target.value}))} style={{width:"100%",accentColor:arc.aura}}/></div>
                  <button onClick={createGoal} style={{...S.btn,opacity:newGoalForm.title?1:0.4,background:newGoalForm.title?arc.aura:"#1a2540",color:newGoalForm.title?"#000":"#4b5a72"}}>⚡ Crear meta (+25 XP)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SALUD */}
        {tab==="salud"&&(
          <div style={S.page}>
            <h2 style={S.ptitle}>✦ Salud</h2>
            <p style={S.psub}>Tu cuerpo es el primer campo de batalla</p>
            <div style={{background:"#ff4d0008",border:"1px solid #ff4d0030",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#94a3b8",lineHeight:1.75}}>⚕️ <strong style={{color:"#ff4d00"}}>Aviso:</strong> Contenido informativo. No reemplaza consulta médica profesional.</div>
            {bmi&&<Card glow={bmiColor}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,color:"#6b7a96",letterSpacing:2,marginBottom:4}}>ÍNDICE DE MASA CORPORAL</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:36,color:bmiColor,textShadow:`0 0 12px ${bmiColor}`}}>{bmi}</div>
                  <div style={{fontSize:12,color:bmiColor,marginTop:4}}>{bmiLabel}</div>
                </div>
                <div style={{fontSize:12,color:"#6b7a96",lineHeight:2.4,textAlign:"right"}}>
                  <div>Peso <span style={{color:"#94a3b8"}}>{profile.weight}kg</span></div>
                  <div>Talla <span style={{color:"#94a3b8"}}>{profile.height}cm</span></div>
                  <div>Agua <span style={{color:"#00e5ff"}}>{waterGoal}L/día</span></div>
                </div>
              </div>
            </Card>}
            <div style={S.section}>Plan Físico</div>
            {[
              profile.goals.includes("Perder peso")&&{icon:"🚶",t:"Cardio moderado",d:"30 min de caminata rápida o bicicleta. Zona 60-70% FC máx — donde el cuerpo usa más grasa.",f:"5x/sem",c:"#00ff9d"},
              profile.goals.includes("Ganar músculo")&&{icon:"💪",t:"Entrenamiento de fuerza",d:"Sentadillas, press, jalones. 3-4 series de 8-12 reps. El músculo se construye en el descanso.",f:"3x/sem",c:"#ff4d00"},
              profile.goals.includes("Más energía")&&{icon:"⚡",t:"HIIT suave",d:"20 min: 30s esfuerzo alto, 90s suave. Aumenta mitocondrias en menos tiempo.",f:"3x/sem",c:"#ffd700"},
              {icon:"🧘",t:"Movilidad y flexibilidad",d:"15 min de estiramientos. Reduce lesiones y activa el sistema nervioso parasimpático.",f:"Diario",c:"#a78bfa"},
              {icon:"💧",t:`Meta: ${waterGoal}L de agua`,d:"Calculado según tu peso (33ml/kg). Distribuye a lo largo del día.",f:"Diario",c:"#00e5ff"},
            ].filter(Boolean).map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${p.c}`,borderColor:p.c+"30"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:14,color:"#ffffff",fontWeight:600}}>{p.t}</div>
                      <span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span>
                    </div>
                    <div style={{fontSize:12,color:"#8892a4",lineHeight:1.75}}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={S.section}>Chequeos Recomendados</div>
            {[
              parseFloat(profile.age)>=35&&{icon:"🩸",t:"Perfil lipídico",d:"Colesterol total, HDL, LDL y triglicéridos. Clave para prevención cardiovascular.",f:"Anual",c:"#f87171"},
              parseFloat(profile.age)>=30&&{icon:"🔬",t:"Glucosa en ayuno",d:"Detecta prediabetes antes de que se desarrolle.",f:"Anual",c:"#f59e0b"},
              profile.conditions.includes("Diabetes")&&{icon:"📊",t:"HbA1c",d:"Promedio de glucosa de los últimos 3 meses.",f:"Trimestral",c:"#f59e0b"},
              profile.conditions.includes("Hipertensión")&&{icon:"❤️",t:"Presión en casa",d:"Mañana y noche durante 7 días. Evita el efecto de bata blanca.",f:"Mensual",c:"#f43f5e"},
              {icon:"☀️",t:"Vitamina D y B12",d:"Deficiencias muy comunes en adultos jóvenes urbanos.",f:"Anual",c:"#ffd700"},
              (profile.conditions.includes("Ansiedad")||profile.conditions.includes("Depresión"))&&{icon:"💬",t:"Psicólogo o psiquiatra",d:"La terapia cognitivo-conductual tiene evidencia sólida.",f:"Prioritario",c:"#a78bfa"},
              {icon:"🦷",t:"Examen dental",d:"Relacionado con inflamación sistémica y salud cardiovascular.",f:"6 meses",c:"#00e5ff"},
            ].filter(Boolean).map((r,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${r.c}`,borderColor:r.c+"22"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:14,color:"#ffffff",fontWeight:600}}>{r.t}</div>
                      <span style={{fontSize:10,background:r.c+"20",color:r.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{r.f}</span>
                    </div>
                    <div style={{fontSize:12,color:"#8892a4",lineHeight:1.75}}>{r.d}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MENTE */}
        {tab==="mente"&&(
          <div style={S.page}>
            <h2 style={S.ptitle}>◎ Mente</h2>
            <p style={S.psub}>La batalla más importante ocurre aquí dentro</p>
            <Card glow={arc.aura}>
              <div style={{fontSize:10,color:"#1a3050",letterSpacing:3,marginBottom:8}}>RESPIRACIÓN 4-7-8</div>
              <p style={{fontSize:13,color:"#8892a4",lineHeight:1.85,marginBottom:4}}>Activa el nervio vago y cambia el sistema nervioso a parasimpático (calma) en minutos.</p>
              <p style={{fontSize:12,color:"#4b5a72",marginBottom:16,fontStyle:"italic"}}>Inhala 4s · Sostén 7s · Exhala 8s</p>
              {breathActive?(
                <div style={{textAlign:"center",padding:"12px 0"}}>
                  <div style={{width:90,height:90,borderRadius:"50%",border:`2px solid ${arc.aura}`,background:arc.aura+"10",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 30px ${arc.aura}88`,animation:breathPhase==="inhala"?"expand 4s ease forwards":breathPhase==="exhala"?"contract 8s ease forwards":"none"}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:arc.aura,textTransform:"uppercase",letterSpacing:2}}>{breathPhase}</span>
                  </div>
                  <button onClick={stopBreath} style={{background:"transparent",border:"1px solid #1a2540",borderRadius:8,padding:"8px 20px",color:"#6b7a96",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Detener</button>
                </div>
              ):<button onClick={startBreath} style={{...S.btn,background:arc.aura,color:"#000",boxShadow:`0 0 20px ${arc.aura}44`}}>Iniciar respiración</button>}
            </Card>
            <div style={S.section}>Prácticas con Evidencia</div>
            {[
              {icon:"🧠",t:"Meditación matutina",d:"10 min al despertar. Reduce volumen de la amígdala y fortalece la corteza prefrontal. Meta-análisis de 209 estudios (JAMA 2014).",f:"Mañana",c:"#a78bfa"},
              {icon:"✍️",t:"Journaling de gratitud",d:"3 cosas buenas de hoy. Emmons & McCullough (2003): 25% más bienestar subjetivo.",f:"Noche",c:"#ff4d00"},
              {icon:"🌑",t:"Desconexión digital",d:"1h sin redes. U. of Pennsylvania (2018): reduce significativamente soledad y depresión.",f:"Diario",c:"#00ff9d"},
              {icon:"🌅",t:"Luz solar matutina",d:"10-15 min antes de las 10AM. Regula cortisol y prepara melatonina nocturna. Protocolo Huberman.",f:"Mañana",c:"#ffd700"},
              parseInt(profile.stress)>=6&&{icon:"🌬️",t:"Pausas ultradianas",d:"Cada 90 min: 3 respiraciones profundas. El cerebro necesita reset activo en sus ciclos naturales.",f:"C/90 min",c:"#00e5ff"},
            ].filter(Boolean).map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${p.c}`,borderColor:p.c+"25"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:14,color:"#ffffff",fontWeight:600}}>{p.t}</div>
                      <span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span>
                    </div>
                    <div style={{fontSize:12,color:"#8892a4",lineHeight:1.8}}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={S.section}>Lecturas Esenciales</div>
            {[
              {t:"Atomic Habits",a:"James Clear",tag:"Hábitos",c:"#00ff9d",d:"El sistema más práctico para construir hábitos. El entorno importa más que la fuerza de voluntad."},
              {t:"Por qué dormimos",a:"Matthew Walker",tag:"Sueño",c:"#a78bfa",d:"La ciencia más actualizada del sueño. Cambia para siempre cómo ves esas 7-9 horas."},
              {t:"El poder del ahora",a:"Eckhart Tolle",tag:"Mindfulness",c:"#00e5ff",d:"La ansiedad vive en el futuro. La paz solo existe en el presente."},
              {t:"Los 7 hábitos",a:"Stephen Covey",tag:"Efectividad",c:"#ffd700",d:"Desarrollo personal basado en carácter y principios universales."},
              {t:"Feeling Good",a:"David Burns",tag:"TCC",c:"#ff4d00",d:"Manual de Terapia Cognitivo-Conductual. Clínicamente validado."},
            ].map((b,i)=>(
              <Card key={i}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:"#ffffff",fontWeight:600,marginBottom:2}}>📖 {b.t}</div>
                    <div style={{fontSize:11,color:"#6b7a96",marginBottom:6}}>— {b.a}</div>
                    <div style={{fontSize:12,color:"#8892a4",lineHeight:1.7}}>{b.d}</div>
                  </div>
                  <span style={{fontSize:10,background:b.c+"20",color:b.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{b.tag}</span>
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
  btn:       { width:"100%",background:"#00ff9d",border:"none",borderRadius:12,padding:"14px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1,transition:"all 0.3s",boxShadow:"0 0 20px #00ff9d44" },
  setupCard: { background:"#0d1428",border:"1px solid #1a2540",borderRadius:20,padding:"36px 28px" },
  badge:     { fontSize:9,color:"#1a3050",letterSpacing:5,textTransform:"uppercase",marginBottom:12 },
  stitle:    { fontFamily:"'Cinzel',serif",fontSize:22,color:"#ffffff",letterSpacing:2,marginBottom:8 },
  ssub:      { fontSize:13,color:"#8892a4",marginBottom:22,lineHeight:1.7 },
  label:     { display:"block",fontSize:10,color:"#4b5a72",letterSpacing:2,textTransform:"uppercase",marginBottom:7 },
  input:     { width:"100%",background:"#070c18",border:"1px solid #1a2540",borderRadius:10,padding:"11px 13px",fontSize:13,color:"#ffffff",outline:"none",fontFamily:"inherit",boxSizing:"border-box" },
  waterBtn:  { flex:1,background:"#0d1428",border:"1px solid #1a2540",borderRadius:8,padding:"8px",color:"#6b7a96",cursor:"pointer",fontSize:12,fontFamily:"inherit" },
  page:      { maxWidth:660,margin:"0 auto",padding:"24px 16px 40px" },
  ptitle:    { fontFamily:"'Cinzel',serif",fontSize:22,color:"#ffffff",letterSpacing:2,marginBottom:6 },
  psub:      { fontSize:13,color:"#8892a4",marginBottom:20 },
  section:   { fontSize:9,color:"#1a3050",letterSpacing:3,textTransform:"uppercase",marginBottom:12,marginTop:22,paddingBottom:8,borderBottom:"1px solid #0d1428" },
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
  @keyframes neon-aura-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes float-p{0%{transform:translateY(0);opacity:0.3;}100%{transform:translateY(-12px);opacity:0.55;}}
  @keyframes rain-fall{0%{transform:translateY(-20px);opacity:0;}10%{opacity:0.4;}90%{opacity:0.4;}100%{transform:translateY(110vh);opacity:0;}}
  @keyframes rain-streak{0%{transform:translateY(-100%);opacity:0;}5%{opacity:1;}95%{opacity:0.6;}100%{transform:translateY(200%);opacity:0;}}
  @keyframes expand{0%{transform:scale(1);}100%{transform:scale(1.3);}}
  @keyframes contract{0%{transform:scale(1.3);}100%{transform:scale(1);}}
  @keyframes pop-in{from{opacity:0;transform:scale(0.6);}to{opacity:1;transform:scale(1);}}
  @keyframes fade-up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slide-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
  @keyframes xp-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5);}30%{opacity:1;transform:translate(-50%,-80%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-120%) scale(1);}100%{opacity:0;transform:translate(-50%,-160%) scale(0.8);}}
  @keyframes pulse-soft{0%,100%{opacity:0.6;}50%{opacity:1;}}
  @keyframes future-pulse{0%,100%{opacity:0.12;}50%{opacity:0.2;}}
  @keyframes star-pulse{0%,100%{box-shadow:0 0 24px #ffd70044;}50%{box-shadow:0 0 36px #ffd70066;}}
  @keyframes star-sweep{0%{transform:translateX(-100%);}100%{transform:translateX(400%);}}
  @keyframes star-drift{0%{transform:translateY(0);}100%{transform:translateY(8px);}}
  @keyframes nebula-drift{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,15px) scale(1.1);}}
  @keyframes wings-flap{0%,100%{transform:scaleY(1);}50%{transform:scaleY(0.92);}}
  @keyframes hybrid-pulse{0%,100%{opacity:0.8;}50%{opacity:1;}}
  @keyframes path-shimmer{0%{transform:translateX(-200%);}100%{transform:translateX(400%);}}
  @media(max-width:600px){
    div[style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    div[style*="auto-fit, minmax(240"]{grid-template-columns:1fr!important;}
    div[style*="auto-fit, minmax(180"]{grid-template-columns:1fr!important;}
  }
`;
