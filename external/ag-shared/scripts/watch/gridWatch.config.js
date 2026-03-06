const shouldBuildFrameworks = process.env.BUILD_FWS === '1';

// Projects whose file changes are never processed by the watch loop.
// ag-grid-docs content is handled separately via the generate-examples target.
const BASE_IGNORED_PROJECTS = ['all', 'ag-grid-docs'];
const FRAMEWORK_PROJECTS = ['ag-grid-angular', 'ag-grid-react', 'ag-grid-vue3'];
const PACKAGE_PROJECTS = ['ag-grid-community', 'ag-grid-enterprise'];
const EXAMPLE_GENERATOR_PROJECTS = ['ag-grid-generate-example-files'];

function getIgnoredProjects() {
    const ignoredProjects = [...BASE_IGNORED_PROJECTS];

    // Framework wrappers are only rebuilt when BUILD_FWS=1 (opt-in, slower).
    if (!shouldBuildFrameworks) {
        ignoredProjects.push(...FRAMEWORK_PROJECTS);
    }

    return ignoredProjects;
}

// Maps a changed project to an ordered list of [project, targets[], config] build tuples.
//
// Tuples are processed sequentially (one nx run-many at a time), so order matters.
// Fan-out: upstream changes trigger downstream rebuilds. A change to ag-grid-community
// queues a docs reference rebuild and CSS build before rebuilding community and enterprise.
function getProjectBuildTargets(project) {
    const buildTargets = [];

    if (project.startsWith('ag-grid-docs-')) {
        buildTargets.push([project, ['generate'], 'watch']);
    } else if (EXAMPLE_GENERATOR_PROJECTS.includes(project)) {
        buildTargets.push(['ag-grid-docs', ['generate-examples']]);
    } else {
        if (PACKAGE_PROJECTS.includes(project)) {
            // Rebuild doc references first so the dev server gets updated API docs.
            buildTargets.push(['ag-grid-docs', ['generate-doc-references']]);

            if (project === 'ag-grid-community') {
                buildTargets.push(['ag-grid-community', ['build:css']]);
            }
            if (project === 'ag-grid-enterprise') {
                buildTargets.push(['ag-grid-enterprise', ['build:css']]);
            }

            buildTargets.push(['ag-grid-community', ['build'], 'watch'], ['ag-grid-enterprise', ['build'], 'watch']);

            // Generate framework properties after the core library is built.
            if (project === 'ag-grid-community') {
                buildTargets.push(
                    ['ag-grid-angular', ['updateGridAndColumnProperties']],
                    ['ag-grid-vue3', ['updateGridAndColumnProperties']]
                );
            }
        } else if (project.startsWith('@ag-grid')) {
            // For locale and styles packages: fan-out to community and enterprise.
            buildTargets.push(
                [project, ['build'], 'watch'],
                ['ag-grid-community', ['build'], 'watch'],
                ['ag-grid-enterprise', ['build'], 'watch']
            );
        }

        if (FRAMEWORK_PROJECTS.includes(project)) {
            buildTargets.push([project, ['build'], 'watch']);
        }
    }

    return buildTargets;
}

// When ag-charts rebuilds, trigger an ag-grid-enterprise rebuild so the Grid dev server
// picks up any Charts integration changes.
const externalBuildTriggers = [
    { file: '../ag-charts/node_modules/.cache/ag-build-queue.empty', projects: ['ag-grid-enterprise'] },
];

module.exports = {
    ignoredProjects: getIgnoredProjects(),
    // Targets whose completion can trigger a browser reload (via ag-build-queue.empty).
    // The reload fires only when the last reloadable target in the current queue finishes.
    devServerReloadTargets: ['generate', 'generate-doc-references', 'build', 'build:css', 'generate-examples'],
    getProjectBuildTargets,
    externalBuildTriggers,
};
