"""Conservative public-page watcher. Extracts review-only candidates, never invents eligibility."""
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'data/config.json').read_text(encoding='utf-8'))
DATA = ROOT / 'data/promotions.json'
STATE = ROOT / 'data/source_state.json'
HEADERS = {'User-Agent': 'BeneficiosPYMonitor/0.1 (public promotional information; GitHub project; respectful frequency)'}
TODAY = dt.datetime.now(dt.timezone(dt.timedelta(hours=-3))).date()

def get_text(html):
    soup = BeautifulSoup(html, 'html.parser')
    for t in soup(['script', 'style', 'nav', 'footer', 'header', 'noscript']): t.decompose()
    for t in soup.select('main, article, .card, .w-dyn-item, .beneficio, .promocion'):
        text = ' '.join(t.stripped_strings)
        if 25 <= len(text) <= 1700 and re.search(r'\b(?:reintegro|descuento|ahorro|cuotas sin inter[eé]s)\b', text, re.I):
            yield text
    # Fallback: preserve snippets with explicit benefit phrases, not full-page fragments.
    lines = [re.sub(r'\s+', ' ', x).strip() for x in soup.stripped_strings]
    for i, line in enumerate(lines):
        if re.search(r'\b(?:reintegro|descuento|ahorro|cuotas sin inter[eé]s)\b', line, re.I):
            yield ' · '.join(lines[max(0, i-2):i+3])[:1200]

def candidates(bank, url, html):
    seen = set()
    for text in get_text(html):
        text = text.strip()
        if len(text) < 25: continue
        key = hashlib.sha256((bank + '|' + text.lower()).encode()).hexdigest()[:18]
        if key in seen: continue
        seen.add(key)
        pct = re.search(r'(\d{1,2})(?:\s*%)\s*(?:de\s*)?(?:reintegro|descuento|ahorro)', text, re.I)
        if not pct: pct = re.search(r'(?:reintegro|descuento|ahorro)\s*(?:de\s*)?(\d{1,2})\s*%', text, re.I)
        yield {'id': key, 'bank': bank, 'merchant': '', 'title': text[:230], 'category': '', 'days': '', 'discount_percent': int(pct.group(1)) if pct else None, 'max_refund_pyg': None, 'start_date': None, 'end_date': None, 'source_url': url, 'status': 'review', 'first_seen': TODAY.isoformat(), 'last_seen': TODAY.isoformat()}

def main():
    old = json.loads(DATA.read_text(encoding='utf-8')) if DATA.exists() else {'promotions': []}
    prev = {x['id']: x for x in old.get('promotions', [])}
    states = json.loads(STATE.read_text(encoding='utf-8')) if STATE.exists() else {}
    additions = []
    successful = 0
    for source in CONFIG['sources']:
        bank, url = source['bank'], source['url']
        try:
            r = requests.get(url, headers=HEADERS, timeout=25)
            r.raise_for_status()
            digest = hashlib.sha256(r.content).hexdigest()
            states[bank] = {'url': url, 'last_success': dt.datetime.now(dt.timezone.utc).isoformat(), 'sha256': digest, 'http_status': r.status_code, 'error': None}
            successful += 1
            for item in list(candidates(bank, url, r.text))[:100]:
                if item['id'] in prev:
                    item['first_seen'] = prev[item['id']].get('first_seen', TODAY.isoformat())
                    # Preserve manually verified metadata when the same snippet is seen again.
                    if prev[item['id']].get('status') == 'verified':
                        item = prev[item['id']]
                    item['last_seen'] = TODAY.isoformat()
                else: additions.append(item)
                prev[item['id']] = item
            print(bank, 'OK', len(r.content), 'bytes')
        except (requests.RequestException, ValueError) as exc:
            states[bank] = {**states.get(bank, {}), 'url': url, 'error': str(exc)[:200], 'last_attempt': dt.datetime.now(dt.timezone.utc).isoformat()}
            print(bank, 'ERROR', str(exc), file=sys.stderr)
    # Avoid presenting vanished, expired, or old candidates as active. Retain 30 days for auditing.
    cutoff = (TODAY - dt.timedelta(days=30)).isoformat()
    result = sorted((x for x in prev.values() if x.get('last_seen', TODAY.isoformat()) >= cutoff), key=lambda x: (x['bank'], x['id']))
    payload = {'generated_at': dt.datetime.now(dt.timezone(dt.timedelta(hours=-3))).isoformat(timespec='minutes'), 'promotions': result}
    DATA.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    STATE.write_text(json.dumps(states, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    topic = os.environ.get('NTFY_TOPIC', '').strip()
    if topic and additions:
        # Private random topic name is a bearer secret; never publish it in the repository.
        if not re.fullmatch(r'[A-Za-z0-9_-]{12,120}', topic):
            print('NTFY_TOPIC inválido: usá 12-120 caracteres alfanuméricos, guion o guion bajo', file=sys.stderr)
        else:
            body = f'Beneficios PY detectó {len(additions)} posibles novedades para revisar en las fuentes oficiales.'
            try: requests.post('https://ntfy.sh/' + topic, data=body.encode('utf-8'), headers={'Title': 'Beneficios PY: revisar novedades'}, timeout=15).raise_for_status()
            except requests.RequestException as exc: print('No se pudo enviar alerta:', exc, file=sys.stderr)
    if not successful:
        print('Ninguna fuente pudo consultarse; revisá errores y accesibilidad.', file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__': main()
