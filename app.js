'use strict';
const APP_VERSION='0.9.2';

if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(registrations=>registrations.forEach(registration=>registration.unregister()));
}
if('caches' in window){
  caches.keys().then(keys=>keys.forEach(key=>caches.delete(key)));
}

const data=window.MUCHA_MAP_DATA;
const sections=data.sections;
const byId=id=>sections.find(section=>section.id===id);
const qs=selector=>document.querySelector(selector);
const qsa=selector=>[...document.querySelectorAll(selector)];

qs('#versionBadge').textContent=`v${APP_VERSION}`;
qs('#appVersion').textContent=`v${APP_VERSION}`;
qs('#buildDate').textContent=data.meta.buildDate.split('-').reverse().join('.');

const sidebar=qs('#sidebar');
const backdrop=qs('#backdrop');
const openSidebar=()=>{sidebar.classList.add('open');backdrop.classList.add('show')};
const closeSidebar=()=>{sidebar.classList.remove('open');backdrop.classList.remove('show')};
qs('#menuButton').onclick=openSidebar;
qs('#closeSidebar').onclick=closeSidebar;
backdrop.onclick=closeSidebar;

const referenceDialog=qs('#referenceDialog');
function openReferences(section){
  qs('#dialogTitle').textContent=section.title;
  qs('#dialogSubtitle').textContent=section.subtitle;
  const figures=section.refs.map(([src,caption])=>`<figure><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption}</figcaption></figure>`).join('');
  qs('#gallery').innerHTML=`<div class="official-link"><a href="${section.officialUrl}" target="_blank" rel="noopener">Offizielle Hege6-Seite öffnen ↗</a></div>${figures}`;
  referenceDialog.showModal();
}
qs('#closeDialog').onclick=()=>referenceDialog.close();
referenceDialog.onclick=event=>{if(event.target===referenceDialog)referenceDialog.close()};
const infoDialog=qs('#infoDialog');
qs('#infoButton').onclick=()=>infoDialog.showModal();
qs('#rulesButton').onclick=()=>infoDialog.showModal();
qs('[data-close-dialog]').onclick=()=>infoDialog.close();

function setRuntimeStatus(text,state='loading'){
  const element=qs('#gisRuntimeStatus');
  element.textContent=text;
  element.dataset.state=state;
}
function popupHtml(title,note,sectionId,status,meta=''){
  const badge=status==='allowed'?'GIS-ANGELBEREICH':'GIS-GEPRÜFT';
  return `<div class="popup-badge ${status==='warning'?'warning':''}">${badge}</div><div class="popup-title">${title}</div><div class="popup-copy">${note}${meta?`<br><span class="popup-meta">${meta}</span>`:''}<br><strong>Final mit Originalunterlagen abgleichen.</strong></div><button class="popup-button" data-section="${sectionId}">Unterlagen ansehen</button>`;
}

const endpoints=[
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter'
];
function buildWaterQuery(source){
  const [south,west,north,east]=source.bbox;
  return `[out:json][timeout:30];(way["waterway"~"${source.types.join('|')}"]["name"~"${source.nameRegex}",i](${south},${west},${north},${east}););out geom;`;
}
function buildStructureQuery(point){
  const [south,west,north,east]=point.searchBbox;
  return `[out:json][timeout:30];(node["waterway"~"weir|lock_gate|dam"](${south},${west},${north},${east});way["waterway"~"weir|lock_gate|dam"](${south},${west},${north},${east});relation["waterway"~"weir|lock_gate|dam"](${south},${west},${north},${east});node["lock"="yes"](${south},${west},${north},${east});way["lock"="yes"](${south},${west},${north},${east});relation["lock"="yes"](${south},${west},${north},${east});way["natural"="water"]["name"~"Schleuse|Wehr",i](${south},${west},${north},${east}););out center tags;`;
}
async function fetchOverpass(query){
  let lastError;
  for(const endpoint of endpoints){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:`data=${encodeURIComponent(query)}`});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return await response.json();
    }catch(error){lastError=error}
  }
  throw lastError||new Error('Overpass unavailable');
}
function toLines(payload){
  return (payload.elements||[])
    .filter(element=>element.type==='way'&&element.geometry?.length>1)
    .map(element=>({id:element.id,coordinates:element.geometry.map(point=>[point.lat,point.lon])}));
}
function toStructureCandidates(payload){
  return (payload.elements||[]).map(element=>{
    const lat=element.lat??element.center?.lat;
    const lon=element.lon??element.center?.lon;
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
    return {id:`${element.type}/${element.id}`,latlng:[lat,lon],tags:element.tags||{}};
  }).filter(Boolean);
}
async function loadCached(key,query,ttl=604800000){
  try{
    const cached=JSON.parse(localStorage.getItem(key));
    if(cached?.savedAt>Date.now()-ttl&&cached.payload)return cached.payload;
  }catch(_){ }
  const payload=await fetchOverpass(query);
  try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),payload}))}catch(_){ }
  return payload;
}
function distanceM(a,b){
  const R=6371000;
  const toRad=value=>value*Math.PI/180;
  const dLat=toRad(b[0]-a[0]);
  const dLon=toRad(b[1]-a[1]);
  const value=Math.sin(dLat/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(value));
}
function nearestCandidate(anchor,candidates){
  return candidates.map(candidate=>({...candidate,distance:distanceM(anchor,candidate.latlng)})).sort((a,b)=>a.distance-b.distance)[0]||null;
}
function nearestWaterPoint(point,coordinates){
  if(!coordinates?.length)return null;
  return coordinates.map(latlng=>({latlng,distance:distanceM(point,latlng)})).sort((a,b)=>a.distance-b.distance)[0]||null;
}

function initMap(){
  if(typeof L==='undefined'){qs('#loadError').hidden=false;return}
  const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap-Mitwirkende'});
  const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}.png',{maxZoom:19,attribution:'Tiles &copy; Esri'});
  const labels=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{x}/{y}.png',{maxZoom:19,opacity:.8});
  const savedBase=localStorage.getItem('muchagio-base-map')||'satellite';
  const map=L.map('map',{layers:savedBase==='satellite'?[satellite,labels]:[street],zoomControl:false,preferCanvas:true}).setView([49.073,9.165],11);
  window.appMap=map;

  const allowedLayer=L.layerGroup().addTo(map);
  const structureLayer=L.layerGroup().addTo(map);
  const reviewAreaLayer=L.layerGroup().addTo(map);
  const allBounds=L.latLngBounds([]);
  const waterCoordinatesBySection=new Map();
  const structureIcon=L.divIcon({className:'',html:'<div class="review-pin"><span>⌁</span></div>',iconSize:[34,34],iconAnchor:[17,17]});

  function showDetail(point,position,verification){
    qs('#detailTitle').textContent=point.title;
    qs('#detailLocation').textContent=`⌖ ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`;
    qs('#detailNote').textContent=point.note;
    qs('#detailAccuracy').textContent=point.accuracy;
    qs('#detailSource').textContent=`${point.source}${verification?` · ${verification}`:''}`;
    qs('#detailCard').classList.remove('hidden');
    qs('#detailDocs').onclick=()=>openReferences(byId(point.sectionId));
  }
  qs('#closeDetail').onclick=()=>qs('#detailCard').classList.add('hidden');

  async function loadMapData(){
    setRuntimeStatus('GIS-Wassergeometrien werden geladen und alle Punkte gegen den Neckar geprüft …');
    let waterLoaded=0;
    for(const source of data.osmWaterSources){
      try{
        const payload=await loadCached(`muchagio-water-${data.meta.version}-${source.id}`,buildWaterQuery(source));
        const lines=toLines(payload);
        if(!lines.length)throw new Error(`Keine Gewässergeometrie: ${source.id}`);
        const sectionCoordinates=[];
        lines.forEach(line=>{
          line.coordinates.forEach(point=>{allBounds.extend(point);sectionCoordinates.push(point)});
          L.polyline(line.coordinates,{color:'#052d20',weight:22,opacity:.55,lineCap:'round',lineJoin:'round'}).addTo(allowedLayer);
          L.polyline(line.coordinates,{color:'#49e59d',weight:6,opacity:.98,lineCap:'round',lineJoin:'round'}).addTo(allowedLayer).bindPopup(popupHtml(source.title,source.note,source.sectionId,'allowed'));
        });
        waterCoordinatesBySection.set(source.sectionId,sectionCoordinates);
        waterLoaded++;
      }catch(error){console.warn(error)}
    }

    let structuresShown=0;
    let structuresHidden=0;
    for(const point of data.structurePoints){
      let position=null;
      let verification='';
      try{
        const payload=await loadCached(`muchagio-structure-${data.meta.version}-${point.id}`,buildStructureQuery(point));
        const hit=nearestCandidate(point.anchor,toStructureCandidates(payload));
        if(hit&&hit.distance<=point.maxDistanceM){
          position=hit.latlng;
          verification=`OSM ${hit.id}, ${Math.round(hit.distance)} m vom Suchanker`;
        }
      }catch(error){console.warn(error)}
      if(!position&&point.fallbackVerified&&point.fallback){
        position=point.fallback;
        verification='verifizierte OSM-Fallbackposition';
      }
      const waterHit=position?nearestWaterPoint(position,waterCoordinatesBySection.get(point.sectionId)):null;
      if(!position||!waterHit||waterHit.distance>140){
        structuresHidden++;
        continue;
      }

      const marker=L.marker(position,{icon:structureIcon,zIndexOffset:700}).addTo(structureLayer).bindTooltip(point.title,{direction:'top',offset:[0,-15]});
      marker.on('click',()=>showDetail(point,position,`${verification}; ${Math.round(waterHit.distance)} m zur Gewässergeometrie`));
      L.circle(position,{radius:90,color:'#a66cf2',weight:2,dashArray:'7 7',opacity:.95,fillColor:'#a66cf2',fillOpacity:.12,interactive:true})
        .addTo(reviewAreaLayer)
        .bindPopup(popupHtml(`Prüfbereich: ${point.title}`,'Lokale Sperrflächen und Sicherheitsabstände rund um das reale Bauwerk anhand der Originalkarte und vor Ort prüfen.',point.sectionId,'warning',`Zentrum GIS-geprüft; Radius 90 m nur als Prüfhinweis.`));
      allBounds.extend(position);
      structuresShown++;
    }

    sections.forEach(section=>{
      const nearest=nearestWaterPoint(section.center,waterCoordinatesBySection.get(section.id));
      if(nearest)section.runtimeCenter=nearest.latlng;
    });

    setRuntimeStatus(`GIS aktiv: ${waterLoaded}/${data.osmWaterSources.length} Gewässerbereiche geladen. ${structuresShown} Bauwerke samt Prüfbereich am Gewässer angezeigt; ${structuresHidden} nicht ausreichend verifizierte Punkte ausgeblendet.`,waterLoaded===data.osmWaterSources.length?'ok':'warning');
    if(allBounds.isValid())map.fitBounds(allBounds.pad(.05));
  }
  loadMapData();

  map.on('popupopen',event=>{
    const button=event.popup.getElement()?.querySelector('[data-section]');
    if(button)button.onclick=()=>openReferences(byId(button.dataset.section));
  });
  setTimeout(()=>map.invalidateSize(true),100);
  addEventListener('resize',()=>map.invalidateSize(false));
  qs('#allowedToggle').onchange=event=>event.target.checked?allowedLayer.addTo(map):map.removeLayer(allowedLayer);
  qs('#warningToggle').onchange=event=>event.target.checked?structureLayer.addTo(map):map.removeLayer(structureLayer);
  qs('#markerToggle').onchange=event=>event.target.checked?reviewAreaLayer.addTo(map):map.removeLayer(reviewAreaLayer);

  function setBase(name){
    qsa('[data-base]').forEach(button=>button.classList.toggle('active',button.dataset.base===name));
    qs('#baseLabel').textContent=name==='satellite'?'Satellit':'Karte';
    if(name==='satellite'){
      map.removeLayer(street);
      satellite.addTo(map);
      labels.addTo(map);
    }else{
      map.removeLayer(satellite);
      map.removeLayer(labels);
      street.addTo(map);
    }
    localStorage.setItem('muchagio-base-map',name);
  }
  qsa('[data-base]').forEach(button=>button.onclick=()=>setBase(button.dataset.base));
  setBase(savedBase);
  qs('#opacityRange').oninput=event=>{
    const value=+event.target.value;
    qs('#opacityValue').textContent=`${value} %`;
    allowedLayer.eachLayer(layer=>layer.setStyle&&layer.setStyle({opacity:value/100}));
  };
  qs('#locateButton').onclick=()=>map.locate({setView:true,maxZoom:17,enableHighAccuracy:true});
  map.on('locationfound',event=>L.circleMarker(event.latlng,{radius:8,color:'#fff',weight:3,fillColor:'#3187ed',fillOpacity:1}).addTo(map).bindPopup('Dein Standort').openPopup());
  map.on('locationerror',()=>alert('Standort konnte nicht bestimmt werden.'));

  const select=qs('#sectionSelect');
  select.innerHTML=sections.map(section=>`<option value="${section.id}">${section.number} · ${section.shortTitle}</option>`).join('');
  let current=0;
  function go(index){
    current=(index+sections.length)%sections.length;
    const section=sections[current];
    select.value=section.id;
    map.flyTo(section.runtimeCenter||section.center,section.zoom,{duration:.8});
  }
  select.onchange=()=>{current=sections.findIndex(section=>section.id===select.value);go(current)};
  qs('#prevSection').onclick=()=>go(current-1);
  qs('#nextSection').onclick=()=>go(current+1);
  qs('#docsButton').onclick=()=>openReferences(sections[current]);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMap);else initMap();
