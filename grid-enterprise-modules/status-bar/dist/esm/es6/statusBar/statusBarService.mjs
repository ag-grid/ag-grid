var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub } from '@ag-grid-community/core';
let StatusBarService = class StatusBarService extends BeanStub {
    // tslint:disable-next-line
    constructor() {
        super();
        this.allComponents = {};
    }
    registerStatusPanel(key, component) {
        this.allComponents[key] = component;
    }
    getStatusPanel(key) {
        return this.allComponents[key];
    }
};
StatusBarService = __decorate([
    Bean('statusBarService')
], StatusBarService);
export { StatusBarService };
