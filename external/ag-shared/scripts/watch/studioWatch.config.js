// Projects whose file changes are never processed by the watch loop.
const BASE_IGNORED_PROJECTS = ['all'];
const PACKAGE_PROJECTS = ['ag-studio'];
const EXAMPLE_GENERATOR_PROJECTS = ['ag-studio-generate-example-files'];

function getIgnoredProjects() {
    const ignoredProjects = [...BASE_IGNORED_PROJECTS];

    return ignoredProjects;
}

// Maps a changed project to an ordered list of [project, targets[], config] build tuples.
//
// Tuples are processed sequentially (one nx run-many at a time), so order matters.
// Doc reference generation runs before the package build so the dev server receives
// updated API docs as early as possible.
function getProjectBuildTargets(project) {
    const buildTargets = [];

    if (project.startsWith('ag-studio-docs')) {
        buildTargets.push([project, ['generate'], 'watch']);
    } else if (EXAMPLE_GENERATOR_PROJECTS.includes(project)) {
        buildTargets.push(['ag-studio-docs', ['generate-examples']]);
    } else if (PACKAGE_PROJECTS.includes(project)) {
        // Rebuild doc references first so the dev server gets updated API docs.
        buildTargets.push(['ag-studio-docs', ['generate-doc-references']]);

        if (project === 'ag-studio') {
            buildTargets.push(['ag-studio', ['build:umd', 'build'], 'watch']);
        }
    } else {
        buildTargets.push([project, ['build'], undefined]);
    }

    return buildTargets;
}

// When ag-charts or ag-grid rebuilds, trigger an ag-studio rebuild so the Studio dev
// server picks up integration changes from either dependency.
const externalBuildTriggers = [
    { file: '../ag-charts/node_modules/.cache/ag-build-queue.empty', projects: ['ag-studio'] },
    { file: '../ag-grid/node_modules/.cache/ag-build-queue.empty', projects: ['ag-studio'] },
];

module.exports = {
    ignoredProjects: getIgnoredProjects(),
    // Targets whose completion can trigger a browser reload (via ag-build-queue.empty).
    // The reload fires only when the last reloadable target in the current queue finishes.
    devServerReloadTargets: [
        'generate',
        'generate-doc-references',
        'build:umd',
        'build:package',
        'generate-examples',
    ],
    getProjectBuildTargets,
    externalBuildTriggers,
};
