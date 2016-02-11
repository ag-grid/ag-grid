import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import RowRenderer from "./rowRenderer";

/** this functionality should be in RenderedRow */

@Bean('virtualRowEventService')
export class VirtualRowEventService {

    public static VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';

    @Qualifier('rowRenderer') private rowRenderer: RowRenderer;

    private virtualRowListeners: { [key: string]: { [key: number]: Function[] } } = {
        virtualRowRemoved: {}
    };

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function): void {
        var listenersMap = this.virtualRowListeners[eventName];
        if (!listenersMap) {
            console.warn('ag-Grid: invalid listener type ' + eventName + ', expected values are ' + Object.keys(this.virtualRowListeners));
            return;
        }
        if (!listenersMap[rowIndex]) {
            listenersMap[rowIndex] = [];
        }
        listenersMap[rowIndex].push(callback);
    }

    public onVirtualRowRemoved(rowIndex: number) {
        // inform the callbacks of the event
        var listenersMap = this.virtualRowListeners[VirtualRowEventService.VIRTUAL_ROW_REMOVED];
        if (listenersMap[rowIndex]) {
            listenersMap[rowIndex].forEach(function (callback:any) {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
        this.removeVirtualCallbacksForRow(rowIndex);
    }

    private removeVirtualCallbacksForRow(rowIndex: number) {
        delete this.virtualRowListeners[VirtualRowEventService.VIRTUAL_ROW_REMOVED][rowIndex];
    }

}