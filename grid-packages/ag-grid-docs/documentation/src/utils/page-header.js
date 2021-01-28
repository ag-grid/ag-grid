export const getHeaderTitle = (title, framework = 'javascript', isCharts = false) =>
    `${isCharts ? 'ag-Charts' : 'ag-Grid'} ${getFrameworkPart(framework, isCharts)}: ${title}`;

const getFrameworkPart = (framework, isCharts = false) =>
    `(${getFrameworkName(framework)} ${isCharts ? 'Charts' : 'Grid'})`;

export const getFrameworkName = framework => {
    const mappings = {
        javascript: 'JavaScript',
        angular: 'Angular',
        react: 'React',
        vue: 'Vue',
    };

    return mappings[framework];
};