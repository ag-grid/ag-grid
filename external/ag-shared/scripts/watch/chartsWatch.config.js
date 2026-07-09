// Projects whose file changes are never processed by the watch loop.
const IGNORED_PROJECTS = ['all', 'ag-charts-website', 'ag-website-shared'];

// Framework wrappers are only rebuilt when BUILD_FWS=1 (opt-in, slower).
if ((process.env.BUILD_FWS ?? '0') !== '1') {
    IGNORED_PROJECTS.push('ag-charts-angular', 'ag-charts-react', 'ag-charts-vue3');
}

// Maps a changed project to an ordered list of [project, targets[], config] build tuples.
//
// Ordering matters: tuples are processed sequentially (one nx run-many at a time).
// build:umd is listed before build so the reloadable target (build:umd) runs first,
// triggering the browser reload as early as possible. The build catch-all (types +
// package outputs) follows after.
//
// Fan-out: upstream changes trigger downstream rebuilds. A change to ag-charts-core
// queues builds for ag-charts-community and ag-charts-enterprise before the core build
// itself, so the full dependency chain is rebuilt in dependency order.
function getProjectBuildTargets(project) {
    if (project.startsWith('ag-charts-website-')) {
        return [[project, ['generate'], 'watch']];
    }

    switch (project) {
        case 'ag-charts-types':
            return [
                // docs-resolved-interfaces triggers a dev server reload for API docs pages.
                [project, ['docs-resolved-interfaces'], 'watch'],
                // Rebuild downstream types so community/enterprise stay in sync.
                ['ag-charts-community', ['build:types'], 'watch'],
                ['ag-charts-enterprise', ['build:types'], 'watch'],
                [project, ['build'], 'watch'],
            ];
        case 'ag-charts-locale':
        case 'ag-charts-core':
            // Fan-out: rebuild community and enterprise before the changed package itself.
            // build:umd listed first to trigger the browser reload as soon as possible.
            return [
                ['ag-charts-community', ['build:umd', 'build'], 'watch'],
                ['ag-charts-enterprise', ['build:umd', 'build'], 'watch'],
                [project, ['build'], 'watch'],
            ];
        case 'ag-charts-community':
            // Enterprise depends on community, so rebuild enterprise first.
            return [
                ['ag-charts-enterprise', ['build:umd', 'build'], 'watch'],
                [project, ['build:umd', 'build'], 'watch'],
            ];
        case 'ag-charts-enterprise':
            return [[project, ['build:umd', 'build'], 'watch']];
        case 'ag-charts-generate-example-files':
            return [['ag-charts-website', ['generate-examples']]];
    }

    return [[project, ['build'], undefined]];
}

module.exports = {
    ignoredProjects: IGNORED_PROJECTS,
    // Targets whose completion can trigger a browser reload (via ag-build-queue.empty).
    // The reload fires only when the last reloadable target in the current queue finishes.
    devServerReloadTargets: ['generate', 'docs-resolved-interfaces', 'build:package', 'build:umd', 'generate-examples'],
    getProjectBuildTargets,
};
