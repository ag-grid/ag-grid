import fs from 'node:fs';
const [file, ...fns] = process.argv.slice(2);
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
const lines = new Map();
for (const n of p.nodes) {
  if (!fns.includes(n.callFrame.functionName)) continue;
  for (const t of n.positionTicks ?? []) lines.set(t.line, (lines.get(t.line) ?? 0) + t.ticks);
}
const total = [...lines.values()].reduce((a, b) => a + b, 0);
for (const [l, t] of [...lines].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(String(t).padStart(6), (100*t/total).toFixed(1).padStart(5)+'%', l);
