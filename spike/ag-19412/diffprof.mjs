// usage: node diffprof.mjs a.cpuprofile[,a2...] b.cpuprofile[,b2...]  -> avg inclusive/self per function, B minus A
import fs from 'node:fs';
function agg(files) {
  const inc = new Map(), self = new Map();
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(f, 'utf8'));
    const byId = new Map(p.nodes.map((n) => [n.id, n])); const parent = new Map();
    for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
    const key = (n) => `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber + 1}`;
    for (let i = 0; i < p.samples.length; i++) {
      const t = (p.timeDeltas[i + 1] ?? 0) / 1000 / files.length; const id = p.samples[i];
      self.set(key(byId.get(id)), (self.get(key(byId.get(id))) ?? 0) + t);
      const seen = new Set(); let cur = id;
      while (cur != null) { const k = key(byId.get(cur)); if (!seen.has(k)) { seen.add(k); inc.set(k, (inc.get(k) ?? 0) + t); } cur = parent.get(cur); }
    }
  }
  return { inc, self };
}
const A = agg(process.argv[2].split(',')), B = agg(process.argv[3].split(','));
const diff = (a, b) => { const keys = new Set([...a.keys(), ...b.keys()]); return [...keys].map((k) => [k, (b.get(k) ?? 0) - (a.get(k) ?? 0), b.get(k) ?? 0]).sort((x, y) => y[1] - x[1]); };
console.log('--- inclusive delta (B-A) ---'); for (const [k, d, b] of diff(A.inc, B.inc).slice(0, 40)) console.log(d.toFixed(0).padStart(6), b.toFixed(0).padStart(6), k);
console.log('--- self delta (B-A) ---'); for (const [k, d, b] of diff(A.self, B.self).slice(0, 20)) console.log(d.toFixed(0).padStart(6), b.toFixed(0).padStart(6), k);
