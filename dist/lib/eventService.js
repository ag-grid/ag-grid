/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('./utils');
var EventService = (function () {
    function EventService() {
        this.allListeners = {};
        this.globalListeners = [];
    }
    EventService.prototype.init = function (loggerFactory) {
        this.logger = loggerFactory.create('EventService');
    };
    EventService.prototype.getListenerList = function (eventType) {
        var listenerList = this.allListeners[eventType];
        if (!listenerList) {
            listenerList = [];
            this.allListeners[eventType] = listenerList;
        }
        return listenerList;
    };
    EventService.prototype.addEventListener = function (eventType, listener) {
        var listenerList = this.getListenerList(eventType);
        if (listenerList.indexOf(listener) < 0) {
            listenerList.push(listener);
        }
    };
    EventService.prototype.addGlobalListener = function (listener) {
        this.globalListeners.push(listener);
    };
    EventService.prototype.removeEventListener = function (eventType, listener) {
        var listenerList = this.getListenerList(eventType);
        utils_1.default.removeFromArray(listenerList, listener);
    };
    EventService.prototype.removeGlobalListener = function (listener) {
        utils_1.default.removeFromArray(this.globalListeners, listener);
    };
    // why do we pass the type here? the type is in ColumnChangeEvent, so unless the
    // type is not in other types of events???
    EventService.prototype.dispatchEvent = function (eventType, event) {
        if (!event) {
            event = {};
        }
        //this.logger.log('dispatching: ' + event);
        var listenerList = this.getListenerList(eventType);
        listenerList.forEach(function (listener) {
            listener(event);
        });
        this.globalListeners.forEach(function (listener) {
            listener(eventType, event);
        });
    };
    return EventService;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EventService;
