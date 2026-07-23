'use strict';
if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()));
if('caches'in window)caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));

const data=window.MUCHA_MAP_DATA;
const sections=data.sections;
const byId=id=>sections.find(s=>s.id===id);
const qs=s=>document.querySelector(s);
const qsa=s=>[...document.querySelectorAll(s)];

qs('#versionBadge').textContent=`v${data.meta.version}`;
qs('#appVersion').textContent=`v${data.meta.version}`;
qs('#buildDate').textContent=data.meta.buildDate.split('-').reverse().join('.');

const sidebar=qs('#sidebar'),backdrop=qs('#backdrop');
const openSidebar=()=>{sidebar.classList.add('open');backdrop.classList.add('show')};
const closeSidebar=()=>{sidebar.classList.remove('open');backdrop.classList.remove('show')};
qs('#menuButton').onclick=openSidebar;qs('#closeSidebar').onclick=closeSidebar;backdrop.onclick=closeSidebar;

const referenceDialog=qs('#referenceDialog');
function openReferences(section){
 qs('#dialogTitle').textContent=section.title;qs('#dialogSubtitle').textContent=section.subtitle;
 const figures=section.refs.map(([src,caption])=>`<figure><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption}</figcaption></figure>`).join('');
 qs('#gallery').innerHTML=`<div class="official-link"><a href="${section.officialUrl}" target="_blank" rel="noopener">Offizielle Hege6-Seite öffnen ↗</a></div>${figures}`;
 referenceDialog.showModal();
}
qs('#closeDialog').onclick=()=>referenceDialog.close();
referenceDialog.onclick=e=>{if(e.target===referenceDialog)referenceDialog.close()};
const infoDialog=qs('#infoDialog');
qs('#infoButton').onclick=()=>infoDialog.showModal();qs('#rulesButton').onclick=()=>infoDialog.showModal();
qs('[data-close-dialog]').onclick=()=>infoDialog.close();

function setRuntimeStatus(text,state='loading'){const el=qs('#gisRuntimeStatus');el.textContent=text;el.dataset.state=state}
function popupHtml(title,note,sectionId,status,meta=''){
 const badge=status==='allowed'?'GIS-ANGELBEREICH':'GIS-VERIFIZIERT';
 return `<div class="popup-badge ${status==='warning'?'warning':''}">${badge}</div><div class="popup-title">${title}</div><div class="popup-copy">${note}${meta?`<br><span class="popup-meta">${meta}</span>`:''}<br><strong>Final mit Originalunterlagen abgleichen.</strong></div><button class="popup-button" data-section="${sectionId}">Unterlagen ansehen</button>`;
}
const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.nchc.org.tw/api/interpreter'];
function buildWaterQuery(s){const[a,b,c,d]=s.bbox;return `[out:json][timeout:30];(way["waterway"~"${s.types.join('|')}"]["name"~"${s.nameRegex}",i](${a},${b},${c},${d}););out geom;`}
function buildStructureQuery(p){const[a,b,c,d]=p.searchBbox;return `[out:json][timeout:30];(node["waterway"~"weir|lock_gate|dam"](${a},${b},${c},${d});way["waterway"~"weir|lock_gate|dam"](${a},${b},${c},${d});relation["waterway"~"weir|lock_gate|dam"](${a},${b},${c},${d});node["lock"="yes"](${a},${b},${c},${d});way["lock"="yes"](${a},${b},${c},${d});relation["lock"="yes"](${a},${b},${c},${d});way["natural"="water"]["name"~"Schleuse|Wehr",i](${a},${b},${c},${d}););out center tags;`}
async function fetchOverpass(query){let err;for(const endpoint of endpoints){try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:`data=${encodeURIComponent(query)}`});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(e){err=e}}throw err||new Error('Overpass unavailable')}
function toLines(payload){return(payload.elements||[]).filter(x=>x.type==='way'&&x.geometry?.length>1).map(x=>({id:x.id,coordinates:x.geometry.map(p=>[p.lat,p.lon])}))}
function toStructureCandidates(payload){return(payload.elements||[]).map(x=>{const lat=x.lat??x.center?.lat,lon=x.lon??x.center?.lon;if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;return{id:`${x.type}/${x.id}`,latlng:[lat,lon],tags:x.tags||{}}}).filter(Boolean)}
async function loadCached(key,query,ttl=604800000){try{const c=JSON.parse(localStorage.getItem(key));if(c?.savedAt>Date.now()-ttl&&c.payload)return c.payload}catch(_){ }const payload=await fetchOverpass(query);try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),payload}))}catch(_){ }return payload}
function distanceM(a,b){const R=6371000,toRad=x=>x*Math.PI/180;const dLat=toRad(b[0]-a[0]),dLon=toRad(b[1]-a[1]);const s=Math.sin(dLat/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(s))}
function nearestCandidate(anchor,candidates){return candidates.map(c=>({...c,distance:distanceM(anchor,c.latlng)})).sort((a,b)=>a.distance-b.distance)[0]||null}

function initMap(){
 if(typeof L==='undefined'){qs('#loadError').hidden=false;return}
 const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap-Mitwirkende'});
 const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}.png',{maxZoom:19,attribution:'Tiles &copy; Esri'});
 const labels=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{x}/{y}.png',{maxZoom:19,opacity:.8});
 const savedBase=localStorage.getItem('muchagio-base-map')||'satellite';
 const map=L.map('map',{layers:savedBase==='satellite'?[satellite,labels]:[street],zoomControl:false,preferCanvas:true}).setView([49.073,9.165],11);
 window.appMap=map;
 const unverifiedLayer=L.layerGroup(),allowedLayer=L.layerGroup().addTo(map),structureLayer=L.layerGroup().addTo(map);
 const allBounds=L.latLngBounds([]);
 const structureIcon=L.divIcon({className:'',html:'<div class="review-pin"><span>⌁</span></div>',iconSize:[34,34],iconAnchor:[17,17]});

 function showDetail(p,position,verification){qs('#detailTitle').textContent=p.title;qs('#detailLocation').textContent=`⌖ ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`;qs('#detailNote').textContent=p.note;qs('#detailAccuracy').textContent=p.accuracy;qs('#detailSource').textContent=`${p.source}${verification?` · ${verification}`:''}`;qs('#detailCard').classList.remove('hidden');qs('#detailDocs').onclick=()=>openReferences(byId(p.sectionId))}
 qs('#closeDetail').onclick=()=>qs('#detailCard').classList.add('hidden');

 setRuntimeStatus('GIS-Wassergeometrien und Bauwerke werden geprüft …');
 const waterJobs=data.osmWaterSources.map(async source=>{const payload=await loadCached(`muchagio-water-${data.meta.version}-${source.id}`,buildWaterQuery(source));const lines=toLines(payload);if(!lines.length)throw new Error(`Keine Gewässergeometrie: ${source.id}`);lines.forEach(line=>{line.coordinates.forEach(p=>allBounds.extend(p));L.polyline(line.coordinates,{color:'#052d20',weight:22,opacity:.55,lineCap:'round',lineJoin:'round'}).addTo(allowedLayer);L.polyline(line.coordinates,{color:'#49e59d',weight:6,opacity:.98,lineCap:'round',lineJoin:'round'}).addTo(allowedLayer).bindPopup(popupHtml(source.title,source.note,source.sectionId,'allowed'))});return source.id});
 const structureJobs=data.structurePoints.map(async p=>{let position=null,verification='';try{const payload=await loadCached(`muchagio-structure-${data.meta.version}-${p.id}`,buildStructureQuery(p));const hit=nearestCandidate(p.anchor,toStructureCandidates(payload));if(hit&&hit.distance<=p.maxDistanceM){position=hit.latlng;verification=`OSM ${hit.id}, Abstand zum Suchanker ${Math.round(hit.distance)} m`}}catch(_){ }
  if(!position&&p.fallbackVerified&&p.fallback){position=p.fallback;verification='verifizierte OSM-Fallbackposition'}
  if(!position)return{shown:false,id:p.id};
  const m=L.marker(position,{icon:structureIcon,zIndexOffset:700}).addTo(structureLayer).bindTooltip(p.title,{direction:'top',offset:[0,-15]});m.on('click',()=>showDetail(p,position,verification));allBounds.extend(position);return{shown:true,id:p.id};
 });
 Promise.allSettled([...waterJobs,...structureJobs]).then(results=>{const waterOk=results.slice(0,waterJobs.length).filter(r=>r.status==='fulfilled').length;const structureResults=results.slice(waterJobs.length).filter(r=>r.status==='fulfilled').map(r=>r.value);const shown=structureResults.filter(r=>r.shown).length;const hidden=data.structurePoints.length-shown;setRuntimeStatus(`GIS aktiv: ${waterOk}/${waterJobs.length} Gewässerbereiche geladen. ${shown} Bauwerke verifiziert angezeigt; ${hidden} unverifizierte Punkte bewusst ausgeblendet.`,waterOk===waterJobs.length?'ok':'warning');if(allBounds.isValid())map.fitBounds(allBounds.pad(.05))});

 map.on('popupopen',e=>{const b=e.popup.getElement()?.querySelector('[data-section]');if(b)b.onclick=()=>openReferences(byId(b.dataset.section))});
 setTimeout(()=>map.invalidateSize(true),100);addEventListener('resize',()=>map.invalidateSize(false));
 qs('#allowedToggle').onchange=e=>e.target.checked?allowedLayer.addTo(map):map.removeLayer(allowedLayer);
 qs('#warningToggle').onchange=e=>e.target.checked?structureLayer.addTo(map):map.removeLayer(structureLayer);
 qs('#markerToggle').onchange=e=>e.target.checked?unverifiedLayer.addTo(map):map.removeLayer(unverifiedLayer);
 function setBase(name){qsa('[data-base]').forEach(b=>b.classList.toggle('active',b.dataset.base===name));qs('#baseLabel').textContent=name==='satellite'?'Satellit':'Karte';if(name==='satellite'){map.removeLayer(street);satellite.addTo(map);labels.addTo(map)}else{map.removeLayer(satellite);map.removeLayer(labels);street.addTo(map)}localStorage.setItem('muchagio-base-map',name)}
 qsa('[data-base]').forEach(b=>b.onclick=()=>setBase(b.dataset.base));setBase(savedBase);
 qs('#opacityRange').oninput=e=>{const v=+e.target.value;qs('#opacityValue').textContent=`${v} %`;allowedLayer.eachLayer(l=>l.setStyle&&l.setStyle({opacity:v/100}))};
 qs('#locateButton').onclick=()=>map.locate({setView:true,maxZoom:17,enableHighAccuracy:true});map.on('locationfound',e=>L.circleMarker(e.latlng,{radius:8,color:'#fff',weight:3,fillColor:'#3187ed',fillOpacity:1}).addTo(map).bindPopup('Dein Standort').openPopup());map.on('locationerror',()=>alert('Standort konnte nicht bestimmt werden.'));
 const select=qs('#sectionSelect');select.innerHTML=sections.map(s=>`<option value="${s.id}">${s.number} · ${s.shortTitle}</option>`).join('');let current=0;function go(i){current=(i+sections.length)%sections.length;const s=sections[current];select.value=s.id;map.flyTo(s.center,s.zoom,{duration:.8})}select.onchange=()=>{current=sections.findIndex(s=>s.id===select.value);go(current)};qs('#prevSection').onclick=()=>go(current-1);qs('#nextSection').onclick=()=>go(current+1);
 qs('#docsButton').onclick=()=>openReferences(sections[current]);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMap);else initMap();
