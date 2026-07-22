'use strict';

// Remove older cached app versions from the previous prototype.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(r => r.unregister()));
}
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
}

const sections = [
  {id:'boeckingen',number:'01',title:'Oberwasser HN-Böckingen',subtitle:'Offizielle Karte und Schleusen-Fotoreferenz',center:[49.1469,9.1918],zoom:15,refs:[['assets/reference/boeckingen-karte.png','Vereinskarte · Oberwasser HN-Böckingen'],['assets/reference/boeckingen-detail.png','Fotoreferenz · Schleuse Heilbronn']]},
  {id:'horkheim',number:'02',title:'Schifffahrtskanal Horkheim',subtitle:'Vier Vereins- und Fotoreferenzen',center:[49.1111,9.1754],zoom:14,refs:[['assets/reference/horkheim-01.png','Vereinskarte · Horkheim 1'],['assets/reference/horkheim-02.png','Vereinskarte · Horkheim 2'],['assets/reference/horkheim-03.png','Fotoreferenz · oberhalb der Schleuse'],['assets/reference/horkheim-04.png','Fotoreferenz · unterhalb der Schleuse']]},
  {id:'lauffen',number:'03',title:'Neckar bei Lauffen',subtitle:'Vereinskarte · Gewässergrenze beachten',center:[49.0752,9.1525],zoom:14,refs:[['assets/reference/lauffen-karte.png','Vereinskarte · Neckar bei Lauffen']]},
  {id:'besigheim',number:'04',title:'Mündung Enz bei Besigheim',subtitle:'Hege6/Hege7 und Enz-Grenzreferenzen',center:[49.0000,9.1437],zoom:15,refs:[['assets/reference/besigheim-01.png','Fotoreferenz · Enz / B27'],['assets/reference/besigheim-02.png','Vereinskarte · Besigheim / Hege6–Hege7'],['assets/reference/besigheim-03.png','Fotoreferenz · Grenzmarkierung'],['assets/reference/besigheim-04.png','Fotoreferenz · Enz flussabwärts']]}
];

const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('backdrop');
const openDrawer=()=>{drawer.classList.add('open');backdrop.classList.add('show')};
const closeDrawer=()=>{drawer.classList.remove('open');backdrop.classList.remove('show')};
document.getElementById('menuButton').addEventListener('click',openDrawer);
document.getElementById('sectionsButton').addEventListener('click',openDrawer);
document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
backdrop.addEventListener('click',closeDrawer);

const cards=document.getElementById('sectionCards');
sections.forEach(section=>{
  const el=document.createElement('article');el.className='card';
  el.innerHTML=`<div class="card-top"><div class="card-num">${section.number}</div><div><strong>${section.title}</strong><small>${section.subtitle}</small></div></div><div class="card-actions"><button class="mini primary" data-map type="button">Auf Karte</button><button class="mini" data-refs type="button">Unterlagen</button></div>`;
  el.querySelector('[data-map]').addEventListener('click',()=>{if(window.appMap)window.appMap.flyTo(section.center,section.zoom,{duration:.8});closeDrawer()});
  el.querySelector('[data-refs]').addEventListener('click',()=>openReferences(section));cards.appendChild(el);
});

const dialog=document.getElementById('referenceDialog');
function openReferences(section){
  document.getElementById('dialogTitle').textContent=section.title;
  document.getElementById('dialogSubtitle').textContent=section.subtitle;
  document.getElementById('gallery').innerHTML=section.refs.map(([src,caption])=>`<figure><a href="${src}" target="_blank" rel="noopener"><img src="${src}" alt="${caption}" loading="lazy"></a><figcaption>${caption} · antippen für Originalgröße</figcaption></figure>`).join('');
  dialog.showModal();
}
document.getElementById('closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

function initMap(){
  if(typeof L==='undefined'){document.getElementById('loadError').hidden=false;return;}
  const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap-Mitwirkende'});
  const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri'});
  const map=L.map('map',{layers:[street],zoomControl:true,preferCanvas:true}).setView([49.073,9.165],11);
  window.appMap=map;
  const markerLayer=L.layerGroup().addTo(map);const bounds=L.latLngBounds([]);
  const icon=n=>L.divIcon({className:'',html:`<div class="map-pin"><span>${n}</span></div>`,iconSize:[38,38],iconAnchor:[19,35]});
  sections.forEach(section=>{
    bounds.extend(section.center);
    const marker=L.marker(section.center,{icon:icon(section.number)}).addTo(markerLayer);
    marker.bindPopup(`<div class="popup-title">${section.title}</div><div class="popup-copy">${section.subtitle}<br><strong>Nur Orientierungspunkt, keine Grenzlinie.</strong></div><button class="popup-button" data-section="${section.id}">Unterlagen öffnen</button>`);
  });
  map.on('popupopen',e=>{const btn=e.popup.getElement()?.querySelector('[data-section]');if(btn)btn.addEventListener('click',()=>openReferences(sections.find(s=>s.id===btn.dataset.section)))});
  map.fitBounds(bounds.pad(.18));
  setTimeout(()=>map.invalidateSize(true),100);
  window.addEventListener('resize',()=>map.invalidateSize(false));
  document.getElementById('fitAll').addEventListener('click',()=>{map.fitBounds(bounds.pad(.18));closeDrawer()});
  document.getElementById('markerToggle').addEventListener('change',e=>e.target.checked?markerLayer.addTo(map):map.removeLayer(markerLayer));
  document.querySelectorAll('[data-base]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-base]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    if(btn.dataset.base==='satellite'){if(map.hasLayer(street))map.removeLayer(street);satellite.addTo(map)}else{if(map.hasLayer(satellite))map.removeLayer(satellite);street.addTo(map)}
  }));
  document.getElementById('locateButton').addEventListener('click',()=>map.locate({setView:true,maxZoom:16,enableHighAccuracy:true}));
  let userMarker,userCircle;
  map.on('locationfound',e=>{if(userMarker)map.removeLayer(userMarker);if(userCircle)map.removeLayer(userCircle);userMarker=L.circleMarker(e.latlng,{radius:7,color:'#fff',weight:3,fillColor:'#2f9fff',fillOpacity:1}).addTo(map).bindPopup('Dein Standort').openPopup();userCircle=L.circle(e.latlng,{radius:e.accuracy,color:'#2f9fff',weight:1,fillOpacity:.08}).addTo(map)});
  map.on('locationerror',()=>alert('Standort konnte nicht bestimmt werden. Bitte Standortzugriff im Browser erlauben.'));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMap);else initMap();
