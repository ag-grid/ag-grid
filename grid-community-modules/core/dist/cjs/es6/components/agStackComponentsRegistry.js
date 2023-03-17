/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgStackComponentsRegistry = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
let AgStackComponentsRegistry = class AgStackComponentsRegistry extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.componentsMappedByName = {};
    }
    setupComponents(components) {
        if (components) {
            components.forEach(componentMeta => this.addComponent(componentMeta));
        }
    }
    addComponent(componentMeta) {
        // get name of the class as a string
        // insert a dash after every capital letter
        // let classEscaped = className.replace(/([A-Z])/g, "-$1").toLowerCase();
        const classEscaped = componentMeta.componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        // put all to upper case
        const classUpperCase = classEscaped.toUpperCase();
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.componentClass;
    }
    getComponentClass(htmlTag) {
        return this.componentsMappedByName[htmlTag];
    }
};
AgStackComponentsRegistry = __decorate([
    context_1.Bean('agStackComponentsRegistry')
], AgStackComponentsRegistry);
exports.AgStackComponentsRegistry = AgStackComponentsRegistry;
