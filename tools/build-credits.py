"""Build the footer credits list from assets/img/CREDITS-*.md and assets/video/CREDITS.md
and inject it between <!--credits--> markers in index.html."""
import sys, re, html, glob, os

root = sys.argv[1]
rows = []
for md in sorted(glob.glob(os.path.join(root, 'assets', 'img', 'CREDITS-*.md'))):
    for line in open(md, encoding='utf-8'):
        if not line.startswith('|') or line.startswith('|---') or 'filename' in line.lower()[:20]:
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) < 5:
            continue
        fn, subject, src, author, lic = cells[0], cells[1], cells[2], cells[3], cells[4]
        m = re.search(r'https?://\S+', src)
        url = m.group(0) if m else ''
        rows.append((fn.replace('.jpg', ''), subject, url, author, lic))

vids = []
vmd = os.path.join(root, 'assets', 'video', 'CREDITS.md')
if os.path.exists(vmd):
    for line in open(vmd, encoding='utf-8'):
        m = re.match(r'- (\S+)\.mp4.*?(https?://\S+)', line)
        if m:
            vids.append((m.group(1), m.group(2)))

def esc(s):
    return html.escape(s, quote=True)

items = []
for fn, subject, url, author, lic in rows:
    a = f'<a href="{esc(url)}" target="_blank" rel="noopener">{esc(author)}</a>' if url else esc(author)
    items.append(f'<li><span class="mono">{esc(fn)}</span> {esc(subject)}. {a}, {esc(lic)}</li>')
for fn, url in vids:
    items.append(f'<li><span class="mono">{esc(fn)}.mp4</span> <a href="{esc(url)}" target="_blank" rel="noopener">Mixkit</a>, Mixkit Stock Video Free License</li>')

block = ('<!--credits--><details class="sf-cred"><summary>Full photo &amp; film credits (' + str(len(items)) + ')</summary><ul>'
         + ''.join(items) + '</ul></details><!--/credits-->')
p = os.path.join(root, 'index.html')
s = open(p, encoding='utf-8').read()
s2, n = re.subn(r'<!--credits-->.*?<!--/credits-->', lambda m: block, s, flags=re.S)
assert n == 1, 'markers not found'
open(p, 'w', encoding='utf-8').write(s2)
print(len(rows), 'photos,', len(vids), 'clips')
