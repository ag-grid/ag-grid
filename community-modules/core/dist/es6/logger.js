/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
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
var LoggerFactory = /** @class */ (function () {
    function LoggerFactory() {
    }
    LoggerFactory.prototype.setBeans = function (gridOptionsWrapper) {
        this.logging = gridOptionsWrapper.isDebug();
    };
    LoggerFactory.prototype.create = function (name) {
        return new Logger(name, this.isLogging.bind(this));
    };
    LoggerFactory.prototype.isLogging = function () {
        return this.logging;
    };
    __decorate([
        __param(0, Qualifier('gridOptionsWrapper'))
    ], LoggerFactory.prototype, "setBeans", null);
    LoggerFactory = __decorate([
        Bean('loggerFactory')
    ], LoggerFactory);
    return LoggerFactory;
}());
export { LoggerFactory };
var Logger = /** @class */ (function () {
    function Logger(name, isLoggingFunc) {
        this.name = name;
        this.isLoggingFunc = isLoggingFunc;
    }
    Logger.prototype.isLogging = function () {
        return this.isLoggingFunc();
    };
    Logger.prototype.log = function (message) {
        if (this.isLoggingFunc()) {
            // tslint:disable-next-line
            console.log('ag-Grid.' + this.name + ': ' + message);
        }
    };
    return Logger;
}());
export { Logger };
