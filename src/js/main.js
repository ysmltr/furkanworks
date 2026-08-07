import { staticLocations } from './staticLocations.js';

/* — 1. Harita — */
const map = L.map('map').setView([39.93, 32.86], 6);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom:19, attribution:'&copy; OpenStreetMap' }).addTo(map);

/* — 2. Yardımcılar — */
function serialToDate(s){const d=new Date(Date.UTC(1899,11,30));d.setUTCDate(d.getUTCDate()+ +s);return d;}
function formatDate(raw){
  let d; if (/^\d+$/.test(raw)) d=serialToDate(raw);
  else if (/\d{4}-\d{2}-\d{2}/.test(raw)) d=new Date(raw);
  else return raw||'';
  return d.toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'});
}

/* — 3. Marker fonksiyonu — */
function addMarker(row){
  if(!row.coords) return;
  let [lat,lng] = Array.isArray(row.coords)? row.coords
                 : String(row.coords).split(',').map(Number);

  const pretty = formatDate(Array.isArray(row.date)? row.date[0]: row.date);
  const link   = `https://www.google.com/maps?q=${lat},${lng}`;
  const tweetDiv = row.tweet ? `<div id="tweet-${row.tweet}"></div>` : '';

  const html = `
    <div class="popup-content" style="width:320px">
      <h3 style="margin:0 0 6px">
        <a href="${link}" target="_blank" style="text-decoration:none;color:#2c3e50">
          ${row.name ?? 'Mekan'}
        </a>
      </h3>
      <p style="margin:0 0 8px;color:#555">${pretty}</p>
      ${row.comment ? `<p style="margin:0 0 10px">${row.comment}</p>` : ''}
      ${tweetDiv}
    </div>`;

  const m = L.marker([lat,lng]).addTo(map).bindPopup(html);

  m.on('popupopen', ()=>{
    if(row.tweet && window.twttr?.widgets){
      const c=document.getElementById(`tweet-${row.tweet}`);
      if(c && !c.hasChildNodes()){
        twttr.widgets.createTweet(row.tweet,c,
          {theme:'light',conversation:'none',cards:'hidden',align:'center'});
      }
    }
  });
}

/* — 4. Statik lokasyonları ekle — */
staticLocations.forEach(addMarker);

/* — 5. Mobil popup kaydırma (opsiyonel) — */
if(L.Browser.mobile){
  map.on('popupopen', e=>{
    const px = map.project(e.target._popup._latlng);
    px.y -= e.target._popup._container.clientHeight/2.5;
    map.panTo(map.unproject(px),{animate:true,duration:0.5});
  });
}

/* — 6. FAQ düğmesi — */
const faqBtn   = document.getElementById('faq-btn');
const faqModal = document.getElementById('faq-modal');
const faqClose = document.getElementById('faq-close');

if (faqBtn && faqModal && faqClose){
  faqBtn.onclick   = () => faqModal.style.display = 'block';
  faqClose.onclick = () => faqModal.style.display = 'none';
  window.onclick   = e => { if (e.target === faqModal) faqModal.style.display = 'none'; };
}