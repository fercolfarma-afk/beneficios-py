const BANKS=['Itaú','Sudameris','Familiar','Ueno Bank','Banco GNB'];
const CARD_TYPES={'Itaú':['Clásica','Oro / Gold','Platinum','Black','Infinite','Otra'],'Sudameris':['Clásica','Gold','Platinum','Black','Infinite','Otra'],'Familiar':['Clásica','Oro / Gold','Platinum','Black','Otra'],'Ueno Bank':['Clásica','Gold','Platinum','Black','Infinite','Otra'],'Banco GNB':['Clásica','Gold','Platinum','Black','Infinite','Otra']};
const $=id=>document.getElementById(id),money=n=>'G. '+Math.round(n||0).toLocaleString('es-PY');
const key='beneficiospy_v2_local';let state;try{state=JSON.parse(localStorage.getItem(key))||{promos:[],purchases:[]}}catch{state={promos:[],purchases:[]}};
function save(){calculate();localStorage.setItem(key,JSON.stringify(state));render()}
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
for(const id of ['bank','promoBank'])$(id).innerHTML=BANKS.map(b=>`<option>${b}</option>`).join('');
function cardOptions(bank,selected=''){return (CARD_TYPES[bank]||['Otra']).map(c=>`<option value="${escapeHTML(c)}" ${c===selected?'selected':''}>${escapeHTML(c)}</option>`).join('')}
function updateCardSelects(){const prev=$('cardType').value;$('cardType').innerHTML=cardOptions($('bank').value,prev);const pp=$('promoCardType').value;$('promoCardType').innerHTML=cardOptions($('promoBank').value,pp)}
$('promoBank').addEventListener('change',updateCardSelects);
updateCardSelects();
$('purchaseDate').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
function valid(p,date,bank,cardType){let d=new Date(date+'T12:00:00');return p.bank===bank&&(!p.cardType||p.cardType===cardType)&&date>=p.start&&date<=p.end&&(!p.days?.length||p.days.includes(d.getDay()))}
function estimate(p,amount){return Math.min(amount*p.percent/100,p.cap>0?p.cap:Infinity)}
function calculate(){const used={};for(const x of [...state.purchases].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id))){x.saving=0;const p=state.promos.find(q=>q.id===x.promoId);if(!p||x.status==='ninguno'||!valid(p,x.date,x.bank,x.cardType))continue;const k=p.id+'|'+x.date.slice(0,7),u=used[k]||(used[k]={buy:0,reward:0});const eligible=Math.min(x.amount,p.purchaseCap>0?Math.max(0,p.purchaseCap-u.buy):x.amount);const reward=Math.min(eligible*p.percent/100,p.cap>0?Math.max(0,p.cap-u.reward):Infinity);u.buy+=eligible;u.reward+=reward;x.saving=reward;}return used;}
function updateSelect(){let date=$('purchaseDate').value,bank=$('bank').value;let matches=state.promos.filter(p=>valid(p,date,bank,$('cardType').value));$('promo').innerHTML='<option value="">Sin promoción / no confirmada</option>'+matches.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.merchant)} — ${p.percent}%</option>`).join('')}
$('bank').onchange=()=>{updateCardSelects();updateSelect()};$('cardType').onchange=updateSelect;$('purchaseDate').onchange=updateSelect;
$('purchaseForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),amount=Number(f.get('amount')),p=state.promos.find(x=>x.id===f.get('promo'));let status=f.get('status');let saving=p&&valid(p,f.get('date'),f.get('bank'),f.get('cardType'))&&status!=='ninguno'?estimate(p,amount):0;state.purchases.push({id:crypto.randomUUID(),date:f.get('date'),bank:f.get('bank'),cardType:f.get('cardType'),merchant:f.get('merchant'),amount,saving,status,promoId:p?.id||null});save();e.target.reset();$('purchaseDate').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);updateCardSelects();updateSelect()};
$('promoForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),start=f.get('start'),end=f.get('end');if(end<start)return alert('La fecha final no puede ser anterior a la inicial');let days=String(f.get('days')).trim();let parsed=days?days.split(',').map(Number):[];if(parsed.some(d=>!Number.isInteger(d)||d<0||d>6))return alert('Los días deben ser números de 0 a 6 separados por coma');state.promos.push({id:crypto.randomUUID(),bank:f.get('bank'),cardType:f.get('cardType'),merchant:f.get('merchant'),percent:Number(f.get('percent')),cap:Number(f.get('cap')||0),purchaseCap:Number(f.get('purchaseCap')||0),start,end,days:parsed,url:f.get('url')});save();e.target.reset();updateCardSelects();updateSelect()};
$('export').onclick=()=>{let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='beneficios-py-respaldo.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('import').onchange=async e=>{try{let s=JSON.parse(await e.target.files[0].text());if(!Array.isArray(s.promos)||!Array.isArray(s.purchases))throw Error('Formato inválido');if(!confirm('¿Reemplazar los registros locales con el respaldo?'))return;state=s;save()}catch(err){alert('No se pudo importar: '+err.message)}};
function render(){const used=calculate();let month=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10).slice(0,7),monthly=state.purchases.filter(p=>p.date.startsWith(month));let total=monthly.reduce((a,p)=>a+p.amount,0),saved=monthly.filter(p=>p.status==='acreditado').reduce((a,p)=>a+p.saving,0),pending=monthly.filter(p=>['estimado','pendiente'].includes(p.status)).reduce((a,p)=>a+p.saving,0);$('stats').innerHTML=[['Compras del mes',money(total)],['Ahorro acreditado',money(saved)],['Beneficios por confirmar',money(pending)]].map(([k,v])=>`<div class="card"><div class="small">${k}</div><h2>${v}</h2></div>`).join('');let today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);let upcoming=state.promos.filter(p=>p.end>=today).map(p=>({...p,remaining:Math.round((new Date(p.end+'T12:00:00')-new Date(today+'T12:00:00'))/86400000)}));$('alerts').innerHTML=upcoming.filter(p=>p.remaining<=7).map(p=>`<p class="warning">⚠️ ${escapeHTML(p.bank)} · ${escapeHTML(p.cardType||'Tarjeta sin especificar')} · ${escapeHTML(p.merchant)} vence en ${p.remaining} día(s).</p>`).join('')||'<p class="small">No hay promociones cargadas que venzan en los próximos 7 días.</p>';
const weekday=new Date(today+'T12:00:00').getDay();const todayDeals=upcoming.filter(p=>!p.days?.length||p.days.includes(weekday));$('alerts').innerHTML+='<p class="small"><strong>Promociones aplicables hoy:</strong> '+(todayDeals.length?todayDeals.map(p=>escapeHTML(p.bank+' · '+p.cardType+' · '+p.merchant)).join(' | '):'Ninguna registrada para hoy')+'</p>';
$('usage').innerHTML=state.promos.map(p=>{const u=used[p.id+'|'+month]||{buy:0,reward:0};const capped=p.purchaseCap>0;const consumed=capped?Math.min(100,100*u.buy/p.purchaseCap):null;const remaining=capped?Math.max(0,p.purchaseCap-u.buy):null;const rewardLeft=p.cap>0?money(Math.max(0,p.cap-u.reward)):'Sin tope definido';return `<div class="cup-card"><div class="cup-head"><strong>${escapeHTML(p.bank)} · ${escapeHTML(p.cardType||'Tarjeta sin especificar')} · ${escapeHTML(p.merchant)}</strong><span>${capped?consumed.toFixed(1)+'% utilizado':'Sin límite de compras definido'}</span></div>${capped?`<div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${consumed.toFixed(1)}"><div class="fill" style="width:${consumed}%;background:${consumed>=90?'#dc2626':consumed>=70?'#d97706':'#16a34a'}"></div></div>`:''}<div class="cup-metrics"><div><small>Compras consumidas</small><b>${money(u.buy)}</b></div><div><small>Disponible para consumir</small><b class="green">${capped?money(remaining):'No calculable'}</b></div><div><small>Cupo mensual</small><b>${capped?money(p.purchaseCap):'No definido'}</b></div><div><small>Reintegro estimado / disponible</small><b>${money(u.reward)} / ${rewardLeft}</b></div></div>${capped&&u.buy>=p.purchaseCap?'<p class="warning">Cupo mensual de compras agotado.</p>':''}</div>`}).join('')||'<p class="small">Cargá una promoción con tope mensual de compras para ver su porcentaje consumido y saldo disponible en guaraníes.</p>';
$('promoRows').innerHTML=state.promos.map(p=>`<tr><td>${escapeHTML(p.bank)}<br>${escapeHTML(p.cardType||'Tarjeta sin especificar')}<br>${escapeHTML(p.merchant)}</td><td>${p.percent}% · tope ${p.cap?money(p.cap):'sin verificar'}</td><td>${p.days.length?p.days.join(','):'Todos'}<br>${p.start} a ${p.end}</td><td><a target="_blank" rel="noopener noreferrer" href="${escapeHTML(p.url)}">Condiciones</a> <button class="alt" data-delpromo="${escapeHTML(p.id)}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="4">Sin promociones verificadas cargadas.</td></tr>';
$('purchases').innerHTML=state.purchases.slice().reverse().map(p=>`<tr><td>${escapeHTML(p.date)}</td><td>${escapeHTML(p.bank)}</td><td>${escapeHTML(p.cardType||'Sin especificar')}</td><td>${escapeHTML(p.merchant)}</td><td>${money(p.amount)}</td><td>${escapeHTML(state.promos.find(q=>q.id===p.promoId)?.merchant||'Sin promoción')}</td><td>${money(p.saving)}</td><td><select data-status="${escapeHTML(p.id)}">${['estimado','pendiente','acreditado','ninguno'].map(s=>`<option ${s===p.status?'selected':''}>${s}</option>`).join('')}</select></td><td><button class="alt" data-delpurchase="${escapeHTML(p.id)}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="9">Todavía no registraste compras.</td></tr>';updateCardSelects();updateSelect()}
document.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.dataset.delpromo&&confirm('¿Eliminar promoción?')){state.promos=state.promos.filter(p=>p.id!==b.dataset.delpromo);save()}if(b.dataset.delpurchase&&confirm('¿Eliminar compra?')){state.purchases=state.purchases.filter(p=>p.id!==b.dataset.delpurchase);save()}});document.addEventListener('change',e=>{if(e.target.dataset.status){let p=state.purchases.find(p=>p.id===e.target.dataset.status);if(p){p.status=e.target.value;save()}}});render();

// Catálogo remoto de hallazgos; no se incorpora a state.promos sin revisión humana.
async function loadCatalog(){
 const status=$('sourceStatus'),list=$('catalogCandidates');
 status.textContent='Consultando datos públicos de GitHub…';
 try{
  const response=await fetch('./data/catalogo.json?t='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  status.innerHTML='<p class="small">Última ejecución: '+escapeHTML(data.generated_at||'sin ejecutar')+'</p>'+BANKS.map(bank=>{
   const s=(data.sources||[]).find(x=>x.bank===bank);
   return '<p class="small"><strong>'+escapeHTML(bank)+'</strong>: '+escapeHTML(s?.status==='ok'?'consultado':s?.status==='error'?'falló la consulta':'sin consultar')+(s?.changed?' · contenido modificado':'')+' · <a target="_blank" rel="noopener noreferrer" href="'+escapeHTML(s?.url||({"Itaú":"https://www.itau.com.py/Beneficios","Sudameris":"https://www.sudameris.com.py/personas/beneficios","Familiar":"https://www.familiar.com.py/promociones-tarjetas","Ueno Bank":"https://www.ueno.com.py/personas/tarjetas/","Banco GNB":"https://www.bancognb.com.py/"}[bank]))+'">Fuente oficial</a></p>'
  }).join('');
  const rows=(data.candidates||[]).slice(0,125);
  list.innerHTML=rows.length?'<table><thead><tr><th>Banco</th><th>Texto detectado (sin verificar)</th><th>Fuente</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+escapeHTML(x.bank)+'</td><td>'+escapeHTML(x.summary)+'</td><td><a target="_blank" rel="noopener noreferrer" href="'+escapeHTML(x.source_url)+'">Revisar</a></td></tr>').join('')+'</tbody></table>':'<p class="small">No hay ofertas extraídas. Podés consultar las fuentes oficiales o cargar promociones manualmente.</p>';
 }catch(e){status.textContent='No se pudo leer el catálogo: '+e.message;list.textContent='';}
}
$('refreshCatalog').addEventListener('click',loadCatalog);loadCatalog();

// Importación optativa y explícita de fichas revisadas; nunca se incorporan candidatos automáticos.
const OFFICIAL_HOSTS={
 'Itaú':['itau.com.py'], 'Sudameris':['sudameris.com.py'],
 'Familiar':['familiar.com.py'], 'Ueno Bank':['ueno.com.py'],
 'Banco GNB':['bancognb.com.py','beneficiosbancognb.com.py']
};
function validVerifiedOffer(p){
 if(!p||p.status!=='verificada'||!BANKS.includes(p.bank)||!CARD_TYPES[p.bank].includes(p.cardType))return false;
 if(!p.id||!p.merchant||!/^\d{4}-\d{2}-\d{2}$/.test(p.start)||!/^\d{4}-\d{2}-\d{2}$/.test(p.end)||p.end<p.start)return false;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.verified_at||''))return false;
 if(typeof p.percent!=='number'||p.percent<=0||p.percent>100)return false;
 if(typeof p.cap!=='number'||p.cap<0||typeof p.purchaseCap!=='number'||p.purchaseCap<0)return false;
 if(!Array.isArray(p.days)||p.days.some(d=>!Number.isInteger(d)||d<0||d>6))return false;
 if(!p.cap&&!p.purchaseCap)return false; // no asignar cupo infinito si es desconocido
 try{const u=new URL(p.url);if(u.protocol!=='https:')return false;return OFFICIAL_HOSTS[p.bank].some(h=>u.hostname===h||u.hostname.endsWith('.'+h));}catch{return false;}
}
async function loadVerified(){
 const el=$('verifiedOffers');el.textContent='Buscando fichas revisadas…';
 try{
  const r=await fetch('./data/promociones_verificadas.json?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw Error('HTTP '+r.status);
  const payload=await r.json();if(!Array.isArray(payload.promotions))throw Error('Formato inválido');
  const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const ok=payload.promotions.filter(p=>validVerifiedOffer(p)&&p.end>=today);
  const invalid=payload.promotions.length-ok.length;
  el.innerHTML='<p class="small">Fichas vigentes y estructuralmente válidas: '+ok.length+'. Excluidas (vencidas o incompletas): '+invalid+'. La validación de estructura no sustituye revisar las bases oficiales.</p>';
  for(const p of ok){
   const box=document.createElement('div');box.className='cup-card';
   const title=document.createElement('p');title.textContent=`${p.bank} · ${p.cardType} · ${p.merchant} · ${p.percent}% · hasta ${p.end}`;
   const link=document.createElement('a');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ver condiciones oficiales';
   const btn=document.createElement('button');btn.className='alt';btn.textContent=state.promos.some(x=>x.id===p.id)?'Ya incorporada':'Incorporar promoción';btn.disabled=state.promos.some(x=>x.id===p.id);
   btn.onclick=()=>{
    if(!confirm('¿Revisaste las condiciones oficiales y confirmás incorporar esta promoción?'))return;
    if(state.promos.some(x=>x.id===p.id))return;
    state.promos.push({id:p.id,bank:p.bank,cardType:p.cardType,merchant:p.merchant,percent:p.percent,cap:p.cap,purchaseCap:p.purchaseCap,start:p.start,end:p.end,days:p.days,url:p.url,verified_at:p.verified_at});save();btn.disabled=true;btn.textContent='Ya incorporada';
   };
   box.append(title,link,btn);el.append(box);
  }
 }catch(e){el.textContent='No se pudo cargar el catálogo revisado: '+e.message;}
}
$('loadVerified').addEventListener('click',loadVerified);
