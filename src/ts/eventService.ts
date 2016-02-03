
import {Logger} from "./logger";
import {LoggerFactory} from "./logger";
import _ from './utils';

export default class EventService {

    private allListeners: {[key: string]: Function[]} = {};

    private globalListeners: Function[] = [];

    private logger: Logger;

    public init(loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('EventService');
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
        var listenerList = this.getListenerList(eventType);
        listenerList.forEach( (listener)=> {
            listener(event);
        });

        this.globalListeners.forEach( (listener)=> {
            listener(eventType, event);
        });
    }
}
