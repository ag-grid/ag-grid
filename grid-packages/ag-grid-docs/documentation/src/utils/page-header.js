export const getHeaderTitle = (title, framework, isCharts = false) => {
    let prefix = isCharts ? 'ag-Charts' : 'ag-Grid';

    if (framework !== 'javascript') {
        prefix += ` (${framework.charAt(0).toUpperCase() + framework.slice(1)})`;
    }

    return `${prefix}: ${title}`;
};
