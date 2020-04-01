export interface TypedEvent {
    type: string;
}

export interface BrowserEvent extends TypedEvent {
    event: Event; // Native DOM event, defined in 'lib.dom.d.ts'
}

export interface PropertyChangeEvent<S, V> extends TypedEvent {
    source: S;
    value: V;
    oldValue: V;
}

export type TypedEventListener = (event: TypedEvent) => any;
export type PropertyChangeEventListener<S, V> = (event: PropertyChangeEvent<S, V>) => any;

export class Observable {
    static readonly privateKeyPrefix = '_';

    // Note that these maps can't be specified generically, so they are kept untyped.
    // Some methods in this class only need generics in their signatures, the generics inside the methods
    // are just for clarity. The generics in signatures allow for static type checking of user provided
    // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
    // of their inline declared lambdas.
    private allPropertyListeners = new Map(); // property name => property change listeners
    private allEventListeners = new Map();    // event type => event listeners

    addPropertyListener<K extends string & keyof this>(name: K, listener: PropertyChangeEventListener<this, this[K]>) {
        const allPropertyListeners = this.allPropertyListeners as Map<K, Set<PropertyChangeEventListener<this, this[K]>>>;
        let propertyListeners = allPropertyListeners.get(name);

        if (!propertyListeners) {
            propertyListeners = new Set<PropertyChangeEventListener<this, this[K]>>();
            allPropertyListeners.set(name, propertyListeners);
        }

        if (!propertyListeners.has(listener)) {
            propertyListeners.add(listener);
            return listener;
        } else {
            console.warn('Listener ', listener, ' already added to ', this);
        }
    }

    removePropertyListener<K extends string & keyof this>(name: K, listener: PropertyChangeEventListener<this, this[K]>) {
        const allPropertyListeners = this.allPropertyListeners as Map<K, Set<PropertyChangeEventListener<this, this[K]>>>;
        let propertyListeners = allPropertyListeners.get(name);

        if (propertyListeners) {
            if (listener) {
                propertyListeners.delete(listener);
            } else {
                propertyListeners.clear();
            }
        }
    }

    protected notifyPropertyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]) {
        const allPropertyListeners = this.allPropertyListeners as Map<K, Set<PropertyChangeEventListener<this, this[K]>>>;
        const propertyListeners = allPropertyListeners.get(name);

        if (propertyListeners) {
            propertyListeners.forEach(listener => {
                listener({
                    type: name,
                    source: this,
                    value,
                    oldValue
                });
            });
        }
    }

    addEventListener(type: string, listener: TypedEventListener) {
        const allEventListeners = this.allEventListeners as Map<string, Set<TypedEventListener>>;
        let eventListeners = allEventListeners.get(type);

        if (!eventListeners) {
            eventListeners = new Set<TypedEventListener>();
            allEventListeners.set(type, eventListeners);
        }

        if (!eventListeners.has(listener)) {
            eventListeners.add(listener);
            return listener;
        } else {
            console.warn('Category listener ', listener, ' already added to ', this);
        }
    }

    removeEventListener(type: string, listener: TypedEventListener) {
        const allEventListeners = this.allEventListeners as Map<string, Set<TypedEventListener>>;
        let eventListeners = allEventListeners.get(type);

        if (eventListeners) {
            if (listener) {
                eventListeners.delete(listener);
            } else {
                eventListeners.clear();
            }
        }
    }

    protected notifyEventListeners(types: string[]) {
        const allEventListeners = this.allEventListeners as Map<string, Set<TypedEventListener>>;

        types.forEach(type => {
            const listeners = allEventListeners.get(type);
            if (listeners) {
                listeners.forEach(listener => listener({type}));
            }
        });
    }

    fireEvent<E extends TypedEvent>(event: E) {
        const eventListeners = (this.allEventListeners as Map<string, Set<TypedEventListener>>).get(event.type);

        if (eventListeners) {
            eventListeners.forEach(listener => listener(event));
        }
    }
}

export function reactive(...events: string[]) {
    return function (target: any, key: string) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = Observable.privateKeyPrefix + key;
        const privateKeyEvents = privateKey + 'Events';

        if (!target[key]) {
            if (events) {
                target[privateKeyEvents] = events;
            }
            Object.defineProperty(target, key, {
                set: function (value: any) {
                    let oldValue: any;

                    oldValue = this[privateKey];

                    if (oldValue !== value || (typeof value === 'object' && value !== null)) {
                        this[privateKey] = value;
                        this.notifyPropertyListeners(key, oldValue, value);
                        const events = this[privateKeyEvents];
                        if (events) {
                            this.notifyEventListeners(events);
                        }
                    }
                },
                get: function (): any {
                    let value: any;
                    value = this[privateKey];
                    return value;
                },
                enumerable: true,
                configurable: true
            });
        }
    }
}
