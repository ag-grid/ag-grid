import { getFunctionName, isInstanceMethod, removeFunctionKeyword } from './parser-utils';
import { templatePlaceholder } from './chart-vanilla-src-parser';
import { toInput, toConst, toMember, toAssignment, convertTemplate, getImport } from './vue-utils';
import { getChartImports, wrapOptionsUpdateCode } from './chart-utils';

function processFunction(code: string): string {
    return wrapOptionsUpdateCode(removeFunctionKeyword(code));
}

function getImports(componentFileNames: string[], bindings): string[] {
    const imports = [
        "import Vue from 'vue';",
        "import { AgChartsVue } from 'ag-charts-vue';",
    ];

    const chartImport = getChartImports(bindings.imports, bindings.usesChartApi)
    if (chartImport) {
        imports.push(chartImport);
    }


    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    return imports;
}

function getPropertyBindings(bindings: any): [string[], string[], string[]] {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .forEach(property => {

            if (property.value === 'true' || property.value === 'false') {
                propertyAttributes.push(toConst(property));
            } else if (property.value === null || property.value === 'null') {
                propertyAttributes.push(toInput(property));
            } else {
                // for when binding a method
                // see javascript-grid-keyboard-navigation for an example
                // tabToNextCell needs to be bound to the react component
                if (!isInstanceMethod(bindings.instanceMethods, property)) {
                    propertyAttributes.push(toInput(property));
                    propertyVars.push(toMember(property));
                }

                propertyAssignments.push(toAssignment(property));
            }
        });

    return [propertyAssignments, propertyVars, propertyAttributes];
}

function getTemplate(bindings: any, attributes: string[]): string {
    const agChartTag = `<ag-charts-vue
    ${bindings.usesChartApi ? `ref="agChart"` : ''}    
    ${attributes.join('\n    ')}></ag-charts-vue>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agChartTag) : agChartTag;

    return convertTemplate(template);
};

function getAllMethods(bindings: any): [string[], string[], string[]] {
    const externalEventHandlers = bindings.externalEventHandlers.map(event => processFunction(event.body));
    const instanceMethods = bindings.instanceMethods.map(processFunction);

    const globalMethods = bindings.globals.map(body => {
        const funcName = getFunctionName(body);

        if (funcName) {
            return `window.${funcName} = ${body}`;
        }

        // probably a var
        return body;
    });

    return [externalEventHandlers, instanceMethods, globalMethods];
}

export function vanillaToVue(bindings: any, componentFileNames: string[]): () => string {
    return () => {
        const imports = getImports(componentFileNames, bindings);
        const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings);
        const [externalEventHandlers, instanceMethods, globalMethods] = getAllMethods(bindings);
        const template = getTemplate(bindings, propertyAttributes);

        let mainFile = `${imports.join('\n')}

const ChartExample = {
    template: \`
        ${template}
    \`,
    components: {
        'ag-charts-vue': AgChartsVue
    },
    data: function() {
        return {
            ${propertyVars.join(',\n            ')}
        }
    },
    created() {
        ${propertyAssignments.join(';\n        ')}
    },
    mounted() {
        ${bindings.init.join(';\n        ')}
    },
    methods: {
        ${instanceMethods.concat(externalEventHandlers).map(snippet => `${snippet.trim()},`).join('\n')}
    }
}

${globalMethods.join('\n\n')}

new Vue({
    el: '#app',
    components: {
        'my-component': ChartExample
    }
});
`;

        if (bindings.usesChartApi) {
            mainFile = mainFile.replace(/AgChart.(\w*)\((\w*)(,|\))/g, 'AgChart.$1(this.$refs.agChart.chart$3');
            mainFile = mainFile.replace(/\(this.\$refs.agChart.chart, options/g, '(this.$refs.agChart.chart, this.options');
        }


        return mainFile;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
