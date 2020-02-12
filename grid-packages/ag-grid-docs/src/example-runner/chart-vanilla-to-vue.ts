import { getFunctionName } from './chart-vanilla-src-parser';

function removeFunctionKeyword(code): string {
    return code.replace(/^function /, '');
}

const toInput = property => `:${property.name}="${property.name}"`;
const toConst = property => `:${property.name}="${property.value}"`;
const toMember = property => `${property.name}: null`;

function toAssignment(property: any): string {
    // convert to arrow functions
    const value = property.value.replace(/function\s*\(([^\)]+)\)/, '($1) =>');

    return `this.${property.name} = ${value}`;
};

function getImports(): string[] {
    return [
        "import Vue from 'vue';",
        "import * as agCharts from 'ag-charts-community';",
        "import { AgChartsVue } from 'ag-charts-vue';",
    ];
}

function isInstanceMethod(instance: any, property: any): boolean {
    return instance.map(getFunctionName).filter(name => name === property.name).length > 0;
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
                if (!isInstanceMethod(bindings.instance, property)) {
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

    let template = agChartTag;

    if (bindings.template) {
        template = bindings.template.replace("$$CHART$$", agChartTag);
    }

    return template;
};

function getAllMethods(bindings) {
    const instanceFunctions = bindings.instance.map(removeFunctionKeyword);

    const globalFunctions = bindings.globals.map(body => {
        const funcName = getFunctionName(body);

        if (funcName) {
            return `window.${funcName} = ${body}`;
        }

        // probably a var
        return body;
    });

    return [instanceFunctions, globalFunctions];
}

export function vanillaToVue(bindings, componentFileNames) {
    const imports = getImports();
    const [propertyAssignments, propertyVars, propertyAttributes] = getPropertyBindings(bindings, componentFileNames);
    const [instanceFunctions, globalFunctions] = getAllMethods(bindings);
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
        ${instanceFunctions.map(snippet => `${snippet.trim()},`).join('\n')}
    }
}

${globalFunctions.map(snippet => `${snippet.trim()}`).join('\n\n')}

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
