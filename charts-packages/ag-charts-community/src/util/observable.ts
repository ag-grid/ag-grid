export interface TypedEvent {
    readonly type: string;
}

export type TypedEventListener = (event: TypedEvent) => any;

export class Observable {
    private allEventListeners = new Map<string, Set<TypedEventListener>>();

    addEventListener(type: string, listener: TypedEventListener): void {
        if (typeof listener !== 'function') {
            throw new Error('AG Charts - listener must be a Function');
        }

        const { allEventListeners } = this;
        let eventListeners = allEventListeners.get(type);

        if (!eventListeners) {
            eventListeners = new Set<TypedEventListener>();
            allEventListeners.set(type, eventListeners);
        }

        if (!eventListeners.has(listener)) {
            eventListeners.add(listener);
        }
    }

    removeEventListener(type: string, listener: TypedEventListener): void {
        const { allEventListeners } = this;
        const eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            return;
        }
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
            allEventListeners.delete(type);
        }
    }

    clearEventListeners() {
        this.allEventListeners.clear();
    }

    protected fireEvent<E extends TypedEvent>(event: E): void {
        const listeners = this.allEventListeners.get(event.type);
        listeners?.forEach((listener) => listener(event));
    }
}
