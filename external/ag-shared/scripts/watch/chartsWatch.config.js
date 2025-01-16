const IGNORED_PROJECTS = ['all', 'ag-charts-website'];

if ((process.env.BUILD_FWS ?? '0') !== '1') {
    IGNORED_PROJECTS.push('ag-charts-angular', 'ag-charts-react', 'ag-charts-vue3');
}

function getProjectBuildTargets(project) {
    if (project.startsWith('ag-charts-website-')) {
        return [[project, ['generate'], 'watch']];
    }

    switch (project) {
        case 'ag-charts-locale':
        case 'ag-charts-types':
            return [
                [project, ['build'], 'watch'],
                [project, ['docs-resolved-interfaces'], 'watch'],
                ['ag-charts-community', ['build'], 'watch'],
                ['ag-charts-enterprise', ['build'], 'watch'],
            ];
        case 'ag-charts-core':
            return [
                [project, ['build'], 'watch'],
                ['ag-charts-community', ['build'], 'watch'],
                ['ag-charts-enterprise', ['build'], 'watch'],
            ];
        case 'ag-charts-community':
            return [
                [project, ['build'], 'watch'],
                ['ag-charts-enterprise', ['build'], 'watch'],
            ];
        case 'ag-charts-enterprise':
            return [[project, ['build'], 'watch']];
    }

    return [[project, ['build'], undefined]];
}

module.exports = {
    ignoredProjects: IGNORED_PROJECTS,
    getProjectBuildTargets,
};
