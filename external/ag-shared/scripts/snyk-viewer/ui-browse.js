/* Browse All tab + shared utility functions */
(function () {
    'use strict';

    // ── Shared utilities (exported for use by Review Queue) ──
    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function sevClass(vuln) { return (vuln.severity || 'low').toLowerCase(); }

    function stripVer(dep) { return dep.replace(/@[^@]*$/, ''); }

    function npmLink(pkg) {
        const name = esc(pkg.replace(/@[\d][^@]*$/, ''));
        if (!name) return '';
        return `<a class="npm-link" href="https://www.npmjs.com/package/${name}" target="_blank" rel="noopener" title="View on npm" onclick="event.stopPropagation()"><img class="npm-icon" src="https://static-production.npmjs.com/58a19602036db1daee0d7863c94673a4.png" alt="npm"><!-- npm --></a>`;
    }

    function pathKey(fromArr) { return fromArr.slice(1).map(stripVer).join('>'); }

    function projectName(project) {
        return project.projectName === 'package.json'
            ? (project.displayTargetFile || project.projectName)
            : (project.projectName || project.displayTargetFile || '(unknown)');
    }

    function getSnykFilePath(project) {
        const targetFile = project.displayTargetFile || '';
        const slashIdx = targetFile.lastIndexOf('/');
        const dir = slashIdx > 0 ? targetFile.slice(0, slashIdx) : '';
        return dir ? `${dir}/.snyk` : '.snyk';
    }

    function getNearIgnoredPath(vuln, project, ignorePatternsByFile) {
        if (!vuln.from?.length) return null;
        const patterns = ignorePatternsByFile[getSnykFilePath(project)];
        if (!patterns) return null;
        const idPaths = patterns[vuln.id];
        if (!idPaths) return null;
        const key = pathKey(vuln.from);
        for (const entry of idPaths) {
            if (entry.path.split(' > ').map(stripVer).join('>') === key) return entry;
        }
        return null;
    }

    // ── Semver helpers ──
    function semverParts(v) { return (v || '0.0.0').split('.').map(n => parseInt(n, 10) || 0); }
    function semverMajor(v) { return semverParts(v)[0]; }
    function semverLess(a, b) {
        const pa = semverParts(a), pb = semverParts(b);
        for (let i = 0; i < 3; i++) {
            if (pa[i] < pb[i]) return true;
            if (pa[i] > pb[i]) return false;
        }
        return false;
    }

    function sameMajorFixVersion(vuln) {
        if (!vuln.fixedIn?.length) return null;
        const major = semverMajor(vuln.version || '0');
        const fixes = vuln.fixedIn.filter(v => semverMajor(v) === major);
        if (!fixes.length) return null;
        return fixes.reduce((min, v) => semverLess(v, min) ? v : min);
    }

    function upgradeTarget(vuln) {
        return vuln.upgradePath?.find(v => v !== false) || null;
    }

    // ── DOM helpers ──
    function depCrumbsHtml(parts, extraClass, versionChanged) {
        if (!versionChanged) versionChanged = [];
        const snykPath = esc(parts.join(' > '));
        return `<div class="dep-path${extraClass ? ' ' + extraClass : ''}">${parts.map((p, i) => {
            const isTarget = i === parts.length - 1;
            const changed = versionChanged[i] || false;
            let displayHtml;
            if (changed) {
                const name = stripVer(p);
                const ver = p.slice(name.length);
                displayHtml = `${esc(name)}<span class="ver-changed">${esc(ver)}</span>`;
            } else {
                displayHtml = esc(p);
            }
            return `<span class="dep-crumb${isTarget ? ' target' : ''}" data-copy="${esc(p)}" title="Click to copy">${displayHtml}</span>${i < parts.length - 1 ? '<span class="dep-arrow">→</span>' : ''}`;
        }).join('')}<button class="dep-path-copy" data-copy="${snykPath}" title="Copy path in .snyk format">⎘</button></div>`;
    }

    function depPathHtml(from) {
        if (!from || !from.length) return '<span style="color:var(--c-text-muted)">—</span>';
        const parts = from.slice(1);
        if (!parts.length) return '<span style="color:var(--c-text-muted)">Direct dependency</span>';
        return depCrumbsHtml(parts);
    }

    function fixHtml(vuln) {
        if (vuln.fixedIn && vuln.fixedIn.length > 0) {
            return `<span class="fix-status fix-yes">✓ Fix available</span>`;
        }
        return `<span class="fix-status fix-no">– No fix</span>`;
    }

    function cveHtml(vuln) {
        const cves = vuln.identifiers?.CVE || [];
        if (!cves.length) return '';
        return `<span class="cve-links">${cves.map(c =>
            `<a class="cve-link" href="https://nvd.nist.gov/vuln/detail/${esc(c)}" target="_blank" rel="noopener">${esc(c)}</a>`
        ).join('')}</span>`;
    }

    // Export shared utilities
    window.SnykUtils = {
        esc, sevClass, stripVer, pathKey, projectName, getSnykFilePath,
        getNearIgnoredPath, semverMajor, sameMajorFixVersion, upgradeTarget,
        depCrumbsHtml, depPathHtml, fixHtml, cveHtml, npmLink,
    };

    // ════════════════════════════════════════════
    // Browse All tab initialisation
    // ════════════════════════════════════════════
    window.initBrowseAll = function (projects, ignorePatternsByFile, scanDate) {

        // ── State ──
        const state = { search: '', sevFilter: 'all', groupBy: 'project', showIgnored: false };

        // ── Collect data ──
        const allVulnEntries = [];
        const allIgnored = [];
        for (const project of projects) {
            for (const vuln of (project.vulnerabilities || [])) {
                allVulnEntries.push({ vuln, project });
            }
            for (const ign of (project.filtered?.ignore || [])) {
                allIgnored.push({ ign, project });
            }
        }

        function getNear(vuln, project) {
            return getNearIgnoredPath(vuln, project, ignorePatternsByFile);
        }

        // ── Summary stats ──
        function buildSummary() {
            const bySev = { critical: 0, high: 0, medium: 0, low: 0 };
            const uniqueIds = new Set();
            const uniqueVulns = []; // { id, title, severity }
            for (const { vuln } of allVulnEntries) {
                if (!uniqueIds.has(vuln.id)) {
                    uniqueIds.add(vuln.id);
                    const sev = (vuln.severity || '').toLowerCase();
                    if (sev in bySev) bySev[sev]++;
                    uniqueVulns.push({ id: vuln.id, title: vuln.title || '', severity: sev });
                }
            }
            const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            uniqueVulns.sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4) || a.id.localeCompare(b.id));
            return { total: uniqueIds.size, bySev, projects: projects.length, vulns: uniqueVulns, totalInstances: allVulnEntries.length };
        }

        const summary = buildSummary();

        // ── Render header ──
        function renderHeader() {
            const sevPills = document.getElementById('sev-pills');
            const pills = [
                { key: 'critical', label: 'Critical', n: summary.bySev.critical },
                { key: 'high', label: 'High', n: summary.bySev.high },
                { key: 'medium', label: 'Medium', n: summary.bySev.medium },
                { key: 'low', label: 'Low', n: summary.bySev.low },
            ];
            sevPills.innerHTML = pills.map(p =>
                `<span class="sev-pill ${p.key}${p.n === 0 ? ' sev-pill-zero' : ''}">${p.label} <strong>${p.n}</strong></span>`
            ).join('');

            const projectNames = [...new Set(projects.map(p => projectName(p)))].sort();
            document.getElementById('stat-projects').innerHTML =
                `<strong>${summary.projects}</strong> project${summary.projects !== 1 ? 's' : ''} scanned ▾` +
                `<div id="projects-popover">${projectNames.map(n => `<div class="popover-project">${esc(n)}</div>`).join('')}</div>`;
            document.getElementById('stat-deps').innerHTML = `<strong>${summary.totalInstances}</strong> dep path${summary.totalInstances !== 1 ? 's' : ''} found`;
            document.getElementById('stat-packages').innerHTML =
                `<strong>${summary.total}</strong> vulnerabilit${summary.total !== 1 ? 'ies' : 'y'} ▾` +
                `<div id="vulns-popover">${summary.vulns.map(v =>
                    `<div class="popover-vuln">` +
                    `<span class="sev-badge ${esc(sevClass(v))}" style="font-size:9px;padding:1px 4px">${esc(v.severity)}</span>` +
                    `<a href="https://security.snyk.io/vuln/${esc(v.id)}" target="_blank" rel="noopener" class="popover-vuln-id">${esc(v.id)}</a>` +
                    `<span class="popover-vuln-title">${esc(v.title)}</span></div>`
                ).join('')}</div>`;

            if (scanDate) {
                document.getElementById('stat-scan-date').textContent = 'Scanned ' + new Date(scanDate).toLocaleString();
            }

            const copyBtn = document.getElementById('copy-summary-btn');
            if (copyBtn) {
                copyBtn.onclick = () => {
                    const date = new Date().toISOString().slice(0, 10);
                    const { projects, total, bySev, totalInstances } = summary;
                    const sevParts = ['critical', 'high', 'medium', 'low']
                        .filter(s => bySev[s] > 0)
                        .map(s => `${bySev[s]} ${s}`)
                        .join(', ');
                    const text = `Snyk ${date}: ${projects} project${projects !== 1 ? 's' : ''}, ${total} vulnerabilit${total !== 1 ? 'ies' : 'y'} (${sevParts}), ${totalInstances} dep path${totalInstances !== 1 ? 's' : ''}`;
                    navigator.clipboard.writeText(text).then(() => {
                        copyBtn.textContent = '✓ Copied';
                        setTimeout(() => { copyBtn.innerHTML = '&#x2398; Copy summary'; }, 2000);
                    });
                };
            }
        }

        // ── POSTs path updates ──
        function postUpdates(updates) {
            fetch('/update-snyk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            })
            .then(r => r.json())
            .then(result => {
                if (result.ok) location.reload();
                else alert('Update failed: ' + result.error);
            })
            .catch(err => alert('Failed to reach server: ' + err.message));
        }

        // ── Filter ──
        function filterEntries(entries) {
            const q = state.search.toLowerCase();
            return entries.filter(({ vuln }) => {
                const sev = (vuln.severity || '').toLowerCase();
                if (state.sevFilter !== 'all' && sev !== state.sevFilter) return false;
                if (q) {
                    const name = (vuln.name || vuln.packageName || '').toLowerCase();
                    const id = (vuln.id || '').toLowerCase();
                    const cves = (vuln.identifiers?.CVE || []).join(' ').toLowerCase();
                    const title = (vuln.title || '').toLowerCase();
                    if (!name.includes(q) && !id.includes(q) && !cves.includes(q) && !title.includes(q)) return false;
                }
                return true;
            });
        }

        // ── Render a single vuln row ──
        function renderVulnRow(vuln, projectEntries, key) {
            const sev = sevClass(vuln);
            const cves = vuln.identifiers?.CVE || [];
            const hasFix = vuln.fixedIn && vuln.fixedIn.length > 0;

            let nearIgnoredCount = 0;
            const projHtml = projectEntries.map(({ vuln: v, project }) => {
                const nearMatch = getNear(v, project);
                const near = nearMatch !== null;
                if (near) nearIgnoredCount++;

                let pathsHtml;
                if (near) {
                    const { path: matchedPath, reason } = nearMatch;
                    const activeParts = v.from?.slice(1) || [];
                    const snykParts = matchedPath.split(' > ');
                    const snykVerByName = new Map(snykParts.map(p => [stripVer(p), p.slice(stripVer(p).length)]));
                    const activeVerByName = new Map(activeParts.map(p => [stripVer(p), p.slice(stripVer(p).length)]));
                    const snykChanged = snykParts.map(p => {
                        const name = stripVer(p), ver = p.slice(name.length);
                        const av = activeVerByName.get(name);
                        return av !== undefined && av !== ver;
                    });
                    const activeChanged = activeParts.map(p => {
                        const name = stripVer(p), ver = p.slice(name.length);
                        const sv = snykVerByName.get(name);
                        return sv !== undefined && sv !== ver;
                    });
                    pathsHtml = `<div class="dep-paths">
                        <div class="dep-path-row">
                            <span class="dep-path-label label-snyk">.snyk</span>
                            ${depCrumbsHtml(snykParts, 'snyk-path', snykChanged)}
                        </div>
                        <div class="dep-path-row">
                            <span class="dep-path-label label-active">active</span>
                            ${activeParts.length ? depCrumbsHtml(activeParts, '', activeChanged) : '<span style="color:var(--c-text-muted)">Direct dependency</span>'}
                        </div>
                        ${reason ? `<div class="snyk-ignore-reason"><strong>Reason:</strong>${esc(reason)}</div>` : ''}
                    </div>`;
                } else {
                    const froms = Array.isArray(v.from) ? [v.from] : [];
                    pathsHtml = froms.length
                        ? `<div class="dep-paths">${froms.map(f => depPathHtml(f)).join('')}</div>`
                        : `<div class="dep-paths">${depPathHtml(v.from)}</div>`;
                }

                const resolveBtn = near ? (() => {
                    const snykFile = getSnykFilePath(project);
                    const activePath = (v.from?.slice(1) || []).join(' > ');
                    return `<button class="resolve-btn"
                        data-snyk-file="${esc(snykFile)}"
                        data-vuln-id="${esc(v.id)}"
                        data-old-path="${esc(nearMatch.path)}"
                        data-new-path="${esc(activePath)}">Update .snyk</button>`;
                })() : '';

                return `<div class="project-entry${near ? ' near-ignored' : ''}">
                    <div class="project-name">
                        <span>${esc(projectName(project))}</span>
                        ${near ? `<span class="project-name-actions"><span class="near-ignored-badge">≈ .snyk path match</span>${resolveBtn}</span>` : ''}
                    </div>
                    ${pathsHtml}
                </div>`;
            }).join('');

            const fixVersionsHtml = hasFix
                ? `<div class="detail-section">
                    <div class="detail-label">Fix in</div>
                    <div class="fix-versions">${vuln.fixedIn.map(v => `<span class="fix-version">${esc(v)}</span>`).join('')}</div>
                   </div>`
                : '';

            return `<div class="vuln-row ${sev}${nearIgnoredCount ? ' has-near-ignored' : ''}" data-key="${esc(key)}">
                <div class="vuln-summary">
                    <span class="sev-badge ${sev}">${sev}</span>
                    <div class="vuln-main">
                        <div class="vuln-title">${esc(vuln.title)}</div>
                        <div class="vuln-meta">
                            <span>${npmLink(vuln.name || vuln.packageName)}${esc(vuln.name || vuln.packageName)}@${esc(vuln.version)}</span>
                            ${cves.length ? `<span>${cveHtml(vuln)}</span>` : ''}
                            ${nearIgnoredCount ? `<span class="near-ignored-row-badge">≈ .snyk match</span>` : ''}
                        </div>
                    </div>
                    <span class="vuln-id-wrap">
                        <a class="vuln-id-link" href="https://security.snyk.io/vuln/${esc(vuln.id)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(vuln.id)}</a>
                        <button class="copy-btn" data-copy="${esc(vuln.id)}" title="Copy ID" onclick="event.stopPropagation()">⎘</button>
                    </span>
                    ${fixHtml(vuln)}
                    <span class="proj-count">${projectEntries.length} project${projectEntries.length !== 1 ? 's' : ''}</span>
                    <span class="expand-icon">▼</span>
                </div>
                <div class="vuln-detail">
                    ${fixVersionsHtml}
                    <div class="detail-section">
                        <div class="detail-label">Affected in ${projectEntries.length} project${projectEntries.length !== 1 ? 's' : ''}</div>
                        ${projHtml}
                    </div>
                </div>
            </div>`;
        }

        const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };

        function renderVulnGroups(entries, keyPrefix) {
            const byId = new Map();
            for (const e of entries) {
                if (!byId.has(e.vuln.id)) byId.set(e.vuln.id, { vuln: e.vuln, entries: [] });
                byId.get(e.vuln.id).entries.push(e);
            }
            return [...byId.values()]
                .sort((a, b) => (sevOrder[sevClass(a.vuln)] ?? 9) - (sevOrder[sevClass(b.vuln)] ?? 9))
                .map(({ vuln, entries: es }) => renderVulnRow(vuln, es, `${keyPrefix}::${vuln.id}`))
                .join('');
        }

        function buildReasonSummary(nearEntries) {
            const byReason = new Map();
            for (const { vuln, project } of nearEntries) {
                const match = getNear(vuln, project);
                const reason = match?.reason;
                if (!reason) continue;
                if (!byReason.has(reason)) byReason.set(reason, new Set());
                byReason.get(reason).add(projectName(project));
            }
            if (!byReason.size) return '';
            const entries = [...byReason.entries()].map(([reason, projs]) =>
                `<div class="reason-entry">
                    <div class="reason-text">${esc(reason)}</div>
                    <div class="reason-refs">
                        <span class="reason-refs-label">Found in:</span>
                        ${[...projs].map(p => `<span class="reason-ref">${esc(p)}</span>`).join('')}
                    </div>
                </div>`
            ).join('');
            return `<div class="reason-summary"><div class="reason-summary-label">Why these were previously ignored</div>${entries}</div>`;
        }

        function twoSectionHtml(nearEntries, nearHtml, otherHtml) {
            if (!nearHtml) return otherHtml;
            const summary = buildReasonSummary(nearEntries);
            let html = `<div class="section-divider near">≈ .snyk path matches</div>
                <div class="near-actions"><button class="update-all-btn" id="update-all-btn">Update all .snyk paths</button></div>
                ${summary}${nearHtml}`;
            if (otherHtml) html += `<div class="section-divider">Other vulnerabilities</div>${otherHtml}`;
            return html;
        }

        // ── Group views ──
        function renderByVuln(entries) {
            const byId = new Map();
            for (const entry of entries) {
                const id = entry.vuln.id;
                if (!byId.has(id)) byId.set(id, { vuln: entry.vuln, near: [], other: [] });
                const g = byId.get(id);
                (getNear(entry.vuln, entry.project) !== null ? g.near : g.other).push(entry);
            }
            const sorted = [...byId.values()]
                .sort((a, b) => (sevOrder[sevClass(a.vuln)] ?? 9) - (sevOrder[sevClass(b.vuln)] ?? 9));
            const nearHtml = sorted.filter(g => g.near.length)
                .map(({ vuln, near }) => renderVulnRow(vuln, near, vuln.id + ':near')).join('');
            const otherHtml = sorted.filter(g => g.other.length)
                .map(({ vuln, other }) => renderVulnRow(vuln, other, vuln.id + ':other')).join('');
            return twoSectionHtml(sorted.flatMap(g => g.near), nearHtml, otherHtml);
        }

        function renderByPackage(entries) {
            const byPkg = new Map();
            for (const entry of entries) {
                const pkg = entry.vuln.name || entry.vuln.packageName || '(unknown)';
                if (!byPkg.has(pkg)) byPkg.set(pkg, { near: [], other: [] });
                const g = byPkg.get(pkg);
                (getNear(entry.vuln, entry.project) !== null ? g.near : g.other).push(entry);
            }
            const sorted = [...byPkg.entries()].sort((a, b) => a[0].localeCompare(b[0]));
            function renderPkgSection(filter) {
                return sorted.filter(([, g]) => filter(g).length).map(([pkg, g]) => {
                    const es = filter(g);
                    return `<div class="group-header">${npmLink(pkg)}${esc(pkg)} (${es.length} vuln${es.length !== 1 ? 's' : ''})</div>${renderVulnGroups(es, pkg)}`;
                }).join('');
            }
            return twoSectionHtml(sorted.flatMap(([, g]) => g.near), renderPkgSection(g => g.near), renderPkgSection(g => g.other));
        }

        function renderByProject(entries) {
            const byProj = new Map();
            for (const entry of entries) {
                const pname = projectName(entry.project);
                if (!byProj.has(pname)) byProj.set(pname, { near: [], other: [] });
                const g = byProj.get(pname);
                (getNear(entry.vuln, entry.project) !== null ? g.near : g.other).push(entry);
            }
            const sorted = [...byProj.entries()].sort((a, b) => a[0].localeCompare(b[0]));
            function renderProjSection(filter) {
                return sorted.filter(([, g]) => filter(g).length).map(([pname, g]) => {
                    const es = filter(g);
                    return `<div class="group-header">${esc(pname)} (${es.length} vuln${es.length !== 1 ? 's' : ''})</div>${renderVulnGroups(es, pname)}`;
                }).join('');
            }
            return twoSectionHtml(sorted.flatMap(([, g]) => g.near), renderProjSection(g => g.near), renderProjSection(g => g.other));
        }

        // ── Render ignored ──
        function renderIgnored() {
            const list = document.getElementById('ignored-list');
            const toggle = document.getElementById('ignored-toggle');
            const badge = toggle.querySelector('.ignored-count-badge');
            badge.textContent = allIgnored.length ? `(${allIgnored.length})` : '';
            if (!allIgnored.length) {
                document.getElementById('ignored-section').style.display = 'none';
                return;
            }
            list.innerHTML = allIgnored.map(({ ign, project }) => {
                const reasons = ign.filtered?.ignored || [];
                const reasonText = reasons.map(r => r.reason || '').filter(Boolean)[0] || '';
                const expires = reasons.map(r => r.expires).filter(Boolean)[0];
                const expiryStr = expires ? ` · Expires ${new Date(expires).toLocaleDateString()}` : '';
                return `<div class="ignored-row">
                    <div><strong>${esc(ign.id)}</strong> · <span style="color:var(--c-text-muted)">${esc(ign.title || '')}</span> · <span style="font-size:11px">${npmLink(ign.name || ign.packageName || '')}${esc(ign.name || ign.packageName || '')}@${esc(ign.version || '')}</span></div>
                    <div class="project-name" style="font-size:11px;margin-top:3px">${esc(projectName(project))}</div>
                    ${reasonText ? `<div class="ignored-reason">${esc(reasonText)}${expiryStr}</div>` : ''}
                </div>`;
            }).join('');
        }

        // ── Main render ──
        function render() {
            const filtered = filterEntries(allVulnEntries);
            const list = document.getElementById('vuln-list');
            const countBar = document.getElementById('count-bar');

            let html;
            if (state.groupBy === 'vuln') html = renderByVuln(filtered);
            else if (state.groupBy === 'package') html = renderByPackage(filtered);
            else html = renderByProject(filtered);

            if (!html) {
                list.innerHTML = `<div id="empty-state"><div class="empty-icon">🎉</div><div>No vulnerabilities match your filters.</div></div>`;
            } else {
                list.innerHTML = html;
            }

            const uniqueFiltered = new Set(filtered.map(e => e.vuln.id)).size;
            countBar.textContent = `Showing ${uniqueFiltered} unique vulnerabilit${uniqueFiltered !== 1 ? 'ies' : 'y'}`;

            list.querySelectorAll('.vuln-summary').forEach(summary => {
                summary.addEventListener('click', () => {
                    summary.closest('.vuln-row').classList.toggle('expanded');
                });
            });

            list.querySelectorAll('.copy-btn, .dep-path-copy').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
                        btn.textContent = '✓';
                        btn.classList.add('copied');
                        setTimeout(() => { btn.textContent = '⎘'; btn.classList.remove('copied'); }, 1500);
                    });
                });
            });

            list.querySelectorAll('.dep-crumb[data-copy]').forEach(crumb => {
                crumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(crumb.dataset.copy).then(() => {
                        crumb.classList.add('flash');
                        setTimeout(() => crumb.classList.remove('flash'), 1200);
                    });
                });
            });

            list.querySelectorAll('.resolve-btn').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    const { snykFile, vulnId, oldPath, newPath } = btn.dataset;
                    btn.disabled = true;
                    btn.textContent = 'Updating…';
                    postUpdates([{ snykFile, vulnId, oldPath, newPath }]);
                });
            });

            const updateAllBtn = document.getElementById('update-all-btn');
            if (updateAllBtn) {
                updateAllBtn.addEventListener('click', () => {
                    const updates = [];
                    const seen = new Set();
                    for (const { vuln, project } of allVulnEntries) {
                        const match = getNear(vuln, project);
                        if (!match) continue;
                        const activePath = (vuln.from?.slice(1) || []).join(' > ');
                        if (!activePath || activePath === match.path) continue;
                        const snykFile = getSnykFilePath(project);
                        const key = `${snykFile}|${vuln.id}|${match.path}`;
                        if (seen.has(key)) continue;
                        seen.add(key);
                        updates.push({ snykFile, vulnId: vuln.id, oldPath: match.path, newPath: activePath });
                    }
                    if (!updates.length) return;
                    updateAllBtn.disabled = true;
                    updateAllBtn.textContent = 'Updating…';
                    postUpdates(updates);
                });
            }
        }

        // ── Controls wiring ──
        document.getElementById('search').addEventListener('input', e => {
            state.search = e.target.value;
            render();
        });

        document.querySelectorAll('.chip[data-sev]').forEach(chip => {
            chip.addEventListener('click', () => {
                state.sevFilter = chip.dataset.sev;
                document.querySelectorAll('.chip[data-sev]').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                render();
            });
        });

        document.querySelectorAll('.seg-btn[data-group]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.groupBy = btn.dataset.group;
                document.querySelectorAll('.seg-btn[data-group]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                render();
            });
        });

        document.getElementById('show-ignored').addEventListener('change', e => {
            state.showIgnored = e.target.checked;
            const section = document.getElementById('ignored-section');
            if (state.showIgnored) section.classList.add('open');
            else section.classList.remove('open');
        });

        document.getElementById('ignored-toggle').addEventListener('click', () => {
            document.getElementById('ignored-section').classList.toggle('open');
        });

        document.getElementById('stat-projects').addEventListener('click', e => {
            e.stopPropagation();
            document.getElementById('vulns-popover').classList.remove('open');
            document.getElementById('projects-popover').classList.toggle('open');
        });
        document.getElementById('stat-packages').addEventListener('click', e => {
            e.stopPropagation();
            document.getElementById('projects-popover').classList.remove('open');
            document.getElementById('vulns-popover').classList.toggle('open');
        });
        document.addEventListener('click', () => {
            document.getElementById('projects-popover')?.classList.remove('open');
            document.getElementById('vulns-popover')?.classList.remove('open');
        });

        // ── Re-run Snyk scan ──
        document.getElementById('run-snyk-btn').addEventListener('click', () => {
            const backup = document.getElementById('backup-cb').checked;
            const btn = document.getElementById('run-snyk-btn');
            btn.disabled = true;

            const panel = document.getElementById('run-log-panel');
            panel.style.display = '';
            panel.innerHTML = `<div class="run-log-header">
                <span class="run-log-title"><span class="run-log-spinner"></span> Running Snyk scan…</span>
            </div><pre class="run-log-body"></pre>`;
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            const logBody = panel.querySelector('.run-log-body');

            const evtSource = new EventSource(`/run-snyk?backup=${backup ? '1' : '0'}`);
            evtSource.addEventListener('message', e => {
                const { text } = JSON.parse(e.data);
                logBody.textContent += text.replace(new RegExp(String.fromCharCode(27) + '\\[[0-9;]*[a-zA-Z]', 'g'), '');
                logBody.scrollTop = logBody.scrollHeight;
            });
            evtSource.addEventListener('done', e => {
                evtSource.close();
                const { ok, error } = JSON.parse(e.data);
                const header = panel.querySelector('.run-log-header');
                if (ok) {
                    header.innerHTML = `<span class="run-log-title" style="color:var(--c-fix)">✓ Scan complete — reloading…</span>`;
                    setTimeout(() => location.reload(), 800);
                } else {
                    header.innerHTML = `<span class="run-log-title" style="color:var(--c-critical)">⚠ Scan failed: ${esc(error || 'unknown error')}</span>`;
                    btn.disabled = false;
                }
            });
            evtSource.onerror = () => {
                evtSource.close();
                const header = panel.querySelector('.run-log-header');
                header.innerHTML = `<span class="run-log-title" style="color:var(--c-critical)">⚠ Connection error</span>`;
                btn.disabled = false;
            };
        });

        // ── Init ──
        renderHeader();
        renderIgnored();
        render();
    };
})();
