import { IEventEmitter } from "../interfaces/iEventEmitter";
import { EventService } from "../eventService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { Autowired, Context, PreDestroy } from "./context";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { Component } from "../widgets/component";
import { _ } from "../utils";
import { forEach } from '../utils/array';

export class BeanStub implements IEventEmitter {

    public static EVENT_DESTROYED = 'destroyed';

    protected localEventService: EventService;

    private destroyFunctions: (() => void)[] = [];
    private destroyed = false;

    @Autowired('frameworkOverrides') private frameworkOverrides: IFrameworkOverrides;

    @Autowired('context') protected context: Context;
    @Autowired('eventService') protected eventService: EventService;

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

    // CellComp and GridComp and override this because they get the FrameworkOverrides from the Beans bean
    protected getFrameworkOverrides(): IFrameworkOverrides {
        return this.frameworkOverrides;
    }

    public getContext = (): Context => this.context;

    @PreDestroy
    protected destroy(): void {

        // let prototype: any = Object.getPrototypeOf(this);
        // const constructor: any = prototype.constructor;
        // const constructorString = constructor.toString();
        // const beanName = constructorString.substring(9, constructorString.indexOf("("));

        this.destroyFunctions.forEach(func => func());
        this.destroyFunctions.length = 0;
        this.destroyed = true;

        this.dispatchEvent({ type: BeanStub.EVENT_DESTROYED });
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.localEventService) {
            this.localEventService = new EventService();
        }

        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    }

    public dispatchEventAsync(event: AgEvent): void {
        window.setTimeout(() => this.dispatchEvent(event), 0);
    }

    public dispatchEvent<T extends AgEvent>(event: T): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    }

    public addManagedListener(
        object: Window | HTMLElement | GridOptionsWrapper | IEventEmitter,
        event: string,
        listener: (event?: any) => void
    ): (() => null) | undefined {
        if (this.destroyed) {
            return;
        }

        if (object instanceof HTMLElement) {
            _.addSafePassiveEventListener(this.getFrameworkOverrides(), object as HTMLElement, event, listener);
        } else {
            object.addEventListener(event, listener);
        }

        const destroyFunc: () => null = () => {
            object.removeEventListener(event, listener);

            this.destroyFunctions = this.destroyFunctions.filter(fn => fn !== destroyFunc);

            return null;
        };

        this.destroyFunctions.push(destroyFunc);

        return destroyFunc;
    }

    public isAlive = (): boolean => !this.destroyed;

    public addDestroyFunc(func: () => void): void {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        } else {
            func();
        }
    }

    public createManagedBean<T>(bean: T, context?: Context): T {
        const res = this.createBean(bean, context);
        this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
        return res;
    }

    protected createBean<T>(bean: T, context?: Context, afterPreCreateCallback?: (comp: Component) => void): T {
        return (context || this.getContext()).createBean(bean, afterPreCreateCallback);
    }

    protected destroyBean<T>(bean: T, context?: Context): T {
        return (context || this.getContext()).destroyBean(bean);
    }

    protected destroyBeans<T>(beans: T[], context?: Context): T[] {
        if (beans) {
            forEach(beans, bean => this.destroyBean(bean, context));
        }

        return [];
    }
}
