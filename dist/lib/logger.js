/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var LoggerFactory = (function () {
    function LoggerFactory() {
    }
    LoggerFactory.prototype.setBeans = function (gridOptionsWrapper) {
        this.logging = gridOptionsWrapper.isDebug();
    };
    LoggerFactory.prototype.create = function (name) {
        return new Logger(name, this.logging);
    };
    __decorate([
        __param(0, context_2.Qualifier('gridOptionsWrapper')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [gridOptionsWrapper_1.GridOptionsWrapper]), 
        __metadata('design:returntype', void 0)
    ], LoggerFactory.prototype, "setBeans", null);
    LoggerFactory = __decorate([
        context_1.Bean('loggerFactory'), 
        __metadata('design:paramtypes', [])
    ], LoggerFactory);
    return LoggerFactory;
})();
exports.LoggerFactory = LoggerFactory;
var Logger = (function () {
    function Logger(name, logging) {
        this.name = name;
        this.logging = logging;
    }
    Logger.prototype.log = function (message) {
        if (this.logging) {
            console.log('ag-Grid.' + this.name + ': ' + message);
        }
    };
    return Logger;
})();
exports.Logger = Logger;
