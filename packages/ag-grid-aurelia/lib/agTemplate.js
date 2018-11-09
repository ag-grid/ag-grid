// ag-grid-aurelia v19.1.2
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
Object.defineProperty(exports, "__esModule", { value: true });
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
var AgCellTemplate = /** @class */ (function () {
    function AgCellTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgCellTemplate = __decorate([
        aurelia_framework_1.customElement('ag-cell-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgCellTemplate);
    return AgCellTemplate;
}());
exports.AgCellTemplate = AgCellTemplate;
var AgEditorTemplate = /** @class */ (function () {
    function AgEditorTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgEditorTemplate = __decorate([
        aurelia_framework_1.customElement('ag-editor-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgEditorTemplate);
    return AgEditorTemplate;
}());
exports.AgEditorTemplate = AgEditorTemplate;
var AgFilterTemplate = /** @class */ (function () {
    function AgFilterTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgFilterTemplate = __decorate([
        aurelia_framework_1.customElement('ag-filter-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgFilterTemplate);
    return AgFilterTemplate;
}());
exports.AgFilterTemplate = AgFilterTemplate;
var AgHeaderTemplate = /** @class */ (function () {
    function AgHeaderTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgHeaderTemplate = __decorate([
        aurelia_framework_1.customElement('ag-header-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgHeaderTemplate);
    return AgHeaderTemplate;
}());
exports.AgHeaderTemplate = AgHeaderTemplate;
var AgHeaderGroupTemplate = /** @class */ (function () {
    function AgHeaderGroupTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgHeaderGroupTemplate = __decorate([
        aurelia_framework_1.customElement('ag-header-group-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgHeaderGroupTemplate);
    return AgHeaderGroupTemplate;
}());
exports.AgHeaderGroupTemplate = AgHeaderGroupTemplate;
var AgPinnedRowTemplate = /** @class */ (function () {
    function AgPinnedRowTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgPinnedRowTemplate = __decorate([
        aurelia_framework_1.customElement('ag-pinned-row-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgPinnedRowTemplate);
    return AgPinnedRowTemplate;
}());
exports.AgPinnedRowTemplate = AgPinnedRowTemplate;
var AgDateTemplate = /** @class */ (function () {
    function AgDateTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgDateTemplate = __decorate([
        aurelia_framework_1.customElement('ag-date-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgDateTemplate);
    return AgDateTemplate;
}());
exports.AgDateTemplate = AgDateTemplate;
var AgFullWidthRowTemplate = /** @class */ (function () {
    function AgFullWidthRowTemplate(targetInstruction) {
        this.template = getTemplate(targetInstruction);
    }
    AgFullWidthRowTemplate = __decorate([
        aurelia_framework_1.customElement('ag-full-width-row-template'),
        aurelia_framework_1.noView(),
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.processContent(parseElement),
        __metadata("design:paramtypes", [aurelia_framework_1.TargetInstruction])
    ], AgFullWidthRowTemplate);
    return AgFullWidthRowTemplate;
}());
exports.AgFullWidthRowTemplate = AgFullWidthRowTemplate;
