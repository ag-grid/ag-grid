import { readFileSync } from 'fs';

function loadExampleData(name: string, evalFn = 'getData()'): any[] {
    const dataFileContent = readFileSync(`../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/examples/${name}/data.js`);
    // const jsModule = `${dataFileContent.toString()} ; export default getData;`;
    // const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(jsModule);
    // const tempModule = await import(dataUri);

    try {
        return eval(`${dataFileContent.toString()}; ${evalFn};`);
    } catch (error) {
        console.error('AG Charts - unable to read example data for: ' + name);
        return [];
    }
}

export * from './data-game-winnings';
export const DOCS_EXAMPLES = {
    '100--stacked-area': loadExampleData('100--stacked-area'),
    '100--stacked-bar': loadExampleData('100--stacked-bar'),
    '100--stacked-column': loadExampleData('100--stacked-column'),
    'area-with-negative-values': loadExampleData('area-with-negative-values'),
    'bar-with-labels': loadExampleData('bar-with-labels'),
    'bubble-with-categories': loadExampleData('bubble-with-categories'),
    'bubble-with-negative-values': loadExampleData('bubble-with-negative-values'),
    'chart-customisation': loadExampleData('chart-customisation'),
    'column-with-negative-values': loadExampleData('column-with-negative-values'),
    'combination-of-different-series-types': loadExampleData('combination-of-different-series-types'),
    'custom-marker-shapes': loadExampleData('custom-marker-shapes'),
    'custom-tooltips': loadExampleData('custom-tooltips'),
    'grouped-bar': loadExampleData('grouped-bar'),
    'grouped-column': loadExampleData('grouped-column'),
    'histogram-with-specified-bins': loadExampleData('histogram-with-specified-bins'),
    'line-with-gaps': loadExampleData('line-with-gaps'),
    'log-axis': loadExampleData('log-axis'),
    'market-index-treemap': loadExampleData('market-index-treemap', 'data'),
    'per-marker-customisation': loadExampleData('per-marker-customisation'),
    // 'real-time-data-updates': loadExampleData('real-time-data-updates'),
    'simple-area': loadExampleData('simple-area'),
    'simple-bar': loadExampleData('simple-bar'),
    'simple-bubble': loadExampleData('simple-bubble'),
    'simple-column': loadExampleData('simple-column'),
    'simple-doughnut': loadExampleData('simple-doughnut'),
    'simple-histogram': loadExampleData('simple-histogram'),
    'simple-line': loadExampleData('simple-line'),
    'simple-pie': loadExampleData('simple-pie'),
    'simple-scatter': loadExampleData('simple-scatter'),
    'stacked-area': loadExampleData('stacked-area'),
    'stacked-bar': loadExampleData('stacked-bar'),
    'stacked-column': loadExampleData('stacked-column'),
    'time-axis-with-irregular-intervals': loadExampleData('time-axis-with-irregular-intervals', 'data') as any,
    'xy-histogram-with-mean-aggregation': loadExampleData('xy-histogram-with-mean-aggregation'),
};
