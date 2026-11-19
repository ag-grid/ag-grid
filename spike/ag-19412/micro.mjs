const T = 166667, SP = ['A','B','C'], SX = ['M','F'];
function run(label, mkKey) {
  const t0 = performance.now();
  const byId = new Map();
  let lookups = 0;
  for (let t = 0; t < T; t++) for (const s of SP) for (const x of SX) {
    const k1 = 'T' + t;
    const id1 = mkKey('row-group-', 'territory', k1);
    let g1 = byId.get(id1); lookups++;
    if (!g1) { g1 = { id: id1 }; byId.set(id1, g1); }
    const id2 = mkKey(g1.id + '-', 'species', s);
    let g2 = byId.get(id2); lookups++;
    if (!g2) { g2 = { id: id2 }; byId.set(id2, g2); }
  }
  console.log(label.padEnd(30), Math.round(performance.now() - t0), 'ms', byId.size, 'groups', lookups, 'lookups');
}
for (let r = 0; r < 2; r++) {
  run('concat (as grid)', (p, c, k) => p + (c + '-' + k));
  run('concat + flatten', (p, c, k) => { const s = p + (c + '-' + k); return s.length > 0 ? (s | 0, Number(s), s) : s; });
}
// retain a big heap like the grid does (1M data rows + 1M row nodes with ~35 fields)
const keep = [];
for (let i = 0; i < 1000002; i++) { const o = { territory: 'T' + (i/6|0), species: 'A', sex: 'M', i }; const n = {}; for (let f = 0; f < 35; f++) n['f' + f] = null; n.data = o; keep.push(n); }
for (let r = 0; r < 2; r++) run('concat, big heap', (p, c, k) => p + (c + '-' + k));
