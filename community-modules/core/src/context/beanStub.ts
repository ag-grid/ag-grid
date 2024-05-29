import type { EventService } from '../eventService';
import type { AgEvent, AgEventListener } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import type { IEventEmitter } from '../interfaces/iEventEmitter';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import { LocalEventService } from '../localEventService';
import type { LocaleService } from '../localeService';
import { _addSafePassiveEventListener } from '../utils/event';
import type { Bean } from './bean';
import type { BeanCollection, BeanName, Context } from './context';

export abstract class BeanStub implements Bean, IEventEmitter {
    public readonly beanName?: BeanName;
    public static EVENT_DESTROYED = 'destroyed';

    protected localEventService?: LocalEventService;

    private stubContext: Context; // not named context to allow children to use 'context' as a variable name
    private destroyFunctions: (() => void)[] = [];
    private destroyed = false;

    // for vue 3 - prevents Vue from trying to make this (and obviously any sub classes) from being reactive
    // prevents vue from creating proxies for created objects and prevents identity related issues
    public __v_skip = true;

    protected frameworkOverrides: IFrameworkOverrides;
    protected eventService: EventService;
    protected gos: GridOptionsService;
    protected localeService: LocaleService;
    protected gridId: string;

    public wireBeans(beans: BeanCollection): void {
        this.gridId = beans.context.getGridId();
        this.frameworkOverrides = beans.frameworkOverrides;
        this.stubContext = beans.context;
        this.eventService = beans.eventService;
        this.gos = beans.gos;
        this.localeService = beans.localeService;
    }

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

    public destroy(): void {
        for (let i = 0; i < this.destroyFunctions.length; i++) {
            this.destroyFunctions[i]();
        }
        this.destroyFunctions.length = 0;
        this.destroyed = true;

        this.dispatchEvent({ type: BeanStub.EVENT_DESTROYED });
    }

    public addEventListener(eventType: string, listener: AgEventListener): void {
        if (!this.localEventService) {
            this.localEventService = new LocalEventService();
        }

        this.localEventService!.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: AgEventListener): void {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    }

    public dispatchEvent<T extends AgEvent>(event: T): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    }

    public addManagedListener(
        object: Window | HTMLElement | IEventEmitter,
        event: string,
        listener: (event?: any) => void
    ): (() => null) | undefined {
        if (this.destroyed) {
            return;
        }

        if (object instanceof HTMLElement) {
            _addSafePassiveEventListener(this.getFrameworkOverrides(), object, event, listener);
        } else {
            object.addEventListener(event, listener);
        }

        const destroyFunc: () => null = () => {
            (object as any).removeEventListener(event, listener);
            return null;
        };

        this.destroyFunctions.push(destroyFunc);

        return () => {
            destroyFunc();
            // Only remove if manually called before bean is destroyed
            this.destroyFunctions = this.destroyFunctions.filter((fn) => fn !== destroyFunc);
            return null;
        };
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

    public createManagedBean<T extends Bean | null | undefined>(bean: T, context?: Context): T {
        const res = this.createBean(bean, context);
        this.addDestroyFunc(this.destroyBean.bind(this, bean, context));
        return res;
    }

    protected createBean<T extends Bean | null | undefined>(
        bean: T,
        context?: Context | null,
        afterPreCreateCallback?: (bean: Bean) => void
    ): T {
        return (context || this.stubContext).createBean(bean, afterPreCreateCallback);
    }

    /**
     * Destroys a bean and returns undefined to support destruction and clean up in a single line.
     * this.dateComp = this.context.destroyBean(this.dateComp);
     */
    protected destroyBean<T extends Bean | null | undefined>(bean: T, context?: Context): undefined {
        return (context || this.stubContext).destroyBean(bean);
    }

    /**
     * Destroys an array of beans and returns an empty array to support destruction and clean up in a single line.
     * this.dateComps = this.context.destroyBeans(this.dateComps);
     */
    protected destroyBeans<T extends Bean | null | undefined>(beans: T[], context?: Context): T[] {
        return (context || this.stubContext).destroyBeans(beans);
    }
}
