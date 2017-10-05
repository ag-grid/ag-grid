import parser from './vanilla-src-parser';

function indexTemplate(bindings) {
    const imports = [];
    const propertyAssignments = bindings.properties.map(property => `${property.name}: ${property.value}`);
    const componentAttributes = bindings.properties.map(property => `${property.name}={this.state.${property.name}}`);
    const additional = [];

    componentAttributes.push('onGridReady={this.onGridReady.bind(this)}');

    if (bindings.gridSettings.enterprise) {
        imports.push('import "ag-grid-enterprise";');
    }

    const additionalInReady = [];

    if (bindings.data) {
        additionalInReady.push(`
        const httpRequest = new XMLHttpRequest();
        const updateData = (data) => ${bindings.data.callback};

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

    const agGridTag = `<div style={{
                boxSizing: 'border-box', 
                height: '${bindings.gridSettings.height}', 
                width: '${bindings.gridSettings.width}'}} 
                className="${bindings.gridSettings.theme}">

            <AgGridReact
                ${componentAttributes.join('\n        ')}
            />

            </div>`;

    let template = bindings.template ? bindings.template.replace('$$GRID$$', agGridTag) : agGridTag;

    template = template.replace(/onclick="(\w+)\((.*)\)"/g, 'onClick={this.$1.bind(this, $2)}');

    const externalEventHandlers = bindings.externalEventHandlers.map(handler => handler.body.replace(/^function /, ''));

    return `
'use strict'

import React, {Component} from "react"
import {render} from "react-dom"
import {AgGridReact} from 'ag-grid-react';
${imports.join('\n')}

${bindings.utils.join('\n')}

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ${propertyAssignments.join(',\n    ')}
        };
    }

    onGridReady(params) {
        this.agGrid = params;
        const gridOptions = params;

        ${additionalInReady.join('\n')}
    }

${additional.concat(externalEventHandlers).join('\n    ')}

    render() {
        return (
            <div style={{width: '100%', height: '100%' }}>
                ${template}
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
    const bindings = parser(src, gridSettings, {
        gridOptionsLocalVar: 'const gridOptions = this.agGrid'
    });
    return indexTemplate(bindings);
}

(<any>window).vanillaToReact = vanillaToReact;
