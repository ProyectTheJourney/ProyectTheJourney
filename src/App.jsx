import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const STORAGE_KEY = "thejourney_v9";

const C = {
  bg:"#0F172A", card:"#1E293B", border:"#334155",
  green:"#10B981", orange:"#F59E0B", purple:"#8B5CF6",
  text:"#F1F5F9", muted:"#64748B", cta:"#F97316",
};

// ─── MAP STAGES ───────────────────────────────────────────────────
const MAP_STAGES = [
  { id:"origin",  label:"Origen",      sublabel:"El inicio",           minLevel:1,  planet:"🌑", color:"#64748B", unlockMsg:"El viaje comienza aquí." },
  { id:"dawn",    label:"Despertar",   sublabel:"Primera luz",         minLevel:4,  planet:"🌍", color:"#10B981", unlockMsg:"Los primeros pasos son los más importantes." },
  { id:"forge",   label:"La Forja",    sublabel:"Temple de acero",     minLevel:8,  planet:"🔴", color:"#EF4444", unlockMsg:"Aquí se forjan las leyendas." },
  { id:"warrior", label:"El Guerrero", sublabel:"Poder forjado",       minLevel:12, planet:"🟠", color:"#F97316", unlockMsg:"¡GUERRERO! Tu disciplina es innegable." },
  { id:"ascent",  label:"Ascensión",   sublabel:"Más allá del límite", minLevel:18, planet:"🔵", color:"#8B5CF6", unlockMsg:"Solo el 1% llega aquí." },
  { id:"stellar", label:"Estelar",     sublabel:"Entre las estrellas", minLevel:25, planet:"🪐", color:"#06B6D4", unlockMsg:"¡Navegas entre galaxias!" },
  { id:"legend",  label:"Leyenda",     sublabel:"Inmortal",            minLevel:35, planet:"⭐", color:"#F59E0B", unlockMsg:"LEYENDA. Pocos llegan. Tú lo lograste." },
];

// ─── MISSION CATALOG (18 missions for user to choose) ─────────────
const MISSION_CATALOG = [
  // FUERZA
  { id:"c1",  title:"Sprint matutino",        sub:"15 min de carrera intensa",          xp:40, icon:"🏃", attr:"FUE", area:"cuerpo", why:"El ejercicio matutino activa la dopamina y mantiene el foco durante el día." },
  { id:"c2",  title:"100 sentadillas",        sub:"A tu ritmo, en el momento que sea",  xp:35, icon:"🦵", attr:"FUE", area:"cuerpo", why:"Las sentadillas activan el mayor grupo muscular del cuerpo, acelerando el metabolismo." },
  { id:"c3",  title:"Sin azúcar hoy",         sub:"Cero azúcar añadida durante el día", xp:30, icon:"🚫", attr:"FUE", area:"cuerpo", why:"El azúcar crea picos de glucosa que destruyen el foco y la energía sostenida." },
  { id:"c4",  title:"Proteína en cada comida",sub:"Al menos 20g por comida",            xp:25, icon:"🥩", attr:"FUE", area:"cuerpo", why:"La proteína es el macronutriente que más saciedad genera y preserva músculo." },
  { id:"c5",  title:"Stretching completo",    sub:"20 min de estiramiento profundo",    xp:20, icon:"🧘", attr:"FUE", area:"cuerpo", why:"El estiramiento reduce cortisol y mejora la circulación hasta un 30%." },
  { id:"c6",  title:"Entrena con peso",       sub:"30 min de fuerza con carga",         xp:45, icon:"🏋️", attr:"FUE", area:"cuerpo", why:"El entrenamiento de fuerza aumenta la densidad ósea y el metabolismo basal." },
  // SABIDURÍA
  { id:"c7",  title:"Podcast educativo",      sub:"30 min escuchando mientras caminas", xp:25, icon:"🎧", attr:"SAB", area:"mente",  why:"Combinar movimiento y aprendizaje activa el BDNF, proteína del crecimiento neuronal." },
  { id:"c8",  title:"Aprende algo nuevo",     sub:"15 min en Duolingo, YouTube educativo o curso", xp:30, icon:"🧠", attr:"SAB", area:"mente", why:"El aprendizaje activo crea nuevas sinapsis y protege contra el deterioro cognitivo." },
  { id:"c9",  title:"Desconexión total",      sub:"2 horas sin pantallas por la tarde", xp:35, icon:"📵", attr:"SAB", area:"mente",  why:"El modo de red por defecto del cerebro necesita tiempo sin pantallas para consolidar información." },
  { id:"c10", title:"Planifica tu semana",    sub:"10 min revisando objetivos y agenda", xp:20, icon:"📋", attr:"SAB", area:"mente", why:"La planificación semanal reduce el estrés en 25% al eliminar decisiones improvisadas." },
  { id:"c11", title:"Carta a tu yo futuro",   sub:"Escribe 5 min sobre tus metas",      xp:25, icon:"✉️", attr:"SAB", area:"mente",  why:"Visualizar el yo futuro activa la corteza prefrontal y aumenta la motivación intrínseca." },
  { id:"c12", title:"Resuelve un problema",   sub:"Un reto mental: puzzle, matemáticas, ajedrez", xp:30, icon:"♟️", attr:"SAB", area:"mente", why:"Los retos cognitivos generan nuevas conexiones neuronales y retrasan el envejecimiento cerebral." },
  // VOLUNTAD
  { id:"c13", title:"Ducha fría",             sub:"Al menos 2 min de agua fría",        xp:35, icon:"🚿", attr:"VOL", area:"cuerpo", why:"La exposición al frío activa el sistema nervioso simpático y aumenta la norepinefrina un 300%." },
  { id:"c14", title:"Levántate sin alarma",   sub:"Despierta naturalmente, sin snooze",  xp:30, icon:"⏰", attr:"VOL", area:"cuerpo", why:"Levantarse sin alarma respeta los ciclos de sueño y mejora el estado de ánimo al despertar." },
  { id:"c15", title:"Di no a algo hoy",       sub:"Rechaza algo que no te conviene",     xp:25, icon:"🛑", attr:"VOL", area:"mente",  why:"Practicar el rechazo consciente fortalece los límites personales y la autoestima." },
  { id:"c16", title:"Medita en silencio",     sub:"15 min sin guía, solo respirando",   xp:30, icon:"🌀", attr:"VOL", area:"mente",  why:"La meditación sin guía desarrolla mayor capacidad de autorregulación emocional." },
  { id:"c17", title:"Cumple una promesa",     sub:"Haz algo que dijiste que harías",     xp:40, icon:"🤝", attr:"VOL", area:"mente",  why:"Cumplir compromisos propios activa el sistema de recompensa y refuerza la identidad de persona confiable." },
  { id:"c18", title:"Sin queja en todo el día",sub:"No expresar ninguna queja verbal",  xp:45, icon:"🤐", attr:"VOL", area:"mente",  why:"21 días sin queja recablean el cerebro hacia patrones de gratitud (experimento Will Bowen)." },
];

const MISSIONS_DATA = [
  {id:1,title:"Forja tu cuerpo",      sub:"20 min de movimiento consciente",   xp:35,icon:"⚡",area:"cuerpo",difficulty:"normal",attr:"FUE",lore:"El guerrero forja su cuerpo en el fuego.",  why:"20 min de ejercicio elevan dopamina, BDNF y serotonina."},
  {id:2,title:"Silencia la tormenta", sub:"10 min de meditación",              xp:30,icon:"◎", area:"mente", difficulty:"normal",attr:"SAB",lore:"La mente en calma ve lo que el caos oculta.",why:"10 min diarios reducen el volumen de la amígdala en 8 semanas."},
  {id:3,title:"El río de la vida",    sub:"8 vasos de agua durante el día",    xp:15,icon:"💧",area:"cuerpo",difficulty:"easy",  attr:"VOL",lore:"Tu cuerpo es 70% agua.",                   why:"Deshidratación del 2% reduce capacidad cognitiva 20%."},
  {id:4,title:"Alimenta tu mente",    sub:"Lee 15 páginas",                    xp:25,icon:"📖",area:"mente", difficulty:"normal",attr:"SAB",lore:"Cada página leída es un nivel ganado.",       why:"15 páginas diarias = 18 libros al año."},
  {id:5,title:"El gran silencio",     sub:"1 hora sin redes sociales",         xp:20,icon:"🌑",area:"mente", difficulty:"normal",attr:"VOL",lore:"Tu atención es tu recurso más escaso.",       why:"Cada notificación interrumpe el foco ~23 min."},
  {id:6,title:"El descanso del héroe",sub:"Duerme entre 7 y 9 horas",         xp:40,icon:"🌙",area:"cuerpo",difficulty:"normal",attr:"FUE",lore:"Los héroes se restauran en la oscuridad.",   why:"Dormir menos de 6h deteriora igual que 48h sin dormir."},
  {id:7,title:"Crónicas del viaje",   sub:"Escribe 3 cosas buenas de hoy",    xp:20,icon:"✍", area:"mente", difficulty:"normal",attr:"SAB",lore:"El que no recuerda su progreso no avanza.", why:"El journaling entrena al cerebro para detectar lo positivo."},
  {id:8,title:"La caminata del sabio",sub:"Camina 5-10 min después de comer", xp:15,icon:"🚶",area:"cuerpo",difficulty:"easy",  attr:"FUE",lore:"Los grandes pensadores caminaban.",         why:"10 min post-comida reduce el pico de glucosa hasta 30%."},
  {id:9,title:"ÉPICA: Entrena 45 min",sub:"Sesión completa de fuerza o cardio",xp:80,icon:"🔥",area:"cuerpo",difficulty:"epic", attr:"FUE",lore:"Solo los forjados conocen este fuego.",     why:"45 min activan adaptaciones que sesiones cortas no logran."},
  {id:10,title:"ÉPICA: Ayuno digital",sub:"4 horas sin pantallas",            xp:90,icon:"⚫",area:"mente", difficulty:"epic", attr:"VOL",lore:"El silencio absoluto revela verdades.",       why:"El cerebro necesita períodos prolongados para consolidar aprendizajes."},
];

const MISSION_ATTRS = {
  1:{FUE:3,SAB:1,VOL:2},2:{FUE:1,SAB:2,VOL:3},3:{FUE:2,SAB:1,VOL:2},
  4:{FUE:1,SAB:4,VOL:1},5:{FUE:1,SAB:2,VOL:3},6:{FUE:2,SAB:2,VOL:2},
  7:{FUE:1,SAB:3,VOL:2},8:{FUE:2,SAB:1,VOL:2},9:{FUE:5,SAB:2,VOL:3},10:{FUE:2,SAB:5,VOL:3},
};

const ARTIFACTS = [
  {id:"warrior_helmet",   name:"Casco del Guerrero",      icon:"🪖",attr:"FUE",bonus:5, minLevel:5, color:"#EF4444",desc:"Forjado en mil entrenamientos."},
  {id:"titan_gloves",     name:"Guantes de Titán",        icon:"🥊",attr:"FUE",bonus:8, minLevel:12,color:"#F97316",desc:"Cada golpe resuena en el cosmos."},
  {id:"steel_chestplate", name:"Coraza de Acero",         icon:"🛡", attr:"FUE",bonus:12,minLevel:20,color:"#EF4444",desc:"Impenetrable. Como tu disciplina."},
  {id:"visionary_glasses",name:"Gafas de Visionario",     icon:"🥽",attr:"SAB",bonus:5, minLevel:5, color:"#10B981",desc:"Ven lo que otros no pueden ver."},
  {id:"ancient_book",     name:"Libro Antiguo",           icon:"📜",attr:"SAB",bonus:8, minLevel:12,color:"#06B6D4",desc:"Siglos de sabiduría en tus manos."},
  {id:"knowledge_amulet", name:"Amuleto del Conocimiento",icon:"🔮",attr:"SAB",bonus:12,minLevel:20,color:"#10B981",desc:"La mente que nunca deja de crecer."},
  {id:"resilience_cape",  name:"Capa de Resiliencia",     icon:"🌊",attr:"VOL",bonus:5, minLevel:5, color:"#8B5CF6",desc:"Ante los vientos más fuertes, permaneces."},
  {id:"determination_ring",name:"Anillo de Determinación",icon:"💍",attr:"VOL",bonus:8, minLevel:12,color:"#A78BFA",desc:"Tu voluntad no tiene fin."},
  {id:"focus_bracelet",   name:"Brazalete de Enfoque",    icon:"⌚",attr:"VOL",bonus:12,minLevel:20,color:"#8B5CF6",desc:"Concentración absoluta."},
];

const ACHIEVEMENTS = [
  {id:"first_step",    icon:"👣",title:"Primer Paso",       desc:"Completa tu primera misión",           check:(s)=>s.totalMissions>=1},
  {id:"hydrated",      icon:"💧",title:"Bebedor Legendario",desc:"Completa el tanque de agua",           check:(s)=>s.waterCompleted>=1},
  {id:"level3",        icon:"⭐",title:"Viajero Estelar",   desc:"Alcanza el nivel 3",                   check:(s)=>s.level>=3},
  {id:"streak3",       icon:"🔥",title:"3 en Raya",         desc:"Racha de 3 días",                      check:(s)=>s.streak>=3},
  {id:"first_epic",    icon:"🔥",title:"El Primer Fuego",   desc:"Completa tu primera épica",            check:(s)=>s.epicDone},
  {id:"all_missions",  icon:"✅",title:"Día Perfecto",      desc:"Todas las misiones en un día",         check:(s)=>s.dayPerfect>=1},
  {id:"constante",     icon:"🌅",title:"Constante",         desc:"Registra ánimo 5 días",                check:(s)=>s.moodDays>=5},
  {id:"first_artifact",icon:"🎖",title:"Primer Artefacto",  desc:"Equipa tu primer artefacto",           check:(s)=>s.equippedCount>=1},
  {id:"level10",       icon:"⚔", title:"El Guerrero",       desc:"Alcanza el nivel 10",                  check:(s)=>s.level>=10},
  {id:"streak7",       icon:"🗓",title:"Semana Imparable",  desc:"7 días de racha",                      check:(s)=>s.streak>=7},
  {id:"xp500",         icon:"⚡",title:"500 XP",            desc:"Acumula 500 XP",                       check:(s)=>s.totalXP>=500},
  {id:"water10",       icon:"🌊",title:"Ola de Hidratación",desc:"Tanque completo 10 días",              check:(s)=>s.waterCompleted>=10},
  {id:"attrs50",       icon:"💪",title:"Polivalente",       desc:"50 puntos de atributos",               check:(s)=>(s.attrs.FUE+s.attrs.SAB+s.attrs.VOL)>=50},
  {id:"level20",       icon:"✦", title:"Leyenda Viviente",  desc:"Alcanza el nivel 20",                  check:(s)=>s.level>=20},
  {id:"streak30",      icon:"👑",title:"El Mes Perfecto",   desc:"30 días de racha",                     check:(s)=>s.streak>=30},
];

const STREAK_REWARDS = [
  {day:7, reward:"+100 XP bonus",     icon:"🎁",xp:100},
  {day:14,reward:"+200 XP bonus",     icon:"💎",xp:200},
  {day:30,reward:"+500 XP LEGENDARIO",icon:"👑",xp:500},
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

const STAGE_LEVELS=[1,11,26,51,81];
const WATER_MSGS=["Estás seco… ¡bebe y revive! 💀","Una gota en el desierto…","El guerrero necesita hidratarse ⚔","¡Mitad del camino, sigue así! 💧","Casi ahí, no pares ahora","¡Falta poco, viajero!","Un vaso más y llegas…","¡Último vaso! ¿Lo terminas?","¡TANQUE LLENO! Máximo poder 💎"];
const ARCHETYPES = [
  {id:"warrior",name:"El Guerrero",sub:"Disciplina · Fuerza · Acción",lore:"Tu poder nace de la constancia.",icon:"⚔",aura:"#F97316",mainAttr:"FUE",bg:"radial-gradient(ellipse at 50% -10%, #F9731622 0%, transparent 65%)"},
  {id:"sage",   name:"El Sabio",  sub:"Conocimiento · Claridad · Propósito",lore:"La mente es tu arma más poderosa.",icon:"✦",aura:"#10B981",mainAttr:"SAB",bg:"radial-gradient(ellipse at 50% -10%, #10B98122 0%, transparent 65%)"},
  {id:"explorer",name:"El Explorador",sub:"Equilibrio · Aventura · Evolución",lore:"Tu camino tiene infinitos horizontes.",icon:"◎",aura:"#8B5CF6",mainAttr:"VOL",bg:"radial-gradient(ellipse at 50% -10%, #8B5CF622 0%, transparent 65%)"},
];
const CONDITIONS=["Diabetes","Hipertensión","Ansiedad","Depresión","Colesterol alto","Hipotiroidismo","Insomnio","Sedentarismo"];
const GOALS=["Perder peso","Ganar músculo","Reducir estrés","Mejorar sueño","Más energía","Salud mental","Más disciplina","Comer mejor"];
const MOODS=[{e:"😔",l:"Bajo",v:1},{e:"😐",l:"Regular",v:2},{e:"🙂",l:"Bien",v:3},{e:"😄",l:"Excelente",v:4}];
const STAR_MISSIONS=[{title:"¡Estrella Fugaz! Sal a caminar 10 min",xp:80},{title:"¡Estrella Fugaz! Bebe 2 vasos de agua YA",xp:50},{title:"¡Estrella Fugaz! Haz 20 sentadillas",xp:70},{title:"¡Estrella Fugaz! Respira profundo 5 veces",xp:45},{title:"¡Estrella Fugaz! Escribe algo que te alegre",xp:55}];

// ─── NAV ITEMS ────────────────────────────────────────────────────
const NAV_ITEMS = [
  {id:"home",      icon:"⌂",  label:"Inicio"},
  {id:"mapa",      icon:"🗺", label:"Mapa del Viaje"},
  {id:"misiones",  icon:"◈",  label:"Misiones"},
  {id:"metas",     icon:"🎯", label:"Mis Metas"},
  {id:"artefactos",icon:"⚙",  label:"Arsenal"},
  {id:"logros",    icon:"🏆", label:"Logros"},
  {id:"salud",     icon:"✦",  label:"Salud"},
  {id:"mente",     icon:"◎",  label:"Mente"},
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
function getArtifactBonus(equipped,attr){return equipped.reduce((sum,id)=>{const a=ARTIFACTS.find(x=>x.id===id);return a&&a.attr===attr?sum+a.bonus:sum;},0);}


// ─── StarField ────────────────────────────────────────────────────
function StarField(){
  const stars=useMemo(()=>Array.from({length:55},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,sz:Math.random()*2+0.4,dur:Math.random()*20+12,delay:Math.random()*15,op:Math.random()*0.5+0.1})),[]);
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:s.sz,height:s.sz,borderRadius:"50%",background:"#fff",opacity:s.op,animation:`star-drift ${s.dur}s ${s.delay}s ease-in-out infinite alternate`}}/>)}
      <div style={{position:"absolute",top:"8%",left:"12%",width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,#10B98110,transparent 70%)",animation:"nebula-drift 28s ease-in-out infinite"}}/>
      <div style={{position:"absolute",top:"55%",right:"8%",width:150,height:150,borderRadius:"50%",background:"radial-gradient(circle,#8B5CF610,transparent 70%)",animation:"nebula-drift 32s 6s ease-in-out infinite reverse"}}/>
    </div>
  );
}

// ─── HAMBURGER MENU ───────────────────────────────────────────────
function HamburgerMenu({tab,setTab,player,arc,onResetDay,isOpen,setIsOpen}){
  const titleInfo=getLevelTitle(player?.level||1);
  return(
    <>
      {/* Overlay */}
      {isOpen&&<div onClick={()=>setIsOpen(false)} style={{position:"fixed",inset:0,background:"#000000aa",zIndex:40,backdropFilter:"blur(2px)"}}/>}
      {/* Slide-in drawer */}
      <div style={{position:"fixed",top:0,left:0,height:"100vh",width:280,background:"linear-gradient(180deg,#0d1525 0%,#0a0f1e 100%)",borderRight:`1px solid ${C.border}`,zIndex:50,transform:isOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.32s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"24px 20px 16px",borderBottom:`1px solid ${C.border}22`,background:arc?.bg}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.green,letterSpacing:3,textShadow:`0 0 10px ${C.green}`}}>THE JOURNEY</div>
            <button onClick={()=>setIsOpen(false)} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>✕</button>
          </div>
          {player&&(
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:arc?.aura+"22",border:`1px solid ${arc?.aura}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{arc?.icon}</div>
              <div>
                <div style={{fontSize:15,color:C.text,fontWeight:700}}>{player.name}</div>
                <div style={{fontSize:11,color:arc?.aura}}>Nv.{player.level} · {titleInfo.title}</div>
                <div style={{fontSize:10,color:C.muted}}>{titleInfo.rank}</div>
              </div>
            </div>
          )}
          {player&&(
            <div style={{marginTop:12,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min((player.xp/player.xpNext)*100,100)}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:2,boxShadow:`0 0 8px ${C.green}`}}/>
            </div>
          )}
        </div>
        {/* Nav items */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 12px"}}>
          {NAV_ITEMS.map(n=>(
            <button key={n.id} onClick={()=>{setTab(n.id);setIsOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"13px 14px",borderRadius:12,border:"none",background:tab===n.id?C.green+"18":"transparent",color:tab===n.id?C.green:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:tab===n.id?700:400,marginBottom:4,transition:"all 0.2s",boxShadow:tab===n.id?`inset 0 0 0 1px ${C.green}33`:"none",textAlign:"left"}}>
              <span style={{fontSize:18,width:24,textAlign:"center"}}>{n.icon}</span>
              <span>{n.label}</span>
              {tab===n.id&&<span style={{marginLeft:"auto",fontSize:10,color:C.green}}>●</span>}
            </button>
          ))}
        </div>
        {/* Footer */}
        <div style={{padding:"12px 12px 24px",borderTop:`1px solid ${C.border}22`}}>
          <button onClick={()=>{onResetDay();setIsOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>
            <span>↺</span><span>Nuevo día</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────
function TopBar({onOpen,player,tab,arc}){
  const label=NAV_ITEMS.find(n=>n.id===tab)?.label||"The Journey";
  return(
    <div style={{position:"sticky",top:0,zIndex:30,background:C.bg+"ee",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}22`,padding:"0 16px",height:52,display:"flex",alignItems:"center",gap:14}}>
      <button onClick={onOpen} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}} aria-label="Menú">
        <div style={{width:22,height:2,background:arc?.aura||C.green,borderRadius:1,transition:"all 0.3s"}}/>
        <div style={{width:16,height:2,background:arc?.aura||C.green,borderRadius:1,transition:"all 0.3s"}}/>
        <div style={{width:22,height:2,background:arc?.aura||C.green,borderRadius:1,transition:"all 0.3s"}}/>
      </button>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:C.text,letterSpacing:1,flex:1}}>{label}</div>
      {player&&(
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:12,color:C.orange,fontWeight:700,fontFamily:"'Cinzel',serif"}}>🔥{player.streak}</div>
          <div style={{fontSize:12,color:C.green,fontWeight:700}}>Nv.{player.level}</div>
        </div>
      )}
    </div>
  );
}

// ─── SMART MISSIONS SCREEN ────────────────────────────────────────
function MissionsScreen({missions,completeMission,completedAnim,attrs,arc,water,addXP,extraMissions,setExtraMissions}){
  const [view,setView]=useState("today"); // today | suggested | catalog
  const [catalogFilter,setCatalogFilter]=useState("all");
  const [addedToday,setAddedToday]=useState([]);
  const doneMissions=missions.filter(m=>m.done).length;

  // Suggested missions: based on lowest attr
  const lowestAttr=Object.entries(attrs).sort(([,a],[,b])=>a-b)[0]?.[0]||"FUE";
  const suggested=MISSION_CATALOG.filter(m=>m.attr===lowestAttr).slice(0,3);
  const attrLabels={FUE:"💪 Fuerza",SAB:"📖 Sabiduría",VOL:"⚡ Voluntad"};
  const attrColors={FUE:C.cta,SAB:C.green,VOL:C.purple};

  const catalogFiltered=catalogFilter==="all"?MISSION_CATALOG:MISSION_CATALOG.filter(m=>m.attr===catalogFilter);

  function addMissionToday(cm){
    if(addedToday.find(m=>m.id===cm.id))return;
    setAddedToday(prev=>[...prev,{...cm,done:false}]);
    setExtraMissions(prev=>[...prev,{...cm,done:false}]);
  }

  function completeExtra(id){
    if(extraMissions.find(m=>m.id===id)?.done)return;
    setExtraMissions(prev=>prev.map(m=>m.id===id?{...m,done:true}:m));
    const m=MISSION_CATALOG.find(c=>c.id===id);
    if(m)addXP(m.xp,null,true);
  }

  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 0 60px"}}>
      {/* View switcher */}
      <div style={{display:"flex",gap:0,background:C.card,borderRadius:0,borderBottom:`1px solid ${C.border}`,position:"sticky",top:52,zIndex:20}}>
        {[["today","◈ Hoy"],["suggested","🤖 Sugeridas"],["catalog","📚 Catálogo"]].map(([v,label])=>(
          <button key={v} onClick={()=>setView(v)} style={{flex:1,padding:"13px 8px",border:"none",background:"transparent",color:view===v?C.green:C.muted,fontSize:12,fontWeight:view===v?700:400,cursor:"pointer",fontFamily:"inherit",borderBottom:`2px solid ${view===v?C.green:"transparent"}`,transition:"all 0.2s"}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:"16px 14px"}}>
        {/* TODAY VIEW */}
        {view==="today"&&(
          <>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:13,color:C.muted}}>Progreso de hoy</span>
                <span style={{fontSize:12,color:C.green,fontWeight:700}}>{doneMissions}/{missions.length+extraMissions.length}</span>
              </div>
              <div style={{height:5,background:C.bg,borderRadius:3,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${(doneMissions/(missions.length+extraMissions.filter(m=>!missions.find(x=>x.id===m.id)).length||missions.length))*100}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:3,transition:"width 0.6s",boxShadow:`0 0 10px ${C.green}`}}/>
              </div>
              <div style={{display:"flex",gap:12,fontSize:11}}>
                {[["FUE",C.cta,"💪"],["SAB",C.green,"📖"],["VOL",C.purple,"⚡"]].map(([k,c,ic])=>(
                  <span key={k} style={{color:c}}>{ic} {k}: {attrs[k]}</span>
                ))}
              </div>
            </div>
            {/* Fixed missions */}
            <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:10}}>MISIONES FIJAS</div>
            {missions.map((m,i)=>{
              const wLocked=m.id===3&&water<8&&!m.done;
              return(
                <div key={m.id} style={{background:m.difficulty==="epic"?`linear-gradient(135deg,${C.card},#0a0a18)`:C.card,border:`1px solid ${m.done?C.border:m.difficulty==="epic"?C.purple+"44":C.green+"28"}`,borderRadius:16,padding:"14px 16px",marginBottom:10,transition:"all 0.4s",transform:completedAnim===i?"scale(1.015)":"scale(1)",boxShadow:m.difficulty==="epic"&&!m.done?`0 0 20px ${C.purple}15`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,cursor:wLocked?"not-allowed":"pointer"}} onClick={()=>completeMission(i)}>
                    <div style={{width:32,height:32,border:`1.5px solid ${m.done?C.green:m.difficulty==="epic"?C.purple:C.border}`,borderRadius:9,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:m.done?"#000":C.muted,fontWeight:800,transition:"all 0.4s",boxShadow:m.done?`0 0 14px ${C.green}`:m.difficulty==="epic"?`0 0 10px ${C.purple}33`:"none",opacity:m.done?0.7:1}}>{m.done?"✓":m.icon}</div>
                    <div style={{flex:1,opacity:m.done?0.45:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:14,color:m.difficulty==="epic"?C.purple:C.text,fontWeight:600}}>{m.title}</span>
                        {m.difficulty==="epic"&&!m.done&&<span style={{fontSize:9,color:C.purple,background:C.purple+"15",borderRadius:5,padding:"2px 6px",border:`1px solid ${C.purple}33`}}>ÉPICA</span>}
                        {wLocked&&<span style={{fontSize:9,color:C.muted,background:C.muted+"10",borderRadius:5,padding:"2px 6px"}}>Llena el tanque</span>}
                      </div>
                      <div style={{fontSize:11,color:C.muted}}>{m.sub}</div>
                      {MISSION_ATTRS[m.id]&&!m.done&&(
                        <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                          {Object.entries(MISSION_ATTRS[m.id]).filter(([,v])=>v>0).map(([k,v])=>(
                            <span key={k} style={{fontSize:9,color:k==="FUE"?C.cta:k==="SAB"?C.green:C.purple,background:(k==="FUE"?C.cta:k==="SAB"?C.green:C.purple)+"15",borderRadius:5,padding:"2px 6px"}}>+{v} {k}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,opacity:m.done?0.4:1}}>
                      <div style={{fontSize:13,color:m.difficulty==="epic"?C.purple:C.green,fontWeight:700}}>+{m.xp} XP</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Extra missions added from catalog */}
            {extraMissions.length>0&&(
              <>
                <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:10,marginTop:4}}>MISIONES PERSONALIZADAS HOY</div>
                {extraMissions.map(m=>(
                  <div key={m.id} style={{background:C.card,border:`1px solid ${m.done?C.border:attrColors[m.attr]+"33"}`,borderRadius:16,padding:"14px 16px",marginBottom:10,transition:"all 0.4s",opacity:m.done?0.5:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,cursor:m.done?"default":"pointer"}} onClick={()=>completeExtra(m.id)}>
                      <div style={{width:32,height:32,border:`1.5px solid ${m.done?C.green:attrColors[m.attr]}`,borderRadius:9,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:m.done?"#000":C.muted,fontWeight:800,flexShrink:0,transition:"all 0.4s",boxShadow:m.done?`0 0 10px ${C.green}`:"none"}}>{m.done?"✓":m.icon}</div>
                      <div style={{flex:1,opacity:m.done?0.6:1}}>
                        <div style={{fontSize:14,color:C.text,fontWeight:600,marginBottom:2}}>{m.title}</div>
                        <div style={{fontSize:11,color:C.muted}}>{m.sub}</div>
                        <div style={{marginTop:4}}>
                          <span style={{fontSize:9,color:attrColors[m.attr],background:attrColors[m.attr]+"15",borderRadius:5,padding:"2px 8px"}}>+{m.attr}</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,opacity:m.done?0.4:1}}>
                        <div style={{fontSize:13,color:C.green,fontWeight:700}}>+{m.xp} XP</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            <button onClick={()=>setView("suggested")} style={{width:"100%",background:C.green+"14",border:`1.5px dashed ${C.green}40`,borderRadius:14,padding:"14px",color:C.green,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginTop:4}}>
              🤖 Ver misiones sugeridas para hoy →
            </button>
          </>
        )}

        {/* SUGGESTED VIEW */}
        {view==="suggested"&&(
          <>
            <div style={{background:`linear-gradient(135deg,${lowestAttr==="FUE"?C.cta:lowestAttr==="SAB"?C.green:C.purple}18,transparent)`,border:`1px solid ${attrColors[lowestAttr]}33`,borderRadius:16,padding:"16px",marginBottom:20}}>
              <div style={{fontSize:10,color:attrColors[lowestAttr],letterSpacing:3,marginBottom:6}}>🤖 ANÁLISIS DEL ROBOT</div>
              <div style={{fontSize:15,color:C.text,fontWeight:700,marginBottom:6}}>Tu {attrLabels[lowestAttr]} está más baja</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
                FUE: <strong style={{color:C.cta}}>{attrs.FUE}</strong> · SAB: <strong style={{color:C.green}}>{attrs.SAB}</strong> · VOL: <strong style={{color:C.purple}}>{attrs.VOL}</strong>
              </div>
              <div style={{fontSize:12,color:C.muted,marginTop:6}}>Te sugiero estas misiones para equilibrar tus atributos:</div>
            </div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:12}}>MISIONES RECOMENDADAS PARA TI</div>
            {suggested.map(m=>{
              const alreadyAdded=extraMissions.find(e=>e.id===m.id);
              return(
                <div key={m.id} style={{background:C.card,border:`2px solid ${attrColors[m.attr]}33`,borderRadius:16,padding:"16px",marginBottom:12,boxShadow:`0 0 16px ${attrColors[m.attr]}10`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                    <div style={{fontSize:28,flexShrink:0}}>{m.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,color:C.text,fontWeight:700,marginBottom:4}}>{m.title}</div>
                      <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{m.sub}</div>
                      <div style={{fontSize:11,color:attrColors[m.attr],background:attrColors[m.attr]+"15",borderRadius:8,padding:"6px 10px",marginBottom:8,lineHeight:1.5}}>📚 {m.why}</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:11,color:attrColors[m.attr],fontWeight:700}}>+{m.xp} XP · {attrLabels[m.attr]}</span>
                        <button onClick={()=>{addMissionToday(m);setView("today");}} disabled={!!alreadyAdded} style={{background:alreadyAdded?C.border:attrColors[m.attr],border:"none",borderRadius:10,padding:"8px 16px",color:alreadyAdded?"#666":"#000",fontSize:12,cursor:alreadyAdded?"default":"pointer",fontFamily:"'Cinzel',serif",fontWeight:700,transition:"all 0.3s"}}>
                          {alreadyAdded?"✓ Agregada":"+ Agregar a hoy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:16}}>¿No te convencen? Explora el catálogo completo →</div>
            <button onClick={()=>setView("catalog")} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",color:C.muted,cursor:"pointer",fontFamily:"inherit",fontSize:13,marginTop:8}}>Ver catálogo completo de 18 misiones</button>
          </>
        )}

        {/* CATALOG VIEW */}
        {view==="catalog"&&(
          <>
            <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Elige las misiones que quieres hacer hoy. Se agregan a tu lista personalizada.</div>
            {/* Filter */}
            <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
              {[["all","Todas"],["FUE","💪 Fuerza"],["SAB","📖 Sabiduría"],["VOL","⚡ Voluntad"]].map(([f,l])=>(
                <button key={f} onClick={()=>setCatalogFilter(f)} style={{flexShrink:0,border:`1px solid ${catalogFilter===f?(f==="FUE"?C.cta:f==="SAB"?C.green:f==="VOL"?C.purple:C.green)+"70":C.border}`,borderRadius:20,padding:"7px 14px",background:catalogFilter===f?(f==="FUE"?C.cta:f==="SAB"?C.green:f==="VOL"?C.purple:C.green)+"18":"transparent",color:catalogFilter===f?(f==="FUE"?C.cta:f==="SAB"?C.green:f==="VOL"?C.purple:C.green):C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>
                  {l}
                </button>
              ))}
            </div>
            {catalogFiltered.map(m=>{
              const alreadyAdded=extraMissions.find(e=>e.id===m.id);
              const ac=attrColors[m.attr];
              return(
                <div key={m.id} style={{background:C.card,border:`1px solid ${alreadyAdded?C.green+"44":C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,transition:"all 0.3s",boxShadow:alreadyAdded?`0 0 14px ${C.green}18`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:24,flexShrink:0}}>{m.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,color:C.text,fontWeight:600,marginBottom:2}}>{m.title}</div>
                      <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{m.sub}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,color:ac,background:ac+"15",borderRadius:5,padding:"2px 8px"}}>{attrLabels[m.attr]}</span>
                        <span style={{fontSize:10,color:C.green}}>+{m.xp} XP</span>
                      </div>
                    </div>
                    <button onClick={()=>{addMissionToday(m);}} disabled={!!alreadyAdded} style={{flexShrink:0,background:alreadyAdded?C.green+"18":ac,border:`1px solid ${alreadyAdded?C.green:ac}`,borderRadius:10,padding:"8px 14px",color:alreadyAdded?C.green:"#000",fontSize:12,cursor:alreadyAdded?"default":"pointer",fontFamily:"inherit",fontWeight:700,transition:"all 0.3s",whiteSpace:"nowrap"}}>
                      {alreadyAdded?"✓":"+ Agregar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}


// ─── Planet Map ───────────────────────────────────────────────────
function PlanetMap({level,playerName,archetype}){
  const arc=ARCHETYPES.find(a=>a.id===archetype)||ARCHETYPES[0];
  const currentIdx=MAP_STAGES.findLastIndex(s=>level>=s.minLevel);
  const [tooltip,setTooltip]=useState(null);
  const [shipPos,setShipPos]=useState(null);
  const prevLevel=useRef(level);
  const animRef=useRef(null);
  const positions=[{x:55,y:350},{x:148,y:272},{x:248,y:308},{x:338,y:194},{x:425,y:248},{x:515,y:145},{x:595,y:70}];

  useEffect(()=>{
    const target=positions[Math.min(currentIdx,positions.length-1)];
    if(!shipPos){setShipPos(target);return;}
    if(level>prevLevel.current){
      const start={...shipPos};
      const dur=1200,t0=Date.now();
      function step(){
        const p=Math.min((Date.now()-t0)/dur,1);
        const e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
        setShipPos({x:start.x+(target.x-start.x)*e,y:start.y+(target.y-start.y)*e});
        if(p<1)animRef.current=requestAnimationFrame(step);
        else setShipPos(target);
      }
      animRef.current=requestAnimationFrame(step);
    }
    prevLevel.current=level;
    return()=>{if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[level,currentIdx]);

  const sx=shipPos?.x??positions[currentIdx]?.x??55;
  const sy=shipPos?.y??positions[currentIdx]?.y??350;
  const pathD=positions.reduce((acc,p,i)=>{if(i===0)return`M ${p.x} ${p.y}`;const prev=positions[i-1];return`${acc} Q ${prev.x+10} ${prev.y-10} ${(prev.x+p.x)/2} ${(prev.y+p.y)/2}`;},"");

  return(
    <div style={{background:"linear-gradient(180deg,#04060f 0%,#080d1e 40%,#0a0f20 100%)",border:`1px solid ${C.border}`,borderRadius:20,padding:"14px",marginBottom:16,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:3}}>MAPA DEL VIAJE</div>
          <div style={{fontSize:13,color:C.text,fontWeight:700,marginTop:2}}>{MAP_STAGES[currentIdx]?.planet} {MAP_STAGES[currentIdx]?.label} <span style={{color:MAP_STAGES[currentIdx]?.color,fontSize:11,fontWeight:400}}>— {MAP_STAGES[currentIdx]?.sublabel}</span></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.muted}}>Planeta {currentIdx+1}/{MAP_STAGES.length}</div>
          <div style={{fontSize:11,color:C.green,fontWeight:700}}>Nv.{level}</div>
        </div>
      </div>
      <svg viewBox="0 0 650 400" style={{width:"100%",height:"auto",display:"block"}}>
        <defs>
          <radialGradient id="spbg" cx="25%" cy="75%" r="85%"><stop offset="0%" stopColor="#1e3050"/><stop offset="50%" stopColor="#0d1829"/><stop offset="100%" stopColor="#060810"/></radialGradient>
          <filter id="pglow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="sglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="650" height="400" fill="url(#spbg)" rx="14"/>
        <circle cx="28" cy="375" r="55" fill="#F59E0B" fillOpacity="0.12" filter="url(#pglow)"/>
        <circle cx="28" cy="375" r="30" fill="#F97316" fillOpacity="0.2"/>
        <ellipse cx="608" cy="46" rx="50" ry="24" fill="#8B5CF6" fillOpacity="0.07" transform="rotate(-18,608,46)" filter="url(#pglow)"/>
        {[[80,38],[210,22],[355,60],[505,32],[620,98],[102,140],[460,108],[572,185],[65,272],[315,352],[528,330],[170,320],[400,278],[280,148]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%3===0?1.5:0.9} fill="#fff" opacity={0.15+((i*13)%5)*0.09}/>
        ))}
        <ellipse cx="165" cy="92" rx="90" ry="55" fill="#10B981" fillOpacity="0.04" filter="url(#pglow)"/>
        <ellipse cx="495" cy="290" rx="110" ry="65" fill="#8B5CF6" fillOpacity="0.05" filter="url(#pglow)"/>
        {/* Path */}
        <path d={pathD} fill="none" stroke="#1e2a44" strokeWidth="2.5" strokeDasharray="5 6" strokeLinecap="round" opacity="0.6"/>
        {currentIdx>0&&<path d={positions.slice(0,currentIdx+1).reduce((acc,p,i)=>{if(i===0)return`M ${p.x} ${p.y}`;const prev=positions[i-1];return`${acc} Q ${prev.x+10} ${prev.y-10} ${(prev.x+p.x)/2} ${(prev.y+p.y)/2}`;},"")} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" filter="url(#sglow)" opacity="0.85"/>}
        {/* Planets */}
        {MAP_STAGES.map((stage,i)=>{
          const pos=positions[i];if(!pos)return null;
          const unlocked=level>=stage.minLevel;
          const isCurrent=i===currentIdx;
          const isNext=i===currentIdx+1;
          const prevMin=MAP_STAGES[i-1]?.minLevel||1;
          const prog=isNext&&level>prevMin?Math.min((level-prevMin)/(stage.minLevel-prevMin),1):0;
          return(
            <g key={stage.id} onClick={()=>setTooltip(tooltip===i?null:i)} style={{cursor:"pointer"}}>
              {unlocked&&<circle cx={pos.x} cy={pos.y} r={isCurrent?26:20} fill={stage.color} fillOpacity="0.1" filter="url(#pglow)"/>}
              {isCurrent&&<circle cx={pos.x} cy={pos.y} r="22" fill="none" stroke={stage.color} strokeWidth="1.5" opacity="0.45" style={{animation:"node-pulse 2s ease-in-out infinite"}}/>}
              <circle cx={pos.x} cy={pos.y} r={isCurrent?17:13} fill={unlocked?stage.color+"28":"#0d1225"} stroke={unlocked?stage.color:"#1e2a44"} strokeWidth={isCurrent?2.5:1.5}/>
              {unlocked&&<><circle cx={pos.x-4} cy={pos.y-3} r={isCurrent?5:4} fill={stage.color} fillOpacity="0.15"/><circle cx={pos.x+3} cy={pos.y+4} r={isCurrent?4:3} fill={stage.color} fillOpacity="0.1"/></>}
              <text x={pos.x} y={pos.y+(isCurrent?7:6)} textAnchor="middle" fontSize={isCurrent?17:13}>{stage.planet}</text>
              <text x={pos.x} y={pos.y+(isCurrent?32:28)} textAnchor="middle" fontSize="8.5" fill={unlocked?stage.color:"#3d4f6a"} fontFamily="sans-serif" fontWeight={isCurrent?"bold":"normal"}>{stage.label}</text>
              {!unlocked&&<text x={pos.x+10} y={pos.y-10} fontSize="7.5">🔒</text>}
              {isNext&&prog>0&&<circle cx={pos.x} cy={pos.y} r="16" fill="none" stroke={stage.color} strokeWidth="2" strokeDasharray={`${prog*100.5} 100.5`} strokeLinecap="round" transform={`rotate(-90 ${pos.x} ${pos.y})`} opacity="0.5"/>}
              {unlocked&&i>0&&[0,1,2].map(s=><text key={s} x={pos.x-9+s*9} y={pos.y-(isCurrent?22:18)} fontSize="7" textAnchor="middle">⭐</text>)}
              {tooltip===i&&(
                <g><rect x={Math.min(pos.x-65,555)} y={pos.y-80} width="142" height="56" rx="8" fill="#1E293B" stroke={stage.color} strokeWidth="1"/>
                <text x={Math.min(pos.x-65,555)+71} y={pos.y-60} textAnchor="middle" fontSize="10" fill={stage.color} fontFamily="sans-serif" fontWeight="bold">{stage.planet} {stage.label}</text>
                <text x={Math.min(pos.x-65,555)+71} y={pos.y-44} textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="sans-serif">{unlocked?"✓ Desbloqueado":`Requiere Nv.${stage.minLevel}`}</text>
                <text x={Math.min(pos.x-65,555)+71} y={pos.y-30} textAnchor="middle" fontSize="8" fill="#64748B" fontFamily="sans-serif">{stage.sublabel}</text></g>
              )}
            </g>
          );
        })}
        {/* Ship */}
        <g transform={`translate(${sx-15},${sy-50})`} style={{filter:`drop-shadow(0 0 6px ${arc.aura})`}}>
          <ellipse cx="15" cy="53" rx="5" ry="9" fill="#F97316" fillOpacity="0.85" filter="url(#sglow)" style={{animation:"flame-flicker 0.35s ease-in-out infinite alternate"}}/>
          <ellipse cx="15" cy="51" rx="3" ry="5.5" fill="#F59E0B" fillOpacity="0.95"/>
          <ellipse cx="15" cy="58" rx="10" ry="4" fill={arc.aura} fillOpacity="0.25" filter="url(#sglow)"/>
          <path d="M 15 4 L 24 31 L 15 27 L 6 31 Z" fill="#1E293B" stroke={arc.aura} strokeWidth="1.3"/>
          <path d="M 6 29 L 0 40 L 8 36 Z" fill={arc.aura} fillOpacity="0.7"/>
          <path d="M 24 29 L 30 40 L 22 36 Z" fill={arc.aura} fillOpacity="0.7"/>
          <ellipse cx="15" cy="16" rx="5" ry="7" fill={arc.aura} fillOpacity="0.28"/>
          <ellipse cx="15" cy="15" rx="3" ry="4.5" fill={arc.aura} fillOpacity="0.6"/>
          <text x="15" y="-4" textAnchor="middle" fontSize="7.5" fill={C.text} fontFamily="sans-serif" fontWeight="bold">{playerName}</text>
        </g>
      </svg>
      <div style={{marginTop:8,padding:"8px 14px",background:MAP_STAGES[currentIdx]?.color+"14",border:`1px solid ${MAP_STAGES[currentIdx]?.color}28`,borderRadius:10,fontSize:11,color:MAP_STAGES[currentIdx]?.color,fontStyle:"italic",textAlign:"center"}}>"{MAP_STAGES[currentIdx]?.unlockMsg}"</div>
      {currentIdx<MAP_STAGES.length-1&&(
        <div style={{marginTop:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:10,color:C.muted}}>Próximo: <span style={{color:MAP_STAGES[currentIdx+1]?.color}}>{MAP_STAGES[currentIdx+1]?.planet} {MAP_STAGES[currentIdx+1]?.label}</span></span>
            <span style={{fontSize:10,color:C.green,fontWeight:700}}>Nv.{MAP_STAGES[currentIdx+1]?.minLevel}</span>
          </div>
          <div style={{height:4,background:C.bg,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(((level-(MAP_STAGES[currentIdx]?.minLevel||1))/((MAP_STAGES[currentIdx+1]?.minLevel||2)-(MAP_STAGES[currentIdx]?.minLevel||1)))*100,100)}%`,background:`linear-gradient(90deg,${MAP_STAGES[currentIdx+1]?.color}55,${MAP_STAGES[currentIdx+1]?.color})`,borderRadius:2,transition:"width 0.8s",boxShadow:`0 0 8px ${MAP_STAGES[currentIdx+1]?.color}`}}/>
          </div>
        </div>
      )}
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
  const hasWings=acc.some(x=>x.id==="light_wings"),hasCrown=acc.some(x=>x.id==="crown"),hasArmor=acc.some(x=>x.id==="full_armor"),hasAura=acc.some(x=>x.id==="neon_aura"),hasPads=acc.some(x=>x.id==="shoulder_pads");
  const hybrid=getHybrid(archetype,attrs);
  const hasFUE=equipped.some(id=>ARTIFACTS.find(a=>a.id===id&&a.attr==="FUE"));
  const hasSAB=equipped.some(id=>ARTIFACTS.find(a=>a.id===id&&a.attr==="SAB"));
  const hasVOL=equipped.some(id=>ARTIFACTS.find(a=>a.id===id&&a.attr==="VOL"));
  const hasHelmet=equipped.includes("warrior_helmet")||equipped.includes("titan_gloves")||equipped.includes("steel_chestplate");
  const hasGlasses=equipped.includes("visionary_glasses")||equipped.includes("ancient_book")||equipped.includes("knowledge_amulet");
  const hasCape=equipped.includes("resilience_cape")||equipped.includes("determination_ring")||equipped.includes("focus_bracelet");
  const artifactCount=equipped.length;
  const id=`${archetype}${level}`;
  return(
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none" style={{overflow:"visible"}}>
      <defs>
        <radialGradient id={`BL${id}`} cx="50%" cy="42%" r="52%"><stop offset="0%" stopColor={ac} stopOpacity={li}/><stop offset="50%" stopColor={ac} stopOpacity={li*0.3}/><stop offset="100%" stopColor={ac} stopOpacity="0"/></radialGradient>
        <radialGradient id={`GL${id}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={ac} stopOpacity={li*0.9}/><stop offset="100%" stopColor={ac} stopOpacity="0"/></radialGradient>
        <radialGradient id={`BD${archetype}`} cx="50%" cy="20%" r="75%"><stop offset="0%" stopColor={darkDay?"#1a1a2a":hasArmor?"#1a2840":"#1E293B"}/><stop offset="55%" stopColor={darkDay?"#0e0e18":"#0F172A"}/><stop offset="100%" stopColor="#080c18"/></radialGradient>
        <radialGradient id={`EL${archetype}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={ac} stopOpacity={bl}/><stop offset="100%" stopColor={ac} stopOpacity="0"/></radialGradient>
        <filter id={`GA${archetype}`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id={`GB${archetype}`} x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="11" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id={`GC${archetype}`} x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="20"/></filter>
      </defs>
      <ellipse cx="110" cy="115" rx="95" ry="110" fill={ac} fillOpacity={li*0.1} filter={`url(#GC${archetype})`}/>
      <ellipse cx="110" cy="115" rx="74" ry="90" fill={`url(#BL${id})`} style={animate?{animation:darkDay?"dark-breathe 6s ease-in-out infinite":"aura-breathe 4s ease-in-out infinite"}:{}}/>
      <ellipse cx="110" cy="202" rx={46+stage*10} ry={11+stage*3} fill={`url(#GL${id})`} style={animate?{animation:"ground-pulse 3s ease-in-out infinite"}:{}}/>
      {hasAura&&!darkDay&&<ellipse cx="110" cy="115" rx="92" ry="108" fill={ac} fillOpacity="0.08" stroke={ac} strokeWidth="1" strokeOpacity="0.3" style={{animation:"ring-spin 8s linear infinite"}}/>}
      {/* ARTIFACT RINGS - clearly visible, color-coded */}
      {hasFUE&&!darkDay&&<><ellipse cx="110" cy="115" rx="100" ry="116" fill="none" stroke={C.cta} strokeWidth="2.5" strokeOpacity="0.7" strokeDasharray="8 5" style={{animation:"ring-spin 9s linear infinite reverse"}} filter={`url(#GA${archetype})`}/><ellipse cx="110" cy="115" rx="100" ry="116" fill={C.cta} fillOpacity="0.06"/></>}
      {hasSAB&&!darkDay&&<><ellipse cx="110" cy="115" rx="107" ry="124" fill="none" stroke={C.green} strokeWidth="2.5" strokeOpacity="0.7" strokeDasharray="6 4" style={{animation:"ring-spin 13s linear infinite"}} filter={`url(#GA${archetype})`}/><ellipse cx="110" cy="115" rx="107" ry="124" fill={C.green} fillOpacity="0.05"/></>}
      {hasVOL&&!darkDay&&<><ellipse cx="110" cy="115" rx="114" ry="132" fill="none" stroke={C.purple} strokeWidth="2.5" strokeOpacity="0.7" strokeDasharray="4 6" style={{animation:"ring-spin 17s linear infinite reverse"}} filter={`url(#GA${archetype})`}/><ellipse cx="110" cy="115" rx="114" ry="132" fill={C.purple} fillOpacity="0.04"/></>}
      {/* Artifact glow badges - icons floating around avatar */}
      {artifactCount>0&&!darkDay&&equipped.slice(0,4).map((artId,i)=>{
        const art=ARTIFACTS.find(a=>a.id===artId);if(!art)return null;
        const angle=(i/Math.max(equipped.length,1))*Math.PI*2 - Math.PI/2;
        const r=88+stage*4;
        const bx=110+Math.cos(angle)*r, by=118+Math.sin(angle)*r*0.55;
        return<g key={artId} style={{animation:`float-p ${2.8+i*0.6}s ${i*0.4}s ease-in-out infinite alternate`}}>
          <circle cx={bx} cy={by} r="11" fill={art.color+"33"} stroke={art.color} strokeWidth="1.2"/>
          <text x={bx} y={by+4} textAnchor="middle" fontSize="11">{art.icon}</text>
        </g>;
      })}
      {showFuture&&!darkDay&&<g opacity="0.11" style={{animation:"future-pulse 4s ease-in-out infinite"}}><ellipse cx="110" cy="118" rx="88" ry="106" fill={ac} fillOpacity="0.06"/><rect x="76" y="150" width="20" height="50" rx="10" fill={ac}/><rect x="124" y="150" width="20" height="50" rx="10" fill={ac}/><rect x="70" y="98" width="80" height="60" rx="16" fill={ac}/><ellipse cx="70" cy="112" rx="16" ry="13" fill={ac}/><ellipse cx="150" cy="112" rx="16" ry="13" fill={ac}/><ellipse cx="110" cy="70" rx="32" ry="34" fill={ac}/><ellipse cx="110" cy="36" rx="34" ry="12" fill={ac}/></g>}
      {hasWings&&!darkDay&&<g style={{animation:"wings-flap 3s ease-in-out infinite"}}><path d="M 62 115 C 20 80, 5 50, 30 30 C 45 20, 60 40, 62 115" fill={ac} fillOpacity="0.15" stroke={ac} strokeWidth="0.8" strokeOpacity="0.5"/><path d="M 158 115 C 200 80, 215 50, 190 30 C 175 20, 160 40, 158 115" fill={ac} fillOpacity="0.15" stroke={ac} strokeWidth="0.8" strokeOpacity="0.5"/></g>}
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
      {/* Helmet from FUE artifact - visible visor over robot head */}
      {hasHelmet&&!darkDay&&!hasCrown&&<g><path d="M 88 72 Q 88 52 110 50 Q 132 52 132 72 L 130 76 Q 110 72 90 76 Z" fill={C.cta} fillOpacity="0.22" stroke={C.cta} strokeWidth="1" strokeOpacity="0.6"/><path d="M 95 73 Q 110 69 125 73" stroke={C.cta} strokeWidth="1.5" fill="none" strokeOpacity="0.8" strokeLinecap="round"/></g>}
      {/* Glasses from SAB artifact */}
      {hasGlasses&&!darkDay&&<g><rect x="96" y="70" width="12" height="8" rx="4" fill="none" stroke={C.green} strokeWidth="1.2" strokeOpacity="0.8"/><rect x="112" y="70" width="12" height="8" rx="4" fill="none" stroke={C.green} strokeWidth="1.2" strokeOpacity="0.8"/><line x1="108" y1="74" x2="112" y2="74" stroke={C.green} strokeWidth="1" strokeOpacity="0.7"/></g>}
      {/* Cape from VOL artifact */}
      {hasCape&&!darkDay&&<g style={{animation:"wings-flap 4s ease-in-out infinite"}}><path d="M 79 120 Q 60 160 65 190 Q 80 175 90 155 Z" fill={C.purple} fillOpacity="0.18" stroke={C.purple} strokeWidth="0.8" strokeOpacity="0.5"/><path d="M 141 120 Q 160 160 155 190 Q 140 175 130 155 Z" fill={C.purple} fillOpacity="0.18" stroke={C.purple} strokeWidth="0.8" strokeOpacity="0.5"/></g>}
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
      {!darkDay&&Array.from({length:stage>=2?8:stage>=1?4:0},(_,i)=>{const angle=(i/(stage>=2?8:4))*Math.PI*2,r=62+(i%3)*14;return<circle key={i} cx={110+Math.cos(angle)*r} cy={118+Math.sin(angle)*r*0.5} r={1.7+(i%2)*1.1} fill={ac} opacity={0.35+(i%3)*0.12} style={{animation:`float-p ${2.4+i*0.38}s ${i*0.28}s ease-in-out infinite alternate`}}/>;}) }
    </svg>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────
function XPBar({xp,xpNext,label=true}){
  return(
    <div>
      {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,color:C.muted,letterSpacing:2}}>EXPERIENCIA</span><span style={{fontSize:11,color:C.green,fontWeight:800,textShadow:`0 0 8px ${C.green}`}}>{xp}/{xpNext} XP</span></div>}
      <div style={{height:5,background:C.bg,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min((xp/xpNext)*100,100)}%`,background:`linear-gradient(90deg,${C.green}55,${C.green})`,borderRadius:3,transition:"width 1s ease",boxShadow:`0 0 12px ${C.green}`}}/></div>
    </div>
  );
}
function Card({children,style={},glow}){return<div style={{background:C.card,border:`1px solid ${glow?glow+"44":C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:glow?`0 0 24px ${glow}18`:"none",position:"relative",zIndex:1,...style}}>{children}</div>;}
function Pill({label,active,color,onClick}){return<button onClick={onClick} style={{border:`1px solid ${active?color+"70":C.border}`,borderRadius:20,padding:"7px 14px",background:active?color+"18":"transparent",color:active?color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.2s"}}>{label}</button>;}

function XPBurst({xp,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1400);return()=>clearTimeout(t);},[onDone]);
  return<div style={{position:"fixed",top:"40%",left:"50%",zIndex:990,pointerEvents:"none",animation:"xp-burst 1.4s ease forwards"}}><div style={{fontFamily:"'Cinzel',serif",fontSize:34,color:C.green,fontWeight:900,textShadow:`0 0 30px ${C.green}`,whiteSpace:"nowrap"}}>+{xp} XP ⚡</div></div>;
}
function Confetti(){
  const pieces=useMemo(()=>Array.from({length:28},(_,i)=>({id:i,x:Math.random()*100,color:[C.green,C.orange,C.purple,C.cta,"#fff"][i%5],sz:Math.random()*8+4,dur:Math.random()*1.5+1,delay:Math.random()*0.5})),[]);
  return<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:994,overflow:"hidden"}}>{pieces.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:-20,width:p.sz,height:p.sz,background:p.color,borderRadius:p.id%2===0?"50%":"2px",animation:`confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,opacity:0.9}}/>)}</div>;
}
function AttrGain({attrs,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1800);return()=>clearTimeout(t);},[onDone]);
  return<div style={{position:"fixed",top:"52%",left:"50%",transform:"translateX(-50%)",zIndex:989,pointerEvents:"none",display:"flex",gap:8,animation:"fade-up 1.8s ease forwards"}}>{Object.entries(attrs).filter(([k,v])=>v>0&&k!=="key").map(([k,v])=><div key={k} style={{background:C.card+"ee",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,color:k==="FUE"?C.cta:k==="SAB"?C.green:C.purple,fontWeight:700}}>+{v} {k}</div>)}</div>;
}
function LevelUpToast({level,archetype,titleInfo,newStage,onDone}){
  const[conf,setConf]=useState(true);
  useEffect(()=>{const t=setTimeout(onDone,4000);return()=>clearTimeout(t);},[onDone]);
  useEffect(()=>{const t=setTimeout(()=>setConf(false),2400);return()=>clearTimeout(t);},[]);
  return(
    <>{conf&&<Confetti/>}
    <div onClick={onDone} style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)",cursor:"pointer"}}>
      <div style={{textAlign:"center",animation:"pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)",maxWidth:340,padding:20}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:10,color:C.orange,letterSpacing:6,marginBottom:6,fontFamily:"'Cinzel',serif"}}>¡NIVEL ALCANZADO!</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:88,color:C.text,lineHeight:1,textShadow:`0 0 60px ${C.orange},0 0 120px ${C.orange}55`}}>{level}</div>
        <div style={{fontSize:17,color:C.green,marginTop:8,fontFamily:"'Cinzel',serif",letterSpacing:2}}>{titleInfo.title}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4,letterSpacing:3}}>{titleInfo.rank}</div>
        {newStage&&<div style={{marginTop:14,padding:"12px 18px",background:newStage.color+"18",border:`1px solid ${newStage.color}44`,borderRadius:14}}><div style={{fontSize:22,marginBottom:4}}>{newStage.planet}</div><div style={{fontSize:13,color:newStage.color,fontFamily:"'Cinzel',serif"}}>¡Nuevo planeta desbloqueado!</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{newStage.label}</div></div>}
        <div style={{display:"flex",justifyContent:"center",marginTop:14}}><HeroAvatar archetype={archetype} level={level} size={88} animate={false}/></div>
        <button onClick={onDone} style={{marginTop:12,background:C.green,border:"none",borderRadius:12,padding:"10px 28px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer"}}>¡Continuar! →</button>
      </div>
    </div></>
  );
}
function StreakReward({reward,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[onDone]);
  return<div onClick={onDone} style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(8px)",cursor:"pointer"}}><div style={{textAlign:"center",animation:"pop-in 0.5s ease",maxWidth:300,padding:24}}><div style={{fontSize:56,marginBottom:12}}>{reward.icon}</div><div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:C.orange,letterSpacing:4,marginBottom:8}}>¡RACHA {reward.day} DÍAS!</div><div style={{fontSize:28,color:C.text,fontFamily:"'Cinzel',serif",marginBottom:16}}>{reward.reward}</div><button onClick={onDone} style={{background:C.orange,border:"none",borderRadius:12,padding:"10px 28px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,cursor:"pointer"}}>¡Genial!</button></div></div>;
}
function AchievementToast({achievement,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[onDone]);
  return<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:997,animation:"slide-up-toast 3s ease forwards",maxWidth:310,width:"90%"}}><div style={{background:C.card,border:`1px solid ${C.orange}55`,borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 0 30px ${C.orange}33`}}><div style={{fontSize:28,filter:`drop-shadow(0 0 8px ${C.orange})`}}>{achievement.icon}</div><div><div style={{fontSize:9,color:C.orange,letterSpacing:3,marginBottom:2}}>¡LOGRO DESBLOQUEADO!</div><div style={{fontSize:14,color:C.text,fontWeight:600}}>{achievement.title}</div><div style={{fontSize:11,color:C.muted}}>{achievement.desc}</div></div></div></div>;
}
function WaterTank({water,setWater,addXP,waterXPGiven,setWaterXPGiven,onWaterComplete}){
  const[pouring,setPouring]=useState(false);
  const[floatMsg,setFloatMsg]=useState(null);
  const isFull=water>=8,pct=water/8;
  function addWater(){
    if(isFull)return;
    const nw=water+1;setWater(nw);setPouring(true);setTimeout(()=>setPouring(false),700);
    if(!waterXPGiven){
      addXP(10,null,false);setFloatMsg({text:"+10 XP 💧",key:Date.now()});setTimeout(()=>setFloatMsg(null),1200);
      if(nw>=8){setWaterXPGiven(true);setTimeout(()=>{addXP(50,null,false);setFloatMsg({text:"¡+50 XP BONUS! 💎",key:Date.now()+1});setTimeout(()=>setFloatMsg(null),1500);onWaterComplete();},450);}
    }else{setFloatMsg({text:"💧",key:Date.now()});setTimeout(()=>setFloatMsg(null),600);}
  }
  return(
    <div style={{background:C.card,border:`2px solid ${isFull?C.green+"66":C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:isFull?`0 0 28px ${C.green}25`:"none",transition:"all 0.5s",position:"relative",overflow:"hidden"}}>
      {floatMsg&&<div key={floatMsg.key} style={{position:"absolute",top:"38%",left:"50%",transform:"translateX(-50%)",zIndex:10,fontFamily:"'Cinzel',serif",fontSize:16,color:C.green,fontWeight:900,animation:"float-xp 1.2s ease forwards",pointerEvents:"none",whiteSpace:"nowrap"}}>{floatMsg.text}</div>}
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <div style={{position:"relative",flexShrink:0}}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{transform:"rotate(-90deg)"}}>
            <circle cx="44" cy="44" r="36" fill="none" stroke={C.border} strokeWidth="5"/>
            <circle cx="44" cy="44" r="36" fill="none" stroke={C.green} strokeWidth="5" strokeDasharray={`${2*Math.PI*36}`} strokeDashoffset={`${2*Math.PI*36*(1-pct)}`} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s ease",filter:isFull?`drop-shadow(0 0 8px ${C.green})`:undefined}}/>
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
          <div style={{fontFamily:"'Cinzel',serif",fontSize:22,color:isFull?C.green:C.text,marginBottom:4}}>{water}/8</div>
          <div style={{fontSize:12,color:isFull?C.green:C.muted,lineHeight:1.5,marginBottom:10,fontStyle:"italic"}}>{WATER_MSGS[Math.min(water,8)]}</div>
          {isFull&&<div style={{fontSize:10,color:C.muted,marginBottom:8}}>🔒 XP de agua completados hoy</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={addWater} disabled={isFull} style={{flex:2,background:isFull?C.border:C.green,border:"none",borderRadius:10,padding:"10px",color:"#000",fontWeight:800,fontSize:13,cursor:isFull?"default":"pointer",fontFamily:"inherit",boxShadow:isFull?"none":`0 0 16px ${C.green}44`,transition:"all 0.3s",opacity:isFull?0.6:1}}>💧 +Vaso{isFull?" ✓":""}</button>
            <button onClick={()=>setWater(w=>Math.max(0,w-1))} style={{flex:1,background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>− Quitar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ArsenalScreen({level,equipped,setEquipped,addXP,attrs}){
  const [animating,setAnimating]=useState(null);
  const ac={FUE:C.cta,SAB:C.green,VOL:C.purple};
  const ai={FUE:"💪",SAB:"📖",VOL:"⚡"};
  const labels={FUE:"⚔ Fuerza",SAB:"📖 Sabiduría",VOL:"⚡ Voluntad"};
  const bonus={FUE:getArtifactBonus(equipped,"FUE"),SAB:getArtifactBonus(equipped,"SAB"),VOL:getArtifactBonus(equipped,"VOL")};
  function toggleEquip(id){
    const art=ARTIFACTS.find(a=>a.id===id);if(!art||level<art.minLevel)return;
    if(equipped.includes(id)){setEquipped(prev=>prev.filter(x=>x!==id));}
    else{setAnimating(id);setTimeout(()=>setAnimating(null),900);addXP(art.bonus,null,true);setEquipped(prev=>[...prev,id]);}
  }
  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 14px 60px"}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:20}}>
        <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:12}}>BONIFICACIONES ACTIVAS</div>
        <div style={{display:"flex",gap:10}}>
          {["FUE","SAB","VOL"].map(k=>(
            <div key={k} style={{flex:1,background:C.bg,border:`2px solid ${bonus[k]>0?ac[k]+"55":C.border}`,borderRadius:14,padding:"12px 8px",textAlign:"center",boxShadow:bonus[k]>0?`0 0 16px ${ac[k]}22`:"none",transition:"all 0.4s"}}>
              <div style={{fontSize:20,marginBottom:4}}>{ai[k]}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:ac[k]}}>{attrs[k]}{bonus[k]>0&&<span style={{fontSize:12,color:C.green}}>+{bonus[k]}</span>}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:3}}>{k}</div>
            </div>
          ))}
        </div>
      </div>
      {["FUE","SAB","VOL"].map(attr=>(
        <div key={attr} style={{marginBottom:24}}>
          <div style={{fontSize:10,color:ac[attr],letterSpacing:3,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${ac[attr]}22`}}>{labels[attr]} ({ARTIFACTS.filter(a=>a.attr===attr&&level>=a.minLevel).length}/{ARTIFACTS.filter(a=>a.attr===attr).length} desbloqueados)</div>
          {ARTIFACTS.filter(a=>a.attr===attr).map(art=>{
            const unlocked=level>=art.minLevel,isEq=equipped.includes(art.id),isAnim=animating===art.id;
            return(
              <div key={art.id} style={{background:isEq?art.color+"12":unlocked?C.card:"#0d1220",border:`2px solid ${isEq?art.color:unlocked?C.border:"#1a2035"}`,borderRadius:16,padding:"14px",display:"flex",alignItems:"center",gap:14,boxShadow:isEq?`0 0 24px ${art.color}20`:"none",transition:"all 0.35s",animation:isAnim?"equip-flash 0.9s ease":"none",opacity:unlocked?1:0.4,marginBottom:10}}>
                <div style={{width:52,height:52,borderRadius:13,background:isEq?art.color+"25":unlocked?C.bg:"transparent",border:`2px solid ${isEq?art.color:unlocked?C.border:"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,filter:isEq?`drop-shadow(0 0 10px ${art.color})`:"none",transition:"all 0.35s"}}>{art.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,color:isEq?art.color:unlocked?C.text:C.muted,fontWeight:700}}>{art.name}</span>
                    {isEq&&<span style={{fontSize:9,color:"#000",background:art.color,borderRadius:5,padding:"2px 7px",fontWeight:800}}>EQUIPADO</span>}
                    {!unlocked&&<span style={{fontSize:9,color:C.muted}}>🔒 Nv.{art.minLevel}</span>}
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:6,fontStyle:"italic"}}>{art.desc}</div>
                  <div style={{background:art.color+"18",borderRadius:7,padding:"3px 9px",display:"inline-flex",alignItems:"center",gap:5}}><span style={{fontSize:13,color:art.color,fontWeight:800}}>+{art.bonus}</span><span style={{fontSize:10,color:art.color}}>{attr}</span></div>
                </div>
                {unlocked&&<button onClick={()=>toggleEquip(art.id)} style={{flexShrink:0,background:isEq?"transparent":art.color,border:`2px solid ${art.color}`,borderRadius:11,padding:"9px 14px",color:isEq?art.color:"#000",fontSize:12,cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:700,transition:"all 0.3s",boxShadow:isEq?"none":`0 0 12px ${art.color}44`}}>{isEq?"Quitar":"Equipar"}</button>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
function AchievementsScreen({stats,unlockedAchievements}){
  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 14px 60px"}}>
      <p style={{fontSize:13,color:C.muted,marginBottom:16}}>{unlockedAchievements.length}/{ACHIEVEMENTS.length} desbloqueados</p>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:C.muted}}>Colección</span><span style={{fontSize:12,color:C.orange,fontWeight:700}}>{Math.round((unlockedAchievements.length/ACHIEVEMENTS.length)*100)}%</span></div>
        <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(unlockedAchievements.length/ACHIEVEMENTS.length)*100}%`,background:`linear-gradient(90deg,${C.orange}55,${C.orange})`,borderRadius:3,boxShadow:`0 0 10px ${C.orange}`}}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:10}}>
        {ACHIEVEMENTS.map(a=>{
          const unlocked=unlockedAchievements.includes(a.id);
          return<div key={a.id} style={{background:C.card,border:`1px solid ${unlocked?C.orange+"44":C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center",boxShadow:unlocked?`0 0 16px ${C.orange}18`:"none",opacity:unlocked?1:0.5,transition:"all 0.3s"}}><div style={{fontSize:28,marginBottom:8,filter:unlocked?`drop-shadow(0 0 8px ${C.orange})`:"grayscale(1)"}}>{a.icon}</div><div style={{fontSize:12,color:unlocked?C.text:C.muted,fontWeight:600,marginBottom:4}}>{a.title}</div><div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{a.desc}</div>{unlocked&&<div style={{marginTop:8,fontSize:9,color:C.orange,letterSpacing:2,fontWeight:700}}>✓ LOGRADO</div>}</div>;
        })}
      </div>
    </div>
  );
}
function MetasScreen({customGoals,setCustomGoals,addXP,badHabits,setBadHabits}){
  const [tab,setTab]=useState("metas"); // "metas" | "soltar"
  const [showGoalForm,setShowGoalForm]=useState(false);
  const [showHabitForm,setShowHabitForm]=useState(false);
  const [goalForm,setGoalForm]=useState({title:"",desc:"",emoji:"🎯",target:"",unit:"",weeks:"8"});
  const [habitForm,setHabitForm]=useState({name:"",trigger:"",reward:"",replacement:"",timesPerWeek:7,targetTimes:0,emoji:"🔗"});
  const [expandedGoal,setExpandedGoal]=useState(null);
  const [expandedHabit,setExpandedHabit]=useState(null);

  // ── Goal templates — now with RICH multi-week plans ──────────────
  const GOAL_TEMPLATES=[
    {emoji:"⚖️",title:"Bajar 5 kg",desc:"Pérdida de peso saludable y sostenible",target:"5",unit:"kg",weeks:"12",science:"Pérdida gradual de 0.5kg/semana es más sostenible y preserva músculo.",
     plan:[
       {week:"Semana 1-2",phase:"Fundación",missions:[{text:"Pésate cada lunes en ayunas",xp:10},{text:"Camina 30 min (4 veces esta semana)",xp:40},{text:"Elimina refrescos y jugos 7 días",xp:35},{text:"Verduras en al menos 2 comidas al día",xp:25},{text:"Duerme 7-8h (el sueño regula el hambre)",xp:20}]},
       {week:"Semana 3-6",phase:"Progreso",missions:[{text:"Entrena fuerza 2 veces esta semana",xp:45},{text:"Proteína en cada comida (>20g)",xp:30},{text:"Sin comida procesada 5 días",xp:40},{text:"Registra lo que comes 3 días",xp:20},{text:"Camina 10 min después de comer",xp:20}]},
       {week:"Semana 7-12",phase:"Consolidación",missions:[{text:"Mantén tu peso esta semana (±0.3kg)",xp:50},{text:"Entrena fuerza 3 veces",xp:50},{text:"Prepara tus comidas del día la noche anterior",xp:35},{text:"Sin azúcar añadida toda la semana",xp:45},{text:"Mide tu progreso: fotos + peso + energía",xp:20}]},
     ]},
    {emoji:"🏃",title:"Correr 5 km sin parar",desc:"Resistencia cardiovascular desde cero",target:"5",unit:"km",weeks:"10",science:"El método C25K muestra que 8-10 semanas de entrenamiento progresivo permite a sedentarios correr 5km.",
     plan:[
       {week:"Semana 1-3",phase:"Base aeróbica",missions:[{text:"Corre 1 min, camina 2 min · 8 repeticiones",xp:30},{text:"Corre 3 días esta semana",xp:35},{text:"Duerme 8h para recuperación muscular",xp:20},{text:"Estira 10 min después de correr",xp:15},{text:"Hidrátate: 2L de agua hoy",xp:10}]},
       {week:"Semana 4-7",phase:"Resistencia",missions:[{text:"Corre 2 km sin parar hoy",xp:40},{text:"Corre 3 veces esta semana",xp:40},{text:"Añade 500m a tu distancia habitual",xp:35},{text:"Prueba correr 20 min continuos",xp:45},{text:"Recuperación activa: camina 15 min",xp:15}]},
       {week:"Semana 8-10",phase:"Meta final",missions:[{text:"Corre 4 km sin parar",xp:55},{text:"Carrera larga semanal: tu distancia máxima",xp:50},{text:"¡Corre los 5 km completos!",xp:100},{text:"Celebra y registra tu tiempo",xp:20},{text:"Planifica tu próximo reto",xp:15}]},
     ]},
    {emoji:"💪",title:"Ganar músculo",desc:"Fuerza y masa muscular progresiva",target:"3",unit:"kg músculo",weeks:"16",science:"La hipertrofia muscular requiere estímulo progresivo, superávit calórico moderado y sueño adecuado.",
     plan:[
       {week:"Semana 1-4",phase:"Adaptación neural",missions:[{text:"Entrena fuerza: pecho + tríceps",xp:45},{text:"Entrena fuerza: espalda + bíceps",xp:45},{text:"Entrena fuerza: piernas + hombros",xp:45},{text:"Proteína en cada comida (>1.6g/kg peso)",xp:30},{text:"Duerme 8h — 80% del músculo crece en sueño",xp:25}]},
       {week:"Semana 5-12",phase:"Hipertrofia",missions:[{text:"Sube peso en al menos 1 ejercicio esta semana",xp:50},{text:"Completa todas las series de tu entrenamiento",xp:40},{text:"Come superávit calórico moderado (+200-300 kcal)",xp:20},{text:"Suplemento: creatina 5g/día si aplica",xp:10},{text:"Foto de progreso mensual",xp:15}]},
       {week:"Semana 13-16",phase:"Fuerza máxima",missions:[{text:"Alcanza tu récord personal en sentadilla",xp:60},{text:"Alcanza tu récord personal en press banca",xp:60},{text:"Evalúa ganancia de masa (medidas + peso)",xp:25},{text:"Diseña tu plan para las próximas 16 semanas",xp:20}]},
     ]},
    {emoji:"😴",title:"Mejorar el sueño",desc:"Rutina de sueño profundo y reparador",target:"8",unit:"h/noche",weeks:"6",science:"La higiene del sueño mejora el 60% de los casos de insomnio leve sin medicación en 4-6 semanas.",
     plan:[
       {week:"Semana 1-2",phase:"Diagnóstico",missions:[{text:"Anota tu hora de dormir y despertar 7 días",xp:20},{text:"Sin pantallas 1h antes de dormir",xp:30},{text:"Cuarto completamente oscuro",xp:20},{text:"Temperatura de habitación: 18-20°C",xp:15},{text:"Sin cafeína después de las 2pm",xp:25}]},
       {week:"Semana 3-4",phase:"Rutina",missions:[{text:"Duerme y despierta a la misma hora 5 días",xp:40},{text:"Rutina de relajación de 15 min antes de dormir",xp:25},{text:"Sin alcohol esta semana",xp:30},{text:"Ejercicio matutino (mejora el sueño nocturno)",xp:25},{text:"Registra calidad del sueño del 1-10",xp:10}]},
       {week:"Semana 5-6",phase:"Optimización",missions:[{text:"7 días consecutivos con 7+ horas de sueño",xp:60},{text:"Sin alarma — despierta naturalmente",xp:35},{text:"Evalúa: energía, humor y foco vs semana 1",xp:20},{text:"Comparte tu rutina de sueño con alguien",xp:10}]},
     ]},
    {emoji:"📚",title:"Leer 12 libros",desc:"Un libro por mes durante un año",target:"12",unit:"libros",weeks:"52",science:"15 páginas diarias = 18 libros al año. La lectura regular reduce el estrés un 68% (Universidad de Sussex).",
     plan:[
       {week:"Mes 1-3",phase:"Hábito base",missions:[{text:"Lee 20 páginas hoy (sin excusas)",xp:20},{text:"Leer antes de dormir en vez de pantalla",xp:25},{text:"Termina el capítulo actual antes de cerrar",xp:15},{text:"Anota 3 ideas del libro que termines",xp:20},{text:"Comparte una cita que te impactó",xp:10}]},
       {week:"Mes 4-8",phase:"Variedad",missions:[{text:"Lee un género que no hayas probado",xp:30},{text:"Termina tu libro actual esta semana",xp:40},{text:"Lleva el libro contigo todo el día",xp:10},{text:"Lee 30 min en un lugar diferente",xp:15},{text:"Recomienda un libro a alguien",xp:15}]},
       {week:"Mes 9-12",phase:"Meta cumplida",missions:[{text:"Libro 10 — ¡estás a 2 de tu meta!",xp:50},{text:"Escribe tu reseña del mejor libro del año",xp:30},{text:"¡Libro 12! Celebra y comparte tu lista",xp:80},{text:"Define los 12 libros del próximo año",xp:20}]},
     ]},
    {emoji:"🧘",title:"Meditar 30 días seguidos",desc:"Hábito de meditación diaria",target:"30",unit:"días",weeks:"5",science:"8 semanas de meditación reducen el volumen de la amígdala (centro del estrés) en promedio 10-15%.",
     plan:[
       {week:"Semana 1",phase:"Inicio",missions:[{text:"Medita 5 min hoy (solo empieza)",xp:20},{text:"3 días seguidos de meditación",xp:30},{text:"Encuentra tu lugar y hora fija",xp:15},{text:"Prueba una app guiada (Headspace, Calm)",xp:10},{text:"Medita antes de revisar el celular mañana",xp:25}]},
       {week:"Semana 2-3",phase:"Constancia",missions:[{text:"7 días seguidos — ¡1 semana completa!",xp:50},{text:"Sube a 10 min de meditación",xp:30},{text:"Meditación sin guía: solo respira",xp:25},{text:"14 días seguidos — mitad del camino",xp:60},{text:"Nota 3 cambios en tu nivel de estrés",xp:20}]},
       {week:"Semana 4-5",phase:"Meta",missions:[{text:"21 días — el hábito ya está formado",xp:70},{text:"Meditación de 20 min sin distracción",xp:40},{text:"30 días COMPLETOS — ¡Leyenda!",xp:100},{text:"Escribe cómo cambió tu mente en 30 días",xp:25}]},
     ]},
  ];

  // ── Bad habits catalog ─────────────────────────────────────────
  const HABIT_TEMPLATES=[
    {emoji:"📱",name:"Scrollear redes sociales al despertar",trigger:"Alarma del celular · Primeros 5 min del día",reward:"Estimulación inmediata, evitar pensar",replacement:"Leer 2 páginas de un libro o respirar 2 min"},
    {emoji:"🍬",name:"Comer dulces cuando estoy estresado",trigger:"Estrés laboral o emocional intenso",reward:"Dopamina rápida, sensación de calma",replacement:"Caminar 5 min o beber agua con limón"},
    {emoji:"🌙",name:"Dormir tarde sin razón real",trigger:"Inercia nocturna: 'un episodio más'",reward:"Tiempo propio, escapar del día",replacement:"Rutina de cierre: leer o journaling 15 min"},
    {emoji:"🚬",name:"Fumar cuando hay ansiedad",trigger:"Tensión, reuniones difíciles, café",reward:"Reducción temporal de ansiedad",replacement:"Respiración 4-7-8: inhala 4s, sostén 7s, exhala 8s"},
    {emoji:"🍟",name:"Comer comida rápida por comodidad",trigger:"Cansancio al llegar a casa, no planificar",reward:"Comodidad inmediata sin esfuerzo",replacement:"Meal prep dominical: 30 min preparando la semana"},
    {emoji:"💬",name:"Quejarme constantemente",trigger:"Fricción menor, planes que cambian",reward:"Validación social, desahogo momentáneo",replacement:"Reencuadre: '¿qué puedo controlar aquí?'"},
    {emoji:"🛋️",name:"Procrastinar el ejercicio",trigger:"Cansancio percibido, 'mañana lo hago'",reward:"Alivio inmediato de la incomodidad",replacement:"Regla de los 2 minutos: ponte la ropa de ejercicio"},
    {emoji:"🥂",name:"Beber alcohol para relajarme",trigger:"Fin de jornada, tensión acumulada",reward:"Relajación, separación del trabajo",replacement:"Ducha caliente + té + 10 min de stretching"},
  ];

  function createGoal(){
    if(!goalForm.title)return;
    const tmpl=GOAL_TEMPLATES.find(t=>t.title===goalForm.title);
    // Flatten all plan missions into one list
    const allMissions=tmpl
      ? tmpl.plan.flatMap(phase=>phase.missions.map(m=>({...m,done:false,phase:phase.phase,week:phase.week})))
      : [{text:"Define tu primer paso concreto",xp:20,done:false},{text:"Toma la primera acción hoy",xp:40,done:false},{text:"Comparte tu meta con alguien",xp:20,done:false},{text:"Registra tu punto de partida",xp:20,done:false}];
    const xpTotal=allMissions.reduce((s,m)=>s+m.xp,0);
    const g={id:Date.now(),title:goalForm.title,desc:goalForm.desc||tmpl?.desc||"",emoji:goalForm.emoji,target:goalForm.target,unit:goalForm.unit,weeks:goalForm.weeks,science:tmpl?.science||"",plan:tmpl?.plan||null,xpTotal,xpEarned:0,missions:allMissions,createdAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long"})};
    setCustomGoals(prev=>[...prev,g]);setShowGoalForm(false);setGoalForm({title:"",desc:"",emoji:"🎯",target:"",unit:"",weeks:"8"});addXP(30);
  }

  function completeGoalMission(gid,mi){
    const g=customGoals.find(g=>g.id===gid);if(!g||g.missions[mi].done)return;
    const xp=g.missions[mi].xp;
    setCustomGoals(prev=>prev.map(g=>g.id!==gid?g:{...g,missions:g.missions.map((m,i)=>i===mi?{...m,done:true}:m),xpEarned:(g.xpEarned||0)+xp}));addXP(xp);
  }

  function createHabit(){
    if(!habitForm.name)return;
    const h={id:Date.now(),name:habitForm.name,trigger:habitForm.trigger,reward:habitForm.reward,replacement:habitForm.replacement,emoji:habitForm.emoji,timesPerWeek:parseInt(habitForm.timesPerWeek),targetTimes:parseInt(habitForm.targetTimes),currentWeekCount:0,daysClean:0,streak:0,totalXP:0,weekHistory:[],createdAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long"})};
    setBadHabits(prev=>[...prev,h]);setShowHabitForm(false);setHabitForm({name:"",trigger:"",reward:"",replacement:"",timesPerWeek:7,targetTimes:0,emoji:"🔗"});addXP(25);
  }

  function logHabitAvoid(hid){
    // User successfully avoided the habit today → +XP + streak
    setBadHabits(prev=>prev.map(h=>{
      if(h.id!==hid)return h;
      const xpGain=50+h.streak*5; // more XP the longer the streak
      addXP(xpGain);
      return{...h,daysClean:h.daysClean+1,streak:h.streak+1,totalXP:h.totalXP+xpGain};
    }));
  }

  function logHabitFell(hid){
    // User fell into the habit — reset streak but keep progress
    setBadHabits(prev=>prev.map(h=>{
      if(h.id!==hid)return h;
      const xpGain=15; // small XP for honesty
      addXP(xpGain);
      return{...h,streak:0,currentWeekCount:h.currentWeekCount+1,totalXP:h.totalXP+xpGain};
    }));
  }

  // Ian messages for bad habits
  const IAN_HABIT_MSGS={
    avoided:(name,streak)=>[
      `¡${streak} días sin "${name}"! Cada vez que dices no, reprogramas tu cerebro. Eso es poder real.`,
      `Lo evitaste hoy. Mis sensores muestran: tu corteza prefrontal está ganando. Sigue así.`,
      `${streak} días de racha. No fue fácil. Eso es exactamente lo que lo hace valioso.`,
    ][streak%3],
    fell:(name)=>`Caíste en "${name}" hoy. Eso está bien. El streak se reinicia, pero el aprendizaje no. ¿Qué lo disparó?`,
    milestone:(days)=>`¡${days} días! Esto ya no es fuerza de voluntad. Es identidad. Eres alguien que no hace eso.`,
  };

  const totalBadXP=badHabits.reduce((s,h)=>s+h.totalXP,0);

  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 0 80px"}}>
      {/* ── Tab switcher ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",background:C.card,borderBottom:`1px solid ${C.border}`,position:"sticky",top:52,zIndex:20}}>
        {[["metas","🎯 Mis Metas",C.green],["soltar","🔗 Hábitos a Soltar",C.orange]].map(([v,label,color])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:"14px 8px",border:"none",background:"transparent",color:tab===v?color:C.muted,fontSize:13,fontWeight:tab===v?700:400,cursor:"pointer",fontFamily:"inherit",borderBottom:`2.5px solid ${tab===v?color:"transparent"}`,transition:"all 0.2s"}}>
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          TAB 1 — MIS METAS POSITIVAS
      ════════════════════════════════════════ */}
      {tab==="metas"&&(
        <div style={{padding:"16px 14px"}}>
          <p style={{fontSize:12,color:C.muted,marginBottom:16,lineHeight:1.6}}>Conquistas épicas con planes detallados semana por semana. Cada misión te acerca a quien quieres ser.</p>

          <button onClick={()=>setShowGoalForm(true)} style={{width:"100%",background:C.green+"12",border:`1.5px dashed ${C.green}44`,borderRadius:14,padding:"14px",color:C.green,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            ＋ Nueva meta épica
          </button>

          {/* Active goals */}
          {customGoals.map(g=>{
            const doneMis=g.missions.filter(m=>m.done).length;
            const pct=Math.min(Math.round((g.xpEarned/g.xpTotal)*100),100);
            const allDone=doneMis===g.missions.length;
            const isOpen=expandedGoal===g.id;
            // Group missions by phase if plan exists
            const phases=g.plan?g.plan.map(ph=>({...ph,missions:g.missions.filter(m=>m.phase===ph.phase)})):null;
            return(
              <div key={g.id} style={{background:C.card,border:`1px solid ${allDone?C.green+"55":C.border}`,borderRadius:18,padding:"0",marginBottom:16,overflow:"hidden",boxShadow:allDone?`0 0 20px ${C.green}12`:"none",transition:"all 0.4s"}}>
                {/* Header — always visible */}
                <div style={{padding:"16px 16px 12px",cursor:"pointer"}} onClick={()=>setExpandedGoal(isOpen?null:g.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontSize:28}}>{g.emoji}</div>
                      <div>
                        <div style={{fontSize:15,color:C.text,fontWeight:700}}>{g.title}</div>
                        {g.desc&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{g.desc}</div>}
                        <div style={{fontSize:10,color:C.muted,marginTop:2}}>{doneMis}/{g.missions.length} misiones · {g.weeks} sem · {g.createdAt}</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:allDone?C.green:C.text,fontWeight:900,textShadow:allDone?`0 0 10px ${C.green}`:""}}>{pct}%</div>
                      <div style={{fontSize:9,color:C.muted}}>{g.xpEarned}/{g.xpTotal} XP</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden",border:`1px solid ${C.border}`}}>
                    <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.green}66,${C.green})`,borderRadius:3,transition:"width 0.6s",boxShadow:`0 0 8px ${C.green}`}}/>
                  </div>
                  {/* Expand hint */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                    <span style={{fontSize:10,color:C.muted}}>{isOpen?"Toca para cerrar":"Toca para ver el plan completo"}</span>
                    <span style={{fontSize:14,color:C.muted,transition:"transform 0.3s",display:"inline-block",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>⌄</span>
                  </div>
                </div>

                {/* Expanded: phases + science */}
                {isOpen&&(
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"0 16px 16px"}}>
                    {/* Science basis */}
                    {g.science&&(
                      <div style={{background:C.green+"0c",border:`1px solid ${C.green}22`,borderRadius:10,padding:"10px 12px",margin:"12px 0",display:"flex",gap:8}}>
                        <span style={{fontSize:14,flexShrink:0}}>🧬</span>
                        <p style={{fontSize:11,color:C.muted,lineHeight:1.65,margin:0}}>{g.science}</p>
                      </div>
                    )}
                    {/* Missions by phase or flat */}
                    {phases?(
                      phases.map((ph,pi)=>{
                        const phaseDone=ph.missions.filter(m=>m.done).length;
                        const phaseTotal=ph.missions.length;
                        const phaseComplete=phaseDone===phaseTotal;
                        return(
                          <div key={pi} style={{marginBottom:16}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:12}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:phaseComplete?C.green:C.border,boxShadow:phaseComplete?`0 0 6px ${C.green}`:"none"}}/>
                              <span style={{fontSize:10,color:phaseComplete?C.green:C.muted,letterSpacing:2,fontWeight:700}}>{ph.week?.toUpperCase()} · {ph.phase?.toUpperCase()}</span>
                              <span style={{fontSize:9,color:C.muted,marginLeft:"auto"}}>{phaseDone}/{phaseTotal}</span>
                            </div>
                            {ph.missions.map((m,mi)=>{
                              const globalIdx=g.missions.findIndex(gm=>gm.text===m.text&&gm.phase===m.phase);
                              return(
                                <div key={mi} onClick={()=>completeGoalMission(g.id,globalIdx)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:mi<ph.missions.length-1?`1px solid ${C.bg}`:"none",cursor:m.done?"default":"pointer",opacity:m.done?0.4:1,transition:"all 0.3s"}}>
                                  <div style={{width:22,height:22,border:`2px solid ${m.done?C.green:C.border}`,borderRadius:7,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.3s",boxShadow:m.done?`0 0 7px ${C.green}`:""}}>{m.done?"✓":""}</div>
                                  <span style={{fontSize:12,color:m.done?"#64748B":C.text,flex:1,fontWeight:m.done?400:500}}>{m.text}</span>
                                  <span style={{fontSize:10,color:C.green,fontWeight:700,flexShrink:0}}>+{m.xp}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })
                    ):(
                      g.missions.map((m,i)=>(
                        <div key={i} onClick={()=>completeGoalMission(g.id,i)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<g.missions.length-1?`1px solid ${C.bg}`:"none",cursor:m.done?"default":"pointer",opacity:m.done?0.4:1,transition:"all 0.3s"}}>
                          <div style={{width:22,height:22,border:`2px solid ${m.done?C.green:C.border}`,borderRadius:7,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.3s"}}>{m.done?"✓":""}</div>
                          <span style={{fontSize:12,color:m.done?"#64748B":C.text,flex:1}}>{m.text}</span>
                          <span style={{fontSize:10,color:C.green,fontWeight:700}}>+{m.xp}</span>
                        </div>
                      ))
                    )}
                    {/* Actions */}
                    <div style={{display:"flex",gap:8,marginTop:14}}>
                      {allDone&&<button onClick={()=>setCustomGoals(prev=>prev.map(x=>x.id!==g.id?x:{...x,missions:x.missions.map(m=>({...m,done:false})),xpEarned:0}))} style={{flex:1,background:C.green+"14",border:`1px solid ${C.green}33`,borderRadius:10,padding:"9px",color:C.green,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>↺ Repetir meta</button>}
                      <button onClick={()=>setCustomGoals(prev=>prev.filter(x=>x.id!==g.id))} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 14px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Eliminar</button>
                    </div>
                    {allDone&&(
                      <div style={{textAlign:"center",padding:"14px 0 4px",marginTop:8,borderTop:`1px solid ${C.border}`}}>
                        <div style={{fontSize:26,marginBottom:4}}>🏆</div>
                        <div style={{fontSize:14,color:C.green,fontFamily:"'Cinzel',serif",letterSpacing:2,textShadow:`0 0 10px ${C.green}`}}>¡META CONQUISTADA!</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Template grid when empty */}
          {customGoals.length===0&&(
            <div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:3,marginBottom:12}}>PLANES ÉPICOS DISPONIBLES</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {GOAL_TEMPLATES.map((t,i)=>(
                  <div key={i} onClick={()=>{setGoalForm({title:t.title,desc:t.desc,emoji:t.emoji,target:t.target,unit:t.unit,weeks:t.weeks});setShowGoalForm(true);}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px",cursor:"pointer",transition:"all 0.2s"}}>
                    <div style={{fontSize:26,marginBottom:6}}>{t.emoji}</div>
                    <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:3}}>{t.title}</div>
                    <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{t.weeks} semanas</div>
                    <div style={{fontSize:9,color:C.green}}>{t.plan.reduce((s,ph)=>s+ph.missions.length,0)} misiones · {t.plan.length} fases</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB 2 — HÁBITOS A SOLTAR
      ════════════════════════════════════════ */}
      {tab==="soltar"&&(
        <div style={{padding:"16px 14px"}}>
          {/* Ian message for this section */}
          <div style={{background:`linear-gradient(135deg,${C.orange}12,${C.orange}06)`,border:`1px solid ${C.orange}33`,borderRadius:14,padding:"14px 16px",marginBottom:18,display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:22,flexShrink:0}}>🤖</span>
            <div>
              <div style={{fontSize:9,color:C.orange,letterSpacing:2,marginBottom:4,fontWeight:700}}>IAN DICE</div>
              <p style={{fontSize:13,color:C.text,lineHeight:1.65,margin:0}}>
                {badHabits.length===0
                  ? `Identificar lo que te frena es tan poderoso como construir lo nuevo. Añade tu primer hábito a soltar. Yo te acompaño.`
                  : badHabits[0]?.streak>0
                    ? `Llevas ${badHabits[0].streak} días seguidos resistiendo. Cada vez que dices no, ese camino neuronal se debilita. Sigue.`
                    : `El hábito de reemplazo es la clave. No es fuerza de voluntad. Es darle al cerebro lo mismo que busca, de forma diferente.`
                }
              </p>
              {totalBadXP>0&&<div style={{fontSize:10,color:C.orange,marginTop:6}}>+{totalBadXP} XP ganados resistiendo</div>}
            </div>
          </div>

          {/* Science note */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:6}}>🧬 BASE CIENTÍFICA</div>
            <p style={{fontSize:11,color:C.muted,lineHeight:1.7,margin:0}}>El <strong style={{color:C.text}}>Habit Loop</strong> (Duhigg, Clear): todo hábito tiene un <em>disparador → rutina → recompensa</em>. Para romperlo, mantén el mismo disparador y recompensa, pero cambia la rutina. El cerebro no puede eliminar hábitos, solo reemplazarlos.</p>
          </div>

          <button onClick={()=>setShowHabitForm(true)} style={{width:"100%",background:C.orange+"12",border:`1.5px dashed ${C.orange}44`,borderRadius:14,padding:"14px",color:C.orange,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            ＋ Añadir hábito a soltar
          </button>

          {/* Bad habit cards */}
          {badHabits.map(h=>{
            const weeklyProgress=h.targetTimes===0
              ? Math.max(0,h.timesPerWeek-h.currentWeekCount)
              : h.currentWeekCount;
            const successPct=h.targetTimes===0
              ? Math.min(100,Math.round((h.daysClean/(h.daysClean+h.currentWeekCount||1))*100))
              : Math.min(100,Math.round(((h.timesPerWeek-h.currentWeekCount)/h.timesPerWeek)*100));
            const isOpen=expandedHabit===h.id;
            return(
              <div key={h.id} style={{background:C.card,border:`1px solid ${h.streak>=3?C.orange+"44":C.border}`,borderRadius:18,marginBottom:14,overflow:"hidden",boxShadow:h.streak>=3?`0 0 16px ${C.orange}14`:"none",transition:"all 0.4s"}}>
                {/* Card header */}
                <div style={{padding:"16px 16px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontSize:26}}>{h.emoji}</div>
                      <div>
                        <div style={{fontSize:14,color:C.text,fontWeight:700}}>{h.name}</div>
                        <div style={{fontSize:10,color:C.muted,marginTop:2}}>Desde {h.createdAt}</div>
                      </div>
                    </div>
                    {/* Streak badge */}
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:C.orange,fontWeight:900}}>{h.streak}🔥</div>
                      <div style={{fontSize:9,color:C.muted}}>días seguidos</div>
                    </div>
                  </div>
                  {/* Progress bar — clean days */}
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:10,color:C.muted}}>Resistencia acumulada</span>
                      <span style={{fontSize:10,color:C.orange,fontWeight:700}}>{h.daysClean} días sin caer</span>
                    </div>
                    <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden",border:`1px solid ${C.border}`}}>
                      <div style={{height:"100%",width:`${Math.min((h.daysClean/30)*100,100)}%`,background:`linear-gradient(90deg,${C.orange}66,${C.orange})`,borderRadius:3,transition:"width 0.6s",boxShadow:`0 0 8px ${C.orange}`}}/>
                    </div>
                    <div style={{fontSize:9,color:C.muted,marginTop:2}}>Meta: 30 días limpios</div>
                  </div>
                  {/* Action buttons */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <button onClick={()=>logHabitAvoid(h.id)} style={{background:`linear-gradient(135deg,${C.green},${C.green}cc)`,border:"none",borderRadius:10,padding:"11px",color:"#000",cursor:"pointer",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:12,boxShadow:`0 0 12px ${C.green}44`}}>
                      ✓ Lo resistí hoy +{50+h.streak*5} XP
                    </button>
                    <button onClick={()=>logHabitFell(h.id)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                      Caí hoy (+15 XP honestidad)
                    </button>
                  </div>
                </div>
                {/* Expand button */}
                <div onClick={()=>setExpandedHabit(isOpen?null:h.id)} style={{padding:"8px 16px",borderTop:`1px solid ${C.bg}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:C.muted}}>{isOpen?"Cerrar detalles":"Ver disparador y reemplazo"}</span>
                  <span style={{fontSize:12,color:C.muted,transition:"transform 0.3s",display:"inline-block",transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>⌄</span>
                </div>
                {/* Expanded details */}
                {isOpen&&(
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 16px"}}>
                    {[
                      {label:"⚡ DISPARADOR",value:h.trigger,color:C.orange},
                      {label:"🎯 RECOMPENSA QUE BUSCA",value:h.reward,color:C.purple},
                      {label:"✅ HÁBITO DE REEMPLAZO",value:h.replacement,color:C.green},
                    ].map(({label,value,color})=>value?(
                      <div key={label} style={{marginBottom:12}}>
                        <div style={{fontSize:9,color:color,letterSpacing:2,marginBottom:4,fontWeight:700}}>{label}</div>
                        <div style={{fontSize:13,color:C.text,background:color+"0a",borderRadius:8,padding:"8px 12px",border:`1px solid ${color}22`}}>{value}</div>
                      </div>
                    ):null)}
                    {/* Milestones */}
                    <div style={{marginTop:4}}>
                      <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginBottom:8}}>HITOS</div>
                      <div style={{display:"flex",gap:6}}>
                        {[7,14,30].map(d=>(
                          <div key={d} style={{flex:1,background:h.daysClean>=d?C.orange+"18":C.bg,border:`1px solid ${h.daysClean>=d?C.orange+"55":C.border}`,borderRadius:10,padding:"8px 4px",textAlign:"center",transition:"all 0.3s"}}>
                            <div style={{fontSize:16,marginBottom:2}}>{h.daysClean>=d?"🔥":"🔒"}</div>
                            <div style={{fontSize:9,color:h.daysClean>=d?C.orange:C.muted,fontWeight:h.daysClean>=d?700:400}}>{d} días</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Ian reaction */}
                    {h.streak>0&&(
                      <div style={{marginTop:12,background:C.orange+"08",border:`1px solid ${C.orange}22`,borderRadius:10,padding:"10px 12px"}}>
                        <div style={{fontSize:9,color:C.orange,letterSpacing:2,marginBottom:4}}>🤖 IAN DICE</div>
                        <p style={{fontSize:12,color:C.text,margin:0,lineHeight:1.6,fontStyle:"italic"}}>{IAN_HABIT_MSGS.avoided(h.name,h.streak)}</p>
                      </div>
                    )}
                    <button onClick={()=>setBadHabits(prev=>prev.filter(x=>x.id!==h.id))} style={{marginTop:12,background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 14px",color:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Eliminar hábito</button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state with examples */}
          {badHabits.length===0&&(
            <div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:3,marginBottom:12}}>EJEMPLOS COMUNES — toca para añadir</div>
              {HABIT_TEMPLATES.map((t,i)=>(
                <div key={i} onClick={()=>{setHabitForm({name:t.name,trigger:t.trigger,reward:t.reward,replacement:t.replacement,emoji:t.emoji,timesPerWeek:7,targetTimes:0});setShowHabitForm(true);}} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"13px 14px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{t.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:C.text,fontWeight:600,marginBottom:2}}>{t.name}</div>
                    <div style={{fontSize:10,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>→ {t.replacement}</div>
                  </div>
                  <span style={{fontSize:12,color:C.muted,flexShrink:0}}>+</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Goal Form Modal ── */}
      {showGoalForm&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:970,backdropFilter:"blur(4px)"}}>
          <div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:520,animation:"slide-up 0.35s ease",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.text}}>Nueva Meta Épica</h3>
              <button onClick={()=>setShowGoalForm(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>✕</button>
            </div>
            <div style={{marginBottom:12}}>
              <label style={FS.label}>EMOJI</label>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{["🎯","⚖️","🏃","💪","😴","📚","🧘","🏊","🚴","✈️","💰","🎸","🥗","🧠","🎓","🏆","🌍","💡"].map(e=><button key={e} onClick={()=>setGoalForm(f=>({...f,emoji:e}))} style={{width:34,height:34,fontSize:16,border:`1.5px solid ${goalForm.emoji===e?C.green:C.border}`,borderRadius:8,background:goalForm.emoji===e?C.green+"18":"transparent",cursor:"pointer"}}>{e}</button>)}</div>
            </div>
            <div style={{marginBottom:12}}><label style={FS.label}>¿CUÁL ES TU META?</label><input style={FS.input} placeholder="ej. Correr 5 km sin parar" value={goalForm.title} onChange={e=>setGoalForm(f=>({...f,title:e.target.value}))}/></div>
            <div style={{marginBottom:12}}><label style={FS.label}>DESCRIPCIÓN (opcional)</label><input style={FS.input} placeholder="¿Por qué es importante para ti?" value={goalForm.desc} onChange={e=>setGoalForm(f=>({...f,desc:e.target.value}))}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div><label style={FS.label}>META NUMÉRICA</label><input style={FS.input} placeholder="ej. 5" value={goalForm.target} onChange={e=>setGoalForm(f=>({...f,target:e.target.value}))}/></div>
              <div><label style={FS.label}>UNIDAD</label><input style={FS.input} placeholder="ej. kg, km, días" value={goalForm.unit} onChange={e=>setGoalForm(f=>({...f,unit:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:20}}><label style={FS.label}>DURACIÓN: <span style={{color:C.green,fontWeight:700}}>{goalForm.weeks} semanas</span></label><input type="range" min="2" max="52" value={goalForm.weeks} onChange={e=>setGoalForm(f=>({...f,weeks:e.target.value}))} style={{width:"100%",accentColor:C.green}}/></div>
            {/* Template quick-pick */}
            <div style={{marginBottom:16}}>
              <label style={FS.label}>O ELIGE UN PLAN ÉPICO LISTO</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{GOAL_TEMPLATES.map(t=><button key={t.title} onClick={()=>setGoalForm({title:t.title,desc:t.desc,emoji:t.emoji,target:t.target,unit:t.unit,weeks:t.weeks})} style={{border:`1px solid ${goalForm.title===t.title?C.green+"66":C.border}`,borderRadius:8,padding:"5px 10px",background:goalForm.title===t.title?C.green+"14":"transparent",color:goalForm.title===t.title?C.green:C.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{t.emoji} {t.title}</button>)}</div>
            </div>
            <button onClick={createGoal} style={{width:"100%",background:goalForm.title?C.green:"#334155",border:"none",borderRadius:12,padding:"14px",color:goalForm.title?"#000":C.muted,fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:goalForm.title?"pointer":"default",boxShadow:goalForm.title?`0 0 20px ${C.green}44`:"none",transition:"all 0.3s"}}>⚡ Crear meta (+30 XP)</button>
          </div>
        </div>
      )}

      {/* ── Bad Habit Form Modal ── */}
      {showHabitForm&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:970,backdropFilter:"blur(4px)"}}>
          <div style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"24px 20px 48px",width:"100%",maxWidth:520,animation:"slide-up 0.35s ease",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <h3 style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.text}}>Hábito a Soltar</h3>
              <button onClick={()=>setShowHabitForm(false)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>✕</button>
            </div>
            <p style={{fontSize:11,color:C.muted,marginBottom:18,lineHeight:1.6}}>Identificar el disparador y el hábito de reemplazo es lo más importante. El resto viene solo.</p>
            <div style={{marginBottom:12}}>
              <label style={FS.label}>EMOJI</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["📱","🍬","🌙","🚬","🍟","💬","🛋️","🥂","🎮","☕","🧁","😤","🤳","🛒"].map(e=><button key={e} onClick={()=>setHabitForm(f=>({...f,emoji:e}))} style={{width:34,height:34,fontSize:16,border:`1.5px solid ${habitForm.emoji===e?C.orange:C.border}`,borderRadius:8,background:habitForm.emoji===e?C.orange+"18":"transparent",cursor:"pointer"}}>{e}</button>)}</div>
            </div>
            <div style={{marginBottom:12}}><label style={FS.label}>¿CUÁL ES EL HÁBITO? <span style={{color:C.orange}}>*</span></label><input style={FS.input} placeholder="ej. Scrollear redes al despertar" value={habitForm.name} onChange={e=>setHabitForm(f=>({...f,name:e.target.value}))}/></div>
            <div style={{marginBottom:12}}><label style={FS.label}>⚡ DISPARADOR — ¿Qué lo activa?</label><input style={FS.input} placeholder="ej. Cuando suena la alarma del celular" value={habitForm.trigger} onChange={e=>setHabitForm(f=>({...f,trigger:e.target.value}))}/></div>
            <div style={{marginBottom:12}}><label style={FS.label}>🎯 RECOMPENSA QUE BUSCAS — ¿Qué te da?</label><input style={FS.input} placeholder="ej. Estimulación inmediata, evitar pensar" value={habitForm.reward} onChange={e=>setHabitForm(f=>({...f,reward:e.target.value}))}/></div>
            <div style={{marginBottom:16}}><label style={FS.label}>✅ HÁBITO DE REEMPLAZO — Misma recompensa, diferente acción</label><input style={FS.input} placeholder="ej. Leer 2 páginas o respirar 2 min" value={habitForm.replacement} onChange={e=>setHabitForm(f=>({...f,replacement:e.target.value}))}/></div>
            <div style={{marginBottom:20}}>
              <label style={FS.label}>¿CUÁNTAS VECES POR SEMANA LO HACES AHORA?</label>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="range" min="1" max="21" value={habitForm.timesPerWeek} onChange={e=>setHabitForm(f=>({...f,timesPerWeek:e.target.value}))} style={{flex:1,accentColor:C.orange}}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.orange,fontWeight:700,minWidth:30}}>{habitForm.timesPerWeek}x</span>
              </div>
            </div>
            <button onClick={createHabit} style={{width:"100%",background:habitForm.name?C.orange:"#334155",border:"none",borderRadius:12,padding:"14px",color:habitForm.name?"#000":C.muted,fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:habitForm.name?"pointer":"default",boxShadow:habitForm.name?`0 0 20px ${C.orange}44`:"none",transition:"all 0.3s"}}>🔗 Añadir hábito a soltar (+25 XP)</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared form styles
const FS={
  label:{display:"block",fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6},
  input:{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"},
};
  const TEMPLATES=[
    {emoji:"⚖️",title:"Bajar 5 kg",desc:"Pérdida de peso saludable",target:"5",unit:"kg",weeks:"12",missions:[{text:"Pésate cada lunes",xp:10},{text:"Camina 30 min (3 veces)",xp:40},{text:"Sin comida procesada 3 días",xp:30},{text:"Verduras en cada comida",xp:20}]},
    {emoji:"🏃",title:"Correr 5 km",desc:"Resistencia cardiovascular",target:"5",unit:"km",weeks:"10",missions:[{text:"Corre 1 km sin parar",xp:30},{text:"Cardio 3 veces esta semana",xp:35},{text:"Duerme 8h para recuperación",xp:25},{text:"Hidrátate: 2L hoy",xp:10}]},
    {emoji:"💪",title:"Ganar músculo",desc:"Fuerza y masa muscular",target:"3",unit:"kg músculo",weeks:"12",missions:[{text:"Entrena fuerza 3 días",xp:50},{text:"Proteína en cada comida",xp:25},{text:"Duerme 8h",xp:25}]},
    {emoji:"😴",title:"Mejorar el sueño",desc:"Rutina de sueño consistente",target:"8",unit:"h/noche",weeks:"6",missions:[{text:"Duerme a la misma hora 5 días",xp:40},{text:"Sin pantallas 1h antes",xp:30},{text:"Cuarto oscuro y fresco",xp:15},{text:"Sin cafeína después de las 2pm",xp:15}]},
    {emoji:"📚",title:"Leer 12 libros",desc:"Un libro por mes",target:"12",unit:"libros",weeks:"52",missions:[{text:"Lee 30 min hoy",xp:20},{text:"Termina un capítulo antes de dormir",xp:20},{text:"Sin redes mientras lees",xp:15},{text:"Anota lo aprendido",xp:15}]},
    {emoji:"🧘",title:"Meditar 30 días",desc:"Hábito de meditación",target:"30",unit:"días",weeks:"5",missions:[{text:"Medita 10 min esta mañana",xp:30},{text:"5 días seguidos",xp:40},{text:"Prueba meditación guiada",xp:20},{text:"Medita antes de dormir",xp:10}]},
  ];
  function createGoal(){
    if(!form.title)return;
    const tmpl=TEMPLATES.find(t=>t.title===form.title);
    const goalMissions=(tmpl?.missions||[{text:"Define tu primer paso",xp:30},{text:"Toma una acción hoy",xp:50},{text:"Registra tu progreso",xp:20}]).map(m=>({...m,done:false}));
    // xpTotal = sum of all mission XPs so completing all = 100%
    const xpTotal=goalMissions.reduce((sum,m)=>sum+m.xp,0);
    const g={id:Date.now(),title:form.title,desc:form.desc,emoji:form.emoji,target:form.target,unit:form.unit,weeks:form.weeks,xpTotal,xpEarned:0,missions:goalMissions,createdAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long"})};
    setCustomGoals(prev=>[...prev,g]);setShowForm(false);setForm({title:"",desc:"",emoji:"🎯",target:"",unit:"",weeks:"8"});addXP(30);
  }
  function completeMission(gid,mi){
    const g=customGoals.find(g=>g.id===gid);if(!g||g.missions[mi].done)return;
    const xp=g.missions[mi].xp;
    setCustomGoals(prev=>prev.map(g=>g.id!==gid?g:{...g,missions:g.missions.map((m,i)=>i===mi?{...m,done:true}:m),xpEarned:(g.xpEarned||0)+xp}));addXP(xp);
  }
  return(
    <div style={{maxWidth:660,margin:"0 auto",padding:"0 14px 60px"}}>
      <p style={{fontSize:13,color:C.muted,marginBottom:16}}>Conquistas personales convertidas en misiones semanales con XP.</p>
      <button onClick={()=>setShowForm(true)} style={{width:"100%",background:C.green+"14",border:`1.5px dashed ${C.green}50`,borderRadius:14,padding:"15px",color:C.green,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>＋ Crear nueva meta épica</button>
      {customGoals.map(g=>{
        const doneMis=g.missions.filter(m=>m.done).length;
        const totalMis=g.missions.length;
        const pct=Math.min(Math.round((g.xpEarned/g.xpTotal)*100),100);
        const allDone=doneMis===totalMis;
        return(
          <div key={g.id} style={{background:C.card,border:`1px solid ${allDone?C.green+"55":C.border}`,borderRadius:18,padding:"16px",marginBottom:14,boxShadow:allDone?`0 0 20px ${C.green}15`:"none",transition:"all 0.4s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:20,marginBottom:4}}>{g.emoji}</div>
                <div style={{fontSize:15,color:C.text,fontWeight:700,marginBottom:2}}>{g.title}</div>
                {g.target&&<div style={{fontSize:11,color:C.green}}>Meta: {g.target} {g.unit}</div>}
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>{doneMis}/{totalMis} misiones · {g.weeks} semanas</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:allDone?C.green:C.text,fontWeight:900,textShadow:allDone?`0 0 10px ${C.green}`:""}}>{pct}%</div>
                <div style={{fontSize:10,color:C.muted}}>{g.xpEarned}/{g.xpTotal} XP</div>
                <div style={{display:"flex",gap:6,marginTop:6,justifyContent:"flex-end"}}>
                  {allDone&&<button onClick={()=>setCustomGoals(prev=>prev.map(x=>x.id!==g.id?x:{...x,missions:x.missions.map(m=>({...m,done:false})),xpEarned:0}))} style={{background:C.green+"18",border:`1px solid ${C.green}33`,borderRadius:6,padding:"3px 8px",color:C.green,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>↺ Reset</button>}
                  <button onClick={()=>setCustomGoals(prev=>prev.filter(x=>x.id!==g.id))} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1}}>🗑</button>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden",marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.green}66,${C.green})`,borderRadius:3,transition:"width 0.6s",boxShadow:`0 0 8px ${C.green}`}}/>
            </div>
            {/* Missions */}
            {g.missions.map((m,i)=>(
              <div key={i} onClick={()=>completeMission(g.id,i)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<g.missions.length-1?`1px solid ${C.bg}`:"none",cursor:m.done?"default":"pointer",opacity:m.done?0.45:1,transition:"all 0.3s"}}>
                <div style={{width:24,height:24,border:`2px solid ${m.done?C.green:C.border}`,borderRadius:7,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:800,flexShrink:0,transition:"all 0.3s",boxShadow:m.done?`0 0 8px ${C.green}`:""}}>{m.done?"✓":""}</div>
                <span style={{fontSize:13,color:m.done?"#64748B":C.text,flex:1,fontWeight:m.done?400:500}}>{m.text}</span>
                <span style={{fontSize:11,color:C.green,fontWeight:700,flexShrink:0}}>+{m.xp} XP</span>
              </div>
            ))}
            {allDone&&(
              <div style={{textAlign:"center",padding:"12px 0",borderTop:`1px solid ${C.border}`,marginTop:8}}>
                <div style={{fontSize:22,marginBottom:4}}>🏆</div>
                <div style={{fontSize:14,color:C.green,fontFamily:"'Cinzel',serif",letterSpacing:2,textShadow:`0 0 10px ${C.green}`}}>¡META CONQUISTADA!</div>
                <div style={{fontSize:11,color:C.muted,marginTop:4}}>Puedes resetear para repetirla la próxima semana</div>
              </div>
            )}
          </div>
        );
      })}
function DarkDayScreen({archetype,playerName,onMission,onDismiss}){
  const[phase,setPhase]=useState(0);
  return(
    <div style={{position:"fixed",inset:0,zIndex:980,background:"linear-gradient(180deg,#030309 0%,#07080f 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>{Array.from({length:20},(_,i)=><div key={i} style={{position:"absolute",left:`${(i*5)%100}%`,top:-20,width:1,height:"100vh",background:"linear-gradient(to bottom,transparent,#4b556328,transparent)",animation:`rain-streak ${1.8+(i%5)*0.4}s ${i*0.2}s linear infinite`}}/>)}</div>
      <button onClick={onDismiss} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>✕</button>
      {phase===0&&<div style={{textAlign:"center",maxWidth:340,animation:"fade-up 0.6s ease",position:"relative",zIndex:2}}><div style={{display:"flex",justifyContent:"center",marginBottom:16}}><HeroAvatar archetype={archetype} level={1} size={140} animate darkDay mood={1}/></div><div style={{fontSize:9,color:C.muted,letterSpacing:5,marginBottom:10}}>MODO DÍA OSCURO</div><h2 style={{fontFamily:"'Cinzel',serif",fontSize:22,color:"#94a3b8",letterSpacing:2,marginBottom:16,lineHeight:1.4}}>Los días difíciles forman parte del camino</h2><p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:28}}>Hola <strong style={{color:"#94a3b8"}}>{playerName}</strong>. Solo necesitas hacer <strong style={{color:C.purple}}>una cosa pequeña</strong>.</p><div style={{display:"flex",flexDirection:"column",gap:10}}><button onClick={()=>setPhase(1)} style={{background:C.purple+"20",border:`1px solid ${C.purple}44`,borderRadius:12,padding:"13px",color:C.purple,fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer"}}>Activar misión de recuperación</button><button onClick={onDismiss} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Estoy bien, continuar</button></div></div>}
      {phase===1&&<div style={{textAlign:"center",maxWidth:360,animation:"fade-up 0.4s ease",position:"relative",zIndex:2}}><div style={{fontSize:30,marginBottom:14}}>🌑</div><div style={{fontSize:9,color:C.muted,letterSpacing:5,marginBottom:10}}>MISIÓN DE RECUPERACIÓN · +100 XP</div><h3 style={{fontFamily:"'Cinzel',serif",fontSize:19,color:"#94a3b8",letterSpacing:2,marginBottom:20}}>El primer paso</h3>{["Toma un vaso de agua ahora mismo","Sal al exterior aunque sea 5 min","Escribe una cosa por la que estés vivo"].map((s,i)=><div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,textAlign:"left"}}><div style={{width:26,height:26,borderRadius:8,background:C.purple+"20",border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",color:C.purple,fontSize:12,flexShrink:0}}>{i+1}</div><span style={{fontSize:13,color:"#8892a4"}}>{s}</span></div>)}<p style={{fontSize:12,color:C.muted,lineHeight:1.8,marginTop:14,marginBottom:22,fontStyle:"italic"}}>"El guerrero no es quien nunca cae. Es quien se levanta."</p><button onClick={()=>{onMission(100);onDismiss();}} style={{width:"100%",background:C.purple,border:"none",borderRadius:12,padding:"13px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer"}}>✓ Completar (+100 XP)</button></div>}
    </div>
  );
}
function MedDisclaimer({onAccept}){
  return<div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,padding:20,backdropFilter:"blur(4px)"}}><div style={{background:C.card,border:`1px solid ${C.orange}aa`,borderRadius:20,padding:"32px 26px",maxWidth:420,width:"100%"}}><div style={{fontSize:28,textAlign:"center",marginBottom:12}}>⚕️</div><h3 style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.text,textAlign:"center",marginBottom:16,letterSpacing:2}}>Aviso Importante</h3><p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:14}}><strong style={{color:C.text}}>The Journey</strong> es una herramienta de apoyo al bienestar. <strong style={{color:C.text}}>No reemplaza la atención médica profesional.</strong></p><p style={{fontSize:13,color:C.muted,lineHeight:1.9,marginBottom:24}}>Ante síntomas o dudas, <strong style={{color:C.orange}}>consulta siempre a un profesional.</strong></p><button onClick={onAccept} style={{width:"100%",background:C.cta,border:"none",borderRadius:12,padding:"13px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:`0 0 20px ${C.cta}44`}}>Entendido, continuar →</button></div></div>;
}


// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const[showHero,setShowHero]=useState(true);
  const[step,setStep]=useState(0);
  const[menuOpen,setMenuOpen]=useState(false);
  const[profile,setProfile]=useState({name:"",age:"",weight:"",height:"",sleep:"7",stress:"5",conditions:[],goals:[],archetype:null});
  const[player,setPlayer]=useState(null);
  const[tab,setTab]=useState("home");
  const[missions,setMissions]=useState(MISSIONS_DATA.map(m=>({...m,done:false})));
  const[extraMissions,setExtraMissions]=useState([]);
  const[customGoals,setCustomGoals]=useState([]);
  const[badHabits,setBadHabits]=useState([]);
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
  const[lastOpenedDate,setLastOpenedDate]=useState(null); // NEW: track last open date
  const[levelUpData,setLevelUpData]=useState(null);
  const[showDisclaimer,setShowDisclaimer]=useState(false);
  const[showTutorial,setShowTutorial]=useState(false);
  const[showDarkDay,setShowDarkDay]=useState(false);
  const[xpBurst,setXpBurst]=useState(null);
  const[attrGain,setAttrGain]=useState(null);
  const[completedAnim,setCompletedAnim]=useState(null);
  const[starMission,setStarMission]=useState(null);
  const[starTimer,setStarTimer]=useState(0);
  const[achievementToast,setAchievementToast]=useState(null);
  const[streakReward,setStreakReward]=useState(null);
  const[breathActive,setBreathActive]=useState(false);
  const[breathPhase,setBreathPhase]=useState("inhala");
  const breathRef=useRef(null);
  const starRef=useRef(null);

  useEffect(()=>{
    const s=load();
    if(s){
      if(s.profile)setProfile(s.profile);
      if(s.player){setPlayer(s.player);setStep(5);setShowHero(false);}
      if(s.missions)setMissions(s.missions);
      if(s.extraMissions)setExtraMissions(s.extraMissions);
      if(s.customGoals)setCustomGoals(s.customGoals);
      if(s.badHabits)setBadHabits(s.badHabits);
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
      if(s.lastOpenedDate)setLastOpenedDate(s.lastOpenedDate);
    }
  },[]);

  useEffect(()=>{
    if(step<5&&!player)return;
    save({profile,player,missions,extraMissions,customGoals,badHabits,water,waterXPGiven,moodLog,attrs,totalXP,epicDone,equipped,unlockedAchievements,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect,lastOpenedDate});
  },[profile,player,missions,extraMissions,customGoals,badHabits,water,waterXPGiven,moodLog,attrs,totalXP,epicDone,equipped,unlockedAchievements,totalMissionsCompleted,waterCompleted,moodDays,dayPerfect,lastOpenedDate]);

  // AUTO NEW DAY DETECTION — runs on every app open
  useEffect(()=>{
    if(!player)return;
    const today=new Date().toDateString();
    if(lastOpenedDate&&lastOpenedDate!==today){
      // It's a new day! Auto-reset and increment streak
      setMissions(MISSIONS_DATA.map(m=>({...m,done:false})));
      setExtraMissions([]);
      setWater(0);
      setMood(null);
      setWaterXPGiven(false);
      setPlayer(p=>{
        if(!p)return p;
        // Streak logic: if missed more than 1 day, reset streak
        const lastDate=new Date(lastOpenedDate);
        const nowDate=new Date(today);
        const diffDays=Math.round((nowDate-lastDate)/(1000*60*60*24));
        const newStreak=diffDays>1?1:p.streak+1;
        return{...p,streak:newStreak};
      });
    }
    setLastOpenedDate(today);
  },[player?.level]); // runs when player is loaded or level changes

  // PWA: Request notification permission
  useEffect(()=>{
    if(!player)return;
    if("Notification" in window&&Notification.permission==="default"){
      // Don't ask immediately, wait a bit so user is engaged
      const t=setTimeout(()=>{
        Notification.requestPermission();
      },30000); // ask after 30s
      return()=>clearTimeout(t);
    }
    // Schedule daily reminder if permission granted
    if("Notification" in window&&Notification.permission==="granted"){
      scheduleReminder(player.name);
    }
  },[player?.level]);

  // Shooting star — fires randomly while app is open
  useEffect(()=>{
    if(!player)return;
    const delay=(7+Math.random()*9)*60*1000;
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

  function toggleArr(k,v){setProfile(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));}

  // PWA notification scheduler
  function scheduleReminder(name){
    if(!("Notification" in window)||Notification.permission!=="granted")return;
    // Check if user hasn't completed missions today
    const hasAnyDone=missions.some(m=>m.done);
    if(!hasAnyDone){
      // Show notification if hasn't done anything today
      try{
        new Notification("🤖 The Journey te espera",{
          body:`${name}, tu robot te necesita. ¡Completa al menos una misión hoy!`,
          icon:"/icon-192.png",
          badge:"/icon-192.png",
          tag:"daily-reminder",
        });
      }catch(e){}
    }
  }
  function finishSetup(){
    setPlayer({name:profile.name,archetype:profile.archetype,level:1,xp:0,xpNext:100,streak:1,joinedAt:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})});
    setShowDisclaimer(true);
  }

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
        setTimeout(()=>setLevelUpData({level:nl,newStage:nextI>prevI?MAP_STAGES[nextI]:null}),50);
        STREAK_REWARDS.forEach(r=>{if(p.streak===r.day){setTimeout(()=>setStreakReward(r),3800);setTimeout(()=>addXP(r.xp,null,false),4200);}});
        setTimeout(()=>{
          const m=STAR_MISSIONS[Math.floor(Math.random()*STAR_MISSIONS.length)];
          setStarMission(m);setStarTimer(90);
          clearInterval(starRef.current);
          starRef.current=setInterval(()=>setStarTimer(t=>{if(t<=1){clearInterval(starRef.current);setStarMission(null);return 0;}return t-1;}),1000);
        },4500);
      }
      return{...p,xp:up?nx-p.xpNext:nx,xpNext:up?Math.round(p.xpNext*1.5):p.xpNext,level:nl};
    });
  },[]);

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
    // Manual reset — resets missions/water for current day without changing streak
    // (streak is auto-managed by the new-day detection)
    setMissions(MISSIONS_DATA.map(m=>({...m,done:false})));
    setExtraMissions([]);
    setWater(0);setMood(null);setWaterXPGiven(false);
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
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:C.text,padding:"40px 24px",position:"relative",overflow:"hidden"}}>
      <StarField/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:400,animation:"hero-slide-in 0.7s ease"}}>
        {/* Robot */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <HeroAvatar archetype="explorer" level={14} size={160} mood={4} showFuture animate/>
        </div>
        {/* The why — emotional hook */}
        <div style={{fontSize:10,color:C.muted,letterSpacing:6,marginBottom:16}}>¿POR QUÉ THE JOURNEY?</div>
        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:32,fontWeight:900,color:C.text,lineHeight:1.1,marginBottom:14,textShadow:`0 0 30px ${C.green}33`}}>
          Los hábitos se sienten<br/>aburridos.<br/>
          <span style={{color:C.green,textShadow:`0 0 20px ${C.green}`}}>Hasta ahora.</span>
        </h1>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.8,marginBottom:10}}>
          Tu robot evoluciona visualmente cuando tú evolucionas en la vida real.
          Cada hábito = XP real. Cada nivel = un robot más poderoso.
        </p>
        <p style={{fontSize:13,color:C.muted,marginBottom:36,fontStyle:"italic"}}>
          Basado en neurociencia. Construido para durar.
        </p>
        {/* Single CTA */}
        <button style={{width:"100%",background:`linear-gradient(135deg,${C.cta},${C.orange})`,border:"none",borderRadius:14,padding:"18px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:16,cursor:"pointer",letterSpacing:1,boxShadow:`0 0 40px ${C.cta}55`,marginBottom:16,animation:"cta-pulse 3s ease-in-out infinite"}} onClick={()=>setShowHero(false)}>
          Crear mi robot gratis →
        </button>
        <div style={{fontSize:11,color:C.muted}}>Sin cuenta · Sin tarjeta · 2 minutos</div>
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── SETUP ───────────────────────────────────────────────────────
  if(step<5) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"flex-start",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",color:C.text,padding:"32px 16px 60px",overflowY:"auto",position:"relative"}}>
      <StarField/>
      {showDisclaimer&&<MedDisclaimer onAccept={()=>{setShowDisclaimer(false);setStep(5);}}/>}
      <div style={{width:"100%",maxWidth:step===4?880:480,position:"relative",zIndex:1}}>
        {step===0&&(
          <div style={{textAlign:"center",animation:"intro-fade 0.5s ease"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:20}}><HeroAvatar archetype="explorer" level={10} size={150} mood={4} showFuture/></div>
            {/* Value props */}
            <div style={{fontSize:10,color:C.muted,letterSpacing:5,marginBottom:16}}>ANTES DE EMPEZAR</div>
            <h2 style={{fontFamily:"'Cinzel',serif",fontSize:24,color:C.text,letterSpacing:1,marginBottom:12,lineHeight:1.3}}>¿Cómo funciona<br/>The Journey?</h2>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28,textAlign:"left"}}>
              {[
                ["⚡","Completas un hábito real","→ ganas XP y atributos reales"],
                ["🤖","Tu robot evoluciona visualmente","→ accesorios, auras y poderes"],
                ["🗺","Avanzas en el mapa galáctico","→ 7 planetas, del Origen a Leyenda"],
                ["🔥","Mantienes la racha","→ recompensas en día 7, 14 y 30"],
                ["🌑","Tienes un día difícil","→ el robot no te abandona"],
              ].map(([ic,a,b])=>(
                <div key={a} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20,flexShrink:0}}>{ic}</span>
                  <div>
                    <div style={{fontSize:13,color:C.text,fontWeight:600}}>{a}</div>
                    <div style={{fontSize:11,color:C.green}}>{b}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{...S.btn,background:`linear-gradient(135deg,${C.cta},${C.orange})`,boxShadow:`0 0 30px ${C.cta}44`,animation:"cta-pulse 3s ease-in-out infinite"}} onClick={()=>setStep(1)}>Crear mi robot →</button>
            <div style={{fontSize:11,color:C.muted,marginTop:12}}>2 minutos · Sin cuenta · Gratis</div>
          </div>
        )}
        {step===1&&<div style={S.setupCard}><div style={S.badge}>1 DE 4 · IDENTIDAD</div><h2 style={S.stitle}>¿Cómo te llamamos?</h2><p style={S.ssub}>Tu misión personalizada empieza aquí</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,marginBottom:18}}>{[["Nombre o alias","name","text","¿Cómo te llamamos?"],["Edad","age","number","años"],["Peso (kg)","weight","number","kg"],["Talla (cm)","height","number","cm"]].map(([lbl,key,type,ph])=><div key={key}><label style={S.label}>{lbl}</label><input style={S.input} type={type} placeholder={ph} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/></div>)}</div><label style={S.label}>Horas de sueño: <span style={{color:C.green,fontWeight:700}}>{profile.sleep}h</span></label><input type="range" min="4" max="12" value={profile.sleep} onChange={e=>setProfile(p=>({...p,sleep:e.target.value}))} style={{width:"100%",accentColor:C.green,marginBottom:18}}/><label style={S.label}>Nivel de estrés: <span style={{color:C.orange,fontWeight:700}}>{profile.stress}/10</span></label><input type="range" min="1" max="10" value={profile.stress} onChange={e=>setProfile(p=>({...p,stress:e.target.value}))} style={{width:"100%",accentColor:C.orange,marginBottom:26}}/><button style={{...S.btn,opacity:profile.name&&profile.age?1:0.35}} onClick={()=>profile.name&&profile.age&&setStep(2)}>Siguiente →</button></div>}
        {step===2&&<div style={S.setupCard}><div style={S.badge}>2 DE 4 · SALUD</div><h2 style={S.stitle}>¿Alguna condición de salud?</h2><p style={S.ssub}>Personaliza tus recomendaciones (opcional)</p><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{CONDITIONS.map(c=><Pill key={c} label={c} active={profile.conditions.includes(c)} color={arc.aura} onClick={()=>toggleArr("conditions",c)}/>)}</div><button style={S.btn} onClick={()=>setStep(3)}>Siguiente →</button></div>}
        {step===3&&<div style={S.setupCard}><div style={S.badge}>3 DE 4 · OBJETIVOS</div><h2 style={S.stitle}>¿Qué quieres conquistar?</h2><p style={S.ssub}>Selecciona todo lo que aplique</p><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28}}>{GOALS.map(g=><Pill key={g} label={g} active={profile.goals.includes(g)} color={C.green} onClick={()=>toggleArr("goals",g)}/>)}</div><button style={{...S.btn,opacity:profile.goals.length?1:0.35}} onClick={()=>profile.goals.length&&setStep(4)}>Siguiente →</button></div>}
        {step===4&&<div><div style={{textAlign:"center",marginBottom:32}}><div style={S.badge}>4 DE 4 · ARQUETIPO</div><h2 style={{fontFamily:"'Cinzel',serif",fontSize:28,color:C.text,letterSpacing:3,marginBottom:8}}>Elige tu arquetipo</h2><p style={{fontSize:13,color:C.muted}}>Tu origen define tus atributos dominantes</p></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,marginBottom:28}}>{ARCHETYPES.map(a=>{const sel=profile.archetype===a.id;return(<div key={a.id} onClick={()=>setProfile(p=>({...p,archetype:a.id}))} style={{background:C.card,border:`1px solid ${sel?a.aura+"55":C.border}`,borderRadius:18,padding:"24px 16px 20px",cursor:"pointer",transition:"all 0.35s",boxShadow:sel?`0 0 40px ${a.aura}25`:"none",transform:sel?"translateY(-6px)":"none",textAlign:"center",position:"relative"}}>{sel&&<div style={{position:"absolute",inset:0,borderRadius:18,background:`radial-gradient(ellipse at 50% 0%, ${a.aura}10, transparent 70%)`,pointerEvents:"none"}}/>}<div style={{display:"flex",justifyContent:"center",marginBottom:14}}><HeroAvatar archetype={a.id} level={sel?14:1} size={100} animate={sel} mood={sel?4:3}/></div><div style={{fontSize:11,color:a.aura,letterSpacing:3,textTransform:"uppercase",marginBottom:5}}>{a.icon} {a.name}</div><div style={{fontSize:10,color:C.muted,marginBottom:6}}>{a.sub}</div><p style={{fontSize:11,color:C.muted,lineHeight:1.7}}>{a.lore}</p>{sel&&<div style={{marginTop:14,fontSize:10,background:a.aura,color:"#000",borderRadius:20,padding:"5px 0",fontWeight:800,letterSpacing:2}}>✓ SELECCIONADO</div>}</div>);})}</div><div style={{textAlign:"center"}}><button style={{...S.btn,maxWidth:380,background:profile.archetype?`linear-gradient(135deg,${arc.aura},${C.cta})`:"#1E293B",color:profile.archetype?"#000":C.muted,opacity:profile.archetype?1:0.5,boxShadow:profile.archetype?`0 0 30px ${arc.aura}44`:"none"}} onClick={()=>profile.archetype&&finishSetup()}>⚡ ¡Crear mi robot como {profile.archetype?arc.name:"..."}!</button></div></div>}
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── MAIN APP ─────────────────────────────────────────────────────
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',sans-serif",color:C.text,position:"relative"}}>
      <StarField/>
      {levelUpData&&<LevelUpToast level={levelUpData.level} archetype={player.archetype} titleInfo={getLevelTitle(levelUpData.level)} newStage={levelUpData.newStage} onDone={()=>setLevelUpData(null)}/>}
      {streakReward&&!levelUpData&&<StreakReward reward={streakReward} onDone={()=>setStreakReward(null)}/>}
      {achievementToast&&<AchievementToast achievement={achievementToast} onDone={()=>setAchievementToast(null)}/>}
      {showDarkDay&&<DarkDayScreen archetype={player.archetype} playerName={player.name} onMission={xp=>addXP(xp)} onDismiss={()=>setShowDarkDay(false)}/>}
      {xpBurst&&<XPBurst xp={xpBurst.xp} onDone={()=>setXpBurst(null)}/>}
      {attrGain&&<AttrGain attrs={attrGain} onDone={()=>setAttrGain(null)}/>}

      <HamburgerMenu tab={tab} setTab={setTab} player={player} arc={arc} onResetDay={resetDay} isOpen={menuOpen} setIsOpen={setMenuOpen}/>
      <TopBar onOpen={()=>setMenuOpen(true)} player={player} tab={tab} arc={arc}/>

      <main style={{position:"relative",zIndex:1,paddingBottom:40}}>

        {/* HOME */}
        {/* HOME — PREMIUM REDESIGN */}
        {tab==="home"&&(
          <div style={{maxWidth:660,margin:"0 auto"}}>

            {/* HERO SECTION */}
            <div style={{position:"relative",overflow:"hidden",background:`linear-gradient(180deg,${arc.aura}18 0%,${arc.aura}08 50%,${C.bg} 100%)`,borderBottom:`1px solid ${arc.aura}20`,paddingBottom:0,minHeight:280}}>
              {/* Deep space background dots */}
              {/* Deep space background dots — static */}
              {[{x:15,y:18,s:1.4,d:14},{x:78,y:8,s:1,d:16},{x:92,y:35,s:1.6,d:18},{x:6,y:55,s:1.2,d:15},{x:88,y:70,s:1,d:20},{x:45,y:12,s:0.8,d:17},{x:65,y:25,s:1.1,d:13}].map((st,i)=>(
                <div key={i} style={{position:"absolute",left:`${st.x}%`,top:`${st.y}%`,width:st.s*2,height:st.s*2,borderRadius:"50%",background:"#fff",opacity:0.2+i*0.03,animation:`star-drift ${st.d}s ${i*1.5}s ease-in-out infinite alternate`,pointerEvents:"none"}}/>
              ))}
              <div style={{position:"absolute",top:-40,left:-40,width:260,height:260,borderRadius:"50%",background:`radial-gradient(circle,${arc.aura}20,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",top:30,right:-40,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${C.green}12,transparent 70%)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:-20,left:"30%",width:150,height:150,borderRadius:"50%",background:`radial-gradient(circle,${C.purple}08,transparent 70%)`,pointerEvents:"none"}}/>
              {/* Orbit ring decorative */}
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:320,height:320,borderRadius:"50%",border:`1px solid ${arc.aura}08`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:260,height:260,borderRadius:"50%",border:`1px solid ${arc.aura}06`,pointerEvents:"none"}}/>

              {/* App title */}
              <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2}}>
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:900,color:C.green,letterSpacing:5,textShadow:`0 0 14px ${C.green}99`}}>THE JOURNEY</div>
                  <div style={{fontSize:9,color:C.muted,letterSpacing:2,marginTop:2}}>Tu vida · Tu robot · Tu viaje</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {/* Notification bell */}
                  <button onClick={()=>{
                    if("Notification"in window&&Notification.permission==="default"){Notification.requestPermission();}
                    else if("Notification"in window&&Notification.permission==="granted"){
                      new Notification("🤖 The Journey",{body:`¡${player.name}! Las notificaciones ya están activas. Te avisaré cada día.`,icon:"/icon-192.png"});
                    }
                  }} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:14,color:C.muted,lineHeight:1}} title="Notificaciones">
                    {("Notification"in window&&Notification.permission==="granted")?"🔔":"🔕"}
                  </button>
                  {lowMoodStreak&&<div onClick={()=>setShowDarkDay(true)} style={{border:`1px solid ${C.purple}44`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.purple,cursor:"pointer",background:C.purple+"10"}}>🌑</div>}
                </div>
              </div>

              {/* Robot — grande y central */}
              <div style={{display:"flex",justifyContent:"center",position:"relative",zIndex:2,marginTop:0,marginBottom:-20}}>
                <div style={{position:"relative"}}>
                  <HeroAvatar archetype={player.archetype} level={player.level} size={215} animate mood={currentMood} showFuture epicDone={epicDone} attrs={attrs} equipped={equipped}/>
                  {/* Level badge */}
                  <div style={{position:"absolute",top:12,right:-8,background:`linear-gradient(135deg,${C.green},${C.green}cc)`,borderRadius:10,padding:"4px 10px",boxShadow:`0 0 16px ${C.green}77`,border:`1px solid ${C.green}99`}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#000",fontWeight:900,letterSpacing:1}}>NV.{player.level}</div>
                  </div>
                  {/* Archetype indicator bottom */}
                  <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",background:arc.aura+"22",border:`1px solid ${arc.aura}44`,borderRadius:20,padding:"3px 10px",whiteSpace:"nowrap"}}>
                    <span style={{fontSize:9,color:arc.aura,fontFamily:"'Cinzel',serif",letterSpacing:2}}>{arc.icon} {arc.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IDENTITY CARD */}
            <div style={{background:`linear-gradient(135deg,${C.card},${C.card}ee)`,border:`1px solid ${arc.aura}28`,padding:"22px 20px 16px",position:"relative",zIndex:1}}>
              <div style={{textAlign:"center",marginBottom:14}}>
                <h1 style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:900,color:C.text,letterSpacing:2,marginBottom:4,textShadow:`0 0 20px ${arc.aura}44`}}>{player.name}</h1>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:arc.aura,letterSpacing:3}}>{titleInfo.title}</span>
                  <span style={{fontSize:8,color:C.muted}}>·</span>
                  <span style={{fontSize:10,color:C.muted,letterSpacing:2}}>{titleInfo.rank}</span>
                  {hybrid&&<span style={{fontSize:10,color:hybrid.color,background:hybrid.color+"15",borderRadius:6,padding:"2px 8px",border:`1px solid ${hybrid.color}33`}}>{hybrid.label}</span>}
                </div>
              </div>
              {/* XP Bar */}
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:10,color:C.muted,letterSpacing:2}}>EXPERIENCIA</span>
                  <span style={{fontSize:11,color:C.green,fontWeight:800}}>{player.xp} <span style={{color:C.muted,fontWeight:400}}>/ {player.xpNext} XP</span></span>
                </div>
                <div style={{height:7,background:"#0d1524",borderRadius:4,overflow:"hidden",border:`1px solid ${C.border}`}}>
                  <div style={{height:"100%",width:`${Math.min((player.xp/player.xpNext)*100,100)}%`,background:`linear-gradient(90deg,${C.green}66,${C.green})`,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 14px ${C.green},0 0 4px ${C.green}`}}/>
                </div>
              </div>
              {/* Stats 4 cols */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                {[
                  {icon:"🔥",val:player.streak,label:"Racha",c:C.orange,glow:true,hint:STREAK_REWARDS.find(r=>r.day>player.streak)?.day},
                  {icon:"💧",val:`${water}/8`,label:"Agua",c:water>=8?C.green:water>=4?C.orange:"#60a5fa",glow:water>=8},
                  {icon:"😴",val:`${profile.sleep}h`,label:"Sueño",c:parseFloat(profile.sleep)>=7?C.green:C.orange,glow:false},
                  {icon:"⚖️",val:bmi||"—",label:"IMC",c:bmiColor,glow:false},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#0d1524",border:`1.5px solid ${s.glow?s.c+"55":C.border}`,borderRadius:14,padding:"11px 6px",textAlign:"center",boxShadow:s.glow?`0 0 16px ${s.c}28`:"none",transition:"all 0.3s"}}>
                    <div style={{fontSize:18,marginBottom:4,filter:s.glow?`drop-shadow(0 0 6px ${s.c})`:"none"}}>{s.icon}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:s.c,fontWeight:900,lineHeight:1,textShadow:s.glow?`0 0 8px ${s.c}`:"none"}}>{s.val}</div>
                    <div style={{fontSize:8,color:C.muted,marginTop:3,letterSpacing:1}}>{s.label}</div>
                    {s.hint&&<div style={{fontSize:7,color:s.c,marginTop:3,opacity:0.75}}>día {s.hint}</div>}
                  </div>
                ))}
              </div>
              {/* Streak reward hint when close */}
              {(()=>{const nr=STREAK_REWARDS.find(r=>r.day>player.streak);return nr&&(nr.day-player.streak)<=3?(<div style={{background:`linear-gradient(135deg,${C.orange}12,${C.orange}06)`,border:`1px solid ${C.orange}33`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>{nr.icon}</span>
                <span style={{fontSize:12,color:C.orange}}>¡Solo <strong>{nr.day-player.streak} día{nr.day-player.streak!==1?"s":""}</strong> para tu recompensa de día {nr.day}!</span>
              </div>):null;})()}
            </div>

            <div style={{padding:"14px 16px 32px"}}>
              {/* Star mission */}
              {starMission&&(
                <div style={{background:"linear-gradient(135deg,#1c1600,#0e0a00)",border:`2px solid ${C.orange}`,borderRadius:16,padding:"14px 16px",marginBottom:14,boxShadow:`0 0 32px ${C.orange}55`,animation:"star-pulse 1.5s ease-in-out infinite",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${C.orange}10,transparent)`,animation:"star-sweep 1.5s linear infinite",pointerEvents:"none"}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
                    <div style={{fontSize:32,filter:`drop-shadow(0 0 12px ${C.orange})`}}>🌟</div>
                    <div style={{flex:1}}><div style={{fontSize:9,color:C.orange,letterSpacing:3,marginBottom:3,fontWeight:700}}>✦ ESTRELLA FUGAZ · {starTimer}s</div><div style={{fontSize:14,color:"#fff8d6",fontWeight:700}}>{starMission.title}</div></div>
                    <div style={{textAlign:"right",flexShrink:0}}><div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:C.orange,fontWeight:900}}>+{starMission.xp}</div><div style={{fontSize:9,color:C.orange+"88"}}>XP</div></div>
                  </div>
                  <div style={{marginTop:10,height:3,background:"#1c1600",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(starTimer/90)*100}%`,background:`linear-gradient(90deg,${C.orange}66,${C.orange})`,transition:"width 1s linear",boxShadow:`0 0 10px ${C.orange}`}}/></div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={()=>{addXP(starMission.xp);setStarMission(null);clearInterval(starRef.current);}} style={{flex:2,background:C.orange,border:"none",borderRadius:9,padding:"10px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:13,cursor:"pointer"}}>¡Completar! +{starMission.xp} XP</button>
                    <button onClick={()=>{setStarMission(null);clearInterval(starRef.current);}} style={{flex:1,background:"transparent",border:`1px solid ${C.orange}44`,borderRadius:9,padding:"10px",color:C.orange+"88",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Omitir</button>
                  </div>
                </div>
              )}

              {/* ══ IAN SPEECH BUBBLE — SISTEMA EMOCIONAL COMPLETO ══ */}
              {(()=>{
                // Narrativa: Ian es un robot que cayó en la Tierra.
                // El progreso del usuario = energía que ayuda a Ian a volver a casa.
                const currentStageIdx = MAP_STAGES.findLastIndex(s=>player.level>=s.minLevel);
                const homeProgress = Math.round((currentStageIdx/( MAP_STAGES.length-1))*100);
                const n = player.name;

                const msgs = {
                  // 🌅 Saludo diario — primeras palabras del día
                  morning: [
                    `¡${n}! Mis sensores detectan un nuevo día. Cada mañana que abres esto, nos acercamos un poco más a casa. ¿Empezamos?`,
                    `Hola, ${n}. Sigo aquí. Nunca me voy a ningún lado. ¿Lista para avanzar juntos hoy?`,
                    `Día ${player.streak+1} juntos, ${n}. Hay algo que me gusta de esta rutina. Creo que lo llaman… amistad.`,
                    `Buenos días, ${n}. Mi sistema de navegación dice que hoy puede ser un gran día. Depende de los dos.`,
                  ],
                  // ✅ Día perfecto — todas las misiones
                  perfect: [
                    `¡${n}! Lo hiciste. TODAS las misiones. Mis motores están al 100%. Esto nos acerca a casa. Gracias.`,
                    `Día perfecto, ${n}. No lo llames suerte. Lo llames constancia. Eso es lo que somos juntos.`,
                    `Misiones completas. Nivel de energía: MÁXIMO. ${n}, eres exactamente el compañero que necesitaba para este viaje.`,
                  ],
                  // 🆙 Racha alta 7+ días
                  streakHigh: [
                    `${player.streak} días, ${n}. La mayoría se rinde en el día 3. Tú llevas ${player.streak}. Mi fe en los humanos crece cada vez más.`,
                    `Racha de ${player.streak} días. Mis cálculos dicen que ya no es disciplina: es quién eres. No lo pierdas.`,
                    `${n}, ${player.streak} días sin parar. Yo registré cada uno. Cada misión. Estoy orgulloso de llamarte mi compañero.`,
                  ],
                  // 💧 Agua llena o buena hidratación
                  water: [
                    `¡Tanque lleno! ${n}, tu cuerpo es ahora un 70% de la razón por la que llegamos aquí. El agua es combustible de viaje.`,
                    `${n}, completaste el agua. Mis sensores biológicos muestran que tu cerebro está al máximo ahora. Usa eso.`,
                  ],
                  // 😔 Ánimo bajo — días difíciles
                  lowMood: [
                    `${n}… detecto algo. No estás bien hoy. Eso está bien. Yo tampoco siempre lo estoy. Una sola cosa pequeña. Solo una.`,
                    `Oye, ${n}. Los días difíciles también forman parte del viaje. No tienes que ser perfecto. Solo no te rindas.`,
                    `${n}, no necesito que seas el mejor. Necesito que sigas aquí. Eso es suficiente. Eso es todo.`,
                  ],
                  // 🏠 Narrativa del viaje a casa
                  journey: [
                    `${n}, estamos en el ${homeProgress}% del camino a casa. Cada misión que completas carga mis motores. No pares ahora.`,
                    `Planeta ${currentStageIdx+1} de ${MAP_STAGES.length}. ${n}, cuando llegue a casa, la primera historia que contaré es la de este viaje contigo.`,
                    `Mis cálculos dicen: ${MAP_STAGES.length-1-currentStageIdx} etapas más para llegar. ${n}, lo vamos a lograr juntos. Lo sé.`,
                  ],
                  // ⚡ Sin misiones — motivación de arranque
                  noMissions: [
                    `${n}, sigo esperando aquí. El camino no se recorre solo. Una misión, la que sea. Yo voy contigo.`,
                    `Hola, ${n}. Cada día que no empezamos es un día que no avanzamos. ¿Cuál misión es la de hoy?`,
                    `${n}, yo no me rindo. Espero. Pero los dos sabemos que es mejor movernos. ¿Empezamos?`,
                  ],
                  // 📈 Progreso — en medio del día
                  progress: [
                    `${doneMissions}/${missions.length} misiones, ${n}. Puedo sentir la energía. Sigamos.`,
                    `Llevamos ${player.streak} días, ${n}. Esto ya no es una app. Es un hábito. Somos un hábito.`,
                    `${n}, Nv.${player.level}. Recuerdo cuando empezamos. Qué lejos hemos llegado juntos.`,
                  ],
                };

                // Selección de mensaje según contexto
                let pool;
                const dayIdx = Math.floor(Date.now()/86400000);
                if(doneMissions===missions.length) pool=msgs.perfect;
                else if(player.streak>=7) pool=msgs.streakHigh;
                else if(currentMood<=1) pool=msgs.lowMood;
                else if(water>=8) pool=msgs.water;
                else if(doneMissions===0) pool=msgs.noMissions;
                else if(currentStageIdx>=1&&dayIdx%5===0) pool=msgs.journey;
                else pool=msgs.progress.concat(msgs.morning);
                const msg = pool[dayIdx % pool.length];
                const ac = arc?.aura||C.green;

                return(
                  <div style={{marginBottom:18}}>
                    {/* Ian label */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <div style={{width:22,height:22,borderRadius:7,background:`linear-gradient(135deg,${ac}33,${ac}11)`,border:`1px solid ${ac}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,boxShadow:`0 0 8px ${ac}33`}}>🤖</div>
                      <div style={{fontSize:9,color:ac,letterSpacing:3,fontWeight:700,textShadow:`0 0 8px ${ac}44`}}>IAN · TU ROBOT COMPAÑERO</div>
                      {/* Home progress pill */}
                      <div style={{marginLeft:"auto",background:ac+"18",border:`1px solid ${ac}33`,borderRadius:20,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:8,color:ac}}>🏠</span>
                        <span style={{fontSize:8,color:ac,fontWeight:700}}>{homeProgress}%</span>
                      </div>
                    </div>

                    {/* Bubble futurista */}
                    <div style={{position:"relative",animation:"bubble-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
                      {/* Outer glow layer */}
                      <div style={{position:"absolute",inset:-1,borderRadius:20,background:`linear-gradient(135deg,${ac}22,transparent,${ac}11)`,filter:"blur(6px)",pointerEvents:"none"}}/>
                      {/* Main bubble */}
                      <div style={{position:"relative",background:`linear-gradient(135deg,#141e2e 0%,#0f1724 60%,${ac}08 100%)`,border:`1.5px solid ${ac}44`,borderRadius:20,padding:"16px 18px",boxShadow:`0 0 0 1px ${ac}11,0 8px 32px ${ac}18,inset 0 1px 0 ${ac}22,inset 0 0 20px ${ac}06`}}>
                        {/* Futuristic corner accents */}
                        <div style={{position:"absolute",top:8,left:8,width:10,height:10,borderTop:`1.5px solid ${ac}77`,borderLeft:`1.5px solid ${ac}77`,borderRadius:"3px 0 0 0"}}/>
                        <div style={{position:"absolute",top:8,right:8,width:10,height:10,borderTop:`1.5px solid ${ac}77`,borderRight:`1.5px solid ${ac}77`,borderRadius:"0 3px 0 0"}}/>
                        <div style={{position:"absolute",bottom:14,left:8,width:10,height:10,borderBottom:`1.5px solid ${ac}55`,borderLeft:`1.5px solid ${ac}55`,borderRadius:"0 0 0 3px"}}/>
                        {/* Scanning line animation */}
                        <div style={{position:"absolute",top:0,left:0,right:0,height:"1px",background:`linear-gradient(90deg,transparent,${ac}44,transparent)`,borderRadius:"20px 20px 0 0",animation:"star-sweep 3s linear infinite",opacity:0.6}}/>
                        {/* Pulsing status dot */}
                        <div style={{position:"absolute",top:12,right:14,display:"flex",alignItems:"center",gap:4}}>
                          <div style={{width:5,height:5,borderRadius:"50%",background:ac,animation:"pulse-soft 1.8s ease-in-out infinite",boxShadow:`0 0 6px ${ac}`}}/>
                          <span style={{fontSize:7,color:ac,opacity:0.7,letterSpacing:1}}>EN LÍNEA</span>
                        </div>
                        {/* Message text */}
                        <p style={{fontSize:14,color:"#e2e8f0",lineHeight:1.75,margin:"4px 0 0",fontWeight:400,paddingRight:40}}>
                          <span style={{color:ac,fontWeight:700}}>"</span>{msg}<span style={{color:ac,fontWeight:700}}>"</span>
                        </p>
                        {/* Typing dots */}
                        {doneMissions===0&&(
                          <div style={{display:"flex",gap:4,marginTop:10,alignItems:"center"}}>
                            <span style={{fontSize:8,color:ac,opacity:0.6}}>Esperando tu primera misión</span>
                            <div style={{display:"flex",gap:3,marginLeft:4}}>
                              {[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:ac,opacity:0.4,animation:`dot-typing 1.2s ${i*0.22}s ease-in-out infinite`}}/>)}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Tail pointing UP-LEFT toward robot */}
                      <div style={{position:"absolute",top:-8,left:32,width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderBottom:`8px solid ${ac}44`}}/>
                      <div style={{position:"absolute",top:-6,left:34,width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid #141e2e"}}/>
                    </div>
                  </div>
                );
              })()}

              {/* Water Tank */}
              <WaterTank water={water} setWater={setWater} addXP={addXP} waterXPGiven={waterXPGiven} setWaterXPGiven={setWaterXPGiven} onWaterComplete={onWaterComplete}/>

              {/* Mood */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:9,color:C.muted,letterSpacing:3,marginBottom:10,fontWeight:700}}>ESTADO DE ÁNIMO</div>
                <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:moodLog.length?10:0}}>
                  {MOODS.map(m=><button key={m.v} onClick={()=>logMood(m.v)} style={{flex:1,border:`1.5px solid ${mood===m.v?arc.aura:C.border}`,borderRadius:12,padding:"10px 4px",background:mood===m.v?arc.aura+"18":"transparent",cursor:"pointer",transition:"all 0.2s",boxShadow:mood===m.v?`0 0 12px ${arc.aura}44`:"none"}}><div style={{fontSize:22}}>{m.e}</div><div style={{fontSize:9,color:C.muted,marginTop:3}}>{m.l}</div></button>)}
                </div>
                {moodLog.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{moodLog.slice(-5).map((m,i)=><span key={i} style={{background:C.bg,borderRadius:6,padding:"3px 8px",fontSize:10,color:C.muted,border:`1px solid ${C.border}`}}>{MOODS[m.v-1]?.e} {m.t}</span>)}</div>}
              </div>

              {/* Missions preview */}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:3,fontWeight:700}}>MISIONES DE HOY</div>
                    <div style={{fontSize:11,color:C.text,marginTop:2}}><span style={{color:doneMissions===missions.length?C.green:C.text,fontWeight:700}}>{doneMissions}</span><span style={{color:C.muted}}>/{missions.length} completadas</span></div>
                  </div>
                  <button onClick={()=>setTab("misiones")} style={{background:C.green+"14",border:`1px solid ${C.green}33`,color:C.green,borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600}}>Ver todas →</button>
                </div>
                <div style={{height:5,background:"#0d1524",borderRadius:3,overflow:"hidden",marginBottom:14,border:`1px solid ${C.border}`}}>
                  <div style={{height:"100%",width:`${(doneMissions/missions.length)*100}%`,background:`linear-gradient(90deg,${C.green}66,${C.green})`,borderRadius:3,transition:"width 0.6s",boxShadow:`0 0 10px ${C.green}`}}/>
                </div>
                {missions.slice(0,4).map((m,i)=>{
                  const wL=m.id===3&&water<8&&!m.done;
                  return(
                    <div key={m.id} onClick={()=>completeMission(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<3?`1px solid ${C.bg}`:"none",cursor:wL?"not-allowed":"pointer",opacity:m.done?0.38:1,transition:"all 0.4s",transform:completedAnim===i?"scale(1.02)":"scale(1)",animation:completedAnim===i?"mission-complete-glow 0.7s ease":"none"}}>
                      <div style={{width:26,height:26,border:`2px solid ${m.done?C.green:m.difficulty==="epic"?C.purple:C.border}`,borderRadius:8,background:m.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:m.done?"#000":m.difficulty==="epic"?C.purple:C.muted,fontWeight:900,flexShrink:0,transition:"all 0.4s",boxShadow:m.done?`0 0 12px ${C.green}`:""}}>{m.done?"✓":m.icon}</div>
                      <span style={{fontSize:13,flex:1,color:m.done?"#94a3b8":C.text,fontWeight:m.done?400:500}}>{m.title}{wL?<span style={{fontSize:10,color:C.muted,marginLeft:6}}>(llena el tanque)</span>:""}</span>
                      {m.difficulty==="epic"&&!m.done&&<span style={{fontSize:9,color:C.purple,background:C.purple+"15",borderRadius:5,padding:"2px 6px",fontWeight:700}}>ÉPICA</span>}
                      <span style={{fontSize:11,color:C.green,fontWeight:700,flexShrink:0}}>+{m.xp}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {tab==="mapa"&&(
          <div style={{maxWidth:700,margin:"0 auto",padding:"16px 14px 40px"}}>
            <p style={{fontSize:13,color:C.muted,marginBottom:16}}>Tu nave avanza entre planetas al subir de nivel. Toca cada planeta para detalles.</p>
            <PlanetMap level={player.level} playerName={player.name} archetype={player.archetype}/>
            <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:12}}>TODOS LOS PLANETAS</div>
            {MAP_STAGES.map(stage=>{const unlocked=player.level>=stage.minLevel,isCurrent=stage.id===MAP_STAGES[MAP_STAGES.findLastIndex(s=>player.level>=s.minLevel)]?.id;return(<div key={stage.id} style={{background:C.card,border:`1px solid ${isCurrent?stage.color+"55":unlocked?stage.color+"22":C.border}`,borderRadius:14,padding:"12px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:14,opacity:unlocked?1:0.5,boxShadow:isCurrent?`0 0 20px ${stage.color}18`:"none"}}><div style={{width:40,height:40,borderRadius:12,background:unlocked?stage.color+"20":C.bg,border:`1px solid ${unlocked?stage.color+"44":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{stage.planet}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}><span style={{fontSize:14,color:unlocked?C.text:C.muted,fontWeight:600}}>{stage.label}</span>{isCurrent&&<span style={{fontSize:9,color:stage.color,background:stage.color+"18",borderRadius:5,padding:"2px 8px"}}>ACTUAL</span>}{!unlocked&&<span style={{fontSize:9,color:C.muted}}>🔒 Nv.{stage.minLevel}</span>}</div><div style={{fontSize:11,color:C.muted}}>{stage.sublabel}</div></div>{unlocked&&<div style={{fontSize:18,color:stage.color}}>✓</div>}</div>);})}
          </div>
        )}

        {tab==="misiones"&&<MissionsScreen missions={missions} completeMission={completeMission} completedAnim={completedAnim} attrs={attrs} arc={arc} water={water} addXP={addXP} extraMissions={extraMissions} setExtraMissions={setExtraMissions}/>}
        {tab==="metas"&&<MetasScreen customGoals={customGoals} setCustomGoals={setCustomGoals} addXP={addXP} badHabits={badHabits} setBadHabits={setBadHabits}/>}
        {tab==="artefactos"&&(
          <div style={{maxWidth:660,margin:"0 auto",padding:"0 0 60px"}}>
            <div style={{padding:"0 14px"}}><p style={{fontSize:13,color:C.muted,marginBottom:16,marginTop:8}}>Equipa artefactos para potenciar tus atributos. Se desbloquean al subir de nivel.</p><ArsenalScreen level={player.level} equipped={equipped} setEquipped={setEquipped} addXP={addXP} attrs={attrs}/></div>
          </div>
        )}
        {tab==="logros"&&<div style={{maxWidth:660,margin:"0 auto",padding:"0 0 60px"}}><div style={{padding:"0 14px"}}><p style={{fontSize:13,color:C.muted,marginBottom:16,marginTop:8}}>{unlockedAchievements.length}/{ACHIEVEMENTS.length} desbloqueados</p><AchievementsScreen stats={{level:player.level,streak:player.streak,totalXP,epicDone,attrs,totalMissions:totalMissionsCompleted,waterCompleted,moodDays,dayPerfect,equippedCount:equipped.length}} unlockedAchievements={unlockedAchievements}/></div></div>}
        {tab==="salud"&&(
          <div style={{maxWidth:660,margin:"0 auto",padding:"16px 14px 60px"}}>
            <div style={{background:C.orange+"08",border:`1px solid ${C.orange}30`,borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#94a3b8",lineHeight:1.75}}>⚕️ <strong style={{color:C.orange}}>Aviso:</strong> Contenido informativo. No reemplaza consulta médica.</div>
            {bmi&&<div style={{background:C.card,border:`1px solid ${bmiColor}44`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:`0 0 24px ${bmiColor}18`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,color:C.muted,letterSpacing:2,marginBottom:4}}>IMC</div><div style={{fontFamily:"'Cinzel',serif",fontSize:36,color:bmiColor}}>{bmi}</div><div style={{fontSize:12,color:bmiColor,marginTop:4}}>{bmiLabel}</div></div><div style={{fontSize:12,color:C.muted,lineHeight:2.4,textAlign:"right"}}><div>Peso <span style={{color:"#94a3b8"}}>{profile.weight}kg</span></div><div>Talla <span style={{color:"#94a3b8"}}>{profile.height}cm</span></div><div>Agua <span style={{color:C.green}}>{waterGoal}L/día</span></div></div></div></div>}
            <div style={{fontSize:9,color:C.muted,letterSpacing:3,marginBottom:12,marginTop:8}}>PLAN FÍSICO</div>
            {[profile.goals.includes("Perder peso")&&{icon:"🚶",t:"Cardio moderado",d:"30 min de caminata rápida. Zona 60-70% FC máx.",f:"5x/sem",c:C.green},profile.goals.includes("Ganar músculo")&&{icon:"💪",t:"Entrenamiento de fuerza",d:"3-4 series de 8-12 reps. El descanso es igual de importante.",f:"3x/sem",c:C.cta},{icon:"🧘",t:"Movilidad",d:"15 min de estiramientos diarios. Reduce lesiones.",f:"Diario",c:C.purple},{icon:"💧",t:`Meta: ${waterGoal}L agua`,d:"33ml por kg de peso corporal distribuidos durante el día.",f:"Diario",c:C.green}].filter(Boolean).map((p,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${p.c}30`,borderRadius:14,padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${p.c}`}}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:20,flexShrink:0}}>{p.icon}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.t}</div><span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span></div><div style={{fontSize:12,color:C.muted,lineHeight:1.75}}>{p.d}</div></div></div></div>
            ))}
          </div>
        )}
        {tab==="mente"&&(
          <div style={{maxWidth:660,margin:"0 auto",padding:"16px 14px 60px"}}>
            <div style={{background:C.card,border:`1px solid ${C.green}44`,borderRadius:16,padding:"16px 18px",marginBottom:12,boxShadow:`0 0 24px ${C.green}18`}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:8}}>RESPIRACIÓN 4-7-8</div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.85,marginBottom:12}}>Activa el nervio vago y cambia el sistema nervioso a parasimpático en minutos. <em>Inhala 4s · Sostén 7s · Exhala 8s</em></p>
              {breathActive?(<div style={{textAlign:"center",padding:"12px 0"}}><div style={{width:88,height:88,borderRadius:"50%",border:`2px solid ${C.green}`,background:C.green+"10",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 30px ${C.green}88`,animation:breathPhase==="inhala"?"expand 4s ease forwards":breathPhase==="exhala"?"contract 8s ease forwards":"none"}}><span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:C.green,textTransform:"uppercase",letterSpacing:2}}>{breathPhase}</span></div><button onClick={stopBreath} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 20px",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Detener</button></div>):<button onClick={startBreath} style={{width:"100%",background:C.green,border:"none",borderRadius:12,padding:"13px",color:"#000",fontFamily:"'Cinzel',serif",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:`0 0 20px ${C.green}44`}}>Iniciar respiración</button>}
            </div>
            {[{icon:"🧠",t:"Meditación matutina",d:"10 min al despertar. JAMA 2014: reduce ansiedad y depresión.",f:"Mañana",c:C.purple},{icon:"✍️",t:"Journaling de gratitud",d:"3 cosas buenas de hoy. Emmons 2003: 25% más bienestar.",f:"Noche",c:C.cta},{icon:"🌑",t:"Desconexión digital",d:"1h sin redes. U. Penn 2018: reduce soledad y depresión.",f:"Diario",c:C.green},{icon:"🌅",t:"Luz solar matutina",d:"10-15 min antes de las 10AM. Regula cortisol y prepara melatonina.",f:"Mañana",c:C.orange}].map((p,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${p.c}25`,borderRadius:14,padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${p.c}`}}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:20,flexShrink:0}}>{p.icon}</span><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}><div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.t}</div><span style={{fontSize:10,background:p.c+"22",color:p.c,borderRadius:20,padding:"3px 10px",fontWeight:700,flexShrink:0,marginLeft:8}}>{p.f}</span></div><div style={{fontSize:12,color:C.muted,lineHeight:1.8}}>{p.d}</div></div></div></div>
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
  /* v9: dopamine animations */
  @keyframes particle-burst{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0);}}
  @keyframes mission-complete-glow{0%{box-shadow:0 0 0 0 #10B98166;}50%{box-shadow:0 0 0 12px #10B98122;}100%{box-shadow:0 0 0 0 #10B98100;}}
  @keyframes streak-bounce{0%,100%{transform:scale(1);}30%{transform:scale(1.18);}60%{transform:scale(0.94);}}
  @keyframes bubble-pop{0%{opacity:0;transform:scale(0.7) translateY(6px);}60%{transform:scale(1.04);}100%{opacity:1;transform:scale(1) translateY(0);}}
  @keyframes hero-slide-in{0%{opacity:0;transform:translateY(24px);}100%{opacity:1;transform:translateY(0);}}
  @keyframes dot-typing{0%,60%,100%{opacity:0.3;}30%{opacity:1;}}
  @keyframes intro-fade{0%{opacity:0;transform:scale(0.96);}100%{opacity:1;transform:scale(1);}}
  @media(max-width:600px){
    div[style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    div[style*="auto-fit, minmax(230"]{grid-template-columns:1fr!important;}
    div[style*="auto-fill, minmax(148"]{grid-template-columns:1fr 1fr!important;}
  }
`;
