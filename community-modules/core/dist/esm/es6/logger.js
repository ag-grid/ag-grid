/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { BeanStub } from "./context/beanStub";
let LoggerFactory = class LoggerFactory extends BeanStub {
    setBeans(gridOptionsService) {
        this.logging = gridOptionsService.is('debug');
    }
    create(name) {
        return new Logger(name, this.isLogging.bind(this));
    }
    isLogging() {
        return this.logging;
    }
};
__decorate([
    __param(0, Qualifier('gridOptionsService'))
], LoggerFactory.prototype, "setBeans", null);
LoggerFactory = __decorate([
    Bean('loggerFactory')
], LoggerFactory);
export { LoggerFactory };
export class Logger {
    constructor(name, isLoggingFunc) {
        this.name = name;
        this.isLoggingFunc = isLoggingFunc;
    }
    isLogging() {
        return this.isLoggingFunc();
    }
    log(message) {
        if (this.isLoggingFunc()) {
            // tslint:disable-next-line
            console.log('AG Grid.' + this.name + ': ' + message);
        }
    }
}
