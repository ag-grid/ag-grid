import {processContent,
    autoinject,
    noView,
    customElement,
    TargetInstruction
    } from 'aurelia-framework';


@customElement('ag-template')
@noView()
@autoinject()

@processContent((compiler:any, resources:any, element:any, instruction:any) => {
    let html = element.innerHTML;
    if (html !== '') {
        instruction.template = html;
    }
    element.innerHTML = '';
})

export class AgTemplate {
    template:string;

    constructor(targetInstruction:TargetInstruction) {
        this.template = `<template>` + <any> targetInstruction.elementInstruction.template + `</template>`;
    }
}