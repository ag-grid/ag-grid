// ag-grid-aurelia v8.1.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var aurelia_framework_1 = require("aurelia-framework");
/**
 * Function will move the elements innerHtml to a template property
 * and then remove html from the element so that Aurelia will not render
 * the template elements
 * @param compiler
 * @param resources
 * @param element
 * @param instruction
 */
function parseElement(compiler, resources, element, instruction) {
    var html = element.innerHTML;
    if (html !== '') {
        instruction.template = html;
    }
    element.innerHTML = '';
}
function getTemplate(targetInstruction) {
    return "<template>" + targetInstruction.elementInstruction.template + "</template>";
}
var AgCellTemplate = (function () {
    function AgCellTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    return AgCellTemplate;
}());
AgCellTemplate = __decorate([
    aurelia_framework_1.customElement('ag-cell-template'),
    aurelia_framework_1.noView(),
    aurelia_framework_1.autoinject(),
    aurelia_framework_1.processContent(parseElement),
    __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
], AgCellTemplate);
exports.AgCellTemplate = AgCellTemplate;
var AgEditorTemplate = (function () {
    function AgEditorTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    return AgEditorTemplate;
}());
AgEditorTemplate = __decorate([
    aurelia_framework_1.customElement('ag-editor-template'),
    aurelia_framework_1.noView(),
    aurelia_framework_1.autoinject(),
    aurelia_framework_1.processContent(parseElement),
    __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
], AgEditorTemplate);
exports.AgEditorTemplate = AgEditorTemplate;
var AgFilterTemplate = (function () {
    function AgFilterTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    return AgFilterTemplate;
}());
AgFilterTemplate = __decorate([
    aurelia_framework_1.customElement('ag-filter-template'),
    aurelia_framework_1.noView(),
    aurelia_framework_1.autoinject(),
    aurelia_framework_1.processContent(parseElement),
    __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
], AgFilterTemplate);
exports.AgFilterTemplate = AgFilterTemplate;
