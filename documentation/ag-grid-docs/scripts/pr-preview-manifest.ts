#!/usr/bin/env tsx
/* eslint-disable no-console */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import {
    MANIFEST_FILENAME,
    type PrPreviewPlan,
    type StagedEntry,
    buildPrPreviewPlan,
    dedupeByContent,
} from '../src/utils/prPreviewManifest';

/**
 * Stages the per-PR preview payload and writes its `manifest.json`.
 *
 * The file list is derived from the site's own import-map builder (see
 * `src/utils/prPreviewManifest.ts`), not hand-maintained, so the preview always carries exactly
 * the files an exported Plunker's import map asks for. Design: ag-dev-prompts
 * docs/pr-plnkr-v2-plan.md.
 *
 * Usage:
 *   tsx scripts/pr-preview-manifest.ts --pr 15255 --sha 0123abcd --out ../../dist/pr-preview
 *
 *   --pr <n>        PR number (required)
 *   --sha <sha>     head commit of the preview (required)
 *   --out <dir>     staging directory; emptied first (required)
 *   --repo <o/r>    owner/repo, default $GITHUB_REPOSITORY or ag-grid/ag-grid
 *   --allow-missing local dry-run only: report missing sources instead of failing
 */

const REPO_ROOT = resolve(import.meta.dirname, '../../..');

const parseArgs = (argv: string[]) => {
    const flags = new Map<string, string>();
    let allowMissing = false;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--allow-missing') {
            allowMissing = true;
        } else if (arg.startsWith('--')) {
            const value = argv[i + 1];
            if (value === undefined || value.startsWith('--')) {
                throw new Error(`Missing value for ${arg}`);
            }
            flags.set(arg.slice(2), value);
            i++;
        } else {
            throw new Error(`Unexpected argument '${arg}'`);
        }
    }
    const required = (name: string) => {
        const value = flags.get(name);
        if (!value) {
            throw new Error(`--${name} is required`);
        }
        return value;
    };
    const pr = Number(required('pr'));
    if (!Number.isInteger(pr) || pr <= 0) {
        throw new Error(`--pr must be a positive integer, got '${flags.get('pr')}'`);
    }
    return {
        pr,
        sha: required('sha'),
        out: resolve(process.cwd(), required('out')),
        repo: flags.get('repo') ?? process.env.GITHUB_REPOSITORY ?? 'ag-grid/ag-grid',
        allowMissing,
    };
};

/** Every file under a staged directory entry that the site would serve from it. */
const filesOf = (entry: StagedEntry): string[] => {
    const absolute = join(REPO_ROOT, entry.source);
    if (!entry.target.endsWith('/')) {
        return existsSync(absolute) ? [entry.source] : [];
    }
    if (!existsSync(absolute)) {
        return [];
    }
    const walk = (dir: string): string[] =>
        readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
            const child = join(dir, dirent.name);
            if (dirent.isDirectory()) {
                return walk(child);
            }
            const served = entry.extensions.length === 0 || entry.extensions.some((ext) => child.endsWith(ext));
            return served ? [relative(REPO_ROOT, child)] : [];
        });
    return walk(absolute).sort();
};

/** Content digest over the served files of an entry — path-relative, so two copies of a tree match. */
const digestOf = (entry: StagedEntry, files: string[]): string | undefined => {
    if (files.length === 0) {
        return undefined;
    }
    const hash = createHash('sha256');
    const prefix = entry.source;
    for (const file of files) {
        hash.update(file.startsWith(prefix) ? file.slice(prefix.length) : file);
        hash.update('\0');
        hash.update(readFileSync(join(REPO_ROOT, file)));
        hash.update('\0');
    }
    return hash.digest('hex');
};

const stage = (plan: PrPreviewPlan, out: string, fileLists: Map<string, string[]>) => {
    let copied = 0;
    for (const entry of plan.entries) {
        const destination = join(out, entry.target);
        if (entry.target.endsWith('/')) {
            for (const file of fileLists.get(entry.target) ?? []) {
                const to = join(destination, relative(entry.source, file));
                mkdirSync(dirname(to), { recursive: true });
                cpSync(join(REPO_ROOT, file), to);
                copied++;
            }
        } else {
            mkdirSync(dirname(destination), { recursive: true });
            cpSync(join(REPO_ROOT, entry.source), destination);
            copied++;
        }
    }
    return copied;
};

const main = () => {
    const { pr, sha, out, repo, allowMissing } = parseArgs(process.argv.slice(2));
    let plan = buildPrPreviewPlan({ repo, pr, sha });

    const fileLists = new Map<string, string[]>();
    const missing: string[] = [];
    for (const entry of plan.entries) {
        const files = filesOf(entry);
        fileLists.set(entry.target, files);
        if (files.length === 0) {
            missing.push(`${entry.target} <- ${entry.source}`);
        }
    }

    // Fail loud by default: a preview that silently omits a package publishes a manifest promising
    // files that 404, and the pin that reads it produces a broken repro rather than no repro.
    if (missing.length > 0) {
        const detail = missing.map((line) => `  - ${line}`).join('\n');
        if (!allowMissing) {
            console.error(`PR preview: ${missing.length} manifest path(s) are not built:\n${detail}`);
            console.error('Build the packages the manifest names, or pass --allow-missing for a dry run.');
            process.exit(1);
        }
        console.warn(`PR preview: ignoring ${missing.length} unbuilt path(s) (--allow-missing):\n${detail}`);
        plan = {
            manifest: plan.manifest,
            entries: plan.entries.filter(({ target }) => (fileLists.get(target) ?? []).length > 0),
        };
    }

    plan = dedupeByContent(plan, (entry) => digestOf(entry, fileLists.get(entry.target) ?? []));

    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const copied = stage(plan, out, fileLists);
    const manifestPath = join(out, MANIFEST_FILENAME);
    writeFileSync(manifestPath, `${JSON.stringify(plan.manifest, null, 2)}\n`);

    const bytes = plan.entries
        .flatMap((entry) => fileLists.get(entry.target) ?? [])
        .reduce((total, file) => total + statSync(join(REPO_ROOT, file)).size, 0);
    console.log(
        `PR preview: staged ${copied} file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB, ` +
            `${Object.keys(plan.manifest.packages).length} package(s) into ${out}`
    );
};

try {
    main();
} catch (error) {
    console.error(`PR preview: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
}
