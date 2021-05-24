/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { Bean, Qualifier } from "./context/context";
var EventService = /** @class */ (function () {
    function EventService() {
        this.allSyncListeners = new Map();
        this.allAsyncListeners = new Map();
        this.globalSyncListeners = new Set();
        this.globalAsyncListeners = new Set();
        this.asyncFunctionsQueue = [];
        this.scheduled = false;
        // using an object performs better than a Set for the number of different events we have
        this.firedEvents = {};
    }
    // because this class is used both inside the context and outside the context, we do not
    // use autowired attributes, as that would be confusing, as sometimes the attributes
    // would be wired, and sometimes not.
    //
    // the global event servers used by AG Grid is autowired by the context once, and this
    // setBeans method gets called once.
    //
    // the times when this class is used outside of the context (eg RowNode has an instance of this
    // class) then it is not a bean, and this setBeans method is not called.
    EventService.prototype.setBeans = function (loggerFactory, gridOptionsWrapper, frameworkOverrides, globalEventListener) {
        if (globalEventListener === void 0) { globalEventListener = null; }
        this.logger = loggerFactory.create('EventService');
        this.frameworkOverrides = frameworkOverrides;
        if (globalEventListener) {
            var async = gridOptionsWrapper.useAsyncEvents();
            this.addGlobalListener(globalEventListener, async);
        }
    };
    EventService.prototype.getListeners = function (eventType, async, autoCreateListenerCollection) {
        var listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        var listeners = listenerMap.get(eventType);
        // Note: 'autoCreateListenerCollection' should only be 'true' if a listener is about to be added. For instance
        // getListeners() is also called during event dispatch even though no listeners are added. This measure protects
        // against 'memory bloat' as empty collections will prevent the RowNode's event service from being removed after
        // the RowComp is destroyed, see noRegisteredListenersExist() below.
        if (!listeners && autoCreateListenerCollection) {
            listeners = new Set();
            listenerMap.set(eventType, listeners);
        }
        return listeners;
    };
    EventService.prototype.noRegisteredListenersExist = function () {
        return this.allSyncListeners.size === 0 && this.allAsyncListeners.size === 0 &&
            this.globalSyncListeners.size === 0 && this.globalAsyncListeners.size === 0;
    };
    EventService.prototype.addEventListener = function (eventType, listener, async) {
        if (async === void 0) { async = false; }
        this.getListeners(eventType, async, true).add(listener);
    };
    EventService.prototype.removeEventListener = function (eventType, listener, async) {
        if (async === void 0) { async = false; }
        var listeners = this.getListeners(eventType, async, false);
        if (!listeners) {
            return;
        }
        listeners.delete(listener);
        if (listeners.size === 0) {
            var listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
            listenerMap.delete(eventType);
        }
    };
    EventService.prototype.addGlobalListener = function (listener, async) {
        if (async === void 0) { async = false; }
        (async ? this.globalAsyncListeners : this.globalSyncListeners).add(listener);
    };
    EventService.prototype.removeGlobalListener = function (listener, async) {
        if (async === void 0) { async = false; }
        (async ? this.globalAsyncListeners : this.globalSyncListeners).delete(listener);
    };
    EventService.prototype.dispatchEvent = function (event) {
        this.dispatchToListeners(event, true);
        this.dispatchToListeners(event, false);
        this.firedEvents[event.type] = true;
    };
    EventService.prototype.dispatchEventOnce = function (event) {
        if (!this.firedEvents[event.type]) {
            this.dispatchEvent(event);
        }
    };
    EventService.prototype.dispatchToListeners = function (event, async) {
        var _this = this;
        var eventType = event.type;
        var processEventListeners = function (listeners) { return listeners.forEach(function (listener) {
            if (async) {
                _this.dispatchAsync(function () { return listener(event); });
            }
            else {
                listener(event);
            }
        }); };
        var listeners = this.getListeners(eventType, async, false);
        if (listeners) {
            processEventListeners(listeners);
        }
        var globalListeners = async ? this.globalAsyncListeners : this.globalSyncListeners;
        globalListeners.forEach(function (listener) {
            if (async) {
                _this.dispatchAsync(function () { return _this.frameworkOverrides.dispatchEvent(eventType, function () { return listener(eventType, event); }); });
            }
            else {
                _this.frameworkOverrides.dispatchEvent(eventType, function () { return listener(eventType, event); });
            }
        });
    };
    // this gets called inside the grid's thread, for each event that it
    // wants to set async. the grid then batches the events into one setTimeout()
    // because setTimeout() is an expensive operation. ideally we would have
    // each event in it's own setTimeout(), but we batch for performance.
    EventService.prototype.dispatchAsync = function (func) {
        // add to the queue for executing later in the next VM turn
        this.asyncFunctionsQueue.push(func);
        // check if timeout is already scheduled. the first time the grid calls
        // this within it's thread turn, this should be false, so it will schedule
        // the 'flush queue' method the first time it comes here. then the flag is
        // set to 'true' so it will know it's already scheduled for subsequent calls.
        if (!this.scheduled) {
            // if not scheduled, schedule one
            window.setTimeout(this.flushAsyncQueue.bind(this), 0);
            // mark that it is scheduled
            this.scheduled = true;
        }
    };
    // this happens in the next VM turn only, and empties the queue of events
    EventService.prototype.flushAsyncQueue = function () {
        this.scheduled = false;
        // we take a copy, because the event listener could be using
        // the grid, which would cause more events, which would be potentially
        // added to the queue, so safe to take a copy, the new events will
        // get executed in a later VM turn rather than risk updating the
        // queue as we are flushing it.
        var queueCopy = this.asyncFunctionsQueue.slice();
        this.asyncFunctionsQueue = [];
        // execute the queue
        queueCopy.forEach(function (func) { return func(); });
    };
    __decorate([
        __param(0, Qualifier('loggerFactory')),
        __param(1, Qualifier('gridOptionsWrapper')),
        __param(2, Qualifier('frameworkOverrides')),
        __param(3, Qualifier('globalEventListener'))
    ], EventService.prototype, "setBeans", null);
    EventService = __decorate([
        Bean('eventService')
    ], EventService);
    return EventService;
}());
export { EventService };
