/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var LoggerFactory = /** @class */ (function (_super) {
    __extends(LoggerFactory, _super);
    function LoggerFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
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
        __param(0, context_2.Qualifier('gridOptionsWrapper'))
    ], LoggerFactory.prototype, "setBeans", null);
    LoggerFactory = __decorate([
        context_1.Bean('loggerFactory')
    ], LoggerFactory);
    return LoggerFactory;
}(beanStub_1.BeanStub));
exports.LoggerFactory = LoggerFactory;
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
            console.log('AG Grid.' + this.name + ': ' + message);
        }
    };
    return Logger;
}());
exports.Logger = Logger;

//# sourceMappingURL=logger.js.map
