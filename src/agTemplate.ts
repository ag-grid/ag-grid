import {autoinject, customElement, noView, processContent, TargetInstruction} from "aurelia-framework";

/**
 * Function will move the elements innerHtml to a template property
 * and then remove html from the element so that Aurelia will not render
 * the template elements
 * @param compiler
 * @param resources
 * @param element
 * @param instruction
 */
function parseElement(compiler: any, resources: any, element: any, instruction: any) {
    let html = element.innerHTML;
    if (html !== '') {
        instruction.template = html;
    }
    element.innerHTML = '';
}

function getTemplate(targetInstruction: any) {
    return `<template>` + <any> targetInstruction.elementInstruction.template + `</template>`
}

@customElement('ag-cell-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgCellTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-editor-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgEditorTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-filter-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgFilterTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-header-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgHeaderTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-header-group-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgHeaderGroupTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-pinned-row-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgPinnedRowTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-date-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgDateTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}

@customElement('ag-full-width-row-template')
@noView()
@autoinject()
@processContent(parseElement)
export class AgFullWidthRowTemplate {
    template: string;

    constructor(targetInstruction: TargetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
}