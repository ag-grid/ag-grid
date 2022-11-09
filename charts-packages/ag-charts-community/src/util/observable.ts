export interface TypedEvent {
    readonly type: string;
}

export interface SourceEvent<S> extends TypedEvent {
    readonly source: S;
}

export type SourceEventListener<S> = (event: SourceEvent<S>) => any;

export class Observable {
    static readonly privateKeyPrefix = '_';

    // Note that these maps can't be specified generically, so they are kept untyped.
    // Some methods in this class only need generics in their signatures, the generics inside the methods
    // are just for clarity. The generics in signatures allow for static type checking of user provided
    // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
    // of their inline lambdas.
    private allEventListeners = new Map(); // event type => event listener => scopes

    addEventListener(type: string, listener: SourceEventListener<this>, scope: Object = this): void {
        const allEventListeners = this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<Object>>>;
        let eventListeners = allEventListeners.get(type);

        if (!eventListeners) {
            eventListeners = new Map<SourceEventListener<this>, Set<Object>>();
            allEventListeners.set(type, eventListeners);
        }

        if (!eventListeners.has(listener)) {
            const scopes = new Set<Object>();
            eventListeners.set(listener, scopes);
        }
        const scopes = eventListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    }

    removeEventListener(type: string, listener?: SourceEventListener<this>, scope: Object = this): void {
        const allEventListeners = this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<Object>>>;
        let eventListeners = allEventListeners.get(type);

        if (eventListeners) {
            if (listener) {
                const scopes = eventListeners.get(listener);
                if (scopes) {
                    scopes.delete(scope);
                    if (!scopes.size) {
                        eventListeners.delete(listener);
                    }
                }
            } else {
                eventListeners.clear();
            }
        }
    }

    clearEventListeners() {
        this.allEventListeners = new Map();
    }

    protected notifyEventListeners(types: string[]): void {
        const allEventListeners = this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<Object>>>;

        types.forEach((type) => {
            const listeners = allEventListeners.get(type);
            if (listeners) {
                listeners.forEach((scopes, listener) => {
                    scopes.forEach((scope) => listener.call(scope, { type, source: this }));
                });
            }
        });
    }

    // 'source' is added automatically and is always the object this method belongs to.
    protected fireEvent<E extends TypedEvent>(event: Omit<E, 'source'>): void {
        const listeners = (this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<Object>>>).get(
            event.type
        );

        if (listeners) {
            const eventWithSource = Object.assign(event, { source: this });
            listeners.forEach((scopes, listener) => {
                scopes.forEach((scope) => listener.call(scope, eventWithSource));
            });
        }
    }
}
