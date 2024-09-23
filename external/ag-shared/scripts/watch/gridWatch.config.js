const shouldBuildFrameworks = process.env.BUILD_FWS === '1';
const shouldBuildPackages = process.env.BUILD_PACKAGES === '1';

const BASE_IGNORED_PROJECTS = ['all', 'ag-grid-docs'];
const FRAMEWORK_PROJECTS_MODULES = [
    '@ag-grid-community/angular',
    '@ag-grid-community/react',
    '@ag-grid-community/vue3',
];
const FRAMEWORK_PROJECTS_PACKAGES = ['ag-grid-angular', 'ag-grid-react', 'ag-grid-vue3'];
const FRAMEWORK_PROJECTS = FRAMEWORK_PROJECTS_MODULES.concat(FRAMEWORK_PROJECTS_PACKAGES);
const PACKAGE_PROJECTS = ['ag-grid-community', 'ag-grid-enterprise', 'ag-grid-charts-enterprise'];

function getIgnoredProjects() {
    const ignoredProjects = [...BASE_IGNORED_PROJECTS];
    if (!shouldBuildFrameworks) {
        ignoredProjects.push(...FRAMEWORK_PROJECTS_MODULES, ...FRAMEWORK_PROJECTS_PACKAGES);
    } else if (!shouldBuildPackages) {
        ignoredProjects.push(...FRAMEWORK_PROJECTS_PACKAGES);
    }

    if (!shouldBuildPackages) {
        ignoredProjects.push(...PACKAGE_PROJECTS);
    }

    return ignoredProjects;
}

function getProjectBuildTargets(project) {
    const buildTargets = [];

    if (project.startsWith('ag-grid-docs-')) {
        buildTargets.push([project, ['generate'], 'watch']);
    } else {
        if (project.startsWith('@ag-grid')) {
            buildTargets.push(['ag-grid-docs', ['generate-doc-references']]);

            if (project === '@ag-grid-community/theming') {
                buildTargets.push([project, ['codegen']]);
            }

            if (shouldBuildPackages) {
                buildTargets.push(['ag-grid-community', ['build:umd']], ['ag-grid-charts-enterprise', ['build:umd']]);
            }
        }

        if (FRAMEWORK_PROJECTS.includes(project)) {
            buildTargets.push([project, ['build'], 'watch']);
        }
    }

    return buildTargets;
}

module.exports = {
    ignoredProjects: getIgnoredProjects(),
    getProjectBuildTargets,
};
