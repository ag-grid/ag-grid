/* Review Queue tab */
(function () {
    'use strict';

    const IGNORE_REASONS = [
        'Used in build & dev - not included in final production build',
        'Test dependency - not included in final production build',
        'Lint dependency - not included in final production build',
        'Downstream dependency of [package] - not included in final production build',
        'Dev server only - not exposed in production',
        'The website is a static site, so server-side vulns are not relevant',
        'MCP/dev tooling - not a directly exposed production dependency',
    ];

    window.initReviewQueue = function (projects, ignorePatternsByFileInit, reviewState, sharedExpiry, _rootPackageName) {
        let ignorePatternsByFile = ignorePatternsByFileInit;
        const { esc, sevClass, stripVer, getSnykFilePath, getNearIgnoredPath,
                sameMajorFixVersion, npmLink } = window.SnykUtils;

        // ── Collect vuln entries ──
        const allVulnEntries = [];
        for (const project of projects) {
            for (const vuln of (project.vulnerabilities || [])) {
                allVulnEntries.push({ vuln, project });
            }
        }
        const reportVulnIds = new Set(allVulnEntries.map(e => e.vuln.id));

        // Local mutable copy of review state
        const localRS = JSON.parse(JSON.stringify(reviewState));
        localRS.decisions = localRS.decisions || {};

        // Patterns added via the UI this session — checked alongside the original ignorePatternsByFile
        // so buildSections() stays accurate after adds without a server round-trip
        const localAddedPatterns = {};

        // ── Skip state (persists across re-renders) ──
        const skipState = {
            vulns: new Set(),  // skipped vuln IDs
            deps: new Set(),   // skipped top-level dep names
        };

        // ── Section 3 view mode: 'by-dep' (default) | 'by-file' ──
        let s3ViewMode = 'by-dep';

        // ── Section 3 near-panel open state ──
        let nearPanelOpen = true;

        function semverLt(a, b) {
            const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
            for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                const na = pa[i] || 0, nb = pb[i] || 0;
                if (na !== nb) return na < nb;
            }
            return false;
        }

        function getNear(vuln, project) {
            return getNearIgnoredPath(vuln, project, ignorePatternsByFile)
                || getNearIgnoredPath(vuln, project, localAddedPatterns);
        }

        // ── Build sections ──
        function buildSections() {
            const decisions = localRS.decisions;

            // Section 1: Dep groups — Map: depName → { depName, vulns: Map<id,{id,vuln}>, files: Map<pkgPath,version> }
            const depGroups = new Map();
            for (const { vuln, project } of allVulnEntries) {
                const dec = decisions[vuln.id];
                if (dec?.status === 'resolved' || dec?.status === 'skipped') continue;
                const topDep = vuln.from?.[1] || '';
                if (!topDep) continue;
                const depName = stripVer(topDep);
                const depVersion = topDep.slice(depName.length + 1);
                if (!depGroups.has(depName)) depGroups.set(depName, { depName, vulns: new Map(), files: new Map() });
                const g = depGroups.get(depName);
                if (!g.vulns.has(vuln.id)) g.vulns.set(vuln.id, { id: vuln.id, vuln });
                const pkgPath = project.displayTargetFile || 'package.json';
                if (!g.files.has(pkgPath)) g.files.set(pkgPath, depVersion);
            }

            // Section 2: Resolution groups — Map: pkgName → { fixVersion, items: [{id,vuln,entries}] }
            const resGroups = new Map();
            for (const { vuln, project } of allVulnEntries) {
                const dec = decisions[vuln.id];
                if (dec?.status === 'resolved' || dec?.status === 'skipped') continue;
                const fix = sameMajorFixVersion(vuln);
                if (!fix) continue;
                const pkg = vuln.name || vuln.packageName || '';
                if (!pkg) continue;
                if (!resGroups.has(pkg)) resGroups.set(pkg, { fixVersion: fix, itemsMap: new Map() });
                const g = resGroups.get(pkg);
                if (semverLt(fix, g.fixVersion)) g.fixVersion = fix;
                if (!g.itemsMap.has(vuln.id)) g.itemsMap.set(vuln.id, { id: vuln.id, vuln, entries: [] });
                g.itemsMap.get(vuln.id).entries.push({ vuln, project });
            }
            for (const g of resGroups.values()) {
                g.items = [...g.itemsMap.values()];
                delete g.itemsMap;
            }

            // Section 3: Ignore data
            const nearItems = new Map();   // snykFile → [{id,vuln,entry,nearMatch,resolved}]
            const ignoreVulns = new Map(); // id → {id,vuln,paths:[{snykFile,depPath,topLevelDep}]}

            for (const { vuln, project } of allVulnEntries) {
                const id = vuln.id;
                const decision = decisions[id];
                if (decision?.status === 'resolved' || decision?.status === 'skipped') continue;

                // Near-ignored check
                const near = getNear(vuln, project);
                const activePath = (vuln.from?.slice(1) || []).join(' > ');
                if (near) {
                    const exactMatch = activePath === near.path;
                    if (!exactMatch) {
                        // Stale path (package names match but versions changed) — show in Near-ignored only
                        const sf = getSnykFilePath(project);
                        if (!nearItems.has(sf)) nearItems.set(sf, []);
                        const existing = nearItems.get(sf).find(item => item.id === id && item.nearMatch.path === near.path);
                        if (!existing) {
                            nearItems.get(sf).push({ id, vuln, entry: { vuln, project }, nearMatch: near, resolved: false });
                        }
                        continue;
                    }
                    // Exact match — falls through to Snyk Ignores as alreadyIgnored
                }

                // Ignore candidates — alreadyIgnored=true only for exact .snyk matches
                const snykFile = getSnykFilePath(project);
                const depPath = activePath;
                const topLevelDep = stripVer(vuln.from?.[1] || '');
                if (!ignoreVulns.has(id)) ignoreVulns.set(id, { id, vuln, paths: [] });
                const v = ignoreVulns.get(id);
                const key = snykFile + '\0' + depPath;
                if (!v.paths.some(p => p.snykFile + '\0' + p.depPath === key)) {
                    v.paths.push({ snykFile, depPath, topLevelDep, alreadyIgnored: near != null, existingReason: near?.reason || '' });
                }
            }

            // Include vulns suppressed by .snyk (filtered.ignore) — show as already-resolved in Snyk Ignores
            for (const project of projects) {
                for (const vuln of (project.filtered?.ignore || [])) {
                    const id = vuln.id;
                    if (decisions[id]?.status === 'resolved') continue;
                    const snykFile = getSnykFilePath(project);
                    const depPath = (vuln.from?.slice(1) || []).join(' > ');
                    const topLevelDep = stripVer(vuln.from?.[1] || '');
                    if (!ignoreVulns.has(id)) ignoreVulns.set(id, { id, vuln, paths: [] });
                    const v = ignoreVulns.get(id);
                    const key = snykFile + '\0' + depPath;
                    if (!v.paths.some(p => p.snykFile + '\0' + p.depPath === key)) {
                        const filteredReason = vuln.filtered?.ignored?.[0]?.reason || '';
                        v.paths.push({ snykFile, depPath, topLevelDep, alreadyIgnored: true, existingReason: filteredReason });
                    }
                }
            }

            // Reviewed list
            const reviewed = [];
            const seenReviewed = new Set();
            for (const [id, dec] of Object.entries(decisions)) {
                if (dec.status !== 'resolved' && dec.status !== 'skipped') continue;
                if (seenReviewed.has(id)) continue;
                seenReviewed.add(id);
                const entry = allVulnEntries.find(e => e.vuln.id === id);
                if (entry) reviewed.push({ id, vuln: entry.vuln, decision: dec });
            }

            // Auto-resolve vulns whose every path is already covered by a .snyk entry
            const autoResolvedIds = new Set();
            for (const [id, { vuln, paths }] of ignoreVulns) {
                if (paths.length && paths.every(p => p.alreadyIgnored) && !seenReviewed.has(id)) {
                    autoResolvedIds.add(id);
                    seenReviewed.add(id);
                    reviewed.push({ id, vuln, decision: { status: 'resolved', resolution: 'snyk-ignore', note: 'All paths already in .snyk' } });
                }
            }

            return { depGroups, resGroups, ignoreData: { nearItems, ignoreVulns, autoResolvedIds }, reviewed };
        }

        // ── HTML helpers ──
        function sevBadge(vuln) {
            const s = sevClass(vuln);
            return `<span class="sev-badge ${s}">${s}</span>`;
        }

        function vulnListHtml(items) {
            return items.map(({ id, vuln }) => {
                const cves = (vuln.identifiers?.CVE || []).map(c =>
                    `<a class="cve-link" href="https://nvd.nist.gov/vuln/detail/${esc(c)}" target="_blank" rel="noopener">${esc(c)}</a>`
                ).join(' ');
                return `<div class="rq-vuln-item">
                    ${sevBadge(vuln)}
                    <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener">${esc(id)}</a>
                    <span class="rq-vuln-title">${esc(vuln.title || '')}</span>
                    ${cves}
                </div>`;
            }).join('');
        }

        function installStep() {
            return `<div class="rq-step">
                <span class="step-num">3</span>
                <div class="step-content">
                    <span class="step-label">Install dependencies</span>
                    <span class="step-code-line">npm run bootstrap <button class="btn btn-sm btn-outline" data-action="copy" data-copy="npm run bootstrap" style="margin-left:4px">&#x2398; Copy</button></span>
                </div>
            </div>`;
        }

        function checkVersionsBtn(pkg, recommendedVersion, panelId) {
            return `<button class="btn btn-sm btn-outline" data-action="check-versions"
                data-pkg="${esc(pkg)}"
                data-recommend="${esc(recommendedVersion)}"
                data-panel="${esc(panelId)}">Check versions &#x25BE;</button>
            <div class="versions-panel" id="${esc(panelId)}" style="display:none"></div>`;
        }

        function allIds(items) { return items.map(i => i.id).join(','); }

        function actionButtons(ids, resolution, note, extraHtml) {
            return `<div class="rq-actions">
                <button class="btn btn-primary" data-action="resolve" data-ids="${esc(ids)}" data-resolution="${esc(resolution)}" data-note="${esc(note)}">&#x2713; Mark as Resolved</button>
                <button class="btn btn-outline" data-action="skip" data-ids="${esc(ids)}">Skip</button>
                ${extraHtml || ''}
            </div>`;
        }

        // ── Section 1: Dependency Upgrades ──
        function renderDepUpgradeSection(depGroups) {
            if (!depGroups.size) return '';
            const cardsHtml = [...depGroups.entries()].map(([depName, group]) => {
                const { vulns, files } = group;
                const vulnBadgesHtml = [...vulns.entries()].map(([id, { vuln }]) => {
                    const s = sevClass(vuln);
                    return `<a class="vuln-tag-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener" title="${esc(vuln.title || '')}"><span class="sev-badge ${s}" style="font-size:9px;padding:1px 4px">${s}</span> <span style="font-family:monospace;font-size:11px">${esc(id)}</span></a>`;
                }).join('');
                const fileRowsHtml = [...files.entries()].map(([pkgPath, currentVer]) => {
                    const safeId = (depName + '-' + pkgPath).replace(/[^a-z0-9]/gi, '-');
                    const panelId = 'vp-dep-' + safeId;
                    return `<div class="dep-card-file-row">
                        <span class="dep-file-path">${esc(pkgPath)}</span>
                        <span class="dep-file-version">@${esc(currentVer)}</span>
                        <div class="dep-file-actions">
                            <div>${checkVersionsBtn(depName, '', panelId)}</div>
                            <button class="btn btn-sm btn-accent" data-action="update-dep"
                                data-path="${esc(pkgPath)}" data-dep="${esc(depName)}" data-version="${esc(currentVer)}">Update package.json</button>
                            <button class="btn btn-sm btn-outline" data-action="remove-dep"
                                data-path="${esc(pkgPath)}" data-dep="${esc(depName)}">Remove dep</button>
                        </div>
                    </div>`;
                }).join('');
                return `<div class="dep-card">
                    <div class="dep-card-header">
                        <span class="dep-card-name">${npmLink(depName)}${esc(depName)}</span>
                        <div class="dep-card-vulns">${vulnBadgesHtml}</div>
                    </div>
                    <div class="dep-card-body">${fileRowsHtml}</div>
                </div>`;
            }).join('');
            return `<details class="tool-section">
                <summary class="tool-section-header">
                    <span class="tool-section-chevron">&#x25BC;</span>
                    <span class="tool-section-num">1</span>
                    <span class="tool-section-title">Dependency Upgrades</span>
                    <span class="tool-section-desc">Group by top-level dep — try a newer version.</span>
                    <span class="tool-section-badge">${depGroups.size}</span>
                </summary>
                <div class="tool-section-body">${cardsHtml}</div>
            </details>`;
        }

        // ── Section 2: Yarn Resolutions ──
        function renderResolutionSection(resGroups) {
            if (!resGroups.size) return '';
            const cardsHtml = [...resGroups.entries()].map(([pkg, batch]) => renderCatBCard(pkg, batch)).join('');
            return `<details class="tool-section">
                <summary class="tool-section-header">
                    <span class="tool-section-chevron">&#x25BC;</span>
                    <span class="tool-section-num">2</span>
                    <span class="tool-section-title">Yarn Resolutions</span>
                    <span class="tool-section-desc">Group by vulnerable package — pin a same-major fix.</span>
                    <span class="tool-section-badge">${resGroups.size}</span>
                </summary>
                <div class="tool-section-body">${cardsHtml}</div>
            </details>`;
        }

        function renderCatBCard(pkg, batch) {
            const { fixVersion, items } = batch;
            const resolutionKey = `**/${pkg}`;
            const cardId = 'card-b-' + pkg.replace(/[^a-z0-9]/gi, '-');
            const panelId = 'vp-b-' + pkg.replace(/[^a-z0-9]/gi, '-');
            const ids = allIds(items);
            return `<div class="rq-card" id="${esc(cardId)}">
                <div class="rq-card-header">
                    <span class="rq-card-title">${npmLink(pkg)}Pin <code>${esc(pkg)}</code> &#x2192; <code>${esc(fixVersion)}</code></span>
                </div>
                <div class="rq-card-body">
                    <div class="rq-vuln-list">${vulnListHtml(items)}</div>
                    <div class="rq-steps">
                        <div class="rq-step">
                            <span class="step-num">1</span>
                            <div class="step-content">
                                <span class="step-label">Check available versions</span>
                                ${checkVersionsBtn(pkg, fixVersion, panelId)}
                            </div>
                        </div>
                        <div class="rq-step">
                            <span class="step-num">2</span>
                            <div class="step-content">
                                <span class="step-label">Add resolution to root <code>package.json</code></span>
                                <div class="resolution-snippet">
                                    <code>"${esc(resolutionKey)}": "${esc(fixVersion)}"</code>
                                    <button class="btn btn-sm btn-outline" data-action="copy" data-copy="${esc('"' + resolutionKey + '": "' + fixVersion + '"')}">&#x2398; Copy</button>
                                </div>
                                <button class="btn btn-sm btn-accent" data-action="apply-resolution"
                                    data-key="${esc(resolutionKey)}" data-version="${esc(fixVersion)}">Apply to package.json</button>
                            </div>
                        </div>
                        ${installStep()}
                    </div>
                    ${actionButtons(ids, 'yarn-resolution', 'Added ' + resolutionKey + ': ' + fixVersion)}
                </div>
            </div>`;
        }

        // ── Section 3: Snyk Ignores ──
        function renderIgnoreSection(ignoreData) {
            const { nearItems, ignoreVulns } = ignoreData;
            const cardId = 's3';
            const expiry = sharedExpiry || '';
            const presetOptionsHtml = IGNORE_REASONS.map(r =>
                `<option value="${esc(r)}">${esc(r)}</option>`
            ).join('');

            // Near-ignored panel
            let nearHtml = '';
            if (nearItems.size) {
                const allNearUpdates = [];
                for (const [sf, items] of nearItems.entries()) {
                    for (const { id, nearMatch, entry, resolved } of items) {
                        if (!resolved) {
                            const activePath = (entry.vuln.from?.slice(1) || []).join(' > ');
                            allNearUpdates.push({ snykFile: sf, vulnId: id, oldPath: nearMatch.path, newPath: activePath });
                        }
                    }
                }
                const updateAllBtn = allNearUpdates.length
                    ? `<button class="btn btn-sm btn-warn" style="margin-left:auto" data-action="update-all-near"
                            data-updates="${esc(JSON.stringify(allNearUpdates))}">Update All .snyk Files</button>`
                    : '';
                const nearGroupsHtml = [...nearItems.entries()].map(([sf, items]) => renderCatDGroup(sf, items)).join('');
                nearHtml = `<details class="s3-near-panel"${nearPanelOpen ? ' open' : ''}>
                    <summary class="s3-near-summary">
                        <span>&#x26A1; Outdated versions &#x2014; stale .snyk paths</span>
                        <span class="s3-near-count">${nearItems.size} file${nearItems.size !== 1 ? 's' : ''}</span>
                        ${updateAllBtn}
                    </summary>
                    <div class="s3-near-body">${nearGroupsHtml}</div>
                </details>`;
            }

            // Shared expiry
            const expiryHtml = `<div class="s3-expiry-row">
                <label class="ignore-form-label">Expiry (shared)</label>
                <input type="text" class="ignore-form-input batch-ignore-expiry" id="expiry-${cardId}"
                    data-card="${cardId}" value="${esc(expiry)}" placeholder="2026-06-08T00:00:00.000Z" style="width:280px">
            </div>`;

            // Build per-vuln cards with global path indices
            let globalIdx = 0;
            const vulnCards = [];

            for (const [id, { vuln, paths }] of ignoreVulns) {
                const skipped = skipState.vulns.has(id);
                const startIdx = globalIdx;
                // Group paths by top-level dep
                const byDep = new Map();
                for (const path of paths) {
                    if (!byDep.has(path.topLevelDep)) byDep.set(path.topLevelDep, []);
                    const idx = globalIdx++;
                    byDep.get(path.topLevelDep).push({ ...path, idx });
                }
                vulnCards.push({ id, vuln, skipped, byDep, startIdx });
            }

            // Sort by severity (critical→low), resolved cards to bottom
            const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
            vulnCards.sort((a, b) => {
                const aResolved = [...a.byDep.values()].every(dps => dps.every(p => p.alreadyIgnored));
                const bResolved = [...b.byDep.values()].every(dps => dps.every(p => p.alreadyIgnored));
                if (aResolved !== bResolved) return aResolved ? 1 : -1;
                return (SEV_ORDER[sevClass(a.vuln)] ?? 4) - (SEV_ORDER[sevClass(b.vuln)] ?? 4);
            });

            const vulnCardsHtml = vulnCards.map(({ id, vuln, skipped, byDep }, vi) => {
                // Top-level dep tags for skip-by-dep
                const depTagsHtml = [...byDep.keys()].filter(Boolean).map(dep => {
                    const active = skipState.deps.has(dep);
                    return `<button class="skip-dep-tag${active ? ' skipped' : ''}" data-action="skip-dep" data-dep="${esc(dep)}">${esc(dep)} &#x2715;</button>`;
                }).join('');

                // Total path count and dep count for header badge
                let totalPaths = 0;
                let resolvedPaths = 0;
                for (const [, dps] of byDep) {
                    totalPaths += dps.length;
                    resolvedPaths += dps.filter(p => p.alreadyIgnored).length;
                }
                const depCount = byDep.size;
                const resolvedPart = resolvedPaths > 0 ? ` &middot; <span class="s3-resolved-count">${resolvedPaths} resolved</span>` : '';
                const countBadge = `<span class="s3-path-count-badge">${totalPaths} path${totalPaths !== 1 ? 's' : ''} &middot; ${depCount} dep${depCount !== 1 ? 's' : ''}${resolvedPart}</span>`;

                const allPathsIgnored = [...byDep.values()].every(dps => dps.every(p => p.alreadyIgnored));

                // ── By-file view: build byFile from byDep ──
                const byFile = new Map();
                for (const [, dps] of byDep) {
                    for (const path of dps) {
                        if (!byFile.has(path.snykFile)) byFile.set(path.snykFile, []);
                        byFile.get(path.snykFile).push(path);
                    }
                }
                const fileGroupsHtml = [...byFile.entries()].map(([snykFile, fps]) => {
                    const allFileIgnored = fps.every(p => p.alreadyIgnored);
                    const pendingCount = fps.filter(p => !p.alreadyIgnored).length;
                    const safeFileId = snykFile.replace(/[^a-z0-9]/gi, '-');
                    const groupId = `s3-file-${vi}-${safeFileId}`;
                    const reasonInputId = `file-reason-${vi}-${safeFileId}`;
                    const rowsHtml = fps.map(path => {
                        if (path.alreadyIgnored) {
                            return `<div class="path-checkbox-row path-already-ignored" data-top-dep="${esc(path.topLevelDep)}">
                                <span class="path-already-ignored-check">&#x2713;</span>
                                <span class="path-deppath">${esc(path.depPath)}</span>
                                <input type="text" class="ignore-form-input already-ignored-reason-input"
                                    value="${esc(path.existingReason || '')}" placeholder="Reason&hellip;"
                                    data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(id)}" data-dep-path="${esc(path.depPath)}">
                                <button class="btn btn-sm btn-outline" data-action="update-ignore-reason"
                                    data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(id)}" data-dep-path="${esc(path.depPath)}">Update</button>
                                <span class="already-ignored-badge">Already in .snyk</span>
                            </div>`;
                        }
                        const depSkipped = skipState.deps.has(path.topLevelDep);
                        return `<div class="path-checkbox-row${depSkipped ? ' dep-skipped' : ''}" data-top-dep="${esc(path.topLevelDep)}">
                            <input type="checkbox" class="path-cb"${depSkipped ? '' : ' checked'}
                                data-card="${cardId}" data-vuln-idx="${vi}" data-vuln-id="${esc(id)}">
                            <span class="path-deppath">${esc(path.depPath)}</span>
                        </div>`;
                    }).join('');
                    return `<div class="s3-dep-group${allFileIgnored ? ' s3-dep-group--done' : ''}" data-snyk-file="${esc(snykFile)}" id="${esc(groupId)}">
                        <div class="s3-dep-group-header" data-action="toggle-dep-group" data-group-id="${esc(groupId)}">
                            <span class="s3-dep-group-chevron">&#x25BC;</span>
                            <span class="s3-dep-group-name">${esc(snykFile)}</span>
                            <span class="s3-dep-group-count">${fps.length} path${fps.length !== 1 ? 's' : ''}</span>
                            ${allFileIgnored ? '<span class="already-ignored-badge">&#x2713; In .snyk</span>' : ''}
                        </div>
                        <div class="s3-dep-group-body">
                        ${!allFileIgnored ? `<div class="s3-dep-group-reason-row">
                            <input class="s3-dep-reason ignore-form-input" id="${esc(reasonInputId)}"
                                placeholder="Reason for all paths in this file\u2026">
                            <select class="s3-dep-preset ignore-form-input" data-target-input="${esc(reasonInputId)}">
                                <option value="">Preset\u2026</option>
                                ${presetOptionsHtml}
                            </select>
                        </div>` : ''}
                        ${rowsHtml}
                        ${!allFileIgnored ? `<button class="btn btn-sm btn-accent s3-dep-add-btn"
                            data-action="add-file-group"
                            data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(id)}" data-group-id="${esc(groupId)}">
                            Add ${pendingCount} path${pendingCount !== 1 ? 's' : ''} to .snyk
                        </button>` : ''}
                        </div>
                    </div>`;
                }).join('');

                const depGroupsHtml = [...byDep.entries()].map(([depName, dps]) => {
                    const allDepIgnored = dps.every(p => p.alreadyIgnored);
                    const pendingCount = dps.filter(p => !p.alreadyIgnored).length;
                    const safeDepId = depName.replace(/[^a-z0-9]/gi, '-');
                    const groupId = `s3-dep-${vi}-${safeDepId}`;
                    const reasonInputId = `dep-reason-${vi}-${safeDepId}`;
                    const rowsHtml = dps.map(path => {
                        if (path.alreadyIgnored) {
                            return `<div class="path-checkbox-row path-already-ignored" data-top-dep="${esc(depName)}">
                                <span class="path-already-ignored-check">&#x2713;</span>
                                <span class="s3-file-badge">${esc(path.snykFile)}</span>
                                <span class="path-deppath">${esc(path.depPath)}</span>
                                <input type="text" class="ignore-form-input already-ignored-reason-input"
                                    value="${esc(path.existingReason || '')}" placeholder="Reason&hellip;"
                                    data-snyk-file="${esc(path.snykFile)}" data-vuln-id="${esc(id)}" data-dep-path="${esc(path.depPath)}">
                                <button class="btn btn-sm btn-outline" data-action="update-ignore-reason"
                                    data-snyk-file="${esc(path.snykFile)}" data-vuln-id="${esc(id)}" data-dep-path="${esc(path.depPath)}">Update</button>
                                <span class="already-ignored-badge">Already in .snyk</span>
                            </div>`;
                        }
                        return `<div class="path-checkbox-row" data-top-dep="${esc(depName)}">
                            <input type="checkbox" class="path-cb" checked
                                data-card="${cardId}" data-vuln-idx="${vi}" data-vuln-id="${esc(id)}">
                            <span class="s3-file-badge">${esc(path.snykFile)}</span>
                            <span class="path-deppath">${esc(path.depPath)}</span>
                        </div>`;
                    }).join('');
                    return `<div class="s3-dep-group${allDepIgnored ? ' s3-dep-group--done' : ''}" data-dep="${esc(depName)}" id="${esc(groupId)}">
                        <div class="s3-dep-group-header" data-action="toggle-dep-group" data-group-id="${esc(groupId)}">
                            <span class="s3-dep-group-chevron">&#x25BC;</span>
                            <span class="s3-dep-group-name">${npmLink(depName)}${esc(depName)}</span>
                            <span class="s3-dep-group-count">${dps.length} path${dps.length !== 1 ? 's' : ''}</span>
                            ${allDepIgnored ? '<span class="already-ignored-badge">&#x2713; In .snyk</span>' : ''}
                        </div>
                        <div class="s3-dep-group-body">
                        ${!allDepIgnored ? `<div class="s3-dep-group-reason-row">
                            <input class="s3-dep-reason ignore-form-input" id="${esc(reasonInputId)}"
                                placeholder="Reason for ${esc(depName)}\u2026">
                            <select class="s3-dep-preset ignore-form-input" data-target-input="${esc(reasonInputId)}">
                                <option value="">Preset\u2026</option>
                                ${presetOptionsHtml}
                            </select>
                        </div>` : ''}
                        ${rowsHtml}
                        ${!allDepIgnored ? `<button class="btn btn-sm btn-accent s3-dep-add-btn"
                            data-action="add-dep-group"
                            data-dep="${esc(depName)}" data-vuln-id="${esc(id)}" data-group-id="${esc(groupId)}">
                            Add ${pendingCount} path${pendingCount !== 1 ? 's' : ''} to .snyk
                        </button>` : ''}
                        </div>
                    </div>`;
                }).join('');

                // ── All-paths view: single flat group ──
                const allPaths = [...byDep.values()].flat();
                const allAllIgnored = allPaths.every(p => p.alreadyIgnored);
                const pendingAllCount = allPaths.filter(p => !p.alreadyIgnored).length;
                const allGroupId = `s3-all-${vi}`;
                const allReasonInputId = `all-reason-${vi}`;
                const allRowsHtml = allPaths.map(path => {
                    if (path.alreadyIgnored) {
                        return `<div class="path-checkbox-row path-already-ignored" data-top-dep="${esc(path.topLevelDep)}">
                                <span class="path-already-ignored-check">&#x2713;</span>
                                <span class="s3-file-badge">${esc(path.snykFile)}</span>
                                <span class="path-deppath">${esc(path.depPath)}</span>
                                <input type="text" class="ignore-form-input already-ignored-reason-input"
                                    value="${esc(path.existingReason || '')}" placeholder="Reason&hellip;"
                                    data-snyk-file="${esc(path.snykFile)}" data-vuln-id="${esc(id)}" data-dep-path="${esc(path.depPath)}">
                                <button class="btn btn-sm btn-outline" data-action="update-ignore-reason"
                                    data-snyk-file="${esc(path.snykFile)}" data-vuln-id="${esc(id)}" data-dep-path="${esc(path.depPath)}">Update</button>
                                <span class="already-ignored-badge">Already in .snyk</span>
                            </div>`;
                    }
                    return `<div class="path-checkbox-row" data-top-dep="${esc(path.topLevelDep)}">
                            <input type="checkbox" class="path-cb" checked
                                data-card="${cardId}" data-vuln-idx="${vi}" data-vuln-id="${esc(id)}">
                            <span class="s3-file-badge">${esc(path.snykFile)}</span>
                            <span class="path-deppath">${esc(path.depPath)}</span>
                        </div>`;
                }).join('');
                const allGroupsHtml = `<div class="s3-dep-group${allAllIgnored ? ' s3-dep-group--done' : ''}" id="${esc(allGroupId)}">
                    <div class="s3-dep-group-header" data-action="toggle-dep-group" data-group-id="${esc(allGroupId)}">
                        <span class="s3-dep-group-chevron">&#x25BC;</span>
                        <span class="s3-dep-group-count">${allPaths.length} path${allPaths.length !== 1 ? 's' : ''} across ${byDep.size} dep${byDep.size !== 1 ? 's' : ''}</span>
                        ${allAllIgnored ? '<span class="already-ignored-badge">&#x2713; All in .snyk</span>' : ''}
                    </div>
                    <div class="s3-dep-group-body">
                        ${!allAllIgnored ? `<div class="s3-dep-group-reason-row">
                            <input class="s3-dep-reason ignore-form-input" id="${esc(allReasonInputId)}"
                                placeholder="Reason for all paths\u2026">
                            <select class="s3-dep-preset ignore-form-input" data-target-input="${esc(allReasonInputId)}">
                                <option value="">Preset\u2026</option>
                                ${presetOptionsHtml}
                            </select>
                        </div>` : ''}
                        ${allRowsHtml}
                        ${!allAllIgnored ? `<button class="btn btn-sm btn-accent s3-dep-add-btn"
                            data-action="add-all-group"
                            data-vuln-id="${esc(id)}" data-group-id="${esc(allGroupId)}">
                            Add ${pendingAllCount} path${pendingAllCount !== 1 ? 's' : ''} to .snyk
                        </button>` : ''}
                    </div>
                </div>`;

                return `<details class="rq-card s3-vuln-card${skipped ? ' s3-card-skipped' : ''}${allPathsIgnored ? ' s3-card-all-ignored' : ''}" id="s3-card-${vi}" data-vuln-id="${esc(id)}">
                    <summary class="rq-card-header s3-card-header">
                        <div class="s3-card-header-main">
                            <span class="s3-card-chevron">&#x25BC;</span>
                            ${sevBadge(vuln)}
                            <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener">${esc(id)}</a>
                            <span class="rq-card-title">${esc(vuln.title || '')}</span>
                            ${countBadge}
                            ${allPathsIgnored ? '<span class="s3-all-resolved-badge">&#x2713; Resolved</span>' : ''}
                        </div>
                        <div class="s3-card-header-right">
                            ${depTagsHtml ? `<span class="s3-via-label">Via:</span> ${depTagsHtml}` : ''}
                            <button class="skip-btn${skipped ? ' active' : ''}" data-action="skip-vuln" data-vuln-id="${esc(id)}">Skip &#x2715;</button>
                        </div>
                    </summary>
                    ${skipped
                        ? '<div class="s3-skipped-overlay">Skipped</div>'
                        : `<div class="rq-card-body">${s3ViewMode === 'by-dep' ? depGroupsHtml : s3ViewMode === 'by-file' ? fileGroupsHtml : allGroupsHtml}</div>`}
                </details>`;
            }).join('');

            const unresolvedCount = vulnCards.filter(c => !c.skipped && ![...c.byDep.values()].every(dps => dps.every(p => p.alreadyIgnored))).length;
            const allVulnIds = [...ignoreVulns.keys()].filter(id => !skipState.vulns.has(id)).join(',');
            const globalActionsHtml = `<div class="rq-actions s3-global-actions">
                <button class="btn btn-primary" data-action="resolve"
                    data-ids="${esc(allVulnIds)}"
                    data-resolution="snyk-ignore"
                    data-note="All paths added to .snyk">&#x2713; Mark All as Resolved</button>
            </div>`;

            return `<details class="tool-section">
                <summary class="tool-section-header">
                    <span class="tool-section-chevron">&#x25BC;</span>
                    <span class="tool-section-num">3</span>
                    <span class="tool-section-title">Snyk Ignores</span>
                    <span class="tool-section-desc">${s3ViewMode === 'by-dep' ? 'Grouped by top-level dep.' : s3ViewMode === 'by-file' ? 'Grouped by .snyk file.' : 'All paths in one list.'}</span>
                    <div class="seg-btn-group s3-view-seg">
                        <button class="seg-btn${s3ViewMode === 'by-dep' ? ' active' : ''}" data-action="set-s3-view" data-mode="by-dep">By Dep</button>
                        <button class="seg-btn${s3ViewMode === 'by-file' ? ' active' : ''}" data-action="set-s3-view" data-mode="by-file">By File</button>
                        <button class="seg-btn${s3ViewMode === 'all' ? ' active' : ''}" data-action="set-s3-view" data-mode="all">All</button>
                    </div>
                    <span class="tool-section-badge" id="s3-heading-badge">${unresolvedCount} / ${ignoreVulns.size}</span>
                </summary>
                <div class="tool-section-body">
                    ${expiryHtml}
                    ${nearHtml}
                    ${vulnCardsHtml}
                    ${globalActionsHtml}
                </div>
            </details>`;
        }

        // ── Category D group (reused inside Section 3 near panel) ──
        function renderCatDGroup(snykFile, items) {
            const groupId = 'near-' + snykFile.replace(/[^a-z0-9]/gi, '-');
            const allResolved = items.every(i => i.resolved);
            const unresolvedItems = items.filter(i => !i.resolved);

            // Group items by vuln ID, preserving insertion order
            const byVuln = new Map();
            for (const item of items) {
                if (!byVuln.has(item.id)) byVuln.set(item.id, []);
                byVuln.get(item.id).push(item);
            }

            function renderPathEntry(id, entry, nearMatch) {
                const activeParts = entry.vuln.from?.slice(1) || [];
                const snykParts = nearMatch.path.split(' > ');
                const snykVerByName = new Map(snykParts.map(p => [stripVer(p), p.slice(stripVer(p).length)]));
                const activeVerByName = new Map(activeParts.map(p => [stripVer(p), p.slice(stripVer(p).length)]));

                function highlightPath(parts, isSnyk) {
                    return parts.map(p => {
                        const name = stripVer(p);
                        const ver = p.slice(name.length);
                        const other = isSnyk ? activeVerByName.get(name) : snykVerByName.get(name);
                        const changed = other !== undefined && other !== ver;
                        return changed
                            ? `${esc(name)}<span class="changed">${esc(ver)}</span>`
                            : esc(p);
                    }).join('<span style="color:var(--c-border);font-size:10px;margin:0 2px">&#x2192;</span>');
                }

                const activePath = activeParts.join(' > ');
                return `<div class="near-path-entry">
                    <div class="near-paths">
                        <div class="near-path-row">
                            <span class="near-path-lbl lbl-snyk">.snyk</span>
                            <span class="near-path-text snyk-side">${highlightPath(snykParts, true)}</span>
                        </div>
                        <div class="near-path-row">
                            <span class="near-path-lbl lbl-active">active</span>
                            <span class="near-path-text">${activeParts.length ? highlightPath(activeParts, false) : '<em style="color:var(--c-text-muted)">Direct dependency</em>'}</span>
                        </div>
                        ${nearMatch.reason ? `<div style="font-size:11px;color:var(--c-text-muted);margin-top:4px;font-style:italic">${esc(nearMatch.reason)}</div>` : ''}
                    </div>
                    <div style="margin-top:8px">
                        <button class="btn btn-sm btn-warn" data-action="update-snyk"
                            data-snyk-file="${esc(snykFile)}"
                            data-vuln-id="${esc(id)}"
                            data-old-path="${esc(nearMatch.path)}"
                            data-new-path="${esc(activePath)}">Update .snyk</button>
                    </div>
                </div>`;
            }

            const vulnGroupsHtml = [...byVuln.entries()].map(([id, vulnItems]) => {
                const vuln = vulnItems[0].vuln;
                const unresolvedVulnItems = vulnItems.filter(i => !i.resolved);
                const vulnUpdates = unresolvedVulnItems.map(({ nearMatch, entry }) => ({
                    snykFile, vulnId: id,
                    oldPath: nearMatch.path,
                    newPath: (entry.vuln.from?.slice(1) || []).join(' > '),
                }));
                const updateAllVulnBtn = vulnUpdates.length > 1
                    ? `<button class="btn btn-sm btn-warn" style="margin-left:auto" data-action="update-all-near"
                            data-updates="${esc(JSON.stringify(vulnUpdates))}">Update all paths</button>`
                    : '';
                const pathsHtml = unresolvedVulnItems.map(({ entry, nearMatch }) =>
                    renderPathEntry(id, entry, nearMatch)
                ).join('');
                return `<div class="near-item">
                    <div class="near-item-header">
                        ${sevBadge(vuln)}
                        <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener">${esc(id)}</a>
                        <span style="color:var(--c-text-muted);font-size:12px">${esc(vuln.title || '')}</span>
                        ${updateAllVulnBtn}
                    </div>
                    ${pathsHtml}
                </div>`;
            }).join('');

            const allUpdates = unresolvedItems.map(({ id, nearMatch, entry }) => ({
                snykFile, vulnId: id,
                oldPath: nearMatch.path,
                newPath: (entry.vuln.from?.slice(1) || []).join(' > '),
            }));
            const uniqueVulnCount = byVuln.size;
            const countBadge = `<span class="near-group-count">${uniqueVulnCount} vuln${uniqueVulnCount !== 1 ? 's' : ''}</span>`;
            const resolvedPill = allResolved ? '<span class="near-group-resolved-pill">&#x2713; Resolved</span>' : '';
            const toggleArrow = `<span class="near-toggle-arrow">${allResolved ? '&#x25B6;' : '&#x25BC;'}</span>`;
            const updateAllBtn = !allResolved
                ? `<button class="btn btn-sm btn-warn" style="margin-left:auto" data-action="update-all-near"
                        data-updates="${esc(JSON.stringify(allUpdates))}">Update All in This File</button>`
                : '';

            return `<div class="near-group" id="${esc(groupId)}">
                <div class="near-group-header near-group-toggle" data-action="toggle-near-group" data-group="${esc(groupId)}">
                    <span class="near-toggle-arrow-wrap">${toggleArrow}</span>
                    <span class="near-group-file">${esc(snykFile)}</span>
                    ${countBadge}
                    ${resolvedPill}
                    ${updateAllBtn}
                </div>
                <div class="near-group-items" id="${esc(groupId)}-items" style="${allResolved ? 'display:none' : ''}">
                    ${vulnGroupsHtml}
                </div>
            </div>`;
        }

        // ── Progress bar ──
        // applyProgress: update the DOM elements only (call with pre-computed counts)
        function applyProgress(reviewed) {
            const total = reportVulnIds.size;
            const reviewedCount = reviewed.filter(r => reportVulnIds.has(r.id)).length;
            const pct = total > 0 ? Math.round((reviewedCount / total) * 100) : 0;
            const fill = document.getElementById('rq-progress-fill');
            const progressText = document.getElementById('rq-progress-text');
            const badge = document.getElementById('queue-badge');
            if (fill) fill.style.width = pct + '%';
            if (progressText) progressText.textContent = `${reviewedCount} / ${total} reviewed`;
            if (badge) badge.textContent = total - reviewedCount;
        }

        // recomputeProgress: recompute from current data model and apply — call after any state change
        function recomputeProgress() {
            const { ignoreData, reviewed } = buildSections();
            applyProgress(reviewed);
            // Update Section 3 heading badge
            const badge = document.getElementById('s3-heading-badge');
            if (badge) {
                const { ignoreVulns, autoResolvedIds } = ignoreData;
                const unresolvedCount = [...ignoreVulns.keys()].filter(
                    id => !skipState.vulns.has(id) && !autoResolvedIds.has(id)
                ).length;
                badge.textContent = `${unresolvedCount} / ${ignoreVulns.size}`;
            }
        }

        // ── Render the full tab ──
        function renderReviewQueueTab() {
            const { depGroups, resGroups, ignoreData, reviewed } = buildSections();

            applyProgress(reviewed);

            let html = '';
            html += renderDepUpgradeSection(depGroups);
            html += renderResolutionSection(resGroups);
            html += renderIgnoreSection(ignoreData);

            const pendingIgnoreCount = ignoreData.ignoreVulns.size - ignoreData.autoResolvedIds.size;
            if (!depGroups.size && !resGroups.size && !pendingIgnoreCount) {
                html = `<div class="rq-empty"><div class="empty-icon">&#x1F389;</div><p>No pending items &#x2014; all vulnerabilities reviewed!</p></div>`;
            }

            if (reviewed.length) {
                html += `<div class="rq-resolved-section" id="rq-resolved-section">
                    <button class="rq-resolved-toggle" id="rq-resolved-toggle">
                        <span>Reviewed (${reviewed.length})</span>
                        <span class="toggle-arrow">&#x25BC;</span>
                    </button>
                    <div class="rq-resolved-list" id="rq-resolved-list">
                        ${reviewed.map(({ id, vuln, decision }) => {
                            const ts = decision.timestamp ? new Date(decision.timestamp).toLocaleString() : '';
                            return `<div class="rq-resolved-item">
                                ${sevBadge(vuln)}
                                <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener">${esc(id)}</a>
                                <span class="rq-resolved-note">${esc(vuln.title || '')}</span>
                                ${decision.note ? `<span class="rq-resolved-decision-note">${esc(decision.note)}</span>` : ''}
                                <span class="rq-resolved-ts">${esc(ts)}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
            }

            document.getElementById('rq-content').innerHTML = html;
        }

        // ── Event handling (delegated) ──
        function attachEvents() {
            const container = document.getElementById('rq-content');

            function updateCardCountBadge(card) {
                const badge = card.querySelector('.s3-path-count-badge');
                if (!badge) return;
                const totalPaths = card.querySelectorAll('.path-checkbox-row').length;
                const resolvedPaths = card.querySelectorAll('.path-checkbox-row.path-already-ignored').length;
                const depCount = card.querySelectorAll('.s3-dep-group').length;
                const resolvedPart = resolvedPaths > 0 ? ` &middot; <span class="s3-resolved-count">${resolvedPaths} resolved</span>` : '';
                badge.innerHTML = `${totalPaths} path${totalPaths !== 1 ? 's' : ''} &middot; ${depCount} dep${depCount !== 1 ? 's' : ''}${resolvedPart}`;
                const allResolved = totalPaths > 0 && resolvedPaths === totalPaths;
                let checkBadge = card.querySelector('.s3-all-resolved-badge');
                if (allResolved && !checkBadge) {
                    checkBadge = document.createElement('span');
                    checkBadge.className = 's3-all-resolved-badge';
                    checkBadge.textContent = '\u2713 Resolved';
                    badge.insertAdjacentElement('afterend', checkBadge);
                } else if (!allResolved && checkBadge) {
                    checkBadge.remove();
                }
            }

            async function handleAddDepGroup(btn) {
                const { groupId, vulnId } = btn.dataset;
                const group = document.getElementById(groupId);
                const expires = document.getElementById('expiry-s3')?.value?.trim() || '';
                const reason = group?.querySelector('.s3-dep-reason')?.value?.trim() || '';
                if (!expires) { alert('Please enter an expiry date.'); return; }
                if (!reason)  { alert('Please enter a reason.'); return; }

                const toAdd = [];
                group.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb?.checked) return;
                    toAdd.push({
                        snykFile: row.querySelector('.s3-file-badge')?.textContent || '',
                        depPath:  row.querySelector('.path-deppath')?.textContent  || '',
                    });
                });
                if (!toAdd.length) { alert('No checked paths.'); return; }

                btn.disabled = true;
                for (let i = 0; i < toAdd.length; i++) {
                    btn.textContent = `Adding ${i + 1}/${toAdd.length}\u2026`;
                    const { snykFile, depPath } = toAdd[i];
                    const r = await fetch('/add-snyk-ignore', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ snykFile, vulnId, path: depPath, reason, expires }),
                    });
                    const data = await r.json();
                    if (!data.ok) {
                        btn.disabled = false;
                        btn.textContent = `Add ${toAdd.length} path${toAdd.length !== 1 ? 's' : ''} to .snyk`;
                        alert('Failed: ' + data.error); return;
                    }
                }
                btn.textContent = '\u2713 Added';

                for (const { snykFile, depPath } of toAdd) {
                    if (!localAddedPatterns[snykFile]) localAddedPatterns[snykFile] = {};
                    if (!localAddedPatterns[snykFile][vulnId]) localAddedPatterns[snykFile][vulnId] = [];
                    localAddedPatterns[snykFile][vulnId].push({ path: depPath, reason });
                }
                recomputeProgress();

                group.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb?.checked) return;
                    const snykFile = row.querySelector('.s3-file-badge')?.textContent || '';
                    const depPath  = row.querySelector('.path-deppath')?.textContent  || '';
                    const topDep   = row.dataset.topDep || '';
                    row.className = 'path-checkbox-row path-already-ignored';
                    row.dataset.topDep = topDep;
                    row.innerHTML = `<span class="path-already-ignored-check">&#x2713;</span>`
                        + `<span class="s3-file-badge">${esc(snykFile)}</span>`
                        + `<span class="path-deppath">${esc(depPath)}</span>`
                        + `<input type="text" class="ignore-form-input already-ignored-reason-input" value="${esc(reason)}" placeholder="Reason&hellip;" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">`
                        + `<button class="btn btn-sm btn-outline" data-action="update-ignore-reason" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">Update</button>`
                        + `<span class="already-ignored-badge">Already in .snyk</span>`;
                });

                group.querySelector('.s3-dep-group-reason-row')?.remove();
                group.classList.add('s3-dep-group--done', 's3-dep-group--collapsed');
                btn.remove();

                const card = group.closest('.s3-vuln-card');
                if (card) {
                    updateCardCountBadge(card);
                    const allGroupsDone = [...card.querySelectorAll('.s3-dep-group')].every(g => g.classList.contains('s3-dep-group--done'));
                    if (allGroupsDone) card.open = false;
                    card.querySelector('.s3-card-header')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            async function handleAddFileGroup(btn) {
                const { groupId, vulnId, snykFile } = btn.dataset;
                const group = document.getElementById(groupId);
                const expires = document.getElementById('expiry-s3')?.value?.trim() || '';
                const reason = group?.querySelector('.s3-dep-reason')?.value?.trim() || '';
                if (!expires) { alert('Please enter an expiry date.'); return; }
                if (!reason)  { alert('Please enter a reason.'); return; }

                const toAdd = [];
                group.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb?.checked) return;
                    toAdd.push({ depPath: row.querySelector('.path-deppath')?.textContent || '' });
                });
                if (!toAdd.length) { alert('No checked paths.'); return; }

                btn.disabled = true;
                for (let i = 0; i < toAdd.length; i++) {
                    btn.textContent = `Adding ${i + 1}/${toAdd.length}\u2026`;
                    const { depPath } = toAdd[i];
                    const r = await fetch('/add-snyk-ignore', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ snykFile, vulnId, path: depPath, reason, expires }),
                    });
                    const data = await r.json();
                    if (!data.ok) {
                        btn.disabled = false;
                        btn.textContent = `Add ${toAdd.length} path${toAdd.length !== 1 ? 's' : ''} to .snyk`;
                        alert('Failed: ' + data.error); return;
                    }
                }
                btn.textContent = '\u2713 Added';

                for (const { depPath } of toAdd) {
                    if (!localAddedPatterns[snykFile]) localAddedPatterns[snykFile] = {};
                    if (!localAddedPatterns[snykFile][vulnId]) localAddedPatterns[snykFile][vulnId] = [];
                    localAddedPatterns[snykFile][vulnId].push({ path: depPath, reason });
                }
                recomputeProgress();

                group.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb?.checked) return;
                    const depPath  = row.querySelector('.path-deppath')?.textContent || '';
                    const topDep   = row.dataset.topDep || '';
                    row.className = 'path-checkbox-row path-already-ignored';
                    row.dataset.topDep = topDep;
                    row.innerHTML = `<span class="path-already-ignored-check">&#x2713;</span>`
                        + `<span class="path-deppath">${esc(depPath)}</span>`
                        + `<input type="text" class="ignore-form-input already-ignored-reason-input" value="${esc(reason)}" placeholder="Reason&hellip;" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">`
                        + `<button class="btn btn-sm btn-outline" data-action="update-ignore-reason" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">Update</button>`
                        + `<span class="already-ignored-badge">Already in .snyk</span>`;
                });

                group.querySelector('.s3-dep-group-reason-row')?.remove();
                group.classList.add('s3-dep-group--done', 's3-dep-group--collapsed');
                btn.remove();

                const card = group.closest('.s3-vuln-card');
                if (card) {
                    updateCardCountBadge(card);
                    const allGroupsDone = [...card.querySelectorAll('.s3-dep-group')].every(g => g.classList.contains('s3-dep-group--done'));
                    if (allGroupsDone) card.open = false;
                    card.querySelector('.s3-card-header')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            async function handleAddAllGroup(btn) {
                const { vulnId, groupId } = btn.dataset;
                const group = document.getElementById(groupId);
                const expires = document.getElementById('expiry-s3')?.value?.trim() || '';
                const reason = group?.querySelector('.s3-dep-reason')?.value?.trim() || '';
                if (!expires) { alert('Please enter an expiry date.'); return; }
                if (!reason)  { alert('Please enter a reason.'); return; }

                const toAdd = [];
                group.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb?.checked) return;
                    toAdd.push({
                        snykFile: row.querySelector('.s3-file-badge')?.textContent || '',
                        depPath:  row.querySelector('.path-deppath')?.textContent  || '',
                        topDep:   row.dataset.topDep || '',
                    });
                });
                if (!toAdd.length) { alert('No checked paths.'); return; }

                btn.disabled = true;
                for (let i = 0; i < toAdd.length; i++) {
                    btn.textContent = `Adding ${i + 1}/${toAdd.length}\u2026`;
                    const { snykFile, depPath } = toAdd[i];
                    const r = await fetch('/add-snyk-ignore', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ snykFile, vulnId, path: depPath, reason, expires }),
                    });
                    const data = await r.json();
                    if (!data.ok) {
                        btn.disabled = false;
                        btn.textContent = `Add ${toAdd.length} path${toAdd.length !== 1 ? 's' : ''} to .snyk`;
                        alert('Failed: ' + data.error); return;
                    }
                }
                btn.textContent = '\u2713 Added';

                for (const { snykFile, depPath } of toAdd) {
                    if (!localAddedPatterns[snykFile]) localAddedPatterns[snykFile] = {};
                    if (!localAddedPatterns[snykFile][vulnId]) localAddedPatterns[snykFile][vulnId] = [];
                    localAddedPatterns[snykFile][vulnId].push({ path: depPath, reason });
                }
                recomputeProgress();

                group.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb?.checked) return;
                    const snykFile = row.querySelector('.s3-file-badge')?.textContent || '';
                    const depPath  = row.querySelector('.path-deppath')?.textContent  || '';
                    const topDep   = row.dataset.topDep || '';
                    row.className = 'path-checkbox-row path-already-ignored';
                    row.dataset.topDep = topDep;
                    row.innerHTML = `<span class="path-already-ignored-check">&#x2713;</span>`
                        + `<span class="s3-file-badge">${esc(snykFile)}</span>`
                        + `<span class="path-deppath">${esc(depPath)}</span>`
                        + `<input type="text" class="ignore-form-input already-ignored-reason-input" value="${esc(reason)}" placeholder="Reason&hellip;" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">`
                        + `<button class="btn btn-sm btn-outline" data-action="update-ignore-reason" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">Update</button>`
                        + `<span class="already-ignored-badge">Already in .snyk</span>`;
                });

                group.querySelector('.s3-dep-group-reason-row')?.remove();
                group.classList.add('s3-dep-group--done', 's3-dep-group--collapsed');
                btn.remove();

                const card = group.closest('.s3-vuln-card');
                if (card) {
                    updateCardCountBadge(card);
                    card.open = false;
                    card.querySelector('.s3-card-header')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            // Preset dropdown — fills the dep-group reason input
            container.addEventListener('change', function (e) {
                if (!e.target.classList.contains('s3-dep-preset')) return;
                const val = e.target.value;
                if (!val) return;
                const input = document.getElementById(e.target.dataset.targetInput);
                if (input) { input.value = val; input.dispatchEvent(new Event('input')); }
                e.target.value = '';
            });

            container.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                e.stopPropagation();
                const action = btn.dataset.action;

                if (action === 'select-version') {
                    const version = btn.dataset.version;
                    const row = btn.closest('.dep-card-file-row');
                    if (!row) return;
                    const updateBtn = row.querySelector('[data-action="update-dep"]');
                    if (updateBtn) {
                        updateBtn.dataset.version = version;
                        updateBtn.textContent = `Update to ${version}`;
                    }
                    btn.closest('.versions-list')?.querySelectorAll('.version-tag').forEach(t => t.classList.remove('selected'));
                    btn.classList.add('selected');
                } else if (action === 'check-versions') {
                    handleCheckVersions(btn);
                } else if (action === 'check-dep-field') {
                    handleCheckDepField(btn);
                } else if (action === 'update-dep') {
                    handleUpdateDep(btn);
                } else if (action === 'remove-dep') {
                    handleRemoveDep(btn);
                } else if (action === 'apply-resolution') {
                    handleApplyResolution(btn);
                } else if (action === 'set-s3-view') {
                    const newMode = btn.dataset.mode;
                    if (newMode === s3ViewMode) { e.preventDefault(); return; }
                    e.preventDefault();
                    s3ViewMode = newMode;
                    const openSections = new Set(
                        [...document.querySelectorAll('.tool-section')].map((el, i) => el.open ? i : -1).filter(i => i !== -1)
                    );
                    const openCards = new Set(
                        [...document.querySelectorAll('.s3-vuln-card')].map((el, i) => el.open ? i : -1).filter(i => i !== -1)
                    );
                    nearPanelOpen = document.querySelector('.s3-near-panel')?.open ?? nearPanelOpen;
                    renderReviewQueueTab();
                    document.querySelectorAll('.tool-section').forEach((el, i) => { if (openSections.has(i)) el.open = true; });
                    document.querySelectorAll('.s3-vuln-card').forEach((el, i) => { if (openCards.has(i)) el.open = true; });
                } else if (action === 'update-ignore-reason') {
                    handleUpdateIgnoreReason(btn);
                } else if (action === 'add-dep-group') {
                    handleAddDepGroup(btn);
                } else if (action === 'add-file-group') {
                    handleAddFileGroup(btn);
                } else if (action === 'add-all-group') {
                    handleAddAllGroup(btn);
                } else if (action === 'add-snyk-ignore') {
                    handleAddSnykIgnore(btn);
                } else if (action === 'update-snyk') {
                    handleUpdateSnyk(btn);
                } else if (action === 'update-all-near') {
                    handleUpdateAllNear(btn);
                } else if (action === 'toggle-dep-group') {
                    const group = document.getElementById(btn.dataset.groupId);
                    if (group) group.classList.toggle('s3-dep-group--collapsed');
                } else if (action === 'toggle-near-group') {
                    const groupId = btn.dataset.group;
                    const itemsEl = document.getElementById(groupId + '-items');
                    if (itemsEl) {
                        const open = itemsEl.style.display !== 'none';
                        itemsEl.style.display = open ? 'none' : '';
                        const arrow = btn.querySelector('.near-toggle-arrow');
                        if (arrow) arrow.innerHTML = open ? '&#x25B6;' : '&#x25BC;';
                    }
                } else if (action === 'skip-vuln') {
                    const vulnId = btn.dataset.vulnId;
                    if (!vulnId) return;
                    if (skipState.vulns.has(vulnId)) skipState.vulns.delete(vulnId);
                    else skipState.vulns.add(vulnId);
                    nearPanelOpen = document.querySelector('.s3-near-panel')?.open ?? nearPanelOpen;
                    renderReviewQueueTab();
                } else if (action === 'skip-dep') {
                    const dep = btn.dataset.dep;
                    if (skipState.deps.has(dep)) skipState.deps.delete(dep);
                    else skipState.deps.add(dep);
                    const isSkipped = skipState.deps.has(dep);
                    if (s3ViewMode === 'by-dep') {
                        container.querySelectorAll(`.s3-dep-group[data-dep="${CSS.escape(dep)}"]`)
                            .forEach(g => g.classList.toggle('s3-dep-group--skipped', isSkipped));
                    } else {
                        container.querySelectorAll(`.path-checkbox-row[data-top-dep="${CSS.escape(dep)}"]`)
                            .forEach(row => {
                                row.classList.toggle('dep-skipped', isSkipped);
                                const cb = row.querySelector('input[type="checkbox"]');
                                if (cb && !row.classList.contains('path-already-ignored')) cb.checked = !isSkipped;
                            });
                    }
                    container.querySelectorAll(`[data-action="skip-dep"][data-dep="${CSS.escape(dep)}"]`)
                        .forEach(b => b.classList.toggle('skipped', isSkipped));
                } else if (action === 'resolve') {
                    const ids = btn.dataset.ids.split(',').filter(Boolean);
                    applyDecision(ids, 'resolved', { resolution: btn.dataset.resolution, note: btn.dataset.note });
                } else if (action === 'skip') {
                    applyDecision(btn.dataset.ids.split(',').filter(Boolean), 'skipped', {});
                } else if (action === 'copy') {
                    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
                        const orig = btn.textContent; btn.textContent = '\u2713 Copied';
                        setTimeout(() => { btn.textContent = orig; }, 1500);
                    });
                } else if (action === 'copy-yaml') {
                    const yaml = document.getElementById('yaml-' + btn.dataset.card);
                    if (yaml) navigator.clipboard.writeText(yaml.textContent).then(() => {
                        const orig = btn.textContent; btn.textContent = '\u2713 Copied';
                        setTimeout(() => { btn.textContent = orig; }, 1500);
                    });
                }
            });

            const resolvedToggle = document.getElementById('rq-resolved-toggle');
            if (resolvedToggle) {
                resolvedToggle.addEventListener('click', () => {
                    document.getElementById('rq-resolved-section').classList.toggle('open');
                });
            }
        }

        // ── Action handlers ──
        function handleCheckVersions(btn) {
            const { pkg, recommend, panel: panelId } = btn.dataset;
            const panel = document.getElementById(panelId);
            if (!panel) return;
            if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
            btn.disabled = true;
            btn.textContent = 'Fetching\u2026';
            fetch(`/npm-versions?pkg=${encodeURIComponent(pkg)}`)
                .then(r => r.json())
                .then(data => {
                    btn.disabled = false;
                    btn.innerHTML = 'Check versions &#x25BE;';
                    if (!data.ok) { panel.innerHTML = `<div class="versions-panel-title" style="color:var(--c-critical)">Error: ${esc(data.error)}</div>`; }
                    else {
                        const tags = data.versions.map(v => {
                            const isRec = v === recommend;
                            return `<button class="version-tag${isRec ? ' recommended' : ''}" data-action="select-version" data-version="${esc(v)}">${esc(v)}</button>`;
                        }).join('');
                        panel.innerHTML = `<div class="versions-panel-title">Available versions (newest first — click to select)</div><div class="versions-list">${tags}</div>`;
                    }
                    panel.style.display = 'block';
                })
                .catch(err => {
                    btn.disabled = false;
                    btn.innerHTML = 'Check versions &#x25BE;';
                    panel.innerHTML = `<div class="versions-panel-title" style="color:var(--c-critical)">Request failed: ${esc(err.message)}</div>`;
                    panel.style.display = 'block';
                });
        }

        function handleCheckDepField(btn) {
            const { pkg, file, panel: panelId } = btn.dataset;
            const panel = document.getElementById(panelId);
            if (!panel) return;
            btn.disabled = true;
            btn.textContent = 'Checking\u2026';
            fetch(`/dep-field?pkg=${encodeURIComponent(pkg)}&file=${encodeURIComponent(file)}`)
                .then(r => r.json())
                .then(data => {
                    btn.disabled = false;
                    btn.textContent = 'Check dep type \u2192';
                    if (data.ok && data.field) {
                        panel.innerHTML = `<span class="dep-type-badge ${esc(data.field)}">${esc(data.field)}</span>`;
                    } else if (data.ok) {
                        panel.textContent = 'not found in package.json';
                    } else {
                        panel.textContent = 'error: ' + esc(data.error || '?');
                    }
                })
                .catch(err => {
                    btn.disabled = false;
                    btn.textContent = 'Check dep type \u2192';
                    panel.textContent = 'error: ' + err.message;
                });
        }

        async function handleUpdateIgnoreReason(btn) {
            const { snykFile, vulnId, depPath } = btn.dataset;
            const expiryInput = document.getElementById('expiry-s3');
            const expires = expiryInput?.value?.trim() || '';
            if (!expires) { alert('Please enter an expiry date.'); return; }
            const row = btn.closest('.path-checkbox-row');
            const reason = row?.querySelector('.already-ignored-reason-input')?.value?.trim() || '';
            if (!reason) { alert('Please enter a reason.'); return; }
            btn.disabled = true;
            btn.textContent = 'Updating\u2026';
            try {
                const r = await fetch('/add-snyk-ignore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ snykFile, vulnId, path: depPath, reason, expires }),
                });
                const data = await r.json();
                if (data.ok) {
                    if (!localAddedPatterns[snykFile]) localAddedPatterns[snykFile] = {};
                    if (!localAddedPatterns[snykFile][vulnId]) localAddedPatterns[snykFile][vulnId] = [];
                    const arr = localAddedPatterns[snykFile][vulnId];
                    const existing = arr.find(e => e.path === depPath);
                    if (existing) existing.reason = reason;
                    else arr.push({ path: depPath, reason });
                    btn.textContent = '\u2713 Updated';
                    setTimeout(() => { btn.disabled = false; btn.textContent = 'Update'; }, 2000);
                } else {
                    btn.disabled = false; btn.textContent = 'Update'; alert('Failed: ' + data.error);
                }
            } catch (err) {
                btn.disabled = false; btn.textContent = 'Update'; alert('Request failed: ' + err.message);
            }
        }

        function handleUpdateDep(btn) {
            const { path: pkgPath, dep, version } = btn.dataset;
            btn.disabled = true;
            btn.textContent = 'Updating\u2026';
            fetch('/update-dep-version', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageJsonPath: pkgPath, dep, version }),
            }).then(r => r.json()).then(data => {
                if (data.ok) { btn.textContent = '\u2713 Updated'; btn.classList.add('btn-primary'); }
                else { btn.disabled = false; btn.textContent = 'Update package.json'; alert('Failed: ' + data.error); }
            }).catch(err => { btn.disabled = false; btn.textContent = 'Update package.json'; alert('Request failed: ' + err.message); });
        }

        function handleRemoveDep(btn) {
            const { path: pkgPath, dep } = btn.dataset;
            if (!confirm(`Remove "${dep}" from ${pkgPath}?`)) return;
            btn.disabled = true;
            btn.textContent = 'Removing\u2026';
            fetch('/remove-dep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageJsonPath: pkgPath, dep }),
            }).then(r => r.json()).then(data => {
                if (data.ok) { btn.textContent = '\u2713 Removed'; btn.classList.add('btn-primary'); }
                else { btn.disabled = false; btn.textContent = 'Remove dep'; alert('Failed: ' + data.error); }
            }).catch(err => { btn.disabled = false; btn.textContent = 'Remove dep'; alert('Request failed: ' + err.message); });
        }

        function handleApplyResolution(btn) {
            const { key, version } = btn.dataset;
            btn.disabled = true;
            btn.textContent = 'Applying\u2026';
            fetch('/apply-resolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, version }),
            }).then(r => r.json()).then(data => {
                if (data.ok) { btn.textContent = '\u2713 Applied'; btn.classList.add('btn-primary'); }
                else { btn.disabled = false; btn.textContent = 'Apply to package.json'; alert('Failed: ' + data.error); }
            }).catch(err => { btn.disabled = false; btn.textContent = 'Apply to package.json'; alert('Request failed: ' + err.message); });
        }

        function handleAddSnykIgnore(btn) {
            const { snykFile, vulnId, depPath } = btn.dataset;
            const form = btn.closest('.rq-ignore-inline') || document.getElementById('rq-content');
            const reasonInput = form?.querySelector(`[data-field="reason"][data-vuln="${vulnId}"]`);
            const expiryInput = form?.querySelector(`[data-field="expiry"][data-vuln="${vulnId}"]`);
            const reason = reasonInput?.value?.trim() || '';
            const expires = expiryInput?.value?.trim() || '';
            if (!reason) { alert('Please enter a reason for ignoring this vulnerability.'); return; }
            if (!expires) { alert('Please enter an expiry date.'); return; }
            btn.disabled = true;
            btn.textContent = 'Adding\u2026';
            fetch('/add-snyk-ignore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ snykFile, vulnId, path: depPath, reason, expires }),
            }).then(r => r.json()).then(data => {
                if (data.ok) { btn.textContent = '\u2713 Added to ' + snykFile; btn.classList.add('btn-primary'); }
                else { btn.disabled = false; btn.textContent = 'Add to .snyk File'; alert('Failed: ' + data.error); }
            }).catch(err => { btn.disabled = false; btn.textContent = 'Add to .snyk File'; alert('Request failed: ' + err.message); });
        }

        function applyNearUpdatesToLocalPatterns(updates) {
            for (const { snykFile: sf, vulnId: vid, newPath } of updates) {
                if (!localAddedPatterns[sf]) localAddedPatterns[sf] = {};
                if (!localAddedPatterns[sf][vid]) localAddedPatterns[sf][vid] = [];
                const arr = localAddedPatterns[sf][vid];
                if (!arr.find(e => e.path === newPath)) arr.push({ path: newPath, reason: '' });
            }
        }

        function refreshIgnorePatterns() {
            document.querySelector('.s3-near-panel')?.classList.add('refreshing');
            document.body.insertAdjacentHTML('beforeend',
                '<div class="rq-refresh-overlay"><div class="rq-refresh-spinner"></div></div>');
            document.body.style.overflow = 'hidden';
            const openSectionIndices = new Set(
                [...document.querySelectorAll('.tool-section')].map((el, i) => el.open ? i : -1).filter(i => i !== -1)
            );
            return fetch('/data').then(r => r.json()).then(data => {
                ignorePatternsByFile = data.ignorePatternsByFile || {};
                nearPanelOpen = document.querySelector('.s3-near-panel')?.open ?? nearPanelOpen;
                renderReviewQueueTab();
                document.querySelectorAll('.tool-section').forEach((el, i) => { if (openSectionIndices.has(i)) el.open = true; });
                document.getElementById('rq-resolved-section')?.classList.add('open');
            }).finally(() => {
                document.querySelector('.rq-refresh-overlay')?.remove();
                document.body.style.overflow = '';
            });
        }

        function handleUpdateSnyk(btn) {
            const { snykFile, vulnId, oldPath, newPath } = btn.dataset;
            btn.disabled = true;
            btn.textContent = 'Updating\u2026';
            fetch('/update-snyk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: [{ snykFile, vulnId, oldPath, newPath }] }),
            }).then(r => r.json()).then(data => {
                if (data.ok) {
                    btn.textContent = '\u2713 Updated';
                    btn.classList.replace('btn-warn', 'btn-primary');
                    applyNearUpdatesToLocalPatterns([{ snykFile, vulnId, newPath }]);
                    refreshIgnorePatterns();
                } else { btn.disabled = false; btn.textContent = 'Update .snyk'; alert('Failed: ' + data.error); }
            }).catch(err => { btn.disabled = false; btn.textContent = 'Update .snyk'; alert('Request failed: ' + err.message); });
        }

        function handleUpdateAllNear(btn) {
            let updates;
            try { updates = JSON.parse(btn.dataset.updates); } catch { return; }
            if (!updates.length) return;
            btn.disabled = true;
            btn.textContent = 'Updating\u2026';
            fetch('/update-snyk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            }).then(r => r.json()).then(data => {
                if (data.ok) {
                    btn.textContent = '\u2713 All Updated';
                    btn.classList.replace('btn-warn', 'btn-primary');
                    applyNearUpdatesToLocalPatterns(updates);
                    refreshIgnorePatterns();
                } else { btn.disabled = false; btn.textContent = 'Update All in This File'; alert('Failed: ' + data.error); }
            }).catch(err => { btn.disabled = false; btn.textContent = 'Update All in This File'; alert('Request failed: ' + err.message); });
        }

        function applyDecision(ids, status, extra) {
            const updates = {};
            for (const id of ids) { updates[id] = { status, ...extra }; }
            fetch('/review-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            }).then(r => r.json()).then(data => {
                if (data.ok) {
                    const ts = new Date().toISOString();
                    for (const [id, decision] of Object.entries(updates)) {
                        localRS.decisions[id] = { ...decision, timestamp: ts };
                    }
                    nearPanelOpen = document.querySelector('.s3-near-panel')?.open ?? nearPanelOpen;
                    renderReviewQueueTab();
                } else {
                    alert('Failed to save: ' + data.error);
                }
            }).catch(err => alert('Request failed: ' + err.message));
        }

        const resetBtn = document.getElementById('reset-review-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (!confirm('Reset review state? All decisions will be cleared and all vulnerabilities will return to the queue.')) return;
                fetch('/reset-review-state', { method: 'POST' })
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok) location.reload();
                        else alert('Failed: ' + data.error);
                    })
                    .catch(err => alert('Request failed: ' + err.message));
            });
        }

        renderReviewQueueTab();
        attachEvents();
    };
})();
