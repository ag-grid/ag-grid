import {processContent,
    autoinject,
    noView,
    customElement,
    TargetInstruction
    } from 'aurelia-framework';


function parseElement(compiler:any, resources:any, element:any, instruction:any) {
    let html = element.innerHTML;
    if (html !== '') {
        instruction.template = html;
    }
    element.innerHTML = '';
}

function getTemplate(targetInstruction:any) {
    return `<template>` + <any> targetInstruction.elementInstruction.template + `</template>`
}

@customElement('ag-cell-template')
@noView()
@autoinject()
@processContent(parseElement)

export class AgCellTemplate {
    template:string;

    constructor(targetInstruction:TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-editor-template')
@noView()
@autoinject()
@processContent(parseElement)

export class AgEditorTemplate {
    template:string;

    constructor(targetInstruction:TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-filter-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgFilterTemplate {
    template:string;

    constructor(targetInstruction:TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}