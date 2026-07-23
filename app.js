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
 const badge=status==='allowed'?'GIS-ANGELBEREICH':'PRÜFBEREICH';
 return `<div class="popup-badge ${status==='warning'?'warning':''}">${badge}</div><div class="popup-title">${title}</div><div class="popup-copy">${note}${meta?`<br><span class="popup-meta">${meta}</span>`:''}<br><strong>Final mit Originalunterlagen abgleichen.</strong></div><button class="popup-button" data-section="${sectionId}">Unterlagen ansehen</button>`;
}
const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.nchc.org.tw/api/interpreter'];
function buildQuery(s){const[a,b,c,d]=s.bbox;return `[out:json][timeout:30];(way["waterway"~"${s.types.join('|')}"]["name"~"${s.nameRegex}",i](${a},${b},${c},${d}););out geom;`}
async function fetchOverpass(query){let err;for(const endpoint of endpoints){try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:`data=${encodeURIComponent(query)}`});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}catch(e){err=e}}throw err||new Error('Overpass unavailable')}
function toLines(payload){return(payload.elements||[]).filter(x=>x.type==='way'&&x.geometry?.length>1).map(x=>({id:x.id,coordinates:x.geometry.map(p=>[p.lat,p.lon])}))}
async function loadGeometry(source){const key=`muchagio-osm-${data.meta.version}-${source.id}`;try{const c=JSON.parse(localStorage.getItem(key));if(c?.savedAt>Date.now()-604800000&&c.lines?.length)return c.lines}catch(_){ }const lines=toLines(await fetchOverpass(buildQuery(source)));if(!lines.length)throw new Error('No geometry');try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),lines}))}catch(_){ }return lines}
function nearestPoint(target,lines){let best=target,bestD=Infinity;for(const line of lines)for(const p of line.coordinates){const d=(p[0]-target[0])**2+(p[1]-target[1])**2;if(d<bestD){bestD=d;best=p}}return best}

function initMap(){
 if(typeof L==='undefined'){qs('#loadError').hidden=false;return}
 const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap-Mitwirkende'});
 const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri'});
 const labels=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:.8});
 const savedBase=localStorage.getItem('muchagio-base-map')||'satellite';
 const map=L.map('map',{layers:savedBase==='satellite'?[satellite,labels]:[street],zoomControl:false,preferCanvas:true}).setView([49.073,9.165],11);
 window.appMap=map;
 const markerLayer=L.layerGroup().addTo(map),allowedLayer=L.layerGroup().addTo(map),warningLayer=L.layerGroup().addTo(map);
 const allBounds=L.latLngBounds([]),waterBySource={},reviewMarkers={};
 const sectionIcon=n=>L.divIcon({className:'',html:`<div class="map-pin"><span>${n}</span></div>`,iconSize:[42,42],iconAnchor:[21,38]});
 const reviewIcon=L.divIcon({className:'',html:'<div class="review-pin"><span>✓</span></div>',iconSize:[34,34],iconAnchor:[17,17]});
 sections.forEach(s=>{allBounds.extend(s.center);L.marker(s.center,{icon:sectionIcon(s.number)}).addTo(markerLayer).bindPopup(`<div class="popup-badge">${s.number}</div><div class="popup-title">${s.title}</div><div class="popup-copy">${s.subtitle}</div><button class="popup-button" data-section="${s.id}">Unterlagen ansehen</button>`) });
 data.reviewPoints.forEach(p=>{const m=L.marker(p.center,{icon:reviewIcon,zIndexOffset:600}).addTo(warningLayer).bindTooltip(p.title,{direction:'top',offset:[0,-15]});reviewMarkers[p.id]=m;m.on('click',()=>showDetail(p));allBounds.extend(p.center)});
 function showDetail(p){qs('#detailTitle').textContent=p.title;qs('#detailNote').textContent=p.note;qs('#detailAccuracy').textContent=p.accuracy;qs('#detailSource').textContent=p.source;qs('#detailCard').classList.remove('hidden');qs('#detailDocs').onclick=()=>openReferences(byId(p.sectionId))}
 qs('#closeDetail').onclick=()=>qs('#detailCard').classList.add('hidden');
 setRuntimeStatus('GIS-Wassergeometrien werden geladen …');
 Promise.allSettled(data.osmWaterSources.map(async source=>{const lines=await loadGeometry(source);waterBySource[source.id]=lines;lines.forEach(line=>{line.coordinates.forEach(p=>allBounds.extend(p));L.polyline(line.coordinates,{color:'#052d20',weight:22,opacity:.55,lineCap:'round',lineJoin:'round'}).addTo(allowedLayer);L.polyline(line.coordinates,{color:'#49e59d',weight:6,opacity:.98,lineCap:'round',lineJoin:'round'}).addTo(allowedLayer).bindPopup(popupHtml(source.title,source.note,source.sectionId,'allowed'))});data.reviewPoints.filter(p=>p.sourceId===source.id).forEach(p=>{const snapped=nearestPoint(p.center,lines);reviewMarkers[p.id].setLatLng(snapped);p.renderCenter=snapped});return source})).then(results=>{const ok=results.filter(r=>r.status==='fulfilled').length;setRuntimeStatus(ok?`GIS aktiv: ${ok}/${results.length} Gewässerbereiche geladen. Prüfpunkte wurden an die Gewässergeometrie ausgerichtet.`:'GIS-Daten konnten nicht geladen werden.',ok===results.length?'ok':'warning');if(ok)map.fitBounds(allBounds.pad(.06))});
 map.on('popupopen',e=>{const b=e.popup.getElement()?.querySelector('[data-section]');if(b)b.onclick=()=>openReferences(byId(b.dataset.section))});
 map.fitBounds(allBounds.pad(.06));setTimeout(()=>map.invalidateSize(true),100);addEventListener('resize',()=>map.invalidateSize(false));
 qs('#allowedToggle').onchange=e=>e.target.checked?allowedLayer.addTo(map):map.removeLayer(allowedLayer);
 qs('#warningToggle').onchange=e=>e.target.checked?warningLayer.addTo(map):map.removeLayer(warningLayer);
 qs('#markerToggle').onchange=e=>e.target.checked?markerLayer.addTo(map):map.removeLayer(markerLayer);
 function setBase(name){qsa('[data-base]').forEach(b=>b.classList.toggle('active',b.dataset.base===name));qs('#baseLabel').textContent=name==='satellite'?'Satellit':'Karte';if(name==='satellite'){map.removeLayer(street);satellite.addTo(map);labels.addTo(map)}else{map.removeLayer(satellite);map.removeLayer(labels);street.addTo(map)}localStorage.setItem('muchagio-base-map',name)}
 qsa('[data-base]').forEach(b=>b.onclick=()=>setBase(b.dataset.base));setBase(savedBase);
 qs('#opacityRange').oninput=e=>{const v=+e.target.value;qs('#opacityValue').textContent=`${v} %`;allowedLayer.eachLayer(l=>l.setStyle&&l.setStyle({opacity:v/100}))};
 qs('#locateButton').onclick=()=>map.locate({setView:true,maxZoom:17,enableHighAccuracy:true});map.on('locationfound',e=>L.circleMarker(e.latlng,{radius:8,color:'#fff',weight:3,fillColor:'#3187ed',fillOpacity:1}).addTo(map).bindPopup('Dein Standort').openPopup());map.on('locationerror',()=>alert('Standort konnte nicht bestimmt werden.'));
 const select=qs('#sectionSelect');select.innerHTML=sections.map(s=>`<option value="${s.id}">${s.number} · ${s.shortTitle}</option>`).join('');let current=0;function go(i){current=(i+sections.length)%sections.length;const s=sections[current];select.value=s.id;map.flyTo(s.center,s.zoom,{duration:.8})}select.onchange=()=>{current=sections.findIndex(s=>s.id===select.value);go(current)};qs('#prevSection').onclick=()=>go(current-1);qs('#nextSection').onclick=()=>go(current+1);
 qs('#docsButton').onclick=()=>openReferences(sections[current]);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMap);else initMap();
