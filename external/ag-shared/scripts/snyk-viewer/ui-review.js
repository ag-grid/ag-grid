/* Review Queue tab */
(function () {
    'use strict';

    const IGNORE_REASONS = [
        'Used in build & dev - not included in final production build',
        'Test dependency - not included in final production build',
        'Lint dependency - not included in final production build',
        'Downstream dependency of [package] - not included in final production build',
        'Dev server only - not exposed in production',
        'MCP/dev tooling - not a directly exposed production dependency',
    ];

    window.initReviewQueue = function (projects, ignorePatternsByFile, reviewState, sharedExpiry, _rootPackageName) {
        const { esc, sevClass, stripVer, getSnykFilePath, getNearIgnoredPath,
                sameMajorFixVersion } = window.SnykUtils;

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

        function getNear(vuln, project) {
            return getNearIgnoredPath(vuln, project, ignorePatternsByFile)
                || getNearIgnoredPath(vuln, project, localAddedPatterns);
        }

        // ── Build sections ──
        function buildSections() {
            const decisions = localRS.decisions;

            // Mark resolved vulns that reappeared as reopened
            const activeIds = new Set(allVulnEntries.map(e => e.vuln.id));
            for (const [id, dec] of Object.entries(decisions)) {
                if (dec.status === 'resolved' && activeIds.has(id)) {
                    decisions[id] = { ...dec, status: 'reopened' };
                }
            }

            // Section 1: Dep groups — Map: depName → { depName, vulns: Map<id,{id,vuln}>, files: Map<pkgPath,version> }
            const depGroups = new Map();
            for (const { vuln, project } of allVulnEntries) {
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
                const fix = sameMajorFixVersion(vuln);
                if (!fix) continue;
                const pkg = vuln.name || vuln.packageName || '';
                if (!pkg) continue;
                if (!resGroups.has(pkg)) resGroups.set(pkg, { fixVersion: fix, itemsMap: new Map() });
                const g = resGroups.get(pkg);
                if (fix < g.fixVersion) g.fixVersion = fix;
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
                if (decision?.status === 'resolved') continue;

                // Near-ignored check
                const near = getNear(vuln, project);
                const activePath = (vuln.from?.slice(1) || []).join(' > ');
                if (near) {
                    const exactMatch = activePath === near.path;
                    if (!exactMatch) {
                        // Stale path (package names match but versions changed) — show in Near-ignored only
                        const sf = getSnykFilePath(project);
                        if (!nearItems.has(sf)) nearItems.set(sf, []);
                        const existing = nearItems.get(sf).find(item => item.id === id);
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
                        <span class="dep-card-name">${esc(depName)}</span>
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
                    <span class="rq-card-title">Pin <code>${esc(pkg)}</code> &#x2192; <code>${esc(fixVersion)}</code></span>
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
                    ? `<button class="btn btn-sm btn-warn" data-action="update-all-near"
                            data-updates="${esc(JSON.stringify(allNearUpdates))}">Update All .snyk Files</button>`
                    : '';
                const nearGroupsHtml = [...nearItems.entries()].map(([sf, items]) => renderCatDGroup(sf, items)).join('');
                nearHtml = `<details class="s3-near-panel" open>
                    <summary class="s3-near-summary">
                        <span>&#x26A1; Near-ignored &#x2014; stale .snyk paths</span>
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
            const allBatchItems = []; // for "Add All" button — populated after skipped filtering

            for (const [id, { vuln, paths }] of ignoreVulns) {
                const skipped = skipState.vulns.has(id);
                const startIdx = globalIdx;
                // Group paths by snyk file
                const byFile = new Map();
                for (const path of paths) {
                    if (!byFile.has(path.snykFile)) byFile.set(path.snykFile, []);
                    const idx = globalIdx++;
                    byFile.get(path.snykFile).push({ ...path, idx });
                }
                if (!skipped) {
                    for (const [, filePaths] of byFile) {
                        for (const p of filePaths) {
                            if (!skipState.deps.has(p.topLevelDep) && !p.alreadyIgnored) {
                                allBatchItems.push({ vulnId: id, snykFile: p.snykFile, depPath: p.depPath, idx: p.idx });
                            }
                        }
                    }
                }
                vulnCards.push({ id, vuln, skipped, byFile, startIdx });
            }

            // Sort by severity (critical→low), resolved cards to bottom
            const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
            vulnCards.sort((a, b) => {
                const aResolved = [...a.byFile.values()].every(fps => fps.every(p => p.alreadyIgnored));
                const bResolved = [...b.byFile.values()].every(fps => fps.every(p => p.alreadyIgnored));
                if (aResolved !== bResolved) return aResolved ? 1 : -1;
                return (SEV_ORDER[sevClass(a.vuln)] ?? 4) - (SEV_ORDER[sevClass(b.vuln)] ?? 4);
            });

            const vulnCardsHtml = vulnCards.map(({ id, vuln, skipped, byFile }, vi) => {
                // Unique top-level deps for skip-by-dep tags
                const topDeps = new Set();
                for (const [, fps] of byFile) for (const p of fps) topDeps.add(p.topLevelDep);
                const depTagsHtml = [...topDeps].filter(Boolean).map(dep => {
                    const active = skipState.deps.has(dep);
                    return `<button class="skip-dep-tag${active ? ' skipped' : ''}" data-action="skip-dep" data-dep="${esc(dep)}">${esc(dep)} &#x2715;</button>`;
                }).join('');

                // Total path count and file count for header badge
                let totalPaths = 0;
                let resolvedPaths = 0;
                for (const [, fps] of byFile) {
                    totalPaths += fps.length;
                    resolvedPaths += fps.filter(p => p.alreadyIgnored).length;
                }
                const fileCount = byFile.size;
                const resolvedPart = resolvedPaths > 0 ? ` &middot; <span class="s3-resolved-count">${resolvedPaths} resolved</span>` : '';
                const countBadge = `<span class="s3-path-count-badge">${totalPaths} path${totalPaths !== 1 ? 's' : ''} &middot; ${fileCount} file${fileCount !== 1 ? 's' : ''}${resolvedPart}</span>`;

                const allPathsIgnored = [...byFile.values()].every(fps => fps.every(p => p.alreadyIgnored));

                const fileGroupsHtml = [...byFile.entries()].map(([snykFile, fps]) => {
                    const allFileIgnored = fps.every(p => p.alreadyIgnored);
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
                                data-card="${cardId}" data-idx="${path.idx}" data-vuln-idx="${vi}" data-vuln-id="${esc(id)}">
                            <span class="path-deppath">${esc(path.depPath)}</span>
                            <input type="text" class="ignore-form-input batch-ignore-reason"
                                id="reason-${cardId}-${path.idx}"
                                data-card="${cardId}" data-idx="${path.idx}" data-vuln-idx="${vi}"
                                data-snyk-file="${esc(snykFile)}"
                                placeholder="Reason&#x2026;">
                        </div>`;
                    }).join('');
                    const fileId = snykFile.replace(/[^a-z0-9]/gi, '-');
                    const pendingPaths = fps.filter(p => !p.alreadyIgnored).map(p => ({ vulnId: id, depPath: p.depPath, idx: p.idx }));
                    const fileYaml = buildGroupedYamlPreview(pendingPaths, [], expiry);
                    return `<details class="batch-file-subgroup${allFileIgnored ? ' batch-file-subgroup--done' : ''}" data-snyk-file="${esc(snykFile)}">
                        <summary class="batch-file-subgroup-heading">
                            <span class="batch-file-subgroup-chevron">&#x25BC;</span>
                            ${esc(snykFile)}
                            <span class="s3-file-path-count">${fps.length} path${fps.length !== 1 ? 's' : ''}</span>
                            ${allFileIgnored ? '<span class="batch-file-done-badge">&#x2713; In .snyk</span>' : ''}
                        </summary>
                        ${!allFileIgnored ? `<div class="prefill-row">
                            <select class="ignore-form-input preset-select cat-a-preset"
                                data-card="${cardId}" data-vuln-idx="${vi}" data-snyk-file="${esc(snykFile)}">
                                <option value="">Preset&#x2026;</option>
                                ${presetOptionsHtml}
                            </select>
                            <input type="text" class="ignore-form-input prefill-text"
                                data-card="${cardId}" data-vuln-idx="${vi}" data-snyk-file="${esc(snykFile)}"
                                placeholder="Prefill reason&#x2026;">
                            <button class="btn btn-sm btn-outline" data-action="prefill-reasons"
                                data-card="${cardId}" data-vuln-idx="${vi}" data-snyk-file="${esc(snykFile)}">Apply to all</button>
                        </div>` : ''}
                        ${rowsHtml}
                        ${!allFileIgnored ? `<details class="batch-yaml-details">
                            <summary class="batch-yaml-summary">
                                ${esc(snykFile)} YAML preview
                                <button class="btn btn-sm btn-outline" data-action="copy-file-yaml"
                                    data-vuln-idx="${vi}" data-snyk-file="${esc(snykFile)}">&#x2398; Copy</button>
                            </summary>
                            <pre class="yaml-snippet" id="batch-yaml-${cardId}-${vi}-${fileId}">${esc(fileYaml)}</pre>
                        </details>
                        <button class="btn btn-sm btn-accent" data-action="add-file-snyk-ignore"
                            data-card="${cardId}" data-vuln-idx="${vi}" data-snyk-file="${esc(snykFile)}"
                            data-vuln-id="${esc(id)}">Add to ${esc(snykFile)}</button>` : ''}
                    </details>`;
                }).join('');

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
                        : `<div class="rq-card-body">${fileGroupsHtml}</div>`}
                </details>`;
            }).join('');

            const allVulnIds = [...ignoreVulns.keys()].filter(id => !skipState.vulns.has(id)).join(',');
            const globalActionsHtml = `<div class="rq-actions s3-global-actions">
                <button class="btn btn-accent" data-action="add-all-snyk-ignore"
                    data-card="${cardId}"
                    data-items="${esc(JSON.stringify(allBatchItems))}">&#x2713; Add All to .snyk &#x2014; ${allBatchItems.length} path${allBatchItems.length !== 1 ? 's' : ''}</button>
                <button class="btn btn-primary" data-action="resolve"
                    data-ids="${esc(allVulnIds)}"
                    data-resolution="snyk-ignore"
                    data-note="Added ${allBatchItems.length} path(s) to .snyk">&#x2713; Mark All as Resolved</button>
            </div>`;

            return `<details class="tool-section">
                <summary class="tool-section-header">
                    <span class="tool-section-chevron">&#x25BC;</span>
                    <span class="tool-section-num">3</span>
                    <span class="tool-section-title">Snyk Ignores</span>
                    <span class="tool-section-desc">Per-vuln cards sub-grouped by .snyk file.</span>
                    <span class="tool-section-badge">${ignoreVulns.size}</span>
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

            const itemsHtml = items.map(({ id, vuln, entry, nearMatch, resolved }) => {
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
                return `<div class="near-item${resolved ? ' near-item-resolved' : ''}">
                    <div class="near-item-header">
                        ${sevBadge(vuln)}
                        <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener">${esc(id)}</a>
                        <span style="color:var(--c-text-muted);font-size:12px">${esc(vuln.title || '')}</span>
                        ${resolved ? '<span class="near-resolved-pill">&#x2713; path matches</span>' : ''}
                    </div>
                    ${!resolved ? `<div class="near-paths">
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
                    </div>` : ''}
                </div>`;
            }).join('');

            const allUpdates = unresolvedItems.map(({ id, nearMatch, entry }) => {
                const activePath = (entry.vuln.from?.slice(1) || []).join(' > ');
                return { snykFile, vulnId: id, oldPath: nearMatch.path, newPath: activePath };
            });
            const countBadge = `<span class="near-group-count">${items.length} vuln${items.length !== 1 ? 's' : ''}</span>`;
            const resolvedPill = allResolved ? '<span class="near-group-resolved-pill">&#x2713; Resolved</span>' : '';
            const toggleArrow = `<span class="near-toggle-arrow">${allResolved ? '&#x25B6;' : '&#x25BC;'}</span>`;
            const updateAllBtn = !allResolved
                ? `<button class="btn btn-sm btn-warn" data-action="update-all-near"
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
                    ${itemsHtml}
                </div>
            </div>`;
        }

        // ── YAML builders ──
        function buildGroupedYamlPreview(batchItems, reasons, expiry) {
            const byVuln = new Map();
            batchItems.forEach(function (item, localIdx) {
                if (!byVuln.has(item.vulnId)) byVuln.set(item.vulnId, []);
                const reasonIdx = (item.idx !== undefined) ? item.idx : localIdx;
                byVuln.get(item.vulnId).push({ depPath: item.depPath, idx: reasonIdx });
            });
            const created = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
            const e = expiry || '<expiry>';
            const blocks = [];
            for (const [vulnId, paths] of byVuln.entries()) {
                let block = '  ' + vulnId + ':';
                for (const { depPath, idx } of paths) {
                    const r = (typeof reasons === 'object' && reasons !== null)
                        ? (Array.isArray(reasons) ? (reasons[idx] || '') : (reasons[idx] || ''))
                        : '';
                    block += '\n    - \'' + (depPath || '<dep-path>') + '\':' +
                             '\n        reason: >-\n          ' + (r || '<reason>') +
                             '\n        expires: ' + e +
                             '\n        created: ' + created;
                }
                blocks.push(block);
            }
            return blocks.join('\n');
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
            const { reviewed } = buildSections();
            applyProgress(reviewed);
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
                            const status = decision.status || 'skipped';
                            const ts = decision.timestamp ? new Date(decision.timestamp).toLocaleString() : '';
                            return `<div class="rq-resolved-item">
                                <span class="status-badge status-${esc(status)}">${esc(status)}</span>
                                <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(id)}" target="_blank" rel="noopener">${esc(id)}</a>
                                ${sevBadge(vuln)}
                                <span class="rq-resolved-note">${esc(vuln.title || '')}</span>
                                ${decision.note ? `<span class="rq-resolved-note" style="color:var(--c-fix)">${esc(decision.note)}</span>` : ''}
                                <span class="rq-resolved-ts">${esc(ts)}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
            }

            document.getElementById('rq-content').innerHTML = html;
            attachEvents();
        }

        // ── Event handling (delegated) ──
        function attachEvents() {
            const container = document.getElementById('rq-content');

            // Rebuild YAML preview for a specific vuln+file combo
            function rebuildFileYaml(vulnIdx, snykFile) {
                const cardId = 's3';
                const fileId = snykFile.replace(/[^a-z0-9]/gi, '-');
                const yamlEl = document.getElementById(`batch-yaml-${cardId}-${vulnIdx}-${fileId}`);
                if (!yamlEl) return;
                const expiry = document.getElementById(`expiry-${cardId}`)?.value || '';
                const card = document.getElementById(`s3-card-${vulnIdx}`);
                if (!card) return;
                const vulnId = card.dataset.vulnId || '';
                const subgroup = card.querySelector(`.batch-file-subgroup[data-snyk-file="${CSS.escape(snykFile)}"]`);
                if (!subgroup) return;
                const rows = subgroup.querySelectorAll('.path-checkbox-row');
                const filePaths = [];
                rows.forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    const idx = cb ? parseInt(cb.dataset.idx) : NaN;
                    if (isNaN(idx)) return;
                    const depPathSpan = row.querySelector('.path-deppath');
                    filePaths.push({ vulnId, depPath: depPathSpan?.textContent || '', idx });
                });
                const reasons = {};
                filePaths.forEach(p => {
                    const el = document.getElementById(`reason-s3-${p.idx}`);
                    if (el) reasons[p.idx] = el.value;
                });
                yamlEl.textContent = buildGroupedYamlPreview(filePaths, reasons, expiry);
            }

            function updateCardCountBadge(card) {
                const badge = card.querySelector('.s3-path-count-badge');
                if (!badge) return;
                const totalPaths = card.querySelectorAll('.path-checkbox-row').length;
                const resolvedPaths = card.querySelectorAll('.path-checkbox-row.path-already-ignored').length;
                const fileCount = card.querySelectorAll('.batch-file-subgroup').length;
                const resolvedPart = resolvedPaths > 0 ? ` &middot; <span class="s3-resolved-count">${resolvedPaths} resolved</span>` : '';
                badge.innerHTML = `${totalPaths} path${totalPaths !== 1 ? 's' : ''} &middot; ${fileCount} file${fileCount !== 1 ? 's' : ''}${resolvedPart}`;
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

            async function handleAddFileSnykIgnore(btn) {
                const cardId = btn.dataset.card;
                const vulnIdx = parseInt(btn.dataset.vulnIdx);
                const snykFile = btn.dataset.snykFile;
                const vulnId = btn.dataset.vulnId;
                const expiryInput = document.getElementById('expiry-' + cardId);
                const expires = expiryInput?.value?.trim() || '';
                if (!expires) { alert('Please enter an expiry date.'); return; }

                const card = document.getElementById(`s3-card-${vulnIdx}`);
                const subgroup = card?.querySelector(`.batch-file-subgroup[data-snyk-file="${CSS.escape(snykFile)}"]`);
                if (!subgroup) return;

                const toAdd = [];
                subgroup.querySelectorAll('.path-checkbox-row').forEach(row => {
                    const cb = row.querySelector('input[type="checkbox"]');
                    if (!cb || !cb.checked) return;
                    const idx = parseInt(cb.dataset.idx);
                    const depPathSpan = row.querySelector('.path-deppath');
                    const depPath = depPathSpan?.textContent || '';
                    const reason = document.getElementById(`reason-${cardId}-${idx}`)?.value?.trim() || '';
                    toAdd.push({ vulnId, depPath, reason, snykFile });
                });

                if (!toAdd.length) { alert('No checked paths to add.'); return; }
                const emptyReason = toAdd.find(p => !p.reason);
                if (emptyReason) { alert('Please enter a reason for all checked paths.'); return; }

                btn.disabled = true;
                for (let i = 0; i < toAdd.length; i++) {
                    const p = toAdd[i];
                    btn.textContent = `Adding ${i + 1}/${toAdd.length}\u2026`;
                    try {
                        const r = await fetch('/add-snyk-ignore', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ snykFile: p.snykFile, vulnId: p.vulnId, path: p.depPath, reason: p.reason, expires }),
                        });
                        const data = await r.json();
                        if (!data.ok) { btn.disabled = false; btn.textContent = `Add to ${snykFile}`; alert('Failed: ' + data.error); return; }
                    } catch (err) {
                        btn.disabled = false; btn.textContent = `Add to ${snykFile}`;
                        alert('Request failed: ' + err.message); return;
                    }
                }
                btn.textContent = '\u2713 Updated';

                // Update localAddedPatterns so buildSections() treats these paths as alreadyIgnored
                for (const p of toAdd) {
                    if (!localAddedPatterns[p.snykFile]) localAddedPatterns[p.snykFile] = {};
                    if (!localAddedPatterns[p.snykFile][p.vulnId]) localAddedPatterns[p.snykFile][p.vulnId] = [];
                    const arr = localAddedPatterns[p.snykFile][p.vulnId];
                    if (!arr.find(e => e.path === p.depPath)) arr.push({ path: p.depPath, reason: p.reason });
                }
                recomputeProgress();

                // Convert successfully-added rows to the resolved display (editable reason + Update button)
                subgroup.querySelectorAll('.path-checkbox-row:not(.path-already-ignored)').forEach(row => {
                    const cb = row.querySelector('.path-cb');
                    if (!cb || !cb.checked) return;
                    const topDep = row.dataset.topDep || '';
                    const depPath = row.querySelector('.path-deppath')?.textContent || '';
                    const idx = cb.dataset.idx;
                    const reason = document.getElementById(`reason-${cardId}-${idx}`)?.value?.trim() || '';
                    row.className = 'path-checkbox-row path-already-ignored';
                    row.dataset.topDep = topDep;
                    row.innerHTML = `<span class="path-already-ignored-check">&#x2713;</span>`
                        + `<span class="path-deppath">${esc(depPath)}</span>`
                        + `<input type="text" class="ignore-form-input already-ignored-reason-input" value="${esc(reason)}" placeholder="Reason&hellip;" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">`
                        + `<button class="btn btn-sm btn-outline" data-action="update-ignore-reason" data-snyk-file="${esc(snykFile)}" data-vuln-id="${esc(vulnId)}" data-dep-path="${esc(depPath)}">Update</button>`
                        + `<span class="already-ignored-badge">Already in .snyk</span>`;
                });

                subgroup.removeAttribute('open');
                subgroup.classList.add('batch-file-subgroup--done');
                const heading = subgroup.querySelector('.batch-file-subgroup-heading');
                if (heading && !heading.querySelector('.batch-file-done-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'batch-file-done-badge';
                    badge.textContent = '\u2713 Added';
                    heading.appendChild(badge);
                }

                updateCardCountBadge(card);

                // If all paths across all subgroups are now resolved, mark the whole card
                const cardAllIgnored = !card.querySelector('.path-checkbox-row:not(.path-already-ignored)');
                if (cardAllIgnored) {
                    card.classList.add('s3-card-all-ignored');
                    card.removeAttribute('open');
                }

                card.querySelector('.s3-card-header')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setTimeout(() => { btn.disabled = false; btn.textContent = `Add to ${snykFile}`; }, 2000);
            }

            // Preset dropdown — fills the prefill text box, not the reason inputs directly
            container.addEventListener('change', function (e) {
                if (!e.target.classList.contains('preset-select')) return;
                const val = e.target.value;
                if (!val) return;
                const prefillInput = e.target.closest('.prefill-row')?.querySelector('.prefill-text');
                if (prefillInput) prefillInput.value = val;
                e.target.value = '';
            });

            container.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                e.stopPropagation();
                const action = btn.dataset.action;

                if (action === 'prefill-reasons') {
                    const vulnIdx = btn.dataset.vulnIdx;
                    const snykFile = btn.dataset.snykFile;
                    const prefillInput = btn.closest('.prefill-row')?.querySelector('.prefill-text');
                    const val = prefillInput?.value?.trim() || '';
                    if (!val) return;
                    const card = document.getElementById(`s3-card-${vulnIdx}`);
                    const subgroup = card?.querySelector(`.batch-file-subgroup[data-snyk-file="${CSS.escape(snykFile)}"]`);
                    if (!subgroup) return;
                    subgroup.querySelectorAll('.batch-ignore-reason').forEach(inp => { inp.value = val; });
                    if (vulnIdx !== undefined && snykFile) rebuildFileYaml(parseInt(vulnIdx), snykFile);
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
                } else if (action === 'update-ignore-reason') {
                    handleUpdateIgnoreReason(btn);
                } else if (action === 'add-all-snyk-ignore') {
                    handleAddAllSnykIgnore(btn);
                } else if (action === 'add-file-snyk-ignore') {
                    handleAddFileSnykIgnore(btn);
                } else if (action === 'add-snyk-ignore') {
                    handleAddSnykIgnore(btn);
                } else if (action === 'update-snyk') {
                    handleUpdateSnyk(btn);
                } else if (action === 'update-all-near') {
                    handleUpdateAllNear(btn);
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
                    renderReviewQueueTab();
                } else if (action === 'skip-dep') {
                    const dep = btn.dataset.dep;
                    if (skipState.deps.has(dep)) skipState.deps.delete(dep);
                    else skipState.deps.add(dep);
                    // Toggle checkboxes for this dep and collect affected (vulnIdx, snykFile) pairs
                    const toRebuild = new Set();
                    container.querySelectorAll(`.path-checkbox-row[data-top-dep="${CSS.escape(dep)}"]`).forEach(row => {
                        const cb = row.querySelector('input[type="checkbox"]');
                        if (cb) {
                            cb.checked = !skipState.deps.has(dep);
                            const vi = cb.dataset.vulnIdx;
                            const sf = row.closest('.batch-file-subgroup')?.dataset.snykFile;
                            if (vi !== undefined && sf) toRebuild.add(`${vi}\0${sf}`);
                        }
                    });
                    // Toggle button style
                    container.querySelectorAll(`[data-action="skip-dep"][data-dep="${CSS.escape(dep)}"]`).forEach(b => {
                        b.classList.toggle('skipped', skipState.deps.has(dep));
                    });
                    // Rebuild YAML previews for affected vuln+file pairs
                    toRebuild.forEach(key => {
                        const sep = key.indexOf('\0');
                        rebuildFileYaml(parseInt(key.slice(0, sep)), key.slice(sep + 1));
                    });
                } else if (action === 'copy-file-yaml') {
                    const vi = btn.dataset.vulnIdx;
                    const snykFile = btn.dataset.snykFile;
                    const fileId = snykFile.replace(/[^a-z0-9]/gi, '-');
                    const yamlEl = document.getElementById(`batch-yaml-s3-${vi}-${fileId}`);
                    if (yamlEl) navigator.clipboard.writeText(yamlEl.textContent).then(() => {
                        const orig = btn.textContent; btn.textContent = '\u2713 Copied';
                        setTimeout(() => { btn.textContent = orig; }, 1500);
                    });
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

            // Live YAML preview updates
            container.addEventListener('input', function (e) {
                if (e.target.classList.contains('batch-ignore-reason')) {
                    const vulnIdx = parseInt(e.target.dataset.vulnIdx);
                    const snykFile = e.target.dataset.snykFile;
                    if (!isNaN(vulnIdx) && snykFile) rebuildFileYaml(vulnIdx, snykFile);
                }
                if (e.target.classList.contains('batch-ignore-expiry')) {
                    const cardId = e.target.dataset.card;
                    if (!cardId) return;
                    // Rebuild all file YAML previews
                    container.querySelectorAll('[id^="batch-yaml-s3-"]').forEach(yamlEl => {
                        const m = yamlEl.id.match(/^batch-yaml-s3-(\d+)-(.+)$/);
                        if (!m) return;
                        const vi = parseInt(m[1]);
                        const fileId = m[2];
                        // Find snyk file from matching subgroup
                        const card = document.getElementById(`s3-card-${vi}`);
                        if (!card) return;
                        card.querySelectorAll('.batch-file-subgroup').forEach(sg => {
                            const sf = sg.dataset.snykFile;
                            if (sf && sf.replace(/[^a-z0-9]/gi, '-') === fileId) {
                                rebuildFileYaml(vi, sf);
                            }
                        });
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
                            return `<span class="version-tag${isRec ? ' recommended' : ''}">${esc(v)}</span>`;
                        }).join('');
                        panel.innerHTML = `<div class="versions-panel-title">Available versions (newest first)</div><div class="versions-list">${tags}</div>`;
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

        async function handleAddAllSnykIgnore(btn) {
            const cardId = btn.dataset.card;
            const expiryInput = document.getElementById('expiry-' + cardId);
            const expires = expiryInput?.value?.trim() || '';
            if (!expires) { alert('Please enter an expiry date.'); return; }
            let batchItems;
            try { batchItems = JSON.parse(btn.dataset.items); } catch { return; }
            if (!batchItems.length) return;
            const reasons = batchItems.map(function (item) {
                return document.getElementById('reason-' + cardId + '-' + item.idx)?.value?.trim() || '';
            });
            const emptyIdx = reasons.findIndex(function (r) { return !r; });
            if (emptyIdx >= 0) { alert('Please enter a reason for path ' + (emptyIdx + 1) + '.'); return; }
            btn.disabled = true;
            const allVulnIds = [...new Set(batchItems.map(function (i) { return i.vulnId; }))];
            for (let i = 0; i < batchItems.length; i++) {
                const item = batchItems[i];
                btn.textContent = 'Adding ' + (i + 1) + '/' + batchItems.length + '\u2026';
                try {
                    const r = await fetch('/add-snyk-ignore', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ snykFile: item.snykFile, vulnId: item.vulnId, path: item.depPath, reason: reasons[i], expires }),
                    });
                    const data = await r.json();
                    if (!data.ok) { btn.disabled = false; btn.textContent = '\u2713 Add All to .snyk'; alert('Failed: ' + data.error); return; }
                } catch (err) {
                    btn.disabled = false; btn.textContent = '\u2713 Add All to .snyk';
                    alert('Request failed: ' + err.message); return;
                }
            }
            btn.textContent = '\u2713 Added ' + batchItems.length + '/' + batchItems.length;
            applyDecision(allVulnIds, 'resolved', { resolution: 'snyk-ignore', note: 'Added ' + batchItems.length + ' path(s) to .snyk' });
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

        function handleUpdateSnyk(btn) {
            const { snykFile, vulnId, oldPath, newPath } = btn.dataset;
            btn.disabled = true;
            btn.textContent = 'Updating\u2026';
            fetch('/update-snyk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: [{ snykFile, vulnId, oldPath, newPath }] }),
            }).then(r => r.json()).then(data => {
                if (data.ok) { location.reload(); }
                else { btn.disabled = false; btn.textContent = 'Update .snyk'; alert('Failed: ' + data.error); }
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
                if (data.ok) { location.reload(); }
                else { btn.disabled = false; btn.textContent = 'Update All in This File'; alert('Failed: ' + data.error); }
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
    };
})();
