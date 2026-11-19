// Stack spike patches onto a UMD bundle. usage: node patch-all.mjs src dst patch1,patch2,...
import fs from 'node:fs';
const [src, dst, list] = process.argv.slice(2);
let s = fs.readFileSync(src, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error(`${n} matches: ${a.slice(0, 70)}`); s = s.replace(a, b); };
const P = {
  // stop maintaining deprecated firstChild/lastChild/childIndex
  nofirst: () => rep(`  for (let i = 0, lastIdx = childrenAfterSort.length - 1; i <= lastIdx; i++) {\n    const child = childrenAfterSort[i];\n    const first = i === 0;`,
                    `  for (let i = 0, lastIdx = -1; i <= lastIdx; i++) {\n    const child = childrenAfterSort[i];\n    const first = i === 0;`),
  // skip start-up expansion-state walk in StateService.setRowCountState
  state: () => {
    const i = s.indexOf('  setRowCountState(state, source, ignoreSet) {');
    const j = s.indexOf('this.updateGroupExpansionState();', i);
    if (i < 0 || j < 0 || j - i > 3000) throw new Error('state miss');
    s = s.slice(0, j) + '/* skipped */' + s.slice(j + 'this.updateGroupExpansionState();'.length);
  },
  // master/detail: skip per-row loop when never enabled
  md: () => rep(`  setMasters(changedRowNodes) {\n    this.enabled = this.isEnabled();`,
                `  setMasters(changedRowNodes) {\n    const wasEnabled = this.enabled;\n    this.enabled = this.isEnabled();\n    if (!this.enabled && !wasEnabled) { return; }`),
  // drop always-default fields from RowNode constructor
  slim: () => {
    const start = s.indexOf('var RowNode = class {\n  constructor(beans) {'); const end = s.indexOf('this.beans = beans;', start);
    let ctor = s.slice(start, end);
    for (const f of ['oldRowTop', 'formulaRowIndex', 'hovered', 'alreadyRendered', 'treeNodeFlags', 'childrenMapped', 'detail']) {
      const re = new RegExp('\\n\\s*this\\.' + f + ' = [^;]+;'); if (!re.test(ctor)) throw new Error('slim miss ' + f); ctor = ctor.replace(re, '');
    }
    s = s.slice(0, start) + ctor + s.slice(end);
  },
  // no childrenMapped object on lowest-level groups
  nomap: () => rep(`    const children = [];\n    const mapped = {};`, `    const children = [];\n    const mapped = isLeafLevel ? null : {};`),

  // build the group id index lazily after a first load instead of during it
  lazyidx: () => {
    rep(`    this.groupCols = [];\n    this.nonLeafsById = /* @__PURE__ */ new Map();`,
        `    this.groupCols = [];\n    this._nonLeafsById = /* @__PURE__ */ new Map();\n    this.indexRoot = null;\n    this.skipIndex = false;`);
    rep(`  shotgunResetEverything(rootNode) {\n    const groupsById = this.nonLeafsById;`,
        `  get nonLeafsById() {\n    const root = this.indexRoot;\n    if (root) {\n      this.indexRoot = null;\n      const m = this._nonLeafsById;\n      const walk = (n) => { const c = n.childrenAfterGroup; if (!c) { return; } for (let i = 0; i < c.length; i++) { const ch = c[i]; if (ch.group && ch.childrenAfterGroup) { m.set(ch.id, ch); walk(ch); } } };\n      walk(root);\n    }\n    return this._nonLeafsById;\n  }\n  shotgunResetEverything(rootNode) {\n    const groupsById = this.nonLeafsById;\n    const skipIndex = groupsById.size === 0;\n    this.skipIndex = skipIndex;`);
    rep(`      this.insertOneNode(rootNode, allLeafs[i]);\n    }\n    this.destroyStaleGroups(groupsById);`,
        `      this.insertOneNode(rootNode, allLeafs[i]);\n    }\n    if (skipIndex) { this.skipIndex = false; this.indexRoot = rootNode; }\n    this.destroyStaleGroups(groupsById);`);
    rep(`let node = groupsById.get(id);`, `let node = this.skipIndex ? void 0 : groupsById.get(id);`);
    rep(`      node.aggData = null;\n      groupsById.set(id, node);`, `      node.aggData = null;\n      if (!this.skipIndex) { groupsById.set(id, node); }`);
  },
  // children keyed by raw key in a Map, not a concatenated-string object
  gmap: () => {
    rep(`const existingGroup = parentGroup.childrenMapped?.[this.getChildrenMappedKey(key, col)];`, `const existingGroup = parentGroup._gm?.get(key);`);
    rep(`    const childrenMapped = parent.childrenMapped ?? (parent.childrenMapped = {});\n    const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);\n    if (childrenMapped[mapKey] !== child) {\n      childrenMapped[mapKey] = child;`,
        `    const gm = parent._gm ?? (parent._gm = new Map());\n    if (gm.get(child.key) !== child) {\n      gm.set(child.key, child);`);
    rep(`      node.childrenAfterGroup = null;\n      node.childrenMapped = null;\n    }\n    rootNode.leafGroup`, `      node.childrenAfterGroup = null;\n      node.childrenMapped = null;\n      node._gm = null;\n    }\n    rootNode.leafGroup`);
    rep(`    rootNode.childrenMapped = {};\n    rootNode.updateHasChildren();`, `    rootNode.childrenMapped = {};\n    rootNode._gm = new Map();\n    rootNode.updateHasChildren();`);
    rep(`    const mapped = isLeafLevel ? null : {};`, `    const mapped = null;`);
  },

  // one row height for all rows when nothing can vary it
  rowh: () => {
    rep(`    const allowEstimate = _canScrollVertically(beans) || !beans.environment.sizesMeasured;\n    for (let i = 0, len = rowsToRender.length; i < len; ++i) {\n      const rowNode = rowsToRender[i];\n      positioned[i] = rowNode;\n      if (rowNode.rowHeight == null) {\n        const rowHeight`,
        `    const allowEstimate = _canScrollVertically(beans) || !beans.environment.sizesMeasured;\n    const gos = beans.gos;\n    let uniformHeight = null;\n    if (!beans.rowAutoHeight?.visibleCols?.autoHeightCols?.length && !_isGetRowHeightFunction(gos) && !gos.get("masterDetail")) {\n      const h = gos.get("rowHeight");\n      uniformHeight = h && _isFiniteNumber(h) ? h : defaultRowHeight;\n    }\n    for (let i = 0, len = rowsToRender.length; i < len; ++i) {\n      const rowNode = rowsToRender[i];\n      positioned[i] = rowNode;\n      if (rowNode.rowHeight == null && uniformHeight !== null) {\n        rowNode.setRowHeight(uniformHeight, false);\n      } else if (rowNode.rowHeight == null) {\n        const rowHeight`);
  },
  // only allocate a reordered children array when the order must change
  poslg: () => {
    rep(`      if (!childrenLen) {\n        return;\n      }\n      const newChildren = new Array(childrenLen);`,
        `      if (!childrenLen) {\n        return;\n      }\n      let seenGroup = false;\n      let needs = false;\n      for (let k = 0; k < childrenLen; ++k) {\n        const n = children[k];\n        if (!n.childrenAfterGroup?.length) {\n          if (seenGroup) { needs = true; break; }\n        } else {\n          if (n.key === "" && k !== childrenLen - 1) { needs = true; break; }\n          seenGroup = true;\n        }\n      }\n      if (!needs) {\n        return;\n      }\n      const newChildren = new Array(childrenLen);`);
  },
  // teardown must not build the lazy index
  destroyidx: () => rep(`    this.groupCols.length = 0;\n    this.nonLeafsById.clear();`, `    this.groupCols.length = 0;\n    this.indexRoot = null;\n    this._nonLeafsById.clear();`),

  // reuse the previous leaf's group path while keys match (sorted / clustered data)
  pathcache: () => {
    rep(`    const len = groupCols.length;\n    for (let i = 0; i < len; ++i) {\n      const groupCol = groupCols[i];\n      const col = groupCol.col;\n      let key = valueSvc.getKeyForNode(col, childNode);`,
        `    const len = groupCols.length;\n    const lpParent = this.lpParent ?? (this.lpParent = []);\n    const lpKey = this.lpKey ?? (this.lpKey = []);\n    const lpGroup = this.lpGroup ?? (this.lpGroup = []);\n    for (let i = 0; i < len; ++i) {\n      const groupCol = groupCols[i];\n      const col = groupCol.col;\n      let key = valueSvc.getKeyForNode(col, childNode);`);
    rep(`      const existingGroup = parentGroup._gm?.get(key);\n      if (existingGroup) {\n        parentGroup = existingGroup;\n        continue;\n      }`,
        `      if (lpParent[i] === parentGroup && lpKey[i] === key) {\n        parentGroup = lpGroup[i];\n        continue;\n      }\n      const existingGroup = parentGroup._gm?.get(key);\n      if (existingGroup) {\n        lpParent[i] = parentGroup; lpKey[i] = key; lpGroup[i] = existingGroup;\n        parentGroup = existingGroup;\n        continue;\n      }`);
    rep(`      this.addToParent(newGroup, parentGroup);\n      parentGroup = newGroup;\n    }`,
        `      this.addToParent(newGroup, parentGroup);\n      lpParent[i] = parentGroup; lpKey[i] = key; lpGroup[i] = newGroup;\n      parentGroup = newGroup;\n    }`);
    rep(`    const sibling = rootNode.sibling;\n    if (sibling) {\n      sibling.childrenAfterGroup = rootNode.childrenAfterGroup;\n      sibling.childrenMapped = rootNode.childrenMapped;\n    }\n    const allLeafs = rootNode._leafs;`,
        `    const sibling = rootNode.sibling;\n    if (sibling) {\n      sibling.childrenAfterGroup = rootNode.childrenAfterGroup;\n      sibling.childrenMapped = rootNode.childrenMapped;\n    }\n    if (this.lpParent) { this.lpParent.length = 0; this.lpKey.length = 0; this.lpGroup.length = 0; }\n    const allLeafs = rootNode._leafs;`);
  },
  // has-children can only change when the first child arrives
  hasch: () => rep(`    parentGroup.childrenAfterGroup.push(childNode);\n    parentGroup.updateHasChildren();`,
                   `    if (parentGroup.childrenAfterGroup.push(childNode) === 1) {\n      parentGroup.updateHasChildren();\n    }`),

  // declare fields that are always set later in the constructor, so V8 keeps them in-object
  ctorinit: () => {
    const start = s.indexOf('var RowNode = class {\n  constructor(beans) {'); const end = s.indexOf('    this.beans = beans;', start);
    if (start < 0 || end < 0) throw new Error('ctor miss');
    const ctorText = s.slice(start, end);
    const add = ['parent', 'level', 'group', 'data', '__hasChildren', 'uiLevel', 'rowHeight', 'rowHeightEstimated', 'aggData', 'childrenMapped', 'rowGroupIndex', 'leafGroup', 'groupValue'].filter((f) => !ctorText.includes(`this.${f} =`)).map((f) => `    this.${f} = void 0;\n`).join('');
    s = s.slice(0, end) + add + s.slice(end);
  },
  // no per-call closure in createGroup
  noclosure: () => {
    const m = s.match(/    const applyValuesToNode = \(n\) => \{\n      n\.childrenAfterGroup = children;\n      n\.childrenMapped = mapped;\n      n\.parent = parent;\n      n\.level = level;\n      n\.rowGroupIndex = level;\n      n\.leafGroup = isLeafLevel;\n    \};\n    const children = \[\];\n    const mapped = ([^;]+);\n    applyValuesToNode\(node\);/);
    if (!m) throw new Error('noclosure miss');
    s = s.replace(m[0], `    const children = [];\n    const mapped = ${m[1]};\n    applyGroupValues(node, children, mapped, parent, level, isLeafLevel);`);
    rep(`    if (sibling) {\n      applyValuesToNode(sibling);\n    }`, `    if (sibling) {\n      applyGroupValues(sibling, children, mapped, parent, level, isLeafLevel);\n    }`);
    rep(`var invalidateAllLeafChildren = (node) => {`, `function applyGroupValues(n, children, mapped, parent, level, isLeafLevel) {\n  n.childrenAfterGroup = children;\n  n.childrenMapped = mapped;\n  n.parent = parent;\n  n.level = level;\n  n.rowGroupIndex = level;\n  n.leafGroup = isLeafLevel;\n}\nvar invalidateAllLeafChildren = (node) => {`);
  },
};
for (const p of list.split(',')) P[p]();
fs.writeFileSync(dst, s);
console.log('applied', list);
