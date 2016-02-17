
import {Logger} from "./logger";
import {LoggerFactory} from "./logger";
import _ from './utils';
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";

@Bean('eventService')
export default class EventService {

    private allListeners: {[key: string]: Function[]} = {};

    private globalListeners: Function[] = [];

    private logger: Logger;

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
        //this.logger.log('dispatching: ' + event);

        // this allows the columnController to get events before anyone else
        var p1ListenerList = this.getListenerList(eventType + '-P1');
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
