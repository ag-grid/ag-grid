var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { EventService } from "../eventService.mjs";
import { Autowired, PreDestroy } from "./context.mjs";
import { addSafePassiveEventListener } from "../utils/event.mjs";
export class BeanStub {
    constructor() {
        this.destroyFunctions = [];
        this.destroyed = false;
        // for vue 3 - prevents Vue from trying to make this (and obviously any sub classes) from being reactive
        // prevents vue from creating proxies for created objects and prevents identity related issues
        this.__v_skip = true;
        // this was a test constructor niall built, when active, it prints after 5 seconds all beans/components that are
        // not destroyed. to use, create a new grid, then api.destroy() before 5 seconds. then anything that gets printed
        // points to a bean or component that was not properly disposed of.
        // constructor() {
        //     setTimeout(()=> {
        //         if (this.isAlive()) {
        //             let prototype: any = Object.getPrototypeOf(this);
        //             const constructor: any = prototype.constructor;
        //             const constructorString = constructor.toString();
        //             const beanName = constructorString.substring(9, constructorString.indexOf("("));
        //             console.log('is alive ' + beanName);
        //         }
        //     }, 5000);
        // }
        // Enable multiple grid properties to be updated together by the user but only trigger shared logic once.
        // Closely related to logic in ComponentUtil.ts
        this.lastChangeSetIdLookup = {};
        this.propertyListenerId = 0;
        this.isAlive = () => !this.destroyed;
    }
    // CellComp and GridComp and override this because they get the FrameworkOverrides from the Beans bean
    getFrameworkOverrides() {
        return this.frameworkOverrides;
    }
    getContext() {
        return this.context;
    }
    destroy() {
        // let prototype: any = Object.getPrototypeOf(this);
        // const constructor: any = prototype.constructor;
        // const constructorString = constructor.toString();
        // const beanName = constructorString.substring(9, constructorString.indexOf("("));
        this.destroyFunctions.forEach(func => func());
        this.destroyFunctions.length = 0;
        this.destroyed = true;
        this.dispatchEvent({ type: BeanStub.EVENT_DESTROYED });
    }
    addEventListener(eventType, listener) {
        if (!this.localEventService) {
            this.localEventService = new EventService();
        }
        this.localEventService.addEventListener(eventType, listener);
    }
    removeEventListener(eventType, listener) {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    }
    dispatchEventAsync(event) {
        window.setTimeout(() => this.dispatchEvent(event), 0);
    }
    dispatchEvent(event) {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    }
    addManagedListener(object, event, listener) {
        if (this.destroyed) {
            return;
        }
        if (object instanceof HTMLElement) {
            addSafePassiveEventListener(this.getFrameworkOverrides(), object, event, listener);
        }
        else {
            object.addEventListener(event, listener);
        }
        const destroyFunc = () => {
            object.removeEventListener(event, listener);
            this.destroyFunctions = this.destroyFunctions.filter(fn => fn !== destroyFunc);
            return null;
        };
        this.destroyFunctions.push(destroyFunc);
        return destroyFunc;
    }
    setupGridOptionListener(event, listener) {
        this.gridOptionsService.addEventListener(event, listener);
        const destroyFunc = () => {
            this.gridOptionsService.removeEventListener(event, listener);
            this.destroyFunctions = this.destroyFunctions.filter((fn) => fn !== destroyFunc);
            return null;
        };
        this.destroyFunctions.push(destroyFunc);
    }
    /**
     * Setup a managed property listener for the given GridOption property.
     * @param event GridOption property to listen to changes for.
     * @param listener Listener to run when property value changes
     */
    addManagedPropertyListener(event, listener) {
        if (this.destroyed) {
            return;
        }
        this.setupGridOptionListener(event, listener);
    }
    /**
     * Setup managed property listeners for the given set of GridOption properties.
     * The listener will be run if any of the property changes but will only run once if
     * multiple of the properties change within the same framework lifecycle event.
     * Works on the basis that GridOptionsService updates all properties *before* any property change events are fired.
     * @param events Array of GridOption properties to listen for changes too.
     * @param listener Shared listener to run if any of the properties change
     */
    addManagedPropertyListeners(events, listener) {
        if (this.destroyed) {
            return;
        }
        // Ensure each set of events can run for the same changeSetId
        const eventsKey = events.join('-') + this.propertyListenerId++;
        const wrappedListener = (event) => {
            if (event.changeSet) {
                // ChangeSet is only set when the property change is part of a group of changes from ComponentUtils
                // Direct api calls should always be run as 
                if (event.changeSet && event.changeSet.id === this.lastChangeSetIdLookup[eventsKey]) {
                    // Already run the listener for this set of prop changes so don't run again
                    return;
                }
                this.lastChangeSetIdLookup[eventsKey] = event.changeSet.id;
            }
            // Don't expose the underlying event value changes to the group listener.
            const propertiesChangeEvent = {
                type: 'gridPropertyChanged',
                changeSet: event.changeSet,
            };
            listener(propertiesChangeEvent);
        };
        events.forEach((event) => this.setupGridOptionListener(event, wrappedListener));
    }
    addDestroyFunc(func) {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        }
        else {
            func();
        }
    }
    createManagedBean(bean, context) {
        const res = this.createBean(bean, context);
        this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
        return res;
    }
    createBean(bean, context, afterPreCreateCallback) {
        return (context || this.getContext()).createBean(bean, afterPreCreateCallback);
    }
    destroyBean(bean, context) {
        return (context || this.getContext()).destroyBean(bean);
    }
    destroyBeans(beans, context) {
        if (beans) {
            beans.forEach(bean => this.destroyBean(bean, context));
        }
        return [];
    }
}
BeanStub.EVENT_DESTROYED = 'destroyed';
__decorate([
    Autowired('frameworkOverrides')
], BeanStub.prototype, "frameworkOverrides", void 0);
__decorate([
    Autowired('context')
], BeanStub.prototype, "context", void 0);
__decorate([
    Autowired('eventService')
], BeanStub.prototype, "eventService", void 0);
__decorate([
    Autowired('gridOptionsService')
], BeanStub.prototype, "gridOptionsService", void 0);
__decorate([
    Autowired('localeService')
], BeanStub.prototype, "localeService", void 0);
__decorate([
    Autowired('environment')
], BeanStub.prototype, "environment", void 0);
__decorate([
    PreDestroy
], BeanStub.prototype, "destroy", null);
