
"use strict";
const $=s=>document.querySelector(s);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DS=[
{id:"hp-user",model:"HP",title:"TS2000-HP · User Manual",type:"User manual",rev:"REV 2.1 — 06/2025",file:"PROBER-MPI-TS2000-HP_UG_REV 2.1 AST-UG-013.pdf",count:34},
{id:"hp-sheet",model:"HP",title:"TS2000-HP · Data Sheet",type:"Data sheet",rev:"AST-AS-0172-02 — 04/2025",file:"PROBER-MPI-TS2000-HP-Automated-Probe-System-Data-Sheet.pdf",count:14},
{id:"hp-dim",model:"HP",title:"TS2000-HP · Physical Dimensions",type:"Drawing",rev:"AST-AS-0172-02 — page 14",file:"14_MPI TS 2000 HP lyMPI-TS2000-HP-Automated-Probe-System-Data-Sheet.pdf",count:1},
{id:"family-maint",model:"FAMILY",title:"TS2000 / D / DP · Maintenance Manual",type:"Maintenance",rev:"REV 1.1 — 07/2026",file:"PROBER-MPI-TS2000 maint.pdf",count:15}
];
const PARTS=[
["light","Light curtain","Access protection during high-voltage probing.","User manual describes a front light curtain which interlocks power to high-power test instrumentation when breached. Never bypass.","hp-user",9,"Safety"],
["emo","Emergency stop (EMO)","Emergency-stop behavior.","Manual specifies motor power and optional chiller shutdown, but notes that station PC, cameras, monitor and other components may remain powered. EMO is NOT full isolation.","hp-user",9,"Safety"],
["doors","Operating / service doors","Authorization boundary for access.","Operating doors are distinct from maintenance doors. Maintenance access is reserved for service personnel.","hp-user",8,"Safety"],
["chuck","Chuck & stages","Programmable XY, Z and theta movements.","XY travel 210 × 300 mm and Z travel 50 mm in data sheet. Installed options must be confirmed.","hp-sheet",1,"Motion"],
["scope","Microscope","Optical positioning and movement.","See detailed microscope movement and microscope sections.","hp-user",11,"Optics"],
["platen","Probe platen","Probe mounting environment.","Nickel plated steel; data sheet mentions integrated Air-Cool platen control.","hp-sheet",3,"Mechanics"],
["shielde","ShielDEnvironment","EMI/light-tight measurement enclosure.","The shielded test environment includes an interlocked front access door.","hp-user",9,"Environment"],
["shieldc","ShielDCap","Electrical/RF connections.","Described as accommodating RF and DC/Kelvin port configurations.","hp-user",9,"Interfaces"],
["loader","Wafer loader","Automated wafer handling.","Data sheet describes 100 mm, 150 mm and 200 mm wafer loading, configuration-dependent.","hp-sheet",6,"Handling"],
["panel","Control panel","Local/remote and navigation.","Control panel is documented in a separate section, including load/unload and navigator functions.","hp-user",27,"Controls"]
];
const GUIDES=[
["Safety & EMO","hp-user",9,"Safety critical","Review EMO behavior, including which subsystems remain energized. Follow emergency procedures and site HSE instructions."],
["Light curtain / interlock","hp-user",9,"Safety critical","Review documented protection and interlock logic. Never bypass safety systems."],
["Startup controls","hp-user",9,"Trained operator","Refer to circuit breakers and ON/OFF control descriptions. Confirm authorization and site procedures."],
["Microscope movement","hp-user",11,"Trained operator","Use documented microscope movement section and confirm hardware variant."],
["MicroPositioner setup","hp-user",15,"Trained operator","Follow the manufacturer's MicroPositioner Setup and Control section."],
["Chuck conditioning","hp-user",22,"Controlled procedure","Use the complete manufacturer procedure; do not infer settings, timing or conditions."],
["HMI control panel","hp-user",27,"Trained operator","Consult control panel section (including separately numbered pages)."],
["Physical clearance","hp-dim",1,"Engineering reference","Check dimensioned drawings and installed optional components."],
["Lubrication (TS2000 family ONLY)","family-maint",7,"Model restricted","These procedures are for TS2000, TS2000-D and TS2000-DP; do not transfer to HP."],
["Energy isolation / LOTO (TS2000 family)","family-maint",5,"Safety critical","Maintenance manual requires isolation, zero-energy verification and residual-pressure release before maintenance."]
];
const TASKS=[
["Covers, aluminum plate, probe platen","Customer",6,"Cleaning and inspection as specified by maintenance manual."],
["Moving parts, linear scales","Customer",6,"Inspect/clean where necessary within permitted scope."],
["Vacuum and compressed air","Customer",6,"Check hoses/connectors and condition according to manual."],
["XY ball screw & linear guide","Customer",7,"Annual lubrication reference; verify lubricant on page 9."],
["ZT axis & Z ball spline","MPI service only",7,"Annual lubrication reserved to service representatives."],
["Chuck/microscope/platen leveling","MPI service only",6,"Adjustments reserved to service representatives."],
["Visual condition before use","Customer",10,"Inspect chuck, platen, positioners and microscope for contamination and damage."]
];
let view="home",model="HP",query="",selected=0,currentPage=null,localPdf={};
function getNotes(){try{let v=JSON.parse(localStorage.getItem("prober-service-notes")||"[]");return Array.isArray(v)?v:[]}catch(e){return []}}
function saveNotes(v){localStorage.setItem("prober-service-notes",JSON.stringify(v))}
function getChecks(){try{return JSON.parse(localStorage.getItem("prober-checks")||"{}")}catch(e){return {}}}
function toast(s){let el=$("#toast");el.textContent=s;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),3200)}
function pill(text,kind){return '<span class="tag '+(kind||"")+'">'+safe(text)+'</span>'}
function ref(id,page,label){return '<button class="ref" data-action="page" data-doc="'+safe(id)+'" data-page="'+page+'">↗ '+safe(label||"Manual · p."+page)+'</button>'}
function go(label,where,primary){return '<button class="button '+(primary?"primary":"ghost")+'" data-action="nav" data-view="'+where+'">'+label+'</button>'}
function section(title,desc){return '<div class="section-head"><h2>'+title+'</h2><p>'+desc+'</p></div>'}
function footer(){return '<div class="footer">PROBER Field Console · Technical reference test · No equipment control · The original manufacturer instructions and site safety policies take precedence.</div>'}
function heading(title,desc){return '<div class="label">TECHNICAL WORKSPACE / '+(model==="HP"?"TS2000-HP":"TS2000 / D / DP")+'</div><h1 style="font-size:36px">'+title+'</h1><p>'+desc+'</p>'}
function machineSvg(){return '<svg viewBox="0 0 650 330" role="img" aria-label="Disegno concettuale di probe station. Non è uno schema tecnico."><defs><linearGradient id="cabinet"><stop stop-color="#334c63"/><stop offset="1" stop-color="#162536"/></linearGradient></defs><ellipse cx="313" cy="310" rx="257" ry="17" fill="#030a13" opacity=".8"/><path d="M80 131H511V301H80Z" fill="url(#cabinet)" stroke="#57758a" stroke-width="3"/><path d="M96 172H497V285H96Z" fill="#172737" stroke="#2e455a" stroke-width="3"/><path d="M140 24H440V134H140Z" fill="#263d53" stroke="#5f8098" stroke-width="4"/><rect x="155" y="35" width="270" height="94" fill="#142a3b"/><path d="M168 35v94m244-94v94" stroke="#58dbb9" stroke-width="5" opacity=".77"/><path d="M271 43v88h-39" stroke="#8da7c0" stroke-width="11" fill="none"/><rect x="251" y="51" width="108" height="14" fill="#637b97"/><ellipse cx="298" cy="158" rx="95" ry="19" fill="#687d91" stroke="#b3cad5" stroke-width="3"/><ellipse cx="298" cy="157" rx="61" ry="9" fill="#21384a" stroke="#81bfb0"/><rect x="119" y="192" width="206" height="79" fill="#1f3044" stroke="#36546a"/><path d="M134 209h177m-177 21h177m-177 21h177" stroke="#314c65" stroke-width="9"/><rect x="369" y="192" width="113" height="82" fill="#304356" stroke="#59798d"/><circle cx="460" cy="209" r="10" fill="#d47782"/><rect x="390" y="229" width="74" height="15" fill="#133549" stroke="#6199af"/><rect x="510" y="54" width="113" height="93" fill="#152d45" stroke="#7796af" stroke-width="6"/><rect x="524" y="69" width="84" height="62" fill="#294c65"/><path d="M532 119l20-21 12 11 15-25 22 22" stroke="#5bdabc" stroke-width="4" fill="none"/><path d="M567 147v65m-31 0h64" stroke="#6d89a3" stroke-width="7"/><rect x="78" y="296" width="436" height="14" fill="#52687b"/><text x="102" y="157" fill="#f4d476" font-size="15" font-weight="800" font-family="sans-serif">MPI TS2000-HP</text></svg>'}
function familyHome(){
return heading('TS2000 family','Documentazione e manutenzione per TS2000, TS2000-D e TS2000-DP.')+
'<div class="panel alert">'+pill('NOT TS2000-HP','amber')+'<h2 style="margin:14px 0">Model-specific maintenance workspace</h2><p>Il Maintenance Manual Rev 1.1 riguarda esplicitamente TS2000, TS2000-D e TS2000-DP. Il materiale TS2000-HP e consultabile separatamente, senza trasferire istruzioni tra modelli.</p><div class="row" style="margin-top:14px">'+ref('family-maint',1,'Cover / model scope')+ref('family-maint',5,'LOTO precautions')+'</div></div>'+
section('TS2000 family resources','Accesso ai riferimenti documentali pertinenti.')+
'<div class="grid g3"><button class="panel panel-button" data-action="nav" data-view="maintenance"><div class="iconbox">▣</div><h3>Maintenance planner</h3><p>Checklist customer/service, periodicita e fonti.</p></button><button class="panel panel-button" data-action="nav" data-view="knowledge"><div class="iconbox">⌕</div><h3>Maintenance search</h3><p>Cerca su tutte le pagine del manuale di manutenzione.</p></button><button class="panel panel-button" data-action="nav" data-view="documents"><div class="iconbox">▥</div><h3>Source manual</h3><p>Consulta il testo e apri il PDF originale.</p></button></div>'+
section('Technical checkpoints','Riferimenti diretti al manuale Rev 1.1.')+
'<div class="grid g2"><div class="panel"><h3>Preventive maintenance</h3><p>Annual operational check, moving parts, vacuum/CDA and adjustments restricted to manufacturer service.</p>'+ref('family-maint',6,'Annual check · p.6')+'</div><div class="panel"><h3>Lubrication</h3><p>XY guide/ball screw, ZT axis and microscope scope differ by authorization. Verify lubricant selection in source pages.</p>'+ref('family-maint',7,'Lubrication · p.7')+' '+ref('family-maint',9,'Grease · p.9')+'</div></div>'+footer()
}
function familyExplorer(){
return heading('TS2000 family explorer','Subsystems from TS2000 / D / DP maintenance manual. This is NOT a TS2000-HP service procedure.')+
'<div class="grid g3">'+[
['XY axes','Ball screw / linear guide inspection and lubrication.',7],
['ZT/Z axis','Lubrication restricted to manufacturer service.',7],
['Microscope assembly','Manufacturer service lubrication and adjustment scope.',7],
['Linear scales','T-axis inspection and cleaning references.',6],
['Pneumatic / vacuum','Hose and connector inspection.',6],
['Wafer chuck & platen','Visual checks and manufacturer-service leveling.',6]
].map(x=>'<div class="panel"><div class="iconbox">◎</div><h3>'+x[0]+'</h3><p>'+x[1]+'</p><div style="margin-top:13px">'+ref('family-maint',x[2],'Source · p.'+x[2])+'</div></div>').join('')+'</div>'+footer()
}
function home(){if(model==='FAMILY')return familyHome();
const n=(window.MANUALS||[]).reduce((s,d)=>s+(d.pages||[]).length,0);
return '<section class="hero"><div class="hero-copy"><div class="label">EQUIPMENT ENGINEERING · DOCUMENT KNOWLEDGE</div><h1>Service intelligence.<br><em>At your fingertips.</em></h1><p>Un workspace per esplorare sistemi, leggere documentazione tecnica, cercare su ogni pagina e registrare osservazioni sul campo.</p><div class="row">'+go('Explore machine →','explorer',true)+go('⌕ Search knowledge','knowledge',false)+'</div></div><div class="hero-art">'+machineSvg()+'</div></section>'+
'<div class="grid g4" style="margin-top:16px">'+[['04','Source documents'],[n||64,'Pages indexed'],['10','Machine topics'],[getNotes().length,'Local service notes']].map(v=>'<div class="panel stat"><div class="stat-value">'+v[0]+'</div><small>'+v[1]+'</small><div class="bar"></div></div>').join('')+'</div>'+
section('Command center','Seleziona un ambiente di lavoro:')+
'<div class="grid g3">'+[['◎','Machine explorer','Componenti, safety boundaries e collegamenti alle fonti.','explorer'],['⌕','Knowledge search','Ricerca full-text, pagina e documento senza risposte inventate.','knowledge'],['▣','Maintenance','Checklists e differenziazione customer / service / modello.','maintenance']].map(v=>'<button class="panel panel-button" data-action="nav" data-view="'+v[3]+'"><div class="iconbox">'+v[0]+'</div><h3>'+v[1]+'</h3><p>'+v[2]+'</p></button>').join('')+'</div>'+
section('System at a glance','Dati da documentazione TS2000-HP; verificare la configurazione installata.')+
'<div class="grid g2"><div class="panel"><div class="between"><h3>Key specifications</h3>'+ref('hp-sheet',1)+'</div><table class="spec-table"><tr><td>Wafer size</td><td>200 mm class</td></tr><tr><td>Chuck XY travel</td><td>210 × 300 mm</td></tr><tr><td>XY resolution</td><td>0.5 μm</td></tr><tr><td>Chuck Z travel</td><td>50 mm</td></tr><tr><td>Chuck Z resolution</td><td>0.2 μm</td></tr><tr><td>High power capability*</td><td>Up to 10 kV / 600 A (pulse)</td></tr></table><p class="tiny">* System capability, NOT a recommended test setting.</p></div>'+
'<div class="panel alert">'+pill('CRITICAL SAFETY','amber')+' '+pill('MODEL MATCHING','red')+'<h3 style="margin-top:15px">Safety and provenance</h3><p>TS2000-HP may involve hazardous high voltage/current, hot/cold surfaces, stored pneumatic energy and moving parts. Station EMO is not a proof of complete energy isolation.</p><div class="divider"></div><p><b>Important:</b> the supplied maintenance manual specifically names TS2000, TS2000-D and TS2000-DP — not TS2000-HP. Its maintenance instructions are not automatically transferable.</p><div class="row" style="margin-top:14px">'+ref('hp-user',3,'HP Safety · p.3')+ref('family-maint',1,'Model scope · cover')+'</div></div></div>'+footer()
}
function explorer(){if(model==='FAMILY')return familyExplorer();
let a=PARTS[selected],chips=PARTS.map((p,i)=>'<button class="chip '+(i===selected?'active':'')+'" data-action="part" data-index="'+i+'">'+safe(p[1])+'</button>').join('');
return heading('Machine explorer','Navigazione dei sottosistemi per tema. Il disegno è illustrativo e non certificato.')+'<div class="grid g2"><div><div class="machine-map">'+machineSvg()+'</div><div class="chiplist">'+chips+'</div></div><div><div class="panel">'+pill(a[6],'blue')+'<h2 style="margin:15px 0 8px">'+safe(a[1])+'</h2><p>'+safe(a[2])+'</p><div class="divider"></div><p>'+safe(a[3])+'</p><div style="margin-top:18px">'+ref(a[4],a[5],'Apri fonte · p.'+a[5])+'</div></div><div class="panel alert" style="margin-top:14px"><h3>Engineering note</h3><p>Le informazioni sono riassunti navigabili, non istruzioni operative autonome. Consultare sempre il manuale completo e la configurazione effettiva dell’equipment.</p></div></div></div>'+footer()
}
function procedures(){
let list=GUIDES.filter(g=>model==='HP'?g[1]!=='family-maint':g[1]==='family-maint');
return heading('Procedure library','Percorsi verso sezioni documentate, non sostitutivi delle procedure originali.')+'<div class="grid g2"><div>'+list.map(g=>'<div class="panel" style="margin-bottom:12px"><div class="between"><h3>'+safe(g[0])+'</h3>'+pill(g[3],g[3].includes('Safety')?'red':'blue')+'</div><p>'+safe(g[4])+'</p><div style="margin-top:12px">'+ref(g[1],g[2],'Read source · p.'+g[2])+'</div></div>').join('')+'</div><div class="panel alert" style="align-self:start"><h2>Documented, never invented.</h2><p>Questa console non propone sequenze hardware inventate, bypass di interlock, setpoint elettrici o procedure di isolamento non verificate.</p><div class="divider"></div><h3>Workflow suggerito</h3><div class="line-item">01 · Identifica il modello e la configurazione.</div><div class="line-item">02 · Leggi la sezione completa del manuale.</div><div class="line-item">03 · Verifica training, autorizzazioni e sicurezza.</div><div class="line-item">04 · Registra soltanto le osservazioni effettive.</div></div></div>'+footer()
}
function maintenance(){
if(model==='HP')return heading('Maintenance','Compatibilità documentale per TS2000-HP')+'<div class="panel alert">'+pill('MODEL MISMATCH','red')+'<h2 style="margin:15px 0">Il manuale di manutenzione caricato non dichiara il modello HP.</h2><p>Copre espressamente MPI TS2000, TS2000-D e TS2000-DP. Non presento quelle operazioni come procedure approvate TS2000-HP. Per lubrificazioni, accessi e interventi della HP serve documentazione specifica o conferma MPI.</p><div class="row" style="margin-top:16px">'+ref('family-maint',1,'Verifica la copertina')+ref('hp-user',3,'Avvertenze HP')+'<button class="button" data-action="switch-family">Vedi checklist TS2000 / D / DP →</button></div></div>'+section('Available HP checks','Riferimenti di consultazione, non manutenzione eseguibile.')+'<div class="grid g2"><div class="panel"><h3>Safety systems</h3><p>Light Curtain, EMO, interlock e limiti di accesso alle porte.</p>'+ref('hp-user',9)+'</div><div class="panel"><h3>Configuration</h3><p>Specifiche tecniche, opzioni e physical dimensions.</p>'+ref('hp-sheet',1)+'</div></div>'+footer();
const c=getChecks(),n=TASKS.filter((t,i)=>c[i]).length;
return heading('Maintenance planner','Solo TS2000 / TS2000-D / TS2000-DP · Checklist di revisione documentale.')+
'<div class="panel alert">'+pill('SAFETY / LOTO','amber')+'<p style="margin-top:12px">La pagina 5 richiede arresto della macchina, spegnimento, sezionatore generale OFF, Lockout/Tagout, conferma zero energia e rilascio eventuale pressione residua prima della manutenzione. Seguire le regole di sito e le autorizzazioni.</p>'+ref('family-maint',5,'Maintenance · p.5')+'</div>'+
'<div class="panel" style="margin-top:15px"><div class="between"><h3>Review checklist · '+n+' / '+TASKS.length+'</h3><button class="button small ghost" data-action="reset">Reset</button></div><div class="progress" style="margin:12px 0 19px"><span style="width:'+(100*n/TASKS.length)+'%"></span></div>'+
TASKS.map((t,i)=>'<label class="check"><input type="checkbox" data-check="'+i+'" '+(c[i]?'checked':'')+'><span style="flex:1"><div class="between"><strong>'+safe(t[0])+'</strong>'+pill(t[1],t[1].includes('only')?'red':'blue')+'</div><small>'+safe(t[2]===7?'See annual maintenance frequency.':'Consult applicable maintenance schedule.')+' '+safe(t[3])+'</small><span style="display:inline-block;margin-top:7px">'+ref('family-maint',t[2],'p.'+t[2])+'</span></span></label>').join('')+
'<p class="tiny">La checkbox significa «riferimento revisionato», non «manutenzione effettuata».</p></div>'+footer()
}
function matches(q){
let terms=q.toLocaleLowerCase().trim().split(/\s+/).filter(x=>x.length>1);if(!terms.length)return [];
let res=[];for(let d of window.MANUALS||[]){for(let p of d.pages||[]){let t=(p.text||'').toLocaleLowerCase();if(terms.every(x=>t.includes(x))){let i=t.indexOf(terms[0]);res.push({doc:d,page:p,preview:p.text.slice(Math.max(0,i-105),Math.max(0,i-105)+420).replace(/\s+/g,' ')})}}}return res
}
function knowledge(){
let hits=matches(query).filter(x=>x.doc.model===model);
return heading('Knowledge search','Ricerca letterale nel testo delle pagine importate. Nessuna AI: ogni risultato punta a una fonte.')+
'<div class="panel"><label class="field-label" for="kbinput">Search documents, errors, mechanics, functions…</label><div class="row"><input id="kbinput" class="filter" placeholder="Light Curtain, interlock, grease…" value="'+safe(query)+'"><button class="button primary" data-action="submit-search">Search →</button></div><p class="tiny">Filtro documento: '+(model==='HP'?'TS2000-HP':'TS2000 / D / DP')+'. Per cambiare raccolta usa il selettore in alto.</p></div>'+
section(query?hits.length+' matches · '+safe(query):'Quick search','Ricerca in tutte le pagine della raccolta.')+
(query?(hits.length?'<div class="grid g2">'+hits.slice(0,100).map(x=>'<article class="article"><div class="between">'+pill(x.doc.type,'blue')+ref(x.doc.id,x.page.page,'Page '+x.page.page)+'</div><h3 style="margin-top:12px">'+safe(x.doc.title)+'</h3><p class="snippet">'+safe(x.preview)+'</p></article>').join('')+'</div>':'<div class="empty"><b>Nessun risultato</b>Prova meno parole oppure cambia modello.</div>'):'<div class="chiplist">'+['Light Curtain','EMO','interlock','microscope','micropositioner','chuck','pressure','grease','vacuum','XY stage','chiller','lubrication'].map(t=>'<button class="chip" data-action="search-preset" data-term="'+safe(t)+'">'+safe(t)+'</button>').join('')+'</div>')+
'<div class="panel" style="margin-top:22px"><h3>Source-verified search</h3><p>La struttura visiva di alcune tabelle, diagrammi e simboli di avvertimento può non essere rappresentata correttamente dal testo estratto. Per le decisioni tecniche apri sempre il PDF originale.</p></div>'+footer()
}
function documents(){
return heading('Document library','Manuali originali, provenienza, revisioni e collegamento a PDF locali.')+
'<div class="panel alert">'+pill('PUBLIC GITHUB','amber')+' '+pill('CONFIDENTIAL C','red')+'<p style="margin-top:13px">Il manuale utente è contrassegnato Confidential C e vieta copia o modifica senza autorizzazione. In un repository pubblico i contenuti sono accessibili anche a terzi e le eliminazioni non assicurano la rimozione di fork, cronologia o copie.</p></div>'+
DS.map(d=>'<div class="filecard"><div class="filebadge">PDF</div><div style="flex:1"><div class="row">'+pill(d.type,'blue')+pill(d.model==='HP'?'TS2000-HP':'TS2000 / D / DP',d.model==='HP'?'':'amber')+'</div><h3 style="margin-top:10px">'+safe(d.title)+'</h3><p>'+safe(d.rev)+' · '+d.count+' pages</p><div class="row">'+ref(d.id,1,'Indexed pages')+'<button class="button small" data-action="pdf" data-doc="'+d.id+'">Open original PDF</button><label class="button small ghost" style="cursor:pointer">Load local PDF<input class="file-picker" type="file" accept=".pdf,application/pdf" data-upload="'+d.id+'"></label></div></div></div>').join('')+
'<div class="panel"><h3>Local PDF support</h3><p>Un PDF caricato dal pulsante «Load local PDF» viene aperto soltanto dal browser locale senza essere trasmesso al server dell’app. Se il PDF viene aggiunto sotto <code>docs/</code> su GitHub, il lettore può aprire la versione pubblica.</p></div>'+footer()
}
function documentPage(){
let d=DS.find(x=>x.id===currentPage.doc);if(!d)return documents();
let k=(window.MANUALS||[]).find(x=>x.id===d.id),p=(k?.pages||[]).find(x=>x.page===currentPage.page);
return '<div class="row"><button class="button small ghost" data-action="back">← Back</button>'+pill(d.model==='HP'?'TS2000-HP':'TS2000 / D / DP',d.model==='HP'?'blue':'amber')+'</div><div style="margin-top:17px">'+heading(safe(d.title),'Extracted page '+currentPage.page+' / '+d.count+' · '+safe(d.rev))+'</div><div class="row" style="margin-bottom:15px"><button class="button primary" data-action="pdf" data-doc="'+d.id+'" data-page="'+currentPage.page+'">Open original PDF ↗</button><button class="button ghost small" data-action="prev">← Previous</button><button class="button ghost small" data-action="next">Next →</button></div><div class="panel"><div class="label">SOURCE PAGE / '+currentPage.page+'</div><div class="divider"></div><div class="doc-text">'+safe(p?.text||'Il testo di questa pagina non è disponibile nell’indice. Apri il PDF originale.')+'</div></div><div class="panel alert" style="margin-top:15px"><p>Testo estratto automaticamente: diagrammi, tabelle e impaginazione possono perdere accuratezza. Utilizza il documento originale per qualsiasi decisione operativa.</p></div>'+footer()
}
function logbook(){
let a=getNotes();
return heading('Service logbook','Note sul campo archiviate in localStorage del dispositivo, esportabili in JSON.')+
'<div class="grid g2"><div class="panel"><h3>New service note</h3><form id="service-form"><label class="field-label" for="n-title">Title</label><input id="n-title" required maxlength="120" class="textinput" name="title" placeholder="Es. Interlock inspection"><label class="field-label" for="n-body">Observation</label><textarea id="n-body" required maxlength="5000" class="textarea" name="body" placeholder="Observations, error code, test findings…"></textarea><label class="field-label" for="n-ref">Source reference (optional)</label><input id="n-ref" maxlength="160" class="textinput" name="ref" placeholder="User Manual Rev 2.1 p.9"><div class="row" style="margin-top:15px"><button class="button primary" type="submit">Save note</button><button class="button ghost" type="button" data-action="export">↓ Export JSON</button></div></form></div><div><div class="between"><h3>Saved notes · '+a.length+'</h3><button class="button small ghost" data-action="export">Export all</button></div>'+
(a.length?a.slice().reverse().map(n=>'<article class="article"><div class="between">'+pill(n.model==='HP'?'TS2000-HP':'TS2000 / D / DP','blue')+'<button class="button small warn" data-action="delete-note" data-id="'+safe(n.id)+'">Delete</button></div><h3 style="margin-top:11px">'+safe(n.title)+'</h3><small>'+safe(n.date)+'</small><p style="white-space:pre-wrap;margin:12px 0">'+safe(n.body)+'</p><div class="tiny">'+safe(n.ref)+'</div></article>').join(''):'<div class="empty"><b>No notes yet</b>Add an observation to start a local record.</div>')+'</div></div><div class="panel alert" style="margin-top:15px"><p>Questo registro non è un sistema ufficiale CMMS. Esporta le note periodicamente: la cancellazione dei dati del browser può rimuoverle.</p></div>'+footer()
}
function render(){
const views={home,explorer,procedures,maintenance,knowledge,documents,logbook,page:documentPage};$("#root").innerHTML=(views[view]||home)();
document.querySelectorAll('.nav-item').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false')});
const inp=$("#kbinput");if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter'){query=inp.value.trim();render()}});
const f=$("#service-form");if(f)f.addEventListener('submit',e=>{e.preventDefault();let data=new FormData(f),title=String(data.get('title')||'').trim(),body=String(data.get('body')||'').trim();if(!title||!body)return;saveNotes([...getNotes(),{id:Date.now()+'-'+Math.random().toString(36).slice(2),title,body,ref:String(data.get('ref')||''),model,date:new Date().toLocaleString('it-IT')}]);toast('Note saved locally');render()});
document.querySelectorAll('[data-upload]').forEach(input=>input.addEventListener('change',()=>{let file=input.files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith('.pdf'))return toast('Select a PDF file');let id=input.dataset.upload;if(localPdf[id])URL.revokeObjectURL(localPdf[id]);localPdf[id]=URL.createObjectURL(file);toast('Local PDF loaded: '+file.name)}))
}
function navigate(next){view=next;currentPage=null;render();scrollTo(0,0)}
async function openPdf(id,page){
let d=DS.find(x=>x.id===id);if(!d)return;let url=localPdf[id];if(!url){let u='docs/'+encodeURIComponent(d.file);try{let r=await fetch(u,{method:'HEAD'});if(r.ok)url=u}catch(e){}}
if(!url){toast('PDF not on GitHub. Load local PDF from Document library.');navigate('documents');return}
let link=document.createElement('a');link.href=url+'#page='+(Number(page)||1);link.target='_blank';link.rel='noopener noreferrer';document.body.appendChild(link);link.click();link.remove()
}
document.addEventListener('click',e=>{
const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
if(a==='nav')navigate(b.dataset.view);
if(a==='switch-family'){model='FAMILY';$("#model").value=model;render()}
if(a==='part'){selected=Number(b.dataset.index);render()}
if(a==='page'){currentPage={doc:b.dataset.doc,page:Number(b.dataset.page)||1,from:view==='page'?(currentPage?.from||'documents'):view};view='page';render();scrollTo(0,0)}
if(a==='back')navigate(currentPage?.from||'knowledge');
if(a==='prev'||a==='next'){let d=DS.find(x=>x.id===currentPage.doc);currentPage.page=Math.min(d.count,Math.max(1,currentPage.page+(a==='next'?1:-1)));render()}
if(a==='pdf')openPdf(b.dataset.doc,b.dataset.page);
if(a==='submit-search'){query=$("#kbinput")?.value.trim()||'';render()}
if(a==='search-preset'){query=b.dataset.term;navigate('knowledge')}
if(a==='reset'){if(confirm('Reset checklist documentale?')){localStorage.removeItem('prober-checks');render()}}
if(a==='delete-note'){if(confirm('Delete this local note?')){saveNotes(getNotes().filter(n=>n.id!==b.dataset.id));render()}}
if(a==='export'){let blob=new Blob([JSON.stringify({app:'PROBER Field Console',exported:new Date().toISOString(),notes:getNotes()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='prober-service-log.json';link.click();URL.revokeObjectURL(url)}
});
document.addEventListener('change',e=>{if(e.target.matches('[data-check]')){let o=getChecks();o[e.target.dataset.check]=e.target.checked;localStorage.setItem('prober-checks',JSON.stringify(o));render()}});
$("#model").addEventListener('change',e=>{model=e.target.value;render()});
$("#quick-search").addEventListener('keydown',e=>{if(e.key==='Enter'){query=e.target.value.trim();navigate('knowledge')}});
render();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
