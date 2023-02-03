import { Listeners } from '../../util/listeners';

export abstract class BaseManager<EventTypes extends string = never, EventType extends { type: EventTypes }= never> {
    protected readonly listeners = new Listeners<EventTypes, (event: EventType) => void>();

    public addListener<T extends EventTypes, E extends EventType & { type: T }>(
        type: T,
        cb: (event: E) => void
    ): Symbol {
        return this.listeners.addListener(type, cb as any);
    }

    public removeListener(listenerSymbol: Symbol) {
        this.listeners.removeListener(listenerSymbol);
    }
}
