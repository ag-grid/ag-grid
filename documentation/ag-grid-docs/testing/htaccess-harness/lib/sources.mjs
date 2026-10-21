// Resolve the grid / charts / studio sources and emit every .htaccess FRESH from them.
//
// Never reads a build output (dist): a stale dist is how this harness once reported 7251/0 while
// the current charts rules had 96 real failures. Each site is either a working tree (default) or a
// git ref, materialised with `git archive` into the work dir - the repo's working tree, index and
// worktree list are never touched. node_modules is symlinked from the repo so `tsx` can resolve.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const git = (repo, args, opts = {}) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', ...opts });

export const SITES = {
    grid: {
        pkg: 'documentation/ag-grid-docs',
        // the in-flight patcher is part of the grid source: the harness runs the real one
        extra: ['scripts/uncached-archives.mjs'],
    },
    charts: { pkg: 'packages/ag-charts-website', extra: [] },
    studio: { pkg: 'packages/ag-studio-docs', extra: [] },
};

/** Candidate sibling-repo locations, most specific first. */
export function siblingCandidates(mainRepo, names) {
    const out = [];
    for (const n of names) {
        out.push(resolve(mainRepo, '..', n));
    }
    // From a worktree, the siblings sit next to the MAIN checkout, not next to the worktree.
    try {
        const common = resolve(mainRepo, git(mainRepo, ['rev-parse', '--git-common-dir']).trim());
        for (const n of names) {
            out.push(resolve(dirname(common), '..', n));
        }
    } catch {
        // not a git checkout
    }
    return [...new Set(out)];
}

const existsAtRef = (repo, ref, path) => {
    try {
        execFileSync('git', ['-C', repo, 'cat-file', '-e', `${ref}:${path}`], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

/**
 * Returns { root, pkgDir, label } for a site. With a ref, extracts only what the emitter needs
 * (the package's src minus page content, the shared subrepo's src, the tsconfigs) into
 * <work>/src/<site>.
 */
export function materialise(site, repo, ref, work) {
    const { pkg, extra } = SITES[site];
    if (!existsSync(join(repo, pkg))) {
        throw new Error(`${site}: ${repo} has no ${pkg}`);
    }
    if (!ref) {
        const sha = git(repo, ['rev-parse', '--short', 'HEAD']).trim();
        const branch = git(repo, ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
        const dirty = git(repo, ['status', '--porcelain', '--', pkg, ...extra]).trim() ? ' +uncommitted changes' : '';
        return { root: repo, pkgDir: join(repo, pkg), label: `${repo} working tree (${branch} @ ${sha}${dirty})` };
    }
    const sha = git(repo, ['rev-parse', '--short', `${ref}^{commit}`]).trim();
    const dest = join(work, 'src', site);
    mkdirSync(dest, { recursive: true });
    const wanted = [
        `${pkg}/src`,
        `${pkg}/package.json`,
        `${pkg}/tsconfig.json`,
        'external/ag-website-shared/src',
        'package.json',
        'tsconfig.base.json',
        ...extra,
    ].filter((p) => existsAtRef(repo, ref, p));
    // sibling packages' manifests: constants modules import them for version strings
    if (existsAtRef(repo, ref, 'packages')) {
        wanted.push(':(glob)packages/*/package.json');
    }
    const tar = join(work, 'src', `${site}.tar`);
    git(repo, [
        'archive',
        '-o',
        tar,
        sha,
        ...wanted,
        `:(exclude)${pkg}/src/content`,
        ':(exclude)external/ag-website-shared/src/content',
    ]);
    execFileSync('tar', ['-xf', tar, '-C', dest]);
    for (const nm of ['node_modules', `${pkg}/node_modules`]) {
        if (existsSync(join(repo, nm)) && !existsSync(join(dest, nm))) {
            symlinkSync(join(repo, nm), join(dest, nm));
        }
    }
    return { root: dest, pkgDir: join(dest, pkg), label: `${repo} @ ${ref} (${sha}, via git archive)` };
}

/**
 * Emit one production .htaccess with the site's own generator, for a given deployed base. Runs in
 * a child process because each site's constants read PUBLIC_BASE_URL at import time.
 */
export function emitHtaccess(pkgDir, base, out) {
    const script = `import('./src/utils/htaccess/htaccessRules.ts').then(async (m) => {
        const { writeFileSync } = await import('node:fs');
        const mod = m.getHtaccessContent ? m : m.default;
        writeFileSync(process.env.HARNESS_OUT, mod.getHtaccessContent({ env: 'production' }));
    })`;
    try {
        execFileSync('npx', ['--no-install', 'tsx', '-e', script], {
            cwd: pkgDir,
            env: {
                ...process.env,
                PUBLIC_BASE_URL: base,
                // charts' constants derive URLs from it; the value never reaches the .htaccess
                PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? 'https://www.ag-grid.com',
                HARNESS_OUT: out,
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
    } catch (e) {
        throw new Error(`emit failed in ${pkgDir} (base '${base}'):\n${e.stderr?.toString() ?? e.message}`, {
            cause: e,
        });
    }
}

/** Evaluate a module expression in a site's package with tsx; returns stdout. */
export function tsxEval(pkgDir, script, extraEnv = {}) {
    return execFileSync('npx', ['--no-install', 'tsx', '-e', script], {
        cwd: pkgDir,
        env: { ...process.env, PUBLIC_SITE_URL: 'https://www.ag-grid.com', ...extraEnv },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

/**
 * The deployed layout under test. Two archives where an in-flight state exists: one released
 * (long-cached) and one release candidate (patched no-cache by scripts/uncached-archives.mjs).
 */
export const LAYOUT = {
    gridArchives: ['36.2.0', '36.3.0'],
    gridReleased: '36.2.0',
    gridInFlight: '36.3.0',
    chartsArchives: ['14.2.0', '14.3.0'],
    chartsReleased: '14.2.0',
    chartsInFlight: '14.3.0',
    studioArchives: ['3.0.0'],
};

const isOn = (v) => v === '1' || v === 'true';

/**
 * Locate and materialise the three sources. A missing sibling repo is an ERROR unless skipped
 * explicitly with SKIP_CHARTS=1 / SKIP_STUDIO=1: coverage is never dropped silently. Staging serves
 * charts and studio from their own hosts, so its topology is grid-only by design.
 */
export function resolveSources({ mainRepo, work, htaccessEnv, env }) {
    const findRepo = (envVar, names) => {
        if (env[envVar]) {
            return existsSync(env[envVar]) ? resolve(env[envVar]) : null;
        }
        return siblingCandidates(mainRepo, names).find((p) => existsSync(join(p, '.git'))) ?? null;
    };
    const sites = {
        grid: { repo: env.GRID_REPO ? resolve(env.GRID_REPO) : mainRepo, ref: env.GRID_REF || '' },
        charts: { repo: findRepo('CHARTS_REPO', ['ag-charts', 'charts-clean']), ref: env.CHARTS_REF || '' },
        studio: { repo: findRepo('STUDIO_REPO', ['ag-studio', 'studio-clean']), ref: env.STUDIO_REF || '' },
    };
    const coverage = { grid: 'tested' };
    const errors = [];
    for (const site of ['charts', 'studio']) {
        const skipVar = `SKIP_${site.toUpperCase()}`;
        if (htaccessEnv !== 'production') {
            coverage[site] = `NOT TESTED (not part of the ${htaccessEnv} topology: ${site} has its own host there)`;
            sites[site].off = true;
        } else if (isOn(env[skipVar])) {
            coverage[site] = `NOT TESTED (${skipVar}=1)`;
            sites[site].off = true;
        } else if (!sites[site].repo) {
            errors.push(
                `${site} repo not found (set ${site.toUpperCase()}_REPO=/path, or ${skipVar}=1 to run without ${site} coverage)`
            );
        } else {
            coverage[site] = 'tested';
        }
    }
    if (errors.length) {
        return { errors };
    }
    const src = {};
    for (const [site, cfg] of Object.entries(sites)) {
        if (!cfg.off) {
            src[site] = materialise(site, cfg.repo, cfg.ref, work);
        }
    }
    return { sites, src, coverage };
}

/** Emit every .htaccess of the layout into htdocs, then mark the release candidates in flight. */
export function emitLayout(src, htdocs) {
    const emitted = [];
    const emit = (site, base) => {
        const out = join(htdocs, base, '.htaccess');
        mkdirSync(join(htdocs, base), { recursive: true });
        emitHtaccess(src[site].pkgDir, base, out);
        const text = readFileSync(out, 'utf8');
        if (!text.startsWith('### AUTOGENERATED')) {
            throw new Error(`${out} does not look like a generated .htaccess`);
        }
        emitted.push({ site, base: base || '/', file: out, bytes: text.length });
    };
    emit('grid', '');
    for (const v of LAYOUT.gridArchives) {
        emit('grid', `/archive/${v}`);
    }
    if (src.charts) {
        emit('charts', '/charts');
        for (const v of LAYOUT.chartsArchives) {
            emit('charts', `/charts/archive/${v}`);
        }
    }
    if (src.studio) {
        emit('studio', '/studio');
        for (const v of LAYOUT.studioArchives) {
            emit('studio', `/studio/archive/${v}`);
        }
    }
    // The REAL release mechanism: the grid repo's patcher, run against the emitted root file
    // exactly as the release step runs it against the deployed one.
    const patched = execFileSync(
        'node',
        [
            join(src.grid.root, 'scripts/uncached-archives.mjs'),
            join(htdocs, '.htaccess'),
            'set',
            LAYOUT.gridInFlight,
            LAYOUT.chartsInFlight,
        ],
        { encoding: 'utf8' }
    ).trim();
    return { emitted, patched };
}
