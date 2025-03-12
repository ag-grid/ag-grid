const IGNORED_PROJECTS = ['all', 'ag-charts-website'];

if ((process.env.BUILD_FWS ?? '0') !== '1') {
    IGNORED_PROJECTS.push('ag-charts-angular', 'ag-charts-react', 'ag-charts-vue3');
}

function getProjectBuildTargets(project) {
    if (project.startsWith('ag-charts-website-')) {
        return [[project, ['generate'], 'watch']];
    }

    switch (project) {
        case 'ag-charts-types':
            return [
                [project, ['docs-resolved-interfaces'], 'watch'],
                ['ag-charts-community', ['build:types'], 'watch'],
                ['ag-charts-enterprise', ['build:types'], 'watch'],
                [project, ['build'], 'watch'],
            ];
        case 'ag-charts-locale':
        case 'ag-charts-core':
            return [
                ['ag-charts-community', ['build:umd', 'build'], 'watch'],
                ['ag-charts-enterprise', ['build:umd', 'build'], 'watch'],
                [project, ['build'], 'watch'],
            ];
        case 'ag-charts-community':
            return [
                ['ag-charts-enterprise', ['build:umd', 'build'], 'watch'],
                [project, ['build:umd', 'build'], 'watch'],
            ];
        case 'ag-charts-enterprise':
            return [[project, ['build:umd', 'build'], 'watch']];
    }

    return [[project, ['build'], undefined]];
}

module.exports = {
    ignoredProjects: IGNORED_PROJECTS,
    devServerReloadTargets: ['generate', 'docs-resolved-interfaces', 'build:package', 'build:umd'],
    getProjectBuildTargets,
};
