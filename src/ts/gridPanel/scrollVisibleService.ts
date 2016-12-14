import {Bean} from "../context/context";
import {IEventEmitter} from "../interfaces/iEventEmitter";
import {EventService} from "../eventService";

@Bean('scrollVisibleService')
export class ScrollVisibleService implements IEventEmitter {

    private static EVENT_CHANGED = 'changed';

    private localEventService: EventService = new EventService();

    private bodyScrollVisible = false;
    private pinnedLeftScrollVisible = false;
    private pinnedRightScrollVisible = false;

    public addEventListener(key: string, listener: Function): void {
        this.localEventService.addEventListener(key, listener);
    }

    public removeEventListener(key: string, listener: Function): void {
        this.localEventService.removeEventListener(key, listener);
    }

    public setVisible(bodyScrollVisible: boolean, pinnedLeftScrollVisible: boolean, pinnedRightScrollVisible: boolean): void {

        let atLeastOneDifferent = this.bodyScrollVisible !== bodyScrollVisible
            || this.pinnedLeftScrollVisible !== pinnedLeftScrollVisible
            || this.pinnedRightScrollVisible !== pinnedRightScrollVisible;

        if (atLeastOneDifferent) {
            this.bodyScrollVisible = bodyScrollVisible;
            this.pinnedLeftScrollVisible = pinnedLeftScrollVisible;
            this.pinnedRightScrollVisible = pinnedRightScrollVisible;
        }
    }


}
