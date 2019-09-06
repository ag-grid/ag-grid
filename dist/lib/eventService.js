/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var utils_1 = require("./utils");
var EventService = /** @class */ (function () {
    function EventService() {
        this.allSyncListeners = {};
        this.allAsyncListeners = {};
        this.globalSyncListeners = [];
        this.globalAsyncListeners = [];
        this.asyncFunctionsQueue = [];
        this.scheduled = false;
        this.firedEvents = {};
    }
    EventService_1 = EventService;
    // because this class is used both inside the context and outside the context, we do not
    // use autowired attributes, as that would be confusing, as sometimes the attributes
    // would be wired, and sometimes not.
    //
    // the global event servers used by ag-Grid is autowired by the context once, and this
    // setBeans method gets called once.
    //
    // the times when this class is used outside of the context (eg RowNode has an instance of this
    // class) then it is not a bean, and this setBeans method is not called.
    EventService.prototype.setBeans = function (loggerFactory, gridOptionsWrapper, globalEventListener) {
        if (globalEventListener === void 0) { globalEventListener = null; }
        this.logger = loggerFactory.create('EventService');
        if (globalEventListener) {
            var async = gridOptionsWrapper.useAsyncEvents();
            this.addGlobalListener(globalEventListener, async);
        }
    };
    EventService.prototype.getListenerList = function (eventType, async) {
        var listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        var listenerList = listenerMap[eventType];
        if (!listenerList) {
            listenerList = [];
            listenerMap[eventType] = listenerList;
        }
        return listenerList;
    };
    EventService.prototype.addEventListener = function (eventType, listener, async) {
        if (async === void 0) { async = false; }
        var listenerList = this.getListenerList(eventType, async);
        if (listenerList.indexOf(listener) < 0) {
            listenerList.push(listener);
        }
    };
    // for some events, it's important that the model gets to hear about them before the view,
    // as the model may need to update before the view works on the info. if you register
    // via this method, you get notified before the view parts
    EventService.prototype.addModalPriorityEventListener = function (eventType, listener, async) {
        if (async === void 0) { async = false; }
        this.addEventListener(eventType + EventService_1.PRIORITY, listener, async);
    };
    EventService.prototype.addGlobalListener = function (listener, async) {
        if (async === void 0) { async = false; }
        if (async) {
            this.globalAsyncListeners.push(listener);
        }
        else {
            this.globalSyncListeners.push(listener);
        }
    };
    EventService.prototype.removeEventListener = function (eventType, listener, async) {
        if (async === void 0) { async = false; }
        var listenerList = this.getListenerList(eventType, async);
        utils_1._.removeFromArray(listenerList, listener);
    };
    EventService.prototype.removeGlobalListener = function (listener, async) {
        if (async === void 0) { async = false; }
        if (async) {
            utils_1._.removeFromArray(this.globalAsyncListeners, listener);
        }
        else {
            utils_1._.removeFromArray(this.globalSyncListeners, listener);
        }
    };
    // why do we pass the type here? the type is in ColumnChangeEvent, so unless the
    // type is not in other types of events???
    EventService.prototype.dispatchEvent = function (event) {
        // console.log(`dispatching ${eventType}: ${event}`);
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
        var globalListeners = async ? this.globalAsyncListeners : this.globalSyncListeners;
        var eventType = event.type;
        // this allows the columnController to get events before anyone else
        var p1ListenerList = this.getListenerList(eventType + EventService_1.PRIORITY, async);
        utils_1._.forEachSnapshotFirst(p1ListenerList, function (listener) {
            if (async) {
                _this.dispatchAsync(function () { return listener(event); });
            }
            else {
                listener(event);
            }
        });
        var listenerList = this.getListenerList(eventType, async);
        utils_1._.forEachSnapshotFirst(listenerList, function (listener) {
            if (async) {
                _this.dispatchAsync(function () { return listener(event); });
            }
            else {
                listener(event);
            }
        });
        utils_1._.forEachSnapshotFirst(globalListeners, function (listener) {
            if (async) {
                _this.dispatchAsync(function () { return listener(eventType, event); });
            }
            else {
                listener(eventType, event);
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
    var EventService_1;
    // this is an old idea niall had, should really take it out, was to do with ordering who gets to process
    // events first, to give model and service objects preference over the view
    EventService.PRIORITY = '-P1';
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')),
        __param(1, context_2.Qualifier('gridOptionsWrapper')),
        __param(2, context_2.Qualifier('globalEventListener')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory,
            gridOptionsWrapper_1.GridOptionsWrapper,
            Function]),
        __metadata("design:returntype", void 0)
    ], EventService.prototype, "setBeans", null);
    EventService = EventService_1 = __decorate([
        context_1.Bean('eventService')
    ], EventService);
    return EventService;
}());
exports.EventService = EventService;
