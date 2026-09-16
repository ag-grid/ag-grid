// Note: Assumes working directory is the root of the mono-repo

const fs = require('fs');

const getPackageInformation = require('../utils/utils').getPackageInformation;

const DEFAULT_REGISTRY = 'https://registry.npmjs.org';

const POLL_INTERVAL_MS = 10_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Abbreviated packument format - much smaller response than the full metadata, and still includes
 * `dist-tags` and the version list.
 */
const PACKUMENT_ACCEPT_HEADER = 'application/vnd.npm.install-v1+json';

function usage() {
    console.log(
        'Usage: node ./scripts/deployments/release/verifyPackagesPublished.js <Grid Version> [--tag <dist-tag>]'
    );
    console.log('For example: node ./scripts/deployments/release/verifyPackagesPublished.js 36.1.0');
    console.log('             node ./scripts/deployments/release/verifyPackagesPublished.js 36.1.0 --tag latest');
    console.log('Note: This script should be run from the root of the monorepo');
    console.log(
        `Note: This polls npm every ${POLL_INTERVAL_MS / 1000} seconds and does not exit until every package is published - Ctrl-C to abort`
    );
}

function parseArgs(argv) {
    const args = { version: undefined, tag: undefined, registry: DEFAULT_REGISTRY };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--tag' || arg === '--registry') {
            const value = argv[++i];
            if (!value) {
                console.error(`ERROR: ${arg} requires a value`);
                process.exit(1);
            }
            args[arg === '--tag' ? 'tag' : 'registry'] = value;
        } else if (args.version === undefined) {
            args.version = arg;
        } else {
            console.error(`ERROR: Unexpected argument '${arg}'`);
            usage();
            process.exit(1);
        }
    }

    return args;
}

/**
 * Packages published to npm as part of a Grid release.
 *
 * Derived from the monorepo rather than hard-coded: a workspace is published if it is a public AG Grid
 * package *and* has an nx `pack` target. The `pack` target is what produces the tarball under
 * `dist/artifacts` that `publishDistArtifactsToNpm.sh` publishes, so it is the authoritative signal.
 * A public/private check alone is not enough - `ag-grid-csp` and `ag-grid-public-e2e-testing-recipes`
 * are public workspaces that are internal only and never published.
 */
function getPublishablePackageNames() {
    const allPackages = getPackageInformation();

    return Object.keys(allPackages)
        .filter((packageName) => allPackages[packageName].isGridPackage)
        .filter((packageName) => allPackages[packageName].publicPackage)
        .filter((packageName) => isPackedForRelease(allPackages[packageName].projectRoot))
        .sort();
}

function isPackedForRelease(projectRoot) {
    const projectFile = `${projectRoot}/project.json`;
    if (!fs.existsSync(projectFile)) {
        return false;
    }

    const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
    return Boolean(project.targets?.pack);
}

async function fetchPackument(registry, packageName) {
    const response = await fetch(`${registry.replace(/\/$/, '')}/${packageName}`, {
        // `cache-control` is best-effort - the registry sits behind a CDN that may still serve a
        // slightly stale packument, which is one of the reasons we poll rather than check once.
        headers: { accept: PACKUMENT_ACCEPT_HEADER, 'cache-control': 'no-cache' },
    });

    if (response.status === 404) {
        return undefined;
    }
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function checkPackage({ registry, packageName, version, tag }) {
    let packument;
    try {
        packument = await fetchPackument(registry, packageName);
    } catch (e) {
        return { packageName, ok: false, message: `could not be queried on npm - ${e.message}` };
    }

    if (!packument) {
        return { packageName, ok: false, message: `is not published on npm at all` };
    }
    if (!packument.versions?.[version]) {
        return { packageName, ok: false, message: `${version} is not published on npm` };
    }

    if (tag) {
        const taggedVersion = packument['dist-tags']?.[tag];
        if (taggedVersion !== version) {
            return {
                packageName,
                ok: false,
                message: `${version} is published, but the '${tag}' tag points at ${taggedVersion ?? '<unset>'}`,
            };
        }
        return { packageName, ok: true, message: `${version} is published and tagged '${tag}'` };
    }

    return { packageName, ok: true, message: `${version} is published` };
}

async function main() {
    const { version, tag, registry } = parseArgs(process.argv.slice(2));

    if (!version) {
        console.error('ERROR: Invalid grid version supplied');
        usage();
        process.exit(1);
    }

    console.log(
        '******************************************************************************************************************************'
    );
    console.log(`Verify Grid Version ${version} is published to npm`.padEnd(126));
    console.log(
        '******************************************************************************************************************************'
    );

    const packageNames = getPublishablePackageNames();
    if (packageNames.length === 0) {
        console.error('ERROR: No publishable packages found - is the working directory the root of the monorepo?');
        process.exit(1);
    }

    const padding = Math.max(...packageNames.map((packageName) => packageName.length));
    const reported = new Set();

    // `npm publish` uploads the packages one at a time, so the later ones are legitimately absent
    // for a while. Poll until they all appear rather than failing on the first look. There is
    // deliberately no timeout - this exits only once every package is on npm (Ctrl-C to abort).
    for (let attempt = 1; ; attempt++) {
        const results = await Promise.all(
            packageNames.map((packageName) => checkPackage({ registry, packageName, version, tag }))
        );

        for (const { packageName, ok, message } of results) {
            // Report everything on the first pass, then only report packages as they land, so a
            // long wait does not scroll the interesting lines away.
            if (ok && !reported.has(packageName)) {
                reported.add(packageName);
                console.log(`OK    ${packageName.padEnd(padding)} ${message}`);
            } else if (!ok && attempt === 1) {
                console.log(`WAIT  ${packageName.padEnd(padding)} ${message}`);
            }
        }

        const outstanding = results.filter(({ ok }) => !ok).map(({ packageName }) => packageName);
        if (outstanding.length === 0) {
            console.log(`All ${results.length} packages are published on npm at ${version}`);
            return;
        }

        console.log(
            `Waiting for ${outstanding.length} of ${results.length} packages, retrying in ${POLL_INTERVAL_MS / 1000}s (attempt ${attempt}): ${outstanding.join(', ')}`
        );

        await sleep(POLL_INTERVAL_MS);
    }
}

main();
