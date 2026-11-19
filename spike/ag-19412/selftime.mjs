import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const byId = new Map(p.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = p.timeDeltas; const counts = new Map();
for (let i = 0; i < p.samples.length; i++) counts.set(p.samples[i], (counts.get(p.samples[i]) ?? 0) + (dt[i+1] ?? 0));
// total time: propagate
const parent = new Map();
for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const total = new Map();
let all = 0;
for (const [id, t] of counts) {
  all += t;
  const n = byId.get(id);
  const key = (n) => `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber+1}`;
  self.set(key(n), (self.get(key(n)) ?? 0) + t);
  const seen = new Set();
  let cur = id;
  while (cur != null) { const k = key(byId.get(cur)); if (!seen.has(k)) { seen.add(k); total.set(k, (total.get(k) ?? 0) + t); } cur = parent.get(cur); }
}
const fmt = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${(v/1000).toFixed(0).padStart(6)}ms  ${k}`).join('\n');
console.log('TOTAL', (all/1000).toFixed(0), 'ms\n--- self ---\n' + fmt(self, 30) + '\n--- inclusive ---\n' + fmt(total, 45));
