
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {EventService} from "../eventService";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {_} from "../utils";
import {AgEvent} from "../events";

export class BeanStub implements IEventEmitter {

    public static EVENT_DESTORYED = 'destroyed';

    private localEventService: EventService;

    private destroyFunctions: (()=>void)[] = [];

    private destroyed = false;

    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
        this.destroyFunctions.length = 0;
        this.destroyed = true;

        this.dispatchEvent({type: BeanStub.EVENT_DESTORYED});
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
        setTimeout( ()=> this.dispatchEvent(event), 0);
    }

    public dispatchEvent(event: AgEvent): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    }

    public addDestroyableEventListener(eElement: HTMLElement|IEventEmitter|GridOptionsWrapper, event: string, listener: (event?: any)=>void): void {
        if (this.destroyed) { return; }

        if (eElement instanceof HTMLElement) {
            _.addSafePassiveEventListener((<HTMLElement>eElement), event, listener)
        } else if (eElement instanceof GridOptionsWrapper) {
            (<GridOptionsWrapper>eElement).addEventListener(event, listener);
        } else {
            (<IEventEmitter>eElement).addEventListener(event, listener);
        }

        this.destroyFunctions.push( ()=> {
            if (eElement instanceof HTMLElement) {
                (<HTMLElement>eElement).removeEventListener(event, listener);
            } else if (eElement instanceof GridOptionsWrapper) {
                (<GridOptionsWrapper>eElement).removeEventListener(event, listener);
            } else {
                (<IEventEmitter>eElement).removeEventListener(event, listener);
            }
        });
    }

    public isAlive(): boolean {
        return !this.destroyed;
    }

    public addDestroyFunc(func: ()=>void ): void {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        } else {
            func();
        }
    }

}
