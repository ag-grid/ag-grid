export interface TypedEvent {
    readonly type: string;
}

export interface SourceEvent<S> extends TypedEvent {
    readonly source: S;
}

export interface PropertyChangeEvent<S, V> extends SourceEvent<S> {
    readonly value: V;
    readonly oldValue: V;
}

export type SourceEventListener<S> = (event: SourceEvent<S>) => any;
export type PropertyChangeEventListener<S, V> = (event: PropertyChangeEvent<S, V>) => any;

export class Observable {
    static readonly privateKeyPrefix = '_';

    // Note that these maps can't be specified generically, so they are kept untyped.
    // Some methods in this class only need generics in their signatures, the generics inside the methods
    // are just for clarity. The generics in signatures allow for static type checking of user provided
    // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
    // of their inline lambdas.
    private allPropertyListeners = new Map(); // property name => property change listener => scopes
    private allEventListeners = new Map(); // event type => event listener => scopes

    addPropertyListener<K extends string & keyof this>(
        name: K,
        listener: PropertyChangeEventListener<this, this[K]>,
        scope: Object = this
    ): void {
        const allPropertyListeners = this.allPropertyListeners as Map<
            K,
            Map<PropertyChangeEventListener<this, this[K]>, Set<Object>>
        >;
        let propertyListeners = allPropertyListeners.get(name);

        if (!propertyListeners) {
            propertyListeners = new Map<PropertyChangeEventListener<this, this[K]>, Set<Object>>();
            allPropertyListeners.set(name, propertyListeners);
        }

        if (!propertyListeners.has(listener)) {
            const scopes = new Set<Object>();
            propertyListeners.set(listener, scopes);
        }
        const scopes = propertyListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    }

    removePropertyListener<K extends string & keyof this>(
        name: K,
        listener?: PropertyChangeEventListener<this, this[K]>,
        scope: Object = this
    ): void {
        const allPropertyListeners = this.allPropertyListeners as Map<
            K,
            Map<PropertyChangeEventListener<this, this[K]>, Set<Object>>
        >;
        let propertyListeners = allPropertyListeners.get(name);

        if (propertyListeners) {
            if (listener) {
                const scopes = propertyListeners.get(listener);
                if (scopes) {
                    scopes.delete(scope);
                    if (!scopes.size) {
                        propertyListeners.delete(listener);
                    }
                }
            } else {
                propertyListeners.clear();
            }
        }
    }

    protected notifyPropertyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]): void {
        const allPropertyListeners = this.allPropertyListeners as Map<
            K,
            Map<PropertyChangeEventListener<this, this[K]>, Set<Object>>
        >;
        const propertyListeners = allPropertyListeners.get(name);

        if (propertyListeners) {
            propertyListeners.forEach((scopes, listener) => {
                scopes.forEach((scope) => listener.call(scope, { type: name, source: this, value, oldValue }));
            });
        }
    }

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
    fireEvent<E extends TypedEvent>(event: Omit<E, 'source'>): void {
        const listeners = (this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<Object>>>).get(
            event.type
        );

        if (listeners) {
            // Use `Object.create` to preserve deprecation warnings
            const eventWithSource = Object.create(event, { source: { value: this, enumerable: true } });
            listeners.forEach((scopes, listener) => {
                scopes.forEach((scope) => listener.call(scope, eventWithSource));
            });
        }
    }
}
