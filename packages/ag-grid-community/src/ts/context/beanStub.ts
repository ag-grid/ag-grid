import { IEventEmitter } from "../interfaces/iEventEmitter";
import { EventService } from "../eventService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { AgEvent } from "../events";
import { _ } from "../utils";

export class BeanStub implements IEventEmitter {

    public static EVENT_DESTROYED = 'destroyed';

    private localEventService: EventService;

    private destroyFunctions: (() => void)[] = [];

    private destroyed = false;

    public destroy(): void {
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

    public addDestroyableEventListener(eElement: Window | HTMLElement | IEventEmitter | GridOptionsWrapper, event: string, listener: (event?: any) => void): void {
        if (this.destroyed) { return; }

        if (eElement instanceof HTMLElement) {
            _.addSafePassiveEventListener((eElement as HTMLElement), event, listener);
        } else if (eElement instanceof Window) {
            (eElement as Window).addEventListener(event, listener);
        } else if (eElement instanceof GridOptionsWrapper) {
            (eElement as GridOptionsWrapper).addEventListener(event, listener);
        } else {
            (eElement as IEventEmitter).addEventListener(event, listener);
        }

        this.destroyFunctions.push(() => {
            if (eElement instanceof HTMLElement) {
                (eElement as HTMLElement).removeEventListener(event, listener);
            } else if (eElement instanceof Window) {
                (eElement as Window).removeEventListener(event, listener);
            } else if (eElement instanceof GridOptionsWrapper) {
                (eElement as GridOptionsWrapper).removeEventListener(event, listener);
            } else {
                (eElement as IEventEmitter).removeEventListener(event, listener);
            }
        });
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
