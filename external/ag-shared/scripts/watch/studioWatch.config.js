const BASE_IGNORED_PROJECTS = ['all'];
const PACKAGE_PROJECTS = ['ag-studio'];
const EXAMPLE_GENERATOR_PROJECTS = ['ag-studio-generate-example-files'];

function getIgnoredProjects() {
    const ignoredProjects = [...BASE_IGNORED_PROJECTS];

    return ignoredProjects;
}

function getProjectBuildTargets(project) {
    const buildTargets = [];

    if (project.startsWith('ag-studio-docs')) {
        buildTargets.push([project, ['generate'], 'watch']);
    } else if (EXAMPLE_GENERATOR_PROJECTS.includes(project)) {
        buildTargets.push(['ag-studio-docs', ['generate-examples']]);
    } else if (PACKAGE_PROJECTS.includes(project)) {
        buildTargets.push(['ag-studio-docs', ['generate-doc-references']]);

        if (project === 'ag-studio') {
            buildTargets.push(['ag-studio', ['build'], 'watch']);
        }
    }

    return buildTargets;
}

const externalBuildTriggers = [
    { file: '../ag-charts/node_modules/.cache/ag-build-queue.empty', projects: ['ag-studio'] },
    { file: '../ag-grid/node_modules/.cache/ag-build-queue.empty', projects: ['ag-studio'] },
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
