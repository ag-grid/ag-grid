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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const context_1 = require("./context/context");
let EventService = class EventService {
    constructor() {
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
    setBeans(loggerFactory, gridOptionsService, frameworkOverrides, globalEventListener = null) {
        this.frameworkOverrides = frameworkOverrides;
        this.gridOptionsService = gridOptionsService;
        if (globalEventListener) {
            const async = gridOptionsService.useAsyncEvents();
            this.addGlobalListener(globalEventListener, async);
        }
    }
    getListeners(eventType, async, autoCreateListenerCollection) {
        const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        let listeners = listenerMap.get(eventType);
        // Note: 'autoCreateListenerCollection' should only be 'true' if a listener is about to be added. For instance
        // getListeners() is also called during event dispatch even though no listeners are added. This measure protects
        // against 'memory bloat' as empty collections will prevent the RowNode's event service from being removed after
        // the RowComp is destroyed, see noRegisteredListenersExist() below.
        if (!listeners && autoCreateListenerCollection) {
            listeners = new Set();
            listenerMap.set(eventType, listeners);
        }
        return listeners;
    }
    noRegisteredListenersExist() {
        return this.allSyncListeners.size === 0 && this.allAsyncListeners.size === 0 &&
            this.globalSyncListeners.size === 0 && this.globalAsyncListeners.size === 0;
    }
    addEventListener(eventType, listener, async = false) {
        this.getListeners(eventType, async, true).add(listener);
    }
    removeEventListener(eventType, listener, async = false) {
        const listeners = this.getListeners(eventType, async, false);
        if (!listeners) {
            return;
        }
        listeners.delete(listener);
        if (listeners.size === 0) {
            const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
            listenerMap.delete(eventType);
        }
    }
    addGlobalListener(listener, async = false) {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).add(listener);
    }
    removeGlobalListener(listener, async = false) {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).delete(listener);
    }
    dispatchEvent(event) {
        let agEvent = event;
        if (this.gridOptionsService) {
            // Apply common properties to all dispatched events if this event service has had its beans set with gridOptionsService.
            // Note there are multiple instances of EventService that are used local to components which do not set gridOptionsService.
            const { api, columnApi, context } = this.gridOptionsService;
            agEvent.api = api;
            agEvent.columnApi = columnApi;
            agEvent.context = context;
        }
        this.dispatchToListeners(agEvent, true);
        this.dispatchToListeners(agEvent, false);
        this.firedEvents[agEvent.type] = true;
    }
    dispatchEventOnce(event) {
        if (!this.firedEvents[event.type]) {
            this.dispatchEvent(event);
        }
    }
    dispatchToListeners(event, async) {
        const eventType = event.type;
        if (async && 'event' in event) {
            const browserEvent = event.event;
            if (browserEvent instanceof Event) {
                // AG-7893 - Persist composedPath() so that its result can still be accessed by the user asynchronously.
                // Within an async event handler if they call composedPath() on the event it will always return an empty [].
                event.eventPath = browserEvent.composedPath();
            }
        }
        const processEventListeners = (listeners) => listeners.forEach(listener => {
            if (async) {
                this.dispatchAsync(() => listener(event));
            }
            else {
                listener(event);
            }
        });
        const listeners = this.getListeners(eventType, async, false);
        if (listeners) {
            processEventListeners(listeners);
        }
        const globalListeners = async ? this.globalAsyncListeners : this.globalSyncListeners;
        globalListeners.forEach(listener => {
            if (async) {
                this.dispatchAsync(() => this.frameworkOverrides.dispatchEvent(eventType, () => listener(eventType, event), true));
            }
            else {
                this.frameworkOverrides.dispatchEvent(eventType, () => listener(eventType, event), true);
            }
        });
    }
    // this gets called inside the grid's thread, for each event that it
    // wants to set async. the grid then batches the events into one setTimeout()
    // because setTimeout() is an expensive operation. ideally we would have
    // each event in it's own setTimeout(), but we batch for performance.
    dispatchAsync(func) {
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
    }
    // this happens in the next VM turn only, and empties the queue of events
    flushAsyncQueue() {
        this.scheduled = false;
        // we take a copy, because the event listener could be using
        // the grid, which would cause more events, which would be potentially
        // added to the queue, so safe to take a copy, the new events will
        // get executed in a later VM turn rather than risk updating the
        // queue as we are flushing it.
        const queueCopy = this.asyncFunctionsQueue.slice();
        this.asyncFunctionsQueue = [];
        // execute the queue
        queueCopy.forEach(func => func());
    }
};
__decorate([
    __param(0, context_1.Qualifier('loggerFactory')),
    __param(1, context_1.Qualifier('gridOptionsService')),
    __param(2, context_1.Qualifier('frameworkOverrides')),
    __param(3, context_1.Qualifier('globalEventListener'))
], EventService.prototype, "setBeans", null);
EventService = __decorate([
    context_1.Bean('eventService')
], EventService);
exports.EventService = EventService;
