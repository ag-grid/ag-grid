import { Listeners } from '../../util/listeners';
export declare abstract class BaseManager<EventType extends string = never, Event extends {
    type: any;
} = never> {
    protected readonly listeners: Listeners<EventType, (event: Event) => void>;
    addListener<T extends EventType>(type: T, handler: (event: Event & {
        type: T;
    }) => void): () => void;
    removeListener(listenerSymbol: symbol): void;
    destroy(): void;
}
