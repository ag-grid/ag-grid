/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var LoggerFactory = (function () {
    function LoggerFactory() {
    }
    LoggerFactory.prototype.init = function (gridOptionsWrapper) {
        this.logging = gridOptionsWrapper.isDebug();
    };
    LoggerFactory.prototype.create = function (name) {
        return new Logger(name, this.logging);
    };
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
