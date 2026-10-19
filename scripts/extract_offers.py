"""Extrae promociones estructuradas de fichas oficiales Itaú.
Sólo publica ofertas cuando las condiciones esenciales pueden verificarse.
Otros bancos permanecen en monitoreo de candidatos, sin promesas de extracción."""
import datetime as dt, json, pathlib, re, urllib.request
from html.parser import HTMLParser

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'data/promociones_verificadas.json'
SOURCES=[
 {"id":"itau-stock-infinite-2026","url":"https://www.itau.com.py/beneficios2/Detalle?b=16586&c=1457","merchant":"Stock","category":"Supermercados","cards":["Infinite"],"rate":20,"purchase_cap":3000000,"end":"2026-12-31","days":[6],"scope":"cliente-rubro-supermercados","start":"2026-03-07"},
 {"id":"itau-pluma-infinite-2026","url":"https://www.itau.com.py/beneficios2/Detalle?b=16034&c=1026","merchant":"Supermercado Pluma","category":"Supermercados","cards":["Infinite"],"rate":20,"purchase_cap":4000000,"end":"2026-12-31","days":[6],"scope":"cuenta-tarjeta","start":"2026-01-03"},
 {"id":"itau-luminotecnia-2026","url":"https://www.itau.com.py/beneficios2/Detalle?b=15776&c=1112","merchant":"Luminotecnia","category":"Tecnología y hogar","cards":["Clásica","Oro / Gold","Platinum","Black","Infinite"],"rate":15,"purchase_cap":None,"end":"2026-12-26","days":[6],"scope":"sin-tope-publicado","start":"2026-01-10"}
]
class Reader(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t in ('script','style','noscript'):self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style','noscript'):self.skip=max(0,self.skip-1)
 def handle_data(self,v):
  if not self.skip and v.strip():self.parts.append(' '.join(v.split()))
def read(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; BeneficiosPY/3.0; official-public-promotions)','Accept':'text/html'})
 with urllib.request.urlopen(req,timeout=24) as response:
  if 'itau.com.py' not in urllib.parse.urlparse(response.geturl()).hostname:raise ValueError('redirección no oficial')
  data=response.read(1_500_000)
 p=Reader();p.feed(data.decode('utf-8','replace'))
 return ' '.join(p.parts)
def verify(s,t):
 low=t.casefold()
 if s['merchant'].casefold() not in low:raise ValueError('comercio ausente')
 if not re.search(r'\b'+str(s['rate'])+r'\s*%',t):raise ValueError('porcentaje ausente')
 if not any(word in low for word in ('reintegro','ahorro','descuento')):raise ValueError('tipo de beneficio ausente')
 if s['purchase_cap'] is not None:
  # Comprobar que el importe aparece en el texto (formatos 3.000.000 / 3000000)
  if not any(z in t for z in [f"{s['purchase_cap']:,}".replace(',','.'),str(s['purchase_cap'])]):raise ValueError('tope ausente')
 if not re.search(r'2026',t):raise ValueError('vigencia no confirmable')
 if 6 in s['days'] and 'sábad' not in low and 'sabad' not in low:raise ValueError('día ausente')
 if s['id'].startswith('itau-stock') and not ('infinite' in low and ('platinum' in low)):raise ValueError('tarjetas no confirmadas')
def main():
 old=json.loads(OUTPUT.read_text(encoding='utf8')) if OUTPUT.exists() else {'promotions':[]}
 byid={x['id']:x for x in old.get('promotions',[]) if x.get('id')}
 today=dt.datetime.now(dt.timezone.utc).date().isoformat()
 report=[]
 for s in SOURCES:
  try:
   text=read(s['url']);verify(s,text)
   # Sin tope publicado: no publicar una cifra ficticia ni usar 0 como "ilimitado".
   if s['purchase_cap'] is None:raise ValueError('tope no verificable: revisión necesaria')
   for card in s['cards']:
    p={'id':s['id'],'bank':'Itaú','cardType':card,'merchant':s['merchant'],'category':s['category'],
       'percent':s['rate'],'cap':0,'purchaseCap':s['purchase_cap'],'start':s['start'],'end':s['end'],
       'days':s['days'],'url':s['url'],'verified_at':today,'status':'verificada',
       'benefitType':'reintegro','capScope':s['scope'],'note':'Extracción automática: verificar condiciones y compras fuera de esta aplicación.'}
    byid[p['id']]=p
   report.append({'id':s['id'],'status':'verified'})
  except Exception as e:
   report.append({'id':s['id'],'status':'pending_review','reason':str(e)[:160]})
   # No mantener una ficha como "actualizada" cuando la fuente no se pudo consultar.
   if s['id'] in byid:
    byid[s['id']]['verification_warning']='No se pudo revalidar en última ejecución.'
 valid=[p for p in byid.values() if p.get('end','')>=today]
 OUTPUT.write_text(json.dumps({'generated_at':dt.datetime.now(dt.timezone.utc).isoformat(),'promotions':valid,'extraction_report':report},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':main()
