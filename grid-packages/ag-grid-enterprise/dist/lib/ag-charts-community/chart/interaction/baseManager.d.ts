import { Listeners } from '../../util/listeners';
export declare abstract class BaseManager<EventType extends string = never, Event extends {
    type: any;
} = never, Meta = never> {
    protected readonly listeners: Listeners<EventType, (event: Event) => void, Meta>;
    addListener<T extends EventType>(type: T, handler: (event: Event & {
        type: T;
    }) => void, meta?: Meta): () => void;
    removeListener(listenerSymbol: symbol): void;
}
