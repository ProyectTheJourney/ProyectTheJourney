import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const STORAGE_KEY = "thejourney_v7";

const C = {
  bg:"#0F172A", card:"#1E293B", border:"#334155",
  green:"#10B981", orange:"#F59E0B", purple:"#8B5CF6",
  text:"#F1F5F9", muted:"#64748B", cta:"#F97316",
};

// ─── MAP: Planets as nodes ────────────────────────────────────────
const MAP_STAGES = [
  { id:"origin",  label:"Origen",      sublabel:"El inicio",            minLevel:1,  planet:"🌑", color:"#64748B", glow:"#94a3b8", unlockMsg:"El viaje comienza aquí." },
  { id:"dawn",    label:"Despertar",   sublabel:"Primera luz",          minLevel:4,  planet:"🌍", color:"#10B981", glow:"#10B981", unlockMsg:"Los primeros pasos son los más importantes." },
  { id:"forge",   label:"La Forja",    sublabel:"Temple de acero",      minLevel:8,  planet:"🔴", color:"#EF4444", glow:"#EF4444", unlockMsg:"Aquí se forjan las leyendas." },
  { id:"warrior", label:"El Guerrero", sublabel:"Poder forjado",        minLevel:12, planet:"🟠", color:"#F97316", glow:"#F97316", unlockMsg:"¡GUERRERO! Tu disciplina es innegable." },
  { id:"ascent",  label:"Ascensión",   sublabel:"Más allá del límite",  minLevel:18, planet:"🔵", color:"#8B5CF6", glow:"#8B5CF6", unlockMsg:"Solo el 1% llega aquí." },
  { id:"stellar", label:"Estelar",     sublabel:"Entre las estrellas",  minLevel:25, planet:"🪐", color:"#06B6D4", glow:"#06B6D4", unlockMsg:"¡Navegas entre galaxias!" },
  { id:"legend",  label:"Leyenda",     sublabel:"Inmortal",             minLevel:35, planet:"⭐", color:"#F59E0B", glow:"#F59E0B", unlockMsg:"LEYENDA. Pocos llegan. Tú lo lograste." },
];

const ARTIFACTS = [
  { id:"warrior_helmet",    name:"Casco del Guerrero",      icon:"🪖", attr:"FUE", bonus:5,  minLevel:5,  color:"#EF4444", desc:"Forjado en mil entrenamientos." },
  { id:"titan_gloves",      name:"Guantes de Titán",        icon:"🥊", attr:"FUE", bonus:8,  minLevel:12, color:"#F97316", desc:"Cada golpe resuena en el cosmos." },
  { id:"steel_chestplate",  name:"Coraza de Acero",         icon:"🛡",  attr:"FUE", bonus:12, minLevel:20, color:"#EF4444", desc:"Impenetrable. Como tu disciplina." },
  { id:"visionary_glasses", name:"Gafas de Visionario",     icon:"🥽", attr:"SAB", bonus:5,  minLevel:5,  color:"#10B981", desc:"Ven lo que otros no pueden ver." },
  { id:"ancient_book",      name:"Libro Antiguo",           icon:"📜", attr:"SAB", bonus:8,  minLevel:12, color:"#06B6D4", desc:"Siglos de sabiduría en tus manos." },
  { id:"knowledge_amulet",  name:"Amuleto del Conocimiento",icon:"🔮", attr:"SAB", bonus:12, minLevel:20, color:"#10B981", desc:"La mente que nunca deja de crecer." },
  { id:"resilience_cape",   name:"Capa de Resiliencia",     icon:"🌊", attr:"VOL", bonus:5,  minLevel:5,  color:"#8B5CF6", desc:"Ante los vientos más fuertes, permaneces." },
  { id:"determination_ring",name:"Anillo de Determinación", icon:"💍", attr:"VOL", bonus:8,  minLevel:12, color:"#A78BFA", desc:"Tu voluntad no tiene fin." },
  { id:"focus_bracelet",    name:"Brazalete de Enfoque",    icon:"⌚", attr:"VOL", bonus:12, minLevel:20, color:"#8B5CF6", desc:"Concentración absoluta." },
];

const MISSION_ATTRS = {
  1:{FUE:3,SAB:1,VOL:2}, 2:{FUE:1,SAB:2,VOL:3}, 3:{FUE:2,SAB:1,VOL:2},
  4:{FUE:1,SAB:4,VOL:1}, 5:{FUE:1,SAB:2,VOL:3}, 6:{FUE:2,SAB:2,VOL:2},
  7:{FUE:1,SAB:3,VOL:2}, 8:{FUE:2,SAB:1,VOL:2}, 9:{FUE:5,SAB:2,VOL:3}, 10:{FUE:2,SAB:5,VOL:3},
};

const ACHIEVEMENTS = [
  { id:"first_step",    icon:"👣", title:"Primer Paso",        desc:"Completa tu primera misión",            check:(s)=>s.totalMissions>=1 },
  { id:"hydrated",      icon:"💧", title:"Bebedor Legendario", desc:"Completa el tanque de agua un día",     check:(s)=>s.waterCompleted>=1 },
  { id:"level3",        icon:"⭐", title:"Viajero Estelar",    desc:"Alcanza el nivel 3",                    check:(s)=>s.level>=3 },
  { id:"streak3",       icon:"🔥", title:"3 en Raya",          desc:"Racha de 3 días",                       check:(s)=>s.streak>=3 },
  { id:"first_epic",    icon:"🔥", title:"El Primer Fuego",    desc:"Completa tu primera misión épica",      check:(s)=>s.epicDone },
  { id:"all_missions",  icon:"✅", title:"Día Perfecto",       desc:"Todas las misiones en un día",          check:(s)=>s.dayPerfect>=1 },
  { id:"constante",     icon:"🌅", title:"Constante",          desc:"Registra ánimo 5 días",                 check:(s)=>s.moodDays>=5 },
  { id:"first_artifact",icon:"🎖", title:"Primer Artefacto",   desc:"Equipa tu primer artefacto",            check:(s)=>s.equippedCount>=1 },
  { id:"level10",       icon:"⚔",  title:"El Guerrero",        desc:"Alcanza el nivel 10",                   check:(s)=>s.level>=10 },
  { id:"streak7",       icon:"🗓", title:"Semana Imparable",   desc:"7 días de racha",                       check:(s)=>s.streak>=7 },
  { id:"xp500",         icon:"⚡", title:"500 XP",             desc:"Acumula 500 XP",                        check:(s)=>s.totalXP>=500 },
  { id:"water10",       icon:"🌊", title:"Ola de Hidratación", desc:"Tanque completo 10 días",               check:(s)=>s.waterCompleted>=10 },
  { id:"attrs50",       icon:"💪", title:"Polivalente",        desc:"Suma 50 puntos de atributos",           check:(s)=>(s.attrs.FUE+s.attrs.SAB+s.attrs.VOL)>=50 },
  { id:"level20",       icon:"✦",  title:"Leyenda Viviente",   desc:"Alcanza el nivel 20",                   check:(s)=>s.level>=20 },
  { id:"streak30",      icon:"👑", title:"El Mes Perfecto",    desc:"30 días de racha",                      check:(s)=>s.streak>=30 },
];

const STREAK_REWARDS = [
  { day:7,  reward:"+100 XP bonus",      icon:"🎁", xp:100 },
  { day:14, reward:"+200 XP bonus",      icon:"💎", xp:200 },
  { day:30, reward:"+500 XP LEGENDARIO", icon:"👑", xp:500 },
];

const LEVEL_TITLES = [
  {min:1, title:"El Desconocido",      rank:"Rango F"},
  {min:4, title:"Viajero Estelar",     rank:"Rango E"},
  {min:8, title:"Guardián del Alba",   rank:"Rango D"},
  {min:12,title:"Forjador de Hábitos", rank:"Rango C"},
  {min:18,title:"Caballero del Camino",rank:"Rango B"},
  {min:25,title:"Leyenda Viviente",    rank:"Rango A"},
  {min:35,title:"Transcendente",       rank:"Rango S"},
  {min:50,title:"El Maestro",          rank:"Rango SS"},
];

const AVATAR_ACCESSORIES = [
  {minLevel:1, id:"base",          epic:false},
  {minLevel:4, id:"eye_glow",      epic:false},
  {minLevel:8, id:"neon_aura",     epic:false},
  {minLevel:12,id:"shoulder_pads", epic:false},
  {minLevel:18,id:"light_wings",   epic:true},
  {minLevel:25,id:"crown",         epic:true},
  {minLevel:35,id:"full_armor",    epic:true},
];

const WATER_MSGS = [
  "Estás seco… ¡bebe y revive! 💀","Una gota en el desierto…",
  "El guerrero necesita hidratarse ⚔","¡Mitad del camino, sigue así! 💧",
  "Casi ahí, no pares ahora","¡Falta poco, viajero!",
  "Un vaso más y llegas…","¡Último vaso! ¿Lo terminas?",
  "¡TANQUE LLENO! Máximo poder 💎",
];

const ARCHETYPES = [
  {id:"warrior",name:"El Guerrero",sub:"Disciplina · Fuerza · Acción",lore:"Tu poder nace de la constancia.",icon:"⚔",aura:"#F97316",mainAttr:"FUE",bg:"radial-gradient(ellipse at 50% -10%, #F9731622 0%, transparent 65%)"},
  {id:"sage",   name:"El Sabio",  sub:"Conocimiento · Claridad · Propósito",lore:"La mente es tu arma más poderosa.",icon:"✦",aura:"#10B981",mainAttr:"SAB",bg:"radial-gradient(ellipse at 50% -10%, #10B98122 0%, transparent 65%)"},
  {id:"explorer",name:"El Explorador",sub:"Equilibrio · Aventura · Evolución",lore:"Tu camino tiene infinitos horizontes.",icon:"◎",aura:"#8B5CF6",mainAttr:"VOL",bg:"radial-gradient(ellipse at 50% -10%, #8B5CF622 0%, transparent 65%)"},
];

const STAGE_LEVELS=[1,11,26,51,81];

const MISSIONS_DATA=[
  {id:1, title:"Forja tu cuerpo",       sub:"20 min de movimiento consciente",    xp:35,icon:"⚡",area:"cuerpo",difficulty:"normal",lore:"El guerrero forja su cuerpo en el fuego.",     why:"20 min de ejercicio elevan dopamina, BDNF y serotonina."},
  {id:2, title:"Silencia la tormenta",  sub:"10 min de meditación o respiración", xp:30,icon:"◎", area:"mente", difficulty:"normal",lore:"La mente en calma ve lo que el caos oculta.",  why:"10 min diarios reducen el volumen de la amígdala en 8 semanas."},
  {id:3, title:"El río de la vida",     sub:"8 vasos de agua durante el día",     xp:15,icon:"💧",area:"cuerpo",difficulty:"easy",  lore:"Tu cuerpo es 70% agua.",                       why:"Deshidratación del 2% reduce capacidad cognitiva 20%."},
  {id:4, title:"Alimenta tu mente",     sub:"Lee 15 páginas de cualquier libro",  xp:25,icon:"📖",area:"mente", difficulty:"normal",lore:"Cada página leída es un nivel ganado.",          why:"15 páginas diarias = 18 libros al año."},
  {id:5, title:"El gran silencio",      sub:"1 hora sin redes sociales",          xp:20,icon:"🌑",area:"mente", difficulty:"normal",lore:"Tu atención es tu recurso más escaso.",          why:"Cada notificación interrumpe el foco ~23 min."},
  {id:6, title:"El descanso del héroe", sub:"Duerme entre 7 y 9 horas",           xp:40,icon:"🌙",area:"cuerpo",difficulty:"normal",lore:"Los héroes se restauran en la oscuridad.",      why:"Dormir menos de 6h deteriora igual que 48h sin dormir."},
  {id:7, title:"Crónicas del viaje",    sub:"Escribe 3 cosas buenas de hoy",      xp:20,icon:"✍", area:"mente", difficulty:"normal",lore:"El que no recuerda su progreso no avanza.",     why:"El journaling entrena al cerebro para detectar lo positivo."},
  {id:8, title:"La caminata del sabio", sub:"Camina 5-10 min después de comer",   xp:15,icon:"🚶",area:"cuerpo",difficulty:"easy",  lore:"Los grandes pensadores caminaban.",             why:"10 min post-comida reduce el pico de glucosa hasta 30%."},
  {id:9, title:"ÉPICA: Entrena 45 min", sub:"Sesión completa de fuerza o cardio", xp:80,icon:"🔥",area:"cuerpo",difficulty:"epic",  lore:"Solo los forjados conocen este fuego.",        why:"45 min activan adaptaciones que sesiones cortas no logran."},
  {id:10,title:"ÉPICA: Ayuno digital",  sub:"4 horas completamente sin pantallas",xp:90,icon:"⚫",area:"mente", difficulty:"epic",  lore:"El silencio absoluto revela verdades.",         why:"El cerebro necesita períodos prolongados para consolidar aprendizajes."},
];

const CONDITIONS=["Diabetes","Hipertensión","Ansiedad","Depresión","Colesterol alto","Hipotiroidismo","Insomnio","Sedentarismo"];
const GOALS=["Perder peso","Ganar músculo","Reducir estrés","Mejorar sueño","Más energía","Salud mental","Más disciplina","Comer mejor"];
const MOODS=[{e:"😔",l:"Bajo",v:1},{e:"😐",l:"Regular",v:2},{e:"🙂",l:"Bien",v:3},{e:"😄",l:"Excelente",v:4}];
const NAV=[{id:"home",icon:"⌂",l:"Inicio"},{id:"mapa",icon:"🗺",l:"Mapa"},{id:"misiones",icon:"◈",l:"Misiones"},{id:"metas",icon:"🎯",l:"Metas"},{id:"artefactos",icon:"⚙",l:"Arsenal"},{id:"logros",icon:"🏆",l:"Logros"},{id:"salud",icon:"✦",l:"Salud"},{id:"mente",icon:"◎",l:"Mente"}];
const STAR_MISSIONS=[
  {title:"¡Estrella Fugaz! Sal a caminar 10 min",xp:80},
  {title:"¡Estrella Fugaz! Bebe 2 vasos de agua YA",xp:50},
  {title:"¡Estrella Fugaz! Haz 20 sentadillas",xp:70},
  {title:"¡Estrella Fugaz! Respira profundo 5 veces",xp:45},
  {title:"¡Estrella Fugaz! Escribe algo que te alegre",xp:55},
];

function save(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch{}}
function load(){try{const d=localStorage.getItem(STORAGE_KEY);return d?JSON.parse(d):null;}catch{return null;}}
function getLevelTitle(l){let t=LEVEL_TITLES[0];for(const lt of LEVEL_TITLES){if(l>=lt.min)t=lt;}return t;}
function getAcc(level,epicDone){return AVATAR_ACCESSORIES.filter(a=>level>=a.minLevel&&(!a.epic||epicDone));}
function getHybrid(archetype,attrs){
  const arc=ARCHETYPES.find(a=>a.id===archetype);if(!arc)return null;
  const main=attrs[arc.mainAttr]||0;
  const dom=Object.entries(attrs).filter(([k])=>k!==arc.mainAttr).find(([,v])=>v>main);
  if(!dom)return null;
  return{FUE:{label:"Guerrero Híbrido",color:C.cta},SAB:{label:"Sabio Híbrido",color:C.green},VOL:{label:"Explorador Híbrido",color:C.purple}}[dom[0]]||null;
}
function getArtifactBonus(equipped,attr){
  return equipped.reduce((sum,id)=>{const a=ARTIFACTS.find(x=>x.id===id);return a&&a.attr===attr?sum+a.bonus:sum;},0);
}

// ─── StarField ────────────────────────────────────────────────────
function StarField(){
  const stars=useMemo(()=>Array.from({length:60},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:Math.random()*2+0.4,dur:Math.random()*20+12,delay:Math.random()*15,op:Math.random()*0.5+0.1})),[]);
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,borderRadius:"50%",background:"#fff",opacity:s.op,animation:`star-drift ${s.dur}s ${s.delay}s ease-in-out infinite alternate`}}/>)}
      <div style={{position:"absolute",top:"8%",left:"12%",width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,#10B98110,transparent 70%)",animation:"nebula-drift 28s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"55%",right:"8%",width:150,height:150,borderRadius:"50%",background:"radial-gradient(circle,#8B5CF610,transparent 70%)",animation:"nebula-drift 32s 6s ease-in-out infinite reverse"}}/>
      <div style={{position:"absolute",top:"30%",left:"55%",width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,#F59E0B08,transparent 70%)",animation:"nebula-drift 24s 3s ease-in-out infinite"}}/>
    </div>
  );
}

// ─── PLANET MAP (like screenshots - planets as nodes with ship) ────
function PlanetMap({level,playerName,archetype,epicDone}){
  const arc=ARCHETYPES.find(a=>a.id===archetype)||ARCHETYPES[0];
  const currentIdx=MAP_STAGES.findLastIndex(s=>level>=s.minLevel);
  const [tooltip,setTooltip]=useState(null);
  const [shipX,setShipX]=useState(null);
  const [shipY,setShipY]=useState(null);
  const [isMoving,setIsMoving]=useState(false);
  const prevLevelRef=useRef(level);
  const animRef=useRef(null);

  // Planet positions in a winding path (portrait orientation)
  const positions=[
    {x:80, y:370},{x:200,y:300},{x:120,y:220},{x:260,y:160},{x:180,y:90},{x:310,y:40},{x:380,y:110},
  ];

  useEffect(()=>{
    if(shipX===null&&positions[currentIdx]){
      setShipX(positions[currentIdx].x);
      setShipY(positions[currentIdx].y);
    }
  },[]);

  // Animate ship when level changes
  useEffect(()=>{
    if(level>prevLevelRef.current&&shipX!==null){
      const newIdx=MAP_STAGES.findLastIndex(s=>level>=s.minLevel);
      const oldIdx=MAP_STAGES.findLastIndex(s=>prevLevelRef.current>=s.minLevel);
      if(newIdx>oldIdx&&positions[newIdx]){
        setIsMoving(true);
        const target=positions[newIdx];
        const start={x:shipX,y:shipY};
        const dur=1200;
        const t0=Date.now();
        function step(){
          const p=Math.min((Date.now()-t0)/dur,1);
          const ease=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
          setShipX(start.x+(target.x-start.x)*ease);
          setShipY(start.y+(target.y-start.y)*ease);
          if(p<1){animRef.current=requestAnimationFrame(step);}
          else{setShipX(target.x);setShipY(target.y);setIsMoving(false);}
        }
        animRef.current=requestAnimationFrame(step);
      }
    }
    prevLevelRef.current=level;
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[level]);

  const pathD=positions.reduce((acc,p,i)=>{
    if(i===0)return`M ${p.x} ${p.y}`;
    const prev=positions[i-1];
    return`${acc} Q ${prev.x+20} ${prev.y-15} ${(prev.x+p.x)/2} ${(prev.y+p.y)/2}`;
  },"");

  const sx=shipX??positions[currentIdx]?.x??80;
  const sy=shipY??positions[currentIdx]?.y??370;

  return(
    <div style={{background:"linear-gradient(180deg,#04060f 0%,#080d1e 40%,#0a0f20 100%)",border:`1px solid ${C.border}`,borderRadius:20,padding:"12px",marginBottom:16,overflow:"hidden",position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:3}}>MAPA DEL VIAJE</div>
          <div style={{fontSize:13,color:C.text,fontWeight:700,marginTop:2}}>
            {MAP_STAGES[currentIdx]?.planet} {MAP_STAGES[currentIdx]?.label}
            <span style={{color:MAP_STAGES[currentIdx]?.color,fontSize:10,fontWeight:400,marginLeft:6}}>— {MAP_STAGES[currentIdx]?.sublabel}</span>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.muted}}>Planeta {currentIdx+1}/{MAP_STAGES.length}</div>
          <div style={{fontSize:11,color:C.green,fontWeight:700}}>Nv.{level}</div>
        </div>
      </div>

      <svg viewBox="0 0 460 420" style={{width:"100%",height:"auto",display:"block"}}>
        <defs>
          <radialGradient id="mapspace" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#0d1535"/>
            <stop offset="60%" stopColor="#07091a"/>
            <stop offset="100%" stopColor="#030409"/>
          </radialGradient>
          <filter id="pglow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="mglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="sglow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="460" height="420" fill="url(#mapspace)" rx="14"/>

        {/* Background stars */}
        {[[40,30],[120,18],[220,45],[340,22],[420,55],[60,100],[180,75],[360,90],[420,160],[30,200],[150,190],[280,180],[400,220],[50,300],[200,280],[350,310],[430,350],[100,380],[300,370]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%4===0?1.4:0.8} fill="#fff" opacity={0.15+((i*13)%7)*0.06}/>
        ))}

        {/* Large background planet - top right */}
        <circle cx="400" cy="60" r="45" fill="#1a0d3d" opacity="0.7"/>
        <circle cx="400" cy="60" r="45" fill="none" stroke="#8B5CF6" strokeWidth="0.5" opacity="0.3"/>
        <ellipse cx="400" cy="60" rx="60" ry="12" fill="none" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 4" opacity="0.25"/>
        <circle cx="400" cy="60" r="38" fill="#130a2e" opacity="0.8"/>
        <circle cx="388" cy="48" r="10" fill="#1e1045" opacity="0.6"/>
        <circle cx="412" cy="70" r="7" fill="#160c38" opacity="0.5"/>

        {/* Distant small planet - bottom left */}
        <circle cx="25" cy="390" r="28" fill="#0d1f12" opacity="0.8"/>
        <circle cx="25" cy="390" r="28" fill="none" stroke="#10B981" strokeWidth="0.6" opacity="0.3"/>
        <circle cx="25" cy="390" r="22" fill="#0a180e" opacity="0.9"/>

        {/* Nebula mist */}
        <ellipse cx="240" cy="140" rx="120" ry="60" fill="#8B5CF6" fillOpacity="0.03" filter="url(#pglow)"/>
        <ellipse cx="100" cy="300" rx="90" ry="50" fill="#10B981" fillOpacity="0.04" filter="url(#pglow)"/>

        {/* PATH - dashed background */}
        <path d={pathD} fill="none" stroke="#1e2a44" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" opacity="0.7"/>

        {/* PATH - completed glowing */}
        {currentIdx>0&&<>
          <path d={positions.slice(0,currentIdx+1).reduce((acc,p,i)=>{
            if(i===0)return`M ${p.x} ${p.y}`;
            const prev=positions[i-1];
            return`${acc} Q ${prev.x+20} ${prev.y-15} ${(prev.x+p.x)/2} ${(prev.y+p.y)/2}`;
          },"")} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" filter="url(#sglow)" opacity="0.8"/>
        </>}

        {/* PLANET NODES */}
        {MAP_STAGES.map((stage,i)=>{
          const pos=positions[i];
          if(!pos)return null;
          const unlocked=level>=stage.minLevel;
          const isCurrent=i===currentIdx;
          const isNext=i===currentIdx+1;
          const r=isCurrent?22:18;
          const prevMin=MAP_STAGES[i-1]?.minLevel||1;
          const prog=isNext&&level>prevMin?Math.min(((level-prevMin)/(stage.minLevel-prevMin)),1):0;

          return(
            <g key={stage.id} onClick={()=>setTooltip(tooltip===i?null:i)} style={{cursor:"pointer"}}>
              {/* Outer glow for unlocked */}
              {unlocked&&<circle cx={pos.x} cy={pos.y} r={r+14} fill={stage.color} fillOpacity="0.08" filter="url(#pglow)"/>}
              {/* Pulse ring for current */}
              {isCurrent&&<circle cx={pos.x} cy={pos.y} r={r+8} fill="none" stroke={stage.color} strokeWidth="1.5" opacity="0.4" style={{animation:"node-pulse 2s ease-in-out infinite"}}/>}
              {/* Planet body */}
              <circle cx={pos.x} cy={pos.y} r={r} fill={unlocked?`${stage.color}28`:"#0d1225"} stroke={unlocked?stage.color:"#1e2a44"} strokeWidth={isCurrent?2.5:1.5}/>
              {/* Planet surface detail */}
              {unlocked&&<>
                <circle cx={pos.x-r*0.25} cy={pos.y-r*0.2} r={r*0.25} fill={stage.color} fillOpacity="0.15"/>
                <circle cx={pos.x+r*0.2} cy={pos.y+r*0.25} r={r*0.18} fill={stage.color} fillOpacity="0.1"/>
              </>}
              {/* Planet emoji */}
              <text x={pos.x} y={pos.y+(isCurrent?7:6)} textAnchor="middle" fontSize={isCurrent?18:14}>{stage.planet}</text>
              {/* Label */}
              <text x={pos.x} y={pos.y+r+14} textAnchor="middle" fontSize="8.5" fill={unlocked?stage.color:"#3d4f6a"} fontFamily="sans-serif" fontWeight={isCurrent?"bold":"normal"}>{stage.label}</text>
              {/* Lock */}
              {!unlocked&&<text x={pos.x+r*0.6} y={pos.y-r*0.6} fontSize="8">🔒</text>}
              {/* Progress ring for next planet */}
              {isNext&&prog>0&&(
                <circle cx={pos.x} cy={pos.y} r={r+4} fill="none" stroke={stage.color} strokeWidth="2"
                  strokeDasharray={`${prog*(2*Math.PI*(r+4))} ${2*Math.PI*(r+4)}`}
                  strokeLinecap="round" transform={`rotate(-90 ${pos.x} ${pos.y})`} opacity="0.5"/>
              )}
              {/* Stars/rewards for completed */}
              {unlocked&&i>0&&<>
                {[0,1,2].map(star=><text key={star} x={pos.x-10+star*10} y={pos.y-r-6} fontSize="7" textAnchor="middle">⭐</text>)}
              </>}
              {/* Tooltip */}
              {tooltip===i&&(
                <g>
                  <rect x={Math.min(pos.x-65,360)} y={pos.y-r-70} width="142" height="56" rx="8" fill="#1E293B" stroke={stage.color} strokeWidth="1"/>
                  <text x={Math.min(pos.x-65,360)+71} y={pos.y-r-50} textAnchor="middle" fontSize="10" fill={stage.color} fontFamily="sans-serif" fontWeight="bold">{stage.planet} {stage.label}</text>
                  <text x={Math.min(pos.x-65,360)+71} y={pos.y-r-36} textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="sans-serif">{unlocked?"✓ Desbloqueado":`Nv.${stage.minLevel} requerido`}</text>
                  <text x={Math.min(pos.x-65,360)+71} y={pos.y-r-22} textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="sans-serif">{stage.sublabel}</text>
                </g>
              )}
            </g>
          );
        })}

        {/* SPACESHIP - moves to current planet */}
        <g transform={`translate(${sx-16},${sy-48})`} style={{transition:isMoving?"none":"transform 0.1s",filter:`drop-shadow(0 0 6px ${arc.aura})`}}>
          {/* Engine flame */}
          <ellipse cx="16" cy="54" rx="5" ry="9" fill="#F97316" fillOpacity="0.85" filter="url(#sglow)" style={{animation:"flame-flicker 0.35s ease-in-out infinite alternate"}}/>
          <ellipse cx="16" cy="52" rx="3" ry="6" fill="#F59E0B" fillOpacity="0.95"/>
          {/* Glow under */}
          <ellipse cx="16" cy="60" rx="10" ry="4" fill={arc.aura} fillOpacity="0.25" filter="url(#sglow)"/>
          {/* Ship body */}
          <path d="M 16 4 L 25 32 L 16 27 L 7 32 Z" fill="#1E293B" stroke={arc.aura} strokeWidth="1.3"/>
          {/* Wings */}
          <path d="M 7 30 L 0 42 L 8 37 Z" fill={arc.aura} fillOpacity="0.7"/>
          <path d="M 25 30 L 32 42 L 24 37 Z" fill={arc.aura} fillOpacity="0.7"/>
          {/* Cockpit */}
          <ellipse cx="16" cy="17" rx="5" ry="7" fill={arc.aura} fillOpacity="0.28"/>
          <ellipse cx="16" cy="16" rx="3" ry="5" fill={arc.aura} fillOpacity="0.6"/>
          {/* Name */}
          <text x="16" y="-4" textAnchor="middle" fontSize="7.5" fill={C.text} fontFamily="sans-serif" fontWeight="bold">{playerName}</text>
          {/* Warp trail when moving */}
          {isMoving&&<ellipse cx="16" cy="58" rx="4" ry="14" fill={arc.aura} fillOpacity="0.3" filter="url(#mglow)"/>}
        </g>
      </svg>

      {/* Stage message */}
      <div style={{marginTop:8,padding:"8px 14px",background:MAP_STAGES[currentIdx]?.color+"14",border:`1px solid ${MAP_STAGES[currentIdx]?.color}28`,borderRadius:10,fontSize:11,color:MAP_STAGES[currentIdx]?.color,fontStyle:"italic",textAlign:"center"}}>
        "{MAP_STAGES[currentIdx]?.unlockMsg}"
      </div>

      {/* Next planet progress */}
      {currentIdx<MAP_STAGES.length-1&&(
        <div style={{marginTop:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:10,color:C.muted}}>Próximo: <span style={{color:MAP_STAGES[currentIdx+1]?.color}}>{MAP_STAGES[currentIdx+1]?.planet} {MAP_STAGES[currentIdx+1]?.label}</span></span>
            <span style={{fontSize:10,color:C.green,fontWeight:700}}>Nv.{MAP_STAGES[currentIdx+1]?.minLevel}</span>
          </div>
          <div style={{height:4,background:C.bg,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(((level-(MAP_STAGES[currentIdx]?.minLevel||1))/((MAP_STAGES[currentIdx+1]?.minLevel||2)-(MAP_STAGES[currentIdx]?.minLevel||1)))*100,100)}%`,background:`linear-gradient(90deg,${MAP_STAGES[currentIdx+1]?.color}55,${MAP_STAGES[currentIdx+1]?.color})`,borderRadius:2,transition:"width 0.8s ease",boxShadow:`0 0 8px ${MAP_STAGES[currentIdx+1]?.color}`}}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Arsenal (fixed: visible, clear, functional) ──────────────────
function ArsenalScreen({level,equipped,setEquipped,addXP,attrs}){
  const [animating,setAnimating]=useState(null);
  const ac={FUE:C.cta,SAB:C.green,VOL:C.purple};
  const ai={FUE:"💪",SAB:"📖",VOL:"⚡"};
  const labels={FUE:"⚔ Fuerza",SAB:"📖 Sabiduría",VOL:"⚡ Voluntad"};
  const bonus={FUE:getArtifactBonus(equipped,"FUE"),SAB:getArtifactBonus(equipped,"SAB"),VOL:getArtifactBonus(equipped,"VOL")};

  function toggleEquip(id){
    const art=ARTIFACTS.find(a=>a.id===id);
    if(!art||level<art.minLevel)return;
    if(equipped.includes(id)){
      setEquipped(prev=>prev.filter(x=>x!==id));
    }else{
      setAnimating(id);
      setTimeout(()=>setAnimating(null),900);
      addXP(art.bonus,null,true);
      setEquipped(prev=>[...prev,id]);
    }
  }

  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"24px 16px 60px"}}>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:4}}>⚙ Arsenal de Artefactos</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:20}}>Equipa artefactos para potenciar tus atributos. Se desbloquean al subir de nivel.</p>

      {/* Active bonuses */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:24}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:14}}>BONIFICACIONES ACTIVAS</div>
        <div style={{display:"flex",gap:10}}>
          {["FUE","SAB","VOL"].map(k=>(
            <div key={k} style={{flex:1,background:C.bg,border:`2px solid ${bonus[k]>0?ac[k]+"55":C.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center",boxShadow:bonus[k]>0?`0 0 16px ${ac[k]}22`:"none",transition:"all 0.4s"}}>
              <div style={{fontSize:22,marginBottom:6}}>{ai[k]}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:22,color:ac[k],textShadow:bonus[k]>0?`0 0 10px ${ac[k]}`:"none"}}>{attrs[k]}</div>
              {bonus[k]>0&&<div style={{fontSize:13,color:C.green,fontWeight:800,marginTop:2}}>+{bonus[k]} ⚙</div>}
              <div style={{fontSize:9,color:C.muted,marginTop:4,letterSpacing:1}}>{k}</div>
            </div>
          ))}
        </div>
        {equipped.length>0&&<div style={{marginTop:12,fontSize:12,color:C.green,textAlign:"center",fontWeight:600}}>✓ {equipped.length} artefacto{equipped.length!==1?"s":""} equipado{equipped.length!==1?"s":""}</div>}
        {equipped.length===0&&<div style={{marginTop:12,fontSize:12,color:C.muted,textAlign:"center"}}>Ningún artefacto equipado todavía</div>}
      </div>

      {/* Artifacts by category */}
      {["FUE","SAB","VOL"].map(attr=>(
        <div key={attr} style={{marginBottom:28}}>
          <div style={{fontSize:10,color:ac[attr],letterSpacing:3,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${ac[attr]}22`,display:"flex",alignItems:"center",gap:8}}>
            <span>{labels[attr]}</span>
            <span style={{fontSize:9,color:C.muted}}>({ARTIFACTS.filter(a=>a.attr===attr&&level>=a.minLevel).length}/{ARTIFACTS.filter(a=>a.attr===attr).length} desbloqueados)</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {ARTIFACTS.filter(a=>a.attr===attr).map(art=>{
              const unlocked=level>=art.minLevel;
              const isEq=equipped.includes(art.id);
              const isAnim=animating===art.id;
              return(
                <div key={art.id} style={{background:isEq?art.color+"15":unlocked?C.card:"#0d1220",border:`2px solid ${isEq?art.color:unlocked?C.border:"#1a2035"}`,borderRadius:16,padding:"16px",display:"flex",alignItems:"center",gap:16,boxShadow:isEq?`0 0 24px ${art.color}25,inset 0 0 20px ${art.color}08`:"none",transition:"all 0.35s",animation:isAnim?"equip-flash 0.9s ease":"none",opacity:unlocked?1:0.4}}>
                  {/* Big icon */}
                  <div style={{width:56,height:56,borderRadius:14,background:isEq?art.color+"25":unlocked?C.bg:"transparent",border:`2px solid ${isEq?art.color:unlocked?C.border:"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,filter:isEq?`drop-shadow(0 0 10px ${art.color})`:"none",boxShadow:isEq?`0 0 20px ${art.color}44`:"none",transition:"all 0.35s"}}>
                    {art.icon}
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:15,color:isEq?art.color:unlocked?C.text:C.muted,fontWeight:700}}>{art.name}</span>
                      {isEq&&<span style={{fontSize:9,color:"#000",background:art.color,borderRadius:6,padding:"2px 8px",fontWeight:800,letterSpacing:1}}>EQUIPADO</span>}
                      {!unlocked&&<span style={{fontSize:9,color:C.muted,background:C.bg,borderRadius:6,padding:"2px 8px"}}>🔒 Nv.{art.minLevel}</span>}
                    </div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:6,fontStyle:"italic"}}>{art.desc}</div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:art.color+"18",borderRadius:8,padding:"4px 10px"}}>
                      <span style={{fontSize:13,color:art.color,fontWeight:800}}>+{art.bonus}</span>
                      <span style={{fontSize:11,color:art.color}}>{attr}</span>
                      {!isEq&&unlocked&&<span style={{fontSize:10,color:art.color,opacity:0.7}}>al equipar</span>}
                    </div>
                  </div>
                  {/* Button */}
                  {unlocked&&(
                    <button onClick={()=>toggleEquip(art.id)} style={{flexShrink:0,background:isEq?"transparent":art.color,border:`2px solid ${art.color}`,borderRadius:12,padding:"10px 16px",color:isEq?art.color:"#000",fontSize:13,cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:800,transition:"all 0.3s",boxShadow:isEq?"none":`0 0 14px ${art.color}44`,whiteSpace:"nowrap"}}>
                      {isEq?"Quitar":"Equipar"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────────
function AchievementsScreen({stats,unlockedAchievements}){
  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"24px 16px 60px"}}>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:6}}>🏆 Logros</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:20}}>{unlockedAchievements.length}/{ACHIEVEMENTS.length} desbloqueados</p>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:12,color:C.muted}}>Progreso de colección</span>
          <span style={{fontSize:12,color:C.orange,fontWeight:700}}>{Math.round((unlockedAchievements.length/ACHIEVEMENTS.length)*100)}%</span>
        </div>
        <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(unlockedAchievements.length/ACHIEVEMENTS.length)*100}%`,background:`linear-gradient(90deg,${C.orange}55,${C.orange})`,borderRadius:3,boxShadow:`0 0 10px ${C.orange}`}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:10}}>
        {ACHIEVEMENTS.map(a=>{
          const unlocked=unlockedAchievements.includes(a.id);
          return(
            <div key={a.id} style={{background:C.card,border:`1px solid ${unlocked?C.orange+"44":C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center",boxShadow:unlocked?`0 0 16px ${C.orange}18`:"none",opacity:unlocked?1:0.5,transition:"all 0.3s"}}>
              <div style={{fontSize:28,marginBottom:8,filter:unlocked?`drop-shadow(0 0 8px ${C.orange})`:"grayscale(1)"}}>{a.icon}</div>
              <div style={{fontSize:12,color:unlocked?C.text:C.muted,fontWeight:600,marginBottom:4}}>{a.title}</div>
              <div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{a.desc}</div>
              {unlocked&&<div style={{marginTop:8,fontSize:9,color:C.orange,letterSpacing:2,fontWeight:700}}>✓ LOGRADO</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Custom Goals (Metas propias) ─────────────────────────────────
function MetasScreen({customGoals,setCustomGoals,addXP}){
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",desc:"",emoji:"🎯",target:"",unit:"kg",weeks:"8"});

  const TEMPLATES=[
    {emoji:"⚖️",title:"Bajar 5 kg",desc:"Pérdida de peso saludable",target:"5",unit:"kg",weeks:"12",
     missions:[{text:"Pésate cada lunes",xp:10},{text:"Camina 30 min (3 veces esta semana)",xp:40},{text:"Sin comida procesada 3 días",xp:30},{text:"Verduras en cada comida",xp:20}]},
    {emoji:"🏃",title:"Correr 5 km sin parar",desc:"Resistencia cardiovascular",target:"5",unit:"km",weeks:"10",
     missions:[{text:"Corre 1 km sin parar hoy",xp:30},{text:"Entrena cardio 3 veces",xp:35},{text:"Duerme 8h para recuperación",xp:25},{text:"Hidratación: 2L de agua hoy",xp:10}]},
    {emoji:"💪",title:"Ganar músculo",desc:"Fuerza y masa muscular",target:"3",unit:"kg",weeks:"12",
     missions:[{text:"Entrena fuerza 3 días esta semana",xp:50},{text:"Proteína en cada comida",xp:25},{text:"Duerme 8h (síntesis muscular)",xp:25}]},
    {emoji:"😴",title:"Mejorar el sueño",desc:"Rutina de sueño consistente",target:"8",unit:"h/noche",weeks:"6",
     missions:[{text:"A dormir a la misma hora 5 días",xp:40},{text:"Sin pantallas 1h antes de dormir",xp:30},{text:"Cuarto oscuro y fresco",xp:15},{text:"Sin cafeína después de las 2pm",xp:15}]},
    {emoji:"📚",title:"Leer 12 libros",desc:"1 libro por mes",target:"12",unit:"libros",weeks:"52",
     missions:[{text:"Lee 30 min hoy",xp:20},{text:"Termina un capítulo antes de dormir",xp:20},{text:"Sin redes mientras lees",xp:15},{text:"Anota lo que aprendiste",xp:15}]},
    {emoji:"🧘",title:"Meditar 30 días",desc:"Consistencia en meditación",target:"30",unit:"días",weeks:"5",
     missions:[{text:"Medita 10 min esta mañana",xp:30},{text:"5 días seguidos de meditación",xp:40},{text:"Prueba meditación guiada",xp:20},{text:"Medita antes de dormir",xp:10}]},
  ];

  function createGoal(){
    if(!form.title)return;
    const template=TEMPLATES.find(t=>t.title===form.title)||null;
    const g={
      id:Date.now(),title:form.title,desc:form.desc,emoji:form.emoji,
      target:form.target,unit:form.unit,weeks:form.weeks,
      xpTotal:parseInt(form.weeks)*100,xpEarned:0,
      missions:(template?.missions||[{text:"Define tu primer paso",xp:30},{text:"Toma una acción hoy",xp:50},{text:"Registra tu progreso",xp:20}]).map(m=>({...m,done:false})),
      createdAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long"}),
    };
    setCustomGoals(prev=>[...prev,g]);
    setShowForm(false);
    setForm({title:"",desc:"",emoji:"🎯",target:"",unit:"kg",weeks:"8"});
    addXP(30);
  }

  function completeMission(gid,mi){
    const g=customGoals.find(g=>g.id===gid);
    if(!g||g.missions[mi].done)return;
    const xp=g.missions[mi].xp;
    setCustomGoals(prev=>prev.map(g=>g.id!==gid?g:{...g,missions:g.missions.map((m,i)=>i===mi?{...m,done:true}:m),xpEarned:(g.xpEarned||0)+xp}));
    addXP(xp);
  }

  function deleteGoal(gid){
    setCustomGoals(prev=>prev.filter(g=>g.id!==gid));
  }

  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"24px 16px 60px"}}>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:4}}>🎯 Mis Metas</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:20}}>Conquistas personales convertidas en misiones semanales con XP.</p>

      <button onClick={()=>setShowForm(true)} style={{width:"100%",background:C.green+"14",border:`1.5px dashed ${C.green}50`,borderRadius:14,padding:"16px",color:C.green,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,marginBottom:20,boxShadow:`0 0 14px ${C.green}15`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:20}}>＋</span> Crear nueva meta épica
      </button>

      {/* Active goals */}
      {customGoals.map(g=>{
        const pct=Math.min(Math.round((g.xpEarned/g.xpTotal)*100),100);
        const doneMissions=g.missions.filter(m=>m.done).length;
        return(
          <div key={g.id} style={{background:C.card,border:`1px solid ${pct>=100?C.green+"55":C.border}`,borderRadius:18,padding:"18px",marginBottom:14,boxShadow:pct>=100?`0 0 24px ${C.green}18`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:20,marginBottom:4}}>{g.emoji}</div>
                <div style={{fontSize:16,color:C.text,fontWeight:700,marginBottom:2}}>{g.title}</div>
                <div style={{fontSize:12,color:C.muted}}>{g.desc}</div>
                {g.target&&<div style={{fontSize:11,color:C.green,marginTop:4}}>Meta: {g.target} {g.unit}</div>}
              </div>
              <div style={{textAlign:"right",marginLeft:12}}>
                <div style={{fontSize:14,color:C.green,fontWeight:800,fontFamily:"'Cinzel',serif"}}>{pct}%</div>
                <div style={{fontSize:10,color:C.muted}}>{g.xpEarned}/{g.xpTotal} XP</div>
                <button onClick={()=>deleteGoal(g.id)} style={{marginTop:8,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>🗑</button>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{height:5,background:C.bg,borderRadius:3,overflow:"hidden",marginBottom:14}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:3,transition:"width 0.8s",boxShadow:`0 0 8px ${C.green}`}}/>
            </div>
            {/* Missions */}
            {pct<100&&g.missions.map((m,i)=>(
              <div key={i} onClick={()=>completeMission(g.id,i)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<g.missions.length-1?`1px solid ${C.bg}`:"none",cursor:m.done?"default":"pointer",opacity:m.done?0.45:1,transition:"all 0.3s"}}>
                <div style={{width:24,height:24,border:`1.5px solid ${m.done?C.green:C.border}`,borderRadius:7,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.3s",boxShadow:m.done?`0 0 8px ${C.green}`:"none"}}>{m.done?"✓":""}</div>
                <span style={{fontSize:13,color:"#94a3b8",flex:1}}>{m.text}</span>
                <span style={{fontSize:11,color:C.green,fontWeight:700,flexShrink:0}}>+{m.xp} XP</span>
              </div>
            ))}
            {pct>=100&&(
              <div style={{textAlign:"center",padding:"12px 0"}}>
                <div style={{fontSize:24,marginBottom:4}}>🏆</div>
                <div style={{fontSize:14,color:C.green,fontFamily:"'Cinzel',serif",letterSpacing:2,textShadow:`0 0 10px ${C.green}`}}>¡META CONQUISTADA!</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Empty state with templates */}
      {customGoals.length===0&&(
        <div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:14}}>IDEAS POPULARES — toca para usar</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {TEMPLATES.slice(0,6).map((t,i)=>(
              <div key={i} onClick={()=>{setForm({title:t.title,desc:t.desc,emoji:t.emoji,target:t.target,unit:t.unit,weeks:t.weeks});setShowForm(true);}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px",cursor:"pointer",transition:"all 0.2s"}} >
                <div style={{fontSize:24,marginBottom:8}}>{t.emoji}</div>
                <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:4}}>{t.title}</div>
                <div style={{fontSize:11,color:C.muted}}>{t.weeks} semanas</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:970,backdropFilter:"blur(4px)"}}>
          <div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"28px 24px 48px",width:"100%",maxWidth:520,animation:"slide-up 0.35s ease",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"'Cinzel',serif",fontSize:17,color:C.text,letterSpacing:1}}>Nueva Meta Épica</h3>
              <button onClick={()=>setShowForm(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={LS.label}>Emoji</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["🎯","⚖️","🏃","💪","😴","📚","🧘","🏊","🚴","✈️","💰","🎸","🥗","🧠","🦷"].map(e=>(
                  <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} style={{width:36,height:36,fontSize:18,border:`1.5px solid ${form.emoji===e?C.green:C.border}`,borderRadius:8,background:form.emoji===e?C.green+"18":"transparent",cursor:"pointer"}}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:14}}><label style={LS.label}>¿Cuál es tu meta?</label><input style={LS.input} placeholder="ej. Correr 5 km sin parar" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div style={{marginBottom:14}}><label style={LS.label}>Descripción (opcional)</label><input style={LS.input} placeholder="ej. Meta de resistencia en 10 semanas" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div><label style={LS.label}>Meta numérica</label><input style={LS.input} placeholder="ej. 5" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}/></div>
              <div><label style={LS.label}>Unidad</label><input style={LS.input} placeholder="ej. kg, km, días" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:22}}><label style={LS.label}>Duración: <span style={{color:C.green,fontWeight:700}}>{form.weeks} semanas</span></label><input type="range" min="2" max="52" value={form.weeks} onChange={e=>setForm(f=>({...f,weeks:e.target.value}))} style={{width:"100%",accentColor:C.green}}/></div>
            <button onClick={createGoal} style={{width:"100%",background:form.title?C.green:"#334155",border:"none",borderRadius:12,padding:"14px",color:form.title?"#000":C.muted,fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:form.title?"pointer":"default",boxShadow:form.title?`0 0 20px ${C.green}44`:"none",transition:"all 0.3s"}}>
              ⚡ Crear meta (+30 XP)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Water Tank ───────────────────────────────────────────────────
function WaterTank({water,setWater,addXP,waterXPGiven,setWaterXPGiven,onWaterComplete}){
  const[pouring,setPouring]=useState(false);
  const[floatMsg,setFloatMsg]=useState(null);
  const isFull=water>=8;
  const pct=water/8;

  function addWater(){
    if(isFull)return;
    const nw=water+1;
    setWater(nw);
    setPouring(true);setTimeout(()=>setPouring(false),700);
    if(!waterXPGiven){
      addXP(10,null,false);
      setFloatMsg({text:"+10 XP 💧",key:Date.now()});
      setTimeout(()=>setFloatMsg(null),1200);
      if(nw>=8){
        setWaterXPGiven(true);
        setTimeout(()=>{
          addXP(50,null,false);
          setFloatMsg({text:"¡+50 XP BONUS! 💎",key:Date.now()+1});
          setTimeout(()=>setFloatMsg(null),1500);
          onWaterComplete();
        },500);
      }
    }else{
      setFloatMsg({text:"💧",key:Date.now()});
      setTimeout(()=>setFloatMsg(null),600);
    }
  }

  return(
    <div style={{background:C.card,border:`2px solid ${isFull?C.green+"66":C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:isFull?`0 0 28px ${C.green}25`:"none",transition:"all 0.5s",position:"relative",overflow:"hidden"}}>
      {floatMsg&&<div key={floatMsg.key} style={{position:"absolute",top:"38%",left:"50%",transform:"translateX(-50%)",zIndex:10,fontFamily:"'Cinzel',serif",fontSize:16,color:C.green,fontWeight:900,textShadow:`0 0 20px ${C.green}`,animation:"float-xp 1.2s ease forwards",pointerEvents:"none",whiteSpace:"nowrap"}}>{floatMsg.text}</div>}
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <div style={{position:"relative",flexShrink:0}}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{transform:"rotate(-90deg)"}}>
            <circle cx="44" cy="44" r="36" fill="none" stroke={C.border} strokeWidth="5"/>
            <circle cx="44" cy="44" r="36" fill="none" stroke={C.green} strokeWidth="5"
              strokeDasharray={`${2*Math.PI*36}`} strokeDashoffset={`${2*Math.PI*36*(1-pct)}`}
              strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s ease",filter:isFull?`drop-shadow(0 0 8px ${C.green})`:undefined}}/>
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
          <div style={{fontSize:12,color:isFull?C.green:C.muted,lineHeight:1.5,marginBottom:10,fontStyle:"italic"}}>{WATER_MSGS[Math.min(water,8)]}</div>
          {isFull&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>🔒 XP de agua completados hoy</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={addWater} disabled={isFull} style={{flex:2,background:isFull?C.border:C.green,border:"none",borderRadius:10,padding:"10px",color:"#000",fontWeight:800,fontSize:13,cursor:isFull?"default":"pointer",fontFamily:"inherit",boxShadow:isFull?"none":`0 0 16px ${C.green}44`,transition:"all 0.3s",opacity:isFull?0.6:1}}>
              💧 +Vaso{isFull?" ✓":""}
            </button>
            <button onClick={()=>setWater(w=>Math.max(0,w-1))} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>− Quitar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HeroAvatar ───────────────────────────────────────────────────
function HeroAvatar({archetype,level=1,size=200,animate=true,mood=3,darkDay=false,showFuture=false,epicDone=false,attrs={},equipped=[]}){
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
  const hasWings=acc.some(x=>x.id==="light_wings");
  const hasCrown=acc.some(x=>x.id==="crown");
  const hasArmor=acc.some(x=>x.id==="full_armor");
  const hasAura=acc.some(x=>x.id==="neon_aura");
  const hasPads=acc.some(x=>x.id==="shoulder_pads");
  const hybrid=getHybrid(archetype,attrs);
  const hasFUEart=equipped.some(id=>ARTIFACTS.find(a=>a.id===id&&a.attr==="FUE"));
  const hasSABart=equipped.some(id=>ARTIFACTS.find(a=>a.id===id&&a.attr==="SAB"));
  return(
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none" style={{overflow:"visible"}}>
      <defs>
        <radialGradient id={`BL${archetype}${level}`} cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor={ac} stopOpacity={li}/><stop offset="50%" stopColor={ac} stopOpacity={li*0.3}/><stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`GL${archetype}${level}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={li*0.9}/><stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`BD${archetype}`} cx="50%" cy="20%" r="75%">
          <stop offset="0%" stopColor={darkDay?"#1a1a2a":hasArmor?"#1a2840":"#1E293B"}/><stop offset="55%" stopColor={darkDay?"#0e0e18":"#0F172A"}/><stop offset="100%" stopColor="#080c18"/>
        </radialGradient>
        <radialGradient id={`EL${archetype}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ac} stopOpacity={bl}/><stop offset="100%" stopColor={ac} stopOpacity="0"/>
        </radialGradient>
        <filter id={`GA${archetype}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`GB${archetype}`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="11" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`GC${archetype}`} x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="20"/></filter>
      </defs>
      <ellipse cx="110" cy="115" rx="95" ry="110" fill={ac} fillOpacity={li*0.1} filter={`url(#GC${archetype})`}/>
      <ellipse cx="110" cy="115" rx="74" ry="90" fill={`url(#BL${archetype}${level})`} style={animate?{animation:darkDay?"dark-breathe 6s ease-in-out infinite":"aura-breathe 4s ease-in-out infinite"}:{}}/>
      <ellipse cx="110" cy="202" rx={46+stage*10} ry={11+stage*3} fill={`url(#GL${archetype}${level})`} style={animate?{animation:"ground-pulse 3s ease-in-out infinite"}:{}}/>
      {hasAura&&!darkDay&&<ellipse cx="110" cy="115" rx="92" ry="108" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1" strokeOpacity="0.3" style={{animation:"ring-spin 8s linear infinite"}}/>}
      {hasFUEart&&!darkDay&&<ellipse cx="110" cy="115" rx="100" ry="116" fill="none" stroke={C.cta} strokeWidth="0.8" strokeOpacity="0.2" style={{animation:"ring-spin 12s linear infinite reverse"}}/>}
      {hasSABart&&!darkDay&&<ellipse cx="110" cy="115" rx="105" ry="121" fill="none" stroke={C.green} strokeWidth="0.6" strokeOpacity="0.18" style={{animation:"ring-spin 17s linear infinite"}}/>}
      {showFuture&&!darkDay&&(
        <g opacity="0.11" style={{animation:"future-pulse 4s ease-in-out infinite"}}>
          <ellipse cx="110" cy="118" rx="88" ry="106" fill={ac} fillOpacity="0.06"/>
          <rect x="76" y="150" width="20" height="50" rx="10" fill={ac}/><rect x="124" y="150" width="20" height="50" rx="10" fill={ac}/>
          <rect x="70" y="98" width="80" height="60" rx="16" fill={ac}/>
          <ellipse cx="70" cy="112" rx="16" ry="13" fill={ac}/><ellipse cx="150" cy="112" rx="16" ry="13" fill={ac}/>
          <ellipse cx="110" cy="70" rx="32" ry="34" fill={ac}/><ellipse cx="110" cy="36" rx="34" ry="12" fill={ac}/>
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
      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="#0F172A"/><rect x="119" y="157" width="17" height="42" rx="8.5" fill="#0F172A"/>
      <rect x="84" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl*0.9}/><rect x="119" y="157" width="17" height="42" rx="8.5" fill="none" stroke={ac} strokeWidth="0.6" strokeOpacity={bl*0.9}/>
      {stage>=2&&!darkDay&&<><rect x="82" y="185" width="21" height="14" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5"/><rect x="117" y="185" width="21" height="14" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.5"/></>}
      <rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#BD${archetype})`}/><rect x="79" y="107" width="62" height="57" rx="13" fill={`url(#EL${archetype})`}/>
      <rect x="79" y="107" width="62" height="57" rx="13" fill="none" stroke={ac} strokeWidth={stage>=1?0.8:0.3} strokeOpacity={stage>=1?0.35:0.1}/>
      {hasArmor&&!darkDay&&<rect x="79" y="107" width="62" height="57" rx="13" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1.2" strokeOpacity="0.5"/>}
      {stage>=3&&!hasArmor&&!darkDay&&<rect x="89" y="114" width="42" height="30" rx="7" fill={ac} fillOpacity="0.09" stroke={ac} strokeWidth="0.7" strokeOpacity="0.45"/>}
      <ellipse cx="79" cy="117" rx="12" ry="10" fill="#0F172A"/><ellipse cx="141" cy="117" rx="12" ry="10" fill="#0F172A"/>
      <ellipse cx="79" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage>=2?0.45:0.14}/><ellipse cx="141" cy="117" rx="12" ry="10" fill="none" stroke={ac} strokeWidth="0.7" strokeOpacity={stage>=2?0.45:0.14}/>
      {hasPads&&!darkDay&&<><ellipse cx="79" cy="117" rx="15" ry="13" fill="none" stroke={ac} strokeWidth="1.5" strokeOpacity="0.6"/><ellipse cx="141" cy="117" rx="15" ry="13" fill="none" stroke={ac} strokeWidth="1.5" strokeOpacity="0.6"/><ellipse cx="79" cy="117" rx="5" ry="4" fill={ac} fillOpacity="0.3"/><ellipse cx="141" cy="117" rx="5" ry="4" fill={ac} fillOpacity="0.3"/></>}
      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="#0F172A"/><rect x="142" y="114" width="15" height="44" rx="7.5" fill="#0F172A"/>
      <rect x="63" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl*0.8}/><rect x="142" y="114" width="15" height="44" rx="7.5" fill="none" stroke={ac} strokeWidth="0.5" strokeOpacity={bl*0.8}/>
      {stage>=3&&!darkDay&&<><rect x="61" y="146" width="19" height="13" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6"/><rect x="140" y="146" width="19" height="13" rx="5" fill="#1E293B" stroke={ac} strokeWidth="0.7" strokeOpacity="0.6"/></>}
      <rect x="103" y="94" width="14" height="17" rx="7" fill="#0F172A"/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="#0F172A"/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill={ac} fillOpacity={bl*0.35} filter={`url(#GB${archetype})`}/>
      <ellipse cx="110" cy="78" rx="25" ry="27" fill="none" stroke={ac} strokeWidth={stage>=2?0.8:0.3} strokeOpacity={stage>=2&&!darkDay?0.32:0.1}/>
      {hasCrown&&!darkDay&&<g><path d="M 90 54 L 95 42 L 110 50 L 125 42 L 130 54 Z" fill={ac} fillOpacity="0.6" stroke={ac} strokeWidth="0.8"/><ellipse cx="110" cy="42" rx="30" ry="10" fill={ac} fillOpacity="0.12" filter={`url(#GB${archetype})`}/>{[95,110,125].map((x,i)=><circle key={i} cx={x} cy={i===1?41:43} r="2.5" fill={ac} opacity="0.9" filter={`url(#GA${archetype})`}/>)}</g>}
      {hybrid&&!darkDay&&<><circle cx="79" cy="105" r="4" fill={hybrid.color} opacity="0.8" filter={`url(#GA${archetype})`} style={{animation:"hybrid-pulse 2s ease-in-out infinite"}}/><circle cx="141" cy="105" r="4" fill={hybrid.color} opacity="0.8" filter={`url(#GA${archetype})`} style={{animation:"hybrid-pulse 2s 0.5s ease-in-out infinite"}}/></>}
      <path d={`M ${103-eyeW} ${74-eyeH-5} Q 103 ${74-eyeH-7} ${103+eyeW} ${74-eyeH-5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay?0.2:0.5} strokeLinecap="round"/>
      <path d={`M ${117-eyeW} ${74-eyeH-5} Q 117 ${74-eyeH-7} ${117+eyeW} ${74-eyeH-5}`} stroke={ac} strokeWidth="1.2" fill="none" strokeOpacity={darkDay?0.2:0.5} strokeLinecap="round"/>
      <ellipse cx="103" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay?0.4:1} filter={`url(#GA${archetype})`}/>
      <ellipse cx="117" cy="74" rx={eyeW} ry={eyeH} fill={ac} opacity={darkDay?0.4:1} filter={`url(#GA${archetype})`}/>
      <ellipse cx="103" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay?0.06:stage>=1?0.22:0.1} filter={`url(#GB${archetype})`}/>
      <ellipse cx="117" cy="74" rx="8" ry="8" fill={ac} opacity={darkDay?0.06:stage>=1?0.22:0.1} filter={`url(#GB${archetype})`}/>
      {!darkDay&&<><ellipse cx="104.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.7"/><ellipse cx="118.5" cy="72.5" rx="1" ry="1" fill="white" opacity="0.7"/></>}
      <path d={mp} stroke={ac} strokeWidth="1.4" fill="none" strokeOpacity={darkDay?0.2:mood>=4?0.9:0.55} strokeLinecap="round"/>
      <text x="110" y="138" textAnchor="middle" fontSize={stage>=3?17:13} fill={ac} opacity={darkDay?0.2:stage>=2?1:0.65} filter={`url(#GA${archetype})`}>{marks[archetype]}</text>
      {!darkDay&&Array.from({length:stage>=2?8:stage>=1?4:0},(_,i)=>{
        const angle=(i/(stage>=2?8:4))*Math.PI*2,r=62+(i%3)*14;
        return<circle key={i} cx={110+Math.cos(angle)*r} cy={118+Math.sin(angle)*r*0.5} r={1.7+(i%2)*1.1} fill={ac} opacity={0.35+(i%3)*0.12} style={{animation:`float-p ${2.4+i*0.38}s ${i*0.28}s ease-in-out infinite alternate`}}/>;
      })}
    </svg>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────
function XPBar({xp,xpNext,label=true}){
  return(
    <div>
      {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:10,color:C.muted,letterSpacing:2}}>EXPERIENCIA</span>
        <span style={{fontSize:11,color:C.green,fontWeight:800,textShadow:`0 0 8px ${C.green}`}}>{xp}/{xpNext} XP</span>
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

// ─── Toasts (FIXED - no freeze) ───────────────────────────────────
function XPBurst({xp,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1400);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",top:"40%",left:"50%",zIndex:990,pointerEvents:"none",animation:"xp-burst 1.4s ease forwards"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:34,color:C.green,fontWeight:900,textShadow:`0 0 30px ${C.green},0 0 60px ${C.green}55`,whiteSpace:"nowrap"}}>+{xp} XP ⚡</div>
    </div>
  );
}

function Confetti(){
  const pieces=useMemo(()=>Array.from({length:28},(_,i)=>({id:i,x:Math.random()*100,color:[C.green,C.orange,C.purple,C.cta,"#fff"][i%5],sz:Math.random()*8+4,dur:Math.random()*1.5+1,delay:Math.random()*0.5})),[]);
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:994,overflow:"hidden"}}>
      {pieces.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:-20,width:p.sz,height:p.sz,background:p.color,borderRadius:p.id%2===0?"50%":"2px",animation:`confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,opacity:0.9}}/>)}
    </div>
  );
}

function AttrGain({attrs,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1800);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",top:"52%",left:"50%",transform:"translateX(-50%)",zIndex:989,pointerEvents:"none",display:"flex",gap:8,animation:"fade-up 1.8s ease forwards"}}>
      {Object.entries(attrs).filter(([k,v])=>v>0&&k!=="key").map(([k,v])=>(
        <div key={k} style={{background:C.card+"ee",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,color:k==="FUE"?C.cta:k==="SAB"?C.green:C.purple,fontWeight:700}}>+{v} {k}</div>
      ))}
    </div>
  );
}

// FIXED: Level up no longer freezes - auto-dismiss after 3.5s, click to dismiss
function LevelUpToast({level,arc,archetype,titleInfo,newStage,onDone}){
  const[conf,setConf]=useState(true);
  // Auto-dismiss after 3.5s - FIXED freeze issue
  useEffect(()=>{
    const t=setTimeout(()=>{onDone();},3500);
    return()=>clearTimeout(t);
  },[onDone]);
  useEffect(()=>{const t=setTimeout(()=>setConf(false),2200);return()=>clearTimeout(t);},[]);

  return(
    <>
      {conf&&<Confetti/>}
      <div onClick={onDone} style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)",cursor:"pointer"}}>
        <div style={{textAlign:"center",animation:"pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",maxWidth:340,padding:20}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:10,color:C.orange,letterSpacing:6,marginBottom:6,fontFamily:"'Cinzel',serif",textShadow:`0 0 20px ${C.orange}`}}>¡NIVEL ALCANZADO!</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:88,color:C.text,lineHeight:1,textShadow:`0 0 60px ${C.orange},0 0 120px ${C.orange}55`}}>{level}</div>
          <div style={{fontSize:17,color:C.green,marginTop:8,fontFamily:"'Cinzel',serif",letterSpacing:2,textShadow:`0 0 10px ${C.green}`}}>{titleInfo.title}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4,letterSpacing:3}}>{titleInfo.rank}</div>
          {newStage&&(
            <div style={{marginTop:16,padding:"12px 18px",background:newStage.color+"18",border:`1px solid ${newStage.color}44`,borderRadius:14,animation:"pop-in 0.4s 0.3s ease backwards"}}>
              <div style={{fontSize:22,marginBottom:4}}>{newStage.planet}</div>
              <div style={{fontSize:14,color:newStage.color,fontFamily:"'Cinzel',serif",letterSpacing:1}}>¡Nuevo planeta desbloqueado!</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{newStage.label} — {newStage.sublabel}</div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"center",marginTop:14}}><HeroAvatar archetype={archetype} level={level} size={88} animate={false}/></div>
          <div style={{fontSize:11,color:C.muted,marginTop:10}}>Toca en cualquier lugar para continuar</div>
          <button onClick={onDone} style={{marginTop:12,background:C.green,border:"none",borderRadius:12,padding:"10px 28px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:`0 0 16px ${C.green}44`}}>¡Continuar! →</button>
        </div>
      </div>
    </>
  );
}

function StreakReward({reward,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[onDone]);
  return(
    <div onClick={onDone} style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(8px)",cursor:"pointer"}}>
      <div style={{textAlign:"center",animation:"pop-in 0.5s ease",maxWidth:300,padding:24}}>
        <div style={{fontSize:56,marginBottom:12,filter:`drop-shadow(0 0 20px ${C.orange})`}}>{reward.icon}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:C.orange,letterSpacing:4,marginBottom:8}}>¡RACHA {reward.day} DÍAS!</div>
        <div style={{fontSize:28,color:C.text,fontFamily:"'Cinzel',serif",marginBottom:6}}>{reward.reward}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Tu constancia tiene recompensa</div>
        <button onClick={onDone} style={{background:C.orange,border:"none",borderRadius:12,padding:"10px 28px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,cursor:"pointer"}}>¡Genial!</button>
      </div>
    </div>
  );
}

function AchievementToast({achievement,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[onDone]);
  return(
    <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:997,animation:"slide-up-toast 3s ease forwards",maxWidth:310,width:"90%"}}>
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

function DarkDayScreen({archetype,playerName,onMission,onDismiss}){
  const[phase,setPhase]=useState(0);
  return(
    <div style={{position:"fixed",inset:0,zIndex:980,background:"linear-gradient(180deg,#030309 0%,#07080f 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {Array.from({length:20},(_,i)=><div key={i} style={{position:"absolute",left:`${(i*5)%100}%`,top:-20,width:1,height:"100vh",background:"linear-gradient(to bottom,transparent,#4b556328,transparent)",animation:`rain-streak ${1.8+(i%5)*0.4}s ${i*0.2}s linear infinite`}}/>)}
      </div>
      <button onClick={onDismiss} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>✕</button>
      {phase===0&&(
        <div style={{textAlign:"center",maxWidth:340,animation:"fade-up 0.6s ease",position:"relative",zIndex:2}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><HeroAvatar archetype={archetype} level={1} size={140} animate darkDay mood={1}/></div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:5,marginBottom:10}}>MODO DÍA OSCURO</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:"#94a3b8",letterSpacing:2,marginBottom:16,lineHeight:1.4}}>Los días difíciles forman parte del camino</h2>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:28}}>Hola <strong style={{color:"#94a3b8"}}>{playerName}</strong>. Solo necesitas hacer <strong style={{color:C.purple}}>una cosa pequeña</strong>.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>setPhase(1)} style={{background:C.purple+"20",border:`1px solid ${C.purple}44`,borderRadius:12,padding:"13px",color:C.purple,fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer",letterSpacing:1}}>Activar misión de recuperación</button>
            <button onClick={onDismiss} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Estoy bien, continuar</button>
          </div>
        </div>
      )}
      {phase===1&&(
        <div style={{textAlign:"center",maxWidth:360,animation:"fade-up 0.4s ease",position:"relative",zIndex:2}}>
          <div style={{fontSize:30,marginBottom:14,filter:`drop-shadow(0 0 16px ${C.purple})`}}>🌑</div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:5,marginBottom:10}}>MISIÓN DE RECUPERACIÓN · +100 XP</div>
          <h3 style={{fontFamily:"'Cinzel',serif",fontSize:19,color:"#94a3b8",letterSpacing:2,marginBottom:20}}>El primer paso</h3>
          {["Toma un vaso de agua ahora mismo","Sal al exterior aunque sea 5 minutos","Escribe una cosa por la que estés vivo hoy"].map((s,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
              <div style={{width:28,height:28,borderRadius:8,background:C.purple+"20",border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",color:C.purple,fontSize:13,flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:13,color:"#8892a4",lineHeight:1.5}}>{s}</span>
            </div>
          ))}
          <p style={{fontSize:12,color:C.muted,lineHeight:1.8,marginTop:16,marginBottom:24,fontStyle:"italic"}}>"El guerrero no es quien nunca cae. Es quien se levanta."</p>
          <button onClick={()=>{onMission(100);onDismiss();}} style={{width:"100%",background:C.purple,border:"none",borderRadius:12,padding:"14px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1}}>✓ Completar (+100 XP)</button>
        </div>
      )}
    </div>
  );
}

function RobotDiary({playerName,water,mood,doneMissions,totalMissions,attrs,arc,level,equipped}){
  const[open,setOpen]=useState(false);
  const title=getLevelTitle(level);
  const msg=useMemo(()=>{
    if(mood<=1)return`Navegante ${playerName}… detecto energía baja. Una acción pequeña puede cambiar el rumbo.`;
    if(water<3)return`Navegante ${playerName}, mis sensores detectan deshidratación. ¿Un vaso de agua ahora?`;
    if(equipped.length===0)return`Navegante ${playerName}, sin artefactos equipados. ¡Ve al Arsenal y potencia tus atributos!`;
    if(doneMissions===0)return`¡Bienvenido de nuevo, Navegante ${playerName}! El camino espera. Completa tu primera misión.`;
    if(doneMissions===totalMissions)return`¡Extraordinario, Navegante ${playerName}! Todas las misiones completadas. Eres digno de "${title.title}".`;
    if(attrs.SAB>attrs.FUE&&attrs.SAB>attrs.VOL)return`Navegante ${playerName}, tu Sabiduría domina. El Sabio que llevas dentro está despertando.`;
    if(attrs.FUE>attrs.SAB&&attrs.FUE>attrs.VOL)return`Navegante ${playerName}, tu Fuerza es innegable. El cuerpo que forjas hoy es tu escudo.`;
    return`Navegante ${playerName} — ${doneMissions}/${totalMissions} misiones. Cada paso cuenta.`;
  },[mood,water,doneMissions,totalMissions,attrs,playerName,title,level,equipped.length]);
  return(
    <div style={{background:C.card,border:`1px solid ${arc?.aura||C.green}33`,borderRadius:16,padding:"14px 16px",marginBottom:12,cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:10,background:(arc?.aura||C.green)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,filter:`drop-shadow(0 0 6px ${arc?.aura||C.green})`}}>🤖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:arc?.aura||C.green,letterSpacing:2,marginBottom:1}}>DIARIO DEL ROBOT</div>
          <div style={{fontSize:12,color:C.muted}}>{open?"Toca para cerrar":"💬 ¿Qué dice tu robot hoy?"}</div>
        </div>
        <div style={{fontSize:18,color:C.muted,transition:"transform 0.3s",transform:open?"rotate(180deg)":"none"}}>⌄</div>
      </div>
      {open&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${(arc?.aura||C.green)}18`}}>
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

// ─── INTRO SCREEN (before journey) ───────────────────────────────
function IntroScreen({onStart}){
  const[slide,setSlide]=useState(0);
  const slides=[
    {icon:"🤖",title:"Tu robot evoluciona contigo",desc:"Cada hábito que completas suma XP real. Tu robot gana accesorios, auras y poderes a medida que tú creces en la vida real.",color:C.green,bg:C.green},
    {icon:"🗺",title:"Viaja por el universo",desc:"7 planetas te esperan. Tu nave espacial avanza de planeta en planeta cada vez que subes de nivel. ¿Llegarás a Leyenda?",color:"#06B6D4",bg:"#06B6D4"},
    {icon:"⚙",title:"Arsenal de Artefactos",desc:"Casco del Guerrero, Gafas de Visionario, Capa de Resiliencia… Equipa artefactos y potencia tus atributos de Fuerza, Sabiduría y Voluntad.",color:C.orange,bg:C.orange},
    {icon:"🎯",title:"Tus metas, tus reglas",desc:"Bajar 5 kg, correr 5 km, leer 12 libros… Crea tus propias metas épicas y la app las convierte en misiones semanales con XP.",color:C.purple,bg:C.purple},
    {icon:"🔥",title:"La constancia te recompensa",desc:"Racha de 7 días = +100 XP bonus. 14 días = +200 XP. 30 días = +500 XP LEGENDARIO. La app nunca te abandona, ni en los días difíciles.",color:C.cta,bg:C.cta},
  ];
  const s=slides[slide];
  return(
    <div style={{position:"fixed",inset:0,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:985,padding:"32px 24px",overflow:"hidden"}}>
      <StarField/>
      <button onClick={onStart} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit",zIndex:2}}>Saltar →</button>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:400,width:"100%"}}>
        <div style={{fontSize:64,marginBottom:20,filter:`drop-shadow(0 0 20px ${s.color})`,animation:"bounce-in 0.5s ease"}}>{s.icon}</div>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:24,color:C.text,letterSpacing:2,marginBottom:14,lineHeight:1.3}}>{s.title}</h2>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.85,marginBottom:36}}>{s.desc}</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:32}}>
          {slides.map((_,i)=><div key={i} onClick={()=>setSlide(i)} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?s.color:C.border,cursor:"pointer",transition:"all 0.3s"}}/>)}
        </div>
        {slide<slides.length-1?(
          <button onClick={()=>setSlide(i=>i+1)} style={{width:"100%",background:`linear-gradient(135deg,${s.color},${s.color}bb)`,border:"none",borderRadius:14,padding:"16px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:15,cursor:"pointer",letterSpacing:1,boxShadow:`0 0 30px ${s.color}44`}}>
            Siguiente →
          </button>
        ):(
          <button onClick={onStart} style={{width:"100%",background:`linear-gradient(135deg,${C.cta},${C.orange})`,border:"none",borderRadius:14,padding:"16px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:15,cursor:"pointer",letterSpacing:1,boxShadow:`0 0 40px ${C.cta}55`,animation:"cta-pulse 2s ease-in-out infinite"}}>
            ¡COMENZAR EL VIAJE! →
          </button>
        )}
      </div>
    </div>
  );
}

function Tutorial({onDone}){
  const STEPS=[
    {icon:"🗺",title:"Mapa del Viaje",desc:"Tu nave avanza entre planetas al subir de nivel. Toca cualquier planeta para ver detalles."},
    {icon:"⚙",title:"Arsenal",desc:"Equipa artefactos para potenciar FUE, SAB y VOL. Al equipar ganas XP inmediato."},
    {icon:"🎯",title:"Mis Metas",desc:"Crea metas personales como 'Bajar 5 kg' y la app las convierte en misiones semanales."},
    {icon:"🔥",title:"Rachas",desc:"Racha de 7, 14 o 30 días = XP bonus extra. El tanque de agua completo autocompleta la misión de agua."},
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
  const[showHero,setShowHero]=useState(true);
  const[showIntro,setShowIntro]=useState(false);
  const[step,setStep]=useState(0);
  const[profile,setProfile]=useState({name:"",age:"",weight:"",height:"",sleep:"7",stress:"5",conditions:[],goals:[],archetype:null});
  const[player,setPlayer]=useState(null);
  const[tab,setTab]=useState("home");
  const[missions,setMissions]=useState(MISSIONS_DATA.map(m=>({...m,done:false})));
  const[customGoals,setCustomGoals]=useState([]);
  const[mood,setMood]=useState(null);
  const[moodLog,setMoodLog]=useState([]);
  const[water,setWater]=useState(0);
  const[waterXPGiven,setWaterXPGiven]=useState(false);
  const[attrs,setAttrs]=useState({FUE:0,SAB:0,VOL:0});
  const[totalXP,setTotalXP]=useState(0);
  const[epicDone,setEpicDone]=useState(false);
  const[equipped,setEquipped]=useState([]);
  const[unlockedAchievements,setUnlockedAchievements]=useState([]);
  const[totalMissionsCompleted,setTotalMissionsCompleted]=useState(0);
  const[waterCompleted,setWaterCompleted]=useState(0);
  const[moodDays,setMoodDays]=useState(0);
  const[dayPerfect,setDayPerfect]=useState(0);
  // FIXED: separate state for level-up display to prevent freeze
  const[levelUpData,setLevelUpData]=useState(null); // {level, newStage} or null
  const[showDisclaimer,setShowDisclaimer]=useState(false);
  const[showTutorial,setShowTutorial]=useState(false);
  const[showDarkDay,setShowDarkDay]=useState(false);
  const[xpBurst,setXpBurst]=useState(null);
  const[attrGain,setAttrGain]=useState(null);
  const[completedAnim,setCompletedAnim]=useState(null);
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
      if(s.player){setPlayer(s.player);setStep(5);setShowHero(false);}
      if(s.missions)setMissions(s.missions);
      if(s.customGoals)setCustomGoals(s.customGoals);
      if(s.water!==undefined)setWater(s.water);
      if(s.waterXPGiven)setWaterXPGiven(s.waterXPGiven);
      if(s.moodLog)setMoodLog(s.moodLog);
      if(s.attrs)setAttrs(s.attrs);
      if(s.totalXP!==undefined)setTotalXP(s.totalXP);
      if(s.epicDone)setEpicDone(s.epicDone);
      if(s.equipped)setEquipped(s.equipped);
      if(s.unlockedAchievements)setUnlockedAchievements(s.unlockedAchievements);
      if(s.totalMissionsCompleted)setTotalMissionsCompleted(s.totalMissionsCompleted);
      if(s.waterCompleted)setWaterCompleted(s.waterCompleted);
      if(s.moodDays)setMoodDays(s.moodDays);
      if(s.dayPerfect)setDayPerfect(s.dayPerfect);
    }
  },[]);

  useEffect(()=>{
    if(step<5&&!player)return;
    save({profile,player,missions,customGoals,water,waterXPGiven,moodLog,attrs,totalXP,epicDone,equipped,unlockedAchievements,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect});
  },[profile,player,missions,customGoals,water,waterXPGiven,moodLog,attrs,totalXP,epicDone,equipped,unlockedAchievements,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect]);

  useEffect(()=>{
    if(!player)return;
    const delay=(7+Math.random()*8)*60*1000;
    const t=setTimeout(()=>{
      const m=STAR_MISSIONS[Math.floor(Math.random()*STAR_MISSIONS.length)];
      setStarMission(m);setStarTimer(90);
      clearInterval(starRef.current);
      starRef.current=setInterval(()=>setStarTimer(t=>{if(t<=1){clearInterval(starRef.current);setStarMission(null);return 0;}return t-1;}),1000);
    },delay);
    return()=>{clearTimeout(t);clearInterval(starRef.current);};
  },[player?.level]);

  useEffect(()=>{
    if(!player)return;
    const stats={level:player.level,streak:player.streak,totalXP,epicDone,attrs,totalMissions:totalMissionsCompleted,waterCompleted,moodDays,dayPerfect,equippedCount:equipped.length};
    const newOnes=ACHIEVEMENTS.filter(a=>!unlockedAchievements.includes(a.id)&&a.check(stats));
    if(newOnes.length>0){
      setUnlockedAchievements(prev=>[...prev,...newOnes.map(a=>a.id)]);
      setAchievementToast(newOnes[0]);
      setTimeout(()=>setAchievementToast(null),3000);
    }
  },[player?.level,player?.streak,totalXP,epicDone,attrs,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect,equipped.length]);

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
  const artifactBonus={FUE:getArtifactBonus(equipped,"FUE"),SAB:getArtifactBonus(equipped,"SAB"),VOL:getArtifactBonus(equipped,"VOL")};

  function toggleArr(k,v){setProfile(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));}
  function finishSetup(){
    setPlayer({name:profile.name,archetype:profile.archetype,level:1,xp:0,xpNext:100,streak:1,joinedAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})});
    setShowDisclaimer(true);
  }

  // FIXED addXP: doesn't block UI, level up uses separate state
  const addXP=useCallback((gain,missionId=null,showBurst=true)=>{
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
        const prevI=MAP_STAGES.findLastIndex(s=>p.level>=s.minLevel);
        const nextI=MAP_STAGES.findLastIndex(s=>nl>=s.minLevel);
        const newStage=nextI>prevI?MAP_STAGES[nextI]:null;
        // FIXED: set level up data separately, don't block with showLevelUp boolean
        setTimeout(()=>setLevelUpData({level:nl,newStage}),50);
        // Check streak rewards
        STREAK_REWARDS.forEach(r=>{
          if(p.streak===r.day){
            setTimeout(()=>{setStreakReward(r);},3800);
            setTimeout(()=>addXP(r.xp,null,false),4200);
          }
        });
        // Star after level up
        setTimeout(()=>{
          if(!starMission){
            const m=STAR_MISSIONS[Math.floor(Math.random()*STAR_MISSIONS.length)];
            setStarMission(m);setStarTimer(90);
            clearInterval(starRef.current);
            starRef.current=setInterval(()=>setStarTimer(t=>{if(t<=1){clearInterval(starRef.current);setStarMission(null);return 0;}return t-1;}),1000);
          }
        },4500);
      }
      return{...p,xp:up?nx-p.xpNext:nx,xpNext:up?Math.round(p.xpNext*1.5):p.xpNext,level:nl};
    });
  },[starMission]);

  function onWaterComplete(){
    setWaterCompleted(w=>w+1);
    const idx=missions.findIndex(m=>m.id===3);
    if(idx>=0&&!missions[idx].done){
      setMissions(ms=>ms.map((x,i)=>i===idx?{...x,done:true}:x));
      setCompletedAnim(idx);setTimeout(()=>setCompletedAnim(null),700);
      setTotalMissionsCompleted(t=>t+1);
    }
  }

  function completeMission(idx){
    if(missions[idx].done)return;
    const m=missions[idx];
    if(m.id===3&&water<8)return;
    setMissions(ms=>ms.map((x,i)=>i===idx?{...x,done:true}:x));
    setCompletedAnim(idx);setTimeout(()=>setCompletedAnim(null),700);
    if(m.difficulty==="epic")setEpicDone(true);
    setTotalMissionsCompleted(t=>t+1);
    if(doneMissions+1===missions.length)setDayPerfect(d=>d+1);
    addXP(m.xp,m.id);
  }

  function logMood(v){
    setMood(v);
    const nl=[...moodLog.slice(-11),{v,t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}];
    setMoodLog(nl);setMoodDays(d=>d+1);
    if(nl.length>=3&&nl.slice(-3).every(m=>m.v<=1))setTimeout(()=>setShowDarkDay(true),800);
  }

  function resetDay(){
    setMissions(MISSIONS_DATA.map(m=>({...m,done:false})));
    setWater(0);setMood(null);setWaterXPGiven(false);
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

  // ── HERO SCREEN ──────────────────────────────────────────────────
  if(showHero) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:C.text,padding:"32px 20px",position:"relative",overflow:"hidden"}}>
      <StarField/>
      {showIntro&&<IntroScreen onStart={()=>{setShowIntro(false);}}/>}
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:480}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <HeroAvatar archetype="explorer" level={12} size={178} mood={4} showFuture animate/>
        </div>
        <div style={{fontSize:10,color:C.muted,letterSpacing:7,marginBottom:14}}>TU VIDA COMO UN RPG</div>
        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:42,fontWeight:900,color:C.text,lineHeight:1.05,marginBottom:12,textShadow:`0 0 40px ${C.green}44`}}>
          SUBE DE NIVEL<br/><span style={{color:C.green,textShadow:`0 0 30px ${C.green}`}}>EN LA VIDA REAL</span>
        </h1>
        <p style={{fontSize:15,color:C.muted,lineHeight:1.7,marginBottom:8}}>Tu robot evoluciona cuando tú evolucionas.</p>
        <p style={{fontSize:13,color:C.muted,marginBottom:36}}>Misión = <span style={{color:C.green,fontWeight:700}}>+XP</span> · <span style={{color:C.cta,fontWeight:700}}>Atributos</span> · <span style={{color:C.purple,fontWeight:700}}>Nivel</span></p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:36}}>
          {[["🗺","Mapa galáctico"],["⚙","Arsenal RPG"],["🎯","Metas propias"],["🏆","15 Logros"],["🌟","Estrella Fugaz"]].map(([ic,lb])=>(
            <div key={lb} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:C.muted}}>{ic} {lb}</div>
          ))}
        </div>
        <button style={{width:"100%",background:`linear-gradient(135deg,${C.cta},${C.orange})`,border:"none",borderRadius:14,padding:"18px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:16,cursor:"pointer",letterSpacing:1,boxShadow:`0 0 40px ${C.cta}55`,marginBottom:14,animation:"cta-pulse 3s ease-in-out infinite"}} onClick={()=>setShowHero(false)}>
          CREAR MI ROBOT GRATIS →
        </button>
        <button onClick={()=>setShowIntro(true)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",color:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:13,width:"100%"}}>
          ¿Por qué The Journey? Ver intro
        </button>
        <div style={{fontSize:12,color:C.muted,marginTop:14}}>✦ Ya hay +2.847 viajeros subiendo de nivel</div>
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── SETUP ───────────────────────────────────────────────────────
  if(step<5) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"flex-start",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:C.text,padding:"32px 16px 60px",overflowY:"auto",position:"relative"}}>
      <StarField/>
      {showDisclaimer&&<MedDisclaimer onAccept={()=>{setShowDisclaimer(false);setStep(5);setShowTutorial(true);}}/>}
      <div style={{width:"100%",maxWidth:step===4?880:480,position:"relative",zIndex:1}}>
        {step===0&&(
          <div style={{textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:24}}><HeroAvatar archetype="explorer" level={10} size={160} mood={4} showFuture/></div>
            <h1 style={{fontFamily:"'Cinzel',serif",fontSize:36,fontWeight:900,color:C.text,lineHeight:1.1,marginBottom:12}}>THE JOURNEY</h1>
            <p style={{fontSize:14,color:C.muted,lineHeight:1.8,marginBottom:32}}>Cada hábito real = XP real.</p>
            <button style={{...LS.btn,background:`linear-gradient(135deg,${C.cta},${C.orange})`,boxShadow:`0 0 30px ${C.cta}44`,animation:"cta-pulse 3s ease-in-out infinite"}} onClick={()=>setStep(1)}>Comenzar el viaje →</button>
          </div>
        )}
        {step===1&&(
          <div style={LS.setupCard}>
            <div style={LS.badge}>1 DE 4 · IDENTIDAD</div>
            <h2 style={LS.stitle}>¿Cómo te llamamos?</h2>
            <p style={LS.ssub}>Tu misión personalizada empieza aquí</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,marginBottom:18}}>
              {[["Nombre o alias","name","text","¿Cómo te llamamos?"],["Edad","age","number","años"],["Peso (kg)","weight","number","kg"],["Talla (cm)","height","number","cm"]].map(([lbl,key,type,ph])=>(
                <div key={key}><label style={LS.label}>{lbl}</label><input style={LS.input} type={type} placeholder={ph} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/></div>
              ))}
            </div>
            <label style={LS.label}>Horas de sueño: <span style={{color:C.green,fontWeight:700}}>{profile.sleep}h</span></label>
            <input type="range" min="4" max="12" value={profile.sleep} onChange={e=>setProfile(p=>({...p,sleep:e.target.value}))} style={{width:"100%",accentColor:C.green,marginBottom:18}}/>
            <label style={LS.label}>Nivel de estrés: <span style={{color:C.orange,fontWeight:700}}>{profile.stress}/10</span></label>
            <input type="range" min="1" max="10" value={profile.stress} onChange={e=>setProfile(p=>({...p,stress:e.target.value}))} style={{width:"100%",accentColor:C.orange,marginBottom:26}}/>
            <button style={{...LS.btn,opacity:profile.name&&profile.age?1:0.35}} onClick={()=>profile.name&&profile.age&&setStep(2)}>Siguiente →</button>
          </div>
        )}
        {step===2&&(
          <div style={LS.setupCard}>
            <div style={LS.badge}>2 DE 4 · SALUD</div>
            <h2 style={LS.stitle}>¿Alguna condición de salud?</h2>
            <p style={LS.ssub}>Personaliza tus recomendaciones (opcional)</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{CONDITIONS.map(c=><Pill key={c} label={c} active={profile.conditions.includes(c)} color={arc.aura} onClick={()=>toggleArr("conditions",c)}/>)}</div>
            <button style={LS.btn} onClick={()=>setStep(3)}>Siguiente →</button>
          </div>
        )}
        {step===3&&(
          <div style={LS.setupCard}>
            <div style={LS.badge}>3 DE 4 · OBJETIVOS</div>
            <h2 style={LS.stitle}>¿Qué quieres conquistar?</h2>
            <p style={LS.ssub}>Selecciona todo lo que aplique</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{GOALS.map(g=><Pill key={g} label={g} active={profile.goals.includes(g)} color={C.green} onClick={()=>toggleArr("goals",g)}/>)}</div>
            <button style={{...LS.btn,opacity:profile.goals.length?1:0.35}} onClick={()=>profile.goals.length&&setStep(4)}>Siguiente →</button>
          </div>
        )}
        {step===4&&(
          <div>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={LS.badge}>4 DE 4 · ARQUETIPO</div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:28,color:C.text,letterSpacing:3,marginBottom:8}}>Elige tu arquetipo</h2>
              <p style={{fontSize:13,color:C.muted}}>Tu origen define tus atributos dominantes</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,marginBottom:28}}>
              {ARCHETYPES.map(a=>{
                const sel=profile.archetype===a.id;
                return(
                  <div key={a.id} onClick={()=>setProfile(p=>({...p,archetype:a.id}))} style={{background:C.card,border:`1px solid ${sel?a.aura+"55":C.border}`,borderRadius:18,padding:"24px 16px 20px",cursor:"pointer",transition:"all 0.35s",boxShadow:sel?`0 0 40px ${a.aura}25`:"none",transform:sel?"translateY(-6px)":"none",textAlign:"center",position:"relative"}}>
                    {sel&&<div style={{position:"absolute",inset:0,borderRadius:18,background:`radial-gradient(ellipse at 50% 0%, ${a.aura}10, transparent 70%)`,pointerEvents:"none"}}/>}
                    <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><HeroAvatar archetype={a.id} level={sel?14:1} size={100} animate={sel} mood={sel?4:3}/></div>
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
              <button style={{...LS.btn,maxWidth:380,background:profile.archetype?`linear-gradient(135deg,${arc.aura},${C.cta})`:"#1E293B",color:profile.archetype?"#000":C.muted,opacity:profile.archetype?1:0.5,boxShadow:profile.archetype?`0 0 30px ${arc.aura}44`:"none"}} onClick={()=>profile.archetype&&finishSetup()}>
                ⚡ ¡Crear mi robot como {profile.archetype?arc.name:"..."}!
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── MAIN APP RENDER ─────────────────────────────────────────────
  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:C.text,overflow:"hidden",position:"relative"}}>
      <StarField/>

      {/* FIXED level up - uses levelUpData, click to dismiss */}
      {levelUpData&&<LevelUpToast level={levelUpData.level} arc={arc} archetype={player.archetype} titleInfo={getLevelTitle(levelUpData.level)} newStage={levelUpData.newStage} onDone={()=>setLevelUpData(null)}/>}
      {streakReward&&!levelUpData&&<StreakReward reward={streakReward} onDone={()=>setStreakReward(null)}/>}
      {achievementToast&&<AchievementToast achievement={achievementToast} onDone={()=>setAchievementToast(null)}/>}
      {showTutorial&&<Tutorial onDone={()=>setShowTutorial(false)}/>}
      {showDarkDay&&<DarkDayScreen archetype={player.archetype} playerName={player.name} onMission={xp=>addXP(xp)} onDismiss={()=>setShowDarkDay(false)}/>}
      {xpBurst&&<XPBurst xp={xpBurst.xp} onDone={()=>setXpBurst(null)}/>}
      {attrGain&&<AttrGain attrs={attrGain} onDone={()=>setAttrGain(null)}/>}

      {/* Sidebar */}
      <nav style={{width:58,background:C.card+"cc",backdropFilter:"blur(8px)",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0",gap:1,flexShrink:0,position:"relative",zIndex:10,overflowY:"auto"}}>
        <div style={{fontSize:13,color:C.green,fontFamily:"'Cinzel',serif",marginBottom:10,textShadow:`0 0 10px ${C.green}`}}>◈</div>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{width:44,height:46,border:"none",borderRadius:10,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:tab===n.id?C.green+"22":"transparent",color:tab===n.id?C.green:C.muted,transition:"all 0.2s",fontFamily:"inherit",boxShadow:tab===n.id?`0 0 12px ${C.green}33`:"none"}}>
            <span style={{fontSize:14}}>{n.icon}</span><span style={{fontSize:6.5}}>{n.l}</span>
          </button>
        ))}
        {lowMoodStreak&&<button onClick={()=>setShowDarkDay(true)} style={{width:40,height:40,border:`1px solid ${C.purple}33`,borderRadius:10,background:C.purple+"10",color:C.purple,cursor:"pointer",fontSize:14,marginTop:4,animation:"pulse-soft 2s ease-in-out infinite"}}>🌑</button>}
        <div style={{marginTop:"auto",paddingBottom:8,display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
          <button onClick={resetDay} title="Nuevo día" style={{width:36,height:36,border:`1px solid ${C.border}`,borderRadius:9,background:"transparent",color:C.muted,cursor:"pointer",fontSize:14}}>↺</button>
        </div>
      </nav>

      <main style={{flex:1,overflow:"auto",position:"relative",zIndex:1}}>

        {/* ── HOME ── */}
        {tab==="home"&&(
          <div>
            {/* Hero panel */}
            <div style={{position:"relative",background:arc.bg,borderBottom:`1px solid ${arc.aura}20`,padding:"18px 16px 0",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:`radial-gradient(circle,${arc.aura}0c,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,maxWidth:660,margin:"0 auto"}}>
                <div style={{flexShrink:0,marginBottom:-10}}>
                  <HeroAvatar archetype={player.archetype} level={player.level} size={154} animate mood={currentMood} showFuture epicDone={epicDone} attrs={attrs} equipped={equipped}/>
                </div>
                <div style={{flex:1,paddingBottom:18,paddingLeft:6}}>
                  <div style={{fontSize:10,color:C.green,letterSpacing:3,marginBottom:1}}>¡BIENVENIDO!</div>
                  <h1 style={{fontFamily:"'Cinzel',serif",fontSize:19,color:C.text,letterSpacing:1,marginBottom:2}}>{player.name}</h1>
                  <div style={{fontSize:9,color:arc.aura,letterSpacing:2,marginBottom:2}}>{titleInfo.title} · {titleInfo.rank}</div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:9}}>
                    {arc.name} · Nv.<span style={{color:C.green,fontWeight:800,fontSize:15,textShadow:`0 0 10px ${C.green}`}}>{player.level}</span>
                    {hybrid&&<span style={{fontSize:10,color:hybrid.color,marginLeft:7,background:hybrid.color+"15",borderRadius:6,padding:"2px 7px",border:`1px solid ${hybrid.color}33`}}>{hybrid.label}</span>}
                  </div>
                  <XPBar xp={player.xp} xpNext={player.xpNext}/>
                  <div style={{display:"flex",gap:7,marginTop:9,flexWrap:"wrap"}}>
                    <div style={{border:`2px solid ${C.orange}44`,borderRadius:10,padding:"5px 11px",background:C.orange+"10",display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:17,color:C.orange,fontWeight:900,fontFamily:"'Cinzel',serif"}}>🔥{player.streak}</span>
                      <span style={{fontSize:9,color:C.muted}}>días</span>
                    </div>
                    <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.muted}}>◈ <span style={{color:C.text,fontWeight:700}}>{doneMissions}/{missions.length}</span></div>
                    <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.muted}}>⚙ <span style={{color:C.orange,fontWeight:700}}>{equipped.length}</span></div>
                    <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.muted}}>🏆 <span style={{color:C.orange,fontWeight:700}}>{unlockedAchievements.length}</span></div>
                  </div>
                  {STREAK_REWARDS.filter(r=>r.day>player.streak).slice(0,1).map(r=>(
                    <div key={r.day} style={{marginTop:7,fontSize:11,color:C.orange,background:C.orange+"10",borderRadius:8,padding:"5px 10px",border:`1px solid ${C.orange}22`}}>🎁 Día {r.day}: {r.reward} — {r.day-player.streak} día{r.day-player.streak!==1?"s":""}</div>
                  ))}
                  {doneMissions===0&&<div style={{marginTop:7,fontSize:11,color:C.green,background:C.green+"12",borderRadius:8,padding:"5px 10px",border:`1px solid ${C.green}22`}}>⚡ ¡Completa una misión para ganar XP!</div>}
                </div>
              </div>
            </div>

            <div style={{maxWidth:660,margin:"0 auto",padding:"12px 14px 32px"}}>

              {/* Star mission */}
              {starMission&&(
                <div style={{background:"linear-gradient(135deg,#1c1600,#0e0a00)",border:`2px solid ${C.orange}`,borderRadius:16,padding:"14px 16px",marginBottom:14,boxShadow:`0 0 32px ${C.orange}55`,animation:"star-pulse 1.5s ease-in-out infinite",position:"relative",overflow:"hidden",zIndex:5}}>
                  <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${C.orange}10,transparent)`,animation:"star-sweep 1.5s linear infinite",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
                    <div style={{fontSize:32,filter:`drop-shadow(0 0 12px ${C.orange})`}}>🌟</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:9,color:C.orange,letterSpacing:3,marginBottom:3,fontWeight:700}}>✦ ESTRELLA FUGAZ · {starTimer}s</div>
                      <div style={{fontSize:14,color:"#fff8d6",fontWeight:700,lineHeight:1.3}}>{starMission.title}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:C.orange,fontWeight:900}}>+{starMission.xp}</div>
                      <div style={{fontSize:9,color:C.orange+"88"}}>XP</div>
                    </div>
                  </div>
                  <div style={{marginTop:10,height:3,background:"#1c1600",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(starTimer/90)*100}%`,background:`linear-gradient(90deg,${C.orange}66,${C.orange})`,transition:"width 1s linear",boxShadow:`0 0 10px ${C.orange}`}}/>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={()=>{addXP(starMission.xp);setStarMission(null);clearInterval(starRef.current);}} style={{flex:2,background:C.orange,border:"none",borderRadius:9,padding:"10px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>¡Completar! +{starMission.xp} XP</button>
                    <button onClick={()=>{setStarMission(null);clearInterval(starRef.current);}} style={{flex:1,background:"transparent",border:`1px solid ${C.orange}44`,borderRadius:9,padding:"10px",color:C.orange+"88",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Omitir</button>
                  </div>
                </div>
              )}

              <RobotDiary playerName={player.name} water={water} mood={currentMood} doneMissions={doneMissions} totalMissions={missions.length} attrs={attrs} arc={arc} level={player.level} equipped={equipped}/>

              {/* Stats grid — no RPG attrs section (has own page) */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                {[
                  {icon:"⚖️",val:bmi||"—",label:"IMC",badge:bmiLabel||"—",c:bmiColor},
                  {icon:"😴",val:`${profile.sleep}h`,label:"Sueño",badge:parseFloat(profile.sleep)>=7?"Óptimo":"Mejorar",c:parseFloat(profile.sleep)>=7?C.green:C.orange},
                  {icon:"💧",val:`${water}/8`,label:"Agua",badge:water>=8?"¡Lleno!":water>=4?"Mitad":"Seco",c:water>=8?C.green:water>=4?C.orange:"#60a5fa"},
                  {icon:"🔥",val:`${player.streak}d`,label:"Racha",badge:STREAK_REWARDS.find(r=>r.day>player.streak)?.day?`→Día ${STREAK_REWARDS.find(r=>r.day>player.streak)?.day}`:"¡Campeón!",c:C.orange},
                ].map((s,i)=>(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 6px",textAlign:"center"}}>
                    <div style={{fontSize:16,marginBottom:3}}>{s.icon}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:C.text}}>{s.val}</div>
                    <div style={{fontSize:8,color:C.muted,margin:"2px 0 4px"}}>{s.label}</div>
                    <div style={{fontSize:8,borderRadius:5,padding:"2px 3px",background:s.c+"20",color:s.c,fontWeight:700}}>{s.badge}</div>
                  </div>
                ))}
              </div>

              <WaterTank water={water} setWater={setWater} addXP={addXP} waterXPGiven={waterXPGiven} setWaterXPGiven={setWaterXPGiven} onWaterComplete={onWaterComplete}/>

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

              <Card>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontSize:10,color:C.muted,letterSpacing:3}}>MISIONES DE HOY</span>
                  <button onClick={()=>setTab("misiones")} style={{background:"none",border:"none",color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Ver todas →</button>
                </div>
                <div style={{height:4,background:C.bg,borderRadius:2,overflow:"hidden",marginBottom:12}}>
                  <div style={{height:"100%",width:`${(doneMissions/missions.length)*100}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:2,transition:"width 0.6s",boxShadow:`0 0 10px ${C.green}`}}/>
                </div>
                {missions.slice(0,4).map((m,i)=>{
                  const wLocked=m.id===3&&water<8&&!m.done;
                  return(
                    <div key={m.id} onClick={()=>completeMission(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<3?`1px solid ${C.bg}`:"none",cursor:wLocked?"not-allowed":"pointer",opacity:m.done?0.4:1,transition:"all 0.4s",transform:completedAnim===i?"scale(1.02)":"scale(1)"}}>
                      <div style={{width:22,height:22,border:`1.5px solid ${m.done?C.green:C.border}`,borderRadius:6,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.4s",boxShadow:m.done?`0 0 10px ${C.green}`:"none"}}>{m.done?"✓":""}</div>
                      <span style={{fontSize:12,flex:1,color:"#94a3b8"}}>{m.icon} {m.title}{wLocked?<span style={{fontSize:10,color:C.muted}}> (llena el tanque)</span>:""}</span>
                      {m.difficulty==="epic"&&<span style={{fontSize:9,color:C.purple,background:C.purple+"15",borderRadius:5,padding:"2px 6px"}}>ÉPICA</span>}
                      <span style={{fontSize:10,color:C.green,border:`1px solid ${C.green}30`,borderRadius:5,padding:"2px 7px",fontWeight:700}}>+{m.xp}</span>
                    </div>
                  );
                })}
              </Card>

              {/* Metas preview */}
              {customGoals.length>0&&(
                <Card>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <span style={{fontSize:10,color:C.muted,letterSpacing:3}}>MIS METAS</span>
                    <button onClick={()=>setTab("metas")} style={{background:"none",border:"none",color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Ver todas →</button>
                  </div>
                  {customGoals.slice(0,2).map(g=>{
                    const pct=Math.min(Math.round((g.xpEarned/g.xpTotal)*100),100);
                    return(
                      <div key={g.id} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:13,color:"#94a3b8"}}>{g.emoji} {g.title}</span>
                          <span style={{fontSize:11,color:C.green,fontWeight:700}}>{pct}%</span>
                        </div>
                        <div style={{height:3,background:C.bg,borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:C.green,borderRadius:2,boxShadow:`0 0 6px ${C.green}`}}/>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              )}
            </div>
          </div>
        )}

        {tab==="mapa"&&(
          <div style={{maxWidth:700,margin:"0 auto",padding:"20px 14px 40px"}}>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:4}}>🗺 Mapa del Viaje</h2>
            <p style={{fontSize:13,color:C.muted,marginBottom:16}}>Tu nave avanza entre planetas al subir de nivel. Toca cada planeta para detalles.</p>
            <PlanetMap level={player.level} playerName={player.name} archetype={player.archetype} epicDone={epicDone}/>
            <div style={{marginTop:6}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:12}}>TODOS LOS PLANETAS</div>
              {MAP_STAGES.map(stage=>{
                const unlocked=player.level>=stage.minLevel;
                const isCurrent=stage.id===MAP_STAGES[MAP_STAGES.findLastIndex(s=>player.level>=s.minLevel)]?.id;
                return(
                  <div key={stage.id} style={{background:C.card,border:`1px solid ${isCurrent?stage.color+"55":unlocked?stage.color+"22":C.border}`,borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:14,opacity:unlocked?1:0.5,boxShadow:isCurrent?`0 0 20px ${stage.color}18`:"none"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:unlocked?stage.color+"20":C.bg,border:`1px solid ${unlocked?stage.color+"44":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{stage.planet}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <span style={{fontSize:14,color:unlocked?C.text:C.muted,fontWeight:600}}>{stage.label}</span>
                        {isCurrent&&<span style={{fontSize:9,color:stage.color,background:stage.color+"18",borderRadius:5,padding:"2px 8px"}}>ACTUAL</span>}
                        {!unlocked&&<span style={{fontSize:9,color:C.muted}}>🔒 Nv.{stage.minLevel}</span>}
                      </div>
                      <div style={{fontSize:11,color:C.muted}}>{stage.sublabel}</div>
                    </div>
                    {unlocked&&<div style={{fontSize:18,color:stage.color}}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==="misiones"&&(
          <div style={LS.page}>
            <h2 style={LS.ptitle}>◈ Misiones Diarias</h2>
            <p style={LS.psub}>Las <span style={{color:C.purple,fontWeight:700}}>ÉPICAS</span> desbloquean los efectos más brillantes del robot</p>
            <Card style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,color:"#8892a4"}}>Hoy: {doneMissions}/{missions.length} completadas</span>
                <span style={{fontSize:12,color:C.green,fontWeight:700}}>{Math.round((doneMissions/missions.length)*100)}%</span>
              </div>
              <XPBar xp={doneMissions} xpNext={missions.length} label={false}/>
            </Card>
            {missions.map((m,i)=>{
              const wLocked=m.id===3&&water<8&&!m.done;
              return(
                <div key={m.id} style={{background:m.difficulty==="epic"?`linear-gradient(135deg,${C.card},#0a0a18)`:C.card,border:`1px solid ${m.done?C.border:m.difficulty==="epic"?C.purple+"44":C.green+"28"}`,borderRadius:16,padding:"16px 18px",marginBottom:10,transition:"all 0.4s",transform:completedAnim===i?"scale(1.015)":"scale(1)",boxShadow:m.difficulty==="epic"&&!m.done?`0 0 20px ${C.purple}15`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,cursor:wLocked?"not-allowed":"pointer"}} onClick={()=>completeMission(i)}>
                    <div style={{width:34,height:34,border:`1.5px solid ${m.done?C.green:m.difficulty==="epic"?C.purple:C.border}`,borderRadius:10,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:m.done?"#000":C.muted,fontWeight:800,transition:"all 0.4s",boxShadow:m.done?`0 0 14px ${C.green}`:m.difficulty==="epic"?`0 0 10px ${C.purple}33`:"none",opacity:m.done?0.7:1}}>{m.done?"✓":m.icon}</div>
                    <div style={{flex:1,opacity:m.done?0.45:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                        <div style={{fontSize:14,color:m.difficulty==="epic"?C.purple:C.text,fontWeight:600}}>{m.title}</div>
                        {m.difficulty==="epic"&&!m.done&&<span style={{fontSize:9,color:C.purple,background:C.purple+"15",border:`1px solid ${C.purple}33`,borderRadius:5,padding:"2px 7px"}}>ÉPICA 🔓</span>}
                        {wLocked&&<span style={{fontSize:9,color:C.muted,background:C.muted+"10",borderRadius:5,padding:"2px 7px"}}>Llena el tanque primero</span>}
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
                  {!m.done&&!wLocked&&<WhyBox text={m.why} color={m.difficulty==="epic"?C.purple:arc.aura}/>}
                </div>
              );
            })}
          </div>
        )}

        {tab==="metas"&&<MetasScreen customGoals={customGoals} setCustomGoals={setCustomGoals} addXP={addXP}/>}
        {tab==="artefactos"&&<ArsenalScreen level={player.level} equipped={equipped} setEquipped={setEquipped} addXP={addXP} attrs={attrs}/>}
        {tab==="logros"&&<AchievementsScreen stats={{level:player.level,streak:player.streak,totalXP,epicDone,attrs,totalMissions:totalMissionsCompleted,waterCompleted,moodDays,dayPerfect,equippedCount:equipped.length}} unlockedAchievements={unlockedAchievements}/>}

        {tab==="salud"&&(
          <div style={LS.page}>
            <h2 style={LS.ptitle}>✦ Salud</h2>
            <p style={LS.psub}>Tu cuerpo es el primer campo de batalla</p>
            <div style={{background:C.orange+"08",border:`1px solid ${C.orange}30`,borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#94a3b8",lineHeight:1.75}}>⚕️ <strong style={{color:C.orange}}>Aviso:</strong> Contenido informativo. No reemplaza consulta médica.</div>
            {bmi&&<Card glow={bmiColor}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:10,color:C.muted,letterSpacing:2,marginBottom:4}}>IMC</div><div style={{fontFamily:"'Cinzel',serif",fontSize:36,color:bmiColor,textShadow:`0 0 12px ${bmiColor}`}}>{bmi}</div><div style={{fontSize:12,color:bmiColor,marginTop:4}}>{bmiLabel}</div></div>
              <div style={{fontSize:12,color:C.muted,lineHeight:2.4,textAlign:"right"}}><div>Peso <span style={{color:"#94a3b8"}}>{profile.weight}kg</span></div><div>Talla <span style={{color:"#94a3b8"}}>{profile.height}cm</span></div><div>Agua <span style={{color:C.green}}>{waterGoal}L/día</span></div></div>
            </div></Card>}
            <div style={LS.section}>Plan Físico</div>
            {[
              profile.goals.includes("Perder peso")&&{icon:"🚶",t:"Cardio moderado",d:"30 min de caminata rápida. Zona 60-70% FC máx.",f:"5x/sem",c:C.green},
              profile.goals.includes("Ganar músculo")&&{icon:"💪",t:"Entrenamiento de fuerza",d:"3-4 series de 8-12 reps. El descanso es tan importante como el entreno.",f:"3x/sem",c:C.cta},
              profile.goals.includes("Más energía")&&{icon:"⚡",t:"HIIT suave",d:"20 min: 30s esfuerzo alto, 90s suave.",f:"3x/sem",c:C.orange},
              {icon:"🧘",t:"Movilidad",d:"15 min de estiramientos. Reduce lesiones y activa el parasimpático.",f:"Diario",c:C.purple},
              {icon:"💧",t:`Meta: ${waterGoal}L agua`,d:"33ml por kg de peso corporal distribuidos durante el día.",f:"Diario",c:C.green},
            ].filter(Boolean).map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${p.c}`,borderColor:p.c+"30"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.t}</div><span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span></div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.75}}>{p.d}</div>
                  </div>
                </div>
              </Card>
            ))}
            <div style={LS.section}>Chequeos Recomendados</div>
            {[
              parseFloat(profile.age)>=35&&{icon:"🩸",t:"Perfil lipídico",d:"Colesterol total, HDL, LDL y triglicéridos.",f:"Anual",c:"#f87171"},
              parseFloat(profile.age)>=30&&{icon:"🔬",t:"Glucosa en ayuno",d:"Detecta prediabetes en etapa reversible.",f:"Anual",c:C.orange},
              {icon:"☀️",t:"Vitamina D y B12",d:"Muy comunes en adultos jóvenes urbanos.",f:"Anual",c:C.orange},
              (profile.conditions.includes("Ansiedad")||profile.conditions.includes("Depresión"))&&{icon:"💬",t:"Psicólogo",d:"La TCC tiene evidencia sólida para ansiedad y depresión.",f:"Prioritario",c:C.purple},
              {icon:"🦷",t:"Examen dental",d:"Relacionado con inflamación sistémica.",f:"6 meses",c:C.green},
            ].filter(Boolean).map((r,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${r.c}`,borderColor:r.c+"22"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{fontSize:14,color:C.text,fontWeight:600}}>{r.t}</div><span style={{fontSize:10,background:r.c+"20",color:r.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{r.f}</span></div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.75}}>{r.d}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab==="mente"&&(
          <div style={LS.page}>
            <h2 style={LS.ptitle}>◎ Mente</h2>
            <p style={LS.psub}>La batalla más importante ocurre aquí dentro</p>
            <Card glow={C.green}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:8}}>RESPIRACIÓN 4-7-8</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.85,marginBottom:4}}>Activa el nervio vago. Cambia el sistema nervioso a parasimpático en minutos.</p>
              <p style={{fontSize:12,color:C.muted,marginBottom:16,fontStyle:"italic"}}>Inhala 4s · Sostén 7s · Exhala 8s</p>
              {breathActive?(
                <div style={{textAlign:"center",padding:"12px 0"}}>
                  <div style={{width:88,height:88,borderRadius:"50%",border:`2px solid ${C.green}`,background:C.green+"10",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 30px ${C.green}88`,animation:breathPhase==="inhala"?"expand 4s ease forwards":breathPhase==="exhala"?"contract 8s ease forwards":"none"}}>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:2}}>{breathPhase}</span>
                  </div>
                  <button onClick={stopBreath} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 20px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Detener</button>
                </div>
              ):<button onClick={startBreath} style={{...LS.btn,background:C.green,color:"#000",boxShadow:`0 0 20px ${C.green}44`}}>Iniciar respiración</button>}
            </Card>
            <div style={LS.section}>Prácticas con Evidencia</div>
            {[
              {icon:"🧠",t:"Meditación matutina",d:"10 min al despertar. Meta-análisis JAMA 2014: reduce ansiedad y depresión.",f:"Mañana",c:C.purple},
              {icon:"✍️",t:"Journaling de gratitud",d:"3 cosas buenas de hoy. Emmons 2003: 25% más bienestar subjetivo.",f:"Noche",c:C.cta},
              {icon:"🌑",t:"Desconexión digital",d:"1h sin redes. U. of Pennsylvania: reduce soledad y depresión.",f:"Diario",c:C.green},
              {icon:"🌅",t:"Luz solar matutina",d:"10-15 min antes de las 10AM. Regula cortisol y prepara melatonina.",f:"Mañana",c:C.orange},
            ].map((p,i)=>(
              <Card key={i} style={{borderLeft:`3px solid ${p.c}`,borderColor:p.c+"25"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.t}</div><span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span></div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>{p.d}</div>
                  </div>
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

const LS={
  btn:{width:"100%",background:C.green,border:"none",borderRadius:12,padding:"14px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",letterSpacing:1,transition:"all 0.3s",boxShadow:`0 0 20px ${C.green}44`},
  setupCard:{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"36px 28px"},
  badge:{fontSize:9,color:C.muted,letterSpacing:5,textTransform:"uppercase",marginBottom:12},
  stitle:{fontFamily:"'Cinzel',serif",fontSize:22,color:C.text,letterSpacing:2,marginBottom:8},
  ssub:{fontSize:13,color:C.muted,marginBottom:22,lineHeight:1.7},
  label:{display:"block",fontSize:10,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:7},
  input:{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"},
  page:{maxWidth:660,margin:"0 auto",padding:"24px 16px 60px"},
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
  button:hover{filter:brightness(1.1);}
  @keyframes aura-breathe{0%,100%{opacity:0.85;transform:scale(1);}50%{opacity:1;transform:scale(1.06);}}
  @keyframes dark-breathe{0%,100%{opacity:0.4;}50%{opacity:0.6;}}
  @keyframes ground-pulse{0%,100%{opacity:0.7;}50%{opacity:1;transform:scaleX(1.08);}}
  @keyframes ring-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes float-p{0%{transform:translateY(0);opacity:0.22;}100%{transform:translateY(-10px);opacity:0.42;}}
  @keyframes rain-fall{0%{transform:translateY(-20px);opacity:0;}10%{opacity:0.4;}90%{opacity:0.4;}100%{transform:translateY(110vh);opacity:0;}}
  @keyframes rain-streak{0%{transform:translateY(-100%);opacity:0;}5%{opacity:1;}95%{opacity:0.6;}100%{transform:translateY(200%);opacity:0;}}
  @keyframes expand{0%{transform:scale(1);}100%{transform:scale(1.3);}}
  @keyframes contract{0%{transform:scale(1.3);}100%{transform:scale(1);}}
  @keyframes pop-in{from{opacity:0;transform:scale(0.65);}to{opacity:1;transform:scale(1);}}
  @keyframes bounce-in{0%{transform:scale(0.3);opacity:0;}60%{transform:scale(1.1);}80%{transform:scale(0.95);}100%{transform:scale(1);opacity:1;}}
  @keyframes fade-up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes slide-up{from{transform:translateY(100%);}to{transform:translateY(0);}}
  @keyframes slide-up-toast{0%{opacity:0;transform:translateX(-50%) translateY(20px);}15%{opacity:1;transform:translateX(-50%) translateY(0);}80%{opacity:1;}100%{opacity:0;transform:translateX(-50%) translateY(-10px);}}
  @keyframes xp-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5);}30%{opacity:1;transform:translate(-50%,-80%) scale(1.2);}70%{opacity:1;transform:translate(-50%,-120%) scale(1);}100%{opacity:0;transform:translate(-50%,-160%) scale(0.8);}}
  @keyframes float-xp{0%{opacity:0;transform:translateX(-50%) scale(0.8);}20%{opacity:1;transform:translateX(-50%) scale(1.1);}70%{opacity:1;transform:translateX(-50%) translateY(-30px);}100%{opacity:0;transform:translateX(-50%) translateY(-60px);}}
  @keyframes confetti-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}
  @keyframes pulse-soft{0%,100%{opacity:0.6;}50%{opacity:1;}}
  @keyframes future-pulse{0%,100%{opacity:0.11;}50%{opacity:0.19;}}
  @keyframes star-pulse{0%,100%{box-shadow:0 0 32px #F59E0B55;}50%{box-shadow:0 0 48px #F59E0B88;}}
  @keyframes star-sweep{0%{transform:translateX(-100%);}100%{transform:translateX(400%);}}
  @keyframes star-drift{0%{transform:translateY(0);}100%{transform:translateY(8px);}}
  @keyframes nebula-drift{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(18px,12px) scale(1.1);}}
  @keyframes wings-flap{0%,100%{transform:scaleY(1);}50%{transform:scaleY(0.92);}}
  @keyframes hybrid-pulse{0%,100%{opacity:0.8;}50%{opacity:1;}}
  @keyframes wave{0%{transform:scaleX(1);}50%{transform:scaleX(1.1);}100%{transform:scaleX(1);}}
  @keyframes cta-pulse{0%,100%{box-shadow:0 0 40px #F9731655;}50%{box-shadow:0 0 60px #F9731688;}}
  @keyframes flame-flicker{0%{opacity:0.7;transform:scaleY(1);}100%{opacity:1;transform:scaleY(1.3);}}
  @keyframes node-pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  @keyframes equip-flash{0%{filter:brightness(1);}30%{filter:brightness(2.5) saturate(2);}60%{filter:brightness(1.5);}100%{filter:brightness(1);}}
  @media(max-width:600px){
    div[style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    div[style*="auto-fit, minmax(230"]{grid-template-columns:1fr!important;}
    div[style*="auto-fit, minmax(175"]{grid-template-columns:1fr!important;}
    div[style*="auto-fill, minmax(148"]{grid-template-columns:1fr 1fr!important;}
  }
`;
