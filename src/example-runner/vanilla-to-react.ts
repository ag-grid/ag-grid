import parser from './vanilla-src-parser';

function stripOnPrefix(eventName) {
    return eventName.replace(/on([A-Z])/, function(...matches) {
        return matches[1].toLowerCase();
    });
}

function convertFunctionToMethod(func, methodName) {
    return methodName + func.replace('function ', '');
}

function indexTemplate(bindings) {
    const imports = [];
    const propertyAssignments = bindings.properties.map(property => `${property.name}: ${property.value}`);
    const componentAttributes = bindings.properties.map(property => `${property.name}={this.state.${property.name}}`);
    const additional = [];

    if (bindings.gridSettings.enterprise) {
        imports.push('import "ag-grid-enterprise";');
    }

    if (bindings.data) {
        additional.push(`
    onGridReady(params) {
        const gridOptions = params;
        const httpRequest = new XMLHttpRequest();
        const updateData = (data) => ${bindings.data.callback};

        httpRequest.open('GET', ${bindings.data.url});
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                updateData(JSON.parse(httpRequest.responseText));
            }
        };
    }
            `);
        componentAttributes.push('onGridReady={this.onGridReady.bind(this)}')
    }

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
    }

${additional.join('\n')}

    render() {
        return (
            <div style={{
                boxSizing: 'border-box', 
                height: '${bindings.gridSettings.height}', 
                width: '${bindings.gridSettings.width}'}} 
                className="${bindings.gridSettings.theme}">

            <AgGridReact
                ${componentAttributes.join('\n        ')}
            />

            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
`;
}

export function vanillaToReact(src, gridSettings) {
    const bindings = parser(src, gridSettings);
    return indexTemplate(bindings);
}

(<any>window).vanillaToReact = vanillaToReact;
