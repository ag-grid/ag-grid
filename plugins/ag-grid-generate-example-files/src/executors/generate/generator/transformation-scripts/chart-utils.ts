import type { BindingImport } from './parser-utils';

export function wrapOptionsUpdateCode(
    code: string,
    before = 'const options = {...this.options};',
    after = 'this.options = options;',
    localVar = 'options'
): string {
    if (code.indexOf('options.') < 0) {
        return code;
    }

    return code
        .replace(/(?<!= )options\./g, localVar + '.')
        .replace(/(.*?)\{(.*)\}/s, `$1{\n${before}\n$2\n${after}\n}`);
}

export function getChartImports(imports: BindingImport[], usesChartApi: boolean): string {
    const enterpriseCharts = imports.find((i) => i.module.includes('ag-charts-enterprise'));
    const chartsImport = imports.find(
        (i) => i.module.includes('ag-charts-community') || i.module.includes('ag-charts-enterprise')
    );
    if (chartsImport) {
        // Only included AgCharts if its api is used. Otherwise it can be removed as AgCharts.create is handled by framework components
        // But if AgCharts.download is used we mustn't remove it.
        const extraImports = chartsImport.imports.filter((i) => usesChartApi || i !== 'AgCharts');

        if (extraImports.length > 0) {
            return `import { ${extraImports.join(', ')} } from 'ag-charts-${
                enterpriseCharts ? 'enterprise' : 'community'
            }';`;
        }
    }

    return undefined;
}
