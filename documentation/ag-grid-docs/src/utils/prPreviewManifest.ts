import type { InternalFramework } from '@ag-grid-types';
import { ALL_INTERNAL_FRAMEWORKS, PUBLISHED_UMD_URLS, agGridVersion } from '@constants';
import { getImportMap } from '@utils/exampleModules/getImportMap';
import { FILES_PATH_MAP } from '@utils/pages';

/**
 * Derives what a per-PR preview publishes, and the `manifest.json` that describes it, from the
 * site's own import-map builder rather than a hand-maintained list — so the preview cannot drift
 * from the URLs an exported Plunker actually asks for.
 *
 * Design and the wider pin flow: ag-dev-prompts docs/pr-plnkr-v2-plan.md.
 *
 * Pure: every path here is derived, nothing is read from disk. Existence checking, byte-identical
 * de-duplication and the copy itself belong to `scripts/pr-preview-manifest.ts`.
 */

export const MANIFEST_VERSION = 1;
export const MANIFEST_FILENAME = 'manifest.json';

/** Packages this repo does not build; the site resolves them from `node_modules/`. */
const FOREIGN_PACKAGE_PREFIX = 'ag-charts-';

export interface ManifestPackage {
    version: string;
    /**
     * Package-relative path (as it appears after `<pkg>@<version>/` in a published URL) → the
     * path it is published at, relative to `pr-<N>/`. A key ending in `/` is a directory prefix
     * and matches by longest prefix.
     */
    paths: Record<string, string>;
}

export interface PrPreviewManifest {
    version: number;
    repo: string;
    pr: number;
    sha: string;
    base: string;
    /** Package → the flat UMD filename published at the root of `pr-<N>/`. */
    umd: Record<string, string>;
    packages: Record<string, ManifestPackage>;
}

export interface StagedEntry {
    /** Path relative to `pr-<N>/`. Ends with `/` when this is a whole directory. */
    target: string;
    /** Repo-root-relative source path. Ends with `/` when this is a whole directory. */
    source: string;
    /** Extensions the site serves from this source, taken from `FILES_PATH_MAP`'s glob. */
    extensions: string[];
}

export interface PrPreviewPlan {
    manifest: PrPreviewManifest;
    entries: StagedEntry[];
}

/** `ag-grid-community/styles/` → `ag-grid-community`; `@ag-grid-community/locale` → itself. */
export const packageNameOf = (specifier: string): string =>
    specifier
        .split('/')
        .slice(0, specifier.startsWith('@') ? 2 : 1)
        .join('/');

const isAgSpecifier = (specifier: string) => specifier.startsWith('ag-') || specifier.startsWith('@ag-');

const isBuiltHere = (packageName: string) =>
    packageName === 'ag-stack' || packageName.startsWith('ag-grid-') || packageName.startsWith('@ag-grid-community/');

const escapeForRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The package-relative path an import-map value points at, independent of which mode built the
 * map: published values carry `<pkg>@<version>/`, local ones plain `<pkg>/`. Greedy, so the
 * package segment matched is the last one — `ag-grid-angular/fesm2022/ag-grid-angular.mjs` keeps
 * its filename.
 */
export const packageRelativePath = (packageName: string, url: string): string | undefined =>
    url.match(new RegExp(`^(?:.*/)?${escapeForRegExp(packageName)}(?:@[^/]+)?/(.+)$`))?.[1];

interface RouteMapping {
    /** `FILES_PATH_MAP` key up to its `**`, e.g. `ag-grid-community/dist/`. */
    route: string;
    /** The matching source path up to its `**`, e.g. `packages/ag-grid-community/dist/`. */
    source: string;
    extensions: string[];
}

/** `…/**\/*.{cjs,mjs,js,map}` → ['.cjs', '.mjs', '.js', '.map']; `…/*.css` → ['.css']. */
const extensionsOf = (glob: string): string[] => {
    const braced = glob.match(/\*\.\{([^}]+)\}$/);
    if (braced) {
        return braced[1].split(',').map((ext) => `.${ext.trim()}`);
    }
    const single = glob.match(/\*(\.[A-Za-z0-9]+)$/);
    return single ? [single[1]] : [];
};

/**
 * The site serves each package from `/files/<pkg>/<path>`, and `FILES_PATH_MAP` is the mapping
 * from that route to the built file on disk. Reusing it is what keeps a moved package root from
 * silently producing a preview of missing files. Longest route first, so the more specific entry
 * wins (`ag-grid-community/styles/` over `ag-grid-community/`).
 */
const routeMappings = (): RouteMapping[] =>
    Object.entries(FILES_PATH_MAP)
        .filter(([route, source]) => typeof source === 'string' && route.includes('**'))
        .map(([route, source]) => ({
            route: route.slice(0, route.indexOf('**')),
            source: (source as string).slice(0, (source as string).indexOf('**')),
            extensions: extensionsOf(source as string),
        }))
        .sort((a, b) => b.route.length - a.route.length);

/** Throws rather than skipping: an unmapped AG package publishes a preview nothing can resolve. */
const resolveSource = (mappings: RouteMapping[], routePath: string): Omit<StagedEntry, 'target'> => {
    const mapping = mappings.find(({ route }) => routePath.startsWith(route));
    if (!mapping) {
        throw new Error(
            `No FILES_PATH_MAP entry serves '${routePath}'. Add one in src/utils/pages.ts, or the ` +
                `PR preview cannot publish this package.`
        );
    }
    const source = mapping.source + routePath.slice(mapping.route.length);
    if (!routePath.endsWith('/') && mapping.extensions.length > 0) {
        const served = mapping.extensions.some((ext) => source.endsWith(ext));
        if (!served) {
            throw new Error(
                `'${routePath}' resolves to '${source}', which FILES_PATH_MAP does not serve ` +
                    `(expected one of ${mapping.extensions.join(', ')}).`
            );
        }
    }
    return { source, extensions: mapping.extensions };
};

const everyImportMap = (): Record<string, string>[] =>
    ALL_INTERNAL_FRAMEWORKS.flatMap((internalFramework: InternalFramework) => [
        getImportMap({ internalFramework, isEnterprise: false }),
        getImportMap({ internalFramework, isEnterprise: true, isIntegratedCharts: true }),
    ]);

export interface BuildPrPreviewPlanArgs {
    /** `owner/repo`, as `GITHUB_REPOSITORY` gives it. */
    repo: string;
    pr: number;
    sha: string;
}

export const previewBaseUrl = ({ repo, pr }: { repo: string; pr: number }): string => {
    const [owner, name] = repo.split('/');
    if (!owner || !name) {
        throw new Error(`Expected repo as 'owner/name', got '${repo}'.`);
    }
    return `https://${owner}.github.io/${name}/pr-${pr}/`;
};

export const buildPrPreviewPlan = ({ repo, pr, sha }: BuildPrPreviewPlanArgs): PrPreviewPlan => {
    const mappings = routeMappings();
    const packages: Record<string, ManifestPackage> = {};
    const entries = new Map<string, StagedEntry>();

    const add = (packageName: string, relativePath: string) => {
        const target = `${packageName}/${relativePath}`;
        const { source, extensions } = resolveSource(mappings, target);
        entries.set(target, { target, source, extensions });
        packages[packageName] ??= { version: agGridVersion, paths: {} };
        packages[packageName].paths[relativePath] = target;
    };

    for (const importMap of everyImportMap()) {
        for (const [specifier, url] of Object.entries(importMap)) {
            if (!isAgSpecifier(specifier)) {
                continue; // react, react-dom, vue, @angular/*, rxjs, tslib — not ours to publish.
            }
            const packageName = packageNameOf(specifier);
            if (packageName.startsWith(FOREIGN_PACKAGE_PREFIX)) {
                continue;
            }
            if (!isBuiltHere(packageName)) {
                throw new Error(
                    `Import map entry '${specifier}' names AG package '${packageName}', which is ` +
                        `neither built by this repo nor a known foreign package. Classify it in ` +
                        `src/utils/prPreviewManifest.ts.`
                );
            }
            const relativePath = packageRelativePath(packageName, url);
            if (!relativePath) {
                throw new Error(`Could not read a '${packageName}'-relative path out of '${url}'.`);
            }
            add(packageName, relativePath);
        }
    }

    // The flat UMD bundles the sticky PR comment and the legacy pin path link directly. Published
    // at the root of pr-<N>/ under their bare filenames, which is where they have always been.
    //
    // Read from PUBLISHED_UMD_URLS rather than gridLibraryPaths' getters, which serve the
    // non-minified bundle when `getIsDev()` is true: the preview always carries what `build:umd`
    // emits, so the name must not depend on the environment this script happens to run in.
    const umd: Record<string, string> = {};
    for (const [packageName, url] of [
        ['ag-grid-community', PUBLISHED_UMD_URLS['ag-grid-community']],
        ['ag-grid-enterprise', PUBLISHED_UMD_URLS['ag-grid-enterprise']],
    ] as const) {
        const relativePath = packageRelativePath(packageName, url);
        if (!relativePath) {
            throw new Error(`Could not read a '${packageName}'-relative path out of UMD path '${url}'.`);
        }
        const filename = relativePath.split('/').pop()!;
        const { source, extensions } = resolveSource(mappings, `${packageName}/${relativePath}`);
        entries.set(filename, { target: filename, source, extensions });
        umd[packageName] = filename;
    }

    return {
        manifest: {
            version: MANIFEST_VERSION,
            repo,
            pr,
            sha,
            base: previewBaseUrl({ repo, pr }),
            umd,
            packages: Object.fromEntries(Object.entries(packages).sort(([a], [b]) => (a < b ? -1 : 1))),
        },
        entries: [...entries.values()].sort((a, b) => (a.target < b.target ? -1 : 1)),
    };
};

/**
 * Collapse targets whose staged content is byte-identical onto the first of them, so a tree
 * published twice (ag-grid-enterprise's `styles/` is a copy of ag-grid-community's) costs one
 * copy. Expressed by rewriting `paths`, which is the manifest's own indirection, so nothing
 * downstream needs to know a de-duplication happened.
 *
 * `digest` returns a content digest for a staged target, or undefined to leave it alone.
 */
export const dedupeByContent = (
    plan: PrPreviewPlan,
    digest: (entry: StagedEntry) => string | undefined
): PrPreviewPlan => {
    const canonicalByDigest = new Map<string, string>();
    const aliases = new Map<string, string>();

    for (const entry of plan.entries) {
        const key = digest(entry);
        if (key === undefined) {
            continue;
        }
        const canonical = canonicalByDigest.get(key);
        if (canonical === undefined) {
            canonicalByDigest.set(key, entry.target);
        } else if (canonical !== entry.target) {
            aliases.set(entry.target, canonical);
        }
    }

    if (aliases.size === 0) {
        return plan;
    }

    const packages = Object.fromEntries(
        Object.entries(plan.manifest.packages).map(([packageName, { version, paths }]) => [
            packageName,
            {
                version,
                paths: Object.fromEntries(
                    Object.entries(paths).map(([relativePath, target]) => [relativePath, aliases.get(target) ?? target])
                ),
            },
        ])
    );

    return {
        manifest: { ...plan.manifest, packages },
        entries: plan.entries.filter(({ target }) => !aliases.has(target)),
    };
};
