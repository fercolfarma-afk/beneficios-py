"""Vigilancia de páginas oficiales: candidatos NO verificados, nunca ofertas calculables."""
import datetime as dt, hashlib, json, os, pathlib, re, urllib.request
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCES={
 'Itaú':'https://www.itau.com.py/Beneficios',
 'Sudameris':'https://www.sudameris.com.py/personas/beneficios',
 'Familiar':'https://www.familiar.com.py/promociones-tarjetas',
 'Ueno Bank':'https://www.ueno.com.py/personas/tarjetas/',
 'Banco GNB':'https://www.bancognb.com.py/',
}
class Text(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.out=[]
 def handle_starttag(self,t,a):
  if t in ('script','style','noscript'):self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style','noscript'):self.skip=max(0,self.skip-1)
 def handle_data(self,s):
  if not self.skip and s.strip():self.out.append(' '.join(s.split()))
def run():
 path=ROOT/'data'/'catalogo.json';path.parent.mkdir(parents=True,exist_ok=True)
 try:old=json.loads(path.read_text(encoding='utf-8'))
 except (OSError,ValueError):old={}
 previous={x['bank']:x for x in old.get('sources',[]) if 'bank' in x}
 now=dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')
 sources=[];candidates=[]
 for bank,url in SOURCES.items():
  item={'bank':bank,'url':url,'checked_at':now,'status':'error','changed':False}
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'BeneficiosPY/2.3 (public promotions monitoring; contact via repository)','Accept':'text/html'})
   with urllib.request.urlopen(req,timeout=22) as r:
    final=r.geturl();data=r.read(2_000_000);ctype=r.headers.get('Content-Type','')
   if 'html' not in ctype.lower():raise ValueError('Respuesta no HTML')
   parser=Text();parser.feed(data.decode('utf-8','replace'))
   lines=[s[:200] for s in parser.out if len(s)>3]
   digest=hashlib.sha256(' '.join(lines).encode()).hexdigest()
   item.update(status='ok',final_url=final,hash=digest,changed=bool(previous.get(bank,{}).get('hash') and previous[bank]['hash']!=digest))
   # Hallazgos textuales no verificables automáticamente: NO se usan en cálculos.
   selected=[]
   for line in lines:
    if re.search(r'\b(?:reintegro|descuento|ahorro|promoci[oó]n)\b',line,re.I) and re.search(r'\d{1,2}\s*%',line):
     if line not in selected:selected.append(line)
    if len(selected)>=25:break
   candidates += [{'bank':bank,'summary':s,'source_url':url,'detected_at':now,'status':'pendiente_revision'} for s in selected]
  except Exception as exc:
   item['error']=str(exc)[:180]
  sources.append(item)
 # Preserve previous candidate results only when a source fails, clearly marked stale.
 for bank in SOURCES:
  if next(x for x in sources if x['bank']==bank)['status']!='ok':
   candidates += [{**x,'status':'fuente_no_disponible'} for x in old.get('candidates',[]) if x.get('bank')==bank][:25]
 output={'generated_at':now,'disclaimer':'Hallazgos no verificados: revisar bases y condiciones antes de crear promociones calculables.','sources':sources,'candidates':candidates}
 serialized=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
 if not path.exists() or path.read_text(encoding='utf-8')!=serialized:path.write_text(serialized,encoding='utf-8')
 print(json.dumps({'checked':len(sources),'ok':sum(x['status']=='ok' for x in sources),'candidates':len(candidates)},ensure_ascii=False))
if __name__=='__main__':run()
