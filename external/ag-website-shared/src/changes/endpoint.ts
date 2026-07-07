import type { Changelogs, VersionChangelog } from './change-types';
import { compileChangelogs } from './compile';

type VersionModuleLoaders = Record<string, () => Promise<unknown>>;

/**
 * Build the GET handler for a product's /update-change-records.json Astro endpoint from
 * the product's version files:
 *
 *     export const GET = createChangeRecordsEndpoint(import.meta.glob('../changes/versions/*.ts'));
 *
 * Serves the compiled changes database, consumed by the update AI skill. Compilation
 * validates the authored records, so invalid records fail the build.
 */
export function createChangeRecordsEndpoint(versionModules: VersionModuleLoaders): () => Promise<Response> {
    return async function GET() {
        const compiled = compileChangelogs(await assembleChangelogs(versionModules));

        return new Response(JSON.stringify(compiled), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };
}

/**
 * The key is the release version, taken from the file name ('34.1.ts' means version
 * 34.1.0). Each version file has exactly one export: its VersionChangelog, named after
 * the file with dots replaced by underscores ('34.1.ts' exports `v34_1`).
 */
async function assembleChangelogs(versionModules: VersionModuleLoaders): Promise<Changelogs> {
    const changelogs: Changelogs = {};
    for (const [path, loadModule] of Object.entries(versionModules)) {
        const version = path.replace(/^.*\//, '').replace(/\.ts$/, '');
        const expectedName = `v${version.replace(/\./g, '_')}`;
        const module = (await loadModule()) as Record<string, unknown>;

        const exportNames = Object.keys(module);
        if (exportNames.length !== 1 || exportNames[0] !== expectedName) {
            throw new Error(
                `${path} must have exactly one export, named ${expectedName} (found: ${exportNames.join(', ') || 'none'})`
            );
        }
        const changelog = module[expectedName];
        if (typeof changelog !== 'object' || changelog === null) {
            throw new Error(`${path}: export ${expectedName} must be a VersionChangelog object`);
        }
        changelogs[version] = changelog as VersionChangelog;
    }
    return changelogs;
}
