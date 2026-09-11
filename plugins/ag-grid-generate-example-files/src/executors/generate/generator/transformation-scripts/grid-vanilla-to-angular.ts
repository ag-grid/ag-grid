import type { ExampleConfig, ParsedBindings } from '../types';
import { convertTemplate, getImport, toConst, toInput, toMemberWithValue, toOutput } from './angular-utils';
import { templatePlaceholder } from './grid-vanilla-src-parser';
import {
    DARK_INTEGRATED_END,
    DARK_INTEGRATED_START,
    addBindingImports,
    addGenericInterfaceImport,
    addLicenseManager,
    convertFunctionToProperty,
    findLocaleImport,
    getEnableAGTestIdLogic,
    getIntegratedDarkModeCode,
    getPropertyInterfaces,
    handleRowGenericInterface,
    isInstanceMethod,
    preferParamsApi,
    removeCreateGridImport,
    removeFunctionKeyword,
    replaceGridReadyRowData,
} from './parser-utils';
import { toTitleCase } from './string-utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const DIRECT_ROW_DATA_ASSIGNMENT = /^[\s{(]*this\.rowData\s*=\s*data[\s)};]*$/;
const ROW_DATA_ASSIGNMENT_PREFIX = /^[\s{(]*this\.rowData\s*=\s*/;

function stripWrappingParens(expression: string): string {
    let depth = 0;
    for (let i = 0, len = expression.length; i < len; ++i) {
        const char = expression[i];
        if (char === '(') {
            depth++;
        } else if (char === ')') {
            depth--;
            if (depth === 0 && i < len - 1) {
                return expression;
            }
        }
    }
    return expression.startsWith('(') && expression.endsWith(')') ? expression.slice(1, -1) : expression;
}

/** The `data.slice(...)`-style expression assigned to rowData, or undefined if the callback does anything else. */
function getRowDataTransform(assignment: string): string | undefined {
    if (!ROW_DATA_ASSIGNMENT_PREFIX.test(assignment)) {
        return undefined;
    }
    const expression = stripWrappingParens(
        assignment
            .replace(ROW_DATA_ASSIGNMENT_PREFIX, '')
            .replace(/[\s;})]*$/, (tail) => tail.replace(/[\s;}]/g, ''))
            .trim()
    );
    return expression.startsWith('data.') && !/\bdata\b/.test(expression.slice(5)) ? expression : undefined;
}

type DataLoading = { kind: 'direct' } | { kind: 'computed'; expression: string } | { kind: 'effect'; body: string };

function classifyDataLoading(callback: string, hasRowDataProperty: boolean): DataLoading {
    const assignment = replaceGridReadyRowData(callback, 'this.rowData');
    if (!hasRowDataProperty) {
        if (DIRECT_ROW_DATA_ASSIGNMENT.test(assignment)) {
            return { kind: 'direct' };
        }
        const expression = getRowDataTransform(assignment);
        if (expression) {
            return { kind: 'computed', expression };
        }
    }
    return {
        kind: 'effect',
        body: assignment
            .trim()
            .replace(/^\{|\}$/g, '')
            .trim(),
    };
}

function getDataLoadingCode(loading: DataLoading, url: string, rowDataType: string) {
    const resource = `httpResource<${rowDataType}[]>(() => ${url});`;
    if (loading.kind === 'direct') {
        return { properties: [`rowData = ${resource}`], rowDataBinding: 'rowData.value()', constructorBody: '' };
    }
    if (loading.kind === 'computed') {
        return {
            properties: [
                `data = ${resource}`,
                `rowData = computed(() => {
        if (!this.data.hasValue()) {
            return undefined;
        }
        const data = this.data.value();
        return ${loading.expression};
    });`,
            ],
            rowDataBinding: 'rowData()',
            constructorBody: '',
        };
    }
    return {
        properties: [`data = ${resource}`],
        rowDataBinding: 'rowData',
        constructorBody: `effect(() => {
            if (!this.data.hasValue()) {
                return;
            }
            const data = this.data.value();
            ${loading.body}
        });`,
    };
}

function getOnGridReadyCode(readyCode: string, rowDataType: string | undefined, hasApi: boolean): string {
    const additionalLines = [];

    if (readyCode) {
        additionalLines.push(readyCode.trim().replace(/^\{|\}$/g, ''));
    }

    const gridReadyEventParam = rowDataType !== 'any' ? `<${rowDataType}>` : '';
    if (hasApi || additionalLines.length > 0) {
        // use params in gridReady event
        const additional = preferParamsApi(
            additionalLines.length > 0 ? `\n\n        ${additionalLines.join('\n        ')}` : ''
        );
        return `
        onGridReady(params: GridReadyEvent${gridReadyEventParam}) {
            ${hasApi ? 'this.gridApi = params.api;' : ''}${additional}
        }`;
    } else {
        return '';
    }
}

function addModuleImports(
    imports: string[],
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    allStylesheets: string[]
): string[] {
    const { imports: bindingImports, properties } = bindings;

    imports.push("import { AgGridAngular } from 'ag-grid-angular';");

    if (allStylesheets && allStylesheets.length > 0) {
        allStylesheets.forEach((styleSheet) => imports.push(`import './${path.basename(styleSheet)}';`));
    }

    const propertyInterfaces = getPropertyInterfaces(properties);
    const bImports = [...(bindingImports || [])];
    bImports.push({
        module: `'ag-grid-community'`,
        isNamespaced: false,
        imports: [...propertyInterfaces, 'GridReadyEvent', 'GridApi'],
    });

    addLicenseManager(imports, exampleConfig);

    if (bImports.length > 0) {
        addBindingImports(bImports, imports, true);
    }

    imports.push(getEnableAGTestIdLogic());

    if (bindings.moduleRegistration) {
        imports.push('\n');
        imports.push(bindings.moduleRegistration);
    }

    return imports;
}

function getImports(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    componentFileNames: string[],
    allStylesheets: string[],
    loading: DataLoading | undefined
): string[] {
    const coreImports = ['Component'];
    if (loading?.kind === 'computed') {
        coreImports.push('computed');
    } else if (loading?.kind === 'effect') {
        coreImports.push('effect');
    }
    const imports = [`import { ${coreImports.sort().join(', ')} } from '@angular/core';`];

    if (loading) {
        imports.push("import { httpResource } from '@angular/common/http';");
    }

    const localeImport = findLocaleImport(bindings.imports);
    if (localeImport) {
        imports.push(`import { ${localeImport.imports.join(', ')} } from '@ag-grid-community/locale';`);
    }

    addModuleImports(imports, bindings, exampleConfig, allStylesheets);

    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    addGenericInterfaceImport(imports, bindings.tData, bindings);

    return removeCreateGridImport(imports);
}

function getTemplate(bindings: ParsedBindings, exampleConfig: ExampleConfig, attributes: string[]): string {
    const { inlineGridStyles } = bindings;
    const style = exampleConfig.noStyle
        ? ''
        : `style="width: ${inlineGridStyles.width}; height: ${inlineGridStyles.height};"`;

    const className = inlineGridStyles.className ? `class="${inlineGridStyles.className}"` : '';

    const agGridTag = `<ag-grid-angular
    ${exampleConfig.myGridReference ? 'id="myGrid"' : ''}
    ${style}
    ${className}
    ${attributes.join('\n    ')}
     />`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agGridTag) : agGridTag;

    return convertTemplate(template);
}

export function vanillaToAngular(
    bindings: ParsedBindings,
    exampleConfig: ExampleConfig,
    componentFileNames: string[],
    allStylesheets: string[]
): () => string {
    const { data, properties, typeDeclares, interfaces, tData } = bindings;
    const rowDataType = tData || 'any';
    const instanceMethods = bindings.instanceMethods.map(convertFunctionToProperty);

    const eventHandlers = bindings.eventHandlers.map((event) => event.handler).map(removeFunctionKeyword);
    const externalEventHandlers = bindings.externalEventHandlers.map((handler) => removeFunctionKeyword(handler.body));
    const genericParams = rowDataType !== 'any' ? `<${rowDataType}>` : '';

    return () => {
        const propertyAttributes = [];
        const propertyAssignments = [];

        properties
            .filter((property) => property.name !== 'onGridReady')
            .forEach((property) => {
                if (property.value === 'true' || property.value === 'false') {
                    propertyAttributes.push(toConst(property));
                } else if (property.value === null || property.value === 'null') {
                    propertyAttributes.push(toInput(property));
                } else {
                    // for when binding a method
                    // see javascript-grid-keyboard-navigation for an example
                    // tabToNextCell needs to be bound to the angular component
                    if (!isInstanceMethod(bindings.instanceMethods, property)) {
                        propertyAttributes.push(toInput(property));
                    }

                    propertyAssignments.push(toMemberWithValue(property));
                }
            });

        const hasRowDataProperty = propertyAssignments.some(
            (item) => item.replace(/setGridOption\('rowData'/g, '').indexOf('rowData') >= 0
        );
        const loading = data ? classifyDataLoading(data.callback, hasRowDataProperty) : undefined;
        const dataLoading = loading ? getDataLoadingCode(loading, data.url, rowDataType) : undefined;
        const imports = getImports(bindings, exampleConfig, componentFileNames, allStylesheets, loading);

        if (!propertyAttributes.find((item) => item.indexOf('[rowData]') >= 0)) {
            propertyAttributes.push(`[rowData]="${dataLoading?.rowDataBinding ?? 'rowData'}"`);
        }

        if (dataLoading) {
            propertyAssignments.push(...dataLoading.properties);
        }
        if (!hasRowDataProperty && (dataLoading?.rowDataBinding ?? 'rowData') === 'rowData') {
            propertyAssignments.push(`rowData!: ${rowDataType}[];`);
        }
        const constructorBody = dataLoading?.constructorBody ?? '';

        const componentForCheckBody = eventHandlers
            .concat(externalEventHandlers)
            .concat(instanceMethods)
            .concat(constructorBody)
            .map((snippet) => snippet.trim())
            .join('\n\n');

        const hasGridApi = componentForCheckBody.includes('gridApi');
        const gridReadyCode = getOnGridReadyCode(bindings.onGridReady, rowDataType, hasGridApi);
        const additional = [];
        if (gridReadyCode) {
            additional.push(gridReadyCode);
        }

        let darkModeWithGridRef = getIntegratedDarkModeCode(bindings.exampleName, true, 'grid?.api');
        const angularImportIdx = imports.findIndex((i) => i.includes('Component'));
        if (darkModeWithGridRef) {
            darkModeWithGridRef = darkModeWithGridRef.replace(
                DARK_INTEGRATED_START,
                `${DARK_INTEGRATED_START} 
                        @ViewChild(AgGridAngular)
                        set agGrid(grid){
                            `
            );
            darkModeWithGridRef = darkModeWithGridRef.replace(DARK_INTEGRATED_END, `} ${DARK_INTEGRATED_END}`);

            if (!imports[angularImportIdx].includes('ViewChild')) {
                imports[angularImportIdx] = imports[angularImportIdx].replace('Component', 'Component, ViewChild');
            }
        }

        const eventAttributes = bindings.eventHandlers
            .filter((event) => event.name !== 'onGridReady')
            .map(toOutput)
            .concat(gridReadyCode ? '(gridReady)="onGridReady($event)"' : '');

        const template = getTemplate(bindings, exampleConfig, propertyAttributes.concat(eventAttributes));

        const bindGridApi = (code: string) =>
            // We do not need the non-null assertion in component code as already applied to the declaration for the apis.
            code.replace(/(?<!this.)gridApi(\??)(!?)/g, 'this.gridApi');
        const componentBody = bindGridApi(
            eventHandlers
                .concat(externalEventHandlers)
                .concat(additional)
                .concat(instanceMethods)
                .map((snippet) => snippet.trim())
                .join('\n\n')
        );

        const standaloneImports = ['AgGridAngular'];

        if (componentFileNames) {
            componentFileNames.forEach((filename) => {
                const componentName = toTitleCase(filename.split('.')[0]);
                standaloneImports.push(componentName);
            });
        }

        let generatedOutput = `
${imports.join('\n')}
${exampleConfig.licenseKey ? "// enter your license key here to suppress console message and watermark\nLicenseManager.setLicenseKey('');\n" : ''}
${typeDeclares?.length > 0 ? '\n' + typeDeclares.join('\n') : ''}${interfaces?.length > 0 ? '\n' + interfaces.join('\n') : ''}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [${standaloneImports.join(', ')}],
    template: \`${template}\`
})

export class AppComponent {
${hasGridApi ? `    private gridApi!: GridApi${genericParams};\n` : ''}
    ${propertyAssignments.map((assignment) => assignment.replace(/;\s*$/, '') + ';').join('\n')}

${
    constructorBody
        ? `    constructor() {
        ${bindGridApi(constructorBody)}
    }

`
        : ''
}
    ${componentBody}
    ${darkModeWithGridRef ?? ''}
}

${bindings.classes.join('\n')}

${bindings.utils.join('\n')}
`;

        // Until we support this cleanly.
        generatedOutput = handleRowGenericInterface(generatedOutput, tData);

        return generatedOutput;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
