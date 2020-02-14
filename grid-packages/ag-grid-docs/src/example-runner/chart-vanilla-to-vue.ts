import { getFunctionName, removeFunctionKeyword, isInstanceMethod } from './parser-utils';
import { templatePlaceholder } from './chart-vanilla-src-parser';
import { toInput, toConst, toMember, toAssignment, convertTemplate, getImport } from './vue-utils';

function getImports(componentFileNames: string[]): string[] {
    const imports = [
        "import Vue from 'vue';",
        "import * as agCharts from 'ag-charts-community';",
        "import { AgChartsVue } from 'ag-charts-vue';",
    ];

    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    return imports;
}

function getPropertyBindings(bindings: any, componentFileNames: string[]): [string[], string[], string[]] {
    const propertyAssignments = [];
    const propertyVars = [];
    const propertyAttributes = [];

    bindings.properties
        .forEach(property => {
            if (componentFileNames.length > 0 && property.name === 'components') {
                property.name = 'frameworkComponents';
            }

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
          ${attributes.join('\n    ')}></ag-charts-vue>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agChartTag) : agChartTag;

    return convertTemplate(template);
};

function getAllMethods(bindings: any): [string[], string[]] {
    const instanceMethods = bindings.instanceMethods.map(removeFunctionKeyword);

    const globalMethods = bindings.globals.map(body => {
        const funcName = getFunctionName(body);

        if (funcName) {
            return `window.${funcName} = ${body}`;
        }

        // probably a var
        return body;
    });

    return [instanceMethods, globalMethods];
}

export function vanillaToVue(bindings: any, componentFileNames: string[]): string {
    const imports = getImports(componentFileNames);
    const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames);
    const [instanceMethods, globalMethods] = getAllMethods(bindings);
    const template = getTemplate(bindings, propertyAttributes);

    return `
${imports.join('\n')}

const ChartExample = {
    template: \`
        ${template}
    \`,
    components: {
        'ag-charts-vue': AgChartsVue
    },
    data: function() {
        return {
            ${propertyVars.join(',\n')}
        }
    },
    beforeMount() {
        ${propertyAssignments.join(';\n')}
    },
    mounted() {
    },
    methods: {
        ${instanceMethods.map(snippet => `${snippet.trim()},`).join('\n')}
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
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToVue = vanillaToVue;
}
