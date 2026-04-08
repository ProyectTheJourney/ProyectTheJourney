import { useState, useEffect, useRef, useMemo } from "react";

const STORAGE_KEY = "thejourney_v5";

const C = {
  bg:"#0F172A", card:"#1E293B", border:"#334155",
  green:"#10B981", orange:"#F59E0B", purple:"#8B5CF6",
  text:"#F1F5F9", muted:"#64748B", cta:"#F97316",
};

// ─── WORLD MAP STAGES ─────────────────────────────────────────────
const MAP_STAGES = [
  { id:"origin",   label:"Origen",       sublabel:"El inicio",         minLevel:1,  icon:"🌑", color:"#64748B", unlockMsg:"El viaje comienza aquí." },
  { id:"dawn",     label:"Despertar",    sublabel:"Primera luz",       minLevel:3,  icon:"🌅", color:"#F59E0B", unlockMsg:"Despertaste. La luz guía tu camino." },
  { id:"forge",    label:"La Forja",     sublabel:"Temple de acero",   minLevel:6,  icon:"🔥", color:"#F97316", unlockMsg:"Entraste a la Forja. Aquí se templará tu voluntad." },
  { id:"warrior",  label:"El Guerrero",  sublabel:"Poder forjado",     minLevel:10, icon:"⚔", color:"#EF4444", unlockMsg:"¡Guerrero! Tu disciplina es innegable." },
  { id:"ascent",   label:"Ascensión",    sublabel:"Más allá del límite",minLevel:15, icon:"✦", color:"#8B5CF6", unlockMsg:"Ascendiste. Pocos llegan tan lejos." },
  { id:"star",     label:"Estelar",      sublabel:"Entre las estrellas",minLevel:20, icon:"⭐", color:"#06B6D4", unlockMsg:"Alcanzaste el plano estelar." },
  { id:"legend",   label:"Leyenda",      sublabel:"Inmortal",          minLevel:30, icon:"👑", color:"#F59E0B", unlockMsg:"LEYENDA. Tu nombre quedará grabado." },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────
const ACHIEVEMENTS = [
  // Fáciles
  { id:"first_step",    icon:"👣", title:"Primer Paso",        desc:"Completa tu primera misión",              check:(s)=>s.totalMissions>=1 },
  { id:"hydrated",      icon:"💧", title:"Bebedor Legendario", desc:"Completa el tanque de agua un día",       check:(s)=>s.waterCompleted>=1 },
  { id:"level3",        icon:"⭐", title:"Viajero Estelar",    desc:"Alcanza el nivel 3",                     check:(s)=>s.level>=3 },
  { id:"streak3",       icon:"🔥", title:"3 en Raya",          desc:"Mantén una racha de 3 días",             check:(s)=>s.streak>=3 },
  { id:"first_epic",    icon:"🔥", title:"El Primer Fuego",    desc:"Completa tu primera misión épica",       check:(s)=>s.epicDone },
  { id:"all_missions",  icon:"✅", title:"Día Perfecto",       desc:"Completa todas las misiones en un día",  check:(s)=>s.dayPerfect>=1 },
  { id:"early_riser",   icon:"🌅", title:"Madrugador",         desc:"Registra ánimo por 5 días seguidos",     check:(s)=>s.moodDays>=5 },
  // Medios
  { id:"level10",       icon:"⚔", title:"El Guerrero",        desc:"Alcanza el nivel 10",                    check:(s)=>s.level>=10 },
  { id:"streak7",       icon:"🗓", title:"Semana Imparable",   desc:"7 días de racha",                        check:(s)=>s.streak>=7 },
  { id:"xp500",         icon:"⚡", title:"500 XP Acumulados",  desc:"Acumula 500 XP en total",                check:(s)=>s.totalXP>=500 },
  { id:"water10",       icon:"🌊", title:"Ola de Hidratación", desc:"Completa el tanque 10 días",             check:(s)=>s.waterCompleted>=10 },
  { id:"attrs50",       icon:"💪", title:"Polivalente",        desc:"Suma 50 puntos entre todos los atributos",check:(s)=>(s.attrs.FUE+s.attrs.SAB+s.attrs.VOL)>=50 },
  // Difíciles
  { id:"level20",       icon:"✦",  title:"Leyenda Viviente",   desc:"Alcanza el nivel 20",                    check:(s)=>s.level>=20 },
  { id:"streak30",      icon:"👑", title:"El Mes Perfecto",    desc:"30 días de racha",                       check:(s)=>s.streak>=30 },
  { id:"xp2000",        icon:"🌌", title:"Maestro del Viaje",  desc:"Acumula 2000 XP en total",               check:(s)=>s.totalXP>=2000 },
];

const STREAK_REWARDS = [
  { day:7,  reward:"+100 XP bonus",    icon:"🎁", xp:100 },
  { day:14, reward:"+200 XP bonus",    icon:"💎", xp:200 },
  { day:30, reward:"+500 XP LEGENDARIO",icon:"👑", xp:500 },
];

const MISSION_ATTRS = {
  1:{FUE:3,SAB:0,VOL:2}, 2:{FUE:0,SAB:2,VOL:3}, 3:{FUE:1,SAB:0,VOL:1},
  4:{FUE:0,SAB:4,VOL:1}, 5:{FUE:0,SAB:2,VOL:4}, 6:{FUE:2,SAB:1,VOL:2},
  7:{FUE:0,SAB:3,VOL:2}, 8:{FUE:2,SAB:1,VOL:1},
};
const LEVEL_TITLES = [
  {min:1,title:"El Desconocido",rank:"Rango F"},{min:3,title:"Viajero Estelar",rank:"Rango E"},
  {min:6,title:"Guardián del Alba",rank:"Rango D"},{min:10,title:"Forjador de Hábitos",rank:"Rango C"},
  {min:15,title:"Caballero del Camino",rank:"Rango B"},{min:20,title:"Leyenda Viviente",rank:"Rango A"},
  {min:30,title:"Transcendente",rank:"Rango S"},{min:50,title:"El Maestro",rank:"Rango SS"},
];
const AVATAR_ACCESSORIES = [
  {minLevel:1,id:"base",epic:false},{minLevel:3,id:"eye_glow",epic:false},
  {minLevel:5,id:"neon_aura",epic:false},{minLevel:8,id:"shoulder_pads",epic:false},
  {minLevel:10,id:"light_wings",epic:true},{minLevel:15,id:"crown",epic:true},
  {minLevel:20,id:"full_armor",epic:true},
];

const WATER_MSGS = [
  "Estás seco… ¡bebe y revive! 💀","Una gota en el desierto…",
  "El guerrero necesita hidratarse ⚔","Mitad del camino, ¡sigue así! 💧",
  "Casi ahí, no pares ahora","¡Falta poco, viajero!",
  "Un vaso más y llegas…","¡Último vaso! ¿Lo terminas?",
  "¡TANQUE LLENO! Máximo poder 💎",
];

const ARCHETYPES = [
  {id:"warrior",name:"El Guerrero",sub:"Disciplina · Fuerza · Acción",lore:"Tu poder nace de la constancia.",icon:"⚔",aura:"#F97316",mainAttr:"FUE",bg:"radial-gradient(ellipse at 50% -10%, #F9731622 0%, transparent 65%)"},
  {id:"sage",name:"El Sabio",sub:"Conocimiento · Claridad · Propósito",lore:"La mente es tu arma más poderosa.",icon:"✦",aura:"#10B981",mainAttr:"SAB",bg:"radial-gradient(ellipse at 50% -10%, #10B98122 0%, transparent 65%)"},
  {id:"explorer",name:"El Explorador",sub:"Equilibrio · Aventura · Evolución",lore:"Tu camino tiene infinitos horizontes.",icon:"◎",aura:"#8B5CF6",mainAttr:"VOL",bg:"radial-gradient(ellipse at 50% -10%, #8B5CF622 0%, transparent 65%)"},
];
const STAGE_LEVELS=[1,11,26,51,81];
const MISSIONS_DATA=[
  {id:1,title:"Forja tu cuerpo",sub:"20 min de movimiento consciente",xp:35,icon:"⚡",area:"cuerpo",difficulty:"normal",lore:"El guerrero forja su cuerpo en el fuego.",why:"20 min de ejercicio elevan dopamina, BDNF y serotonina."},
  {id:2,title:"Silencia la tormenta",sub:"10 min de meditación o respiración",xp:30,icon:"◎",area:"mente",difficulty:"normal",lore:"La mente en calma ve lo que el caos oculta.",why:"10 min diarios reducen el volumen de la amígdala en 8 semanas."},
  {id:3,title:"El río de la vida",sub:"8 vasos de agua durante el día",xp:15,icon:"💧",area:"cuerpo",difficulty:"easy",lore:"Tu cuerpo es 70% agua.",why:"Deshidratación del 2% reduce capacidad cognitiva hasta 20%."},
  {id:4,title:"Alimenta tu mente",sub:"Lee 15 páginas de cualquier libro",xp:25,icon:"📖",area:"mente",difficulty:"normal",lore:"Cada página leída es un nivel ganado.",why:"15 páginas diarias = 18 libros al año."},
  {id:5,title:"El gran silencio",sub:"1 hora sin redes sociales",xp:20,icon:"🌑",area:"mente",difficulty:"normal",lore:"Tu atención es tu recurso más escaso.",why:"Cada notificación interrumpe el foco ~23 min."},
  {id:6,title:"El descanso del héroe",sub:"Duerme entre 7 y 9 horas",xp:40,icon:"🌙",area:"cuerpo",difficulty:"normal",lore:"Los héroes se restauran en la oscuridad.",why:"Dormir menos de 6h deteriora el rendimiento igual que 48h sin dormir."},
  {id:7,title:"Crónicas del viaje",sub:"Escribe 3 cosas buenas de hoy",xp:20,icon:"✍",area:"mente",difficulty:"normal",lore:"El que no recuerda su progreso, cree que no avanza.",why:"El journaling entrena el cerebro para detectar lo positivo."},
  {id:8,title:"La caminata del sabio",sub:"Camina 5-10 min después de comer",xp:15,icon:"🚶",area:"cuerpo",difficulty:"easy",lore:"Los grandes pensadores caminaban.",why:"10 min post-comida reduce el pico de glucosa hasta 30%."},
  {id:9,title:"ÉPICA: Entrena 45 min",sub:"Sesión completa de fuerza o cardio",xp:80,icon:"🔥",area:"cuerpo",difficulty:"epic",lore:"Solo los forjados conocen este fuego.",why:"45 min activan adaptaciones que sesiones cortas no logran."},
  {id:10,title:"ÉPICA: Ayuno digital",sub:"4 horas completamente sin pantallas",xp:90,icon:"⚫",area:"mente",difficulty:"epic",lore:"El silencio absoluto revela verdades.",why:"El cerebro necesita períodos prolongados sin estímulos para consolidar aprendizajes."},
];
const CONDITIONS=["Diabetes","Hipertensión","Ansiedad","Depresión","Colesterol alto","Hipotiroidismo","Insomnio","Sedentarismo"];
const GOALS=["Perder peso","Ganar músculo","Reducir estrés","Mejorar sueño","Más energía","Salud mental","Más disciplina","Comer mejor"];
const MOODS=[{e:"😔",l:"Bajo",v:1},{e:"😐",l:"Regular",v:2},{e:"🙂",l:"Bien",v:3},{e:"😄",l:"Excelente",v:4}];
const NAV=[{id:"home",icon:"⌂",l:"Inicio"},{id:"mapa",icon:"🗺",l:"Mapa"},{id:"misiones",icon:"◈",l:"Misiones"},{id:"logros",icon:"🏆",l:"Logros"},{id:"salud",icon:"✦",l:"Salud"},{id:"mente",icon:"◎",l:"Mente"}];
const STAR_MISSIONS=[
  {title:"¡Estrella Fugaz! Sal a caminar 10 min ahora",xp:80},
  {title:"¡Estrella Fugaz! Bebe 2 vasos de agua YA",xp:50},
  {title:"¡Estrella Fugaz! Haz 20 sentadillas ahora",xp:70},
  {title:"¡Estrella Fugaz! Respira profundo 5 veces",xp:45},
  {title:"¡Estrella Fugaz! Escribe algo que te haga feliz",xp:55},
];

// ─── Storage ──────────────────────────────────────────────────────
function save(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch{}}
function load(){try{const d=localStorage.getItem(STORAGE_KEY);return d?JSON.parse(d):null;}catch{return null;}}

// ─── Helpers ──────────────────────────────────────────────────────
function getLevelTitle(l){let t=LEVEL_TITLES[0];for(const lt of LEVEL_TITLES){if(l>=lt.min)t=lt;}return t;}
function getAcc(level,epicDone){return AVATAR_ACCESSORIES.filter(a=>level>=a.minLevel&&(!a.epic||epicDone));}
function getHybrid(archetype,attrs){
  const arc=ARCHETYPES.find(a=>a.id===archetype);if(!arc)return null;
  const main=attrs[arc.mainAttr]||0;
  const dom=Object.entries(attrs).filter(([k])=>k!==arc.mainAttr).find(([,v])=>v>main);
  if(!dom)return null;
  return{FUE:{label:"Guerrero Híbrido",color:C.cta},SAB:{label:"Sabio Híbrido",color:C.green},VOL:{label:"Explorador Híbrido",color:C.purple}}[dom[0]]||null;
}
function getCurrentStage(level){
  let stage=MAP_STAGES[0];
  for(const s of MAP_STAGES){if(level>=s.minLevel)stage=s;}
  return stage;
}

// ─── Star Field ───────────────────────────────────────────────────
function StarField(){
  const stars=useMemo(()=>Array.from({length:55},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:Math.random()*2+0.4,dur:Math.random()*20+14,delay:Math.random()*14,op:Math.random()*0.5+0.1})),[]);
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,borderRadius:"50%",background:"#fff",opacity:s.op,animation:`star-drift ${s.dur}s ${s.delay}s ease-in-out infinite alternate`}}/>)}
      <div style={{position:"absolute",top:"8%",left:"12%",width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,#10B98108,transparent 70%)",animation:"nebula-drift 28s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"55%",right:"8%",width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,#8B5CF608,transparent 70%)",animation:"nebula-drift 32s 6s ease-in-out infinite reverse"}}/>
    </div>
  );
}

// ─── EPIC WORLD MAP ───────────────────────────────────────────────
function WorldMap({level,totalXP,playerName,archetype,epicDone,attrs}){
  const [tooltip,setTooltip]=useState(null);
  const currentStageIdx=MAP_STAGES.findLastIndex(s=>level>=s.minLevel);

  // SVG path coordinates for each stage (sinuous path)
  const stagePositions=[
    {x:48, y:340},{x:130,y:260},{x:230,y:300},{x:330,y:200},{x:420,y:250},{x:510,y:150},{x:590,y:80}
  ];

  // Robot position — interpolate between current and next stage
  const robotPos=stagePositions[Math.min(currentStageIdx,stagePositions.length-1)];

  // Build SVG path through all points
  const pathD=stagePositions.reduce((acc,p,i)=>{
    if(i===0)return `M ${p.x} ${p.y}`;
    const prev=stagePositions[i-1];
    const cx=(prev.x+p.x)/2,cy=(prev.y+p.y)/2;
    return `${acc} Q ${prev.x} ${prev.y} ${cx} ${cy}`;
  },"");

  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"20px 16px",marginBottom:16,overflow:"hidden",position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:3}}>MAPA DEL VIAJE</div>
          <div style={{fontSize:13,color:C.text,fontWeight:600,marginTop:2}}>{MAP_STAGES[currentStageIdx]?.label} <span style={{color:MAP_STAGES[currentStageIdx]?.color}}>— {MAP_STAGES[currentStageIdx]?.sublabel}</span></div>
        </div>
        <div style={{fontSize:9,color:C.muted,textAlign:"right"}}>Etapa {currentStageIdx+1}/{MAP_STAGES.length}</div>
      </div>

      {/* Map SVG */}
      <div style={{position:"relative",overflowX:"auto",overflowY:"hidden"}}>
        <svg viewBox="0 0 640 400" style={{width:"100%",minWidth:320,height:"auto"}}>
          {/* Galactic background */}
          <defs>
            <radialGradient id="mapbg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1a2540" stopOpacity="1"/>
              <stop offset="100%" stopColor="#0a0f1e" stopOpacity="1"/>
            </radialGradient>
            <filter id="glow-map">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="6" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <rect width="640" height="400" fill="url(#mapbg)" rx="12"/>

          {/* Stars in map */}
          {[{x:80,y:50},{x:200,y:30},{x:350,y:70},{x:500,y:40},{x:600,y:90},{x:100,y:150},{x:450,y:120},{x:580,y:200},{x:60,y:280},{x:300,y:360},{x:520,y:340}].map((s,i)=>(
            <circle key={i} cx={s.x} cy={s.y} r={Math.random()*1.5+0.5} fill="#ffffff" opacity={0.3+Math.random()*0.4}/>
          ))}

          {/* Nebula blobs */}
          <ellipse cx="150" cy="100" rx="80" ry="50" fill="#10B981" fillOpacity="0.04"/>
          <ellipse cx="500" cy="300" rx="100" ry="60" fill="#8B5CF6" fillOpacity="0.05"/>
          <ellipse cx="350" cy="180" rx="120" ry="80" fill="#F59E0B" fillOpacity="0.03"/>

          {/* Path — completed portion */}
          <path d={pathD} fill="none" stroke={C.border} strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round"/>
          {/* Glowing completed path */}
          {currentStageIdx>0&&(
            <path d={stagePositions.slice(0,currentStageIdx+1).reduce((acc,p,i)=>{
              if(i===0)return`M ${p.x} ${p.y}`;
              const prev=stagePositions[i-1];
              const cx=(prev.x+p.x)/2,cy=(prev.y+p.y)/2;
              return`${acc} Q ${prev.x} ${prev.y} ${cx} ${cy}`;
            },"")} fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round"
            filter="url(#glow-map)" opacity="0.8"/>
          )}

          {/* Stage nodes */}
          {MAP_STAGES.map((stage,i)=>{
            const pos=stagePositions[i];
            const unlocked=level>=stage.minLevel;
            const isCurrent=i===currentStageIdx;
            const isNext=i===currentStageIdx+1;
            const nextLevel=MAP_STAGES[i]?.minLevel;
            const progress=isNext?(level-MAP_STAGES[i-1]?.minLevel)/(nextLevel-MAP_STAGES[i-1]?.minLevel)*100:0;

            return(
              <g key={stage.id} onClick={()=>setTooltip(tooltip===i?null:i)} style={{cursor:"pointer"}}>
                {/* Glow for unlocked */}
                {unlocked&&<circle cx={pos.x} cy={pos.y} r="22" fill={stage.color} fillOpacity="0.15" filter="url(#glow-strong)"/>}
                {/* Node circle */}
                <circle cx={pos.x} cy={pos.y} r={isCurrent?18:14}
                  fill={unlocked?stage.color+"33":C.card}
                  stroke={unlocked?stage.color:C.border}
                  strokeWidth={isCurrent?2.5:1.5}
                  style={isCurrent?{animation:"node-pulse 2s ease-in-out infinite"}:{}}/>
                {/* Icon */}
                <text x={pos.x} y={pos.y+5} textAnchor="middle" fontSize={isCurrent?14:11}>{stage.icon}</text>
                {/* Label below */}
                <text x={pos.x} y={pos.y+32} textAnchor="middle" fontSize="9" fill={unlocked?stage.color:C.muted} fontFamily="sans-serif">{stage.label}</text>
                {/* Lock icon for locked */}
                {!unlocked&&!isNext&&<text x={pos.x+10} y={pos.y-10} fontSize="8" fill={C.muted}>🔒</text>}
                {/* Progress arc for next stage */}
                {isNext&&(
                  <circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke={stage.color} strokeWidth="2"
                    strokeDasharray={`${progress*1.005} 100`} strokeLinecap="round"
                    transform={`rotate(-90 ${pos.x} ${pos.y})`} opacity="0.6"/>
                )}
                {/* Tooltip */}
                {tooltip===i&&(
                  <g>
                    <rect x={Math.min(pos.x-60,560)} y={pos.y-70} width="130" height="52" rx="8" fill={C.card} stroke={stage.color} strokeWidth="1"/>
                    <text x={Math.min(pos.x-60,560)+65} y={pos.y-52} textAnchor="middle" fontSize="10" fill={stage.color} fontFamily="sans-serif" fontWeight="bold">{stage.label}</text>
                    <text x={Math.min(pos.x-60,560)+65} y={pos.y-38} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="sans-serif">
                      {unlocked?"✓ Desbloqueado":`Nv.${stage.minLevel} requerido`}
                    </text>
                    <text x={Math.min(pos.x-60,560)+65} y={pos.y-24} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="sans-serif">{stage.sublabel}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ROBOT on map — mini avatar */}
          <g style={{animation:"robot-idle 2s ease-in-out infinite"}} transform={`translate(${robotPos.x-12},${robotPos.y-45})`}>
            {/* Glow under robot */}
            <ellipse cx="12" cy="44" rx="14" ry="5" fill={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green} fillOpacity="0.4" filter="url(#glow-map)"/>
            {/* Body */}
            <rect x="4" y="20" width="16" height="18" rx="4" fill="#1E293B" stroke={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green} strokeWidth="1.2"/>
            {/* Head */}
            <ellipse cx="12" cy="14" rx="8" ry="8" fill="#1E293B" stroke={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green} strokeWidth="1.2"/>
            {/* Eyes */}
            <ellipse cx="9" cy="13" rx="1.5" ry="2" fill={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green}/>
            <ellipse cx="15" cy="13" rx="1.5" ry="2" fill={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green}/>
            {/* Legs */}
            <rect x="6" y="37" width="4" height="7" rx="2" fill="#1E293B" stroke={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green} strokeWidth="0.8"/>
            <rect x="14" y="37" width="4" height="7" rx="2" fill="#1E293B" stroke={ARCHETYPES.find(a=>a.id===archetype)?.aura||C.green} strokeWidth="0.8"/>
            {/* Name tag */}
            <text x="12" y="-4" textAnchor="middle" fontSize="7" fill={C.text} fontFamily="sans-serif">{playerName}</text>
          </g>

          {/* Chest icons at certain milestones */}
          {MAP_STAGES.map((stage,i)=>{
            const pos=stagePositions[i];
            const unlocked=level>=stage.minLevel;
            if(!unlocked||i===0)return null;
            return(
              <g key={`chest-${i}`}>
                <text x={pos.x+18} y={pos.y-12} fontSize="10" opacity="0.7">📦</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stage unlock message */}
      {MAP_STAGES[currentStageIdx]&&(
        <div style={{marginTop:10,padding:"8px 12px",background:MAP_STAGES[currentStageIdx].color+"15",border:`1px solid ${MAP_STAGES[currentStageIdx].color}30`,borderRadius:10,fontSize:11,color:MAP_STAGES[currentStageIdx].color,fontStyle:"italic",textAlign:"center"}}>
          "{MAP_STAGES[currentStageIdx].unlockMsg}"
        </div>
      )}

      {/* Next stage progress */}
      {currentStageIdx<MAP_STAGES.length-1&&(
        <div style={{marginTop:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:10,color:C.muted}}>Próxima etapa: <span style={{color:MAP_STAGES[currentStageIdx+1]?.color}}>{MAP_STAGES[currentStageIdx+1]?.label}</span></span>
            <span style={{fontSize:10,color:C.green,fontWeight:700}}>Nv.{MAP_STAGES[currentStageIdx+1]?.minLevel} requerido</span>
          </div>
          <div style={{height:4,background:C.bg,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(((level-MAP_STAGES[currentStageIdx]?.minLevel)/(MAP_STAGES[currentStageIdx+1]?.minLevel-MAP_STAGES[currentStageIdx]?.minLevel))*100,100)}%`,background:`linear-gradient(90deg,${MAP_STAGES[currentStageIdx+1]?.color}55,${MAP_STAGES[currentStageIdx+1]?.color})`,borderRadius:2,transition:"width 1s ease",boxShadow:`0 0 8px ${MAP_STAGES[currentStageIdx+1]?.color}`}}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ACHIEVEMENTS SCREEN ──────────────────────────────────────────
function AchievementsScreen({stats,unlockedAchievements}){
  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"24px 16px 40px"}}>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:6}}>🏆 Logros</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:20}}>{unlockedAchievements.length}/{ACHIEVEMENTS.length} desbloqueados</p>
      {/* Progress */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:C.muted}}>Colección de logros</span>
          <span style={{fontSize:12,color:C.orange,fontWeight:700}}>{Math.round((unlockedAchievements.length/ACHIEVEMENTS.length)*100)}%</span>
        </div>
        <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(unlockedAchievements.length/ACHIEVEMENTS.length)*100}%`,background:`linear-gradient(90deg,${C.orange}55,${C.orange})`,borderRadius:3,boxShadow:`0 0 10px ${C.orange}`}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
        {ACHIEVEMENTS.map(a=>{
          const unlocked=unlockedAchievements.includes(a.id);
          return(
            <div key={a.id} style={{background:C.card,border:`1px solid ${unlocked?C.orange+"44":C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center",boxShadow:unlocked?`0 0 16px ${C.orange}18`:"none",transition:"all 0.3s",opacity:unlocked?1:0.5}}>
              <div style={{fontSize:28,marginBottom:8,filter:unlocked?`drop-shadow(0 0 8px ${C.orange})`:"grayscale(1)"}}>{a.icon}</div>
              <div style={{fontSize:12,color:unlocked?C.text:C.muted,fontWeight:600,marginBottom:4}}>{a.title}</div>
              <div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{a.desc}</div>
              {unlocked&&<div style={{marginTop:8,fontSize:9,color:C.orange,letterSpacing:2}}>✓ DESBLOQUEADO</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WATER TANK ───────────────────────────────────────────────────
function WaterTank({water,setWater,addXP,waterXPGiven,setWaterXPGiven,arc}){
  const[pouring,setPouring]=useState(false);
  const[floatMsg,setFloatMsg]=useState(null);
  const isFull=water>=8;
  const msg=WATER_MSGS[Math.min(water,8)];
  const pct=water/8;

  function addWater(){
    if(isFull)return; // ANTI-CHEAT: blocked when full
    const nw=water+1;
    setWater(nw);
    setPouring(true);
    setTimeout(()=>setPouring(false),700);
    // XP only if not already given for this level
    if(!waterXPGiven){
      setFloatMsg({text:"+10 XP 💧",key:Date.now()});
      setTimeout(()=>setFloatMsg(null),1200);
      addXP(10,null,false);
      if(nw===8){
        // ANTI-CHEAT: mark water XP as given for today, give bonus once
        setWaterXPGiven(true);
        setTimeout(()=>setFloatMsg({text:"¡+50 XP BONUS! 💎",key:Date.now()+1}),400);
        setTimeout(()=>addXP(50,null,false),400);
      }
    }else{
      // No XP message — just water tracking
      setFloatMsg({text:"💧",key:Date.now()});
      setTimeout(()=>setFloatMsg(null),600);
    }
  }

  return(
    <div style={{background:C.card,border:`1px solid ${isFull?C.green+"66":C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:isFull?`0 0 24px ${C.green}22`:"none",transition:"all 0.5s",position:"relative",overflow:"hidden"}}>
      {floatMsg&&<div key={floatMsg.key} style={{position:"absolute",top:"50%",left:"50%",transform:"translateX(-50%)",zIndex:10,fontFamily:"'Cinzel',serif",fontSize:16,color:C.green,fontWeight:900,textShadow:`0 0 20px ${C.green}`,animation:"float-xp 1.2s ease forwards",pointerEvents:"none",whiteSpace:"nowrap"}}>{floatMsg.text}</div>}
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        {/* Tank */}
        <div style={{position:"relative",flexShrink:0}}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{transform:"rotate(-90deg)"}}>
            <circle cx="45" cy="45" r="38" fill="none" stroke={C.border} strokeWidth="5"/>
            <circle cx="45" cy="45" r="38" fill="none" stroke={isFull?C.green:C.green} strokeWidth="5"
              strokeDasharray={`${2*Math.PI*38}`}
              strokeDashoffset={`${2*Math.PI*38*(1-pct)}`}
              strokeLinecap="round"
              style={{transition:"stroke-dashoffset 0.6s ease",filter:isFull?`drop-shadow(0 0 8px ${C.green})`:undefined}}/>
          </svg>
          <div style={{position:"absolute",inset:10,borderRadius:"50%",overflow:"hidden",background:C.bg,border:`2px solid ${C.border}`}}>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct*100}%`,background:isFull?`linear-gradient(180deg,${C.green}88,${C.green})`:"linear-gradient(180deg,#0ea5e988,#0369a1)",transition:"height 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}>
              {pouring&&<div style={{position:"absolute",top:-4,left:"-10%",right:"-10%",height:8,background:"inherit",borderRadius:"50%",animation:"wave 0.7s ease"}}/>}
            </div>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,filter:isFull?`drop-shadow(0 0 6px ${C.green})`:undefined,zIndex:2}}>{isFull?"💎":"💧"}</div>
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:4}}>TANQUE DE HIDRATACIÓN</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:22,color:isFull?C.green:C.text,marginBottom:4,textShadow:isFull?`0 0 12px ${C.green}`:undefined}}>{water}/8</div>
          <div style={{fontSize:12,color:isFull?C.green:C.muted,lineHeight:1.5,marginBottom:12,fontStyle:"italic"}}>{msg}</div>
          {isFull&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>🔒 Tanque completo · XP del día ya ganados</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={addWater} disabled={isFull} style={{flex:2,background:isFull?C.border:C.green,border:"none",borderRadius:10,padding:"10px",color:"#000",fontWeight:800,fontSize:13,cursor:isFull?"default":"pointer",fontFamily:"inherit",boxShadow:isFull?"none":`0 0 16px ${C.green}44`,transition:"all 0.3s",opacity:isFull?0.6:1}}>
              💧 +Vaso {isFull?"✓":""}
            </button>
            <button onClick={()=>setWater(w=>Math.max(0,w-1))} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>− Quitar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────
function HeroAvatar({archetype,level=1,size=200,animate=true,mood=3,darkDay=false,showFuture=false,epicDone=false,attrs={}}){
  const a=ARCHETYPES.find(x=>x.id===archetype)||ARCHETYPES[0];
  const stage=STAGE_LEVELS.findLastIndex(l=>level>=l);
  const marks={warrior:"⚔",sage:"✦",explorer:"◎"};
  const li=darkDay?0.08:Math.min(0.25+stage*0.12+level*0.006,0.9);
  const bl=darkDay?0.05:Math.min(0.18+stage*0.08,0.6);
  const ac=darkDay?"#4b5563":a.aura;
  const eyeH=mood<=1?2.5:mood>=4?4.5:3.8;
  const eyeW=mood<=1?4:mood>=4?3.2:3.5;
  const mp=mood<=1?"M 100 88 Q 110 84 120 88":mood>=4?"M 100 86 Q 110 92 120 86":"M 102 88 Q 110 90 118 88";
  const acc=getAcc(level,epicDone);
  const hasWings=acc.some(a=>a.id==="light_wings");
  const hasCrown=acc.some(a=>a.id==="crown");
  const hasArmor=acc.some(a=>a.id==="full_armor");
  const hasAura=acc.some(a=>a.id==="neon_aura");
  const hasPads=acc.some(a=>a.id==="shoulder_pads");
  const hybrid=getHybrid(archetype,attrs);
  return(
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none" style={{overflow:"visible"}}>
      <defs>
        <radialGradient id={`BL-${archetype}-${level}`} cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor={ac} stopOpacity={li}/><stop offset="50%" stopColor={ac} stopOpacity={li*0.3}/><stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`GL-${archetype}-${level}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={li*0.9}/><stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`BD-${archetype}`} cx="50%" cy="20%" r="75%">
          <stop offset="0%" stopColor={darkDay?"#1a1a2a":hasArmor?"#1a2840":"#1E293B"}/><stop offset="55%" stopColor={darkDay?"#0e0e18":"#0F172A"}/><stop offset="100%" stopColor="#080c18"/>
        </radialGradient>
        <radialGradient id={`EL-${archetype}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={bl}/><stop offset="100%" stopColor={ac} stopOpacity="0"/>
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
      {hasAura&&!darkDay&&<ellipse cx="110" cy="115" rx="92" ry="108" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1" strokeOpacity="0.3" style={{animation:"ring-spin 8s linear infinite"}}/>}
      {showFuture&&!darkDay&&(
        <g opacity="0.11" style={{animation:"future-pulse 4s ease-in-out infinite"}}>
          <ellipse cx="110" cy="118" rx="88" ry="106" fill={ac} fillOpacity="0.06"/>
          <rect x="76" y="150" width="20" height="50" rx="10" fill={ac}/><rect x="124" y="150" width="20" height="50" rx="10" fill={ac}/>
          <rect x="70" y="98" width="80" height="60" rx="16" fill={ac}/>
          <ellipse cx="70" cy="112" rx="16" ry="13" fill={ac}/><ellipse cx="150" cy="112" rx="16" ry="13" fill={ac}/>
          <ellipse cx="110" cy="70" rx="32" ry="34" fill={ac}/>
          <ellipse cx="110" cy="36" rx="34" ry="12" fill={ac}/>
          <ellipse cx="110" cy="110" rx="112" ry="112" stroke={ac} strokeWidth="1" fill="none"/>
        </g>
      )}
      {hasWings&&!darkDay&&(
        <g style={{animation:"wings-flap 3s ease-in-out infinite"}}>
          <path d="M 62 115 C 20 80, 5 50, 30 30 C 45 20, 60 40, 62 115" fill={ac} fillOpacity="0.15" stroke={ac} strokeWidth="0.8" strokeOpacity="0.5"/>
          <path d="M 158 115 C 200 80, 215 50, 190 30 C 175 20, 160 40, 158 115" fill={ac} fillOpacity="0.15" stroke={ac} strokeWidth="0.8" strokeOpacity="0.5"/>
        </g>
      )}
      {darkDay&&animate&&[30,70,110,150,190,50,90,130,170].map((x,i)=><rect key={i} x={x} y={-10} width="1.2" height="8" rx="1" fill="#4b5563" opacity="0.35" style={{animation:`rain-fall ${1.2+(i%4)*0.3}s ${i*0.18}s linear infinite`}}/>)}
      {stage>=3&&!darkDay&&<ellipse cx="110" cy="110" rx="108" ry="108" stroke={ac} strokeWidth="0.7" fill="none" opacity="0.25" style={{animation:"ring-spin 14s linear infinite"}}/>}
      {stage>=4&&!darkDay&&<ellipse cx="110" cy="110" rx="96" ry="96" stroke={ac} strokeWidth="0.4" fill="none" opacity="0.15" style={{animation:"ring-spin 9s linear infinite reverse"}}/>}
      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="#0F172A"/><rect x="119" y="157" width="17" height="42" rx="8.5" fill="#0F172A"/>
      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl*0.9}/>
      <rect x="119" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl*0.9}/>
      {stage>=2&&!darkDay&&<><rect x="82" y="185" width="21" height="14" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5"/><rect x="117" y="185" width="21" height="14" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5"/></>}
      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#BD-${archetype})`}/>
      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#EL-${archetype})`}/>
      <rect x="79" y="107" width="62" height="57" rx="13" fill="none" stroke={ac} strokeWidth={stage>=1?0.8:0.3} strokeOpacity={stage>=1?0.35:0.1}/>
      {hasArmor&&!darkDay&&<rect x="79" y="107" width="62" height="57" rx="13" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1.2" strokeOpacity="0.5"/>}
      {stage>=3&&!hasArmor&&!darkDay&&<rect x="89" y="114" width="42" height="30" rx="7" fill={ac} fillOpacity="0.09" stroke={ac} strokeWidth="0.7" strokeOpacity="0.45"/>}
      <ellipse cx="79" cy="117" rx="12" ry="10" fill="#0F172A"/><ellipse cx="141" cy="117" rx="12" ry="10" fill="#0F172A"/>
      <ellipse cx="79" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage>=2?0.45:0.14}/>
      <ellipse cx="141" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage>=2?0.45:0.14}/>
      {hasPads&&!darkDay&&<><ellipse cx="79" cy="117" rx="15" ry="13" fill="none" stroke={ac} strokeWidth="1.5" strokeOpacity="0.6"/><ellipse cx="141" cy="117" rx="15" ry="13" fill="none" stroke={ac} strokeWidth="1.5" strokeOpacity="0.6"/><ellipse cx="79" cy="117" rx="5" ry="4" fill={ac} fillOpacity="0.3"/><ellipse cx="141" cy="117" rx="5" ry="4" fill={ac} fillOpacity="0.3"/></>}
      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="#0F172A"/><rect x="142" y="114" width="15" height="44" rx="7.5" fill="#0F172A"/>
      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl*0.8}/>
      <rect x="142" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl*0.8}/>
      {stage>=3&&!darkDay&&<><rect x="61" y="146" width="19" height="13" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6"/><rect x="140" y="146" width="19" height="13" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6"/></>}
      <rect x="103" y="94" width="14" height="17" rx="7" fill="#0F172A"/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="#0F172A"/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill={ac} fillOpacity={bl*0.35} filter={`url(#G2-${archetype})`}/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="none" stroke={ac} strokeWidth={stage>=2?0.8:0.3} strokeOpacity={stage>=2&&!darkDay?0.32:0.1}/>
      {hasCrown&&!darkDay&&<g><path d="M 90 54 L 95 42 L 110 50 L 125 42 L 130 54 Z" fill={ac} fillOpacity="0.6" stroke={ac} strokeWidth="0.8"/><ellipse cx="110" cy="42" rx="30" ry="10" fill={ac} fillOpacity="0.12" filter={`url(#G2-${archetype})`}/>{[95,110,125].map((x,i)=><circle key={i} cx={x} cy={i===1?41:43} r="2.5" fill={ac} opacity="0.9" filter={`url(#G1-${archetype})`}/>)}</g>}
      {hybrid&&!darkDay&&<><circle cx="79" cy="105" r="4" fill={hybrid.color} opacity="0.8" filter={`url(#G1-${archetype})`} style={{animation:"hybrid-pulse 2s ease-in-out infinite"}}/><circle cx="141" cy="105" r="4" fill={hybrid.color} opacity="0.8" filter={`url(#G1-${archetype})`} style={{animation:"hybrid-pulse 2s 0.5s ease-in-out infinite"}}/></>}
      <path d={`M ${103-eyeW} ${74-eyeH-5} Q 103 ${74-eyeH-7} ${103+eyeW} ${74-eyeH-5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay?0.2:0.5} strokeLinecap="round"/>
      <path d={`M ${117-eyeW} ${74-eyeH-5} Q 117 ${74-eyeH-7} ${117+eyeW} ${74-eyeH-5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay?0.2:0.5} strokeLinecap="round"/>
      <ellipse cx="103" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay?0.4:1} filter={`url(#G1-${archetype})`}/>
      <ellipse cx="117" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay?0.4:1} filter={`url(#G1-${archetype})`}/>
      <ellipse cx="103" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay?0.06:stage>=1?0.22:0.1} filter={`url(#G2-${archetype})`}/>
      <ellipse cx="117" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay?0.06:stage>=1?0.22:0.1} filter={`url(#G2-${archetype})`}/>
      {!darkDay&&<><ellipse cx="104.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.7"/><ellipse cx="118.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.7"/></>}
      <ellipse cx="110" cy="82" rx="1.2" ry="1" fill={ac} opacity={darkDay?0.15:0.3}/>
      <path d={mp} stroke={ac} strokeWidth="1.4" fill="none" strokeOpacity={darkDay?0.2:mood>=4?0.9:0.55} strokeLinecap="round"/>
      <text x="110" y="138" textAnchor="middle" fontSize={stage>=3?17:13} fill={ac} opacity={darkDay?0.2:stage>=2?1:0.65} filter={`url(#G1-${archetype})`}>{marks[archetype]}</text>
      {!darkDay&&Array.from({length:stage>=2?8:stage>=1?4:0},(_,i)=>{
        const angle=(i/(stage>=2?8:4))*Math.PI*2,r=62+(i%3)*14;
        return<circle key={i} cx={110+Math.cos(angle)*r} cy={118+Math.sin(angle)*r*0.5} r={1.7+(i%2)*1.1} fill={ac} opacity={0.35+(i%3)*0.12} style={{animation:`float-p ${2.4+i*0.38}s ${i*0.28}s ease-in-out infinite alternate`}}/>;
      })}
    </svg>
  );
}

// ─── Shared components ─────────────────────────────────────────────
function XPBar({xp,xpNext,label=true}){
  return(
    <div>
      {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:10,color:C.muted,letterSpacing:2}}>EXPERIENCIA</span>
        <span style={{fontSize:11,color:C.green,fontWeight:800,textShadow:`0 0 8px ${C.green}`}}>{xp} / {xpNext} XP</span>
      </div>}
      <div style={{height:5,background:C.bg,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.min((xp/xpNext)*100,100)}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:3,transition:"width 1s ease",boxShadow:`0 0 12px ${C.green}`}}/>
      </div>
    </div>
  );
}
function Card({children,style={},glow}){
  return<div style={{background:C.card,border:`1px solid ${glow?glow+"44":C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:glow?`0 0 24px ${glow}18`:"none",position:"relative",zIndex:1,...style}}>{children}</div>;
}
function Pill({label,active,color,onClick}){
  return<button onClick={onClick} style={{border:`1px solid ${active?color+"70":C.border}`,borderRadius:20,padding:"7px 14px",background:active?color+"18":"transparent",color:active?color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>{label}</button>;
}
function WhyBox({text,color}){
  const[open,setOpen]=useState(false);
  return(
    <div style={{marginTop:10}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"none",border:"none",color:color||C.muted,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,padding:0}}>
        <span style={{fontSize:9}}>{open?"▲":"▼"}</span> ¿Por qué funciona?
      </button>
      {open&&<p style={{fontSize:12,color:C.muted,lineHeight:1.8,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}>{text}</p>}
    </div>
  );
}
function XPBurst({xp,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1200);return()=>clearTimeout(t);},[onDone]);
  return<div style={{position:"fixed",top:"45%",left:"50%",zIndex:990,pointerEvents:"none",animation:"xp-burst 1.2s ease forwards"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:32,color:C.green,fontWeight:900,textShadow:`0 0 30px ${C.green}`,whiteSpace:"nowrap"}}>+{xp} XP</div></div>;
}
function AttrGain({attrs,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1600);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",top:"55%",left:"50%",transform:"translateX(-50%)",zIndex:989,pointerEvents:"none",display:"flex",gap:8,animation:"fade-up 1.6s ease forwards"}}>
      {Object.entries(attrs).filter(([k,v])=>v>0&&k!=="key").map(([k,v])=>(
        <div key={k} style={{background:C.card+"ee",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,color:k==="FUE"?C.cta:k==="SAB"?C.green:C.purple,fontWeight:700}}>+{v} {k}</div>
      ))}
    </div>
  );
}
function LevelUpToast({level,arc,archetype,titleInfo,newStage,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,4000);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)"}}>
      <div style={{textAlign:"center",animation:"pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",maxWidth:320,padding:20}}>
        <div style={{fontSize:52,marginBottom:10,filter:`drop-shadow(0 0 28px ${C.orange})`}}>⚡</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:C.orange,letterSpacing:6,marginBottom:4}}>¡NIVEL ALCANZADO!</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:82,color:C.text,lineHeight:1,textShadow:`0 0 60px ${C.orange},0 0 120px ${C.orange}55`}}>{level}</div>
        <div style={{fontSize:16,color:C.green,marginTop:6,fontFamily:"'Cinzel',serif",letterSpacing:2,textShadow:`0 0 10px ${C.green}`}}>{titleInfo.title}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4,letterSpacing:3}}>{titleInfo.rank}</div>
        {newStage&&(
          <div style={{marginTop:14,padding:"10px 16px",background:newStage.color+"18",border:`1px solid ${newStage.color}44`,borderRadius:12}}>
            <div style={{fontSize:20,marginBottom:4}}>{newStage.icon}</div>
            <div style={{fontSize:13,color:newStage.color,fontFamily:"'Cinzel',serif",letterSpacing:1}}>¡Nueva etapa desbloqueada!</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{newStage.label} — {newStage.sublabel}</div>
          </div>
        )}
        <div style={{display:"flex",justifyContent:"center",marginTop:16}}><HeroAvatar archetype={archetype} level={level} size={90} animate={false}/></div>
      </div>
    </div>
  );
}
function StreakReward({reward,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(8px)"}}>
      <div style={{textAlign:"center",animation:"pop-in 0.5s ease",maxWidth:300,padding:24}}>
        <div style={{fontSize:52,marginBottom:12,filter:`drop-shadow(0 0 20px ${C.orange})`}}>{reward.icon}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:C.orange,letterSpacing:4,marginBottom:8}}>¡RACHA {reward.day} DÍAS!</div>
        <div style={{fontSize:28,color:C.text,fontFamily:"'Cinzel',serif",marginBottom:6}}>{reward.reward}</div>
        <div style={{fontSize:13,color:C.muted}}>Tu constancia tiene recompensa</div>
      </div>
    </div>
  );
}
function AchievementToast({achievement,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:997,animation:"slide-up-toast 2.8s ease forwards",maxWidth:300,width:"90%"}}>
      <div style={{background:C.card,border:`1px solid ${C.orange}55`,borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 0 30px ${C.orange}33`}}>
        <div style={{fontSize:28,filter:`drop-shadow(0 0 8px ${C.orange})`}}>{achievement.icon}</div>
        <div>
          <div style={{fontSize:9,color:C.orange,letterSpacing:3,marginBottom:2}}>¡LOGRO DESBLOQUEADO!</div>
          <div style={{fontSize:14,color:C.text,fontWeight:600}}>{achievement.title}</div>
          <div style={{fontSize:11,color:C.muted}}>{achievement.desc}</div>
        </div>
      </div>
    </div>
  );
}
function DarkDayScreen({arc,archetype,playerName,onMission,onDismiss}){
  const[phase,setPhase]=useState(0);
  return(
    <div style={{position:"fixed",inset:0,zIndex:980,background:"linear-gradient(180deg,#03030a 0%,#080810 60%,#0a0a14 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>{Array.from({length:18},(_,i)=><div key={i} style={{position:"absolute",left:`${(i*5.5)%100}%`,top:-20,width:1,height:"100vh",background:"linear-gradient(to bottom,transparent,#4b556322,transparent)",animation:`rain-streak ${2+(i%5)*0.4}s ${i*0.22}s linear infinite`}}/>)}</div>
      <button onClick={onDismiss} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>✕</button>
      {phase===0&&(
        <div style={{textAlign:"center",maxWidth:340,animation:"fade-up 0.6s ease"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><HeroAvatar archetype={archetype} level={1} size={140} animate darkDay mood={1}/></div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:5,marginBottom:10}}>MODO DÍA OSCURO</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:"#94a3b8",letterSpacing:2,marginBottom:16,lineHeight:1.4}}>Los días oscuros forman parte del camino</h2>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:28}}>Hola <strong style={{color:"#94a3b8"}}>{playerName}</strong>. Solo necesitas hacer <strong style={{color:C.purple}}>una cosa pequeña</strong>.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>setPhase(1)} style={{background:C.purple+"20",border:`1px solid ${C.purple}44`,borderRadius:12,padding:"13px",color:C.purple,fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer",letterSpacing:1}}>Activar misión de recuperación</button>
            <button onClick={onDismiss} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Estoy bien, continuar</button>
          </div>
        </div>
      )}
      {phase===1&&(
        <div style={{textAlign:"center",maxWidth:360,animation:"fade-up 0.4s ease"}}>
          <div style={{fontSize:28,marginBottom:14,filter:`drop-shadow(0 0 16px ${C.purple})`}}>🌑</div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:5,marginBottom:10}}>MISIÓN DE RECUPERACIÓN · +100 XP</div>
          <h3 style={{fontFamily:"'Cinzel',serif",fontSize:19,color:"#94a3b8",letterSpacing:2,marginBottom:20}}>El primer paso</h3>
          {["Toma un vaso de agua ahora mismo","Sal al exterior aunque sea 5 minutos","Escribe una cosa por la que estés vivo hoy"].map((s,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
              <div style={{width:28,height:28,borderRadius:8,background:C.purple+"20",border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",color:C.purple,fontSize:13,flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:13,color:"#8892a4",lineHeight:1.5}}>{s}</span>
            </div>
          ))}
          <p style={{fontSize:12,color:C.muted,lineHeight:1.8,marginTop:16,marginBottom:24,fontStyle:"italic"}}>"El guerrero no es quien nunca cae.<br/>Es quien se levanta cada vez."</p>
          <button onClick={()=>{onMission(100);onDismiss();}} style={{width:"100%",background:C.purple,border:"none",borderRadius:12,padding:"14px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1}}>✓ Completar misión (+100 XP)</button>
        </div>
      )}
    </div>
  );
}
function RobotDiary({playerName,water,mood,doneMissions,totalMissions,attrs,arc,level}){
  const[open,setOpen]=useState(false);
  const title=getLevelTitle(level);
  const msg=useMemo(()=>{
    if(mood<=1)return`Navegante ${playerName}... detecto energía baja. Una acción pequeña puede cambiar el rumbo.`;
    if(water<3)return`Navegante ${playerName}, mis sensores detectan deshidratación. ¿Un vaso de agua ahora?`;
    if(doneMissions===0)return`¡Bienvenido de nuevo, Navegante ${playerName}! El camino espera. Completa tu primera misión.`;
    if(doneMissions===totalMissions)return`¡Extraordinario, Navegante ${playerName}! Misiones completas. Tu aura se intensifica. Eres digno de "${title.title}".`;
    if(attrs.SAB>attrs.FUE&&attrs.SAB>attrs.VOL)return`Navegante ${playerName}, tu Sabiduría domina. El Sabio que llevas dentro está despertando.`;
    if(attrs.FUE>attrs.SAB&&attrs.FUE>attrs.VOL)return`Navegante ${playerName}, tu Fuerza es innegable. El cuerpo que forjas hoy es el escudo de tu futuro.`;
    return`Navegante ${playerName} — ${doneMissions}/${totalMissions} misiones. Cada paso cuenta.`;
  },[mood,water,doneMissions,totalMissions,attrs,playerName,title,level]);
  return(
    <div style={{background:C.card,border:`1px solid ${arc?.aura||C.green}33`,borderRadius:16,padding:"14px 16px",marginBottom:12,cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:10,background:arc?.aura+"18"||C.green+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,filter:`drop-shadow(0 0 6px ${arc?.aura||C.green})`}}>🤖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:arc?.aura||C.green,letterSpacing:2,marginBottom:1}}>DIARIO DEL ROBOT</div>
          <div style={{fontSize:12,color:C.muted}}>{open?"Toca para cerrar":"💬 ¿Qué dice tu robot hoy?"}</div>
        </div>
        <div style={{fontSize:18,color:C.muted,transition:"transform 0.3s",transform:open?"rotate(180deg)":"none"}}>⌄</div>
      </div>
      {open&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${arc?.aura||C.green}18`}}>
          <p style={{fontSize:13,color:C.text,lineHeight:1.85,fontStyle:"italic"}}>"{msg}"</p>
          <div style={{marginTop:6,fontSize:10,color:C.muted}}>— Robot · {title.title} · {title.rank}</div>
        </div>
      )}
    </div>
  );
}
function MedDisclaimer({onAccept}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,padding:20,backdropFilter:"blur(4px)"}}>
      <div style={{background:C.card,border:`1px solid ${C.orange}aa`,borderRadius:20,padding:"32px 26px",maxWidth:420,width:"100%"}}>
        <div style={{fontSize:28,textAlign:"center",marginBottom:12}}>⚕️</div>
        <h3 style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.text,textAlign:"center",marginBottom:16,letterSpacing:2}}>Aviso Importante</h3>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:14}}><strong style={{color:C.text}}>The Journey</strong> es una herramienta de apoyo al bienestar. <strong style={{color:C.text}}>No reemplaza la atención médica profesional.</strong></p>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:24}}>Ante síntomas o dudas, <strong style={{color:C.orange}}>consulta siempre a un profesional.</strong></p>
        <button onClick={onAccept} style={{width:"100%",background:C.cta,border:"none",borderRadius:12,padding:"13px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1,boxShadow:`0 0 20px ${C.cta}44`}}>Entendido, continuar →</button>
      </div>
    </div>
  );
}
function Tutorial({onDone}){
  const STEPS=[
    {icon:"🗺",title:"Mapa del Viaje",desc:"Tu robot camina por el mapa cada vez que subes de nivel. 7 etapas épicas te esperan desde Origen hasta Leyenda."},
    {icon:"◈",title:"Misiones + Épicas",desc:"Las ÉPICAS desbloquean los efectos más brillantes. Fáciles, normales y épicas — cada una da atributos distintos."},
    {icon:"🏆",title:"Logros",desc:"15 trofeos que coleccionar. Algunos fáciles al inicio, otros legendarios. ¿Puedes desbloquearlos todos?"},
    {icon:"🔥",title:"Rachas con Recompensa",desc:"Días 7, 14 y 30 de racha consecutiva = XP bonus especial. La constancia tiene su recompensa."},
  ];
  const[idx,setIdx]=useState(0);const s=STEPS[idx];
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:980,backdropFilter:"blur(3px)",padding:24}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"28px 24px",maxWidth:340,width:"100%",animation:"pop-in 0.35s ease"}}>
        <div style={{fontSize:32,textAlign:"center",marginBottom:12}}>{s.icon}</div>
        <h3 style={{fontFamily:"'Cinzel',serif",fontSize:17,color:C.text,textAlign:"center",marginBottom:12,letterSpacing:1}}>{s.title}</h3>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.85,textAlign:"center",marginBottom:22}}>{s.desc}</p>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
          {STEPS.map((_,i)=><div key={i} style={{width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?C.green:C.border,transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {idx>0&&<button onClick={()=>setIdx(i=>i-1)} style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",color:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>← Atrás</button>}
          <button onClick={idx===STEPS.length-1?onDone:()=>setIdx(i=>i+1)} style={{flex:2,background:C.green,border:"none",borderRadius:10,padding:"11px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:`0 0 16px ${C.green}44`}}>
            {idx===STEPS.length-1?"¡Entendido!":"Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const[step,setStep]=useState(0);
  const[profile,setProfile]=useState({name:"",age:"",weight:"",height:"",sleep:"7",stress:"5",conditions:[],goals:[],archetype:null});
  const[player,setPlayer]=useState(null);
  const[tab,setTab]=useState("home");
  const[missions,setMissions]=useState(MISSIONS_DATA.map(m=>({...m,done:false})));
  const[customGoals,setCustomGoals]=useState([]);
  const[mood,setMood]=useState(null);
  const[moodLog,setMoodLog]=useState([]);
  const[water,setWater]=useState(0);
  const[waterXPGiven,setWaterXPGiven]=useState(false); // ANTI-CHEAT
  const[attrs,setAttrs]=useState({FUE:0,SAB:0,VOL:0});
  const[totalXP,setTotalXP]=useState(0);
  const[epicDone,setEpicDone]=useState(false);
  const[unlockedAchievements,setUnlockedAchievements]=useState([]);
  const[totalMissionsCompleted,setTotalMissionsCompleted]=useState(0);
  const[waterCompleted,setWaterCompleted]=useState(0); // days tank was filled
  const[moodDays,setMoodDays]=useState(0);
  const[dayPerfect,setDayPerfect]=useState(0);
  const[showLevelUp,setShowLevelUp]=useState(false);
  const[newLevel,setNewLevel]=useState(null);
  const[newStageUnlocked,setNewStageUnlocked]=useState(null);
  const[showDisclaimer,setShowDisclaimer]=useState(false);
  const[showTutorial,setShowTutorial]=useState(false);
  const[showDarkDay,setShowDarkDay]=useState(false);
  const[showWeekly,setShowWeekly]=useState(false);
  const[xpBurst,setXpBurst]=useState(null);
  const[attrGain,setAttrGain]=useState(null);
  const[completedAnim,setCompletedAnim]=useState(null);
  const[showNewGoal,setShowNewGoal]=useState(false);
  const[newGoalForm,setNewGoalForm]=useState({title:"",desc:"",emoji:"🎯",type:"custom",weeks:"8"});
  const[starMission,setStarMission]=useState(null);
  const[starTimer,setStarTimer]=useState(0);
  const[breathActive,setBreathActive]=useState(false);
  const[breathPhase,setBreathPhase]=useState("inhala");
  const[achievementToast,setAchievementToast]=useState(null);
  const[streakReward,setStreakReward]=useState(null);
  const breathRef=useRef(null);
  const starRef=useRef(null);

  useEffect(()=>{
    const s=load();
    if(s){
      if(s.profile)setProfile(s.profile);
      if(s.player){setPlayer(s.player);setStep(5);}
      if(s.missions)setMissions(s.missions);
      if(s.customGoals)setCustomGoals(s.customGoals);
      if(s.water!==undefined)setWater(s.water);
      if(s.waterXPGiven)setWaterXPGiven(s.waterXPGiven);
      if(s.moodLog)setMoodLog(s.moodLog);
      if(s.attrs)setAttrs(s.attrs);
      if(s.totalXP!==undefined)setTotalXP(s.totalXP);
      if(s.epicDone)setEpicDone(s.epicDone);
      if(s.unlockedAchievements)setUnlockedAchievements(s.unlockedAchievements);
      if(s.totalMissionsCompleted)setTotalMissionsCompleted(s.totalMissionsCompleted);
      if(s.waterCompleted)setWaterCompleted(s.waterCompleted);
      if(s.moodDays)setMoodDays(s.moodDays);
      if(s.dayPerfect)setDayPerfect(s.dayPerfect);
    }
  },[]);

  useEffect(()=>{
    if(step<5&&!player)return;
    save({profile,player,missions,customGoals,water,waterXPGiven,moodLog,attrs,totalXP,epicDone,unlockedAchievements,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect});
  },[profile,player,missions,customGoals,water,waterXPGiven,moodLog,attrs,totalXP,epicDone,unlockedAchievements,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect]);

  // Star mission
  useEffect(()=>{
    if(!player)return;
    const delay=(8+Math.random()*7)*60*1000;
    const t=setTimeout(()=>{
      const m=STAR_MISSIONS[Math.floor(Math.random()*STAR_MISSIONS.length)];
      setStarMission(m);setStarTimer(90);
      starRef.current=setInterval(()=>setStarTimer(t=>{if(t<=1){clearInterval(starRef.current);setStarMission(null);return 0;}return t-1;}),1000);
    },delay);
    return()=>{clearTimeout(t);clearInterval(starRef.current);};
  },[player?.level]);

  // Check achievements whenever stats change
  useEffect(()=>{
    if(!player)return;
    const stats={level:player.level,streak:player.streak,totalXP,epicDone,attrs,totalMissions:totalMissionsCompleted,waterCompleted,moodDays,dayPerfect};
    ACHIEVEMENTS.forEach(a=>{
      if(!unlockedAchievements.includes(a.id)&&a.check(stats)){
        setUnlockedAchievements(prev=>[...prev,a.id]);
        setAchievementToast(a);
        setTimeout(()=>setAchievementToast(null),2800);
      }
    });
  },[player?.level,player?.streak,totalXP,epicDone,attrs,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect]);

  const arc=ARCHETYPES.find(a=>a.id===(profile.archetype||player?.archetype||"explorer"));
  const lowMoodStreak=moodLog.length>=3&&moodLog.slice(-3).every(m=>m.v<=1);
  const doneMissions=missions.filter(m=>m.done).length;
  const currentMood=mood||(moodLog.length?moodLog[moodLog.length-1].v:3);
  const titleInfo=getLevelTitle(player?.level||1);
  const hybrid=getHybrid(player?.archetype,attrs);
  const bmi=profile.weight&&profile.height?(parseFloat(profile.weight)/Math.pow(parseFloat(profile.height)/100,2)).toFixed(1):null;
  const bmiLabel=!bmi?"":bmi<18.5?"Bajo peso":bmi<25?"Normal":bmi<30?"Sobrepeso":"Obesidad";
  const bmiColor=!bmi?C.muted:bmi<18.5?"#60a5fa":bmi<25?C.green:bmi<30?C.orange:"#f87171";
  const waterGoal=Math.round((parseFloat(profile.weight)||70)*0.033*10)/10;

  function toggleArr(k,v){setProfile(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));}

  function finishSetup(){
    const a=ARCHETYPES.find(x=>x.id===profile.archetype);
    setPlayer({name:profile.name,archetype:profile.archetype,level:1,xp:0,xpNext:100,streak:1,stats:{...a.stat},joinedAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})});
    setShowDisclaimer(true);
  }

  function addXP(gain,missionId=null,showBurst=true){
    if(showBurst)setXpBurst({xp:gain,key:Date.now()});
    setTotalXP(t=>t+gain);
    if(missionId&&MISSION_ATTRS[missionId]){
      const g=MISSION_ATTRS[missionId];
      setAttrs(a=>({FUE:a.FUE+g.FUE,SAB:a.SAB+g.SAB,VOL:a.VOL+g.VOL}));
      if(Object.values(g).some(v=>v>0))setAttrGain({...g,key:Date.now()});
    }
    setPlayer(p=>{
      if(!p)return p;
      const nx=p.xp+gain,up=nx>=p.xpNext,nl=up?p.level+1:p.level;
      if(up){
        setNewLevel(nl);
        // Check if new map stage unlocked
        const prevStageIdx=MAP_STAGES.findLastIndex(s=>p.level>=s.minLevel);
        const newStageIdx=MAP_STAGES.findLastIndex(s=>nl>=s.minLevel);
        if(newStageIdx>prevStageIdx)setNewStageUnlocked(MAP_STAGES[newStageIdx]);
        else setNewStageUnlocked(null);
        setShowLevelUp(true);
        // Check streak rewards
        STREAK_REWARDS.forEach(r=>{
          if(p.streak===r.day){setStreakReward(r);setTimeout(()=>addXP(r.xp,null,true),4200);}
        });
      }
      return{...p,xp:up?nx-p.xpNext:nx,xpNext:up?Math.round(p.xpNext*1.5):p.xpNext,level:nl};
    });
  }

  function completeMission(idx){
    if(missions[idx].done)return;
    const m=missions[idx];
    setMissions(ms=>ms.map((x,i)=>i===idx?{...x,done:true}:x));
    setCompletedAnim(idx);setTimeout(()=>setCompletedAnim(null),700);
    if(m.difficulty==="epic")setEpicDone(true);
    const newTotal=totalMissionsCompleted+1;
    setTotalMissionsCompleted(newTotal);
    const newDone=doneMissions+1;
    if(newDone===missions.length){setDayPerfect(d=>d+1);}
    addXP(m.xp,m.id);
  }

  function logMood(v){
    setMood(v);
    const nl=[...moodLog.slice(-11),{v,t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}];
    setMoodLog(nl);
    setMoodDays(d=>d+1);
    if(nl.length>=3&&nl.slice(-3).every(m=>m.v<=1))setTimeout(()=>setShowDarkDay(true),800);
  }

  function resetDay(){
    setMissions(MISSIONS_DATA.map(m=>({...m,done:false})));
    setWater(0);setMood(null);setWaterXPGiven(false); // ANTI-CHEAT: reset daily water XP lock
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
    const g={id:Date.now(),title:newGoalForm.title,desc:newGoalForm.desc,emoji:newGoalForm.emoji,type:newGoalForm.type,xpTotal:parseInt(newGoalForm.weeks)*100,xpEarned:0,weeklyMissions:genWeeklyMissions(newGoalForm.type),createdAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long"})};
    setCustomGoals(gs=>[...gs,g]);setShowNewGoal(false);
    setNewGoalForm({title:"",desc:"",emoji:"🎯",type:"custom",weeks:"8"});addXP(25);
  }
  function completeGoalMission(gid,mi){
    const g=customGoals.find(g=>g.id===gid);
    if(!g||g.weeklyMissions[mi].done)return;
    const xp=g.weeklyMissions[mi].xp;
    setCustomGoals(gs=>gs.map(g=>g.id!==gid?g:{...g,weeklyMissions:g.weeklyMissions.map((m,i)=>i===mi?{...m,done:true}:m),xpEarned:(g.xpEarned||0)+xp}));
    addXP(xp);
  }

  // SETUP
  if(step<5) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"flex-start",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:C.text,padding:"32px 16px 60px",overflowY:"auto",position:"relative"}}>
      <StarField/>
      {showDisclaimer&&<MedDisclaimer onAccept={()=>{setShowDisclaimer(false);setStep(5);setShowTutorial(true);}}/>}
      <div style={{width:"100%",maxWidth:step===4?880:480,position:"relative",zIndex:1}}>
        {step===0&&(
          <div style={{textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:24}}><HeroAvatar archetype="explorer" level={10} size={170} mood={4} showFuture/></div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:6,marginBottom:12}}>TU VIDA COMO UN RPG</div>
            <h1 style={{fontFamily:"'Cinzel',serif",fontSize:38,fontWeight:900,color:C.text,lineHeight:1.1,marginBottom:10,textShadow:`0 0 40px ${C.green}44`}}>
              SUBE DE NIVEL<br/><span style={{color:C.green,textShadow:`0 0 30px ${C.green}`}}>EN LA VIDA REAL</span>
            </h1>
            <p style={{fontSize:15,color:C.muted,lineHeight:1.7,marginBottom:6}}>Tu robot evoluciona cuando tú evolucionas.</p>
            <p style={{fontSize:13,color:C.muted,marginBottom:32}}>Cada misión = <span style={{color:C.green,fontWeight:700}}>+XP</span> + <span style={{color:C.cta,fontWeight:700}}>Atributos</span> + <span style={{color:C.purple,fontWeight:700}}>Nivel</span></p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:32}}>
              {[["🗺","Mapa del Viaje"],["🏆","15 Logros"],["🔥","Rachas con recompensa"],["🌟","Estrella Fugaz"],["🌑","Modo Día Oscuro"]].map(([ic,lb])=>(
                <div key={lb} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:C.muted}}>{ic} {lb}</div>
              ))}
            </div>
            <button style={{width:"100%",background:`linear-gradient(135deg,${C.cta},${C.orange})`,border:"none",borderRadius:14,padding:"18px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:16,cursor:"pointer",letterSpacing:1,boxShadow:`0 0 40px ${C.cta}55`,marginBottom:12,animation:"cta-pulse 3s ease-in-out infinite"}} onClick={()=>setStep(1)}>
              CREAR MI ROBOT GRATIS →
            </button>
            <div style={{fontSize:12,color:C.muted}}>✦ Ya hay +2.847 viajeros subiendo de nivel</div>
          </div>
        )}
        {step===1&&(
          <div style={S.setupCard}>
            <div style={S.badge}>1 DE 4 · IDENTIDAD</div>
            <h2 style={S.stitle}>¿Cómo te llamamos, Viajero?</h2>
            <p style={S.ssub}>Tu misión personalizada empieza aquí</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:18}}>
              {[["Nombre o alias","name","text","¿Cómo te llamamos?"],["Edad","age","number","años"],["Peso (kg)","weight","number","kg"],["Talla (cm)","height","number","cm"]].map(([lbl,key,type,ph])=>(
                <div key={key}><label style={S.label}>{lbl}</label><input style={S.input} type={type} placeholder={ph} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/></div>
              ))}
            </div>
            <label style={S.label}>Horas de sueño: <span style={{color:C.green,fontWeight:700}}>{profile.sleep}h</span></label>
            <input type="range" min="4" max="12" value={profile.sleep} onChange={e=>setProfile(p=>({...p,sleep:e.target.value}))} style={{width:"100%",accentColor:C.green,marginBottom:18}}/>
            <label style={S.label}>Nivel de estrés: <span style={{color:C.orange,fontWeight:700}}>{profile.stress}/10</span></label>
            <input type="range" min="1" max="10" value={profile.stress} onChange={e=>setProfile(p=>({...p,stress:e.target.value}))} style={{width:"100%",accentColor:C.orange,marginBottom:26}}/>
            <button style={{...S.btn,opacity:profile.name&&profile.age?1:0.35}} onClick={()=>profile.name&&profile.age&&setStep(2)}>Siguiente →</button>
          </div>
        )}
        {step===2&&(
          <div style={S.setupCard}>
            <div style={S.badge}>2 DE 4 · SALUD</div>
            <h2 style={S.stitle}>¿Alguna condición de salud?</h2>
            <p style={S.ssub}>Personaliza tus recomendaciones (opcional)</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{CONDITIONS.map(c=><Pill key={c} label={c} active={profile.conditions.includes(c)} color={arc.aura} onClick={()=>toggleArr("conditions",c)}/>)}</div>
            <button style={S.btn} onClick={()=>setStep(3)}>Siguiente →</button>
          </div>
        )}
        {step===3&&(
          <div style={S.setupCard}>
            <div style={S.badge}>3 DE 4 · OBJETIVOS</div>
            <h2 style={S.stitle}>¿Qué quieres conquistar?</h2>
            <p style={S.ssub}>Selecciona todo lo que aplique</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{GOALS.map(g=><Pill key={g} label={g} active={profile.goals.includes(g)} color={C.green} onClick={()=>toggleArr("goals",g)}/>)}</div>
            <button style={{...S.btn,opacity:profile.goals.length?1:0.35}} onClick={()=>profile.goals.length&&setStep(4)}>Siguiente →</button>
          </div>
        )}
        {step===4&&(
          <div>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={S.badge}>4 DE 4 · ARQUETIPO</div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:28,color:C.text,letterSpacing:3,marginBottom:8}}>Elige tu arquetipo</h2>
              <p style={{fontSize:13,color:C.muted}}>Tu origen define tus atributos dominantes</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginBottom:28}}>
              {ARCHETYPES.map(a=>{
                const sel=profile.archetype===a.id;
                return(
                  <div key={a.id} onClick={()=>setProfile(p=>({...p,archetype:a.id}))} style={{background:C.card,border:`1px solid ${sel?a.aura+"55":C.border}`,borderRadius:18,padding:"24px 16px 20px",cursor:"pointer",transition:"all 0.35s",boxShadow:sel?`0 0 40px ${a.aura}25`:"none",transform:sel?"translateY(-6px)":"none",textAlign:"center",position:"relative"}}>
                    {sel&&<div style={{position:"absolute",inset:0,borderRadius:18,background:`radial-gradient(ellipse at 50% 0%, ${a.aura}10, transparent 70%)`,pointerEvents:"none"}}/>}
                    <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><HeroAvatar archetype={a.id} level={sel?32:1} size={100} animate={sel} mood={sel?4:3}/></div>
                    <div style={{fontSize:11,color:a.aura,letterSpacing:3,textTransform:"uppercase",marginBottom:5}}>{a.icon} {a.name}</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{a.sub}</div>
                    <div style={{fontSize:10,color:a.aura+"88",marginBottom:10}}>Dominante: {a.mainAttr}</div>
                    <p style={{fontSize:11,color:C.muted,lineHeight:1.7}}>{a.lore}</p>
                    {sel&&<div style={{marginTop:14,fontSize:10,background:a.aura,color:"#000",borderRadius:20,padding:"5px 0",fontWeight:800,letterSpacing:2}}>✓ SELECCIONADO</div>}
                  </div>
                );
              })}
            </div>
            <div style={{textAlign:"center"}}>
              <button style={{...S.btn,maxWidth:380,background:profile.archetype?`linear-gradient(135deg,${arc.aura},${C.cta})`:"#1E293B",color:profile.archetype?"#000":C.muted,opacity:profile.archetype?1:0.5,boxShadow:profile.archetype?`0 0 30px ${arc.aura}44`:"none"}} onClick={()=>profile.archetype&&finishSetup()}>
                ⚡ ¡Crear mi robot como {profile.archetype?arc.name:"..."}!
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{CSS}</style>
    </div>
  );

  // MAIN APP
  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:C.text,overflow:"hidden",position:"relative"}}>
      <StarField/>
      {showLevelUp&&<LevelUpToast level={newLevel} arc={arc} archetype={player.archetype} titleInfo={getLevelTitle(newLevel)} newStage={newStageUnlocked} onDone={()=>{setShowLevelUp(false);if(streakReward)setStreakReward(null);}}/>}
      {streakReward&&!showLevelUp&&<StreakReward reward={streakReward} onDone={()=>setStreakReward(null)}/>}
      {achievementToast&&<AchievementToast achievement={achievementToast} onDone={()=>setAchievementToast(null)}/>}
      {showTutorial&&<Tutorial onDone={()=>setShowTutorial(false)}/>}
      {showDarkDay&&<DarkDayScreen arc={arc} archetype={player.archetype} playerName={player.name} onMission={xp=>addXP(xp)} onDismiss={()=>setShowDarkDay(false)}/>}
      {xpBurst&&<XPBurst xp={xpBurst.xp} onDone={()=>setXpBurst(null)}/>}
      {attrGain&&<AttrGain attrs={attrGain} onDone={()=>setAttrGain(null)}/>}

      {/* Sidebar */}
      <nav style={{width:60,background:C.card+"cc",backdropFilter:"blur(8px)",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 0",gap:2,flexShrink:0,position:"relative",zIndex:10}}>
        <div style={{fontSize:15,color:C.green,fontFamily:"'Cinzel',serif",marginBottom:12,textShadow:`0 0 10px ${C.green}`}}>◈</div>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{width:46,height:50,border:"none",borderRadius:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:tab===n.id?C.green+"22":"transparent",color:tab===n.id?C.green:C.muted,transition:"all 0.2s",fontFamily:"inherit",boxShadow:tab===n.id?`0 0 12px ${C.green}33`:"none"}}>
            <span style={{fontSize:15}}>{n.icon}</span><span style={{fontSize:7.5}}>{n.l}</span>
          </button>
        ))}
        {lowMoodStreak&&<button onClick={()=>setShowDarkDay(true)} style={{width:42,height:42,border:`1px solid ${C.purple}33`,borderRadius:10,background:C.purple+"10",color:C.purple,cursor:"pointer",fontSize:14,marginTop:4,animation:"pulse-soft 2s ease-in-out infinite"}}>🌑</button>}
        <div style={{marginTop:"auto",paddingBottom:8,display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
          <button onClick={resetDay} title="Nuevo día" style={{width:38,height:38,border:`1px solid ${C.border}`,borderRadius:9,background:"transparent",color:C.muted,cursor:"pointer",fontSize:14}}>↺</button>
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
                  <div style={{fontSize:10,color:C.green,letterSpacing:3,marginBottom:1,textShadow:`0 0 8px ${C.green}`}}>¡BIENVENIDO DE NUEVO!</div>
                  <h1 style={{fontFamily:"'Cinzel',serif",fontSize:20,color:C.text,letterSpacing:1,marginBottom:2}}>{player.name}</h1>
                  <div style={{fontSize:9,color:arc.aura,letterSpacing:2,marginBottom:2}}>{titleInfo.title} · {titleInfo.rank}</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:10}}>
                    {arc.name} · Nivel <span style={{color:C.green,fontWeight:800,fontSize:16,textShadow:`0 0 10px ${C.green}`}}>{player.level}</span>
                    {hybrid&&<span style={{fontSize:10,color:hybrid.color,marginLeft:8,background:hybrid.color+"15",borderRadius:6,padding:"2px 7px",border:`1px solid ${hybrid.color}33`}}>{hybrid.label}</span>}
                  </div>
                  <XPBar xp={player.xp} xpNext={player.xpNext}/>
                  <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                    {/* BIG streak counter */}
                    <div style={{border:`2px solid ${C.orange}44`,borderRadius:10,padding:"6px 14px",background:C.orange+"10",boxShadow:`0 0 16px ${C.orange}22`}}>
                      <span style={{fontSize:20,fontFamily:"'Cinzel',serif",color:C.orange,fontWeight:900,textShadow:`0 0 10px ${C.orange}`}}>🔥{player.streak}</span>
                      <span style={{fontSize:10,color:C.muted,marginLeft:4}}>días</span>
                    </div>
                    <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,color:C.muted}}>◈ <span style={{color:C.text,fontWeight:700}}>{doneMissions}/{missions.length}</span></div>
                    <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,color:C.muted}}>🏆 <span style={{color:C.orange,fontWeight:700}}>{unlockedAchievements.length}</span>/{ACHIEVEMENTS.length}</div>
                    {lowMoodStreak&&<div onClick={()=>setShowDarkDay(true)} style={{border:`1px solid ${C.purple}33`,borderRadius:8,padding:"6px 12px",fontSize:12,color:C.purple,cursor:"pointer"}}>🌑 Día Oscuro</div>}
                  </div>
                  {/* Next streak reward hint */}
                  {STREAK_REWARDS.filter(r=>r.day>player.streak).slice(0,1).map(r=>(
                    <div key={r.day} style={{marginTop:8,fontSize:11,color:C.orange,background:C.orange+"10",borderRadius:8,padding:"5px 10px",border:`1px solid ${C.orange}22`}}>
                      🎁 Día {r.day}: {r.reward} — faltan {r.day-player.streak} días
                    </div>
                  ))}
                  {doneMissions===0&&<div style={{marginTop:8,fontSize:11,color:C.green,background:C.green+"12",borderRadius:8,padding:"6px 10px",border:`1px solid ${C.green}22`}}>⚡ Completa tu primera misión y gana {MISSIONS_DATA[0].xp} XP</div>}
                </div>
              </div>
            </div>

            <div style={{maxWidth:660,margin:"0 auto",padding:"14px 15px 32px"}}>
              {/* Star mission */}
              {starMission&&(
                <div style={{background:"linear-gradient(135deg,#1a1400,#0a0f00)",border:`1.5px solid ${C.orange}`,borderRadius:16,padding:"14px 18px",marginBottom:14,boxShadow:`0 0 24px ${C.orange}44`,animation:"star-pulse 2s ease-in-out infinite",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${C.orange}08,transparent)`,animation:"star-sweep 2s linear infinite",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:28,filter:`drop-shadow(0 0 8px ${C.orange})`}}>🌟</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:C.orange,letterSpacing:3,marginBottom:3}}>ESTRELLA FUGAZ · {starTimer}s</div>
                      <div style={{fontSize:13,color:"#fff9c4",fontWeight:600,lineHeight:1.4}}>{starMission.title}</div>
                    </div>
                    <div><div style={{fontSize:14,color:C.orange,fontWeight:800,fontFamily:"'Cinzel',serif"}}>+{starMission.xp}</div><div style={{fontSize:9,color:C.orange+"88"}}>XP</div></div>
                  </div>
                  <div style={{marginTop:10,height:3,background:"#1a1400",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(starTimer/90)*100}%`,background:`linear-gradient(90deg,${C.orange}88,${C.orange})`,borderRadius:2,transition:"width 1s linear",boxShadow:`0 0 8px ${C.orange}`}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={()=>{addXP(starMission.xp);setStarMission(null);clearInterval(starRef.current);}} style={{flex:2,background:C.orange,border:"none",borderRadius:9,padding:"9px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:12,cursor:"pointer"}}>¡Completar! +{starMission.xp} XP</button>
                    <button onClick={()=>{setStarMission(null);clearInterval(starRef.current);}} style={{flex:1,background:"transparent",border:`1px solid ${C.orange}33`,borderRadius:9,padding:"9px",color:C.orange+"66",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Omitir</button>
                  </div>
                </div>
              )}

              <RobotDiary playerName={player.name} water={water} mood={currentMood} doneMissions={doneMissions} totalMissions={missions.length} attrs={attrs} arc={arc} level={player.level}/>

              {/* Attributes */}
              <Card>
                <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:12}}>ATRIBUTOS RPG</div>
                <div style={{display:"flex",gap:10}}>
                  {[["FUE",C.cta,"💪","Fuerza"],["SAB",C.green,"📖","Sabiduría"],["VOL",C.purple,"⚡","Voluntad"]].map(([k,c,ic,lbl])=>(
                    <div key={k} style={{flex:1,background:C.bg,border:`1px solid ${c}22`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                      <div style={{fontSize:16,marginBottom:4}}>{ic}</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:c,textShadow:`0 0 8px ${c}`}}>{attrs[k]}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:3,letterSpacing:1}}>{lbl}</div>
                    </div>
                  ))}
                </div>
                {hybrid&&<div style={{marginTop:12,padding:"8px 12px",background:hybrid.color+"10",border:`1px solid ${hybrid.color}30`,borderRadius:10,fontSize:12,color:hybrid.color,textAlign:"center"}}>✦ {hybrid.label} — accesorio especial activo</div>}
              </Card>

              {/* Stats */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                {[
                  {icon:"⚖️",val:bmi||"—",label:"IMC",badge:bmiLabel||"—",c:bmiColor},
                  {icon:"😴",val:`${profile.sleep}h`,label:"Sueño",badge:parseFloat(profile.sleep)>=7?"Óptimo":"Mejorar",c:parseFloat(profile.sleep)>=7?C.green:C.orange},
                  {icon:"⚡",val:`${profile.stress}/10`,label:"Estrés",badge:profile.stress<=4?"Bajo":profile.stress<=6?"Medio":"Alto",c:profile.stress<=4?C.green:profile.stress<=6?C.orange:"#f87171"},
                  {icon:"💧",val:`${water}/8`,label:"Agua",badge:water>=8?"¡Lleno!":water>=4?"Mitad":"Seco",c:water>=8?C.green:water>=4?C.orange:"#60a5fa"},
                ].map((s,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                    <div style={{fontSize:17,marginBottom:4}}>{s.icon}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:C.text}}>{s.val}</div>
                    <div style={{fontSize:9,color:C.muted,margin:"3px 0 5px"}}>{s.label}</div>
                    <div style={{fontSize:9,borderRadius:5,padding:"2px 4px",background:s.c+"20",color:s.c,fontWeight:700}}>{s.badge}</div>
                  </div>
                ))}
              </div>

              <WaterTank water={water} setWater={setWater} addXP={addXP} waterXPGiven={waterXPGiven} setWaterXPGiven={setWaterXPGiven} arc={arc}/>

              {/* Mood */}
              <Card>
                <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:12}}>ESTADO DE ÁNIMO</div>
                <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:moodLog.length?10:0}}>
                  {MOODS.map(m=>(
                    <button key={m.v} onClick={()=>logMood(m.v)} style={{border:`1.5px solid ${mood===m.v?arc.aura:C.border}`,borderRadius:12,padding:"10px 12px",background:mood===m.v?arc.aura+"18":"transparent",cursor:"pointer",transition:"all 0.2s",boxShadow:mood===m.v?`0 0 12px ${arc.aura}44`:"none"}}>
                      <div style={{fontSize:20}}>{m.e}</div>
                      <div style={{fontSize:9,color:C.muted,marginTop:3}}>{m.l}</div>
                    </button>
                  ))}
                </div>
                {moodLog.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{moodLog.slice(-5).map((m,i)=><span key={i} style={{background:C.bg,borderRadius:6,padding:"3px 8px",fontSize:10,color:C.muted,border:`1px solid ${C.border}`}}>{MOODS[m.v-1]?.e} {m.t}</span>)}</div>}
              </Card>

              {/* Missions preview */}
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontSize:10,color:C.muted,letterSpacing:3}}>MISIONES DE HOY</span>
                  <button onClick={()=>setTab("misiones")} style={{background:"none",border:"none",color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Ver todas →</button>
                </div>
                <div style={{height:4,background:C.bg,borderRadius:2,overflow:"hidden",marginBottom:12}}>
                  <div style={{height:"100%",width:`${(doneMissions/missions.length)*100}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:2,transition:"width 0.6s",boxShadow:`0 0 10px ${C.green}`}}/>
                </div>
                {missions.slice(0,4).map((m,i)=>(
                  <div key={m.id} onClick={()=>completeMission(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<3?`1px solid ${C.bg}`:"none",cursor:"pointer",opacity:m.done?0.4:1,transition:"all 0.4s",transform:completedAnim===i?"scale(1.02)":"scale(1)"}}>
                    <div style={{width:22,height:22,border:`1.5px solid ${m.done?C.green:C.border}`,borderRadius:6,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.4s",boxShadow:m.done?`0 0 10px ${C.green}`:"none"}}>{m.done?"✓":""}</div>
                    <span style={{fontSize:13,flex:1,color:"#94a3b8"}}>{m.icon} {m.title}</span>
                    {m.difficulty==="epic"&&<span style={{fontSize:9,color:C.purple,background:C.purple+"15",border:`1px solid ${C.purple}33`,borderRadius:5,padding:"2px 7px"}}>ÉPICA</span>}
                    <span style={{fontSize:10,color:C.green,border:`1px solid ${C.green}30`,borderRadius:5,padding:"2px 8px",fontWeight:700}}>+{m.xp}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* MAPA */}
        {tab==="mapa"&&(
          <div style={{maxWidth:700,margin:"0 auto",padding:"24px 16px 40px"}}>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:6}}>🗺 Mapa del Viaje</h2>
            <p style={{fontSize:13,color:C.muted,marginBottom:20}}>Tu robot avanza por el mundo cada vez que subes de nivel. Toca cada etapa para ver detalles.</p>
            <WorldMap level={player.level} totalXP={totalXP} playerName={player.name} archetype={player.archetype} epicDone={epicDone} attrs={attrs}/>
            {/* Stage list */}
            <div style={{marginTop:8}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:14}}>TODAS LAS ETAPAS</div>
              {MAP_STAGES.map((stage,i)=>{
                const unlocked=player.level>=stage.minLevel;
                const isCurrent=getCurrentStage(player.level).id===stage.id;
                return(
                  <div key={stage.id} style={{background:C.card,border:`1px solid ${isCurrent?stage.color+"55":unlocked?stage.color+"22":C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:14,opacity:unlocked?1:0.5,boxShadow:isCurrent?`0 0 20px ${stage.color}18`:"none"}}>
                    <div style={{width:40,height:40,borderRadius:12,background:unlocked?stage.color+"20":C.bg,border:`1px solid ${unlocked?stage.color+"44":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{stage.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <span style={{fontSize:14,color:unlocked?C.text:C.muted,fontWeight:600}}>{stage.label}</span>
                        {isCurrent&&<span style={{fontSize:9,color:stage.color,background:stage.color+"18",borderRadius:5,padding:"2px 8px",border:`1px solid ${stage.color}33`}}>ACTUAL</span>}
                        {!unlocked&&<span style={{fontSize:9,color:C.muted}}>🔒 Nv.{stage.minLevel}</span>}
                      </div>
                      <div style={{fontSize:12,color:C.muted}}>{stage.sublabel}</div>
                    </div>
                    {unlocked&&<div style={{fontSize:18,color:stage.color}}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MISIONES */}
        {tab==="misiones"&&(
          <div style={S.page}>
            <h2 style={S.ptitle}>◈ Misiones Diarias</h2>
            <p style={S.psub}>Las <span style={{color:C.purple,fontWeight:700}}>ÉPICAS</span> desbloquean los efectos más brillantes</p>
            <Card style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,color:"#8892a4"}}>Progreso de hoy</span>
                <span style={{fontSize:12,color:C.green,fontWeight:700}}>{doneMissions} / {missions.length}</span>
              </div>
              <XPBar xp={doneMissions} xpNext={missions.length} label={false}/>
              <div style={{display:"flex",gap:12,marginTop:12}}>
                {[["FUE",C.cta,"💪"],["SAB",C.green,"📖"],["VOL",C.purple,"⚡"]].map(([k,c,ic])=>(
                  <div key={k} style={{fontSize:11,color:c}}>{ic} {k}: {attrs[k]}</div>
                ))}
              </div>
            </Card>
            {missions.map((m,i)=>(
              <div key={m.id} style={{background:m.difficulty==="epic"?`linear-gradient(135deg,${C.card},#0a0a18)`:C.card,border:`1px solid ${m.done?C.border:m.difficulty==="epic"?C.purple+"44":C.green+"28"}`,borderRadius:16,padding:"16px 18px",marginBottom:10,boxShadow:m.difficulty==="epic"&&!m.done?`0 0 20px ${C.purple}15`:"none",transition:"all 0.4s",transform:completedAnim===i?"scale(1.015)":"scale(1)"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>completeMission(i)}>
                  <div style={{width:34,height:34,border:`1.5px solid ${m.done?C.green:m.difficulty==="epic"?C.purple:C.border}`,borderRadius:10,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:m.done?"#000":C.muted,fontWeight:800,transition:"all 0.4s",boxShadow:m.done?`0 0 14px ${C.green}`:m.difficulty==="epic"?`0 0 10px ${C.purple}33`:"none",opacity:m.done?0.7:1}}>{m.done?"✓":m.icon}</div>
                  <div style={{flex:1,opacity:m.done?0.45:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <div style={{fontSize:14,color:m.difficulty==="epic"?C.purple:C.text,fontWeight:600}}>{m.title}</div>
                      {m.difficulty==="epic"&&!m.done&&<span style={{fontSize:9,color:C.purple,background:C.purple+"15",border:`1px solid ${C.purple}33`,borderRadius:5,padding:"2px 7px"}}>ÉPICA 🔓</span>}
                    </div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:4}}>{m.sub}</div>
                    <div style={{fontSize:11,color:m.difficulty==="epic"?C.purple:arc.aura,fontStyle:"italic",opacity:0.8}}>"{m.lore}"</div>
                    {!m.done&&MISSION_ATTRS[m.id]&&(
                      <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                        {Object.entries(MISSION_ATTRS[m.id]).filter(([,v])=>v>0).map(([k,v])=>(
                          <span key={k} style={{fontSize:9,color:k==="FUE"?C.cta:k==="SAB"?C.green:C.purple,background:(k==="FUE"?C.cta:k==="SAB"?C.green:C.purple)+"15",borderRadius:5,padding:"2px 7px"}}>+{v} {k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,opacity:m.done?0.4:1}}>
                    <div style={{fontSize:13,color:m.difficulty==="epic"?C.purple:C.green,fontWeight:700}}>+{m.xp} XP</div>
                    <div style={{fontSize:9,color:C.muted,textTransform:"capitalize",marginTop:2}}>{m.area}</div>
                  </div>
                </div>
                {!m.done&&<WhyBox text={m.why} color={m.difficulty==="epic"?C.purple:arc.aura}/>}
              </div>
            ))}
          </div>
        )}

        {/* LOGROS */}
        {tab==="logros"&&(
          <AchievementsScreen stats={{level:player.level,streak:player.streak,totalXP,epicDone,attrs,totalMissions:totalMissionsCompleted,waterCompleted,moodDays,dayPerfect}} unlockedAchievements={unlockedAchievements}/>
        )}

        {/* SALUD */}
        {tab==="salud"&&(
          <div style={S.page}>
            <h2 style={S.ptitle}>✦ Salud</h2>
            <p style={S.psub}>Tu cuerpo es el primer campo de batalla</p>
            <div style={{background:C.orange+"08",border:`1px solid ${C.orange}30`,borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#94a3b8",lineHeight:1.75}}>⚕️ <strong style={{color:C.orange}}>Aviso:</strong> Contenido informativo. No reemplaza consulta médica.</div>
            {bmi&&<Card glow={bmiColor}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:10,color:C.muted,letterSpacing:2,marginBottom:4}}>IMC</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:36,color:bmiColor,textShadow:`0 0 12px ${bmiColor}`}}>{bmi}</div>
                  <div style={{fontSize:12,color:bmiColor,marginTop:4}}>{bmiLabel}</div>
                </div>
                <div style={{fontSize:12,color:C.muted,lineHeight:2.4,textAlign:"right"}}>
                  <div>Peso <span style={{color:"#94a3b8"}}>{profile.weight}kg</span></div>
                  <div>Talla <span style={{color:"#94a3b8"}}>{profile.height}cm</span></div>
                  <div>Agua <span style={{color:C.green}}>{waterGoal}L/día</span></div>
                </div>
              </div>
            </Card>}
            <div style={S.section}>Plan Físico</div>
            {[
              profile.goals.includes("Perder peso")&&{icon:"🚶",t:"Cardio moderado",d:"30 min de caminata rápida. Zona 60-70% FC máx — donde el cuerpo usa más grasa.",f:"5x/sem",c:C.green},
              profile.goals.includes("Ganar músculo")&&{icon:"💪",t:"Entrenamiento de fuerza",d:"Sentadillas, press, jalones. 3-4 series de 8-12 reps.",f:"3x/sem",c:C.cta},
              profile.goals.includes("Más energía")&&{icon:"⚡",t:"HIIT suave",d:"20 min: 30s esfuerzo alto, 90s suave. Aumenta mitocondrias.",f:"3x/sem",c:C.orange},
              {icon:"🧘",t:"Movilidad y flexibilidad",d:"15 min de estiramientos. Reduce lesiones y activa el sistema nervioso parasimpático.",f:"Diario",c:C.purple},
              {icon:"💧",t:`Meta: ${waterGoal}L de agua`,d:"Calculado según tu peso (33ml/kg). Distribuye a lo largo del día.",f:"Diario",c:C.green},
            ].filter(Boolean).map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${p.c}`,borderColor:p.c+"30"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.t}</div>
                      <span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span>
                    </div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.75}}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={S.section}>Chequeos Recomendados</div>
            {[
              parseFloat(profile.age)>=35&&{icon:"🩸",t:"Perfil lipídico",d:"Colesterol total, HDL, LDL y triglicéridos.",f:"Anual",c:"#f87171"},
              parseFloat(profile.age)>=30&&{icon:"🔬",t:"Glucosa en ayuno",d:"Detecta prediabetes antes de que se desarrolle.",f:"Anual",c:C.orange},
              profile.conditions.includes("Diabetes")&&{icon:"📊",t:"HbA1c",d:"Promedio de glucosa de los últimos 3 meses.",f:"Trimestral",c:C.orange},
              profile.conditions.includes("Hipertensión")&&{icon:"❤️",t:"Presión en casa",d:"Mañana y noche durante 7 días.",f:"Mensual",c:"#f43f5e"},
              {icon:"☀️",t:"Vitamina D y B12",d:"Deficiencias muy comunes en adultos jóvenes urbanos.",f:"Anual",c:C.orange},
              (profile.conditions.includes("Ansiedad")||profile.conditions.includes("Depresión"))&&{icon:"💬",t:"Psicólogo o psiquiatra",d:"La TCC tiene evidencia sólida.",f:"Prioritario",c:C.purple},
              {icon:"🦷",t:"Examen dental",d:"Relacionado con inflamación sistémica.",f:"6 meses",c:C.green},
            ].filter(Boolean).map((r,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${r.c}`,borderColor:r.c+"22"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:14,color:C.text,fontWeight:600}}>{r.t}</div>
                      <span style={{fontSize:10,background:r.c+"20",color:r.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{r.f}</span>
                    </div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.75}}>{r.d}</div>
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
            <Card glow={C.green}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:8}}>RESPIRACIÓN 4-7-8</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.85,marginBottom:4}}>Activa el nervio vago y cambia el sistema nervioso a parasimpático (calma) en minutos.</p>
              <p style={{fontSize:12,color:C.muted,marginBottom:16,fontStyle:"italic"}}>Inhala 4s · Sostén 7s · Exhala 8s</p>
              {breathActive?(
                <div style={{textAlign:"center",padding:"12px 0"}}>
                  <div style={{width:90,height:90,borderRadius:"50%",border:`2px solid ${C.green}`,background:C.green+"10",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 30px ${C.green}88`,animation:breathPhase==="inhala"?"expand 4s ease forwards":breathPhase==="exhala"?"contract 8s ease forwards":"none"}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:2}}>{breathPhase}</span>
                  </div>
                  <button onClick={stopBreath} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 20px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Detener</button>
                </div>
              ):<button onClick={startBreath} style={{...S.btn,background:C.green,color:"#000",boxShadow:`0 0 20px ${C.green}44`}}>Iniciar respiración</button>}
            </Card>
            <div style={S.section}>Prácticas con Evidencia</div>
            {[
              {icon:"🧠",t:"Meditación matutina",d:"10 min al despertar. Meta-análisis de 209 estudios (JAMA 2014): reduce ansiedad y depresión.",f:"Mañana",c:C.purple},
              {icon:"✍️",t:"Journaling de gratitud",d:"3 cosas buenas de hoy. Emmons & McCullough (2003): 25% más bienestar subjetivo.",f:"Noche",c:C.cta},
              {icon:"🌑",t:"Desconexión digital",d:"1h sin redes. U. of Pennsylvania (2018): reduce soledad y depresión significativamente.",f:"Diario",c:C.green},
              {icon:"🌅",t:"Luz solar matutina",d:"10-15 min antes de las 10AM. Regula cortisol y prepara melatonina nocturna.",f:"Mañana",c:C.orange},
              parseInt(profile.stress)>=6&&{icon:"🌬️",t:"Pausas ultradianas",d:"Cada 90 min: 3 respiraciones profundas. El cerebro necesita reset activo.",f:"C/90 min",c:C.green},
            ].filter(Boolean).map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${p.c}`,borderColor:p.c+"25"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.t}</div>
                      <span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span>
                    </div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={S.section}>Lecturas Esenciales</div>
            {[
              {t:"Atomic Habits",a:"James Clear",tag:"Hábitos",c:C.green,d:"El sistema más práctico para construir hábitos. El entorno importa más que la fuerza de voluntad."},
              {t:"Por qué dormimos",a:"Matthew Walker",tag:"Sueño",c:C.purple,d:"La ciencia más actualizada del sueño. Cambia para siempre cómo ves esas 7-9 horas."},
              {t:"El poder del ahora",a:"Eckhart Tolle",tag:"Mindfulness",c:C.green,d:"La ansiedad vive en el futuro. La paz solo existe en el presente."},
              {t:"Los 7 hábitos",a:"Stephen Covey",tag:"Efectividad",c:C.orange,d:"Desarrollo personal basado en carácter y principios universales."},
              {t:"Feeling Good",a:"David Burns",tag:"TCC",c:C.cta,d:"Manual de TCC clínicamente validado para ansiedad y depresión."},
            ].map((b,i)=>(
              <Card key={i}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:C.text,fontWeight:600,marginBottom:2}}>📖 {b.t}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:6}}>— {b.a}</div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>{b.d}</div>
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

const S={
  btn:{width:"100%",background:C.green,border:"none",borderRadius:12,padding:"14px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1,transition:"all 0.3s",boxShadow:`0 0 20px ${C.green}44`},
  setupCard:{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"36px 28px"},
  badge:{fontSize:9,color:C.muted,letterSpacing:5,textTransform:"uppercase",marginBottom:12},
  stitle:{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:8},
  ssub:{fontSize:13,color:C.muted,marginBottom:22,lineHeight:1.7},
  label:{display:"block",fontSize:10,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:7},
  input:{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"},
  page:{maxWidth:660,margin:"0 auto",padding:"24px 16px 40px"},
  ptitle:{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:6},
  psub:{fontSize:13,color:C.muted,marginBottom:20},
  section:{fontSize:9,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:12,marginTop:22,paddingBottom:8,borderBottom:`1px solid ${C.card}`},
};

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0F172A;margin:0;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
  input::placeholder{color:#334155;}
  button:hover{filter:brightness(1.12);}
  @keyframes aura-breathe{0%,100%{opacity:0.85;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
  @keyframes dark-breathe{0%,100%{opacity:0.4;}50%{opacity:0.6;}}
  @keyframes ground-pulse{0%,100%{opacity:0.7;}50%{opacity:1;transform:scaleX(1.1);}}
  @keyframes ring-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes float-p{0%{transform:translateY(0);opacity:0.3;}100%{transform:translateY(-12px);opacity:0.55;}}
  @keyframes rain-fall{0%{transform:translateY(-20px);opacity:0;}10%{opacity:0.4;}90%{opacity:0.4;}100%{transform:translateY(110vh);opacity:0;}}
  @keyframes rain-streak{0%{transform:translateY(-100%);opacity:0;}5%{opacity:1;}95%{opacity:0.6;}100%{transform:translateY(200%);opacity:0;}}
  @keyframes expand{0%{transform:scale(1);}100%{transform:scale(1.3);}}
  @keyframes contract{0%{transform:scale(1.3);}100%{transform:scale(1);}}
  @keyframes pop-in{from{opacity:0;transform:scale(0.6);}to{opacity:1;transform:scale(1);}}
  @keyframes fade-up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slide-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
  @keyframes slide-up-toast{0%{opacity:0;transform:translateX(-50%) translateY(20px);}15%{opacity:1;transform:translateX(-50%) translateY(0);}80%{opacity:1;}100%{opacity:0;transform:translateX(-50%) translateY(-10px);}}
  @keyframes xp-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5);}30%{opacity:1;transform:translate(-50%,-80%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-120%) scale(1);}100%{opacity:0;transform:translate(-50%,-160%) scale(0.8);}}
  @keyframes float-xp{0%{opacity:0;transform:translateX(-50%) scale(0.8);}20%{opacity:1;transform:translateX(-50%) scale(1.1);}70%{opacity:1;transform:translateX(-50%) translateY(-30px);}100%{opacity:0;transform:translateX(-50%) translateY(-60px);}}
  @keyframes pulse-soft{0%,100%{opacity:0.6;}50%{opacity:1;}}
  @keyframes future-pulse{0%,100%{opacity:0.11;}50%{opacity:0.19;}}
  @keyframes star-pulse{0%,100%{box-shadow:0 0 24px #F59E0B44;}50%{box-shadow:0 0 36px #F59E0B66;}}
  @keyframes star-sweep{0%{transform:translateX(-100%);}100%{transform:translateX(400%);}}
  @keyframes star-drift{0%{transform:translateY(0);}100%{transform:translateY(8px);}}
  @keyframes nebula-drift{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,15px) scale(1.1);}}
  @keyframes wings-flap{0%,100%{transform:scaleY(1);}50%{transform:scaleY(0.92);}}
  @keyframes hybrid-pulse{0%,100%{opacity:0.8;}50%{opacity:1;}}
  @keyframes wave{0%{transform:scaleX(1);}50%{transform:scaleX(1.1);}100%{transform:scaleX(1);}}
  @keyframes cta-pulse{0%,100%{box-shadow:0 0 40px #F9731655;}50%{box-shadow:0 0 60px #F9731688;}}
  @keyframes robot-idle{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
  @keyframes node-pulse{0%,100%{opacity:1;r:18;}50%{opacity:0.8;r:20;}}
  @media(max-width:600px){
    div[style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    div[style*="auto-fit, minmax(240"]{grid-template-columns:1fr!important;}
    div[style*="auto-fit, minmax(180"]{grid-template-columns:1fr!important;}
  }
`;
