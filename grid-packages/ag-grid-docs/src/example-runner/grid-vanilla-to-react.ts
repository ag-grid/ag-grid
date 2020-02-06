import { recognizedDomEvents, getFunctionName } from './grid-vanilla-src-parser';
import styleConvertor from './lib/convert-style-to-react';

function isInstanceMethod(instance: any, property: any): boolean {
    const instanceMethods = instance.map(getFunctionName);
    return instanceMethods.filter(methodName => methodName === property.name).length > 0;
}

function convertFunctionToProperty(definition: string): string {
    return definition.replace(/^function\s+([^\(\s]+)\s*\(([^\)]*)\)/, '$1 = ($2) => ');
}

function toTitleCase(value: string): string {
    return value[0].toUpperCase() + value.slice(1);
}

function getImports(bindings: any, componentFilenames: string[]): string[] {
    const imports = [
        "import React, { Component } from 'react';",
        "import { render } from 'react-dom';",
        "import { AgGridReact } from '@ag-grid-community/react';"
    ];

    if (bindings.gridSettings.enterprise) {
        imports.push("import { AllModules } from '@ag-grid-enterprise/all-modules';");
    } else {
        imports.push("import { AllCommunityModules } from '@ag-grid-community/all-modules';");
    }

    imports.push("import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';");

    // to account for the (rare) example that has more than one class...just default to balham if it does
    const theme = bindings.gridSettings.theme || 'ag-theme-balham';
    imports.push(`import '@ag-grid-community/all-modules/dist/styles/${theme}.css';`);

    if (componentFilenames) {
        componentFilenames.forEach(filename => {
            const componentName = toTitleCase(filename.split('.')[0]);
            imports.push(`import ${componentName} from './${filename}';`);
        });
    }

    return imports;
}

function getTemplate(bindings: any, componentAttributes: string[]): string {
    const { gridSettings } = bindings;
    const agGridTag = `<div
                id="myGrid"
                style={{
                    height: '${gridSettings.height}',
                    width: '${gridSettings.width}'}}
                    className="${gridSettings.theme}">
            <AgGridReact
                ${componentAttributes.join('\n')}
            />
            </div>`;

    let template = bindings.template ? bindings.template.replace('$$GRID$$', agGridTag) : agGridTag;

    recognizedDomEvents.forEach(event => {
        const jsEvent = `on${toTitleCase(event)}`;
        const matcher = new RegExp(`on${event}="(\\w+)\\((.*?)\\)"`, 'g');

        template = template
            .replace(matcher, `${jsEvent}={this.$1.bind(this, $2)}`)
            .replace(/, event\)/g, ")")
            .replace(/, event,/g, ", ");
    });

    // react events are case sensitive - could do something tricky here, but as there are only 2 events affected so far
    // I'll keep it simple
    const domEventsCaseSensitive = [
        { name: 'ondragover', replacement: 'onDragOver' },
        { name: 'ondragstart', replacement: 'onDragStart' },
    ];

    domEventsCaseSensitive.forEach(event => {
        template = template.replace(new RegExp(event.name, 'ig'), event.replacement);
    });

    template = template
        .replace(/\(this\, \)/g, '(this)')
        .replace(/<input type="(radio|checkbox|text)" (.+?)>/g, '<input type="$1" $2 />')
        .replace(/<input placeholder(.+?)>/g, '<input placeholder$1 />')
        .replace(/ class=/g, " className=");

    return styleConvertor(template);
}

export function vanillaToReact(bindings: any, componentFilenames: string[]): string {
    const { properties, data, gridSettings, onGridReady, resizeToFit } = bindings;
    const imports = getImports(bindings, componentFilenames);
    const stateProperties = [`modules: ${gridSettings.enterprise ? 'AllModules' : 'AllCommunityModules'}`];
    const componentAttributes = ['modules={this.state.modules}'];
    const instanceBindings = [];

    properties.filter(property => property.name !== 'onGridReady').forEach(property => {
        if (componentFilenames.length > 0 && property.name === 'components') {
            property.name = 'frameworkComponents';
        }

        if (property.value === 'true' || property.value === 'false') {
            componentAttributes.push(`${property.name}={${property.value}}`);
        } else if (property.value === null) {
            componentAttributes.push(`${property.name}={this.${property.name}}`);
        } else {
            // for when binding a method
            // see javascript-grid-keyboard-navigation for an example
            // tabToNextCell needs to be bound to the react component
            if (isInstanceMethod(bindings.instance, property)) {
                instanceBindings.push(`this.${property.name}=${property.value}`);
            } else {
                stateProperties.push(`${property.name}: ${property.value}`);
                componentAttributes.push(`${property.name}={this.state.${property.name}}`);
            }
        }
    });

    const componentEventAttributes = bindings.eventHandlers.map(event => `${event.handlerName}={this.${event.handlerName}.bind(this)}`);

    componentAttributes.push('onGridReady={this.onGridReady}');
    componentAttributes.push.apply(componentAttributes, componentEventAttributes);

    const additionalInReady = [];

    if (data) {
        let setRowDataBlock = data.callback;

        if (data.callback.indexOf('api.setRowData') >= 0) {
            if (stateProperties.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                stateProperties.push('rowData: []');
            }

            if (componentAttributes.filter(item => item.indexOf('rowData') >= 0).length === 0) {
                componentAttributes.push('rowData={this.state.rowData}');
            }

            setRowDataBlock = data.callback.replace('params.api.setRowData(data);', 'this.setState({ rowData: data });');
        }

        additionalInReady.push(`
            const httpRequest = new XMLHttpRequest();
            const updateData = (data) => ${setRowDataBlock};

            httpRequest.open('GET', ${data.url});
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };`);
    }

    if (onGridReady) {
        const hackedHandler = onGridReady.replace(/^\{|\}$/g, '');
        additionalInReady.push(hackedHandler);
    }

    if (resizeToFit) {
        additionalInReady.push('params.api.sizeColumnsToFit();');
    }

    const template = getTemplate(bindings, componentAttributes);
    const eventHandlers = bindings.eventHandlers.map(event => convertFunctionToProperty(event.handler));
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => convertFunctionToProperty(handler.body));
    const instance = bindings.instance.map(convertFunctionToProperty);
    const style = gridSettings.noStyle ? '' : `style={{width: '100%', height: '100%' }}`;

    return `
'use strict'

${imports.join('\n')}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ${stateProperties.join(',\n    ')}
        };

        ${instanceBindings.join(';\n    ')}
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        ${additionalInReady.join('\n')}
    }

${[].concat(eventHandlers, externalEventHandlers, instance).join('\n\n   ')}

    render() {
        return (
            <div ${style}>
                ${template}
            </div>
        );
    }
}

${bindings.utils.join('\n')}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
`;
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReact = vanillaToReact;
}
