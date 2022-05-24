import { templatePlaceholder } from './chart-vanilla-src-parser';
import { addBindingImports, convertFunctionToProperty, isInstanceMethod } from './parser-utils';
import { toInput, toConst, toMember, toAssignment, convertTemplate, getImport } from './angular-utils';
import { wrapOptionsUpdateCode } from './chart-utils';

export function processFunction(code: string): string {
    return wrapOptionsUpdateCode(convertFunctionToProperty(code));
}

function getImports(bindingImports, componentFileNames: string[], { typeParts }): string[] {
    const bImports = [...(bindingImports || [])];

    bImports.push({
        module: `'ag-charts-community'`,
        isNamespaced: false,
        imports: typeParts
    })

    const imports = [
        "import { Component } from '@angular/core';",
    ];

    addBindingImports(bImports, imports, true, true);

    if (componentFileNames) {
        imports.push(...componentFileNames.map(getImport));
    }

    return imports;
}

function getTemplate(bindings: any, attributes: string[]): string {
    const agChartTag = `<ag-charts-angular
    style="height: 100%"
    ${attributes.join('\n    ')}
    ></ag-charts-angular>`;

    const template = bindings.template ? bindings.template.replace(templatePlaceholder, agChartTag) : agChartTag;

    return convertTemplate(template);
}

export function vanillaToAngular(bindings: any, componentFileNames: string[]): () => string {
    return () => {
        const { properties, imports: bindingImports, declarations, optionsTypeInfo } = bindings;
        const opsTypeInfo = optionsTypeInfo || { typeParts: ['AgChartOptions'], typeStr: 'AgChartOptions' };
        const imports = getImports(bindingImports, componentFileNames, opsTypeInfo);

        const propertyAttributes = [];
        const propertyVars = [];
        const propertyAssignments = [];

        properties.forEach(property => {

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
                    propertyVars.push(toMember(property));
                }

                propertyAssignments.push(toAssignment(property));
            }
        });

        const instanceMethods = bindings.instanceMethods.map(processFunction);
        const template = getTemplate(bindings, propertyAttributes);
        const externalEventHandlers = bindings.externalEventHandlers.map(handler => processFunction(handler.body));

        return `${imports.join('\n')}${declarations.length > 0 ? '\n' + declarations.join('\n') : ''}

@Component({
    selector: 'my-app',
    template: \`${template}\`
})

export class AppComponent {
    private options: ${opsTypeInfo.typeStr};
    ${propertyVars.filter(p => p.name === 'options').join('\n')}

    constructor() {
        ${propertyAssignments.join(';\n')}
    }

    ngOnInit() {
        ${bindings.init.join(';\n    ')}
    }

    ${instanceMethods.concat(externalEventHandlers).map(snippet => snippet.trim()).join('\n\n')}
}

${bindings.globals.join('\n')}
`;
    };
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToAngular = vanillaToAngular;
}
