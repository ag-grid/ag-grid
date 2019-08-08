import { IEventEmitter } from "../interfaces/iEventEmitter";
import { EventService } from "../eventService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { Autowired, Context, PreDestroy } from "./context";
import { _ } from "../utils";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";

export class BeanStub implements IEventEmitter {

    public static EVENT_DESTROYED = 'destroyed';

    protected localEventService: EventService;

    private destroyFunctions: (() => void)[] = [];

    private destroyed = false;

    @Autowired('context') private context: Context;
    @Autowired('frameworkOverrides') private frameworkOverrides: IFrameworkOverrides;

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

    public getContext(): Context {
        return this.context;
    }

    @PreDestroy
    public destroy(): void {

        // let prototype: any = Object.getPrototypeOf(this);
        // const constructor: any = prototype.constructor;
        // const constructorString = constructor.toString();
        // const beanName = constructorString.substring(9, constructorString.indexOf("("));

        this.destroyFunctions.forEach(func => func());
        this.destroyFunctions.length = 0;
        this.destroyed = true;

        this.dispatchEvent({type: BeanStub.EVENT_DESTROYED});
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

    public addDestroyableEventListener(
        eElement: Window | HTMLElement | IEventEmitter | GridOptionsWrapper,
        event: string, listener: (event?: any) => void
    ): (() => void) | undefined {
        if (this.destroyed) { return; }

        if (eElement instanceof HTMLElement) {
            _.addSafePassiveEventListener(this.getFrameworkOverrides(), (eElement as HTMLElement), event, listener);
        } else if (eElement instanceof Window) {
            (eElement as Window).addEventListener(event, listener);
        } else if (eElement instanceof GridOptionsWrapper) {
            (eElement as GridOptionsWrapper).addEventListener(event, listener);
        } else {
            (eElement as IEventEmitter).addEventListener(event, listener);
        }

        const destroyFunc = () => {
            if (eElement instanceof HTMLElement) {
                (eElement as HTMLElement).removeEventListener(event, listener);
            } else if (eElement instanceof Window) {
                (eElement as Window).removeEventListener(event, listener);
            } else if (eElement instanceof GridOptionsWrapper) {
                (eElement as GridOptionsWrapper).removeEventListener(event, listener);
            } else {
                (eElement as IEventEmitter).removeEventListener(event, listener);
            }

            this.destroyFunctions = this.destroyFunctions.filter((fn: Function) => fn !== destroyFunc);
        };

        this.destroyFunctions.push(destroyFunc);

        return destroyFunc;
    }

    public isAlive(): boolean {
        return !this.destroyed;
    }

    public addDestroyFunc(func: () => void): void {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        } else {
            func();
        }
    }

}
