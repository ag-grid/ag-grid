import parser, {recognizedDomEvents} from './vanilla-src-parser';
import styleConvertor from './lib/convert-style-to-react';

function getFunctionName(code) {
    let matches = /function ([^\(]*)/.exec(code);
    return matches && matches.length === 2 ? matches[1] : null;
}

function isInstanceMethod(instance: any, property: any) {
    const instanceMethods = instance.map(getFunctionName);
    return instanceMethods.filter(methodName => methodName === property.name).length > 0;
}

function indexTemplate(bindings, componentFilenames, isDev) {
    const imports = [];
    const propertyAssignments = [];
    const componentAttributes = [];

    const instanceBindings = [];
    bindings.properties.filter(property => property.name != 'onGridReady').forEach(property => {
        if (componentFilenames.length > 0 && property.name === "components") {
            property.name = "frameworkComponents";
        }

        if (property.value === 'true' || property.value === 'false') {
            componentAttributes.push(`${property.name}={${property.value}}`);
        } else if (property.value === null) {
            componentAttributes.push(`${property.name}={this.${property.name}}`);
        } else {
            // for when binding a method
            // see javascript-grid-keyboard-navigation for an example
            // tabToNextCell needs to be bound to the react component
            if(isInstanceMethod(bindings.instance, property)) {
                instanceBindings.push(`this.${property.name}=${property.value}`);
            } else {
                propertyAssignments.push(`${property.name}: ${property.value}`);
                componentAttributes.push(`${property.name}={this.state.${property.name}}`);
            }
        }
    });

    const componentEventAttributes = bindings.eventHandlers.map(event => `${event.handlerName}={this.${event.handlerName}.bind(this)}`);

    componentAttributes.push('onGridReady={this.onGridReady}');
    componentAttributes.push.apply(componentAttributes, componentEventAttributes);

    const additional = [];

    if (bindings.gridSettings.enterprise) {
        imports.push('import "ag-grid-enterprise";');
    }

    const chartsEnabled = bindings.properties.filter(property => property.name === 'enableCharts' && property.value === 'true').length >= 1;
    if(chartsEnabled && !isDev) {
        imports.push('import "ag-grid-enterprise/chartsModule";');
    }

    if (componentFilenames) {
        let titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        componentFilenames.forEach(filename => {
            let componentName = titleCase(filename).split('.')[0];
            imports.push('import ' + componentName + ' from "./' + filename + '";');
        });
    }

    const additionalInReady = [];

    if (bindings.data) {
        let setRowDataBlock = bindings.data.callback;
        if (bindings.data.callback.indexOf('api.setRowData') !== -1) {
            if (propertyAssignments.filter(item => item.indexOf('rowData') !== -1).length === 0) {
                propertyAssignments.push('rowData: []');
            }
            if (componentAttributes.filter(item => item.indexOf('rowData') !== -1).length === 0) {
                componentAttributes.push('rowData={this.state.rowData}');
            }

            setRowDataBlock = bindings.data.callback.replace("params.api.setRowData(data);", "this.setState({ rowData: data });");
        }

        additionalInReady.push(`
            const httpRequest = new XMLHttpRequest();
            const updateData = (data) => ${setRowDataBlock};
    
            httpRequest.open('GET', ${bindings.data.url});
            httpRequest.send();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    updateData(JSON.parse(httpRequest.responseText));
                }
            };`);

    }

    if (bindings.onGridReady) {
        const hackedHandler = bindings.onGridReady.replace(/^\{|\}$/g, '');
        additionalInReady.push(hackedHandler);
    }

    if (bindings.resizeToFit) {
        additionalInReady.push('params.api.sizeColumnsToFit();');
    }

    const agGridTag = `<div 
                id="myGrid"
                style={{
                    height: '${bindings.gridSettings.height}', 
                    width: '${bindings.gridSettings.width}'}} 
                    className="${bindings.gridSettings.theme}">
            <AgGridReact
                ${componentAttributes.join('\n')}
            />
            </div>`;

    let template = bindings.template ? bindings.template.replace('$$GRID$$', agGridTag) : agGridTag;

    recognizedDomEvents.forEach(event => {
        const jsEvent = 'on' + event[0].toUpperCase() + event.substr(1, event.length);
        const matcher = new RegExp(`on${event}="(\\w+)\\((.*)\\)"`, 'g');
        template = template.replace(matcher, `${jsEvent}={this.$1.bind(this, $2)}`);
    });
    template = template.replace(/\(this\, \)/g, '(this)');

    template = template.replace(/<input type="(radio|checkbox|text)" (.+?)>/g, '<input type="$1" $2 />');
    template = template.replace(/<input placeholder(.+?)>/g, '<input placeholder$1 />');

    template = styleConvertor(template);

    const eventHandlers = bindings.eventHandlers.map(event => event.handler.replace(/^function /, ''));
    const externalEventHandlers = bindings.externalEventHandlers.map(handler => handler.body.replace(/^function /, ''));
    const instance = bindings.instance.map(body => body.replace(/^function /, ''));

    const style = bindings.gridSettings.noStyle ? '' : `style={{width: '100%', height: '100%' }}`;

    return `
'use strict'

import React, {Component} from "react"
import {render} from "react-dom"
import {AgGridReact} from 'ag-grid-react';
${imports.join('\n')}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ${propertyAssignments.join(',\n    ')}
        };
        
        ${instanceBindings.join(';\n    ')}
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        ${additionalInReady.join('\n')}
    }

${additional.concat(eventHandlers, externalEventHandlers).join('\n    ')}
    render() {
        return (
            <div ${style}>
                ${template}
            </div>
        );
    }
    
    ${instance.join('\n')}
}

${bindings.utils.join('\n')}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
`;
}

export function vanillaToReact(js, html, exampleSettings, componentFilenames, isDev) {
    const bindings = parser(js, html, exampleSettings);
    return indexTemplate(bindings, componentFilenames, isDev);
}

if (typeof window !== 'undefined') {
    (<any>window).vanillaToReact = vanillaToReact;
}
