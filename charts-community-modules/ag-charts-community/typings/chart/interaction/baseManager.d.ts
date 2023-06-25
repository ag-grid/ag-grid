import { Listeners } from '../../util/listeners';
export declare abstract class BaseManager<EventTypes extends string = never, EventType extends {
    type: EventTypes;
} = never> {
    protected readonly listeners: Listeners<EventTypes, (event: EventType) => void>;
    addListener<T extends EventTypes, E extends EventType & {
        type: T;
    }>(type: T, cb: (event: E) => void): Symbol;
    removeListener(listenerSymbol: Symbol): void;
}
