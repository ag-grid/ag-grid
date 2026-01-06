const BASE_IGNORED_PROJECTS = ['all'];
const PACKAGE_PROJECTS = ['ag-dash'];
const EXAMPLE_GENERATOR_PROJECTS = ['ag-dash-generate-example-files'];

function getIgnoredProjects() {
    const ignoredProjects = [...BASE_IGNORED_PROJECTS];

    return ignoredProjects;
}

function getProjectBuildTargets(project) {
    const buildTargets = [];

    if (project.startsWith('ag-dash-docs')) {
        buildTargets.push([project, ['generate'], 'watch']);
    } else if (EXAMPLE_GENERATOR_PROJECTS.includes(project)) {
        buildTargets.push(['ag-dash-docs', ['generate-examples']]);
    } else if (PACKAGE_PROJECTS.includes(project)) {
        // TODO add this back in once this target exists
        // buildTargets.push(['ag-dash-docs', ['generate-doc-references']]);

        if (project === 'ag-dash') {
            buildTargets.push(['ag-dash', ['build'], 'watch']);
        }
    }

    return buildTargets;
}

const externalBuildTriggers = [
    { file: '../ag-charts/node_modules/.cache/ag-build-queue.empty', projects: ['ag-dash'] },
    { file: '../ag-grid/node_modules/.cache/ag-build-queue.empty', projects: ['ag-dash'] },
];

module.exports = {
    ignoredProjects: getIgnoredProjects(),
    devServerReloadTargets: [
        'generate',
        'generate-doc-references',
        'build',
        'build:umd',
        'build:package',
        'generate-examples',
    ],
    getProjectBuildTargets,
    externalBuildTriggers,
};
