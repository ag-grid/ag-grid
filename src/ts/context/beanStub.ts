
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {EventService} from "../eventService";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class BeanStub implements IEventEmitter {

    private localEventService: EventService;

    private destroyFunctions: (()=>void)[] = [];

    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
        this.destroyFunctions.length = 0;
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

    public dispatchEventAsync(eventType: string, event?: any): void {
        setTimeout( ()=> this.dispatchEvent(eventType, event), 0);
    }

    public dispatchEvent(eventType: string, event?: any): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(eventType, event);
        }
    }

    public addDestroyableEventListener(eElement: HTMLElement|IEventEmitter|GridOptionsWrapper, event: string, listener: (event?: any)=>void): void {
        if (eElement instanceof HTMLElement) {
            (<HTMLElement>eElement).addEventListener(event, listener);
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

    public addDestroyFunc(func: ()=>void ): void {
        this.destroyFunctions.push(func);
    }

}
