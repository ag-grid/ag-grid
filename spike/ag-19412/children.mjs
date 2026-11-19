import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const byId = new Map(p.nodes.map((n) => [n.id, n]));
const self = new Map(); for (let i = 0; i < p.samples.length; i++) self.set(p.samples[i], (self.get(p.samples[i]) ?? 0) + (p.timeDeltas[i + 1] ?? 0));
const total = (n) => (self.get(n.id) ?? 0) + (n.children ?? []).reduce((a, c) => a + total(byId.get(c)), 0);
const name = (n) => `${n.callFrame.functionName || '(anon)'} :${n.callFrame.lineNumber + 1}`;
const show = (n, depth, maxDepth) => { if (depth > maxDepth) return; const t = total(n) / 1000; if (t < 15) return; console.log(' '.repeat(depth * 2) + Math.round(t) + 'ms ' + name(n)); for (const c of n.children ?? []) show(byId.get(c), depth + 1, maxDepth); };
show(p.nodes[0], 0, +process.argv[3] || 3);
