
import {Logger} from "./logger";
import {LoggerFactory} from "./logger";
import {Utils as _} from './utils';
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {IEventEmitter} from "./interfaces/iEventEmitter";

@Bean('eventService')
export class EventService implements IEventEmitter {

    private allListeners: {[key: string]: Function[]} = {};

    private globalListeners: Function[] = [];

    private logger: Logger;

    private static PRIORITY = '-P1';

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory,
                  @Qualifier('globalEventListener') globalEventListener: Function = null) {
        this.logger = loggerFactory.create('EventService');

        if (globalEventListener) {
            this.addGlobalListener(globalEventListener);
        }
    }

    private getListenerList(eventType: string): Function[] {
        var listenerList = this.allListeners[eventType];
        if (!listenerList) {
            listenerList = [];
            this.allListeners[eventType] = listenerList;
        }
        return listenerList;
    }

    public addEventListener(eventType: string, listener: Function): void {
        var listenerList = this.getListenerList(eventType);
        if (listenerList.indexOf(listener)<0) {
            listenerList.push(listener);
        }
    }

    // for some events, it's important that the model gets to hear about them before the view,
    // as the model may need to update before the view works on the info. if you register
    // via this method, you get notified before the view parts
    public addModalPriorityEventListener(eventType: string, listener: Function): void {
        this.addEventListener(eventType + EventService.PRIORITY, listener);
    }

    public addGlobalListener(listener: Function): void {
        this.globalListeners.push(listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        var listenerList = this.getListenerList(eventType);
        _.removeFromArray(listenerList, listener);
    }

    public removeGlobalListener(listener: Function): void {
        _.removeFromArray(this.globalListeners, listener);
    }

    // why do we pass the type here? the type is in ColumnChangeEvent, so unless the
    // type is not in other types of events???
    public dispatchEvent(eventType: string, event?: any): void {
        if (!event) {
            event = {};
        }
        // console.log(`dispatching ${eventType}: ${event}`);

        // this allows the columnController to get events before anyone else
        var p1ListenerList = this.getListenerList(eventType + EventService.PRIORITY);
        p1ListenerList.forEach( (listener)=> {
            listener(event);
        });

        var listenerList = this.getListenerList(eventType);
        listenerList.forEach( (listener)=> {
            listener(event);
        });

        this.globalListeners.forEach( (listener)=> {
            listener(eventType, event);
        });
    }
}
