// Projects whose file changes are never processed by the watch loop.
const IGNORED_PROJECTS = ['all', 'ag-charts-website', 'ag-website-shared'];

// Framework wrappers are only rebuilt when BUILD_FWS=1 (opt-in, slower).
if ((process.env.BUILD_FWS ?? '0') !== '1') {
    IGNORED_PROJECTS.push('ag-charts-angular', 'ag-charts-react', 'ag-charts-vue3');
}

// Maps a changed project to an ordered list of [project, targets[], config] build tuples.
//
// Ordering matters: tuples are processed sequentially (one nx run-many at a time).
// The dev server serves dist/umd and dist/package, so build:umd and build:package are both
// reloadable and listed first: the browser reloads once, after both are fresh. build:types
// (slow tsc) follows every reloadable tuple and runs in the background lane (see
// `backgroundTargets`), so it never delays the reload or a later save.
//
// These projects' `build` is a no-op over build:types, build:package (and build:umd for locale), so
// it is split into those targets: build:types must be its own tuple to run in the background lane.
//
// Fan-out: upstream changes trigger downstream rebuilds in dependency order. build:package
// depends on ^build:package, so a core edit also rebuilds core's dist/package before the reload.
function getProjectBuildTargets(project) {
    if (project.startsWith('ag-charts-website-')) {
        return [[project, ['generate'], 'watch']];
    }

    switch (project) {
        case 'ag-charts-types':
            return [
                // docs-resolved-interfaces triggers a dev server reload for API docs pages.
                [project, ['docs-resolved-interfaces'], 'watch'],
                [project, ['build:package'], 'watch'],
                // Rebuild downstream types so community/enterprise stay in sync.
                ['ag-charts-community', ['build:types'], 'watch'],
                ['ag-charts-enterprise', ['build:types'], 'watch'],
                [project, ['build:types'], 'watch'],
            ];
        case 'ag-charts-locale':
            // The dev server serves locale's dist/umd (vanilla examples) directly, so its own
            // build:umd and build:package are reloadable and run before any build:types.
            return [
                [project, ['build:umd', 'build:package'], 'watch'],
                ['ag-charts-community', ['build:umd', 'build:package'], 'watch'],
                ['ag-charts-enterprise', ['build:umd', 'build:package'], 'watch'],
                ['ag-charts-community', ['build:types'], 'watch'],
                ['ag-charts-enterprise', ['build:types'], 'watch'],
                [project, ['build:types'], 'watch'],
            ];
        case 'ag-charts-core':
            // Core has no build:umd; community's build:package rebuilds its dist/package as a dependency.
            return [
                ['ag-charts-community', ['build:umd', 'build:package'], 'watch'],
                ['ag-charts-enterprise', ['build:umd', 'build:package'], 'watch'],
                ['ag-charts-community', ['build:types'], 'watch'],
                ['ag-charts-enterprise', ['build:types'], 'watch'],
                [project, ['build:types'], 'watch'],
            ];
        case 'ag-charts-community':
            // Enterprise depends on community, so rebuild enterprise first.
            return [
                ['ag-charts-enterprise', ['build:umd', 'build:package'], 'watch'],
                [project, ['build:umd', 'build:package'], 'watch'],
                ['ag-charts-enterprise', ['build:types'], 'watch'],
                [project, ['build:types'], 'watch'],
            ];
        case 'ag-charts-enterprise':
            return [
                [project, ['build:umd', 'build:package'], 'watch'],
                [project, ['build:types'], 'watch'],
            ];
        case 'ag-charts-demos':
            // Rebuild the demo apps into their dist with the embedded base path. build:watch
            // skips the typecheck + upstream deps of the full build for a fast, reload-gated
            // rebuild; it is a reload target so the dev server refreshes once dist is ready.
            return [[project, ['build:watch'], undefined]];
        case 'ag-charts-generate-example-files':
            return [['ag-charts-website', ['generate-examples']]];
    }

    return [[project, ['build'], undefined]];
}

module.exports = {
    ignoredProjects: IGNORED_PROJECTS,
    // Targets whose completion can trigger a browser reload (via ag-build-queue.empty).
    // The reload fires only when the last reloadable target in the current queue finishes.
    devServerReloadTargets: [
        'generate',
        'docs-resolved-interfaces',
        'build:package',
        'build:umd',
        'build:watch',
        'generate-examples',
    ],
    // Run only when nothing else is queued; a save stops them and re-queues them. Never reload targets.
    backgroundTargets: ['build:types'],
    getProjectBuildTargets,
};
