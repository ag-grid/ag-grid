// Lay out a docroot shaped like production's /var/www/html: the grid site at the root, charts and
// studio as subdirectories with their own .htaccess, and archive builds (each with its own
// .htaccess) below /archive, /charts/archive and /studio/archive.
//
// Placeholder files are tiny but have the real names and extensions, so mod_dir, mod_mime and the
// `-f`/`-d` checks in the rules behave as in production. Each 404 page names itself in its body, so
// a row can prove WHICH ErrorDocument answered.
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';

import { normaliseLocation } from './probe.mjs';

// mod_deflate leaves a body of under about 100 bytes uncompressed, so the text placeholders are
// padded past that: a compressible type must come back compressed, with the -gzip ETag.
const padded = (body) => body + 'padding '.repeat(32) + '\n';

const bodyFor = (file) => {
    switch (extname(file)) {
        case '.html':
            return padded(`<!doctype html><title>${file}</title>placeholder ${file}\n`);
        case '.md':
            return padded(`# placeholder ${file}\n`);
        case '.json':
            return '{}\n';
        case '.svg':
            return '<svg xmlns="http://www.w3.org/2000/svg"/>\n';
        default:
            return padded(`placeholder ${file}\n`);
    }
};

export function placeFile(htdocs, file, body) {
    const abs = join(htdocs, file);
    // never turn a directory into a file or vice versa: the first layout wins, and a conflict is a
    // row-authoring error worth hearing about
    if (existsSync(abs)) {
        if (statSync(abs).isDirectory()) {
            throw new Error(`placeholder ${file} collides with an existing directory`);
        }
        return;
    }
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body ?? bodyFor(file));
}

/** The file(s) that make a URL path resolve to 200. */
export function filesForPath(path, { md = false } = {}) {
    const p = decodeURIComponent(path.split(/[?#]/)[0]);
    if (p.endsWith('/')) {
        const files = [`${p}index.html`];
        if (md) {
            files.push(p === '/' ? '/index.md' : `${p.slice(0, -1)}.md`);
        }
        return files;
    }
    const last = p.slice(p.lastIndexOf('/') + 1);
    if (last.includes('.')) {
        return [p];
    }
    // a slash-less directory URL: the directory must exist for the slash redirect to target it
    return [`${p}/index.html`, ...(md ? [`${p}.md`] : [])];
}

export function buildScaffold(htdocs, layout) {
    const notFound = (dir, who) => placeFile(htdocs, `${dir}/404.html`, `<!doctype html><title>404</title>${who}\n`);
    placeFile(htdocs, '/index.html');
    placeFile(htdocs, '/index.md');
    notFound('', 'grid-root-404');
    for (const v of layout.gridArchives) {
        placeFile(htdocs, `/archive/${v}/index.html`);
        placeFile(htdocs, `/archive/${v}/index.md`);
        // archive builds ship a 404.html too; the archive's ErrorDocument decides whether it is used
        notFound(`/archive/${v}`, `grid-archive-${v}-404`);
    }
    if (layout.charts) {
        placeFile(htdocs, '/charts/index.html');
        placeFile(htdocs, '/charts/index.md');
        notFound('/charts', 'charts-404');
        for (const v of layout.chartsArchives) {
            placeFile(htdocs, `/charts/archive/${v}/index.html`);
            placeFile(htdocs, `/charts/archive/${v}/index.md`);
            notFound(`/charts/archive/${v}`, `charts-archive-${v}-404`);
        }
    }
    if (layout.studio) {
        placeFile(htdocs, '/studio/index.html');
        placeFile(htdocs, '/studio/index.md');
        notFound('/studio', 'studio-404');
        for (const v of layout.studioArchives) {
            placeFile(htdocs, `/studio/archive/${v}/index.html`);
            placeFile(htdocs, `/studio/archive/${v}/index.md`);
            notFound(`/studio/archive/${v}`, `studio-archive-${v}-404`);
        }
    }
}

/** Create the files each row needs to exist (its own 200 target, its chain's end, page=...). */
export function placeRowFiles(htdocs, rows, port) {
    for (const row of rows) {
        const want = [];
        if (row.status === 200) {
            want.push(...filesForPath(row.path, { md: row.accept === 'text/markdown' && row.twin }));
        }
        // a chain expected to end on a 200 needs its end page: the final-url if given, else the
        // first Location (a one-hop chain), when that is a page this docroot serves
        const final = row.checks.find((c) => c.key === 'final');
        const finalUrl = row.checks.find((c) => c.key === 'final-url')?.value ?? row.location;
        if (final?.value === '200' && finalUrl) {
            const loc = normaliseLocation(finalUrl, port);
            if (loc.startsWith('/')) {
                want.push(...filesForPath(loc));
            } else if (/^https:\/\/www\.ag-grid\.com\//.test(loc)) {
                want.push(...filesForPath(new URL(loc).pathname));
            }
        }
        for (const p of row.pages) {
            want.push(...filesForPath(p));
        }
        for (const f of want) {
            placeFile(htdocs, f);
        }
    }
}
